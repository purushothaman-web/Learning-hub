# 🎨 Learning Hub Studio: Interface Engine

The frontend for Learning Hub Studio is a high-performance Single Page Application (SPA) designed with a "Studio Dimmed" aesthetic—prioritizing deep focus, typographical clarity, and real-time interactive feedback.

## 🚀 Technical Highlights

- **⚛️ React 19 Engine**: Leverages the latest React concurrent features for smooth transitions.
- **⚡ Vite 8 Build System**: Instant Hot Module Replacement (HMR) and optimized build pipelines.
- **🎭 Motion Design**: Powered by `Framer Motion` for cinematic transitions and micro-interactions.
- **📊 Adaptive Analytics**: Interactive performance tracking using `Recharts`.
- **🛠️ CSS-in-Logic**: Curated design system using HSL tokens and Tailwind CSS 4.
- **🛡️ Content Security**: Real-time Markdown rendering with `Marked` and `DOMPurify` for safe lesson delivery.

## 📁 Key Component Architecture

- **`Dashboard.tsx`**: The mission control center. Features interactive "Momentum Strategy" popovers, learning heatmaps, and mastery metrics.
- **`TopicLayout.tsx`**: The core pedagogical environment. Houses the lesson content, navigation, and code execution widgets.
- **`Playground.tsx`**: An isolated AI Sandbox for real-time practice and challenge evaluation.
- **`Sidebar.tsx`**: An advanced explorer panel with fuzzy search, nested curriculum tracking, and progress persistence links.
- **`Onboarding.tsx`**: A multi-step flow for career path selection and level assessment.

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Dev Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## 🏗️ State & Persistence
- **Global Sync**: Uses a combination of `React Context` and `Custom Events` to ensure the Sidebar, Dashboard, and Lessons are globally synchronized upon progress updates.
- **Backend Bridge**: Communicates with the Node.js/SQLite backend via a centralized `api.ts` utility layer with built-in error handling.

---
*Crafted for elite developer experiences.*
