# EchoSales AI — Autonomous AI Sales Voice Agent

EchoSales AI is a full-stack, autonomous AI sales representative platform powered by **Google Gemini** (`@google/genai`). It conducts real-time voice and text conversations in **English, Hindi, and Hinglish**, qualifies leads with a 0–100 scoring engine, retrieves verified product answers via a **RAG Knowledge Base**, books appointments autonomously, updates CRM records, and generates executive business insights.

---

## Key Features

- **AI Sales Command Center**: Signature dark-mode interface with a reactive animated AI Orb (`idle`, `listening`, `thinking`, `speaking`, `completed`), real-time Web Audio API waveform, Web Speech API STT/TTS, and live transcript.
- **Autonomous Agentic Workflow**: Gemini function calling (`search_knowledge_base`, `create_lead`, `update_lead`, `calculate_lead_score`, `check_appointment_availability`, `book_appointment`, `create_follow_up`, `get_customer_history`, `mark_lead_qualified`) with loop protection.
- **RAG Knowledge Base**: Upload `.pdf`, `.txt`, or `.md` files (or create manual entries). Automatically chunks text, generates Gemini embeddings (`text-embedding-004`), and retrieves context via cosine similarity with source citations.
- **Leads & CRM**: Complete CRUD with search, status filtering, 0–100 lead score progress bars, sentiment indicators, and a slide-out detail drawer.
- **Appointment Scheduling**: Interactive slot availability checker, double-booking prevention, confirmation/cancellation, and autonomous AI booking.
- **Call History & Summarization**: Full transcripts with one-click Gemini structured call summaries (pain points, objections, buying signals, next action).
- **Analytics & AI Insights**: Recharts visualizations (Area, Pie, Bar charts) plus Gemini-powered revenue & pipeline insights.
- **Resilient Hybrid/Demo Mode**: Starts cleanly even if MongoDB or a Gemini API key is unavailable, with realistic sample data and clear mode indicators.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React, Axios
- **Backend**: Node.js, Express, TypeScript, WebSocket (`ws`), Multer, `pdf-parse`, JWT, Bcrypt
- **Database**: MongoDB & Mongoose (with automatic in-memory Demo Store fallback)
- **AI**: Google Gemini API via official `@google/genai` SDK

---

## Getting Started

### 1. Environment Variables

Copy `.env.example` to `.env` in the project root and configure:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_LIVE_MODEL=gemini-2.0-flash-live-001
GEMINI_EMBEDDING_MODEL=text-embedding-004
MONGODB_URI=mongodb://localhost:27017/echosales
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

> **Security Note**: `GEMINI_API_KEY` is strictly server-side and never exposed to the browser or client bundle.

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Run Development Servers

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

---

## API Overview

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | JWT Authentication |
| `GET/POST /api/leads`, `PUT/DELETE /api/leads/:id` | CRM Lead CRUD |
| `GET/POST /api/calls`, `POST /api/calls/:id/summarize` | Call history & Gemini summarization |
| `GET /api/appointments/availability`, `POST/PUT/DELETE /api/appointments` | Appointment scheduling |
| `GET /api/knowledge`, `POST /api/knowledge/upload`, `POST /api/knowledge/search` | RAG document pipeline |
| `POST /api/agent/initialize`, `POST /api/agent/chat`, `GET/PUT /api/agent/config` | Autonomous AI agent & tool calling |
| `GET /api/analytics/dashboard`, `POST /api/analytics/insights` | Pipeline metrics & AI insights |

---

## Demo Mode

If `MONGODB_URI` is unreachable or `GEMINI_API_KEY` is omitted, EchoSales AI automatically activates **Hybrid/Demo Mode** with realistic pre-populated leads, calls, appointments, and RAG knowledge documents so every page and workflow remains interactive.
