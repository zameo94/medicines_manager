from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func

class Medicine(SQLModel, table=True):
    __tablename__ = 'medicines'

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )

    # RELATIONS

    schedules: List['MedicationSchedule'] = Relationship(back_populates='medicine')
