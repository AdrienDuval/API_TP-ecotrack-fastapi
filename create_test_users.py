"""
Create Test Users in Database

Creates:
- Admin user: admin / admin123
- Regular user: testuser / test123
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

def create_test_users():
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("Creating Test Users")
        print("=" * 60)
        print()
        
        # Check if users already exist
        existing_admin = db.query(models.User).filter(models.User.username == "admin").first()
        existing_user = db.query(models.User).filter(models.User.username == "testuser").first()
        
        # Create Admin
        if existing_admin:
            print("⚠️  Admin user already exists")
            print(f"   Username: {existing_admin.username}")
            print(f"   Email: {existing_admin.email}")
            print(f"   Role: {existing_admin.role}")
        else:
            admin = models.User(
                username="admin",
                email="admin@ecotrack.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Admin user created!")
            print(f"   Username: admin")
            print(f"   Password: admin123")
            print(f"   Email: admin@ecotrack.com")
            print(f"   Role: admin")
        
        print()
        
        # Create Regular User
        if existing_user:
            print("⚠️  Test user already exists")
            print(f"   Username: {existing_user.username}")
            print(f"   Email: {existing_user.email}")
            print(f"   Role: {existing_user.role}")
        else:
            user = models.User(
                username="testuser",
                email="test@ecotrack.com",
                hashed_password=get_password_hash("test123"),
                role="user",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("✅ Regular user created!")
            print(f"   Username: testuser")
            print(f"   Password: test123")
            print(f"   Email: test@ecotrack.com")
            print(f"   Role: user")
        
        print()
        print("=" * 60)
        print("Summary")
        print("=" * 60)
        print()
        print("You can now login with:")
        print()
        print("🔑 Admin Account:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Access: Full admin privileges")
        print()
        print("👤 Regular User Account:")
        print("   Username: testuser")
        print("   Password: test123")
        print("   Access: Read-only (no admin features)")
        print()
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()
