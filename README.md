# InterviewForge — AI-Powered Interview Preparation Platform

InterviewForge is an AI-powered interview preparation platform that helps candidates practice technical and behavioral interviews, receive AI-generated feedback, identify weak areas, and build a personalized preparation roadmap.

The platform combines **AI evaluation, Retrieval-Augmented Generation (RAG), speech-to-text, analytics, and personalized learning** into a single interview practice workflow.

## Key Features

* **AI-Powered Mock Interviews**

  * Generate interview questions based on company, role, difficulty, and interview type.
  * Support technical, behavioral, and system-design interview practice.
  * Conduct interviews through a structured question-by-question workflow.

* **AI Answer Evaluation**

  * Evaluate candidate answers using an LLM.
  * Analyze:

    * Technical correctness
    * Communication
    * Depth of explanation
    * Strengths
    * Areas for improvement
    * Suggested/improved answers
  * Calculate the final score using deterministic backend logic instead of relying entirely on the LLM.

* **RAG-Based Question Generation**

  * Retrieve relevant company/role-specific interview questions using semantic search.
  * Generate embeddings using `Xenova/all-MiniLM-L6-v2`.
  * Store and retrieve vectors using Pinecone.
  * Use retrieved questions as contextual information for LLM-based question generation.
  * Gracefully fall back to normal AI generation if vector retrieval is unavailable.

* **Voice-Based Answers**

  * Support browser-based speech recognition for answering questions using voice.
  * Display real-time microphone activity through an audio-level visualization.
  * Convert speech into text before submitting the answer to the backend.

* **Performance Analytics**

  * Track interview performance over time.
  * Analyze technical, communication, and depth scores.
  * Identify strong and weak topics.
  * Track performance across companies, roles, difficulties, and question categories.

* **Personalized Roadmap**

  * Generate a preparation roadmap based on interview performance.
  * Use identified weak areas to recommend focused preparation.
  * Track roadmap task completion.

* **Interview History**

  * Store completed interviews.
  * Review previous questions, answers, evaluations, and scores.
  * Maintain historical performance data.

## Architecture

```text
                         React Frontend
                              |
                         HTTPS / REST
                              |
                              v
                       Express.js API
                              |
            +-----------------+-----------------+
            |                 |                 |
            v                 v                 v
       Authentication     Interview         Analytics
            |              Service             |
            |                 |                 |
            v                 v                 v
           JWT           AI Service          MongoDB
                              |
                   +----------+----------+
                   |                     |
                   v                     v
                Gemini                OpenAI
                   |
                   v
                   RAG
                   |
          +--------+---------+
          |                  |
          v                  v
   Local Embeddings       Pinecone
   all-MiniLM-L6-v2          |
          |                  |
          +--------+---------+
                   |
                   v
                MongoDB
```

## Technology Stack

### Frontend

* React.js
* Vite
* React Router
* Context API
* Axios
* Tailwind CSS
* Browser Speech Recognition API
* Web Audio API

### Backend

* Node.js
* Express.js
* Mongoose
* Joi
* JWT
* bcrypt
* Helmet
* CORS
* Morgan
* express-rate-limit

### Database & Search

* MongoDB
* Pinecone
* `Xenova/all-MiniLM-L6-v2` embeddings

### AI

* Google Gemini
* OpenAI API

---

# Core Workflow

## 1. User Authentication

```text
User
 |
 | Register/Login
 v
Express API
 |
 +--> Validate request
 |
 +--> Hash/verify password using bcrypt
 |
 +--> Generate JWT
 |
 v
Authenticated User
```

JWT is used to authenticate protected API requests.

The backend verifies the token and associates the authenticated user with interview sessions and other resources.

---

## 2. Starting an Interview

```text
React
  |
  | POST /interviews/start
  v
Authentication
  |
  v
Validation
  |
  v
Interview Service
  |
  v
RAG Retrieval
  |
  v
Gemini/OpenAI
  |
  v
Generated Questions
  |
  v
MongoDB
  |
  v
Interview Session
```

The generated questions are stored with the interview session so that the exact questions used during that interview can be preserved.

---

## 3. RAG Pipeline

InterviewForge uses RAG to provide more relevant context to the LLM.

### Indexing

```text
Interview Question
       |
       v
Normalize Question
       |
       v
Generate Embedding
       |
       v
384-dimensional Vector
       |
       v
Pinecone
```

### Retrieval

```text
User Requirements
(company + role + difficulty)
          |
          v
Generate Query Embedding
          |
          v
Pinecone Similarity Search
          |
          v
Relevant Questions
          |
          v
LLM Context
          |
          v
Generated Interview Questions
```

The embedding model used is:

```text
Xenova/all-MiniLM-L6-v2
```

which produces **384-dimensional embeddings**.

Pinecone is used for vector similarity search while MongoDB remains the primary application database for storing complete question records and interview data.

---

# 4. Answer Evaluation

When the candidate submits an answer:

```text
Candidate Answer
      |
      v
Express API
      |
      v
Validate + Authenticate
      |
      v
AI Evaluation Service
      |
      v
Gemini/OpenAI
      |
      v
Structured Evaluation
      |
      v
MongoDB
```

The evaluation contains metrics such as:

```text
Technical Score
Communication Score
Depth Score
Feedback
Strengths
Improvements
Suggested Answer
```

The final overall score is calculated by backend logic using weighted component scores rather than blindly trusting an LLM-generated overall score.

This makes the final calculation deterministic and easier to reproduce.

---

# 5. Voice Interview Flow

InterviewForge uses browser capabilities for voice interaction.

```text
Microphone
    |
    +----------------------+
    |                      |
    v                      v
Web Audio API       Speech Recognition
    |                      |
    v                      v
Audio Visualization     Transcript
                           |
                           v
                     React State
                           |
                           v
                     Backend API
```

The current implementation uses browser speech recognition rather than a real-time WebRTC audio/video communication system.

---

# 6. Analytics Pipeline

After interviews are completed, the backend analyzes historical performance.

```text
Completed Interviews
        |
        v
MongoDB Aggregation
        |
        +----> Overall Performance
        |
        +----> Topic Performance
        |
        +----> Company Performance
        |
        +----> Difficulty Performance
        |
        v
Strong / Weak Areas
```

MongoDB aggregation pipelines are used to perform server-side calculations rather than transferring all historical data to the frontend.

---

# 7. Personalized Roadmap

Analytics are used to generate a personalized preparation roadmap.

```text
Interview History
       |
       v
Performance Analytics
       |
       v
Weak Topics
       |
       v
Roadmap Prompt
       |
       v
LLM
       |
       v
Structured Roadmap
       |
       v
MongoDB
```

The roadmap stores an analytics snapshot so that the reasoning behind a previously generated roadmap can be preserved even when the user's performance changes later.

---

# Security

The backend includes several security measures:

* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization middleware
* Request validation using Joi
* CORS configuration
* Helmet security headers
* API rate limiting
* Request body size limits
* User-level resource authorization
* Sensitive user fields excluded from API responses

Protected resources are associated with the authenticated user's ID to prevent unauthorized access to another user's interview sessions.

---

# Error Handling

The backend uses centralized error handling and asynchronous error propagation.

AI responses are parsed and validated before being used by the application.

If RAG retrieval fails, the application can fall back to normal LLM-based question generation instead of failing the entire interview flow.

This provides graceful degradation when the vector search layer is unavailable.

---

# Scalability Considerations

The current implementation is designed as a modular monolithic backend, which keeps development and deployment relatively simple.

The architecture can be extended as traffic increases.

## Future Scalable Architecture

```text
                         CDN
                          |
                    React Frontend
                          |
                    Load Balancer
                          |
              +-----------+-----------+
              |           |           |
             API         API         API
              |           |           |
              +-----------+-----------+
                          |
                       Redis
                          |
                    Message Queue
                          |
             +------------+------------+
             |                         |
        AI Worker 1               AI Worker 2
             |                         |
             +------------+------------+
                          |
                    Gemini/OpenAI

                          |
                       MongoDB
                    /           \
               Primary        Replicas

                          |
                       Pinecone
```

Potential future improvements include:

### Distributed Rate Limiting

The current rate limiter can be moved to Redis so that multiple backend instances share the same rate-limit state.

### Asynchronous AI Processing

Expensive AI evaluation and roadmap generation can be moved to background workers using a queue such as BullMQ.

Benefits:

* Better API responsiveness
* Retry support
* Backpressure
* Independent worker scaling
* Better handling of traffic spikes

### Horizontal Scaling

Multiple stateless Express instances can run behind a load balancer.

Shared state would be moved to external systems such as:

* MongoDB
* Redis
* Pinecone
* Object storage where required

### Caching

Frequently accessed data such as:

* company metadata
* frequently retrieved questions
* selected analytics
* generated content

can be cached using Redis.

Caching would reduce database load and response latency, at the cost of cache invalidation complexity and possible stale data.

### AI Provider Failover

The AI abstraction layer can support provider fallback:

```text
Gemini
   |
 failure
   v
OpenAI
```

This can improve availability when an AI provider experiences outages or rate limits.

### Improved RAG

The retrieval pipeline can be extended with:

* metadata filtering
* reranking
* retrieval evaluation
* better embedding models
* hybrid keyword + vector search
* query expansion

### Production Observability

Future deployments can add:

* structured logging
* request IDs
* metrics
* distributed tracing
* AI latency monitoring
* token/cost monitoring
* RAG retrieval metrics
* error tracking

---

# Design Tradeoffs

| Decision                   | Why                                  | Tradeoff                               |
| -------------------------- | ------------------------------------ | -------------------------------------- |
| MongoDB                    | Flexible interview/session documents | Less natural for relational queries    |
| Pinecone                   | Efficient semantic retrieval         | Additional infrastructure/dependency   |
| Local embeddings           | No per-request embedding API cost    | Uses application CPU/memory            |
| JWT                        | Simple stateless authentication      | Token revocation is more difficult     |
| sessionStorage             | Preserves active interview state     | Client state can be modified           |
| AI evaluation              | Provides semantic feedback           | Non-deterministic and costly           |
| Backend score calculation  | Deterministic scoring                | Requires explicit scoring rules        |
| Browser speech recognition | Simple voice interaction             | Browser compatibility limitations      |
| Synchronous AI calls       | Simple implementation                | Increases request latency              |
| MongoDB aggregation        | Efficient server-side analytics      | Complex pipelines can become expensive |
| Optimistic UI              | Responsive user experience           | Requires rollback/error handling       |

---

# Future Enhancements

The following are **planned scalability and product enhancements**, not claims about the current implementation:

* Redis-backed distributed rate limiting
* BullMQ/Redis-based background AI workers
* WebSocket/SSE-based real-time interview updates
* Real-time collaborative interview sessions
* Secure code execution sandbox for coding interviews
* WebRTC-based real-time audio/video interviews
* Object storage for recorded interview media
* Advanced hybrid RAG with reranking
* AI provider failover
* Horizontal API scaling
* Database read replicas
* Advanced observability and distributed tracing

These components can be introduced independently as the application's traffic and feature requirements grow.

---

# Project Structure

```text
InterviewForge/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   └── api/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── rag/
│   ├── utils/
│   └── validators/
│
└── README.md
```

The backend follows a layered architecture:

```text
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Services
   ↓
Models / External APIs
```

This separation keeps HTTP handling, business logic, persistence, and external AI integrations independent.

---

# Key Engineering Concepts Demonstrated

* REST API design
* JWT authentication
* Password hashing
* Role-based authorization
* Middleware architecture
* Request validation
* Rate limiting
* Centralized error handling
* MongoDB schema design
* MongoDB aggregation
* Database indexing
* Pagination
* Vector databases
* Embeddings
* Retrieval-Augmented Generation
* LLM integration
* Structured AI output
* Deterministic scoring
* Browser Speech Recognition
* Web Audio API
* React Context
* Custom React hooks
* Optimistic UI
* Graceful degradation
* API abstraction
* Scalable system architecture

---

# Summary

InterviewForge demonstrates an end-to-end AI application architecture:

```text
React
  ↓
Express
  ↓
Authentication + Validation
  ↓
Interview Service
  ↓
RAG + LLM
  ↓
MongoDB
  ↓
Analytics
  ↓
Personalized Roadmap
```

The current implementation focuses on delivering the core interview, AI evaluation, RAG, analytics, voice-input, and roadmap workflows while maintaining clear extension points for distributed processing, caching, real-time communication, and horizontal scaling.
