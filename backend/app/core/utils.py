import calendar
from datetime import date
from app.models.medication_schedule import MedicationSchedule

def is_scheduled_for_today(schedule: MedicationSchedule, today: date) -> bool:
    if today < schedule.start_date:
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
