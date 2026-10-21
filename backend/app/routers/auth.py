import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserLogin, UserResponse, UserProfileUpdate, Token
from app.services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user
from app.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    db = get_database()
    existing_user = await db["users"].find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Detect .edu or academic email automatically
    is_edu = user_data.email.lower().endswith(".edu") or "ac." in user_data.email.lower() or "edu." in user_data.email.lower()

    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    user_doc = {
        "_id": user_id,
        "email": user_data.email.lower(),
        "full_name": user_data.full_name,
        "password_hash": get_password_hash(user_data.password),
        "is_edu_verified": is_edu,
        "institution": user_data.institution or ("University Campus" if is_edu else "Community Member"),
        "location": user_data.location or "Main Campus",
        "academic_interests": user_data.academic_interests or [],
        "avatar_url": user_data.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.full_name}",
        "bio": user_data.bio or "",
        "trust_score": 5.0,
        "total_exchanges": 0,
        "created_at": now
    }
    await db["users"].insert_one(user_doc)

    user_response = UserResponse(
        id=user_id,
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        is_edu_verified=user_doc["is_edu_verified"],
        institution=user_doc["institution"],
        location=user_doc["location"],
        academic_interests=user_doc["academic_interests"],
        avatar_url=user_doc["avatar_url"],
        bio=user_doc["bio"],
        trust_score=user_doc["trust_score"],
        total_exchanges=user_doc["total_exchanges"],
        created_at=user_doc["created_at"]
    )

    access_token = create_access_token(data={"sub": user_id, "email": user_doc["email"]})
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    user = await db["users"].find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user["_id"])
    user_response = UserResponse(
        id=user_id,
        email=user["email"],
        full_name=user["full_name"],
        is_edu_verified=user.get("is_edu_verified", False),
        institution=user.get("institution", "Campus"),
        location=user.get("location", "Main Campus"),
        academic_interests=user.get("academic_interests", []),
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio", ""),
        trust_score=user.get("trust_score", 5.0),
        total_exchanges=user.get("total_exchanges", 0),
        created_at=user.get("created_at", datetime.utcnow())
    )

    access_token = create_access_token(data={"sub": user_id, "email": user["email"]})
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_edu_verified=current_user.get("is_edu_verified", False),
        institution=current_user.get("institution", "Campus"),
        location=current_user.get("location", "Main Campus"),
        academic_interests=current_user.get("academic_interests", []),
        avatar_url=current_user.get("avatar_url"),
        bio=current_user.get("bio", ""),
        trust_score=current_user.get("trust_score", 5.0),
        total_exchanges=current_user.get("total_exchanges", 0),
        created_at=current_user.get("created_at", datetime.utcnow())
    )

@router.put("/me", response_model=UserResponse)
async def update_profile(updates: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
    
    if update_data:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$set": update_data})
        current_user.update(update_data)

    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_edu_verified=current_user.get("is_edu_verified", False),
        institution=current_user.get("institution", "Campus"),
        location=current_user.get("location", "Main Campus"),
        academic_interests=current_user.get("academic_interests", []),
        avatar_url=current_user.get("avatar_url"),
        bio=current_user.get("bio", ""),
        trust_score=current_user.get("trust_score", 5.0),
        total_exchanges=current_user.get("total_exchanges", 0),
        created_at=current_user.get("created_at", datetime.utcnow())
    )

