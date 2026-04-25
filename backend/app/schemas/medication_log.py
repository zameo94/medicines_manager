from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy import Column, DateTime, func

class MedicationLogBase(SQLModel):
    reference_date: date = Field(index=True)
    is_taken: bool = Field(default=False)
    schedule_id: int = Field(foreign_key='medication_schedules.id', ondelete='CASCADE')
    