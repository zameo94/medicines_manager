from fastapi import status
from sqlmodel import select, func
from app.models.medicine import Medicine

def test_create_medicine(client):
    response = client.post(
        "/medicines/",
        json={
            "name": "Tachipirina",
            "description": "500mg",
            "is_active": True
        }
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert data["name"] == "Tachipirina"
    assert data["is_active"] is True
    assert "id" in data

def test_index_medicines(client):
    client.post(
        "/medicines/",
        json={
            "name": "Oki",
            "description": "Bustine"
        }
    )
    client.post(
        "/medicines/",
        json={
            "name": "Oki2",
            "description": "Bustine"
        }
    )
    
    response = client.get("/medicines/")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert len(data) >= 2
    names = [m["name"] for m in data]
    assert "Oki" in names
    assert "Oki2" in names

def test_read_medicines(client):
    client.post(
        "/medicines/",
        json={
            "name": "Oki",
            "description": "Bustine"
        }
    )
    
    response = client.get("/medicines/")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert len(data) >= 1
    assert data[0]["name"] == "Oki"

def test_read_non_existent_medicine(client, session):
    max_id = session.exec(select(func.max(Medicine.id))).one() or 0
    non_existent_id = max_id + 1

    response = client.get(
        f"/medicines/{non_existent_id}"
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Medicine not found"

def test_update_medicine(client):
    created = client.post(
        "/medicines/",
        json={
            "name": "Aspirina",
            "is_active": True
        }
    ).json()
    medicine_id = created["id"]

    response = client.put(
        f"/medicines/{medicine_id}",
        json={
            "name": "Aspirina",
            "is_active": False
            }
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert data["is_active"] is False

def test_update_non_existent_medicine(client, session):
    max_id = session.exec(select(func.max(Medicine.id))).one() or 0
    non_existent_id = max_id + 1

    response = client.put(
        f"/medicines/{non_existent_id}",
        json={
            "name": "Fake Medicine",
            "is_active": False
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Medicine not found"

def test_delete_medicine(client):
    created = client.post(
        "/medicines/",
        json={
            "name": "To Delete"
        }
    ).json()
    medicine_id = created["id"]

    response = client.delete(f"/medicines/{medicine_id}")
    assert response.status_code == status.HTTP_200_OK

    get_res = client.get(f"/medicines/{medicine_id}")
    assert get_res.status_code == status.HTTP_404_NOT_FOUND


def test_delete_non_existent_medicine(client, session):
    max_id = session.exec(select(func.max(Medicine.id))).one() or 0
    non_existent_id = max_id + 1

    response = client.delete(
        f"/medicines/{non_existent_id}"
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Medicine not found"