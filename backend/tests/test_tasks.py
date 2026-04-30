import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import time, datetime, date
from sqlmodel import Session, select
from app.tasks.reminders import check_missed_medications
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.notification import Notification
from app.models.medication_log import MedicationLog

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
async def test_check_missed_medications_already_taken(session: Session):
    medicine = Medicine(name="Medicina Presa", dosage="10mg")
    session.add(medicine)
    session.commit()
    
    schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(8, 0))
    session.add(schedule)
    session.commit()
    
    log = MedicationLog(
        schedule_id=schedule.id,
        reference_date=date(2026, 4, 29),
        is_taken=True,
        taken_at=datetime(2026, 4, 29, 8, 5)
    )
    session.add(log)
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
                    assert len(notifications) == 0
                    mock_send.assert_not_called()

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

@pytest.mark.asyncio
async def test_check_missed_medications_complex_mix(session: Session):
    m = Medicine(name="Mix", dosage="1")
    session.add(m)
    session.commit()

    s_saltato = MedicationSchedule(medicine_id=m.id, scheduled_time=time(7, 0))
    s_preso = MedicationSchedule(medicine_id=m.id, scheduled_time=time(7, 30))
    s_notificato = MedicationSchedule(medicine_id=m.id, scheduled_time=time(8, 0))
    s_futuro = MedicationSchedule(medicine_id=m.id, scheduled_time=time(11, 0))
    
    for s in [s_saltato, s_preso, s_notificato, s_futuro]:
        session.add(s)
    session.commit()

    session.add(MedicationLog(schedule_id=s_preso.id, reference_date=date(2026, 4, 29), is_taken=True))
    session.add(Notification(
        scheduled_id=s_notificato.id, 
        message="X", 
        type="MISSED",
        reference_date=date(2026, 4, 29)
    ))
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
                    assert len(notifications) == 2
                    
                    new_notif = session.exec(select(Notification).where(Notification.message != "X")).first()
                    assert new_notif.scheduled_id == s_saltato.id
                    
                    mock_send.assert_called_once()
