from typing import List
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.medication_log import MedicationLog
from app.database import engine, get_session
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Medicines Manager API")

# CORS

cors_origins_raw = os.getenv("ALLOWED_ORIGINS")
allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",")]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes

# Root

@app.get("/")
def root(session: Session = Depends(get_session)):
    count_active = session.exec(
        select(func.count(Medicine.id)).where(Medicine.is_active == True)
    ).one()
    
    count_schedules = session.exec(select(func.count(MedicationSchedule.id))).one()

    return {
        "status": "200",
        "version": "1.0.0",
        "stats": {
            "active_medicines": count_active,
            "total_schedules": count_schedules
        }
    }

# Medicines

@app.post("/medicines/", response_model=Medicine)
def create_medicine(medicine: Medicine, session: Session = Depends(get_session)):
    try:
        session.add(medicine)
        session.commit()
        session.refresh(medicine)

        return medicine
    except Exception as e:
        session.rollback()
        raise HTTPException(status=400, detail=f"Error while saving: {e}")

@app.put("/medicines/{medicine_id}", response_model=Medicine)
def update_medicine(medicine_id: int, medicine_data: Medicine, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    try:
        new_data = medicine_data.model_dump(exclude_unset=True)

        for key, value in new_data.items():
            setattr(medicine, key, value)

        session.add(medicine)
        session.commit()
        session.refresh(medicine)
        
        return medicine
    except Exception as e:
        session.rollback()
        raise HTTPException(status=400, detail=f"Error while updating: {e}")

@app.get("/medicines/", response_model=List[Medicine])
def index_medicines(session: Session = Depends(get_session)):
    medicines = session.exec(select(Medicine)).all()

    return medicines

@app.get("/medicines/{medicine_id}", response_model=Medicine)
def show_medicine(medicine_id: int, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    return medicine

@app.delete("/medicines/{medicine_id}")
def delete_medicine(medicine_id: int, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    try:
        session.delete(medicine)
        session.commit()
        
        return {"status": 200, "message": f"Medicine with ID {medicine_id} succesfully deleted"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status=400, detail=f"Error while deleting: {e}")