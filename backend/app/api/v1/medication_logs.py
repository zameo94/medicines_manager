from typing import List, Optional
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, and_
from app.database import get_session
from app.models.medication_log import MedicationLog
from app.schemas.medication_log import (
    MedicationLogCreate, 
    MedicationLogUpdate, 
    MedicationLogRead, 
    MedicationDashboard
)
from app.models.medication_schedule import MedicationSchedule

router = APIRouter()

def get_effective_date() -> date:
    now = datetime.now()
    return now.date()

@router.get("/", response_model=MedicationDashboard)
def main_medication_logs(session: Session = Depends(get_session)):
    ref_date = get_effective_date()
    schedules = session.exec(select(MedicationSchedule).order_by(MedicationSchedule.scheduled_time)).all()
    logs = session.exec(
        select(MedicationLog).where(MedicationLog.reference_date == ref_date)
    ).all()
    logs_map = {log.schedule_id: log for log in logs}
    schedules_with_logs = []

    time_now = datetime.now().time().replace(microsecond=0)
    
    for schedule in schedules:
        schedule_data = schedule.model_dump()
        schedule_data["medicine"] = schedule.medicine
        schedule_data["current_log"] = logs_map.get(schedule.id)
        schedule_data["is_late"] = schedule.scheduled_time < time_now

        schedules_with_logs.append(schedule_data)
    
    return {
        "reference_date": ref_date,
        "schedules": schedules_with_logs
    }

@router.get("/index")
def index_medication_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    days: int = 7,
    session: Session = Depends(get_session)
):
    ref_date_today = get_effective_date()

    if not end_date:
        end_date = ref_date_today
    if not start_date:
        start_date = end_date - timedelta(days=days-1)

    schedules = session.exec(select(MedicationSchedule)).all()
    full_history = []
    delta = end_date - start_date

    for i in range(delta.days + 1):
        target_date = end_date - timedelta(days=i)
        if target_date < start_date:
            break

        logs = session.exec(
            select(MedicationLog).where(MedicationLog.reference_date == target_date)
        ).all()
        logs_map = {log.schedule_id: log for log in logs}

        for s in schedules:
            full_history.append({
                "reference_date": target_date,
                "schedule": {
                    "id": s.id,
                    "scheduled_time": s.scheduled_time,
                    "medicine": s.medicine
                },
                "log": logs_map.get(s.id),
                "is_today": target_date == ref_date_today,
                "is_future": target_date > ref_date_today,
            })

    return full_history

@router.post("/", response_model=MedicationLog, status_code=status.HTTP_201_CREATED)
def create_medication_log(medication_log_data: MedicationLogCreate, session: Session = Depends(get_session)):
    try:
        db_medication_log = MedicationLog.model_validate(medication_log_data)
        session.add(db_medication_log)
        session.commit()
        session.refresh(db_medication_log)
        return db_medication_log
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while saving: {e}"
        )

@router.put("/{medication_log_id}", response_model=MedicationLog)
def update_medication_log(medication_log_id: int, log_data: MedicationLogUpdate, session: Session = Depends(get_session)):
    db_medication_log = session.get(MedicationLog, medication_log_id)
    
    if not db_medication_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medication Log not found"
        )
    
    try:
        update_dict = log_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_medication_log, key, value)

        session.add(db_medication_log)
        session.commit()
        session.refresh(db_medication_log)
        return db_medication_log
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while updating: {e}"
        )
