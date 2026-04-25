# ConsultSiya

Academic consultation booking system for Mapúa University SOIT.  
Students book consultation slots with professors. Professors manage schedules and log outcomes. Admins monitor all activity.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Backend  | Express.js (Node.js)              |
| Database | PostgreSQL 16                     |
| Auth     | JWT (jsonwebtoken + bcrypt)       |
| Reports  | PDFKit + ExcelJS                  |

---

## Project Structure

```
ConsultSiya/
├── backend/          # Express API server
│   ├── db/           # schema.sql + pg po`ol
│   ├── middleware/   # JWT auth middleware
│   ├── routes/       # auth, schedules, consultations, reports
│   ├── .env          # local env (not committed)
│   ├── .env.example  # env template
│   └── server.js
└── frontend/         # Next.js app
    ├── app/
    │   ├── (auth)/login/     # Login page
    │   ├── (auth)/register/  # Register page
    │   └── dashboard/
    │       ├── student/      # Student dashboard
    │       ├── professor/    # Professor dashboard
    │       └── admin/        # Admin dashboard
    └── lib/api.ts            # Typed API client
```

---

## Getting Started

### Option A — Docker (recommended, one command)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:4000      |
| Database | localhost:5432             |

The database schema is applied automatically on first run.

> **Before going to production** change `JWT_SECRET` in `docker-compose.yml` to a long random string.

To stop and remove containers:

```bash
docker compose down
```

To also wipe the database volume:

```bash
docker compose down -v
```

---

### Option B — Run locally (no Docker)

**Prerequisites:** Node.js 18+, PostgreSQL 16

#### 1. Database

Create a PostgreSQL database named `consultsiya` and run:

```bash
psql -U <user> -d consultsiya -f backend/db/schema.sql
```

#### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in your values
npm install
npm run dev               # starts on http://localhost:4000
```

**Required env vars:**

| Variable       | Description                        |
|----------------|------------------------------------|
| `PORT`         | Port for the Express server (4000) |
| `DATABASE_URL` | PostgreSQL connection string       |
| `JWT_SECRET`   | Secret key for signing JWTs        |

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if your backend runs on a different port:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Roles & Features

### Student
- Browse available consultation slots
- Book a slot (inline form — nature of advising, mode, date)
- View and cancel their own consultations

### Professor
- **My Consultations** — confirm or mark consultations as completed (with action taken, referral, remarks)
- **Manage Schedules** — create and delete availability slots
- **Export Report** — download advising report as PDF or Excel

### Admin
- View all consultations across the system
- Stats: Total / Pending / Confirmed / Completed / Cancelled

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path        | Description        |
|--------|-------------|--------------------|
| POST   | `/register` | Register new user  |
| POST   | `/login`    | Login, returns JWT |

### Schedules — `/api/schedules`
| Method | Path     | Role      | Description                          |
|--------|----------|-----------|--------------------------------------|
| POST   | `/`      | Professor | Create a schedule slot               |
| GET    | `/`      | Any       | List all available slots             |
| GET    | `/mine`  | Professor | List professor's own slots (all)     |
| DELETE | `/:id`   | Professor | Delete own schedule slot             |

### Consultations — `/api/consultations`
| Method | Path            | Role              | Description                  |
|--------|-----------------|-------------------|------------------------------|
| POST   | `/`             | Student           | Book a consultation          |
| GET    | `/`             | Any               | List consultations (scoped)  |
| PATCH  | `/:id/confirm`  | Professor (owner) | Confirm a pending consult    |
| PATCH  | `/:id/cancel`   | Prof / Student    | Cancel (restores slot)       |
| PATCH  | `/:id/complete` | Professor (owner) | Mark complete + add details  |

### Reports — `/api/reports`
| Method | Path      | Role      | Description            |
|--------|-----------|-----------|------------------------|
| GET    | `/excel`  | Professor | Download Excel report  |
| GET    | `/pdf`    | Professor | Download PDF report    |

---

## Database Schema

```
users           — id, email, password_hash, role
students        — id, user_id→users, full_name, student_number, program, year_level
professors      — id, user_id→users, full_name, department
schedules       — id, professor_id→professors, day, time_start, time_end, is_available
consultations   — id, student_id, professor_id, schedule_id, date, status, nature_of_advising, mode
consultation_details — id, consultation_id, action_taken, referral, remarks
```

`status` values: `pending` → `confirmed` → `completed` | `cancelled`
