import os
from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import get_session
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.api.v1 import medicines
from app.api.v1 import medication_schedules
from app.api.v1 import medication_logs

load_dotenv()

app = FastAPI(title="Medicines Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(
    medicines.router, 
    prefix="/medicines", 
    tags=["Medicines"]
)

# Medication Schedules
app.include_router(
    medication_schedules.router, 
    prefix="/medication-schedules", 
    tags=["Medication Schedules"]
)

# Medication Logs
app.include_router(
    medication_logs.router, 
    prefix="/medication-logs", 
    tags=["Medication Logs"]
)
