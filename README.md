# InterviewForge 🚀

**AI-Powered Real-Time Mock Interview & Coding Assessment Platform**

InterviewForge is a scalable, end-to-end technical interview platform designed to simulate real-world SDE interviews. Featuring live coding sandboxes, real-time WebRTC audio/video interaction, streaming AI feedback, and microsecond-level metrics tracking, InterviewForge helps candidates prepare for top-tier tech placements.

---

## 🌟 Key Features

* **🤖 Real-Time AI Mock Interviews:** Interactive technical and system design sessions powered by LLM streaming (Server-Sent Events) with custom prompt engineering.
* **💻 Isolated Code Sandbox:** Secure execution environment supporting multiple languages (C++, Python, Java, JavaScript) utilizing Docker containers with strict resource limits (`cgroups`, execution timeouts).
* **🎙️ Speech-to-Text & Audio Feedback:** Real-time speech transcription (Whisper/Deepgram integration) with candidate tone and confidence analysis.
* **⚡ WebSockets & CRDT Collaboration:** Synchronous multi-user code editing using Conflict-free Replicated Data Types (CRDTs) for live candidate-interviewer sessions.
* **📊 Dynamic Evaluation Dashboard:** Actionable breakdown of problem-solving skills, algorithmic complexity ($O(N)$ runtime analysis), security checks, and code readability.
* **🛡️ Enterprise-Grade Security:** JWT authentication with rotating refresh tokens (HttpOnly cookies), rate-limiting via Redis, and automated prompt-injection mitigation.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client[React / Next.js Client] -->|HTTPS / SSE| Gateway[API Gateway / NGINX Load Balancer]
    Client -->|WSS| WS[WebSocket Server - State Sync]
    Client -->|WebRTC| P2P[Media Server / WebSockets Signaling]

    Gateway -->|Auth & Routing| API[Core Backend Services]
    API -->|Read/Write| DB[(PostgreSQL Master)]
    API -->|Cache / Rates| Redis[(Redis Cache & Pub/Sub)]
    
    API -->|Enqueue Jobs| Queue[BullMQ / Message Broker]
    Queue --> Worker[Async AI Evaluation Worker]
    Worker -->|Prompting| LLM[OpenAI / Gemini API]
    
    API -->|Execute Code| Sandbox[Docker / gVisor Code Runner]
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js, Tailwind CSS, Monaco Editor, Zustand, WebRTC API |
| **Backend** | Node.js (Express/FastAPI), TypeScript, WebSockets (`ws`), SSE |
| **Databases & Cache** | PostgreSQL (Prisma ORM), Redis (Pub/Sub & Caching) |
| **AI & ML Integration** | OpenAI API (GPT-4o), Google Gemini, Whisper Speech-to-Text |
| **Execution & Queues** | Docker Engine API, BullMQ, NGINX |
| **DevOps & Testing** | GitHub Actions (CI/CD), Jest, k6 Load Testing, Render/AWS |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [Docker Desktop](https://www.docker.com/) (Required for isolated code sandboxes)
* [PostgreSQL](https://www.postgresql.org/) (v14+)
* [Redis](https://redis.io/) (v7+)

---

### Environment Configuration

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/interviewforge?schema=public"
REDIS_URL="redis://localhost:6379"

# Security & Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key_32bytes
JWT_REFRESH_SECRET=your_super_secret_refresh_key_32bytes
CORS_ORIGIN=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx

# Code Sandbox Limits
SANDBOX_TIMEOUT_MS=3000
SANDBOX_MEMORY_LIMIT=128MB
```

---

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/interviewforge.git](https://github.com/your-username/interviewforge.git)
   cd interviewforge
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Database Migration & Seeding:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Build the Sandbox Image:**
   ```bash
   docker build -t interviewforge-runner ./sandbox
   ```

5. **Start Development Servers:**
   ```bash
   # Run backend API & background workers concurrently
   npm run dev

   # In a separate terminal, start the client
   cd client && npm run dev
   ```

---

## 📡 API Reference Overview

### Authentication

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue tokens | No |
| `POST` | `/api/v1/auth/refresh` | Rotate access token via HttpOnly cookie | Yes |

### Mock Interviews & AI Evaluation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/interviews/start` | Initialize a new mock interview session | Yes |
| `POST` | `/api/v1/interviews/submit` | Submit transcript/answer for async AI scoring | Yes |
| `GET` | `/api/v1/interviews/:id/stream` | Stream real-time AI feedback (SSE) | Yes |

### Code Execution Engine

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sandbox/execute` | Run user code against test cases in isolated Docker | Yes |

---

## 🔒 Security & Sandbox Isolation Design

To prevent arbitrary code execution attacks during real-time coding assessments:
1. **Container Isolation:** User submissions execute in ephemeral Docker containers stripped of network interfaces (`--network none`).
2. **Resource Constraints:** Enforced execution caps ($3.0\text{ seconds}$ CPU limit, $128\text{ MB}$ RAM, maximum $20$ concurrent processes).
3. **Idempotency & Rate Limiting:** Redis-backed sliding window prevents payload spamming on high-cost AI evaluations.

---

## 🧪 Running Tests

```bash
# Run backend unit & integration tests
npm run test

# Run k6 load performance test
npm run test:load
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
