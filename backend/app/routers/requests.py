import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.request import ResourceRequestCreate, ResourceRequestResponse
from app.services.auth_service import get_current_user
from app.database import get_database

router = APIRouter(prefix="/requests", tags=["Borrower Requests"])

@router.post("", response_model=ResourceRequestResponse)
async def create_request(data: ResourceRequestCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    resource = await db["resources"].find_one({"_id": data.resource_id})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if str(resource["provider_id"]) == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="You cannot request your own resource")

    if resource.get("status") not in ["available"]:
        raise HTTPException(status_code=400, detail=f"This resource is currently {resource.get('status')}")

    req_id = f"req_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()

    doc = {
        "_id": req_id,
        "resource_id": data.resource_id,
        "resource_title": resource.get("title"),
        "resource_author": resource.get("author"),
        "resource_cover": resource.get("cover_image_url"),
        "provider_id": str(resource["provider_id"]),
        "provider_name": resource.get("provider_name"),
        "borrower_id": str(current_user["_id"]),
        "borrower_name": current_user.get("full_name"),
        "borrower_trust_score": current_user.get("trust_score", 5.0),
        "borrower_institution": current_user.get("institution", "Campus"),
        "status": "pending",
        "request_type": data.request_type,
        "needed_duration_days": data.needed_duration_days,
        "purpose_note": data.purpose_note,
        "created_at": now,
        "updated_at": now
    }

    await db["requests"].insert_one(doc)

    return ResourceRequestResponse(
        id=req_id,
        **{k: v for k, v in doc.items() if k not in ["_id"]}
    )

@router.get("/incoming", response_model=List[ResourceRequestResponse])
async def get_incoming_requests(current_user: dict = Depends(get_current_user)):
    """Requests sent to the current user as a resource provider."""
    db = get_database()
    cursor = db["requests"].find({"provider_id": str(current_user["_id"])}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [
        ResourceRequestResponse(
            id=str(d.get("_id", d.get("id"))),
            **{k: v for k, v in d.items() if k not in ["_id", "id"]}
        )
        for d in docs
    ]

@router.get("/outgoing", response_model=List[ResourceRequestResponse])
async def get_outgoing_requests(current_user: dict = Depends(get_current_user)):
    """Requests made by the current user as a borrower."""
    db = get_database()
    cursor = db["requests"].find({"borrower_id": str(current_user["_id"])}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [
        ResourceRequestResponse(
            id=str(d.get("_id", d.get("id"))),
            **{k: v for k, v in d.items() if k not in ["_id", "id"]}
        )
        for d in docs
    ]

@router.put("/{request_id}/approve", response_model=ResourceRequestResponse)
async def approve_request(request_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    req = await db["requests"].find_one({"_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if str(req.get("provider_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Only the provider can approve this request")

    now = datetime.utcnow()
    # Lock the resource: set status to 'checked_out' or 'pending'
    await db["resources"].update_one(
        {"_id": req["resource_id"]},
        {"$set": {"status": "checked_out", "updated_at": now}}
    )

    await db["requests"].update_one(
        {"_id": request_id},
        {"$set": {"status": "approved", "updated_at": now}}
    )
    req["status"] = "approved"
    req["updated_at"] = now

    return ResourceRequestResponse(
        id=str(req.get("_id", req.get("id"))),
        **{k: v for k, v in req.items() if k not in ["_id", "id"]}
    )

@router.put("/{request_id}/reject", response_model=ResourceRequestResponse)
async def reject_request(request_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    req = await db["requests"].find_one({"_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if str(req.get("provider_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Only the provider can reject this request")

    now = datetime.utcnow()
    await db["requests"].update_one(
        {"_id": request_id},
        {"$set": {"status": "rejected", "updated_at": now}}
    )
    req["status"] = "rejected"
    req["updated_at"] = now

    return ResourceRequestResponse(
        id=str(req.get("_id", req.get("id"))),
        **{k: v for k, v in req.items() if k not in ["_id", "id"]}
    )

@router.put("/{request_id}/complete-return", response_model=ResourceRequestResponse)
async def complete_return(request_id: str, current_user: dict = Depends(get_current_user)):
    """Mark item as returned/completed, unlocking the resource and logging history."""
    db = get_database()
    req = await db["requests"].find_one({"_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    user_id = str(current_user["_id"])
    if user_id != str(req.get("provider_id")) and user_id != str(req.get("borrower_id")):
        raise HTTPException(status_code=403, detail="Not authorized to complete this transaction")

    now = datetime.utcnow()
    is_donation = req.get("request_type") == "donate"
    new_resource_status = "donated" if is_donation else "available"

    # Unlock / update resource
    await db["resources"].update_one(
        {"_id": req["resource_id"]},
        {"$set": {"status": new_resource_status, "updated_at": now}}
    )

    await db["requests"].update_one(
        {"_id": request_id},
        {"$set": {"status": "completed", "updated_at": now}}
    )
    req["status"] = "completed"
    req["updated_at"] = now

    # Record in history ledger
    hist_id = f"hist_{uuid.uuid4().hex[:12]}"
    history_doc = {
        "_id": hist_id,
        "request_id": request_id,
        "resource_id": req["resource_id"],
        "resource_title": req.get("resource_title", "Educational Resource"),
        "resource_author": req.get("resource_author"),
        "provider_id": req["provider_id"],
        "provider_name": req.get("provider_name", "Provider"),
        "borrower_id": req["borrower_id"],
        "borrower_name": req.get("borrower_name", "Borrower"),
        "action_type": "donated" if is_donation else "borrowed_and_returned",
        "start_date": req.get("created_at", now),
        "end_date": now,
        "rating_for_borrower": None,
        "review_for_borrower": None,
        "rating_for_provider": None,
        "review_for_provider": None
    }
    await db["lending_history"].insert_one(history_doc)

    # Increment exchanges for both users
    await db["users"].update_one({"_id": req["provider_id"]}, {"$inc": {"total_exchanges": 1}})
    await db["users"].update_one({"_id": req["borrower_id"]}, {"$inc": {"total_exchanges": 1}})

    return ResourceRequestResponse(
        id=str(req.get("_id", req.get("id"))),
        **{k: v for k, v in req.items() if k not in ["_id", "id"]}
    )

