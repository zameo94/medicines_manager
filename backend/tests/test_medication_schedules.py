from fastapi import status
from sqlmodel import select
from app.models.medication_schedule import MedicationSchedule
from sqlmodel import Session

def test_create_medication_schedule(client):
    med_res = client.post(
        "/medicines/",
        json={
            "name": "Test Med"
        }
    )
    medicine_id = med_res.json()["id"]

    response = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:30:00",
            "medicine_id": medicine_id
        }
    )
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED
    assert data["scheduled_time"] == "08:30:00"
    assert data["medicine_id"] == medicine_id


def test_index_medication_schedules(client):
    med_res = client.post(
        "/medicines/",
        json={
            "name": "Index Med"
        }
    )
    medicine_id = med_res.json()["id"]
    
    client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "10:00:00",
            "medicine_id": medicine_id
        }
    )
    client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "20:00:00",
            "medicine_id": medicine_id
        }
    )

    response = client.get("/medication-schedules/")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert len(data) >= 2
    assert data[0]["medicine"]["name"] == "Index Med"


def test_read_medication_schedule(client):
    med_res = client.post(
        "/medicines/",
        json={
            "name": "Read Med"
        }
    )
    medicine_id = med_res.json()["id"]

    created = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "12:00:00",
            "medicine_id": medicine_id
        }
    ).json()
    
    response = client.get(f"/medication-schedules/{created['id']}")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert data["scheduled_time"] == "12:00:00"
    assert data["medicine"]["name"] == "Read Med"


def test_update_medication_schedule(client):
    med1 = client.post(
        "/medicines/",
        json={
            "name": "Med 1"
        }
    ).json()

    med2 = client.post(
        "/medicines/",
        json={
            "name": "Med 2"
        }
    ).json()

    created = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00",
            "medicine_id": med1["id"]
        }
    ).json()

    response = client.put(
        f"/medication-schedules/{created['id']}",
        json={
            "scheduled_time": "09:00:00",
            "medicine_id": med2["id"]
        }
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert data["scheduled_time"] == "09:00:00"
    assert data["medicine_id"] == med2["id"]


def test_delete_medication_schedule(client):
    med = client.post(
        "/medicines/",
        json={
            "name": "Delete Med"
        }
    ).json()

    created = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00",
            "medicine_id": med["id"]
        }
    ).json()

    response = client.delete(f"/medication-schedules/{created['id']}")
    assert response.status_code == status.HTTP_200_OK

    get_res = client.get(f"/medication-schedules/{created['id']}")
    assert get_res.status_code == status.HTTP_404_NOT_FOUND


def test_read_non_existent_schedule(client):
    response = client.get("/medication-schedules/9999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Medication Schedule not found"


def test_create_invalid_schedule(client):
    response = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00"
        }
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_schedule_db_error(client, mocker):
    med = client.post(
        "/medicines/",
        json={
            "name": "Error Med"
        }
    ).json()

    mocker.patch.object(Session, "commit", side_effect=Exception("DB Error"))

    response = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00",
            "medicine_id": med["id"]
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while saving" in response.json()["detail"]


def test_update_schedule_db_error(client, mocker):
    med = client.post(
        "/medicines/",
        json={
            "name": "Error Med"
        }
    ).json()

    created = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00",
            "medicine_id": med["id"]
        }
    ).json()
    
    mocker.patch.object(Session, "commit", side_effect=Exception("DB Error"))
    
    response = client.put(
        f"/medication-schedules/{created['id']}",
        json={
            "scheduled_time": "09:00:00"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while updating" in response.json()["detail"]


def test_delete_schedule_db_error(client, mocker):
    med = client.post(
        "/medicines/",
        json={
            "name": "Error Med"
        }
    ).json()

    created = client.post(
        "/medication-schedules/",
        json={
            "scheduled_time": "08:00:00",
            "medicine_id": med["id"]
        }
    ).json()
    
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("DB Error"))
    
    response = client.delete(f"/medication-schedules/{created['id']}")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while deleting" in response.json()["detail"]
