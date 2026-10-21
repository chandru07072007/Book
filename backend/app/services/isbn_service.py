import httpx
from typing import Optional, Dict, Any

async def lookup_isbn(isbn: str) -> Optional[Dict[str, Any]]:
    """Lookup book metadata from Open Library API and fallback to Google Books."""
    clean_isbn = "".join(filter(str.isdigit, isbn))
    if not clean_isbn:
        return None

    # 1. Try Open Library API
    try:
        url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{clean_isbn}&format=json&jscmd=data"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                key = f"ISBN:{clean_isbn}"
                if key in data:
                    item = data[key]
                    authors = [a.get("name") for a in item.get("authors", [])]
                    author_str = ", ".join(authors) if authors else "Unknown Author"
                    
                    subjects = [s.get("name") for s in item.get("subjects", [])]
                    subject_str = subjects[0] if subjects else "General"
                    
                    cover_url = None
                    if "cover" in item and "large" in item["cover"]:
                        cover_url = item["cover"]["large"]
                    elif "cover" in item and "medium" in item["cover"]:
                        cover_url = item["cover"]["medium"]
                    else:
                        cover_url = f"https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg"

                    return {
                        "title": item.get("title", ""),
                        "author": author_str,
                        "isbn": clean_isbn,
                        "subject": subject_str,
                        "description": item.get("notes", item.get("subtitle", "")),
                        "cover_image_url": cover_url,
                        "publish_date": item.get("publish_date", ""),
                        "number_of_pages": item.get("number_of_pages"),
                    }
    except Exception:
        pass

    # 2. Try Google Books API as fallback
    try:
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{clean_isbn}"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if "items" in data and len(data["items"]) > 0:
                    info = data["items"][0].get("volumeInfo", {})
                    authors = info.get("authors", [])
                    categories = info.get("categories", [])
                    images = info.get("imageLinks", {})
                    cover = images.get("thumbnail", images.get("smallThumbnail"))
                    if cover and cover.startswith("http://"):
                        cover = cover.replace("http://", "https://")

                    return {
                        "title": info.get("title", ""),
                        "author": ", ".join(authors) if authors else "Unknown Author",
                        "isbn": clean_isbn,
                        "subject": categories[0] if categories else "General",
                        "description": info.get("description", ""),
                        "cover_image_url": cover or f"https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg",
                        "publish_date": info.get("publishedDate", ""),
                        "number_of_pages": info.get("pageCount"),
                    }
    except Exception:
        pass

    return None

