from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Dict, Any

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Zone Schemas
class ZoneBase(BaseModel):
    name: str
    postal_code: Optional[str] = None
    geom: Optional[str] = None

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    postal_code: Optional[str] = None
    geom: Optional[str] = None

class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Source Schemas
class SourceBase(BaseModel):
    name: str
    url: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    limitations: Optional[str] = None

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    limitations: Optional[str] = None

class SourceResponse(SourceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Indicator Schemas
class IndicatorBase(BaseModel):
    type: str
    value: float
    unit: str
    timestamp: datetime
    extra_data: Optional[Dict[str, Any]] = None
    zone_id: int
    source_id: int

class IndicatorCreate(IndicatorBase):
    pass

class IndicatorUpdate(BaseModel):
    type: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    timestamp: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None
    zone_id: Optional[int] = None
    source_id: Optional[int] = None

class IndicatorResponse(IndicatorBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
