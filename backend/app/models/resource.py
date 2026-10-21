from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ResourceBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    subject: str = "General"  # e.g., "Computer Science", "Mathematics", "Biology", "Literature", "Physics", "Economics"
    format: str = "textbook"  # "textbook", "paperback", "hardcover", "notes_kit", "other"
    condition: str = "good"   # "new", "like_new", "good", "fair", "poor"
    listing_type: str = "lend" # "lend", "donate"
    description: Optional[str] = ""
    cover_image_url: Optional[str] = None
    pickup_location: str = "Main Library"
    max_borrow_days: int = 30

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    subject: Optional[str] = None
    format: Optional[str] = None
    condition: Optional[str] = None
    listing_type: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    pickup_location: Optional[str] = None
    max_borrow_days: Optional[int] = None
    status: Optional[str] = None # "available", "pending", "checked_out", "donated"

class ResourceResponse(ResourceBase):
    id: str
    provider_id: str
    provider_name: Optional[str] = None
    provider_trust_score: Optional[float] = 5.0
    provider_institution: Optional[str] = None
    is_edu_verified: Optional[bool] = False
    status: str = "available" # "available", "pending", "checked_out", "donated"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

