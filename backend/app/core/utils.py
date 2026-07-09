import calendar
from datetime import datetime, date, time, timedelta
from sqlmodel import select, Session
from sqlalchemy.orm import joinedload
from app.services.telegram import TelegramService
from app.models.medication_schedule import MedicationSchedule
from app.models.medicine import Medicine
from app.models.medication_log import MedicationLog
from app.models.notification import Notification
from app.schemas.notification import NotificationType

def get_today_medication_schedules(
        current_time: time,
        session: Session,
        today: date,
        medication_schedules_type: str,
        next_minutes: int | None = None
    ):
    match medication_schedules_type:
        case "PASSED":
            db_schedules = get_passed_medication_schedules(current_time, session)
        case "NEXT":
            if next_minutes is None:
                raise ValueError("next_minutes is required for NEXT type schedules")
            db_schedules = get_next_medication_schedules(current_time, session, next_minutes)
        case _:
            return

    schedules = []
    for schedule in db_schedules:
        if is_scheduled_for_today(schedule, today):
            schedules.append(schedule)
    return schedules

def get_passed_medication_schedules(current_time: time, session: Session):
    current_dt = datetime.combine(date.today(), current_time)
    limit_dt = current_dt - timedelta(hours=3)
    
    if limit_dt.date() < date.today():
        limit_time = time(0, 0)
    else:
        limit_time = limit_dt.time()

    return session.exec(
        select(MedicationSchedule)
        .options(joinedload(MedicationSchedule.medicine))
        .where(
            MedicationSchedule.scheduled_time < current_time,
            MedicationSchedule.scheduled_time >= limit_time
        )
        .order_by(MedicationSchedule.scheduled_time)
    ).all()

def get_next_medication_schedules(current_time: time, session: Session, next_minutes: int):
    normalized_current_time = current_time.replace(second=0, microsecond=0)
    dummy_date = datetime.combine(datetime.today(), normalized_current_time)
    next_minutes_datetime = dummy_date + timedelta(minutes=next_minutes)
    next_minutes_time = next_minutes_datetime.time()

    return session.exec(
        select(MedicationSchedule)
        .options(joinedload(MedicationSchedule.medicine))
        .where(MedicationSchedule.scheduled_time == next_minutes_time)
        .order_by(MedicationSchedule.scheduled_time)
    ).all()


def get_medication_logs_map(schedule_ids : list[int], today: date, session: Session):
    statement = select(MedicationLog).where(
        MedicationLog.schedule_id.in_(schedule_ids),
        MedicationLog.reference_date == today,
        MedicationLog.is_taken == True
    )
    logs = session.exec(statement).all()
    return {log.schedule_id: log for log in logs}

def get_notifications_map(schedule_ids: list[int], today: date, session: Session, notification_type: NotificationType):
    statement = select(Notification).where(
        Notification.reference_date == today,
        Notification.scheduled_id.in_(schedule_ids),
        Notification.type == notification_type
    )
    notifications = session.exec(statement).all()
    return {notification.scheduled_id: notification for notification in notifications}

def save_notification(medication_schedule_id : int, message: str, today: date, session: Session, notification_type: NotificationType):
    try:
        notification = Notification.model_validate(
            {
                "scheduled_id": medication_schedule_id,
                "message": message,
                "type": notification_type,
                "reference_date": today
            }
        )
        session.add(notification)
        session.commit()
        session.refresh(notification)
    except Exception as e:
        session.rollback()
        raise Exception(f"Error while saving notification: {e}")


def is_scheduled_for_today(schedule: MedicationSchedule, today: date) -> bool:
    if today < schedule.start_date:
        return False
    
    if schedule.end_date and today > schedule.end_date:
        return False

    if schedule.frequency == 'DAILY':
        return check_daily(schedule, today)

    if schedule.frequency == 'WEEKLY':
        return check_weekly(schedule, today)

    if schedule.frequency == 'MONTHLY':
        return check_monthly(schedule, today)

    return True

def check_daily(schedule: MedicationSchedule, today: date) -> bool:
    delta = (today - schedule.start_date).days
    return delta % schedule.interval == 0

def check_weekly(schedule: MedicationSchedule, today: date) -> bool:
    if schedule.days_of_week is None:
        return False
        
    if today.weekday() not in schedule.days_of_week:
        return False
        
    weeks_delta = (today - schedule.start_date).days // 7
    return weeks_delta % schedule.interval == 0

def check_monthly(schedule: MedicationSchedule, today: date) -> bool:
    if schedule.day_of_month is None:
        return False
        
    _, _month_last_day = calendar.monthrange(today.year, today.month)
    day_of_month = schedule.day_of_month

    if day_of_month > _month_last_day:
        day_of_month = _month_last_day

    if today.day != day_of_month:
        return False
        
    months_delta = (today.year - schedule.start_date.year) * 12 + (today.month - schedule.start_date.month)
    return months_delta % schedule.interval == 0
