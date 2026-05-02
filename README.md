# 🌌 Team Task Manager – Smart Team Task Manager

Team Task Manager is a high-end, production-ready SaaS platform designed for modern teams. It combines advanced project management with **AI-powered intelligence** and a stunning **Zenith Glassmorphism** design system.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node%20%7C%20MongoDB-indigo?style=for-the-badge)

## ✨ Premium Features

### 🎨 Zenith Glassmorphism UI
- **Futuristic Aesthetics**: Deep frosted-glass panels with `backdrop-blur-3xl` and sharp light-edge borders.
- **Nebula Backgrounds**: Dynamic, animated nebula-style backgrounds that breathe life into the workspace.
- **Theme Intelligence**: Fully integrated Light and Dark modes with seamless transition parity.
- **Ultra-Responsive**: Optimized for everything from mobile phones to high-resolution monitors.

### 🤖 AI Task Forge
- **Intelligent Suggestions**: Leverage AI to automatically generate project tasks based on your project description.
- **Workflow Automation**: One-click task generation to jumpstart your team's productivity.

### 🛡️ Advanced Security & RBAC
- **Project-Level Permissions**: Granular Role-Based Access Control (Admin, Member, Viewer) managed at the project level.
- **Secure Authentication**: JWT-based security with bcrypt hashing and protected API routes.

### 📊 Real-time Analytics
- **Dynamic Dashboard**: Interactive performance metrics, overdue task detection, and efficiency tracking.
- **System Analytics**: Admin-level insights into global team productivity and system-wide task distribution.

### 📋 Task Mastery
- **Kanban Precision**: Smooth drag-and-drop workflow with real-time state persistence.
- **Project Timelines**: Visual tracking of project milestones and member contributions.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 (Theme Variables & Utilities)
- **Animations**: Framer Motion (Micro-interactions & Transitions)
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **Server**: Node.js & Express.js
- **Database**: MongoDB with Mongoose
- **Security**: JSON Web Tokens (JWT), Bcrypt.js
- **Validation**: Zod (Schema-based validation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB (Local or Atlas instance)

### Quick Setup

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd team-task-manager
   ```

2. **Backend Configuration**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_ultra_secure_secret
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   Start the application:
   ```bash
   npm run dev
   ```

---

## 📡 API Architecture

### Authentication
- `POST /api/auth/signup` - Register a new account
- `POST /api/auth/login` - Authenticate and retrieve token

### Project Infrastructure
- `GET /api/projects` - Retrieve all projects for the user
- `POST /api/projects` - Create a new project (Admin)
- `PATCH /api/projects/:id/members` - Update member roles
- `POST /api/projects/ai-suggestions` - Generate AI task suggestions

### Task Management
- `GET /api/tasks/project/:projectId` - Fetch tasks for a specific project
- `POST /api/tasks` - Create a task within a project
- `PUT /api/tasks/:id` - Update task status or metadata
- `GET /api/tasks/stats` - Fetch real-time workspace statistics

---

## 📄 License
Licensed under the [MIT License](LICENSE). Built with ❤️ for modern teams.
