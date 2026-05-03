# 🌌 Team Task Manager – Premium Collaboration Platform

Team Task Manager is a high-end, production-ready SaaS platform designed for modern teams. It combines advanced project management with **real-time collaboration**, **gamification**, and a stunning **Zenith Glassmorphism** design system.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20Node%20%7C%20Socket.io%20%7C%20MongoDB-indigo?style=for-the-badge)

## ✨ Premium Features

### 🎨 Zenith Glassmorphism UI
- **Futuristic Aesthetics**: Deep frosted-glass panels with `backdrop-blur-3xl` and interactive hover effects.
- **Nebula Background**: Unique motion-based Aurora effects that adapt specifically to Dark and Light modes.
- **Theme Parity**: Seamless transition between high-contrast Dark Mode and elegant Light Mode.
- **Ultra-Responsive**: Optimized for every device, featuring a floating mobile sidebar and responsive grids.

### 🛡️ Admin Command Center (Real-Time)
- **System Health Monitor**: Live tracking of server latency, CPU load, and active socket connections.
- **Global Broadcast Tool**: Admins can send real-time announcements to all online members instantly.
- **Advanced Analytics**: Interactive Pie and Bar charts (Recharts) for task distribution and team productivity.
- **User Governance**: Full control over user roles, permissions, and account management.

### 💬 Real-Time Collaboration Hub
- **Dual-Mode Chat**: Integrated Global Team Chat and private Direct Messaging.
- **Unread Tracking**: Smart message indicators and unread counters for seamless communication.
- **Socket.io Integration**: Zero-latency message delivery and real-time activity notifications.

### 🏆 Gamification & Team Hub
- **Leaderboard System**: Level up and earn XP by completing tasks. Track the top performers in the organization.
- **Presence Indicators**: Real-time status pickers (Available, Focus Mode, In a Meeting, Out of Office).
- **Productivity Bars**: Visual tracking of individual and team-wide completion rates.
- **Member Detail Modals**: Deep insights into member skills, bio, and performance stats.

### 📋 Task Mastery
- **AI Task suggestions**: Smart engine analyzes project intent to suggest the best starting tasks automatically.
- **Project RBAC**: Advanced role-based access control managed at the individual project level.
- **Interactive Kanban**: Smooth drag-and-drop workflow with real-time state persistence and premium animations.
- **My Tasks View**: A specialized, focused workspace for individual contributors.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 (Custom Design System)
- **Animations**: Framer Motion (Micro-interactions & 3D Tilt effects)
- **Real-Time**: Socket.io-client
- **Charts**: Recharts (High-performance SVG charts)
- **Icons**: Lucide React
- **3D Effects**: Three.js integration

### Backend
- **Server**: Node.js & Express.js
- **Database**: MongoDB with Mongoose
- **Real-Time**: Socket.io (WebSockets)
- **Security**: JWT-based Authentication, Bcrypt.js hashing
- **File Handling**: Multer (Profile picture & asset management)

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
   FRONTEND_URL=http://localhost:3000
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
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
   Start the application:
   ```bash
   npm run dev
   ```

---

## 📡 API & Socket Architecture

### Key API Endpoints
- `GET /api/admin/analytics` - System-wide productivity & activity data.
- `POST /api/notifications/broadcast` - Send notifications to all users.
- `GET /api/users/leaderboard` - Fetch top performers based on XP.
- `GET /api/chat/global` - Retrieve team conversation history.

### Socket Events
- `activity` - Real-time system activity logging.
- `new_message` / `new_private_message` - Instant communication.
- `adminBroadcast` - High-priority system announcements.
- `activeUsersUpdate` - Real-time presence tracking.

---

## 👨‍💻 Connect with the Creator

- **LinkedIn**: [Saurabh Anand](https://www.linkedin.com/in/saurabh-anand-113271249/)
- **GitHub**: [Sau2rabh](https://github.com/Sau2rabh)

---

## 📄 License
Licensed under the [MIT License](LICENSE). Built with ❤️ for modern, high-performance teams.

