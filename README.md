# Aria — Autonomous AI Technical Assessment & Proctoring Platform

<div align="center">

![Aria Platform Banner](https://img.shields.io/badge/Aria-AI%20Technical%20Assessment-B08D3E?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express%205-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%206-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Swagger UI](https://img.shields.io/badge/Swagger%20OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)

<p align="center">
  <b>An end-to-end AI interviewer that conducts adaptive voice assessments, parses candidate resumes, detects cheating in real time, and produces comprehensive evaluation scorecards for candidates and recruiters.</b>
</p>

[Explore Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API & Swagger Docs](#-api-documentation--swagger-ui) • [Configuration](#-environment-configuration)

</div>

---

## 🌟 Overview

**Aria** is an enterprise-grade AI technical assessment platform built with a high-fidelity 3D aesthetic and state-of-the-art multimodal AI. Traditional technical screening relies on rigid multiple-choice questions or static coding tests. Aria replaces this with an **adaptive, spoken technical conversation** tailored specifically to the candidate's actual resume projects, architecture choices, and real-world trade-offs.

Aria operates in two distinct operational modes:
1. **Candidate Practice Mode**: Software engineers practice real-time technical interviews, receiving instant structured feedback, preparation tips, and scoring breakdowns.
2. **Recruiter Screening Mode**: Hiring teams configure tailored interview campaigns with customized role requirements, focus topics, and mandatory questions. Aria delivers unique invite links to candidates, conducts the interview with automated camera/tab proctoring, and emails complete scorecards and hiring recommendations back to the recruiter.

---

## ⚡ Key Features

### 🎙️ Adaptive AI Interviewer (Google Gemini)
- **Context-Aware Dialogue**: Aria does not repeat static questions. It dynamically analyzes candidate answers and probes deeper into architectural trade-offs, edge cases, and technical decisions.
- **Voice & Speech-to-Text Pipeline**: Candidates can speak naturally or type responses. Integrated speech-to-text processes microphone audio via Gemini audio models.
- **Audio Feedback**: Aria verbalizes questions with natural voice output for an authentic face-to-face interview dynamic.

### 📄 Intelligent Resume Parsing
- **Multipart PDF/DOCX Parsing**: Extracts candidate skills, tech stacks, experience levels, and past project details using `pdf-parse` and `mammoth`.
- **Project-Grounded Questioning**: Generates technical challenges anchored directly in the candidate’s verifiable background (e.g., querying real performance optimizations mentioned on their resume).

### 👥 Dual Interview Modes
- **Candidate Practice**:
  - Self-serve practice sessions across Junior, Mid, and Senior difficulty levels.
  - Comprehensive post-interview summary highlighting technical strengths, blind spots, and concrete preparation advice.
- **Recruiter Screening**:
  - Dedicated Recruiter Portal (`/recruiters`) to configure job titles, seniority level, target questions, and candidate information.
  - Automated candidate email invitations with secure interview links.
  - Automated email delivery of executive evaluation scorecards upon interview completion.

### 🛡️ Multi-Factor Proctoring & Integrity Defense
- **Real-Time Video Feed**: In-browser camera monitoring during the interview.
- **Tab-Switch & Focus Tracking**: Instant detection when candidates leave the interview window or switch applications.
- **2-Strike Violation Protocol**:
  - *Strike 1*: Visual warning and recorded violation timestamp.
  - *Strike 2*: Immediate interview termination with an integrity failure report logged in PostgreSQL.

### 🎨 3D Modern Editorial Design System
- **Three.js Visualizations**: Interactive 3D geometric hero asset on the landing page with dynamic lighting and camera interactions.
- **Obsidian & Antique Brass Theme**: Styled with a dark palette (`#10121B` obsidian, `#B08D3E` antique brass, `#EDE8DA` parchment).
- **Responsive Scroll Animations**: Modern, fluid UI animations built with Tailwind CSS v4 and Next.js 16.

### 📖 Interactive Swagger / OpenAPI 3.0 API Documentation
- Built-in Swagger UI exposed directly at [`/api-docs`](http://localhost:5000/api-docs) and [`/docs`](http://localhost:5000/docs).
- Interactive **"Try it out"** testing for all 15 backend routes with Bearer JWT authorization.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend — Next.js 16 (React 19, Tailwind v4, Three.js)"]
        Landing["Landing Page (/)<br/>3D Hero Asset & Animations"]
        CandidateRoom["Interview Room (/interview)<br/>Audio, Webcam & Proctoring"]
        RecruiterPortal["Recruiter Dashboard (/recruiters)<br/>Campaigns & Candidate Invites"]
    end

    subgraph Backend ["Backend — Express 5 & Node.js"]
        API["Express REST API (Port 5000)"]
        Swagger["Swagger UI (/api-docs)"]
        AuthMid["JWT Auth & Security"]
        UploadMid["Multer (Resume & Audio)"]
    end

    subgraph Intelligence ["AI & Storage Engines"]
        Gemini["Google Gemini 1.5 / Flash<br/>Resume Extraction, Audio Transcription, Adaptive Questions, Scorecard Evaluation"]
        DB[(PostgreSQL Database<br/>Prisma ORM)]
        EmbeddedPG["Embedded PostgreSQL (Port 5432)"]
        Mail["Nodemailer (Recruiter Reports)"]
    end

    Landing --> Client
    Client -->|HTTP / JSON & Multipart| API
    API --> Swagger
    API --> AuthMid
    API --> UploadMid
    API -->|Prompt & Multimodal Audio| Gemini
    API -->|Prisma Client| DB
    DB -.-> EmbeddedPG
    API -->|SMTP Email Delivery| Mail
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Styling & 3D** | [Tailwind CSS v4](https://tailwindcss.com/), [Three.js](https://threejs.org/), [Lucide React](https://lucide.dev/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6](https://www.prisma.io/), [Embedded PostgreSQL](https://github.com/thewhodidthis/embedded-postgres) |
| **AI & Multimodal** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini API) |
| **Document & Audio Processing** | `pdf-parse`, `mammoth` (DOCX), `multer` |
| **Authentication & Security** | JWT (`jsonwebtoken`), `bcryptjs`, CORS, Proctoring Focus Handlers |
| **API Documentation** | [OpenAPI 3.0](https://swagger.io/specification/) & [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) (HTML evaluation reports & candidate invites) |

---

## 📁 Project Structure

```text
ai-interview/
├── client/                     # Next.js 16 Frontend
│   ├── public/                 # Static assets, hero visuals, and branding
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── layout.js       # Root layout with fonts & global navigation
│   │   │   ├── page.js         # Homepage with Three.js 3D hero & animations
│   │   │   ├── globals.css     # Tailwind CSS v4 & custom design tokens
│   │   │   ├── interview/      # Real-time interview room (Webcam, Voice, Proctoring)
│   │   │   ├── recruiters/     # Recruiter campaign setup & candidate invites
│   │   │   ├── features/       # Platform features showcase
│   │   │   ├── pricing/        # Tier and plan comparisons
│   │   │   ├── about/          # Mission, editorial brand story
│   │   │   └── faq/            # Frequently asked questions
│   │   ├── components/         # Reusable UI widgets, modals, and 3D canvas
│   │   ├── context/            # React context providers
│   │   └── hooks/              # Custom hooks for audio recording & proctoring
│   └── package.json
│
├── server/                     # Express 5 Backend
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (Candidate, Recruiter, Session, Violations)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Prisma client instance
│   │   │   ├── redis.js        # Redis cache connection
│   │   │   └── swagger.js      # OpenAPI 3.0 specification & custom dark theme
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # Register, Login, OAuth, Profile
│   │   │   ├── resume.controller.js    # Upload, parse, and sample resumes
│   │   │   └── interview.controller.js # Start session, message, transcribe, report
│   │   ├── middleware/         # Auth verification, rate limiting, file upload
│   │   ├── prompts/            # System prompts for Gemini adaptive interviewing
│   │   ├── routes/             # Express API routes
│   │   ├── scripts/
│   │   │   ├── start-db.js     # Embedded PostgreSQL cluster starter
│   │   │   └── test-db.js      # Database connectivity & CRUD test script
│   │   ├── services/           # Gemini AI, Mailer, Storage, and Audio services
│   │   └── index.js            # Express application entry point
│   ├── .env.example
│   └── package.json
│
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ai-interview.git
cd ai-interview
```

---

### 3. Server Configuration & Database Setup

1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create your environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/interview_platform?schema=public"
   GEMINI_API_KEY="your-gemini-api-key-here"
   JWT_SECRET="your-secure-jwt-secret"
   ```

4. **Start the Database**:
   Aria includes an embedded PostgreSQL setup script that works with zero external database installation required:
   ```bash
   # Starts embedded Postgres on port 5432 and auto-creates the database
   npm run db:start
   ```

5. Run database migrations:
   ```bash
   # In a new terminal inside /server
   npm run prisma:push
   ```

6. Start the backend API:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### 4. Client Setup

1. Open a new terminal, navigate to the client folder, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:3000`.*

---

## 📖 API Documentation & Swagger UI

The Express backend includes fully interactive **Swagger / OpenAPI 3.0** documentation styled to match Aria's editorial dark aesthetic.

- **Interactive Playground**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs) (or [http://localhost:5000/docs](http://localhost:5000/docs))
- **Raw OpenAPI JSON Spec**: [http://localhost:5000/api-docs/swagger.json](http://localhost:5000/api-docs/swagger.json)

### Available API Endpoints (15 Routes)

#### 🏥 System Health
- `GET /api/health` — Check status of PostgreSQL, Redis, and Gemini API keys.

#### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a Candidate or Recruiter account.
- `POST /api/auth/login` — Authenticate with email/password and receive JWT.
- `POST /api/auth/oauth` — Exchange Google or GitHub OAuth tokens.
- `GET /api/auth/me` — Retrieve the current authenticated user profile (`Bearer <JWT>`).

#### 📄 Resume Operations (`/api/resume`)
- `POST /api/resume/upload` — Upload PDF/DOCX resume file via `multipart/form-data`.
- `POST /api/resume/parse` — Extract skills, projects, and seniority via Gemini AI.
- `GET /api/resume/sample/{id}` — Retrieve pre-configured mock candidate profiles.

#### 🎙️ Interview Lifecycle & Proctoring (`/api/interview`)
- `POST /api/interview/start` — Initialize a new practice or recruiter screening session.
- `POST /api/interview/transcribe` — Upload microphone audio for speech transcription.
- `POST /api/interview/message` — Submit candidate answer and receive Aria’s adaptive follow-up.
- `POST /api/interview/violation` — Record proctoring alerts (tab-switch, no-face-detected).
- `GET /api/interview/{sessionId}` — Get real-time session status and full message transcript.
- `GET /api/interview/{sessionId}/report` — Retrieve the final AI evaluation report & scorecards.
- `GET /api/interview/{sessionId}/email-preview` — Preview the generated recruiter report email.

---

## 🛡️ Proctoring & Integrity Defense

Aria safeguards technical assessments with active client-side and server-side proctoring:

```text
[Candidate Enters Room]
          │
          ├──> 1. Grants Camera & Microphone Permissions
          │
          ├──> 2. System monitors active window focus & tab visibility
          │
          ├──> [Tab Switch / Window Blur Detected]
          │             │
          │             ├──> Strike 1: On-screen warning modal + violation logged
          │             │
          │             └──> Strike 2: Session terminated + marked as "integrity_violation"
          │
          └──> [Interview Completed]
                        │
                        └──> Complete audit log of violations included in final Recruiter Scorecard
```

---

## ⚙️ Environment Configuration

### Server (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express backend | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/interview_platform?schema=public` |
| `GEMINI_API_KEY` | Google Gemini Studio API Key | `AIzaSy...` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_jwt_secret` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `your_refresh_secret` |
| `REDIS_URL` | Redis cache connection string *(optional)* | `redis://localhost:6379` |
| `SMTP_HOST` | Mail host for recruiter report delivery *(optional)* | `smtp.gmail.com` |
| `SMTP_USER` | SMTP username / email *(optional)* | `recruiter-alerts@company.com` |
| `SMTP_PASS` | SMTP application password *(optional)* | `app-password` |

---

## 📜 Available Scripts

### In `/server`:
- `npm run dev` — Starts Express backend with nodemon/node on port 5000.
- `npm run db:start` — Launches embedded PostgreSQL on port 5432.
- `npm run prisma:generate` — Generates Prisma ORM client models.
- `npm run prisma:push` — Syncs Prisma schema directly to PostgreSQL.
- `npm run test:db` — Runs automated database connectivity and CRUD verification tests.

### In `/client`:
- `npm run dev` — Starts Next.js development server on port 3000 with hot-reloading.
- `npm run build` — Compiles and optimizes Next.js production build.
- `npm run start` — Starts Next.js production server.
- `npm run lint` — Executes ESLint checks across the frontend codebase.

---

## 🤝 Contributing

Contributions are welcome! To get started:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing new feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.
