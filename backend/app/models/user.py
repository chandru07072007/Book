from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    institution: Optional[str] = "State University"
    location: Optional[str] = "Main Campus"
    academic_interests: List[str] = Field(default_factory=list)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    academic_interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_edu_verified: bool = False
    trust_score: float = 5.0
    total_exchanges: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

