from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.medication_schedule import MedicationSchedule
from app.schemas.medication_schedule import MedicationScheduleCreate, MedicationScheduleUpdate, MedicationScheduleRead

router = APIRouter()

@router.get("/", response_model=List[MedicationScheduleRead])
def index_medication_schedule(session: Session = Depends(get_session)):
    medication_schedules = session.exec(select(MedicationSchedule)).all()
    return medication_schedules

@router.get("/{medication_schedule_id}", response_model=MedicationScheduleRead)
def show_medicine(medication_schedule_id: int, session: Session = Depends(get_session)):
    medication_schedule = session.get(MedicationSchedule, medication_schedule_id)
    if not medication_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medication Schedule not found"
        )
    return medication_schedule

@router.post("/", response_model=MedicationSchedule, status_code=status.HTTP_201_CREATED)
def create_medication_schedule(medication_schedule_data: MedicationScheduleCreate, session: Session = Depends(get_session)):
    try:
        db_medication_schedule = MedicationSchedule.model_validate(medication_schedule_data)
        session.add(db_medication_schedule)
        session.commit()
        session.refresh(db_medication_schedule)
        return db_medication_schedule
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while saving: {e}"
        )

@router.put("/{medication_schedule_id}", response_model=MedicationScheduleRead)
def update_medicine(medication_schedule_id: int, medicine_data: MedicationScheduleUpdate, session: Session = Depends(get_session)):
    db_medication_schedule = session.get(MedicationSchedule, medication_schedule_id)
    
    if not db_medication_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medication Schedule not found"
        )
    
    try:
        update_dict = medicine_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_medication_schedule, key, value)

        session.add(db_medication_schedule)
        session.commit()
        session.refresh(db_medication_schedule)
        return db_medication_schedule
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while updating: {e}"
        )

@router.delete("/{medication_schedule_id}")
def delete_medicine(medication_schedule_id: int, session: Session = Depends(get_session)):
    medication_schedule = session.get(MedicationSchedule, medication_schedule_id)
    
    if not medication_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medication Schedule not found"
        )
    
    try:
        session.delete(medication_schedule)
        session.commit()
        return {"status": 200, "message": f"Medication Schedule {medication_schedule_id} successfully deleted"}
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while deleting: {e}"
        )
