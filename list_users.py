"""Check users in database"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models

db = SessionLocal()

users = db.query(models.User).all()

print("\n" + "=" * 60)
print("Users in Database")
print("=" * 60)
print()

if not users:
    print("No users found in database")
else:
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print(f"Created: {user.created_at}")
        print("-" * 60)

print()
print(f"Total users: {len(users)}")
print("=" * 60)

db.close()
