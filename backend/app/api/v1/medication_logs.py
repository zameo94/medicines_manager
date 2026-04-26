from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.medication_log import MedicationLog
from app.schemas.medication_log import MedicationLogCreate, MedicationLogUpdate, MedicationLogRead

router = APIRouter()

@router.get("/", response_model=List[MedicationLogRead])
def index_medication_logs(session: Session = Depends(get_session)):
    medication_logs = session.exec(select(MedicationLog)).all()
    return medication_logs

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
