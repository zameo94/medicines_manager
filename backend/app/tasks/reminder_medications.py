from app.core.utils import get_today_medication_schedules, get_medication_logs_map, get_notifications_map, save_notification
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
    schedule=[{"cron": "*/1 * * * *"}] # Every minute
)

async def notify_medications():
    with Session(engine) as session:
        current_time = datetime.now().time()
        today = date.today()
        medication_schedules = get_today_medication_schedules(current_time, session, today, "NEXT", 15)
        
        if not medication_schedules:
            return
        
        schedule_ids = [schedule.id for schedule in medication_schedules]
        medication_logs_map = get_medication_logs_map(schedule_ids, today, session)
        notifications_map = get_notifications_map(schedule_ids, today, session, NotificationType.NOTIFY)

        for medication_schedule in medication_schedules:
            medication_log = medication_logs_map.get(medication_schedule.id)
            notification = notifications_map.get(medication_schedule.id)

            if not medication_log and not notification:
                try:
                    medicine_name = medication_schedule.medicine.name
                    time_str = medication_schedule.scheduled_time.strftime("%H:%M")
                    message = f"Ricorda di prendere {medicine_name} tra 15 minuti (ore {time_str})"

                    await TelegramService.send_message(message)
                    save_notification(medication_schedule.id, message, today, session, NotificationType.NOTIFY)
                except Exception as e:
                    print(f"Error sending reminder for schedule {medication_schedule.id}: {e}")
