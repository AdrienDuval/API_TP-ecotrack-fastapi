from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter()


class PaginatedIndicatorResponse(BaseModel):
    """Response model for paginated indicators"""
    items: List[schemas.IndicatorResponse]
    total: int
    skip: int
    limit: int
    has_next: bool
    has_prev: bool


@router.get("/", response_model=PaginatedIndicatorResponse)
def read_indicators(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    zone_id: Optional[int] = None,
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    sort_by: Optional[str] = Query("timestamp", description="Sort by field: timestamp, value, type, created_at"),
    order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    List indicators with optional filters and pagination:
    - type: filter by indicator type
    - zone_id: filter by zone
    - from/to: filter by date range
    - sort_by: sort by field (timestamp, value, type, created_at)
    - order: sort order (asc, desc)
    - skip/limit: pagination
    """
    result = crud.get_indicators(
        db,
        skip=skip,
        limit=limit,
        type=type,
        zone_id=zone_id,
        from_date=from_date,
        to_date=to_date,
        sort_by=sort_by,
        order=order
    )
    return result

@router.get("/{indicator_id}", response_model=schemas.IndicatorResponse)
def read_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get specific indicator"""
    db_indicator = crud.get_indicator(db, indicator_id=indicator_id)
    if db_indicator is None:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return db_indicator

@router.post("/", response_model=schemas.IndicatorResponse)
def create_indicator(
    indicator: schemas.IndicatorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new indicator (admin only)"""
    return crud.create_indicator(db=db, indicator=indicator)

@router.put("/{indicator_id}", response_model=schemas.IndicatorResponse)
def update_indicator(
    indicator_id: int,
    indicator_update: schemas.IndicatorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update indicator (admin only)"""
    db_indicator = crud.update_indicator(db, indicator_id=indicator_id, indicator_update=indicator_update)
    if db_indicator is None:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return db_indicator

@router.delete("/{indicator_id}")
def delete_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete indicator (admin only)"""
    db_indicator = crud.delete_indicator(db, indicator_id=indicator_id)
    if db_indicator is None:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return {"message": "Indicator deleted successfully"}
