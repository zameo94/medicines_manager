import pytest
from datetime import date
from app.models.medication_schedule import MedicationSchedule
from app.core.utils import is_scheduled_for_today

def test_daily_schedule_every_day():
    start_date = date(2026, 5, 1)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='DAILY',
        interval=1,
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 1)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 2)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 10)) is True
    assert is_scheduled_for_today(schedule, date(2026, 4, 30)) is False

def test_daily_schedule_every_2_days():
    start_date = date(2026, 5, 1)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='DAILY',
        interval=2,
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 1)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 2)) is False
    assert is_scheduled_for_today(schedule, date(2026, 5, 3)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 4)) is False

def test_weekly_schedule_every_monday():
    start_date = date(2026, 5, 4)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='WEEKLY',
        interval=1,
        days_of_week=[0],
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 4)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 5)) is False
    assert is_scheduled_for_today(schedule, date(2026, 5, 11)) is True

def test_weekly_schedule_mon_wed_fri():
    start_date = date(2026, 5, 4)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='WEEKLY',
        interval=1,
        days_of_week=[0, 2, 4],
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 4)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 5)) is False
    assert is_scheduled_for_today(schedule, date(2026, 5, 6)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 7)) is False
    assert is_scheduled_for_today(schedule, date(2026, 5, 8)) is True

def test_weekly_schedule_every_2_weeks():
    start_date = date(2026, 5, 4)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='WEEKLY',
        interval=2,
        days_of_week=[0],
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 4)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 11)) is False
    assert is_scheduled_for_today(schedule, date(2026, 5, 18)) is True

def test_monthly_schedule_15th():
    start_date = date(2026, 5, 15)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='MONTHLY',
        interval=1,
        day_of_month=15,
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 15)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 16)) is False
    assert is_scheduled_for_today(schedule, date(2026, 6, 15)) is True

def test_monthly_schedule_every_3_months():
    start_date = date(2026, 5, 15)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='MONTHLY',
        interval=3,
        day_of_month=15,
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 5, 15)) is True
    assert is_scheduled_for_today(schedule, date(2026, 6, 15)) is False
    assert is_scheduled_for_today(schedule, date(2026, 7, 15)) is False
    assert is_scheduled_for_today(schedule, date(2026, 8, 15)) is True

def test_monthly_schedule_last_day_overflow():
    start_date = date(2026, 3, 31)
    schedule = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='MONTHLY',
        interval=1,
        day_of_month=31,
        start_date=start_date
    )
    
    assert is_scheduled_for_today(schedule, date(2026, 3, 31)) is True
    assert is_scheduled_for_today(schedule, date(2026, 4, 30)) is True
    assert is_scheduled_for_today(schedule, date(2026, 5, 31)) is True
    assert is_scheduled_for_today(schedule, date(2026, 2, 28)) is False
    
    start_date_leap = date(2024, 1, 31)
    schedule_leap = MedicationSchedule(
        scheduled_time="08:00:00",
        medicine_id=1,
        frequency='MONTHLY',
        interval=1,
        day_of_month=31,
        start_date=start_date_leap
    )
    assert is_scheduled_for_today(schedule_leap, date(2024, 2, 29)) is True
