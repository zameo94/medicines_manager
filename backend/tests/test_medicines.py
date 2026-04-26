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

    assert response.status_code == status.HTTP_201_CREATED
    assert data["name"] == "Tachipirina"
    assert data["is_active"] is True
    assert "id" in data

def test_create_medicine_invalid_name(client):
    response = client.post(
        "/medicines/",
        json={
            "name": "",
            "description": "Empty name"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

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
    non_existent_id = 9999
    response = client.get(f"/medicines/{non_existent_id}")
    
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
            "is_active": False
        }
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK
    assert data["is_active"] is False
    assert data["name"] == "Aspirina"

def test_update_non_existent_medicine(client):
    non_existent_id = 9999
    response = client.put(
        f"/medicines/{non_existent_id}",
        json={
            "name": "Fake Medicine"
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

def test_delete_non_existent_medicine(client):
    non_existent_id = 9999
    response = client.delete(f"/medicines/{non_existent_id}")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Medicine not found"


def test_create_medicine_db_error(client, mocker):
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("Connection lost"))
    
    response = client.post(
        "/medicines/",
        json={"name": "Error Test"}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while saving" in response.json()["detail"]

def test_update_medicine_db_error(client, mocker):
    created = client.post(
        "/medicines/",
        json={
            "name": "Update Error Test"
        }
    ).json()
    medicine_id = created["id"]
    
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("Update failed"))
    
    response = client.put(
        f"/medicines/{medicine_id}",
        json={"name": "New Name"}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while updating" in response.json()["detail"]

def test_delete_medicine_db_error(client, mocker):
    created = client.post(
        "/medicines/",
        json={
            "name": "Delete Error Test"
        }
    ).json()
    medicine_id = created["id"]
    
    from sqlmodel import Session
    mocker.patch.object(Session, "commit", side_effect=Exception("Delete failed"))
    
    response = client.delete(f"/medicines/{medicine_id}")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Error while deleting" in response.json()["detail"]

def test_get_active_medicines(client):
    client.post(
        "/medicines/",
        json={
            "name": "Active Med","is_active": True
        }
    )
    client.post(
        "/medicines/",
        json={
            "name": "Inactive Med","is_active": False
        }
    )
    
    response = client.get("/medicines/active")
    data = response.json()
    
    assert response.status_code == status.HTTP_200_OK
    names = [m["name"] for m in data]
    assert "Active Med" in names
    assert "Inactive Med" not in names
    for m in data:
        assert m["is_active"] is True
