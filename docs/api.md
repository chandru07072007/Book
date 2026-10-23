# API Details

When the backend is running locally, generated docs are available at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

## Route groups

- `/api/auth`
  - `POST /register`
  - `POST /login`
  - `GET /me`
  - `PUT /me`
- `/api/resources`
  - `GET /`
  - `GET /{resource_id}`
  - `POST /`
  - `PUT /{resource_id}`
  - `DELETE /{resource_id}`
  - `GET /isbn-lookup/{isbn}`
- `/api/requests`
  - `POST /`
  - `GET /incoming`
  - `GET /outgoing`
  - `PUT /{request_id}/approve`
  - `PUT /{request_id}/reject`
  - `PUT /{request_id}/complete-return`
- `/api/schedules`
  - `POST /`
  - `GET /`
  - `PUT /{schedule_id}/confirm`
- `/api/history`
  - `GET /`
  - `POST /review`
  - `GET /metrics/overview`
