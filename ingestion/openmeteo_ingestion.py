"""
Open-Meteo Weather Data Ingestion Script

Fetches historical weather data from Open-Meteo API and stores it in the database.
API Documentation: https://open-meteo.com/en/docs

Note: No API key required! Completely free for non-commercial use.
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

# Open-Meteo API Configuration
OPENMETEO_API_URL = "https://api.open-meteo.com/v1/forecast"
OPENMETEO_HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"

# French cities to monitor (same as OpenAQ)
FRENCH_CITIES = [
    {"name": "Paris", "latitude": 48.8566, "longitude": 2.3522},
    {"name": "Lyon", "latitude": 45.7640, "longitude": 4.8357},
    {"name": "Marseille", "latitude": 43.2965, "longitude": 5.3698},
    {"name": "Toulouse", "latitude": 43.6047, "longitude": 1.4442},
]


def get_or_create_source(db: Session) -> models.Source:
    """Get or create Open-Meteo data source"""
    source = db.query(models.Source).filter(models.Source.name == "Open-Meteo").first()
    
    if not source:
        source_data = schemas.SourceCreate(
            name="Open-Meteo",
            url="https://open-meteo.com",
            description="Free weather API with historical data from 1940 onwards",
            frequency="hourly",
            limitations="No API key required, fair use policy applies"
        )
        source = crud.create_source(db, source_data)
        print(f"✅ Created source: Open-Meteo (ID: {source.id})")
    
    return source


def get_or_create_zone(db: Session, city: Dict) -> models.Zone:
    """Get or create zone for a city"""
    zone = db.query(models.Zone).filter(models.Zone.name == city["name"]).first()
    
    if not zone:
        zone_data = schemas.ZoneCreate(
            name=city["name"],
            postal_code=None,
            geom=f'{city["latitude"]},{city["longitude"]}'
        )
        zone = crud.create_zone(db, zone_data)
        print(f"✅ Created zone: {city['name']} (ID: {zone.id})")
    
    return zone


def fetch_weather_data(latitude: float, longitude: float, days_back: int = 7) -> Optional[Dict]:
    """
    Fetch historical weather data from Open-Meteo API
    
    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
        days_back: Number of days of historical data to fetch
    
    Returns:
        Weather data dictionary or None if error
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days_back)
    
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "hourly": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
        "timezone": "Europe/Paris"
    }
    
    try:
        response = requests.get(
            OPENMETEO_HISTORICAL_URL,
            params=params,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data from Open-Meteo: {e}")
        return None


def ingest_weather_data(db: Session, zone: models.Zone, source: models.Source, weather_data: Dict):
    """
    Ingest weather data into database
    
    Args:
        db: Database session
        zone: Zone model instance
        source: Source model instance
        weather_data: Weather data dictionary from Open-Meteo
    """
    hourly = weather_data.get("hourly", {})
    times = hourly.get("time", [])
    temperatures = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    precipitation = hourly.get("precipitation", [])
    wind_speed = hourly.get("wind_speed_10m", [])
    
    count = 0
    
    for i, time_str in enumerate(times):
        try:
            timestamp = datetime.fromisoformat(time_str)
            
            # Temperature indicator
            if i < len(temperatures) and temperatures[i] is not None:
                temp_data = schemas.IndicatorCreate(
                    type="temperature",
                    value=float(temperatures[i]),
                    unit="°C",
                    timestamp=timestamp,
                    zone_id=zone.id,
                    source_id=source.id,
                    extra_data={"parameter": "temperature_2m"}
                )
                
                # Check if exists
                existing = db.query(models.Indicator).filter(
                    models.Indicator.zone_id == zone.id,
                    models.Indicator.source_id == source.id,
                    models.Indicator.type == "temperature",
                    models.Indicator.timestamp == timestamp
                ).first()
                
                if not existing:
                    crud.create_indicator(db, temp_data)
                    count += 1
            
            # Precipitation indicator (can be used as water consumption proxy)
            if i < len(precipitation) and precipitation[i] is not None and precipitation[i] > 0:
                precip_data = schemas.IndicatorCreate(
                    type="precipitation",
                    value=float(precipitation[i]),
                    unit="mm",
                    timestamp=timestamp,
                    zone_id=zone.id,
                    source_id=source.id,
                    extra_data={"parameter": "precipitation"}
                )
                
                existing = db.query(models.Indicator).filter(
                    models.Indicator.zone_id == zone.id,
                    models.Indicator.source_id == source.id,
                    models.Indicator.type == "precipitation",
                    models.Indicator.timestamp == timestamp
                ).first()
                
                if not existing:
                    crud.create_indicator(db, precip_data)
                    count += 1
        
        except Exception as e:
            print(f"⚠️  Error processing weather data: {e}")
            continue
    
    print(f"✅ Ingested {count} weather indicators for {zone.name}")


def run_ingestion():
    """Main ingestion function"""
    print("🌤️  Starting Open-Meteo data ingestion...")
    
    db = SessionLocal()
    
    try:
        # Get or create source
        source = get_or_create_source(db)
        
        # Process each city
        for city in FRENCH_CITIES:
            print(f"\n📍 Processing {city['name']}...")
            
            # Get or create zone
            zone = get_or_create_zone(db, city)
            
            # Fetch weather data
            weather_data = fetch_weather_data(
                city["latitude"],
                city["longitude"],
                days_back=7
            )
            
            if weather_data:
                ingest_weather_data(db, zone, source, weather_data)
            else:
                print(f"⚠️  No data retrieved for {city['name']}")
        
        print("\n✅ Open-Meteo ingestion completed!")
    
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    run_ingestion()
