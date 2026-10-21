from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReviewCreate(BaseModel):
    history_id: str
    target_user_id: str
    rating: int  # 1 to 5
    review: str

class LendingHistoryResponse(BaseModel):
    id: str
    resource_id: str
    resource_title: str
    resource_author: Optional[str] = None
    provider_id: str
    provider_name: str
    borrower_id: str
    borrower_name: str
    action_type: str  # "borrowed_and_returned", "donated"
    start_date: datetime
    end_date: Optional[datetime] = None
    rating_for_borrower: Optional[int] = None
    review_for_borrower: Optional[str] = None
    rating_for_provider: Optional[int] = None
    review_for_provider: Optional[str] = None

    class Config:
        from_attributes = True

