import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.models.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.services.auth_service import get_current_user
from app.database import get_database

router = APIRouter(prefix="/schedules", tags=["Collection Meetup Scheduling"])

@router.post("", response_model=ScheduleResponse)
async def create_schedule(data: ScheduleCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    req = await db["requests"].find_one({"_id": data.request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    user_id = str(current_user["_id"])
    if user_id != str(req.get("provider_id")) and user_id != str(req.get("borrower_id")):
        raise HTTPException(status_code=403, detail="Not authorized to schedule meetup for this request")

    sched_id = f"sch_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()
    is_provider = user_id == str(req["provider_id"])

    doc = {
        "_id": sched_id,
        "request_id": data.request_id,
        "resource_id": req["resource_id"],
        "resource_title": req.get("resource_title", "Book"),
        "provider_id": req["provider_id"],
        "provider_name": req.get("provider_name", "Provider"),
        "borrower_id": req["borrower_id"],
        "borrower_name": req.get("borrower_name", "Borrower"),
        "meetup_time": data.meetup_time,
        "meetup_location": data.meetup_location,
        "notes": data.notes or "",
        "status": "proposed",
        "confirmed_by_provider": is_provider,
        "confirmed_by_borrower": not is_provider,
        "created_at": now
    }

    await db["schedules"].insert_one(doc)

    # Update request status to scheduled
    await db["requests"].update_one({"_id": data.request_id}, {"$set": {"status": "scheduled", "updated_at": now}})

    return ScheduleResponse(
        id=sched_id,
        **{k: v for k, v in doc.items() if k not in ["_id"]}
    )

@router.get("", response_model=List[ScheduleResponse])
async def get_my_schedules(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    cursor = db["schedules"].find({
        "$or": [{"provider_id": user_id}, {"borrower_id": user_id}]
    }).sort("meetup_time", 1)
    
    docs = await cursor.to_list(length=100)
    return [
        ScheduleResponse(
            id=str(d.get("_id", d.get("id"))),
            **{k: v for k, v in d.items() if k not in ["_id", "id"]}
        )
        for d in docs
    ]

@router.put("/{schedule_id}/confirm", response_model=ScheduleResponse)
async def confirm_schedule(schedule_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    sched = await db["schedules"].find_one({"_id": schedule_id})
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    user_id = str(current_user["_id"])
    if user_id == str(sched["provider_id"]):
        sched["confirmed_by_provider"] = True
    elif user_id == str(sched["borrower_id"]):
        sched["confirmed_by_borrower"] = True
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    if sched["confirmed_by_provider"] and sched["confirmed_by_borrower"]:
        sched["status"] = "confirmed"

    await db["schedules"].update_one({"_id": schedule_id}, {"$set": sched})

    return ScheduleResponse(
        id=str(sched.get("_id", sched.get("id"))),
        **{k: v for k, v in sched.items() if k not in ["_id", "id"]}
    )

