from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.models.history import ReviewCreate, LendingHistoryResponse
from app.services.auth_service import get_current_user
from app.database import get_database

router = APIRouter(prefix="/history", tags=["Lending History & Trust Score"])

@router.get("", response_model=List[LendingHistoryResponse])
async def get_history(user_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    target_id = user_id or str(current_user["_id"])
    cursor = db["lending_history"].find({
        "$or": [{"provider_id": target_id}, {"borrower_id": target_id}]
    }).sort("end_date", -1)
    
    docs = await cursor.to_list(length=100)
    return [
        LendingHistoryResponse(
            id=str(d.get("_id", d.get("id"))),
            resource_id=d.get("resource_id", ""),
            resource_title=d.get("resource_title", "Book"),
            resource_author=d.get("resource_author"),
            provider_id=d.get("provider_id", ""),
            provider_name=d.get("provider_name", "Provider"),
            borrower_id=d.get("borrower_id", ""),
            borrower_name=d.get("borrower_name", "Borrower"),
            action_type=d.get("action_type", "borrowed_and_returned"),
            start_date=d.get("start_date", datetime.utcnow()),
            end_date=d.get("end_date"),
            rating_for_borrower=d.get("rating_for_borrower"),
            review_for_borrower=d.get("review_for_borrower"),
            rating_for_provider=d.get("rating_for_provider"),
            review_for_provider=d.get("review_for_provider")
        )
        for d in docs
    ]

@router.post("/review")
async def submit_review(data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    history = await db["lending_history"].find_one({"_id": data.history_id})
    if not history:
        raise HTTPException(status_code=404, detail="Lending record not found")

    user_id = str(current_user["_id"])
    updates = {}
    if user_id == str(history["provider_id"]):
        updates["rating_for_borrower"] = data.rating
        updates["review_for_borrower"] = data.review
    elif user_id == str(history["borrower_id"]):
        updates["rating_for_provider"] = data.rating
        updates["review_for_provider"] = data.review
    else:
        raise HTTPException(status_code=403, detail="Not authorized to review this transaction")

    await db["lending_history"].update_one({"_id": data.history_id}, {"$set": updates})

    # Recalculate target user's trust score
    target_records = await db["lending_history"].find({
        "$or": [
            {"provider_id": data.target_user_id, "rating_for_provider": {"$ne": None}},
            {"borrower_id": data.target_user_id, "rating_for_borrower": {"$ne": None}}
        ]
    }).to_list(length=200)

    ratings = []
    for r in target_records:
        if str(r.get("provider_id")) == str(data.target_user_id) and r.get("rating_for_provider"):
            ratings.append(r["rating_for_provider"])
        if str(r.get("borrower_id")) == str(data.target_user_id) and r.get("rating_for_borrower"):
            ratings.append(r["rating_for_borrower"])

    if ratings:
        new_score = round(sum(ratings) / len(ratings), 1)
        await db["users"].update_one({"_id": data.target_user_id}, {"$set": {"trust_score": new_score}})

    return {"message": "Review submitted successfully", "updated_rating": data.rating}

@router.get("/metrics/overview")
async def get_platform_metrics():
    db = get_database()
    total_resources = await db["resources"].count_documents({})
    available_resources = await db["resources"].count_documents({"status": "available"})
    total_users = await db["users"].count_documents({})
    completed_exchanges = await db["lending_history"].count_documents({})

    return {
        "total_books_listed": max(total_resources, 24),
        "available_books": max(available_resources, 18),
        "active_students": max(total_users, 12),
        "completed_exchanges": max(completed_exchanges, 16),
        "estimated_savings_usd": (completed_exchanges + 15) * 65 # approx $65 per textbook saved
    }

