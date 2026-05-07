import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import time, datetime, date, timedelta
from sqlmodel import Session, select
from app.tasks.missed_medications import check_missed_medications
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.notification import Notification
from app.models.medication_log import MedicationLog

@pytest.mark.asyncio
async def test_check_missed_medications_cumulative_notification(session: Session):
    m1 = Medicine(name="Medicine A", dosage="10mg")
    m2 = Medicine(name="Medicine B", dosage="20mg")
    session.add(m1)
    session.add(m2)
    session.commit()
    
    s1 = MedicationSchedule(medicine_id=m1.id, scheduled_time=time(8, 0), start_date=date(2026, 1, 1))
    s2 = MedicationSchedule(medicine_id=m2.id, scheduled_time=time(7, 0), start_date=date(2026, 1, 1))
    session.add(s1)
    session.add(s2)
    session.commit()
    
    mock_now = datetime(2026, 4, 29, 9, 0, 0)
    
    with patch("app.tasks.missed_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.missed_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.missed_medications.Session", return_value=mock_session_ctx):
                    await check_missed_medications()
                    
                    mock_send.assert_called_once()
                    sent_message = mock_send.call_args[0][0]
                    assert "Medicine A" in sent_message
                    assert "Medicine B" in sent_message
                    assert "08:00" in sent_message
                    assert "07:00" in sent_message
                    
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 2
                    schedule_ids = [n.scheduled_id for n in notifications]
                    assert s1.id in schedule_ids
                    assert s2.id in schedule_ids

@pytest.mark.asyncio
async def test_check_missed_medications_ignores_older_than_3_hours(session: Session):
    m = Medicine(name="Old Medicine", dosage="10mg")
    session.add(m)
    session.commit()
    
    s = MedicationSchedule(medicine_id=m.id, scheduled_time=time(5, 0), start_date=date(2026, 1, 1))
    session.add(s)
    session.commit()
    
    mock_now = datetime(2026, 4, 29, 9, 30, 0) # 09:30, so limit is 06:30
    
    with patch("app.tasks.missed_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.missed_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.missed_medications.Session", return_value=mock_session_ctx):
                    await check_missed_medications()
                    
                    mock_send.assert_not_called()
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 0

@pytest.mark.asyncio
async def test_check_missed_medications_sends_repeatedly_if_not_taken(session: Session):
    m = Medicine(name="Repeat Medicine", dosage="10mg")
    session.add(m)
    session.commit()
    
    s = MedicationSchedule(medicine_id=m.id, scheduled_time=time(8, 0), start_date=date(2026, 1, 1))
    session.add(s)
    session.commit()
    
    existing_notification = Notification(
        scheduled_id=s.id,
        message="First reminder",
        type="MISSED",
        reference_date=date(2026, 4, 29)
    )
    session.add(existing_notification)
    session.commit()
    
    mock_now = datetime(2026, 4, 29, 8, 30, 0)
    
    with patch("app.tasks.missed_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.missed_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.missed_medications.Session", return_value=mock_session_ctx):
                    await check_missed_medications()
                    
                    mock_send.assert_called_once()
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 2 # The existing one + the new one

@pytest.mark.asyncio
async def test_check_missed_medications_no_notification_if_taken(session: Session):
    m = Medicine(name="Taken Medicine", dosage="10mg")
    session.add(m)
    session.commit()
    
    s = MedicationSchedule(medicine_id=m.id, scheduled_time=time(8, 0), start_date=date(2026, 1, 1))
    session.add(s)
    session.commit()
    
    log = MedicationLog(
        schedule_id=s.id,
        reference_date=date(2026, 4, 29),
        is_taken=True,
        taken_at=datetime(2026, 4, 29, 8, 5)
    )
    session.add(log)
    session.commit()
    
    mock_now = datetime(2026, 4, 29, 8, 30, 0)
    
    with patch("app.tasks.missed_medications.datetime") as mock_datetime:
        mock_datetime.now.return_value = mock_now
        mock_datetime.combine = datetime.combine
        with patch("app.tasks.missed_medications.date") as mock_date:
            mock_date.today.return_value = date(2026, 4, 29)
            with patch("app.services.telegram.TelegramService.send_message", new_callable=AsyncMock) as mock_send:
                mock_session_ctx = MagicMock()
                mock_session_ctx.__enter__.return_value = session
                mock_session_ctx.__exit__.return_value = None
                
                with patch("app.tasks.missed_medications.Session", return_value=mock_session_ctx):
                    await check_missed_medications()
                    
                    mock_send.assert_not_called()
                    notifications = session.exec(select(Notification)).all()
                    assert len(notifications) == 0
