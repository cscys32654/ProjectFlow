# ProjectFlow — Full-Stack Project Management App

A Jira/Trello-inspired project management tool with role-based access control.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + React DnD
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Auth**: JWT + bcryptjs

## Local Setup

### Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev            # runs on http://localhost:5000

### Frontend
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # runs on http://localhost:5173

## Deployment
- **Backend → Railway**: set env vars in Railway dashboard, deploy from GitHub
- **Frontend → Vercel**: set VITE_API_URL to Railway backend URL, deploy from GitHub

## Roles
| Feature              | Admin | Member |
|----------------------|-------|--------|
| Create project       | ✅    | ❌     |
| Add/remove members   | ✅    | ❌     |
| Create/edit tasks    | ✅    | ❌     |
| Update task status   | ✅    | ✅ (own tasks only) |
| View Kanban board    | ✅    | ✅     |
| Dashboard stats      | ✅    | ✅ (own tasks) |