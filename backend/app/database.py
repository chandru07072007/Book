import asyncio
import logging
from typing import Any, Dict, List, Optional
import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("uvicorn.error")

class InMemoryCollection:
    """Async Mongo-compatible in-memory collection for development & fallback."""
    def __init__(self, name: str):
        self.name = name
        self.documents: Dict[str, dict] = {}

    async def insert_one(self, doc: dict):
        d = dict(doc)
        _id = str(d.get("_id", d.get("id", len(self.documents) + 1)))
        d["_id"] = _id
        self.documents[_id] = d
        class InsertResult:
            inserted_id = _id
        return InsertResult()

    async def find_one(self, query: dict) -> Optional[dict]:
        for doc in self.documents.values():
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: Optional[dict] = None):
        return InMemoryCursor(self.documents.values(), query or {})

    async def update_one(self, query: dict, update: dict):
        matched = 0
        modified = 0
        for key, doc in self.documents.items():
            if self._matches(doc, query):
                matched = 1
                if "$set" in update:
                    doc.update(update["$set"])
                    modified = 1
                if "$inc" in update:
                    for inc_k, inc_v in update["$inc"].items():
                        doc[inc_k] = doc.get(inc_k, 0) + inc_v
                    modified = 1
                break
        class UpdateResult:
            matched_count = matched
            modified_count = modified
        return UpdateResult()

    async def delete_one(self, query: dict):
        deleted = 0
        for key, doc in list(self.documents.items()):
            if self._matches(doc, query):
                del self.documents[key]
                deleted = 1
                break
        class DeleteResult:
            deleted_count = deleted
        return DeleteResult()

    async def count_documents(self, query: dict) -> int:
        count = 0
        for doc in self.documents.values():
            if self._matches(doc, query):
                count += 1
        return count

    def _matches(self, doc: dict, query: dict) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, sub_q) for sub_q in v):
                    return False
                continue
            if k == "$and" and isinstance(v, list):
                if not all(self._matches(doc, sub_q) for sub_q in v):
                    return False
                continue

            doc_val = doc.get(k)
            if isinstance(v, dict):
                # Simple operator checks
                if "$regex" in v:
                    import re
                    pattern = v["$regex"]
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not (doc_val and re.search(pattern, str(doc_val), flags)):
                        return False
                elif "$in" in v:
                    if doc_val not in v["$in"]:
                        return False
                elif "$ne" in v:
                    if doc_val == v["$ne"]:
                        return False
            else:
                if str(doc_val) != str(v):
                    return False
        return True

class InMemoryCursor:
    def __init__(self, docs, query: dict):
        import re
        self.matched_docs = []
        for d in docs:
            match = True
            for k, v in query.items():
                if k == "$or" and isinstance(v, list):
                    sub_match = False
                    for sub in v:
                        if self._match_single(d, sub):
                            sub_match = True
                            break
                    if not sub_match:
                        match = False
                        break
                    continue
                if not self._match_single(d, {k: v}):
                    match = False
                    break
            if match:
                self.matched_docs.append(dict(d))
        self._sort_field = None
        self._sort_dir = 1
        self._skip_val = 0
        self._limit_val = None

    def _match_single(self, doc: dict, query: dict) -> bool:
        import re
        for k, v in query.items():
            doc_val = doc.get(k)
            if isinstance(v, dict):
                if "$regex" in v:
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not (doc_val and re.search(v["$regex"], str(doc_val), flags)):
                        return False
                elif "$in" in v:
                    if doc_val not in v["$in"]:
                        return False
                elif "$ne" in v:
                    if doc_val == v["$ne"]:
                        return False
            else:
                if str(doc_val) != str(v):
                    return False
        return True

    def sort(self, field: str, direction: int = 1):
        self._sort_field = field
        self._sort_dir = direction
        return self

    def skip(self, count: int):
        self._skip_val = count
        return self

    def limit(self, count: int):
        self._limit_val = count
        return self

    async def to_list(self, length: Optional[int] = None) -> List[dict]:
        res = list(self.matched_docs)
        if self._sort_field:
            res.sort(key=lambda x: str(x.get(self._sort_field, "")), reverse=(self._sort_dir == -1))
        if self._skip_val:
            res = res[self._skip_val:]
        limit_to = self._limit_val if self._limit_val is not None else length
        if limit_to is not None:
            res = res[:limit_to]
        return res

class FallbackDatabase:
    """Wrapper that provides collections seamlessly."""
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

class DatabaseManager:
    client = None
    db = None
    is_mock = False

    async def connect(self):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
            # Set short serverSelectionTimeoutMS so if mongo isn't up, it falls back instantly
            test_client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=1500
            )
            # Ping database
            await test_client.admin.command('ping')
            self.client = test_client
            self.db = self.client[settings.DATABASE_NAME]
            self.is_mock = False
            logger.info(f"Connected successfully to live MongoDB: {settings.DATABASE_NAME}")
        except Exception as e:
            logger.warning(f"Could not connect to live MongoDB ({e}). Activating in-memory mock MongoDB layer for fast development & testing.")
            self.db = FallbackDatabase()
            self.is_mock = True

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

db_manager = DatabaseManager()

def get_database():
    if db_manager.db is None:
        # Fallback safeguard in case accessed before async lifespan
        db_manager.db = FallbackDatabase()
        db_manager.is_mock = True
    return db_manager.db
