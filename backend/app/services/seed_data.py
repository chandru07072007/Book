import uuid
from datetime import datetime, timedelta
from app.services.auth_service import get_password_hash

async def seed_initial_data(db):
    """Seed sample users, books, and requests if database is empty."""
    users_count = await db["users"].count_documents({})
    if users_count > 0:
        return

    # 1. Seed Users
    user1_id = "user_alice_001"
    user2_id = "user_bob_002"
    
    users = [
        {
            "_id": user1_id,
            "email": "alice@campus.edu",
            "full_name": "Alice Johnson",
            "password_hash": get_password_hash("password123"),
            "is_edu_verified": True,
            "institution": "Stanford University",
            "location": "Engineering Quad, Campus",
            "academic_interests": ["Computer Science", "Artificial Intelligence", "Data Structures"],
            "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "bio": "CS senior passionate about peer study groups and resource sharing.",
            "trust_score": 4.9,
            "total_exchanges": 14,
            "created_at": datetime.utcnow()
        },
        {
            "_id": user2_id,
            "email": "bob@campus.edu",
            "full_name": "Bob Martinez",
            "password_hash": get_password_hash("password123"),
            "is_edu_verified": True,
            "institution": "Stanford University",
            "location": "Science & Medicine Library",
            "academic_interests": ["Mathematics", "Physics", "Chemistry"],
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "bio": "Graduate researcher in applied physics. Happy to lend textbooks to undergrads!",
            "trust_score": 4.8,
            "total_exchanges": 9,
            "created_at": datetime.utcnow()
        }
    ]

    for u in users:
        await db["users"].insert_one(u)

    # 2. Seed Resources
    books = [
        {
            "_id": "res_clrs_01",
            "provider_id": user1_id,
            "provider_name": "Alice Johnson",
            "provider_trust_score": 4.9,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "Introduction to Algorithms (4th Edition)",
            "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
            "isbn": "9780262046305",
            "subject": "Computer Science",
            "format": "hardcover",
            "condition": "like_new",
            "listing_type": "lend",
            "status": "available",
            "description": "Comprehensive reference covering data structures, dynamic programming, and graph algorithms. Clean pages, no highlighting.",
            "cover_image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400",
            "pickup_location": "Engineering Library - Floor 2",
            "max_borrow_days": 30,
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "_id": "res_cleancode_02",
            "provider_id": user1_id,
            "provider_name": "Alice Johnson",
            "provider_trust_score": 4.9,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "subject": "Computer Science",
            "format": "paperback",
            "condition": "good",
            "listing_type": "lend",
            "status": "available",
            "description": "Must-read for software engineering best practices, refactoring, and code hygiene.",
            "cover_image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
            "pickup_location": "Tressider Student Union",
            "max_borrow_days": 21,
            "created_at": datetime.utcnow() - timedelta(days=4),
            "updated_at": datetime.utcnow() - timedelta(days=4)
        },
        {
            "_id": "res_calculus_03",
            "provider_id": user2_id,
            "provider_name": "Bob Martinez",
            "provider_trust_score": 4.8,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "Calculus: Early Transcendentals (8th Edition)",
            "author": "James Stewart",
            "isbn": "9781285741550",
            "subject": "Mathematics",
            "format": "hardcover",
            "condition": "good",
            "listing_type": "donate",
            "status": "available",
            "description": "Standard textbook for Math 1A/1B & Multivariable Calculus. Giving away to any student who needs it for the upcoming quarter!",
            "cover_image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "pickup_location": "Math Building Courtyard",
            "max_borrow_days": 60,
            "created_at": datetime.utcnow() - timedelta(days=6),
            "updated_at": datetime.utcnow() - timedelta(days=6)
        },
        {
            "_id": "res_biology_04",
            "provider_id": user2_id,
            "provider_name": "Bob Martinez",
            "provider_trust_score": 4.8,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "Campbell Biology (12th Edition)",
            "author": "Lisa A. Urry, Michael L. Cain, Steven A. Wasserman",
            "isbn": "9780135188743",
            "subject": "Biology",
            "format": "hardcover",
            "condition": "like_new",
            "listing_type": "lend",
            "status": "available",
            "description": "Full-color illustrations and study guides for general biology and pre-med courses.",
            "cover_image_url": "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400",
            "pickup_location": "Biology Sciences Courtyard",
            "max_borrow_days": 45,
            "created_at": datetime.utcnow() - timedelta(days=1),
            "updated_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "_id": "res_physics_05",
            "provider_id": user2_id,
            "provider_name": "Bob Martinez",
            "provider_trust_score": 4.8,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "University Physics with Modern Physics",
            "author": "Hugh D. Young, Roger A. Freedman",
            "isbn": "9780135159552",
            "subject": "Physics",
            "format": "hardcover",
            "condition": "fair",
            "listing_type": "lend",
            "status": "available",
            "description": "Calculus-based physics textbook with problem sets. Minor wear on spine, interior intact.",
            "cover_image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
            "pickup_location": "Physics Hall Lobby",
            "max_borrow_days": 30,
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "_id": "res_microecon_06",
            "provider_id": user1_id,
            "provider_name": "Alice Johnson",
            "provider_trust_score": 4.9,
            "provider_institution": "Stanford University",
            "is_edu_verified": True,
            "title": "Principles of Microeconomics",
            "author": "N. Gregory Mankiw",
            "isbn": "9781305971493",
            "subject": "Economics",
            "format": "paperback",
            "condition": "new",
            "listing_type": "donate",
            "status": "available",
            "description": "Clear presentation of supply and demand, markets, and policy analysis. Extra copy received as gift.",
            "cover_image_url": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400",
            "pickup_location": "Green Library Cafe",
            "max_borrow_days": 90,
            "created_at": datetime.utcnow() - timedelta(days=3),
            "updated_at": datetime.utcnow() - timedelta(days=3)
        }
    ]

    for b in books:
        await db["resources"].insert_one(b)

    # 3. Seed sample lending history record
    history_record = {
        "_id": "hist_sample_01",
        "resource_id": "res_cleancode_02",
        "resource_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "resource_author": "Robert C. Martin",
        "provider_id": user1_id,
        "provider_name": "Alice Johnson",
        "borrower_id": user2_id,
        "borrower_name": "Bob Martinez",
        "action_type": "borrowed_and_returned",
        "start_date": datetime.utcnow() - timedelta(days=20),
        "end_date": datetime.utcnow() - timedelta(days=5),
        "rating_for_borrower": 5,
        "review_for_borrower": "Bob returned the book ahead of time in mint condition. Great communicator!",
        "rating_for_provider": 5,
        "review_for_provider": "Alice was very prompt and kind when handing over the textbook."
    }
    await db["lending_history"].insert_one(history_record)

