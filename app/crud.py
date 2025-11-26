from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from typing import List, Optional
from app import models, schemas
from app.auth import get_password_hash

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Zone CRUD
def get_zone(db: Session, zone_id: int):
    return db.query(models.Zone).filter(models.Zone.id == zone_id).first()

def get_zones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Zone).offset(skip).limit(limit).all()

def create_zone(db: Session, zone: schemas.ZoneCreate):
    db_zone = models.Zone(**zone.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

def update_zone(db: Session, zone_id: int, zone_update: schemas.ZoneUpdate):
    db_zone = get_zone(db, zone_id)
    if db_zone:
        update_data = zone_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_zone, key, value)
        db.commit()
        db.refresh(db_zone)
    return db_zone

def delete_zone(db: Session, zone_id: int):
    db_zone = get_zone(db, zone_id)
    if db_zone:
        db.delete(db_zone)
        db.commit()
    return db_zone

# Source CRUD
def get_source(db: Session, source_id: int):
    return db.query(models.Source).filter(models.Source.id == source_id).first()

def get_sources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Source).offset(skip).limit(limit).all()

def create_source(db: Session, source: schemas.SourceCreate):
    db_source = models.Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

def update_source(db: Session, source_id: int, source_update: schemas.SourceUpdate):
    db_source = get_source(db, source_id)
    if db_source:
        update_data = source_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_source, key, value)
        db.commit()
        db.refresh(db_source)
    return db_source

def delete_source(db: Session, source_id: int):
    db_source = get_source(db, source_id)
    if db_source:
        db.delete(db_source)
        db.commit()
    return db_source

# Indicator CRUD
def get_indicator(db: Session, indicator_id: int):
    return db.query(models.Indicator).filter(models.Indicator.id == indicator_id).first()

def get_indicators(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    zone_id: Optional[int] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None
):
    query = db.query(models.Indicator)
    
    if type:
        query = query.filter(models.Indicator.type == type)
    if zone_id:
        query = query.filter(models.Indicator.zone_id == zone_id)
    if from_date:
        query = query.filter(models.Indicator.timestamp >= from_date)
    if to_date:
        query = query.filter(models.Indicator.timestamp <= to_date)
    
    return query.offset(skip).limit(limit).all()

def create_indicator(db: Session, indicator: schemas.IndicatorCreate):
    db_indicator = models.Indicator(**indicator.model_dump())
    db.add(db_indicator)
    db.commit()
    db.refresh(db_indicator)
    return db_indicator

def update_indicator(db: Session, indicator_id: int, indicator_update: schemas.IndicatorUpdate):
    db_indicator = get_indicator(db, indicator_id)
    if db_indicator:
        update_data = indicator_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_indicator, key, value)
        db.commit()
        db.refresh(db_indicator)
    return db_indicator

def delete_indicator(db: Session, indicator_id: int):
    db_indicator = get_indicator(db, indicator_id)
    if db_indicator:
        db.delete(db_indicator)
        db.commit()
    return db_indicator
