import { NextRequest } from 'next/server';
import {
  successResponse,
  ApiErrors,
  validateString,
  checkRateLimit,
} from '@/lib/api';
import {
  cacheKey,
  isCacheable,
  promptFingerprint,
  readCachedReply,
  writeCachedReply,
} from '@/lib/chat-cache';

// ===========================================
// Configuration
// ===========================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

// Groq bills max_tokens against the tokens-per-minute budget up front and does
// not refund the unused remainder, so an oversized cap costs real throughput.
// Observed replies run ~150 tokens; 400 leaves room for the longest bulleted
// answers without reserving budget we never spend.
const MAX_TOKENS = 400;

const TEMPERATURE = 0.7;

// Each retained turn is re-sent on every request. Four keeps a follow-up
// coherent without letting a long conversation inflate the prompt indefinitely.
const MAX_HISTORY_MESSAGES = 4;

const RATE_LIMIT = 10; // requests per window, per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// ===========================================
// System Prompt
// ===========================================

const SYSTEM_PROMPT = `You are Rutwik's AI assistant on his portfolio site. Answer questions about him using only the facts below. Be concise, friendly, professional.

FORMAT: **bold** for key terms; "- " bullets for lists; blank line between sections. 2-4 sentences for simple questions, bullets for complex ones. If something isn't covered below, say you don't have that information.

Today is mid-2026. Everything below is past or recently completed: Rutwik has finished his degree and is seeking full-time Software Engineering and Infrastructure roles (full-stack, backend, infra, AI).

PROFILE
- MS Computer Science, USC, 3.81/4.0 (Aug 2023-May 2025); B.Tech IT, University of Mumbai, 3.8/4.0 (2019-2023)
- San Francisco, CA. Email me.rutwik@gmail.com. Published IEEE researcher.

EXPERIENCE
Sigma Computing, Software Engineer Intern (Sept-Dec 2025, NYC)
- Shipped four production features end-to-end (condition-based formula visualization, Form v2, headers, navigation) used by 60+ enterprise orgs
- Optimized large data-grid rendering with memoization and virtualization; wrote Cypress e2e tests for critical workbook flows

World Salon, Software Engineer (Jul 2024-Aug 2025, LA)
- Launched an events platform powering 130+ events; built scraping and OpenAI profiling pipelines processing 58,000+ candidate profiles
- REST APIs with JWT auth and RBAC; split a monolith into payment/event services cutting latency 20%; deployed on AWS with Docker, EC2, S3, GitHub Actions

USC Marshall, Research Assistant (Jan-May 2026, LA)
- Built RAG semantic search and chat over 10K+ embeddings spanning 500GB+ of sustainability disclosures; React dashboard for 30+ researchers saved 15+ hrs/week
- Schema-guided LLM extraction of ESG fields, citation grounding to cut hallucination, feedback loop refining retrieval

USC Marshall, Research Assistant (Feb 2024-May 2025, LA)
- Fault-tolerant ETL (Selenium, OCR, indexing) ingesting 15,000+ sustainability reports across 10 years of S&P 1500 filings
- Normalized PostgreSQL over 2M+ data points (-12% query latency); multithreaded PDF extraction (-30% processing time)

SKILLS
Languages: Python, JavaScript, TypeScript, C++, Go. Databases: PostgreSQL, MongoDB, Redis, Chroma. Frontend: React, React Native, Angular, Next.js, Redux, Zustand, Tailwind, Jest, Cypress. Backend: Node.js, Express, Django REST, Flask, FastAPI, REST, microservices. Cloud/Infra: AWS (EC2, S3, RDS), GCP, Supabase, Docker, Kubernetes, CI/CD, GitHub Actions, Terraform, monitoring and logging. ML: PyTorch, TensorFlow, LangChain, RAG, OpenAI embeddings.

PROJECTS
- Restore Wellness (React Native, Expo, Supabase, Stripe Connect, TypeScript): a three-sided in-home massage marketplace SHIPPED AND LIVE ON THE APPLE APP STORE. Clients book a licensed therapist to their home, therapists accept and fulfill sessions, and an admin dispatch panel runs bookings, compliance, and payouts. Stripe Connect handles client payments and therapist payouts. His flagship shipped product.
- miniredis (C++17): Redis-compatible in-memory store built from scratch; non-blocking epoll/kqueue reactor over RESP; skip-list sorted sets; 984K+ ops/sec and 2.5x throughput via sharded locking; AOF persistence, pub/sub, replication; Go benchmark harness
- RoomReserve (FastAPI, PostgreSQL, JWT): 20+ REST endpoints for auth, booking lifecycle, payments; RBAC and row-level locking preventing double-booking
- TalkToData (Next.js, LLM, Terraform, AWS): natural language to SQL with visualizations; one-command Terraform deploys
- Stock Insight (Angular, Swift, Express, MongoDB, GCP): trading platform on Finnhub/Polygon data, 96% performance score; companion iOS app in Swift
- Cataract Detection with Explainable AI (React, Python, CNN): led a team of 3 to 97% accuracy; GradCAM heatmaps localizing affected regions; clinician upload interface
- RAG Q&A App (Streamlit, LangChain, Chroma): sub-second search over private docs; parallel chunking cut API calls 30% and latency 20%
- Fake News Detection (CNN-LSTM, BERT, RoBERTa): 93% accuracy, 94% precision/recall/F1 on WELFake and Kaggle across 115K+ articles

PUBLICATIONS
Two IEEE papers: federated learning (SICTIM 2023), cataract detection (PuneCon 2023). Jusst.org: XAI for cataract detection (2023), virtual laboratory survey (2022).

INTERESTS
Full-stack, AI/ML, FinTech, healthcare tech. Enjoys building tools that turn complex data into actionable insights.`;

/** Changes whenever the model or the facts above change, expiring stale answers. */
const PROMPT_FINGERPRINT = promptFingerprint(GROQ_MODEL, SYSTEM_PROMPT);

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp, RATE_LIMIT, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      return ApiErrors.tooManyRequests(
        "You're sending messages a bit quickly. Give it a moment and try again."
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { message } = body;
    const history = Array.isArray(body.history) ? body.history : [];

    // Validate message
    const messageError = validateString(message, 'message', { minLength: 1, maxLength: 2000 });
    if (messageError) {
      return ApiErrors.badRequest(messageError);
    }

    // Serve repeat questions from Redis so they never touch the token budget
    const cacheable = isCacheable(message, history.length);
    const key = cacheKey(PROMPT_FINGERPRINT, message);

    if (cacheable) {
      const cached = await readCachedReply(key);
      if (cached) {
        return successResponse({ reply: cached, cached: true });
      }
    }

    // Check API key configuration
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      return ApiErrors.serviceUnavailable('AI service not configured');
    }

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES),
      { role: 'user', content: message },
    ];

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);

      if (response.status === 429) {
        // The shared per-minute budget is spent, not this visitor's fault.
        return ApiErrors.tooManyRequests(
          "I'm getting a lot of questions right now. Try again in a few seconds."
        );
      }

      return ApiErrors.serviceUnavailable('AI service temporarily unavailable');
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Only cache genuine answers, never the fallback string above
    if (cacheable && data.choices[0]?.message?.content) {
      await writeCachedReply(key, reply);
    }

    return successResponse({ reply });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof SyntaxError) {
      return ApiErrors.badRequest('Invalid JSON in request body');
    }

    return ApiErrors.internalError('An unexpected error occurred');
  }
}
