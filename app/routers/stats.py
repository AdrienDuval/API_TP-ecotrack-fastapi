from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.database import get_db
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/air/averages")
def get_air_quality_averages(
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    zone_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get average air quality indicators"""
    query = db.query(
        models.Zone.name.label("zone"),
        func.avg(models.Indicator.value).label("average")
    ).join(models.Indicator).filter(
        models.Indicator.type == "air_quality"
    )
    
    if from_date:
        query = query.filter(models.Indicator.timestamp >= from_date)
    if to_date:
        query = query.filter(models.Indicator.timestamp <= to_date)
    if zone_id:
        query = query.filter(models.Indicator.zone_id == zone_id)
    
    results = query.group_by(models.Zone.name).all()
    
    return {
        "labels": [r.zone for r in results],
        "series": [float(r.average) for r in results]
    }

@router.get("/co2/trend")
def get_co2_trend(
    zone_id: Optional[int] = None,
    period: str = "monthly",  # daily, weekly, monthly
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get CO2 emission trends"""
    # Group by period
    if period == "daily":
        time_group = func.date(models.Indicator.timestamp)
    elif period == "weekly":
        time_group = func.strftime('%Y-%W', models.Indicator.timestamp)
    else:  # monthly
        time_group = func.strftime('%Y-%m', models.Indicator.timestamp)
    
    query = db.query(
        time_group.label("period"),
        func.sum(models.Indicator.value).label("total")
    ).filter(
        models.Indicator.type == "co2"
    )
    
    if zone_id:
        query = query.filter(models.Indicator.zone_id == zone_id)
    
    results = query.group_by(time_group).order_by(time_group).all()
    
    return {
        "labels": [r.period for r in results],
        "series": [float(r.total) for r in results]
    }

@router.get("/summary")
def get_summary_stats(
    zone_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get summary statistics for all indicator types"""
    query = db.query(
        models.Indicator.type,
        func.count(models.Indicator.id).label("count"),
        func.avg(models.Indicator.value).label("average"),
        func.min(models.Indicator.value).label("min"),
        func.max(models.Indicator.value).label("max")
    )
    
    if zone_id:
        query = query.filter(models.Indicator.zone_id == zone_id)
    
    results = query.group_by(models.Indicator.type).all()
    
    return [
        {
            "type": r.type,
            "count": r.count,
            "average": float(r.average),
            "min": float(r.min),
            "max": float(r.max)
        }
        for r in results
    ]
