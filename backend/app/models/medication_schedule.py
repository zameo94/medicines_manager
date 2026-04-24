from datetime import time
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func

class MedicationSchedule(SQLModel, table=True):
    __tablename__ = 'medication_schedules'

    id: Optional[int] = Field(default=None, primary_key=True)
    scheduled_time: time = Field(index=True)
    medicine_id: int = Field(foreign_key='medicines.id', ondelete='CASCADE')
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )
    
    # RELATIONS

    medicine: "Medicine" = Relationship(back_populates='schedules')
    logs: List['MedicationLog'] = Relationship(back_populates='schedule')
