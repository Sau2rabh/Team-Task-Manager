# 🌌 Team Task Manager – Frontend Client

This is the Next.js frontend for the Team Task Manager platform, featuring a premium **Zenith Glassmorphism** design system and AI-powered task management interfaces.

## 🚀 Key Features
- **Zenith Glassmorphism UI**: High-fidelity frosted glass aesthetics and animated backgrounds.
- **Responsive Navigation**: Collapsible sidebar and mobile-optimized headers.
- **AI Task Forge UI**: Interactive interface for AI task generation.
- **Kanban Board**: Drag-and-drop task management using `@dnd-kit`.
- **Theme Parity**: Seamless transition between sophisticated Light and Dark modes.

## 🛠️ Tech Stack
- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Framer Motion**
- **Lucide React**
- **Axios** (API Client)
- **Sonner** (Toasts)

## 📦 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

## 🎨 Design System
The project uses a custom design system defined in `globals.css` using Tailwind v4 `@theme` and `@utility` layers.

- **`glass`**: Main utility for frosted glass panels.
- **`glass-card`**: Interactive card utility with hover effects.
- **`text-gradient`**: Branding-aligned gradient text.

---
Built with ❤️ for modern teams.
