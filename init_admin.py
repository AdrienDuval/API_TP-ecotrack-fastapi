"""
Initialize Database with First Admin User

This script creates the first admin user for the EcoTrack system.
Run this once after setting up the database.

Usage:
    python init_admin.py
"""

import sys
import os
from getpass import getpass

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, schemas, crud
from app.auth import get_password_hash

def create_admin():
    """Create the first admin user"""
    print("=" * 60)
    print("EcoTrack - Admin User Initialization")
    print("=" * 60)
    print()
    
    db = SessionLocal()
    
    try:
        # Check if any admin exists
        existing_admin = db.query(models.User).filter(models.User.role == "admin").first()
        
        if existing_admin:
            print("WARNING: An admin user already exists!")
            print(f"   Username: {existing_admin.username}")
            print(f"   Email: {existing_admin.email}")
            print()
            response = input("Do you want to create another admin? (y/N): ")
            if response.lower() != 'y':
                print("Aborted.")
                return
        
        # Get admin details
        print("Please enter admin details:")
        print()
        
        username = input("Username: ").strip()
        if not username:
            print("ERROR: Username cannot be empty!")
            return
        
        # Check if username exists
        if crud.get_user_by_username(db, username):
            print(f"ERROR: Username '{username}' already exists!")
            return
        
        email = input("Email: ").strip()
        if not email:
            print("ERROR: Email cannot be empty!")
            return
        
        # Check if email exists
        if crud.get_user_by_email(db, email):
            print(f"ERROR: Email '{email}' already exists!")
            return
        
        password = getpass("Password: ")
        if not password:
            print("ERROR: Password cannot be empty!")
            return
        
        password_confirm = getpass("Confirm Password: ")
        if password != password_confirm:
            print("ERROR: Passwords do not match!")
            return
        
        # Create admin user
        db_user = models.User(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            role="admin",
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print()
        print("=" * 60)
        print("SUCCESS: Admin user created successfully!")
        print("=" * 60)
        print(f"Username: {db_user.username}")
        print(f"Email: {db_user.email}")
        print(f"Role: {db_user.role}")
        print()
        print("You can now log in with these credentials.")
        print("=" * 60)
    
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
