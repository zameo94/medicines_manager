from typing import List, Optional
from sqlmodel import Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func
from app.schemas.medicine import MedicineBase

class Medicine(MedicineBase, table=True):
    __tablename__ = 'medicines'

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

    schedules: List['MedicationSchedule'] = Relationship(back_populates='medicine')
