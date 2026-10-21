import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from app.services.auth_service import get_current_user, get_optional_user
from app.services.isbn_service import lookup_isbn
from app.database import get_database

router = APIRouter(prefix="/resources", tags=["Resources & Catalog"])

@router.get("/isbn-lookup/{isbn}")
async def fetch_isbn_details(isbn: str):
    data = await lookup_isbn(isbn)
    if not data:
        raise HTTPException(status_code=404, detail="Book metadata not found for this ISBN")
    return data

@router.get("", response_model=List[ResourceResponse])
async def list_resources(
    q: Optional[str] = Query(None, description="Search query across title, author, or ISBN"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    format: Optional[str] = Query(None, description="Filter by format"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    listing_type: Optional[str] = Query(None, description="Filter by lend/donate"),
    status: Optional[str] = Query(None, description="Filter by availability status"),
    provider_id: Optional[str] = Query(None, description="Filter by provider user id"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    db = get_database()
    query = {}

    if status:
        query["status"] = status
    if subject and subject.lower() != "all":
        query["subject"] = {"$regex": f"^{subject}$", "$options": "i"}
    if format and format.lower() != "all":
        query["format"] = format
    if condition and condition.lower() != "all":
        query["condition"] = condition
    if listing_type and listing_type.lower() != "all":
        query["listing_type"] = listing_type
    if provider_id:
        query["provider_id"] = provider_id

    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"author": {"$regex": q, "$options": "i"}},
            {"isbn": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"subject": {"$regex": q, "$options": "i"}}
        ]

    cursor = db["resources"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    raw_resources = await cursor.to_list(length=limit)

    results = []
    for r in raw_resources:
        results.append(ResourceResponse(
            id=str(r.get("_id", r.get("id"))),
            title=r.get("title", ""),
            author=r.get("author", ""),
            isbn=r.get("isbn"),
            subject=r.get("subject", "General"),
            format=r.get("format", "textbook"),
            condition=r.get("condition", "good"),
            listing_type=r.get("listing_type", "lend"),
            description=r.get("description", ""),
            cover_image_url=r.get("cover_image_url"),
            pickup_location=r.get("pickup_location", "Campus"),
            max_borrow_days=r.get("max_borrow_days", 30),
            provider_id=r.get("provider_id", ""),
            provider_name=r.get("provider_name", "Anonymous"),
            provider_trust_score=r.get("provider_trust_score", 5.0),
            provider_institution=r.get("provider_institution"),
            is_edu_verified=r.get("is_edu_verified", False),
            status=r.get("status", "available"),
            created_at=r.get("created_at", datetime.utcnow()),
            updated_at=r.get("updated_at", datetime.utcnow())
        ))
    return results

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: str):
    db = get_database()
    r = await db["resources"].find_one({"_id": resource_id})
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    return ResourceResponse(
        id=str(r.get("_id", r.get("id"))),
        title=r.get("title", ""),
        author=r.get("author", ""),
        isbn=r.get("isbn"),
        subject=r.get("subject", "General"),
        format=r.get("format", "textbook"),
        condition=r.get("condition", "good"),
        listing_type=r.get("listing_type", "lend"),
        description=r.get("description", ""),
        cover_image_url=r.get("cover_image_url"),
        pickup_location=r.get("pickup_location", "Campus"),
        max_borrow_days=r.get("max_borrow_days", 30),
        provider_id=r.get("provider_id", ""),
        provider_name=r.get("provider_name", "Anonymous"),
        provider_trust_score=r.get("provider_trust_score", 5.0),
        provider_institution=r.get("provider_institution"),
        is_edu_verified=r.get("is_edu_verified", False),
        status=r.get("status", "available"),
        created_at=r.get("created_at", datetime.utcnow()),
        updated_at=r.get("updated_at", datetime.utcnow())
    )

@router.post("", response_model=ResourceResponse)
async def create_resource(data: ResourceCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    res_id = f"res_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()

    # Default cover fallback if not provided
    cover = data.cover_image_url
    if not cover:
        cover = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"

    doc = {
        "_id": res_id,
        "provider_id": str(current_user["_id"]),
        "provider_name": current_user["full_name"],
        "provider_trust_score": current_user.get("trust_score", 5.0),
        "provider_institution": current_user.get("institution", "Campus"),
        "is_edu_verified": current_user.get("is_edu_verified", False),
        "title": data.title,
        "author": data.author,
        "isbn": data.isbn,
        "subject": data.subject,
        "format": data.format,
        "condition": data.condition,
        "listing_type": data.listing_type,
        "status": "available",
        "description": data.description or "",
        "cover_image_url": cover,
        "pickup_location": data.pickup_location,
        "max_borrow_days": data.max_borrow_days,
        "created_at": now,
        "updated_at": now
    }

    await db["resources"].insert_one(doc)

    return ResourceResponse(
        id=res_id,
        **{k: v for k, v in doc.items() if k not in ["_id"]}
    )

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(resource_id: str, updates: ResourceUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    existing = await db["resources"].find_one({"_id": resource_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if str(existing.get("provider_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_dict = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()

    await db["resources"].update_one({"_id": resource_id}, {"$set": update_dict})
    existing.update(update_dict)

    return ResourceResponse(
        id=str(existing["_id"]),
        **{k: v for k, v in existing.items() if k not in ["_id"]}
    )

@router.delete("/{resource_id}")
async def delete_resource(resource_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    existing = await db["resources"].find_one({"_id": resource_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")

    if str(existing.get("provider_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    await db["resources"].delete_one({"_id": resource_id})
    return {"message": "Resource deleted successfully"}

