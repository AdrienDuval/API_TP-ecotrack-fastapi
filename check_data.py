"""
Quick script to check if data exists in the database
Run this after ingestion to verify data was loaded correctly
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

def check_database():
    """Check what data is in the database"""
    print("=" * 60)
    print("Database Data Check")
    print("=" * 60)
    print()
    
    db = SessionLocal()
    
    try:
        # Count indicators
        indicator_count = db.query(models.Indicator).count()
        print(f"Indicators: {indicator_count}")
        
        if indicator_count > 0:
            # Count by type
            from sqlalchemy import func
            type_counts = db.query(
                models.Indicator.type,
                func.count(models.Indicator.id).label('count')
            ).group_by(models.Indicator.type).all()
            
            print("\n   Breakdown by type:")
            for type_name, count in type_counts:
                print(f"   - {type_name}: {count}")
            
            # Show sample
            sample = db.query(models.Indicator).limit(3).all()
            print("\n   Sample indicators:")
            for ind in sample:
                zone = db.query(models.Zone).filter(models.Zone.id == ind.zone_id).first()
                zone_name = zone.name if zone else f"Zone {ind.zone_id}"
                print(f"   - {ind.type}: {ind.value} {ind.unit} in {zone_name} at {ind.timestamp}")
        else:
            print("   WARNING: No indicators found! Run ingestion script.")
        
        print()
        
        # Count zones
        zone_count = db.query(models.Zone).count()
        print(f"Zones: {zone_count}")
        
        if zone_count > 0:
            zones = db.query(models.Zone).all()
            print("   Zones in database:")
            for zone in zones:
                zone_indicators = db.query(models.Indicator).filter(
                    models.Indicator.zone_id == zone.id
                ).count()
                print(f"   - {zone.name} ({zone.postal_code or 'N/A'}): {zone_indicators} indicators")
        else:
            print("   WARNING: No zones found! Run ingestion script.")
        
        print()
        
        # Count sources
        source_count = db.query(models.Source).count()
        print(f"Sources: {source_count}")
        
        if source_count > 0:
            sources = db.query(models.Source).all()
            print("   Sources in database:")
            for source in sources:
                source_indicators = db.query(models.Indicator).filter(
                    models.Indicator.source_id == source.id
                ).count()
                print(f"   - {source.name}: {source_indicators} indicators")
        else:
            print("   WARNING: No sources found! Run ingestion script.")
        
        print()
        
        # Count users
        user_count = db.query(models.User).count()
        print(f"Users: {user_count}")
        
        if user_count > 0:
            admins = db.query(models.User).filter(models.User.role == "admin").count()
            regular = db.query(models.User).filter(models.User.role == "user").count()
            print(f"   - Admins: {admins}")
            print(f"   - Regular users: {regular}")
        
        print()
        print("=" * 60)
        
        # Summary
        if indicator_count > 0:
            print("SUCCESS: Database has data! You can now:")
            print("   1. Start FastAPI server: python -m uvicorn app.main:app --reload")
            print("   2. Test API: http://localhost:8000/docs")
            print("   3. Start frontend: cd frontend && npm run dev")
            print("   4. View dashboard with data!")
        else:
            print("WARNING: Database is empty!")
            print("   Run: python ingestion/mock_data_ingestion.py --days 30")
        
        print("=" * 60)
    
    except Exception as e:
        print(f"ERROR: Error checking database: {e}")
        print("   Make sure the database file exists and tables are created.")
        print("   Start the FastAPI server once to create tables.")
    
    finally:
        db.close()


if __name__ == "__main__":
    check_database()
