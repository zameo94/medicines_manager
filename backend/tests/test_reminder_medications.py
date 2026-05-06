import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import time, datetime, date, timedelta
from sqlmodel import Session, select
from app.tasks.reminder_medications import notify_medications
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.notification import Notification
from app.models.medication_log import MedicationLog
from app.schemas.notification import NotificationType

@pytest.mark.asyncio
async def test_notify_medications_creates_reminder(session: Session):
    medicine = Medicine(name="Oki", dosage="1 bustina")
    session.add(medicine)
    session.commit()
    
    scheduled_time = time(9, 15)
    schedule = MedicationSchedule(
        medicine_id=medicine.id,
        scheduled_time=scheduled_time,
        start_date=date(2026, 1, 1),
        frequency="DAILY",
        interval=1
    )
    session.add(schedule)
    session.commit()
    
    mock_now = datetime(2026, 5, 6, 9, 0, 30)
    
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 6)
            
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    
                    notifications = session.exec(
                        select(Notification).where(Notification.type == NotificationType.NOTIFY)
                    ).all()
                    
                    assert len(notifications) == 1
                    assert notifications[0].scheduled_id == schedule.id
                    assert "tra 15 minuti" in notifications[0].message
                    assert "09:15" in notifications[0].message
                    
                    mock_send.assert_called_once()
                    assert "Ricorda di prendere Oki" in mock_send.call_args[0][0]

@pytest.mark.asyncio
async def test_notify_medications_no_duplicate_if_already_notified(session: Session):
    medicine = Medicine(name="Oki", dosage="1 bustina")
    session.add(medicine)
    session.commit()
    
    scheduled_time = time(9, 15)
    schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=scheduled_time, start_date=date(2026, 1, 1))
    session.add(schedule)
    session.commit()
    
    notification = Notification(
        scheduled_id=schedule.id,
        message="Già notificato",
        type=NotificationType.NOTIFY,
        reference_date=date(2026, 5, 6)
    )
    session.add(notification)
    session.commit()

    mock_now = datetime(2026, 5, 6, 9, 0, 0)
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 6)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    
                    notifications = session.exec(
                        select(Notification).where(Notification.type == NotificationType.NOTIFY)
                    ).all()
                    assert len(notifications) == 1
                    mock_send.assert_not_called()

@pytest.mark.asyncio
async def test_notify_medications_not_sent_if_already_taken(session: Session):
    medicine = Medicine(name="Oki", dosage="1 bustina")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(9, 15), start_date=date(2026, 1, 1))
    session.add(schedule)
    session.commit()
    
    log = MedicationLog(
        schedule_id=schedule.id,
        reference_date=date(2026, 5, 6),
        is_taken=True,
        taken_at=datetime(2026, 5, 6, 8, 30)
    )
    session.add(log)
    session.commit()

    mock_now = datetime(2026, 5, 6, 9, 0, 0)
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 6)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    
                    notifications = session.exec(
                        select(Notification).where(Notification.type == NotificationType.NOTIFY)
                    ).all()
                    assert len(notifications) == 0
                    mock_send.assert_not_called()

@pytest.mark.asyncio
async def test_notify_medications_weekly_frequency_correct_day(session: Session):
    medicine = Medicine(name="Settimanale", dosage="1")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(
        medicine_id=medicine.id,
        scheduled_time=time(9, 15),
        start_date=date(2026, 1, 1),
        frequency="WEEKLY",
        days_of_week=[2], 
        interval=1
    )
    session.add(schedule)
    session.commit()

    mock_now = datetime(2026, 5, 6, 9, 0, 0)
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 6)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    mock_send.assert_called_once()

@pytest.mark.asyncio
async def test_notify_medications_weekly_frequency_wrong_day(session: Session):
    medicine = Medicine(name="Settimanale", dosage="1")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(
        medicine_id=medicine.id,
        scheduled_time=time(9, 15),
        start_date=date(2026, 1, 1),
        frequency="WEEKLY",
        days_of_week=[0], 
        interval=1
    )
    session.add(schedule)
    session.commit()

    mock_now = datetime(2026, 5, 7, 9, 0, 0)
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 7)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    mock_send.assert_not_called()

@pytest.mark.asyncio
async def test_notify_medications_time_normalization(session: Session):
    medicine = Medicine(name="Norm", dosage="1")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(10, 0), start_date=date(2026, 1, 1))
    session.add(schedule)
    session.commit()

    mock_now = datetime(2026, 5, 6, 9, 45, 59)
    with patch("app.tasks.reminder_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.reminder_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 6)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                with patch("app.tasks.reminder_medications.Session", return_value=mock_session_ctx):
                    await notify_medications()
                    mock_send.assert_called_once()
                    assert "10:00" in mock_send.call_args[0][0]
