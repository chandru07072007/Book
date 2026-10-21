# BookBridge (EduShare) 📚🤝

A modern, centralized web application designed to solve the educational resource imbalance in student communities. BookBridge enables peer-to-peer textbook lending and free donations, complete with automated ISBN metadata lookup, physical meetup collection scheduling, transactional book locking, and accountability trust ratings.

---

## 🛠️ Tech Stack

- **Frontend**: **React** (Vite), **Tailwind CSS v4**, **Lucide Icons**, **React Router v7**, **Axios**
- **Backend**: **Python FastAPI**, **Pydantic v2**, **Motor** (Async MongoDB Driver), **JWT Authentication** (python-jose, bcrypt)
- **Database**: **MongoDB** (with automatic zero-config in-memory fallback for immediate standalone development & testing)
- **External Integration**: **Open Library API** & **Google Books API** for ISBN auto-fill

---

## 🌟 Key Features

1. **Listing Capabilities & Automatic ISBN Scanning**:
   - Providers can type/paste any standard 10 or 13-digit ISBN (e.g. `9780132350884` for Clean Code, `9780262046305` for CLRS) and BookBridge auto-fetches Title, Author, Cover image, and Subject.
   - Categorization by academic subject, condition, physical format, and listing intent (Lend vs Donate).
2. **Searchable Resource Catalog**:
   - Instant search across titles, authors, subjects, and ISBNs.
   - Multi-filtering by Subject, Physical Condition, Format, Exchange Type (Lend vs Donate), and Real-time Availability.
3. **Borrower Requests & Transactional Item Locking**:
   - Students request books with a custom duration slider and study purpose notes.
   - When a provider approves a request, the resource is atomically updated to `checked_out`, preventing double checkout.
4. **Collection Meetup Scheduling**:
   - Propose, schedule, and confirm physical handover meetups with date, time, campus location, and instructions.
5. **Lending History Ledger & Dynamic Trust Scores**:
   - Persistent ledger tracking past transactions.
   - Interactive 5-star review system that dynamically recalculates user trust ratings.
6. **Student Verification**:
   - Detects `.edu` and institutional academic emails, granting verified student badges.

---

## 🚀 Quick Start Guide

### Option 1: Double-Click Batch Files (Easiest)
- Backend: Double-click `run_backend.bat`
- Frontend: Double-click `run_frontend.bat`

---

### Option 2: Terminal Commands

#### 1. Start FastAPI Backend:
Open PowerShell / Command Prompt in the project folder and run:
```powershell
cd backend
..\venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **http://localhost:8000/docs**

#### 2. Start React Frontend:
Open a second PowerShell / Command Prompt terminal in the project folder and run:
```powershell
cd frontend
npm.cmd run dev
```
(or `npm run dev`)

The web application will be live at: **http://localhost:5173**

---

## 👤 Pre-Seeded Test Accounts

You can log in instantly with the 1-click demo buttons on the Sign In page:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alice Johnson** | `alice@campus.edu` | `password123` | CS Senior & Book Provider |
| **Bob Martinez** | `bob@campus.edu` | `password123` | Physics Grad Student & Borrower |

---

## 📡 Core API Endpoints

- `POST /api/auth/register` & `POST /api/auth/login` - User registration & JWT authentication
- `GET /api/auth/me` - Authenticated user profile & trust score
- `GET /api/resources` - Search & filter catalog items
- `GET /api/resources/isbn-lookup/{isbn}` - Fetch book metadata and cover image
- `POST /api/resources` - Upload new educational resource
- `POST /api/requests` - Submit borrow or donation request
- `PUT /api/requests/{id}/approve` - Provider approval (locks resource)
- `PUT /api/requests/{id}/complete-return` - Mark return complete and record to history
- `POST /api/schedules` - Propose physical collection meetup
- `PUT /api/schedules/{id}/confirm` - Confirm meetup attendance
- `POST /api/history/review` - Submit 1-5 star review & update user trust score
- `GET /api/history/metrics/overview` - Platform counters & student savings metrics

