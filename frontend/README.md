<div align="center">

# 💻 BookBridge — Frontend Web Client
### Modern, High-Performance Academic Resource Sharing Interface

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com)
[![Lucide](https://img.shields.io/badge/Icons-Lucide_React-F56565.svg?style=for-the-badge)](https://lucide.dev)

</div>

---

## 📖 Overview

The BookBridge frontend is a lightweight Single Page Application (SPA) engineered with **React 19**, **Vite 8**, and **Tailwind CSS v4**. It delivers an intuitive, fast, and accessible user experience tailored for university students looking to discover, borrow, donate, or list academic textbooks.

---

## 🛠️ Technology Stack

| Layer | Library / Tool | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | React compiler ready, modern hooks architecture |
| **Bundler** | [Vite 8](https://vitejs.dev/) | Sub-millisecond HMR with optimized rollup chunking |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation CSS-first styling framework |
| **Routing** | [React Router v7](https://reactrouter.com/) | Dynamic nested client-side route handling |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, accessible vector iconography |
| **Networking** | [Axios](https://axios-http.com/) | Interceptor-managed HTTP client with auto base URL normalization |
| **Backend Integration**| [Supabase JS](https://supabase.com/) | Direct client for Supabase cloud auth and data |

---

## 📂 Architecture & Directory Structure

```text
frontend/src/
├── components/               # Reusable UI component library
│   ├── BookCard.jsx          # Book presentation card with condition & availability badges
│   ├── FilterSidebar.jsx     # Multi-attribute filter drawer (subject, format, condition, type)
│   ├── Footer.jsx            # Standard responsive footer with platform links
│   ├── Navbar.jsx            # Sticky navigation with authentication state & quick actions
│   ├── RequestModal.jsx      # Borrow duration slider and purpose note form
│   ├── ReviewModal.jsx       # Interactive 5-star rating dialogue with qualitative review
│   └── ScheduleModal.jsx     # Campus meetup date, time & location selector
├── context/
│   └── AuthContext.jsx       # Global JWT authentication state, login/logout, and user profile
├── pages/                    # Routed application views
│   ├── AddBookPage.jsx       # Real-time ISBN lookup & resource creator
│   ├── BookDetailPage.jsx    # Complete textbook details, provider trust score & loan action
│   ├── CatalogPage.jsx       # Searchable directory with live multi-filter sidebar
│   ├── DashboardPage.jsx     # 5-tab exchange command center (Overview, Inventory, Requests, Meetups, Ledger)
│   ├── HomePage.jsx          # Hero section, platform statistics, and visual how-it-works guide
│   ├── LoginPage.jsx         # Clean login interface with 1-click verified student demo accounts
│   └── RegisterPage.jsx      # Student onboarding with automatic .edu domain verification
├── services/
│   ├── api.js                # Axios client with JWT interceptor and API base URL normalization
│   └── supabase.js           # Supabase client initialization
├── App.jsx                   # Central route declarations and private route protection
├── index.css                 # Tailwind v4 configuration, custom utilities, and form styling
└── main.jsx                  # Application entry point
```

---

## 🌟 Key Application Views

### 1. 🏠 Home Page (`/`)
- Hero section emphasizing textbook affordability and zero-waste campus circularity.
- Real-time community impact statistics (active exchanges, registered students, textbook count).
- Three-step visual walkthrough for both borrowers and providers.

### 2. 📚 Catalog Page (`/catalog`)
- Real-time search by Title, Author, Keyword, or ISBN.
- Faceted filtering: Subject, Format, Physical Condition, Listing Type (Lend vs. Donate), and Status.
- Responsive grid with status badges (`Available`, `Borrowed`, `Donated`).

### 3. 🔍 Book Detail Page (`/books/:id`)
- High-resolution cover photo and publisher details.
- Physical condition rating with wear breakdown.
- Provider trust profile including verified `.edu` badge, university, and community rating.
- One-click trigger for borrow or donation claim modal.

### 4. ➕ Add Resource & ISBN Scanner (`/add-book`)
- Input any 10 or 13-digit ISBN barcode.
- Real-time metadata auto-fill querying Open Library and Google Books APIs (Title, Author, Subject, Cover photo, Edition).
- Configurable pickup campus spot, maximum borrow days, and listing intent.

### 5. 🎛️ Student Dashboard (`/dashboard`)
Centralized command center split into five intuitive tabs:
1. **Overview:** Recent activity, pending requests counter, and active handovers.
2. **My Inventory:** Manage personal listings with edit and status toggling.
3. **Requests Inbox:** Accept or decline incoming borrow requests; track outgoing requests.
4. **Meetups:** Coordinate handover times, campus landmarks, and attendance confirmations.
5. **Ledger & Trust:** Immutable history of completed loans with peer review triggers.

### 6. 🔐 Authentication (`/login` & `/register`)
- Dual-role onboarding with instant `.edu` verification indicator.
- 1-Click demo authentication buttons for quick testing as **Alice Johnson** or **Bob Martinez**.

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Optional: Set when frontend and backend are hosted on separate domains
VITE_API_URL=https://book-brown-one.vercel.app/api

# Supabase Credentials (from Supabase Project Settings > API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
```

---

## 🚀 Development & Build Scripts

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build (compiles to frontend/dist)
npm run build

# Preview production build locally
npm run preview
```
