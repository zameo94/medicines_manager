from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import Column

class NotificationType(str, Enum):
    NOTIFY = "NOTIFY"
    MISSED = "MISSED"

class NotificationBase(SQLModel):
    scheduled_id: int = Field(foreign_key="medication_schedules.id", ondelete="CASCADE")
    message: str
    reference_date: date = Field(index=True)
    type: NotificationType = Field(
        sa_column=Column(sa.Enum(NotificationType, native_enum=False), index=True, nullable=False)
    )

class NotificationCreate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: int
