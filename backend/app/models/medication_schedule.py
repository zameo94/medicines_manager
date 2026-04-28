from datetime import time
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func
from app.schemas.medication_schedule import MedicationScheduleBase

class MedicationSchedule(MedicationScheduleBase, table=True):
    __tablename__ = 'medication_schedules'

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )
    
    # RELATIONS

    medicine: "Medicine" = Relationship(back_populates='schedules')
    logs: List['MedicationLog'] = Relationship(
        back_populates='schedule',
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
