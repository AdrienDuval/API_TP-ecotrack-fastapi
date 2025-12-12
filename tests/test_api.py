"""
Integration tests for EcoTrack API endpoints
Tests user creation, login, indicator CRUD, filtered retrieval, and statistics
"""

import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas
from app.auth import get_password_hash

# Create test database
Base.metadata.create_all(bind=engine)

# Test client
client = TestClient(app)


@pytest.fixture
def db():
    """Create a test database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db):
    """Create a test user"""
    user_data = schemas.UserCreate(
        email="test@example.com",
        username="testuser",
        password="testpassword123"
    )
    user = crud.create_user(db, user_data)
    return user


@pytest.fixture
def test_admin(db):
    """Create a test admin user"""
    user_data = schemas.UserCreate(
        email="admin@example.com",
        username="testadmin",
        password="adminpassword123"
    )
    user = crud.create_user(db, user_data)
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_zone(db):
    """Create a test zone"""
    zone_data = schemas.ZoneCreate(
        name="Test City",
        postal_code="75001",
        geom="48.8566,2.3522"
    )
    zone = crud.create_zone(db, zone_data)
    return zone


@pytest.fixture
def test_source(db):
    """Create a test source"""
    source_data = schemas.SourceCreate(
        name="Test Source",
        url="https://test.example.com",
        description="Test data source",
        frequency="daily"
    )
    source = crud.create_source(db, source_data)
    return source


@pytest.fixture
def auth_token(test_user):
    """Get authentication token for test user"""
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "testpassword123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def admin_token(test_admin):
    """Get authentication token for test admin"""
    response = client.post(
        "/auth/login",
        data={"username": "testadmin", "password": "adminpassword123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self):
        """Test user registration"""
        response = client.post(
            "/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "newpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["role"] == "user"  # Default role
    
    def test_login_success(self, test_user):
        """Test successful login"""
        response = client.post(
            "/auth/login",
            data={"username": "testuser", "password": "testpassword123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post(
            "/auth/login",
            data={"username": "nonexistent", "password": "wrongpassword"}
        )
        assert response.status_code == 401
    
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/indicators/")
        assert response.status_code == 401


class TestUserManagement:
    """Test user management endpoints (admin only)"""
    
    def test_list_users_as_admin(self, admin_token):
        """Test listing users as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/users/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_list_users_as_user(self, auth_token):
        """Test that regular users cannot list users"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/users/", headers=headers)
        assert response.status_code == 403
    
    def test_get_current_user(self, auth_token):
        """Test getting current user info"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
    
    def test_update_user_as_admin(self, admin_token, test_user):
        """Test updating user as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.put(
            f"/users/{test_user.id}",
            headers=headers,
            json={"is_active": False}
        )
        assert response.status_code == 200
        assert response.json()["is_active"] == False


class TestIndicators:
    """Test indicator endpoints"""
    
    def test_create_indicator_as_admin(self, admin_token, test_zone, test_source):
        """Test creating indicator as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        indicator_data = {
            "type": "air_quality",
            "value": 25.5,
            "unit": "µg/m³",
            "timestamp": "2025-11-20T10:00:00",
            "zone_id": test_zone.id,
            "source_id": test_source.id
        }
        response = client.post("/indicators/", headers=headers, json=indicator_data)
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "air_quality"
        assert data["value"] == 25.5
    
    def test_create_indicator_as_user(self, auth_token, test_zone, test_source):
        """Test that regular users cannot create indicators"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        indicator_data = {
            "type": "air_quality",
            "value": 25.5,
            "unit": "µg/m³",
            "timestamp": "2025-11-20T10:00:00",
            "zone_id": test_zone.id,
            "source_id": test_source.id
        }
        response = client.post("/indicators/", headers=headers, json=indicator_data)
        assert response.status_code == 403
    
    def test_list_indicators(self, auth_token, admin_token, test_zone, test_source):
        """Test listing indicators with filters"""
        # Create an indicator first
        headers = {"Authorization": f"Bearer {admin_token}"}
        indicator_data = {
            "type": "co2",
            "value": 400.0,
            "unit": "ppm",
            "timestamp": "2025-11-20T10:00:00",
            "zone_id": test_zone.id,
            "source_id": test_source.id
        }
        client.post("/indicators/", headers=headers, json=indicator_data)
        
        # List indicators
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/indicators/", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
    
    def test_filter_indicators_by_type(self, auth_token, admin_token, test_zone, test_source):
        """Test filtering indicators by type"""
        # Create indicators
        headers = {"Authorization": f"Bearer {admin_token}"}
        for ind_type in ["air_quality", "co2", "energy"]:
            indicator_data = {
                "type": ind_type,
                "value": 100.0,
                "unit": "test",
                "timestamp": "2025-11-20T10:00:00",
                "zone_id": test_zone.id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Filter by type
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/indicators/?type=air_quality", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        indicators = data["items"]
        assert all(ind["type"] == "air_quality" for ind in indicators)
    
    def test_filter_indicators_by_zone(self, auth_token, admin_token, test_zone, test_source, db):
        """Test filtering indicators by zone"""
        # Create another zone
        zone2 = crud.create_zone(db, schemas.ZoneCreate(name="Zone 2", postal_code="69001"))
        
        # Create indicators in different zones
        headers = {"Authorization": f"Bearer {admin_token}"}
        for zone_id in [test_zone.id, zone2.id]:
            indicator_data = {
                "type": "air_quality",
                "value": 50.0,
                "unit": "µg/m³",
                "timestamp": "2025-11-20T10:00:00",
                "zone_id": zone_id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Filter by zone
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get(f"/indicators/?zone_id={test_zone.id}", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        indicators = data["items"]
        assert all(ind["zone_id"] == test_zone.id for ind in indicators)
    
    def test_filter_indicators_by_date_range(self, auth_token, admin_token, test_zone, test_source):
        """Test filtering indicators by date range"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create indicators with different dates
        for date in ["2025-11-18T10:00:00", "2025-11-20T10:00:00", "2025-11-22T10:00:00"]:
            indicator_data = {
                "type": "air_quality",
                "value": 30.0,
                "unit": "µg/m³",
                "timestamp": date,
                "zone_id": test_zone.id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Filter by date range
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get(
            "/indicators/?from=2025-11-19T00:00:00&to=2025-11-21T23:59:59",
            headers=user_headers
        )
        assert response.status_code == 200
        data = response.json()
        indicators = data["items"]
        # Should only get the indicator from 2025-11-20
        assert len(indicators) >= 1
    
    def test_delete_indicator_as_admin(self, admin_token, test_zone, test_source):
        """Test deleting indicator as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create indicator
        indicator_data = {
            "type": "air_quality",
            "value": 25.0,
            "unit": "µg/m³",
            "timestamp": "2025-11-20T10:00:00",
            "zone_id": test_zone.id,
            "source_id": test_source.id
        }
        create_response = client.post("/indicators/", headers=headers, json=indicator_data)
        indicator_id = create_response.json()["id"]
        
        # Delete indicator
        delete_response = client.delete(f"/indicators/{indicator_id}", headers=headers)
        assert delete_response.status_code == 200
        
        # Verify it's deleted
        get_response = client.get(f"/indicators/{indicator_id}", headers=headers)
        assert get_response.status_code == 404


class TestStatistics:
    """Test statistics endpoints"""
    
    def test_summary_stats(self, auth_token, admin_token, test_zone, test_source):
        """Test summary statistics endpoint"""
        # Create indicators of different types
        headers = {"Authorization": f"Bearer {admin_token}"}
        for ind_type in ["air_quality", "co2", "energy"]:
            indicator_data = {
                "type": ind_type,
                "value": 100.0,
                "unit": "test",
                "timestamp": "2025-11-20T10:00:00",
                "zone_id": test_zone.id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Get summary stats
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/stats/summary", headers=user_headers)
        assert response.status_code == 200
        stats = response.json()
        assert isinstance(stats, list)
        assert len(stats) >= 1
    
    def test_air_quality_averages(self, auth_token, admin_token, test_zone, test_source):
        """Test air quality averages endpoint"""
        # Create air quality indicators
        headers = {"Authorization": f"Bearer {admin_token}"}
        for value in [20.0, 30.0, 40.0]:
            indicator_data = {
                "type": "air_quality",
                "value": value,
                "unit": "µg/m³",
                "timestamp": "2025-11-20T10:00:00",
                "zone_id": test_zone.id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Get averages
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/stats/air/averages", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert "labels" in data
        assert "series" in data
        assert isinstance(data["labels"], list)
        assert isinstance(data["series"], list)
    
    def test_co2_trend(self, auth_token, admin_token, test_zone, test_source):
        """Test CO2 trend endpoint"""
        # Create CO2 indicators
        headers = {"Authorization": f"Bearer {admin_token}"}
        for i in range(3):
            indicator_data = {
                "type": "co2",
                "value": 400.0 + i * 10,
                "unit": "ppm",
                "timestamp": f"2025-11-{18+i}T10:00:00",
                "zone_id": test_zone.id,
                "source_id": test_source.id
            }
            client.post("/indicators/", headers=headers, json=indicator_data)
        
        # Get trend
        user_headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/stats/co2/trend?period=monthly", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert "labels" in data
        assert "series" in data


class TestZones:
    """Test zone endpoints"""
    
    def test_list_zones(self, auth_token):
        """Test listing zones"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = client.get("/zones/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_zone_as_admin(self, admin_token):
        """Test creating zone as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        zone_data = {
            "name": "New Zone",
            "postal_code": "75002",
            "geom": "48.8600,2.3370"
        }
        response = client.post("/zones/", headers=headers, json=zone_data)
        assert response.status_code == 200
        assert response.json()["name"] == "New Zone"

