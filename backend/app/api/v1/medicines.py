from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate

router = APIRouter()

@router.post("/", response_model=Medicine, status_code=status.HTTP_201_CREATED)
def create_medicine(medicine_data: MedicineCreate, session: Session = Depends(get_session)):
    try:
        db_medicine = Medicine.model_validate(medicine_data)
        session.add(db_medicine)
        session.commit()
        session.refresh(db_medicine)
        return db_medicine
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while saving: {e}"
        )

@router.get("/", response_model=List[Medicine])
def index_medicines(session: Session = Depends(get_session)):
    medicines = session.exec(select(Medicine)).all()
    return medicines

@router.get("/{medicine_id}", response_model=Medicine)
def show_medicine(medicine_id: int, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medicine not found"
        )
    return medicine

@router.put("/{medicine_id}", response_model=Medicine)
def update_medicine(medicine_id: int, medicine_data: MedicineUpdate, session: Session = Depends(get_session)):
    db_medicine = session.get(Medicine, medicine_id)
    
    if not db_medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medicine not found"
        )
    
    try:
        update_dict = medicine_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_medicine, key, value)

        session.add(db_medicine)
        session.commit()
        session.refresh(db_medicine)
        return db_medicine
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while updating: {e}"
        )

@router.delete("/{medicine_id}")
def delete_medicine(medicine_id: int, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Medicine not found"
        )
    
    try:
        session.delete(medicine)
        session.commit()
        return {"status": 200, "message": f"Medicine {medicine_id} successfully deleted"}
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error while deleting: {e}"
        )