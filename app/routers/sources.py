from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[schemas.SourceResponse])
def read_sources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """List all sources"""
    sources = crud.get_sources(db, skip=skip, limit=limit)
    return sources

@router.get("/{source_id}", response_model=schemas.SourceResponse)
def read_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get specific source"""
    db_source = crud.get_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source

@router.post("/", response_model=schemas.SourceResponse)
def create_source(
    source: schemas.SourceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new source (admin only)"""
    return crud.create_source(db=db, source=source)

@router.put("/{source_id}", response_model=schemas.SourceResponse)
def update_source(
    source_id: int,
    source_update: schemas.SourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update source (admin only)"""
    db_source = crud.update_source(db, source_id=source_id, source_update=source_update)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source

@router.delete("/{source_id}")
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete source (admin only)"""
    db_source = crud.delete_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source deleted successfully"}

