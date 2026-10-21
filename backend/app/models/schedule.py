from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ScheduleCreate(BaseModel):
    request_id: str
    meetup_time: datetime
    meetup_location: str
    notes: Optional[str] = "Meet near the main reception desk"

class ScheduleUpdate(BaseModel):
    meetup_time: Optional[datetime] = None
    meetup_location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None # "proposed", "confirmed", "completed", "rescheduled"

class ScheduleResponse(BaseModel):
    id: str
    request_id: str
    resource_id: str
    resource_title: Optional[str] = None
    provider_id: str
    provider_name: Optional[str] = None
    borrower_id: str
    borrower_name: Optional[str] = None
    meetup_time: datetime
    meetup_location: str
    notes: Optional[str] = None
    status: str = "proposed" # "proposed", "confirmed", "completed", "rescheduled"
    confirmed_by_provider: bool = False
    confirmed_by_borrower: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

