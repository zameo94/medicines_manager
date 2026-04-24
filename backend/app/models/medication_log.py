from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func

class MedicationLog(SQLModel, table=True):
    __tablename__ = 'medication_logs'

    id: Optional[int] = Field(default=None, primary_key=True)
    reference_date: date = Field(index=True)
    is_taken: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    schedule_id: int = Field(foreign_key='medication_schedules.id', ondelete='CASCADE')
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )

    # RELATIONS

    schedule: "MedicationSchedule" = Relationship(back_populates='logs')
