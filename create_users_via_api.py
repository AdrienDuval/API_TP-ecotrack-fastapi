"""Create users via API endpoint"""
import requests

API_URL = "http://localhost:8000"

print("=" * 60)
print("Creating Test Users via API")
print("=" * 60)
print()

# Create Admin
print("Creating admin user...")
try:
    response = requests.post(
        f"{API_URL}/auth/register",
        json={
            "username": "admin",
            "email": "admin@ecotrack.com",
            "password": "admin123"
        }
    )
    if response.status_code == 200:
        print("✅ Admin user created via API")
        print(f"   Response: {response.json()}")
    else:
        print(f"⚠️  Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

print()

# Create Regular User
print("Creating regular user...")
try:
    response = requests.post(
        f"{API_URL}/auth/register",
        json={
            "username": "testuser",
            "email": "test@ecotrack.com",
            "password": "test123"
        }
    )
    if response.status_code == 200:
        print("✅ Regular user created via API")
        print(f"   Response: {response.json()}")
    else:
        print(f"⚠️  Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("=" * 60)
print("Note: Users created via /register are 'user' role by default")
print("To make 'admin' an admin, you'll need to update via database")
print("=" * 60)
