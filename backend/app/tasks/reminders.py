from datetime import datetime, date, time
from sqlmodel import select, Session

from app.core.tkq import broker
from app.database import engine
from app.services.telegram import TelegramService
from app.models.medication_schedule import MedicationSchedule
from app.models.medication_log import MedicationLog
from app.models.notification import Notification
from app.models.medicine import Medicine

@broker.task(
    retries=3, 
    retry_delay=120, 
    retry_backoff=True,
    schedule=[{"cron": "*/15 * * * *"}] # Every 15 minutes
)
async def check_missed_medications():
    with Session(engine) as session:
        current_time = datetime.now().time()
        today = date.today()
        medication_schedules = get_medication_schedules(current_time, session)

        for medication_schedule in medication_schedules:
            medication_log = get_medication_log(medication_schedule.id, today, session)

            notification = get_notification(medication_schedule.id, today, session)
            
            if not medication_log and not notification:
                medicine_name = medication_schedule.medicine.name
                message = f"Dose saltata: {medicine_name} delle {medication_schedule.scheduled_time}"
                await TelegramService.send_message(message)
                save_notification(medication_schedule.id, message, today, session)

def get_medication_schedules(current_time: time, session: Session):
    return session.exec(
        select(MedicationSchedule)
        .where(MedicationSchedule.scheduled_time < current_time)
        .order_by(MedicationSchedule.scheduled_time)
    ).all()

def get_medication_log(medication_schedule_id : int, today: date, session: Session):
    return session.exec(select(MedicationLog).where(
            MedicationLog.schedule_id == medication_schedule_id,
            MedicationLog.reference_date == today,
            MedicationLog.is_taken == True
        )
    ).first()

def get_notification(medication_schedule_id : int, today: date, session: Session):
    return session.exec(select(Notification).where(
        Notification.reference_date == today,
        Notification.scheduled_id == medication_schedule_id,
    )).first()

def save_notification(medication_schedule_id : int, message: str, today: date, session: Session):
    try:
        notification = Notification.model_validate(
            {
                "scheduled_id": medication_schedule_id,
                "message": message,
                "type": "MISSED",
                "reference_date": today
            }
        )
        session.add(notification)
        session.commit()
        session.refresh(notification)
    except Exception as e:
        session.rollback()
        raise Exception(f"Error while saving notification: {e}")
