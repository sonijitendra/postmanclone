# Postman Clone — Production-Ready API Client

A production-grade, pixel-perfect developer API client that mirrors the visual style, layouts, and keyboard shortcuts of the real Postman application. 

Designed with a **FastAPI backend proxy architecture** to bypass browser CORS limitations, and a highly interactive, responsive **Next.js 16 (App Router)** interface.

---

## 🚀 Key Features

### Core Functionality
- **CORS-Bypassing Proxy**: All request execution runs through the FastAPI backend proxy runner so you can test any API securely without CORS blockages.
- **Dynamic Tab Management**: Multi-tab layout allowing you to work on multiple requests at once. Tabs preserve unsaved states in-memory and database-persisted tab sessions.
- **Bidirectional Query Builder**: Rebuild query parameter grids automatically when modifying the URL string, and instantly update the URL when modifying key-value param tables.
- **Key-Value Grid Editor**: Reusable key-value grid (for Headers, Query Params, and Form Data) that automatically appends a blank row at the bottom when you start typing.
- **Comprehensive Body Editor**: Supports `None`, `JSON` (with color syntax highlighting), `Text`, `Form Data`, and `x-www-form-urlencoded` payloads.
- **Flexible Auth Tab**: Easily switch between `No Auth`, `Bearer Token`, and `Basic Auth` schemas.

### Staff-Level Polish & UX
- **Pixel-Accurate Dark Mode Theme**: Matches Postman's modern interface (e.g. methods and status code color badges). Support for toggling Light Mode.
- **Resizable Workspaces**: Drag-and-drop handles to adjust sidebar width and vertically resize the response panel.
- **Persistent Local History**: Full history of all sent requests showing execution time (ms), payload size, date, status code, and errors. Reopening a history item restores the exact request state and the cached response!
- **Active Environments & Variables**: Create environment sets and configure custom variables (e.g., `{{BASE_URL}}`, `{{TOKEN}}`). Variables resolve server-side during proxy runs.
- **Interactive Keyboard Shortcuts**:
  - `Ctrl + Enter` — Send active request
  - `Ctrl + S` — Save/Update active request
  - `Ctrl + Y` — Open a new tab
  - `Ctrl + Q` — Close active tab

### Bonus Features (Included)
- **Postman Collection Import**: Import standard Postman Collection v2/v2.1 JSON files into your workspace directly.
- **Postman Collection Export**: Export your workspace collections as standard Postman v2.1 files for portability.
- **One-Click Code Generation**: Generate production-ready code snippets for `cURL` and JavaScript `Fetch` APIs from the active editor configuration.

---

## 🛠️ Technology Stack

| Component | Technology | Version / Details |
|---|---|---|
| **Frontend Framework** | Next.js (App Router) | v16.2.9 (React 19) |
| **State Management** | Zustand | v5.0.14 |
| **Data Fetching** | TanStack React Query | v5.101.1 |
| **Styling** | Tailwind CSS | v4.0.0 (CSS variables config) |
| **HTTP Client** | Axios | v1.18.1 |
| **Icons** | Lucide React | v1.21.0 |
| **Backend Framework** | FastAPI | v0.115.6 |
| **Database ORM** | SQLAlchemy | v2.0.36 |
| **Database Migrations** | Alembic | v1.14.1 |
| **Proxy Runner** | HTTPX | v0.28.1 |
| **Database** | PostgreSQL | Neon Serverless |

---

## 📁 Repository Structure

```
postmanclone/
├── backend/                   # FastAPI Server App
│   ├── alembic/               # DB Migrations
│   ├── app/
│   │   ├── core/              # Config & Exceptions
│   │   ├── database/          # Connection & Session
│   │   ├── models/            # SQLAlchemy Schemas
│   │   ├── repositories/      # DB Query Handlers
│   │   ├── services/          # Business logic & Proxy
│   │   ├── routers/           # FastAPI Controllers
│   │   └── utils/             # Variables Resolver
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml            # Render Blueprint spec
│   └── seed.py                # Initial database seed script
├── frontend/                  # Next.js App
│   ├── app/                   # App Router pages & globals
│   ├── components/            # App Shell & custom panels
│   ├── features/              # TanStack Query custom hooks
│   ├── hooks/                 # Keyboard shortcuts & resizers
│   ├── lib/                   # Theme settings & formatting
│   ├── store/                 # Zustand tab, env, & UI stores
│   ├── types/                 # TypeScript definitions
│   └── tailwind.config.js     # Postman theme Tailwind configs
└── README.md
```

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database

### 1. Backend Setup
1. Open terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/postman_clone
   CORS_ORIGINS=http://localhost:3000
   ENVIRONMENT=development
   DEFAULT_TIMEOUT=30
   ```
5. Run migrations:
   ```bash
   alembic upgrade head
   ```
6. Seed default collections & environments:
   ```bash
   python seed.py
   ```
7. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Open terminal in the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Deployment Instructions

### 1. Database & Backend Deployment (Render)

We recommend deploying both the PostgreSQL database and FastAPI backend together on **Render** using the provided `render.yaml` Blueprint or manual settings.

#### Option A: Manual Setup (Render Dashboard)
1. **Create PostgreSQL Database**:
   - Go to Render and create a new **PostgreSQL** service.
   - Choose the **Free** tier (or appropriate).
   - Once created, copy the **Internal Database URL** (for backend inside Render) and **External Database URL** (for local migrations).
2. **Create Web Service**:
   - Create a new **Web Service** on Render and connect your GitHub repository.
   - Set **Root Directory** to `backend`.
   - Set **Runtime** to `Python`.
   - Set **Build Command** to:
     ```bash
     pip install -r requirements.txt && alembic upgrade head && python seed.py
     ```
   - Set **Start Command** to:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
3. **Configure Environment Variables**:
   - `DATABASE_URL`: Set to your Render Database connection URI.
   - `CORS_ORIGINS`: Set to your deployed Vercel frontend URL (e.g. `https://your-app.vercel.app`).
   - `ENVIRONMENT`: `production`

#### Option B: Render Blueprint (`render.yaml`)
Simply select **Blueprints** in Render, connect your repo, and Render will automatically parse the `backend/render.yaml` file to provision the database and web service with the correct dependencies and scripts.

---

### 2. Frontend Deployment (Vercel)

The Next.js 16 frontend is optimized for **Vercel** deployment:

1. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository.
3. In the project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed FastAPI backend URL on Render (e.g. `https://postman-clone-api.onrender.com/api/v1`).
5. Click **Deploy**. Vercel will build and serve your app globally.

---

## 🎨 Database Design (Entity Relationship)

```mermaid
erDiagram
    users ||--o{ collections : "owns"
    users ||--o{ environments : "owns"
    users ||--o{ history : "owns"
    users ||--o{ open_tabs : "has"
    collections ||--o{ requests : "contains"
    environments ||--o{ environment_variables : "has"

    users {
        uuid id PK
        varchar name
        varchar email
    }
    collections {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar description
        int sort_order
    }
    requests {
        uuid id PK
        uuid collection_id FK
        varchar name
        varchar method
        text url
        jsonb headers
        jsonb params
        jsonb body
        varchar body_type
        varchar auth_type
        jsonb auth_data
        int sort_order
    }
    environments {
        uuid id PK
        uuid user_id FK
        varchar name
        boolean is_active
    }
    environment_variables {
        uuid id PK
        uuid environment_id FK
        varchar key
        text value
        boolean enabled
    }
    history {
        uuid id PK
        uuid user_id FK
        varchar method
        text url
        jsonb request_headers
        jsonb request_params
        jsonb request_body
        varchar body_type
        varchar auth_type
        jsonb auth_data
        int response_status
        jsonb response_headers
        text response_body
        float response_time_ms
        int response_size_bytes
        varchar error_message
        timestamp created_at
    }
    open_tabs {
        uuid id PK
        uuid user_id FK
        uuid request_id FK
        uuid history_id FK
        varchar tab_type
        varchar title
        jsonb unsaved_state
        boolean is_active
        int sort_order
    }
```
