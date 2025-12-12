"""
OpenAQ Air Quality Data Ingestion Script

Fetches air quality data from OpenAQ API v3 and stores it in the database.
API Documentation: https://docs.openaq.org/

Note: You need to sign up for a free API key at https://explore.openaq.org/
"""

import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas

# OpenAQ API Configuration
OPENAQ_API_URL = "https://api.openaq.org/v3"
OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY")  # Set this in environment variable or .env file

# French cities to monitor
FRENCH_CITIES = [
    {"name": "Paris", "coordinates": {"latitude": 48.8566, "longitude": 2.3522}},
    {"name": "Lyon", "coordinates": {"latitude": 45.7640, "longitude": 4.8357}},
    {"name": "Marseille", "coordinates": {"latitude": 43.2965, "longitude": 5.3698}},
    {"name": "Toulouse", "coordinates": {"latitude": 43.6047, "longitude": 1.4442}},
]


def get_or_create_source(db: Session) -> models.Source:
    """Get or create OpenAQ data source"""
    source = db.query(models.Source).filter(models.Source.name == "OpenAQ").first()
    
    if not source:
        source_data = schemas.SourceCreate(
            name="OpenAQ",
            url="https://openaq.org",
            description="Global air quality data from government monitoring stations",
            frequency="hourly",
            limitations="Requires API key, rate limited to 10 requests/second"
        )
        source = crud.create_source(db, source_data)
        print(f"✅ Created source: OpenAQ (ID: {source.id})")
    
    return source


def get_or_create_zone(db: Session, city: Dict) -> models.Zone:
    """Get or create zone for a city"""
    zone = db.query(models.Zone).filter(models.Zone.name == city["name"]).first()
    
    if not zone:
        zone_data = schemas.ZoneCreate(
            name=city["name"],
            postal_code=None,  # Can be added later
            geom=f'{city["coordinates"]["latitude"]},{city["coordinates"]["longitude"]}'
        )
        zone = crud.create_zone(db, zone_data)
        print(f"✅ Created zone: {city['name']} (ID: {zone.id})")
    
    return zone


def fetch_air_quality_data(latitude: float, longitude: float, radius: int = 25000) -> Optional[List[Dict]]:
    """
    Fetch air quality measurements from OpenAQ API
    
    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
        radius: Radius in meters (default 25km)
    
    Returns:
        List of measurement data or None if error
    """
    headers = {
        "X-API-Key": OPENAQ_API_KEY
    }
    
    params = {
        "coordinates": f"{latitude},{longitude}",
        "radius": radius,
        "limit": 100,
        "date_from": (datetime.now() - timedelta(days=7)).isoformat(),
        "date_to": datetime.now().isoformat()
    }
    
    try:
        response = requests.get(
            f"{OPENAQ_API_URL}/measurements",
            headers=headers,
            params=params,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data from OpenAQ: {e}")
        return None


def ingest_air_quality_data(db: Session, zone: models.Zone, source: models.Source, measurements: List[Dict]):
    """
    Ingest air quality measurements into database
    
    Args:
        db: Database session
        zone: Zone model instance
        source: Source model instance
        measurements: List of measurement dictionaries from OpenAQ
    """
    count = 0
    
    for measurement in measurements:
        try:
            # Extract measurement data
            parameter = measurement.get("parameter", {}).get("name", "unknown")
            value = measurement.get("value")
            unit = measurement.get("unit")
            timestamp_str = measurement.get("date", {}).get("utc")
            
            if not all([value, unit, timestamp_str]):
                continue
            
            # Parse timestamp
            timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            
            # Check if measurement already exists
            existing = db.query(models.Indicator).filter(
                models.Indicator.zone_id == zone.id,
                models.Indicator.source_id == source.id,
                models.Indicator.type == "air_quality",
                models.Indicator.timestamp == timestamp,
                models.Indicator.extra_data["parameter"].astext == parameter
            ).first()
            
            if existing:
                continue
            
            # Create indicator
            indicator_data = schemas.IndicatorCreate(
                type="air_quality",
                value=float(value),
                unit=unit,
                timestamp=timestamp,
                zone_id=zone.id,
                source_id=source.id,
                extra_data={
                    "parameter": parameter,
                    "location": measurement.get("location", {}).get("name"),
                    "coordinates": measurement.get("coordinates")
                }
            )
            
            crud.create_indicator(db, indicator_data)
            count += 1
        
        except Exception as e:
            print(f"⚠️  Error processing measurement: {e}")
            continue
    
    print(f"✅ Ingested {count} air quality measurements for {zone.name}")


def run_ingestion():
    """Main ingestion function"""
    print("🌍 Starting OpenAQ data ingestion...")
    
    # Check API key
    if not OPENAQ_API_KEY:
        print("⚠️  WARNING: OpenAQ API key not set!")
        print("   Get your free API key at: https://explore.openaq.org/")
        print("   Set it as environment variable: OPENAQ_API_KEY")
        print("   Or create a .env file with: OPENAQ_API_KEY=your_key_here")
        print("\n   Exiting...\n")
        return
    
    db = SessionLocal()
    
    try:
        # Get or create source
        source = get_or_create_source(db)
        
        # Process each city
        for city in FRENCH_CITIES:
            print(f"\n📍 Processing {city['name']}...")
            
            # Get or create zone
            zone = get_or_create_zone(db, city)
            
            # Fetch air quality data
            measurements = fetch_air_quality_data(
                city["coordinates"]["latitude"],
                city["coordinates"]["longitude"]
            )
            
            if measurements:
                ingest_air_quality_data(db, zone, source, measurements)
            else:
                print(f"⚠️  No data retrieved for {city['name']}")
        
        print("\n✅ OpenAQ ingestion completed!")
    
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    run_ingestion()
