"""
Mock Data Ingestion Script

Generates realistic mock environmental data for testing purposes.
Use this when you don't have API keys or want to quickly populate the database.
"""

import random
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas

# Cities and their characteristics
CITIES = [
    {"name": "Paris", "coords": "48.8566,2.3522", "postal": "75000"},
    {"name": "Lyon", "coords": "45.7640,4.8357", "postal": "69000"},
    {"name": "Marseille", "coords": "43.2965,5.3698", "postal": "13000"},
    {"name": "Toulouse", "coords": "43.6047,1.4442", "postal": "31000"},
    {"name": "Nice", "coords": "43.7102,7.2620", "postal": "06000"},
]


def create_sources(db: Session):
    """Create mock data sources"""
    sources_data = [
        {
            "name": "Mock Air Quality Monitor",
            "url": "https://example.com/air",
            "description": "Simulated air quality monitoring stations",
            "frequency": "hourly",
            "limitations": "Mock data for testing only"
        },
        {
            "name": "Mock Energy Meter",
            "url": "https://example.com/energy",
            "description": "Simulated energy consumption meters",
            "frequency": "daily",
            "limitations": "Mock data for testing only"
        },
        {
            "name": "Mock CO2 Tracker",
            "url": "https://example.com/co2",
            "description": "Simulated CO2 emission tracking",
            "frequency": "daily",
            "limitations": "Mock data for testing only"
        }
    ]
    
    sources = []
    for source_data in sources_data:
        existing = db.query(models.Source).filter(
            models.Source.name == source_data["name"]
        ).first()
        
        if not existing:
            source = crud.create_source(db, schemas.SourceCreate(**source_data))
            print(f"✅ Created source: {source.name}")
            sources.append(source)
        else:
            sources.append(existing)
    
    return sources


def create_zones(db: Session):
    """Create zones for cities"""
    zones = []
    for city in CITIES:
        existing = db.query(models.Zone).filter(
            models.Zone.name == city["name"]
        ).first()
        
        if not existing:
            zone_data = schemas.ZoneCreate(
                name=city["name"],
                postal_code=city["postal"],
                geom=city["coords"]
            )
            zone = crud.create_zone(db, zone_data)
            print(f"✅ Created zone: {zone.name}")
            zones.append(zone)
        else:
            zones.append(existing)
    
    return zones


def generate_air_quality_data(db: Session, zones: list, source: models.Source, days: int = 30):
    """Generate mock air quality data"""
    print("\n🌫️  Generating air quality data...")
    
    parameters = ["PM2.5", "PM10", "O3", "NO2", "SO2"]
    count = 0
    
    for zone in zones:
        # Generate hourly data for the past N days
        for day in range(days):
            date = datetime.now() - timedelta(days=day)
            
            for hour in range(0, 24, 3):  # Every 3 hours
                timestamp = date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                for param in parameters:
                    # Generate realistic values based on parameter
                    if param == "PM2.5":
                        value = random.uniform(5, 50)  # µg/m³
                    elif param == "PM10":
                        value = random.uniform(10, 80)
                    elif param == "O3":
                        value = random.uniform(20, 120)
                    elif param == "NO2":
                        value = random.uniform(10, 60)
                    else:  # SO2
                        value = random.uniform(1, 20)
                    
                    indicator_data = schemas.IndicatorCreate(
                        type="air_quality",
                        value=round(value, 2),
                        unit="µg/m³",
                        timestamp=timestamp,
                        zone_id=zone.id,
                        source_id=source.id,
                        extra_data={"parameter": param}
                    )
                    
                    crud.create_indicator(db, indicator_data)
                    count += 1
    
    print(f"✅ Generated {count} air quality indicators")


def generate_energy_data(db: Session, zones: list, source: models.Source, days: int = 30):
    """Generate mock energy consumption data"""
    print("\n⚡ Generating energy consumption data...")
    
    count = 0
    
    for zone in zones:
        # Generate daily data
        for day in range(days):
            date = datetime.now() - timedelta(days=day)
            timestamp = date.replace(hour=12, minute=0, second=0, microsecond=0)
            
            # Energy consumption varies by city size
            base_consumption = {
                "Paris": 5000,
                "Lyon": 2000,
                "Marseille": 1800,
                "Toulouse": 1500,
                "Nice": 1200
            }
            
            base = base_consumption.get(zone.name, 1000)
            value = base + random.uniform(-200, 200)
            
            indicator_data = schemas.IndicatorCreate(
                type="energy",
                value=round(value, 2),
                unit="kWh",
                timestamp=timestamp,
                zone_id=zone.id,
                source_id=source.id,
                extra_data={"sector": "residential"}
            )
            
            crud.create_indicator(db, indicator_data)
            count += 1
    
    print(f"✅ Generated {count} energy consumption indicators")


def generate_co2_data(db: Session, zones: list, source: models.Source, days: int = 30):
    """Generate mock CO2 emissions data"""
    print("\n🏭 Generating CO2 emissions data...")
    
    count = 0
    
    for zone in zones:
        # Generate daily data
        for day in range(days):
            date = datetime.now() - timedelta(days=day)
            timestamp = date.replace(hour=12, minute=0, second=0, microsecond=0)
            
            # CO2 emissions vary by city
            base_emissions = {
                "Paris": 800,
                "Lyon": 400,
                "Marseille": 350,
                "Toulouse": 300,
                "Nice": 250
            }
            
            base = base_emissions.get(zone.name, 200)
            value = base + random.uniform(-50, 50)
            
            indicator_data = schemas.IndicatorCreate(
                type="co2",
                value=round(value, 2),
                unit="kg",
                timestamp=timestamp,
                zone_id=zone.id,
                source_id=source.id,
                extra_data={"source": "transport"}
            )
            
            crud.create_indicator(db, indicator_data)
            count += 1
    
    print(f"✅ Generated {count} CO2 emission indicators")


def run_ingestion(days: int = 30):
    """Main ingestion function"""
    print("🎲 Starting mock data ingestion...")
    print(f"📅 Generating {days} days of historical data\n")
    
    db = SessionLocal()
    
    try:
        # Create sources
        sources = create_sources(db)
        
        # Create zones
        zones = create_zones(db)
        
        # Generate different types of data
        generate_air_quality_data(db, zones, sources[0], days)
        generate_energy_data(db, zones, sources[1], days)
        generate_co2_data(db, zones, sources[2], days)
        
        print("\n✅ Mock data ingestion completed!")
        print(f"📊 Database populated with realistic test data for {len(zones)} cities")
    
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate mock environmental data")
    parser.add_argument("--days", type=int, default=30, help="Number of days of historical data to generate")
    args = parser.parse_args()
    
    run_ingestion(days=args.days)
