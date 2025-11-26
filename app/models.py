from sqlalchemy import String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base
from datetime import datetime
from typing import Optional, List

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="user")  # "user" or "admin"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Zone(Base):
    __tablename__ = "zones"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    geom: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Can store GeoJSON or coordinates
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    indicators: Mapped[List["Indicator"]] = relationship(back_populates="zone")

class Source(Base):
    __tablename__ = "sources"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # e.g., "daily", "hourly"
    limitations: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    indicators: Mapped[List["Indicator"]] = relationship(back_populates="source")

class Indicator(Base):
    __tablename__ = "indicators"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, index=True)  # e.g., "air_quality", "co2", "energy"
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)  # e.g., "µg/m³", "kg", "kWh"
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # Additional data as JSON
    
    # Foreign keys
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id"))
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id"))
    
    # Relationships
    zone: Mapped["Zone"] = relationship(back_populates="indicators")
    source: Mapped["Source"] = relationship(back_populates="indicators")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
