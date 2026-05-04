import pytest
from fastapi import status
from datetime import date, timedelta, time, datetime
from app.models.medicine import Medicine
from app.models.medication_schedule import MedicationSchedule
from app.models.medication_log import MedicationLog

def setup_data(session):
    medicine = Medicine(name="Tachipirina", description="500mg", is_active=True)
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    
    schedule = MedicationSchedule(
        medicine_id=medicine.id,
        scheduled_time=time(8, 0),
        start_date=date(2026, 1, 1)
    )
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    
    return medicine, schedule

def test_get_dashboard(client, session):
    medicine, schedule = setup_data(session)
    
    response = client.get("/medication-logs/")
    data = response.json()
    
    assert response.status_code == status.HTTP_200_OK
    assert "reference_date" in data
    assert len(data["schedules"]) >= 1
    assert data["schedules"][0]["medicine"]["name"] == "Tachipirina"
    assert data["schedules"][0]["current_log"] is None
    assert "is_late" in data["schedules"][0]

def test_is_late_calculation(client, session, mocker):
    mock_now = mocker.patch("app.api.v1.medication_logs.datetime")
    
    mock_now.now.return_value = datetime(2026, 4, 28, 10, 0, 0)
    
    medicine = Medicine(name="Med", is_active=True)
    session.add(medicine)
    session.commit()
    
    late_schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(8, 0), start_date=date(2026, 1, 1))
    future_schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(12, 0), start_date=date(2026, 1, 1))
    
    session.add(late_schedule)
    session.add(future_schedule)
    session.commit()
    
    response = client.get("/medication-logs/")
    schedules = response.json()["schedules"]
    
    schedules.sort(key=lambda x: x["scheduled_time"])
    
    assert schedules[0]["is_late"] is True
    assert schedules[1]["is_late"] is False

def test_create_medication_log(client, session):
    medicine, schedule = setup_data(session)
    today = date.today().isoformat()
    
    response = client.post(
        "/medication-logs/",
        json={
            "reference_date": today,
            "is_taken": True,
            "schedule_id": schedule.id
        }
    )
    data = response.json()
    
    assert response.status_code == status.HTTP_201_CREATED
    assert data["is_taken"] is True
    assert data["reference_date"] == today
    assert data["schedule_id"] == schedule.id

def test_update_medication_log(client, session):
    medicine, schedule = setup_data(session)
    today = date.today()
    
    log = MedicationLog(
        reference_date=today,
        is_taken=True,
        schedule_id=schedule.id
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    
    response = client.put(
        f"/medication-logs/{log.id}",
        json={
            "is_taken": False
        }
    )
    data = response.json()
    
    assert response.status_code == status.HTTP_200_OK
    assert data["is_taken"] is False
def test_get_index_logs(client, session):
    medicine, schedule = setup_data(session)
    today = date.today()

    client.post(
        "/medication-logs/",
        json={
            "reference_date": today.isoformat(),
            "is_taken": True,
            "schedule_id": schedule.id
        }
    )

    response = client.get("/medication-logs/index")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert len(data) >= 1
    found = False
    for item in data:
        if item["schedule"]["id"] == schedule.id and item["reference_date"] == today.isoformat():
            assert item["log"]["is_taken"] is True
            assert "is_late" in item["schedule"]
            found = True
            break
    assert found is True

def test_index_is_late_calculation(client, session, mocker):
    mock_now = mocker.patch("app.api.v1.medication_logs.datetime")
    mock_now.now.return_value = datetime(2026, 4, 28, 10, 0, 0)

    medicine = Medicine(name="Med", is_active=True)
    session.add(medicine)
    session.commit()

    late_schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(8, 0), start_date=date(2026, 1, 1))
    future_schedule = MedicationSchedule(medicine_id=medicine.id, scheduled_time=time(12, 0), start_date=date(2026, 1, 1))

    session.add(late_schedule)
    session.add(future_schedule)
    session.commit()

    response = client.get("/medication-logs/index?start_date=2026-04-28&end_date=2026-04-28")
    data = response.json()

    today_entries = [e for e in data if e["reference_date"] == "2026-04-28"]
    today_entries.sort(key=lambda x: x["schedule"]["scheduled_time"])

    assert today_entries[0]["schedule"]["is_late"] is True  # 08:00 < 10:00
    assert today_entries[1]["schedule"]["is_late"] is False # 12:00 > 10:00


def test_get_index_with_date_range(client, session):
    medicine, schedule = setup_data(session)
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    response = client.get(
        f"/medication-logs/index?start_date={yesterday.isoformat()}&end_date={today.isoformat()}"
    )
    data = response.json()
    
    assert response.status_code == status.HTTP_200_OK
    assert len(data) == 2

def test_update_non_existent_log(client):
    response = client.put(
        "/medication-logs/9999",
        json={"is_taken": True}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in response.json()["detail"].lower()

def test_create_log_db_error(client, session, mocker):
    medicine, schedule = setup_data(session)
    
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("Database error"))
    
    response = client.post(
        "/medication-logs/",
        json={
            "reference_date": date.today().isoformat(),
            "is_taken": True,
            "schedule_id": schedule.id
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error while saving" in response.json()["detail"].lower()

def test_update_log_db_error(client, session, mocker):
    medicine, schedule = setup_data(session)
    log = MedicationLog(reference_date=date.today(), is_taken=True, schedule_id=schedule.id)
    session.add(log)
    session.commit()
    session.refresh(log)
    
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("Database error"))
    
    response = client.put(
        f"/medication-logs/{log.id}",
        json={"is_taken": False}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error while updating" in response.json()["detail"].lower()
