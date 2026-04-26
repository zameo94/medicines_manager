from datetime import time
from typing import Optional
from sqlmodel import SQLModel, Field
from .medicine import MedicineRead

class MedicationScheduleBase(SQLModel):
    scheduled_time: time = Field(index=True)
    medicine_id: int = Field(foreign_key='medicines.id', ondelete='CASCADE')

class MedicationScheduleCreate(MedicationScheduleBase):
    pass

class MedicationScheduleUpdate(MedicationScheduleBase):
    scheduled_time: Optional[time] = None
    medicine_id: Optional[int] = None

class MedicationScheduleRead(MedicationScheduleBase):
    id: int
    medicine: MedicineRead
