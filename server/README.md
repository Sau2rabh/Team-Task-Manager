# 🧠 Team Task Manager – Backend API

This is the Node.js/Express.js backend for the Team Task Manager platform. It provides a secure, scalable API for project management, AI task suggestions, and Role-Based Access Control (RBAC).

## 🚀 Key Features
- **Project-Level RBAC**: Specialized middleware for managing Admin, Member, and Viewer roles per project.
- **AI Integration**: Logic for generating task suggestions based on project context.
- **Secure Auth**: JWT authentication with Bcrypt password hashing.
- **Robust Validation**: Schema-based validation using Zod.
- **Dashboard API**: Complex aggregation for productivity metrics and overdue detection.

## 🛠️ Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB / Mongoose**
- **JWT**
- **Zod**

## 📦 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id/members` - Manage roles
- `POST /api/projects/ai-suggestions` - Generate suggestions

### Tasks
- `GET /api/tasks/project/:projectId` - Project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `GET /api/tasks/stats` - Productivity stats

---
Built with ❤️ for modern teams.
