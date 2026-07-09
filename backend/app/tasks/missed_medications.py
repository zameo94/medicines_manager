import os
from app.core.utils import get_today_medication_schedules, get_medication_logs_map, save_notification
from app.core.tkq import broker
from app.database import engine
from sqlmodel import Session
from datetime import datetime, date
from app.services.telegram import TelegramService
from app.schemas.notification import NotificationType

@broker.task(
    retries=3,
    retry_delay=120,
    retry_backoff=True,
    schedule=[{"cron": "*/30 * * * *"}] # Every 30 minutes
)

async def check_missed_medications():
    with Session(engine) as session:
        current_time = datetime.now().time()
        today = date.today()
        medication_schedules = get_today_medication_schedules(current_time, session, today, "PASSED")

        if not medication_schedules:
            return

        schedule_ids = [schedule.id for schedule in medication_schedules]
        medication_logs_map = get_medication_logs_map(schedule_ids, today, session)
        missed_medications = {}

        for medication_schedule in medication_schedules:
            medication_log = medication_logs_map.get(medication_schedule.id)

            if not medication_log:
                medicine_name = medication_schedule.medicine.name
                time_str = medication_schedule.scheduled_time.strftime("%H:%M")
                missed_medications[medication_schedule.id] = f"• {medicine_name} delle {time_str}"

        if missed_medications:
                try:
                    frontend_url = os.getenv("FRONTEND_MEDICATION_LOGS_MAIN_URL", "")
                    frontend_url = frontend_url.rstrip("/")

                    message = "⚠️ *Dosi saltate:*\n"
                    message += "\n".join(missed_medications.values())
                    message += f"\n\n[Apri il Manager per segnare come prese]({frontend_url}/)"

                    await TelegramService.send_message(message, parse_mode="Markdown")

                    for medication_schedule_id, single_message in missed_medications.items():
                        save_notification(medication_schedule_id, single_message, today, session, NotificationType.MISSED)
                except Exception as e:
                    print(f"Error sending missed notification: {e}")
