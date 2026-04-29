from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, UniqueConstraint
from datetime import datetime
from sqlalchemy import Column, DateTime, func
from app.schemas.notification import NotificationBase

if TYPE_CHECKING:
    from .medication_schedule import MedicationSchedule

class Notification(NotificationBase, table=True):
    __tablename__ = "notifications"

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

    schedule: "MedicationSchedule" = Relationship()

    __table_args__ = (
        UniqueConstraint("scheduled_id", "reference_date", name="ix_unique_notification_per_day"),
    )
