from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ResourceRequestCreate(BaseModel):
    resource_id: str
    request_type: str = "lend" # "lend" or "donate"
    needed_duration_days: int = 14
    purpose_note: Optional[str] = "Needed for semester course studies"
    proposed_meetup_location: Optional[str] = "Campus Central Library"

class ResourceRequestResponse(BaseModel):
    id: str
    resource_id: str
    resource_title: Optional[str] = None
    resource_author: Optional[str] = None
    resource_cover: Optional[str] = None
    provider_id: str
    provider_name: Optional[str] = None
    borrower_id: str
    borrower_name: Optional[str] = None
    borrower_trust_score: Optional[float] = 5.0
    borrower_institution: Optional[str] = None
    status: str = "pending" # "pending", "approved", "rejected", "scheduled", "active", "completed", "cancelled"
    request_type: str = "lend"
    needed_duration_days: int = 14
    purpose_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

