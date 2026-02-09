# Civic Engine 🏛️

A full-stack civic-tech platform enabling citizens to report local issues, engage with community, and track resolution progress.

![Civic Engine Logo](logo.png)

## ✨ Features

### For Citizens
- 📝 Report civic issues with photos and GPS location
- 🗺️ View issues on an interactive map
- 👍 Upvote and comment on issues
- 📊 Track issue status from reported to resolved

### For Admins
- ✅ Verify and assign issues to departments
- 📈 Analytics dashboard with resolution metrics
- 🔄 Update issue status with full audit trail
- 👥 Manage users and roles

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Leaflet, Axios |
| Backend | Node.js, Express, JWT |
| Database | MongoDB with Mongoose |
| Storage | Cloudinary |
| Maps | Leaflet + OpenStreetMap |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the backend folder and update:

```env
MONGODB_URI=mongodb://localhost:27017/civic-engine
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
civic-engine/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, RBAC, upload
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Express app
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── App.jsx      # Main app
│   └── index.html
└── docker-compose.yml
```

## 🔐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | - |
| POST | `/api/auth/login` | Login | - |
| GET | `/api/issues` | List all issues | - |
| POST | `/api/issues` | Create issue | 🔒 |
| GET | `/api/issues/:id` | Get issue details | - |
| POST | `/api/issues/:id/upvote` | Toggle upvote | 🔒 |
| PATCH | `/api/admin/issues/:id/status` | Update status | 🔒 Admin |

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 👥 User Roles

- **Citizen**: Report issues, upvote, comment
- **Admin**: Verify, assign, resolve issues
- **Super Admin**: Manage users and roles

## 📄 License

MIT License
