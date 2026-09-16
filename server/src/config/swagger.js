const swaggerUi = require("swagger-ui-express");

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Aria AI Interview Platform — REST API",
    version: "1.0.0",
    description: `
### Interactive OpenAPI / Swagger Documentation
Welcome to the **Aria AI Technical Assessment Platform** API.

This API powers:
* 🎙️ **Live Voice Interviews** grounded in real candidate resumes via **Gemini 3.6**.
* 👥 **Dual Modes**: *Self-Directed Practice* & *Recruiter Screening* with automated email dispatches.
* 🛡️ **Anti-Cheating & Proctoring**: Real-time focus violation tracking with a 2-strike policy.
* 📄 **Document Processing**: Robust parsing of PDF and DOCX resumes with prompt-injection defense.
* 🔐 **Authentication**: Email/Password + Google & GitHub OAuth with Bearer JWT tokens.

You can test any endpoint live using the **"Try it out"** buttons below!
    `,
    contact: {
      name: "Aria Engineering Team",
      url: "http://localhost:3000",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "System", description: "Health and service diagnostics" },
    { name: "Authentication", description: "User registration, login, OAuth, and profile" },
    { name: "Resume", description: "Resume file upload, parsing, and sample candidates" },
    { name: "Interview", description: "Interview session lifecycle, voice Q&A, and AI scoring" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from `/api/auth/login` or `/api/auth/register`",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          timestamp: { type: "string", format: "date-time" },
          services: {
            type: "object",
            properties: {
              database: { type: "string", example: "connected" },
              redis: { type: "string", example: "connected" },
              geminiConfigured: { type: "boolean", example: true },
            },
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jesse Pinkman" },
          email: { type: "string", format: "email", example: "jesse@example.com" },
          password: { type: "string", format: "password", example: "password123" },
          role: {
            type: "string",
            enum: ["candidate", "recruiter"],
            default: "candidate",
            example: "candidate",
          },
          organizationName: {
            type: "string",
            example: "Vamonos Pest Tech",
            description: "Required if role is recruiter",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "jesse@example.com" },
          password: { type: "string", format: "password", example: "password123" },
          role: { type: "string", enum: ["candidate", "recruiter"], example: "candidate" },
        },
      },
      OAuthRequest: {
        type: "object",
        required: ["provider"],
        properties: {
          provider: { type: "string", enum: ["google", "github"], example: "google" },
          code: { type: "string", example: "4/0AeanS0..." },
          redirectUri: { type: "string", example: "http://localhost:3000/auth/callback" },
          idToken: { type: "string", description: "Optional raw Google ID token" },
          role: { type: "string", enum: ["candidate", "recruiter"], default: "candidate" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "usr_abc123" },
              name: { type: "string", example: "Jesse Pinkman" },
              email: { type: "string", example: "jesse@example.com" },
              role: { type: "string", example: "candidate" },
            },
          },
        },
      },
      StartInterviewRequest: {
        type: "object",
        properties: {
          candidateName: { type: "string", example: "Jesse Pinkman" },
          candidateEmail: { type: "string", format: "email", example: "jesse@example.com" },
          role: { type: "string", example: "Senior Full Stack Engineer" },
          difficulty: {
            type: "string",
            enum: ["junior", "intermediate", "senior", "staff"],
            default: "senior",
            example: "senior",
          },
          targetQuestionCount: { type: "integer", default: 5, example: 5 },
          mode: {
            type: "string",
            enum: ["practice", "recruiter"],
            default: "practice",
            example: "practice",
          },
          recruiterName: { type: "string", example: "Walter White" },
          recruiterEmail: { type: "string", format: "email", example: "recruiter@veritas.ai" },
          customQuestions: {
            type: "array",
            items: { type: "string" },
            example: [
              "Explain how you handle partition rebalancing during sudden traffic spikes.",
              "Walk me through how you design an idempotency key cache with Redis.",
            ],
          },
          recruiterInstructions: {
            type: "string",
            example: "Focus heavily on distributed consensus and active listening.",
          },
          candidateProfile: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
                example: ["Node.js", "React", "PostgreSQL", "Kafka", "Docker"],
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company: { type: "string", example: "Vamonos Pest Tech" },
                    role: { type: "string", example: "Lead Platform Engineer" },
                    highlights: { type: "string", example: "Architected 50,000 req/sec pipeline" },
                  },
                },
              },
            },
          },
        },
      },
      StartInterviewResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          sessionId: { type: "string", example: "sess_64fae109" },
          interviewUrl: { type: "string", example: "http://localhost:3000/interview?session=sess_64fae109" },
          emailSent: { type: "boolean", example: true },
          isRealEmail: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "I noticed on your résumé that you architected the event processing pipeline at Vamonos Pest Tech...",
          },
          topic: { type: "string", example: "Distributed Systems & Event Streaming" },
          questionType: { type: "string", example: "technical" },
        },
      },
      SubmitMessageRequest: {
        type: "object",
        required: ["sessionId", "answer"],
        properties: {
          sessionId: { type: "string", example: "sess_64fae109" },
          answer: {
            type: "string",
            example: "We implemented cooperative sticky partition assignment in our Kafka consumer groups to eliminate stop-the-world rebalance pauses.",
          },
        },
      },
      SubmitMessageResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          status: { type: "string", enum: ["in_progress", "completed", "terminated"], example: "in_progress" },
          nextQuestion: {
            type: "string",
            example: "That's a solid approach with cooperative rebalancing. How did you handle transient network partitions between consumers and broker coordinators?",
          },
          topic: { type: "string", example: "Network Resilience & Health Checks" },
          questionNumber: { type: "integer", example: 2 },
          targetQuestionCount: { type: "integer", example: 5 },
          report: { type: "object", description: "Populated when status is 'completed'" },
        },
      },
      ViolationRequest: {
        type: "object",
        required: ["sessionId", "type"],
        properties: {
          sessionId: { type: "string", example: "sess_64fae109" },
          type: {
            type: "string",
            enum: ["tab_switch", "window_blur", "no_face_detected", "multiple_faces", "paste_detected"],
            example: "tab_switch",
          },
          actionTaken: { type: "string", example: "warn" },
          evidenceUrl: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Check API and database health",
        description: "Returns health status of PostgreSQL, Redis cache, and Gemini 3.6 API key configuration.",
        responses: {
          200: {
            description: "Service is fully operational",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user (Candidate or Recruiter)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: {
          201: {
            description: "User successfully registered",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { description: "Missing required fields or invalid password length" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with email & password",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: {
            description: "Successfully authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/oauth": {
      post: {
        tags: ["Authentication"],
        summary: "Exchange Google or GitHub OAuth token",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/OAuthRequest" } } },
        },
        responses: {
          200: {
            description: "OAuth exchange successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { description: "Invalid OAuth code or token" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get authenticated profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current authenticated user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { type: "object" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized or expired token" },
        },
      },
    },
    "/api/resume/upload": {
      post: {
        tags: ["Resume"],
        summary: "Upload candidate resume file (PDF or DOCX)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "PDF or Word (.docx) document (up to 10MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "File uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    resumeUrl: { type: "string", example: "/uploads/resume-1789.pdf" },
                    filename: { type: "string", example: "Jesse_Pinkman_Resume.pdf" },
                    size: { type: "integer", example: 45820 },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/resume/parse": {
      post: {
        tags: ["Resume"],
        summary: "Extract candidate profile & skills from resume",
        description: "Upload a file directly or pass raw text / file URL to extract structured candidate skills, experience, and project highlights using Gemini 3.6.",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                  name: { type: "string", example: "Jesse Pinkman" },
                  email: { type: "string", example: "jesse@example.com" },
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rawText: { type: "string" },
                  resumeUrl: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Structured profile extracted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    profile: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/resume/sample/{id}": {
      get: {
        tags: ["Resume"],
        summary: "Load pre-configured sample candidate resume",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", default: "sample-1" },
            description: "Sample resume ID (e.g. sample-1)",
          },
        ],
        responses: {
          200: {
            description: "Sample candidate profile loaded",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/api/interview/start": {
      post: {
        tags: ["Interview"],
        summary: "Initialize an interview session",
        description: "Creates an interview session in Practice or Recruiter Screening mode. Calibrates Aria to candidate resume and sends recruiter/candidate email links.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StartInterviewRequest" } } },
        },
        responses: {
          200: {
            description: "Interview session created and opening question synthesized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StartInterviewResponse" } } },
          },
        },
      },
    },
    "/api/interview/transcribe": {
      post: {
        tags: ["Interview"],
        summary: "Transcribe candidate spoken audio (Speech-to-Text)",
        description: "Receives candidate microphone audio buffer (webm, wav, mp3) and uses Gemini 3.6 multimodal audio processing to return high-accuracy text transcription.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  audio: {
                    type: "string",
                    format: "binary",
                    description: "Candidate speech audio file (webm/wav/mp3)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Transcription result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    text: { type: "string", example: "We designed our Kafka consumer group using cooperative sticky rebalance protocol." },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/interview/message": {
      post: {
        tags: ["Interview"],
        summary: "Submit candidate answer & receive Aria's adaptive response",
        description: "Accepts typed text answer or microphone audio file. Evaluates response against candidate resume and question difficulty, then generates the next question or finishes the interview.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SubmitMessageRequest" } },
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  sessionId: { type: "string", example: "sess_64fae109" },
                  answer: { type: "string" },
                  audio: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Next interview turn or finished evaluation scorecard",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SubmitMessageResponse" } } },
          },
        },
      },
    },
    "/api/interview/violation": {
      post: {
        tags: ["Interview"],
        summary: "Report proctoring focus violation (e.g. tab switch)",
        description: "Records tab-switch, loss of camera focus, or multi-subject detection according to Aria's 2-strike policy.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ViolationRequest" } } },
        },
        responses: {
          200: {
            description: "Violation recorded & strike count returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    strikeCount: { type: "integer", example: 1 },
                    action: { type: "string", enum: ["warn", "escalate", "halt"], example: "warn" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/interview/{sessionId}": {
      get: {
        tags: ["Interview"],
        summary: "Get current interview session state and transcript",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "sess_64fae109",
          },
        ],
        responses: {
          200: {
            description: "Complete session state and transcript",
            content: { "application/json": { schema: { type: "object" } } },
          },
          404: { description: "Session not found" },
        },
      },
    },
    "/api/interview/{sessionId}/report": {
      get: {
        tags: ["Interview"],
        summary: "Get final AI evaluation report & candidate scorecard",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "sess_64fae109",
          },
        ],
        responses: {
          200: {
            description: "AI evaluation report, hiring recommendation, and strengths breakdown",
            content: { "application/json": { schema: { type: "object" } } },
          },
          404: { description: "Session or report not found" },
        },
      },
    },
    "/api/interview/{sessionId}/email-preview": {
      get: {
        tags: ["Interview"],
        summary: "Preview generated invitation or recruiter report HTML email",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "sess_64fae109",
          },
        ],
        responses: {
          200: {
            description: "HTML email preview rendered directly in browser",
            content: { "text/html": { schema: { type: "string" } } },
          },
        },
      },
    },
  },
};

// Custom Aria Obsidian / Antique Brass Theme for Swagger UI
const customCss = `
  .swagger-ui {
    background-color: #10121B !important;
    color: #EDE8DA !important;
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
  .swagger-ui .topbar {
    background-color: #0D0F18 !important;
    border-bottom: 1px solid rgba(176, 141, 62, 0.3) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
  }
  .swagger-ui .topbar .topbar-wrapper a span {
    color: #D9BC7A !important;
    font-weight: 700 !important;
    letter-spacing: 1px !important;
  }
  .swagger-ui .info {
    background: linear-gradient(180deg, #161A2B 0%, #10121B 100%) !important;
    border: 1px solid rgba(237, 232, 218, 0.12) !important;
    border-radius: 8px !important;
    padding: 24px !important;
    margin: 20px 0 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
  }
  .swagger-ui .info .title {
    color: #D9BC7A !important;
    font-family: Georgia, serif !important;
  }
  .swagger-ui .info p, .swagger-ui .info li {
    color: #EDE8DA !important;
  }
  .swagger-ui .scheme-container {
    background-color: #161A2B !important;
    box-shadow: none !important;
    border-bottom: 1px solid rgba(237, 232, 218, 0.1) !important;
    padding: 16px 0 !important;
  }
  .swagger-ui .opblock {
    background-color: #161A2B !important;
    border-radius: 6px !important;
    border: 1px solid rgba(237, 232, 218, 0.1) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    margin-bottom: 14px !important;
  }
  .swagger-ui .opblock .opblock-summary {
    border-bottom: 1px solid rgba(237, 232, 218, 0.08) !important;
  }
  .swagger-ui .opblock-summary-method {
    border-radius: 4px !important;
    font-weight: 700 !important;
    font-family: 'IBM Plex Mono', monospace !important;
  }
  .swagger-ui .opblock .opblock-summary-path {
    color: #EDE8DA !important;
    font-family: 'IBM Plex Mono', monospace !important;
  }
  .swagger-ui .opblock .opblock-summary-description {
    color: #9A957F !important;
  }
  .swagger-ui .opblock-body {
    background-color: #10121B !important;
    color: #EDE8DA !important;
  }
  .swagger-ui .tabli button {
    color: #EDE8DA !important;
  }
  .swagger-ui input[type=text], .swagger-ui input[type=password], .swagger-ui select, .swagger-ui textarea {
    background-color: #0D0F18 !important;
    color: #EDE8DA !important;
    border: 1px solid rgba(176, 141, 62, 0.4) !important;
    border-radius: 4px !important;
  }
  .swagger-ui .btn {
    border-radius: 4px !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
  }
  .swagger-ui .btn.execute {
    background: linear-gradient(180deg, #D9BC7A 0%, #B08D3E 100%) !important;
    color: #10121B !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(176, 141, 62, 0.3) !important;
  }
  .swagger-ui .btn.authorize {
    border-color: #B08D3E !important;
    color: #D9BC7A !important;
  }
  .swagger-ui .btn.authorize svg {
    fill: #D9BC7A !important;
  }
  .swagger-ui section.models {
    background-color: #161A2B !important;
    border: 1px solid rgba(237, 232, 218, 0.1) !important;
    border-radius: 8px !important;
  }
  .swagger-ui section.models h4 {
    color: #D9BC7A !important;
  }
  .swagger-ui .model-box {
    background-color: #10121B !important;
  }
  .swagger-ui table thead tr th, .swagger-ui table thead tr td {
    color: #D9BC7A !important;
    border-bottom: 1px solid rgba(237, 232, 218, 0.1) !important;
  }
  .swagger-ui .response-col_status {
    color: #4F7A64 !important;
    font-weight: 700 !important;
  }
  .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 {
    color: #D9BC7A !important;
  }
`;

function setupSwagger(app) {
  // Serve raw JSON specification
  app.get("/api-docs/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve interactive Swagger UI
  const swaggerUiOpts = {
    customCss,
    customSiteTitle: "Aria API Playground & Swagger Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: "list",
    },
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));

  console.log("Swagger UI documentation available at: http://localhost:5000/api-docs");
}

module.exports = {
  swaggerSpec,
  setupSwagger,
};
