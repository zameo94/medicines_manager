from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field

class NotificationBase(SQLModel):
    scheduled_id: int = Field(foreign_key="medication_schedules.id", ondelete="CASCADE")
    message: str
    reference_date: date = Field(index=True)
    type: str

class NotificationCreate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: int
