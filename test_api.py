"""
Test script to verify API endpoints are working
Run this while your FastAPI server is running
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_api():
    """Test if API endpoints are working"""
    print("=" * 60)
    print("Testing API Endpoints")
    print("=" * 60)
    print()
    
    # Test 1: Root endpoint
    print("1. Testing root endpoint...")
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            print(f"   SUCCESS: {response.json()}")
        else:
            print(f"   ERROR: Status {response.status_code}")
    except Exception as e:
        print(f"   ERROR: Cannot connect to API - {e}")
        print("   Make sure FastAPI server is running:")
        print("   python -m uvicorn app.main:app --reload")
        return
    
    print()
    
    # Test 2: Get indicators (requires auth)
    print("2. Testing indicators endpoint (requires authentication)...")
    print("   This will fail without login - that's expected!")
    try:
        response = requests.get(f"{API_URL}/indicators/?limit=5")
        if response.status_code == 200:
            data = response.json()
            print(f"   SUCCESS: Found {len(data)} indicators")
            if len(data) > 0:
                print(f"   Sample: {data[0]}")
        elif response.status_code == 401:
            print("   EXPECTED: 401 Unauthorized (need to login)")
        else:
            print(f"   ERROR: Status {response.status_code}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print()
    
    # Test 3: Login
    print("3. Testing login endpoint...")
    print("   Attempting to login with admin credentials...")
    try:
        login_data = {
            "username": "admin",
            "password": "password123"
        }
        response = requests.post(
            f"{API_URL}/auth/login",
            data=login_data  # OAuth2PasswordRequestForm uses form data
        )
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print(f"   SUCCESS: Got access token!")
            print(f"   Token: {token[:20]}...")
            
            # Test 4: Get indicators with token
            print()
            print("4. Testing indicators endpoint with token...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_URL}/indicators/?limit=5", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   SUCCESS: Found {len(data)} indicators")
                if len(data) > 0:
                    ind = data[0]
                    print(f"   Sample indicator:")
                    print(f"   - Type: {ind.get('type')}")
                    print(f"   - Value: {ind.get('value')} {ind.get('unit')}")
                    print(f"   - Timestamp: {ind.get('timestamp')}")
            else:
                print(f"   ERROR: Status {response.status_code}")
                print(f"   Response: {response.text}")
            
            # Test 5: Get stats
            print()
            print("5. Testing stats endpoint...")
            response = requests.get(f"{API_URL}/stats/summary", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                print(f"   SUCCESS: Got {len(stats)} stat types")
                for stat in stats[:3]:
                    print(f"   - {stat.get('type')}: avg={stat.get('average'):.2f}, count={stat.get('count')}")
            else:
                print(f"   ERROR: Status {response.status_code}")
            
            # Test 6: Get zones
            print()
            print("6. Testing zones endpoint...")
            response = requests.get(f"{API_URL}/zones/", headers=headers)
            if response.status_code == 200:
                zones = response.json()
                print(f"   SUCCESS: Found {len(zones)} zones")
                for zone in zones:
                    print(f"   - {zone.get('name')} ({zone.get('postal_code')})")
            else:
                print(f"   ERROR: Status {response.status_code}")
        
        elif response.status_code == 401:
            print("   ERROR: Invalid credentials")
            print("   Try creating an admin user:")
            print("   python create_admin_quick.py admin admin@example.com yourpassword")
        else:
            print(f"   ERROR: Status {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print()
    print("=" * 60)
    print("API Test Complete!")
    print("=" * 60)
    print()
    print("If all tests passed, your API is working correctly!")
    print("You can now:")
    print("1. Start frontend: cd frontend && npm run dev")
    print("2. Login on frontend with same credentials")
    print("3. View dashboard with data")


if __name__ == "__main__":
    test_api()


