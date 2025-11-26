"""
Quick script to create admin user with command-line arguments
Usage: python create_admin_quick.py <username> <email> <password>
Example: python create_admin_quick.py admin admin@example.com mypassword
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models, crud
from app.auth import get_password_hash

def create_admin_quick(username: str, email: str, password: str):
    db = SessionLocal()
    
    try:
        # Check if user already exists
        if crud.get_user_by_username(db, username):
            print(f"ERROR: Username '{username}' already exists!")
            return False
        
        if crud.get_user_by_email(db, email):
            print(f"ERROR: Email '{email}' already exists!")
            return False
        
        # Create admin
        admin = models.User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role="admin",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        print(f"SUCCESS: Admin created successfully!")
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Role: admin")
        return True
    
    except Exception as e:
        print(f"ERROR: Failed to create admin: {e}")
        db.rollback()
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin_quick.py <username> <email> <password>")
        print("Example: python create_admin_quick.py admin admin@example.com mypassword")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    create_admin_quick(username, email, password)
