from datetime import datetime, date
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .medication_schedule import MedicationScheduleRead

class MedicationLogBase(SQLModel):
    reference_date: date = Field(index=True)
    is_taken: bool = Field(default=False)
    schedule_id: int = Field(foreign_key='medication_schedules.id', ondelete='CASCADE')

class MedicationLogCreate(MedicationLogBase):
    pass

class MedicationLogUpdate(MedicationLogBase):
    reference_date: Optional[date] = None
    is_taken: Optional[bool] = None
    schedule_id: Optional[int] = None

class MedicationLogRead(MedicationLogBase):
    id: int
    schedule: MedicationScheduleRead

class MedicationScheduleWithLog(MedicationScheduleRead):
    current_log: Optional[MedicationLogRead] = None
    is_late: bool = False

class MedicationDashboard(SQLModel):
    reference_date: date
    schedules: List[MedicationScheduleWithLog]
