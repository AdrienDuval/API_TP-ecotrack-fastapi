# EcoTrack FastAPI - Code Review

## Executive Summary

The EcoTrack API is a well-structured FastAPI application for tracking environmental indicators. The codebase follows good practices with proper separation of concerns, JWT authentication, and role-based access control. However, there are several security, code quality, and best practice issues that should be addressed before production deployment.

**Overall Assessment**: ⚠️ **Good foundation, but needs security hardening and improvements before production**

---

## 🔴 Critical Security Issues

### 1. Hardcoded Secret Key
**Location**: `app/auth.py:13`
```python
SECRET_KEY = "your-secret-key-change-this-in-production"
```
**Issue**: Secret key is hardcoded in source code, making it vulnerable if the repository is exposed.
**Impact**: Anyone with access to the code can forge JWT tokens.
**Recommendation**: 
- Use environment variables: `SECRET_KEY = os.getenv("SECRET_KEY")`
- Generate a strong random key for production
- Never commit secrets to version control

### 2. Overly Permissive CORS
**Location**: `app/main.py:18`
```python
allow_origins=["*"]  # Configure appropriately for production
```
**Issue**: Allows requests from any origin, enabling CSRF attacks.
**Impact**: Malicious websites can make authenticated requests to your API.
**Recommendation**:
```python
allow_origins=[
    "http://localhost:5173",  # Frontend dev
    "https://yourdomain.com"  # Production
]
```

### 3. No Input Validation for Foreign Keys
**Location**: `app/routers/indicators.py:51-58`
**Issue**: Creating indicators with invalid `zone_id` or `source_id` will cause database errors.
**Impact**: Poor error messages, potential information leakage.
**Recommendation**: Validate foreign keys exist before creating indicators:
```python
@router.post("/", response_model=schemas.IndicatorResponse)
def create_indicator(
    indicator: schemas.IndicatorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    # Validate zone exists
    zone = crud.get_zone(db, indicator.zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Validate source exists
    source = crud.get_source(db, indicator.source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return crud.create_indicator(db=db, indicator=indicator)
```

### 4. No Role Validation
**Location**: `app/schemas.py:16`
**Issue**: `UserUpdate` schema allows any string for `role`, not just "user" or "admin".
**Impact**: Invalid roles can be set, breaking authorization logic.
**Recommendation**: Add validation:
```python
from pydantic import validator

class UserUpdate(BaseModel):
    # ... existing fields ...
    role: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v):
        if v is not None and v not in ["user", "admin"]:
            raise ValueError('Role must be "user" or "admin"')
        return v
```

### 5. Password Truncation Issue
**Location**: `app/auth.py:24-27`
```python
def get_password_hash(password: str) -> str:
    # Truncate to 72 bytes to avoid bcrypt error
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes.decode('utf-8'))
```
**Issue**: Silently truncates passwords longer than 72 bytes, which could lead to security issues.
**Impact**: Users might think their long password is secure, but only first 72 bytes are used.
**Recommendation**: Either reject long passwords or document the limitation clearly.

---

## 🟡 Code Quality & Best Practices

### 6. Deprecated `datetime.utcnow()`
**Location**: Multiple files (`app/models.py:16`, `app/auth.py:33`)
**Issue**: `datetime.utcnow()` is deprecated in Python 3.12+.
**Recommendation**: Use `datetime.now(timezone.utc)`:
```python
from datetime import datetime, timezone

created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
```

### 7. Missing Transaction Error Handling
**Location**: `app/crud.py` (multiple functions)
**Issue**: CRUD operations don't handle database errors (e.g., unique constraint violations).
**Impact**: Unhandled exceptions return 500 errors instead of meaningful 400/409 errors.
**Recommendation**: Add try-except blocks:
```python
def create_user(db: Session, user: schemas.UserCreate):
    try:
        hashed_password = get_password_hash(user.password)
        db_user = models.User(...)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        if "email" in str(e.orig).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        elif "username" in str(e.orig).lower():
            raise HTTPException(status_code=400, detail="Username already taken")
        raise HTTPException(status_code=400, detail="Database constraint violation")
```

### 8. No Pagination Metadata
**Location**: `app/routers/indicators.py:11-37`
**Issue**: List endpoints return arrays without pagination metadata (total count, page info).
**Impact**: Frontend can't implement proper pagination.
**Recommendation**: Return paginated response:
```python
class PaginatedResponse(BaseModel):
    items: List[schemas.IndicatorResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool
```

### 9. Missing Logging
**Issue**: No logging for security events (login attempts, admin actions, errors).
**Impact**: Difficult to debug issues and detect security breaches.
**Recommendation**: Add structured logging:
```python
import logging
logger = logging.getLogger(__name__)

@router.post("/login")
def login(...):
    logger.info(f"Login attempt for username: {form_data.username}")
    # ... login logic ...
    logger.info(f"Successful login for user: {user.username}")
```

### 10. No Rate Limiting
**Issue**: No protection against brute force attacks on login/register endpoints.
**Impact**: Attackers can attempt unlimited login attempts.
**Recommendation**: Implement rate limiting using `slowapi` or similar:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
def login(...):
    # ...
```

### 11. SQLite for Production
**Location**: `app/database.py:5`
**Issue**: SQLite is not suitable for production (concurrency, scalability).
**Impact**: Performance issues under load, data corruption risk.
**Recommendation**: Use PostgreSQL for production:
```python
import os
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./ecotrack.db"  # Default for dev
)
```

### 12. Missing Environment Variable Management
**Issue**: No `.env` file or environment variable configuration.
**Impact**: Hard to manage different configurations for dev/staging/prod.
**Recommendation**: Use `python-dotenv`:
```python
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecotrack.db")
```

### 13. No Input Sanitization
**Issue**: User inputs (especially in `extra_data` JSON) are not sanitized.
**Impact**: Potential for injection attacks or data corruption.
**Recommendation**: Validate and sanitize JSON inputs, especially in `extra_data`.

### 14. Missing Response Models for Some Endpoints
**Location**: `app/routers/stats.py`
**Issue**: Stats endpoints return dictionaries without proper response models.
**Impact**: No API documentation, no type validation.
**Recommendation**: Create Pydantic models for responses:
```python
class AirQualityAveragesResponse(BaseModel):
    labels: List[str]
    series: List[float]
```

---

## 🟢 Minor Issues & Improvements

### 15. Inconsistent Error Messages
**Issue**: Some endpoints return different error formats.
**Recommendation**: Standardize error responses.

### 16. Missing API Versioning
**Issue**: No version prefix in API routes (e.g., `/api/v1/`).
**Recommendation**: Add versioning for future API changes.

### 17. No Health Check Endpoint
**Issue**: No `/health` endpoint for monitoring.
**Recommendation**: Add:
```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
```

### 18. Missing Tests
**Issue**: `tests/` directory exists but is empty.
**Impact**: No confidence in code correctness, regression risk.
**Recommendation**: Add unit and integration tests using `pytest`.

### 19. No Database Migrations
**Issue**: Using `Base.metadata.create_all()` instead of Alembic migrations.
**Impact**: Can't track schema changes, difficult to deploy updates.
**Recommendation**: Use Alembic for database migrations.

### 20. Missing Documentation
**Issue**: Some endpoints lack detailed docstrings.
**Recommendation**: Add comprehensive docstrings with examples.

---

## ✅ Positive Aspects

1. **Good Project Structure**: Clear separation of routers, models, schemas, and CRUD operations
2. **Proper Authentication**: JWT-based auth with role-based access control
3. **Type Hints**: Good use of type hints throughout
4. **Pydantic Schemas**: Proper validation using Pydantic
5. **SQLAlchemy 2.0**: Using modern SQLAlchemy with `Mapped` annotations
6. **Clear README**: Well-documented setup and usage instructions
7. **Frontend Integration**: React frontend with proper authentication context

---

## 📋 Priority Action Items

### High Priority (Before Production)
1. ✅ Move `SECRET_KEY` to environment variables
2. ✅ Restrict CORS origins
3. ✅ Add foreign key validation
4. ✅ Add role validation
5. ✅ Implement proper error handling in CRUD operations
6. ✅ Replace SQLite with PostgreSQL for production
7. ✅ Add logging for security events

### Medium Priority
8. ✅ Fix deprecated `datetime.utcnow()`
9. ✅ Add pagination metadata
10. ✅ Implement rate limiting
11. ✅ Add database migrations (Alembic)
12. ✅ Add health check endpoint

### Low Priority
13. ✅ Add comprehensive tests
14. ✅ Improve API documentation
15. ✅ Add API versioning
16. ✅ Standardize error responses

---

## 🔧 Quick Fixes

### Fix 1: Environment Variables
Create `.env` file:
```
SECRET_KEY=your-super-secret-key-here-change-this
DATABASE_URL=sqlite:///./ecotrack.db
CORS_ORIGINS=http://localhost:5173
```

Update `app/auth.py`:
```python
import os
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
```

### Fix 2: CORS Configuration
Update `app/main.py`:
```python
import os
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Fix 3: Foreign Key Validation
Add validation in `app/routers/indicators.py` (see recommendation #3 above).

---

## 📚 Additional Resources

- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)

---

**Review Date**: 2024
**Reviewed By**: AI Code Review Assistant
