import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import time, datetime, date
from sqlmodel import Session, select
from app.tasks.reminders import check_missed_medications
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.notification import Notification

@pytest.mark.asyncio
async def test_check_missed_medications_creates_notification(session: Session):
    medicine = Medicine(name="Test Medicine", dosage="10mg")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(
        medicine_id=medicine.id,
        scheduled_time=time(8, 0)
    )
    session.add(schedule)
    session.commit()
    
    mock_now = datetime(2026, 4, 29, 9, 0, 0)
    
    with patch("app.tasks.reminders.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        
        with patch("app.tasks.reminders.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.reminders.Session", return_value=mock_session_ctx):
                    
                    await check_missed_medications()
                    
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 1
                    assert notifications[0].scheduled_id == schedule.id
                    assert "Test Medicine" in notifications[0].message
                    
                    mock_send.assert_called_once()
                    assert "Dose saltata" in mock_send.call_args[0][0]

@pytest.mark.asyncio
async def test_check_missed_medications_no_duplicate_notifications(session: Session):
    medicine = Medicine(name="Test Medicine", dosage="10mg")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(8, 0))
    session.add(schedule)
    session.commit()
    
    notification = Notification(
        scheduled_id=schedule.id,
        message="Già inviato",
        type="MISSED",
        reference_date=date(2026, 4, 29)
    )
    session.add(notification)
    session.commit()

    mock_now = datetime(2026, 4, 29, 9, 0, 0)
    
    with patch("app.tasks.reminders.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        with patch("app.tasks.reminders.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.reminders.Session", return_value=mock_session_ctx):
                    
                    await check_missed_medications()
                    
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 1
                    mock_send.assert_not_called()
