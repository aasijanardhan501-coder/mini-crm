# 🚀 Mini CRM — Client Lead Management System

> A production-ready **Client Lead Management System** built on the **MERN Stack** with JWT authentication, role-based access control, and an analytics dashboard.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## ✨ Features

### Core (Required)
- ✅ **Lead Listing** — View all leads with name, email, company, source & status
- ✅ **Status Pipeline** — Update leads: `New → Contacted → Qualified → Converted → Lost`
- ✅ **Notes & Follow-ups** — Add timestamped notes to each lead
- ✅ **Secure Admin Login** — JWT authentication with bcrypt password hashing

### Bonus Features
- ✅ **Search & Filter** — Filter leads by status, source, and search by name/email
- ✅ **Timestamp Tracking** — All leads and activities have `createdAt` timestamps spread over time
- ✅ **Analytics Dashboard** — Charts showing leads by status, source, and pipeline value
- ✅ **Role-Based Access** — Admin / Manager / Viewer roles with different permissions
- ✅ **Activity Audit Log** — Every CRM action is logged with user + timestamp
- ✅ **Profile Stats** — Per-user CRM statistics (leads managed, converted, notes added)
- ✅ **Dark Mode** — Full dark/light theme toggle
- ✅ **Responsive Design** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Charts | Recharts |
| Icons | Lucide React |

---

## 📁 Project Structure

```
Mini CRM/
├── client/                     # React Frontend (Vite)
│   └── src/
│       ├── pages/              # All page components
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth & Toast context
│       ├── api/                # Axios instance + interceptors
│       └── utils/              # Helper functions
│
└── server/                     # Node.js + Express Backend
    ├── models/                 # Mongoose schemas
    ├── controllers/            # Business logic
    ├── routes/                 # API endpoints
    ├── middleware/             # Auth + error handling
    ├── validators/             # Input validation
    └── utils/                  # Response helpers
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js v18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/mini-crm.git
cd mini-crm
```

### 2. Install Dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure Environment
The `.env` files are already configured for local development:
- **Server** → `server/.env` (PORT=5000, MongoDB URI)
- **Client** → `client/.env` (VITE_API_URL=http://localhost:5000/api)

### 4. Seed the Database
```bash
cd server
node seeder.js
```

### 5. Start the App

**Option A — One Click (Windows):**
Double-click `start.bat` in the project root.

**Option B — Manual:**
```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend
cd client && npm run dev
```

### 6. Open in Browser
```
http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@crm.com | password123 | Full access |
| Manager | manager@crm.com | password123 | Manage leads |
| Viewer | viewer@crm.com | password123 | Read only |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/profile` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/auth/profile/stats` | Get user CRM stats |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (filter/search/paginate) |
| POST | `/api/leads` | Create new lead |
| GET | `/api/leads/:id` | Get lead details |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/notes` | Add note to lead |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | KPI metrics |
| GET | `/api/analytics/recent-activity` | Activity feed |

---

## 📸 Pages

| Page | Description |
|------|-------------|
| `/login` | JWT login & sign-up |
| `/` | Dashboard with KPIs & activity feed |
| `/leads` | Full lead table with search & filter |
| `/leads/:id` | Lead detail, status update, notes |
| `/analytics` | Charts & conversion analytics |
| `/profile` | Profile, role badge, CRM stats |

---

## 👨‍💻 Built By

Built as part of **Future Interns — Full Stack Web Development Task 2**

> "I built this system to manage real clients."

---

## 📄 License

MIT License — Free to use and modify.
