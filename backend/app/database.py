import asyncio
import logging
import re
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger("uvicorn.error")

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

def _clean_for_supabase(doc: dict) -> dict:
    """Prepare a document for Supabase PostgreSQL (e.g. rename _id to id, serialize datetimes)."""
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    for k, v in list(d.items()):
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d

def _clean_from_supabase(row: dict) -> dict:
    """Format Supabase row to match expected dictionary format."""
    d = dict(row)
    if "id" in d:
        d["_id"] = str(d["id"])
    return d

class SupabaseCursor:
    def __init__(self, client: Any, table_name: str, query: Optional[dict] = None):
        self.client = client
        self.table_name = table_name
        self.query = query or {}
        self._sort_field = None
        self._sort_desc = False
        self._skip_val = 0
        self._limit_val = 100

    def sort(self, field: str, direction: int = 1):
        if field == "_id":
            field = "id"
        self._sort_field = field
        self._sort_desc = (direction == -1)
        return self

    def skip(self, count: int):
        self._skip_val = count
        return self

    def limit(self, count: int):
        self._limit_val = count
        return self

    async def to_list(self, length: Optional[int] = None) -> List[dict]:
        limit = length if length is not None else self._limit_val
        sb_query = self.client.table(self.table_name).select("*")

        # Apply basic filters
        for k, v in self.query.items():
            col = "id" if k in ["_id", "id"] else k
            if k == "$or" and isinstance(v, list):
                # Try simple or condition if applicable
                pass
            elif isinstance(v, dict):
                if "$regex" in v:
                    pattern = v["$regex"].strip("^$")
                    sb_query = sb_query.ilike(col, f"%{pattern}%")
                elif "$in" in v:
                    sb_query = sb_query.in_(col, v["$in"])
                elif "$ne" in v:
                    sb_query = sb_query.neq(col, v["$ne"])
            else:
                sb_query = sb_query.eq(col, v)

        if self._sort_field:
            sb_query = sb_query.order(self._sort_field, desc=self._sort_desc)

        start = self._skip_val
        end = start + limit - 1
        sb_query = sb_query.range(start, end)

        # Run synchronous call in thread pool to avoid blocking async event loop
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, sb_query.execute)
        rows = res.data or []

        # If $or filter was present, do post-filtering if needed
        if "$or" in self.query and isinstance(self.query["$or"], list):
            filtered = []
            for r in rows:
                match_any = False
                for sub in self.query["$or"]:
                    for sub_k, sub_v in sub.items():
                        field_val = str(r.get(sub_k, ""))
                        if isinstance(sub_v, dict) and "$regex" in sub_v:
                            if re.search(sub_v["$regex"], field_val, re.IGNORECASE):
                                match_any = True
                                break
                        elif field_val == str(sub_v):
                            match_any = True
                            break
                    if match_any:
                        break
                if match_any:
                    filtered.append(r)
            rows = filtered

        return [_clean_from_supabase(r) for r in rows]

class SupabaseCollection:
    def __init__(self, client: Any, name: str):
        self.client = client
        self.name = name

    async def insert_one(self, doc: dict):
        clean_doc = _clean_for_supabase(doc)
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: self.client.table(self.name).insert(clean_doc).execute()
        )
        inserted_id = clean_doc.get("id")
        class InsertResult:
            pass
        result = InsertResult()
        result.inserted_id = inserted_id
        return result

    async def find_one(self, query: dict) -> Optional[dict]:
        sb_query = self.client.table(self.name).select("*").limit(1)
        for k, v in query.items():
            col = "id" if k in ["_id", "id"] else k
            if isinstance(v, dict):
                if "$regex" in v:
                    sb_query = sb_query.ilike(col, f"%{v['$regex'].strip('^$')}%")
            else:
                sb_query = sb_query.eq(col, v)

        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, sb_query.execute)
        if res.data and len(res.data) > 0:
            return _clean_from_supabase(res.data[0])
        return None

    def find(self, query: Optional[dict] = None):
        return SupabaseCursor(self.client, self.name, query)

    async def update_one(self, query: dict, update: dict):
        update_data = {}
        if "$set" in update:
            update_data.update(_clean_for_supabase(update["$set"]))
        if "$inc" in update:
            # Handle increment
            existing = await self.find_one(query)
            if existing:
                for inc_k, inc_v in update["$inc"].items():
                    update_data[inc_k] = existing.get(inc_k, 0) + inc_v

        if not update_data:
            class DummyUpdate:
                matched_count = 0
                modified_count = 0
            return DummyUpdate()

        target_id = query.get("_id") or query.get("id")
        loop = asyncio.get_event_loop()

        if target_id:
            res = await loop.run_in_executor(
                None,
                lambda: self.client.table(self.name).update(update_data).eq("id", str(target_id)).execute()
            )
        else:
            def do_update():
                q = self.client.table(self.name).update(update_data)
                for k, v in query.items():
                    q = q.eq(k, v)
                return q.execute()
            res = await loop.run_in_executor(None, do_update)

        class UpdateResult:
            matched_count = len(res.data) if res.data else 1
            modified_count = len(res.data) if res.data else 1
        return UpdateResult()

    async def delete_one(self, query: dict):
        target_id = query.get("_id") or query.get("id")
        loop = asyncio.get_event_loop()
        if target_id:
            res = await loop.run_in_executor(
                None,
                lambda: self.client.table(self.name).delete().eq("id", str(target_id)).execute()
            )
        else:
            def do_delete():
                q = self.client.table(self.name).delete()
                for k, v in query.items():
                    q = q.eq(k, v)
                return q.execute()
            res = await loop.run_in_executor(None, do_delete)

        class DeleteResult:
            deleted_count = len(res.data) if res.data else 1
        return DeleteResult()

    async def count_documents(self, query: dict) -> int:
        sb_query = self.client.table(self.name).select("id", count="exact")
        for k, v in query.items():
            col = "id" if k in ["_id", "id"] else k
            if isinstance(v, dict):
                if "$regex" in v:
                    sb_query = sb_query.ilike(col, f"%{v['$regex'].strip('^$')}%")
            else:
                sb_query = sb_query.eq(col, v)

        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, sb_query.execute)
        return res.count or 0

class SupabaseDatabase:
    """Database wrapper providing collection access backed by Supabase."""
    def __init__(self, client: Any):
        self.client = client
        self.collections: Dict[str, SupabaseCollection] = {}

    def __getitem__(self, name: str) -> SupabaseCollection:
        if name not in self.collections:
            self.collections[name] = SupabaseCollection(self.client, name)
        return self.collections[name]

# In-memory Fallback
class InMemoryCollection:
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
            doc_val = doc.get(k)
            if isinstance(v, dict):
                if "$regex" in v:
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
        self.matched_docs = []
        for d in docs:
            match = True
            for k, v in query.items():
                if k == "$or" and isinstance(v, list):
                    sub_match = any(self._match_single(d, sub) for sub in v)
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
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

class DatabaseManager:
    client = None
    db = None
    db_type = "unknown"

    async def connect(self):
        # 1. First priority: Supabase Cloud Database
        if create_client and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                logger.info(f"Connecting to Supabase at {settings.SUPABASE_URL}...")
                sb_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                # Test querying resources table
                loop = asyncio.get_event_loop()
                test_res = await loop.run_in_executor(None, lambda: sb_client.table("resources").select("id").limit(1).execute())
                self.client = sb_client
                self.db = SupabaseDatabase(sb_client)
                self.db_type = "supabase-cloud"
                logger.info("Connected successfully to Supabase PostgreSQL database!")
                return
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}")

        # 2. Second priority: Local or configured MongoDB
        try:
            import motor.motor_asyncio
            logger.info(f"Attempting MongoDB connection at {settings.MONGODB_URL}...")
            mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=1500
            )
            await mongo_client.admin.command('ping')
            self.client = mongo_client
            self.db = self.client[settings.DATABASE_NAME]
            self.db_type = "mongodb-live"
            logger.info("Connected to live MongoDB.")
            return
        except Exception:
            pass

        # 3. Third priority: In-memory fallback
        logger.info("Using in-memory fallback database.")
        self.db = FallbackDatabase()
        self.db_type = "in-memory-fallback"

    async def close(self):
        logger.info("Database closed.")

db_manager = DatabaseManager()

def get_database():
    if db_manager.db is None:
        db_manager.db = FallbackDatabase()
        db_manager.db_type = "in-memory-fallback"
    return db_manager.db
