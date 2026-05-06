import pytest
from pydantic import ValidationError
from app.schemas.notification import NotificationCreate, NotificationType
from app.models.notification import Notification
from sqlmodel import Session, select
from datetime import date

def test_notification_type_enum_values():
    assert NotificationType.NOTIFY == "NOTIFY"
    assert NotificationType.MISSED == "MISSED"
    assert len(NotificationType) == 2

def test_notification_schema_validation_success():
    notif = NotificationCreate(
        scheduled_id=1,
        message="Test",
        reference_date=date(2026, 5, 6),
        type=NotificationType.NOTIFY
    )
    assert notif.type == NotificationType.NOTIFY

def test_notification_schema_validation_error():
    with pytest.raises(ValidationError):
        NotificationCreate(
            scheduled_id=1,
            message="Test",
            reference_date=date(2026, 5, 6),
            type="INVALID_TYPE"
        )

def test_notification_model_db_constraint(session: Session):
    notif = Notification(
        scheduled_id=1,
        message="Test DB",
        reference_date=date(2026, 5, 6),
        type=NotificationType.MISSED
    )
    session.add(notif)
    session.commit()
    
    db_notif = session.exec(select(Notification)).first()
    assert db_notif.type == NotificationType.MISSED

def test_notification_type_assignment_from_string():
    notif = NotificationCreate(
        scheduled_id=1,
        message="Test",
        reference_date=date(2026, 5, 6),
        type="NOTIFY"
    )
    assert isinstance(notif.type, NotificationType)
    assert notif.type == NotificationType.NOTIFY
