from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter()


class PaginatedZoneResponse(BaseModel):
    """Response model for paginated zones"""
    items: List[schemas.ZoneResponse]
    total: int
    skip: int
    limit: int
    has_next: bool
    has_prev: bool


@router.get("/", response_model=PaginatedZoneResponse)
def read_zones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """List all zones with pagination"""
    result = crud.get_zones(db, skip=skip, limit=limit)
    return result

@router.get("/{zone_id}", response_model=schemas.ZoneResponse)
def read_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get specific zone"""
    db_zone = crud.get_zone(db, zone_id=zone_id)
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return db_zone

@router.post("/", response_model=schemas.ZoneResponse)
def create_zone(
    zone: schemas.ZoneCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new zone (admin only)"""
    return crud.create_zone(db=db, zone=zone)

@router.put("/{zone_id}", response_model=schemas.ZoneResponse)
def update_zone(
    zone_id: int,
    zone_update: schemas.ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update zone (admin only)"""
    db_zone = crud.update_zone(db, zone_id=zone_id, zone_update=zone_update)
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return db_zone

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete zone (admin only)"""
    db_zone = crud.delete_zone(db, zone_id=zone_id)
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted successfully"}
