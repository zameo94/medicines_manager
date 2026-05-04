import pytest
from datetime import time, date
from pydantic import ValidationError
from app.schemas.medication_schedule import MedicationScheduleCreate

def test_validate_days_of_week():
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='WEEKLY',
        days_of_week=[0, 6],
        start_date=date(2026, 5, 4)
    )
    
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            frequency='WEEKLY',
            days_of_week=[7],
            start_date=date(2026, 5, 4)
        )
    assert 'I giorni della settimana devono essere tra 0 (Lunedì) e 6 (Domenica)' in str(excinfo.value)

def test_validate_day_of_month():
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='MONTHLY',
        day_of_month=15,
        start_date=date(2026, 5, 15)
    )
    
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            frequency='MONTHLY',
            day_of_month=32,
            start_date=date(2026, 5, 15)
        )
    assert 'Il giorno del mese deve essere tra 1 e 31' in str(excinfo.value)

def test_validate_interval():
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            interval=0
        )
    assert 'Intervallo deve essere un numero positivo' in str(excinfo.value)

def test_validate_frequency():
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            frequency='YEARLY'
        )
    assert 'Frequenza non valida' in str(excinfo.value)

def test_validate_start_date_alignment_monthly():
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='MONTHLY',
        day_of_month=15,
        start_date=date(2026, 5, 15)
    )
    
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            frequency='MONTHLY',
            day_of_month=15,
            start_date=date(2026, 5, 16)
        )
    assert 'La data di inizio deve coincidere con il giorno del mese scelto' in str(excinfo.value)

def test_validate_start_date_alignment_weekly():
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='WEEKLY',
        days_of_week=[0, 2],
        start_date=date(2026, 5, 4)
    )
    
    with pytest.raises(ValidationError) as excinfo:
        MedicationScheduleCreate(
            scheduled_time=time(8, 0),
            medicine_id=1,
            frequency='WEEKLY',
            days_of_week=[0, 2],
            start_date=date(2026, 5, 5)
        )
    assert 'La data di inizio deve coincidere con uno dei giorni della settimana scelti' in str(excinfo.value)

def test_validate_start_date_alignment_monthly_31st():
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='MONTHLY',
        day_of_month=31,
        start_date=date(2026, 4, 30)
    )
    
    MedicationScheduleCreate(
        scheduled_time=time(8, 0),
        medicine_id=1,
        frequency='MONTHLY',
        day_of_month=31,
        start_date=date(2026, 2, 28)
    )
