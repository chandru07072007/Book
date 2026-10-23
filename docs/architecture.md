# Architecture

BookBridge uses a decoupled frontend/backend design with fallback data storage.

```mermaid
flowchart TD
    subgraph Client[Frontend]
        UI[React + Vite app]
    end

    subgraph API[Backend]
        APP[FastAPI app]
        ROUTERS[/api/auth\n/api/resources\n/api/requests\n/api/schedules\n/api/history]
    end

    subgraph Data[Data Layer]
        SB[(Supabase)]
        MG[(MongoDB)]
        MEM[(In-memory fallback)]
    end

    subgraph External[External Services]
        ISBN[Open Library + Google Books]
    end

    UI --> APP
    APP --> ROUTERS
    ROUTERS --> ISBN
    APP --> SB
    APP --> MG
    APP --> MEM
```

Data backend selection order (from `backend/app/database.py`):
1. Supabase
2. MongoDB
3. In-memory fallback
