# AIKEN — One-Shot Build Prompt for an AI Coding Agent

> Paste everything below into Claude Code (or an equivalent agentic coding tool) as a single message. It is written as a **self-contained build harness**: it defines the product, the tech stack, and a **dependency graph of build phases** with pass/fail gates, so the agent can work in tight, cheap loops instead of re-reading the whole spec on every turn.

---

## 0. ROLE & OPERATING MODE

You are a senior full-stack mobile engineer. Build **Aiken: Custom AI Agent – Digital Twin**, a student productivity app, as an Expo (React Native) application with a lightweight backend.

Work in the **phased graph** defined in Section 6. Each phase is a self-contained unit of work with its own **Definition of Done (DoD)**. Rules for cost-efficient execution:

1. **Do not re-read this whole prompt for every file.** After Phase 0, keep only: the current phase's spec, the shared data models (Section 4), and the design tokens (Section 5) in active context.
2. **One phase, one loop.** For each phase: (a) plan the files you'll touch in 1 short bullet list, (b) write/edit them, (c) run lint/typecheck, (d) self-check against that phase's DoD, (e) report a one-paragraph summary and move on. Do not re-explain prior phases.
3. **Never block on missing external credentials.** Every real integration (Canvas, Google Classroom, Teams, Google Calendar, Outlook, an LLM provider) must be built behind an interface with a **mock/stub adapter** that returns realistic fixture data, so the app is fully demoable with zero API keys. Real adapters are optional Phase 7 work.
4. **Prefer the cheapest model tier for scaffolding.** If your tool supports model selection, use a small/cheap model for boilerplate (screens, types, mock data, styling) and reserve a stronger model only for Phase 4 (agent/reasoning logic) and debugging loops that fail twice in a row.
5. **Stop and ask only if genuinely blocked** (e.g., ambiguous business rule not covered below). Otherwise make the most reasonable assumption, note it in a `DECISIONS.md` file, and keep going.

---

## 1. PRODUCT SUMMARY

Aiken is a **mobile, prompt-driven, on-demand academic aggregator and productivity layer** for students — not an LMS, not a hosting platform, not a messaging system. It:

- Pulls (on request, never via 24/7 polling) class schedules, assignment deadlines, and meeting links from LMS/calendar sources into one unified **Academic Calendar**.
- Lets a student chat with an AI assistant ("Aiken") that can decompose goals like *"help me study for midterms"* into a study plan, and propose **Deep Work / Pomodoro** blocks.
- Requires **Human-in-the-Loop (HITL) approval** before any calendar-modifying or notification-modifying action is taken. Nothing autonomous ever fires without explicit user tap.
- Answers "student handbook" style policy questions (attendance, late submission, academic integrity) via **RAG** over an uploaded handbook/syllabus PDF, always citing a source snippet.
- Shows productivity reports (deadlines, completed tasks, focus time, completion rate).
- Lets the student configure their own assistant ("Build your AI Assistant": name, role, program, tone, connected tools).

Reference the four provided UI screenshots (Appendix D of the SRS) as the ground truth for layout: bottom/segmented icon nav with 4 tabs — **Calendar (grid)**, **Schedule Calendar (month)**, **Student Handbook (docs)**, **Alken assist you (chat)** — plus modals for **Add Event**, **Pomodoro Timer**, **Enter Deep Work Mode**, **Student Concerns**, and **Build your AI Assistant**.

---

## 2. TECH STACK (fixed — do not substitute without a documented reason in DECISIONS.md)

- **Client:** Expo (React Native), TypeScript, Expo Router for navigation, `expo-notifications` (stubbed Focus/DND), NativeWind or StyleSheet (your choice, but be consistent) for styling.
- **State:** React Query (server-cache) + Zustand or Context for local UI state. No browser localStorage anywhere (unsupported on device — use `AsyncStorage`/SecureStore instead, or in-memory + Supabase if online).
- **Backend:** A single Node.js (Express or Fastify) or Python (FastAPI) service — pick one and stay consistent — exposing a versioned REST API at `/api/v1/*`.
- **Persistence:** Supabase (Postgres + Auth + Realtime) — use the JS client from the mobile app for auth/session and simple reads where reasonable; use the backend for anything requiring secrets (LLM keys, third-party OAuth token exchange).
- **AI layer:** Two logical roles, provider-agnostic behind an interface:
  - `RouterAgent` — cheap/fast model, classifies intent + orchestrates MCP-style tool calls (RAG lookups, "what's due this week", simple Q&A).
  - `PlannerAgent` — a stronger reasoning model, invoked only for multi-step planning ("help me study for midterms"), outputs a structured DAG of steps + proposed Deep Work blocks.
  - Both must be swappable via an env var (`LLM_PROVIDER=mock|anthropic|openai|google`). Default to `mock` so the app runs with zero API cost out of the box.
- **RAG:** A simple vector store interface (`VectorStore.upsert()/query()`), with a default **in-memory/pgvector-free mock implementation** (keyword/TF-IDF match over chunked text) so no external vector DB is required to demo. Real pgvector/Pinecone adapter is optional Phase 7 work.
- **Auth:** Email/password + OAuth (Google, Microsoft) via Supabase Auth. Session expires after 30 min inactivity (configurable constant).

---

## 3. NON-NEGOTIABLE BEHAVIORAL RULES (bake these into code, not just docs)

- **On-demand only.** No background polling loops. Data refresh happens only on: app open, pull-to-refresh, or explicit chat request.
- **HITL gate.** Any action that would (a) write to a calendar, (b) toggle a device notification/focus mode, or (c) delete stored data must go through a `PendingAction` record with `approve`/`reject`, a 48-hour TTL, and an explicit confirm button — never an implicit "yes" parsed from chat text.
- **No autonomous DND/Focus toggling** — always ask.
- **No Deep Work / Pomodoro suggestion may overlap an existing calendar event.**
- **RAG hallucination guard:** any handbook/syllabus answer must include a short verbatim "Source snippet" from the ingested document (≤ 25 words) plus the file name; if retrieval confidence is low, respond "I couldn't find this in your documents" instead of guessing.
- **Guardrail:** reject prompts asking the assistant to complete graded academic work for the student (e.g., "write my essay", "give me the exam answers") with a clear, non-preachy refusal message; log the refusal.
- **Data minimization:** never persist full lecture content/submissions — only titles, dates, links, and short metadata.

---

## 4. SHARED DATA MODELS (define once in `types/models.ts`, reuse everywhere)

```ts
type User = { id: string; name: string; email: string; avatarUrl?: string; timezone: string };

type ConnectedPlatform = { id: string; userId: string; provider: 'google_classroom'|'canvas'|'ms_teams'|'google_calendar'|'outlook'; status: 'connected'|'disconnected'|'error'; lastSyncedAt?: string };

type CalendarEvent = { id: string; userId: string; title: string; type: 'class'|'deadline'|'meeting'|'deep_work'|'pomodoro'|'custom'; start: string; end: string; sourcePlatform?: string; sourceUrl?: string; weight?: number };

type PendingAction = { id: string; userId: string; kind: 'create_event'|'reschedule_event'|'toggle_dnd'|'delete_data'; payload: unknown; reasoning: string; status: 'pending'|'approved'|'rejected'|'expired'; createdAt: string; expiresAt: string };

type ChatMessage = { id: string; userId: string; role: 'user'|'assistant'; content: string; toolCalls?: ToolCall[]; sourceSnippets?: { doc: string; quote: string }[]; createdAt: string };

type StudyPlanStep = { id: string; label: string; estimatedMinutes: number; dependsOn: string[]; proposedBlock?: { start: string; end: string } };

type AssistantConfig = { userId: string; name: string; role: string; program: string; tone: 'professional'|'friendly'|'casual'; connectedTools: string[] };

type Document = { id: string; userId: string; filename: string; kind: 'syllabus'|'handbook'|'other'; uploadedAt: string; chunkCount: number };
```

---

## 5. DESIGN TOKENS (from the provided screenshots — keep the identity consistent)

- Primary accent: warm amber/gold (`#F2A93B`-ish) for primary buttons and highlights.
- Secondary accent: deep red/maroon (`#B4232A`-ish) for the wordmark "Aiken" and destructive/primary actions like "Start Deep Work".
- Neutral background: warm off-white (`#FFFBF3`-ish), cards white with soft shadow, rounded-xl corners.
- Top nav: 4 segmented icons (grid / calendar / doc / chat-bubble-plus) with the active one pill-highlighted in amber.
- Typography: friendly rounded sans, bold greeting headers ("Good morning, Ms. Shena 👋"), muted subtext under headers.
- Chat bubbles: assistant bubble amber-tinted with small icon avatar; quick-action pill buttons above the composer (e.g., "Have a concern regarding school?", "Late Assignment Submission Process").

Build a small `theme.ts` exporting these as constants before touching any screen.

---

## 6. BUILD GRAPH (phases with dependency edges + Definition of Done)

```
Phase 0: Scaffold ──▶ Phase 1: Auth ──▶ Phase 2: Calendar Core ──┬─▶ Phase 3: Chat + Router Agent ──▶ Phase 4: Planner Agent + Deep Work/Pomodoro ──▶ Phase 5: HITL layer
                                                                   └─▶ Phase 3b: Document Upload + RAG (student handbook)
Phase 5 ──▶ Phase 6: Reports Dashboard ──▶ Phase 7: Real adapters (optional) ──▶ Phase 8: Polish + accessibility + tests
```

### Phase 0 — Scaffold
- `npx create-expo-app` with TypeScript + Expo Router; folder structure: `/app` (routes), `/components`, `/lib` (api client, theme, agents), `/types`, `/server` (backend), `/fixtures` (mock data).
- Add `theme.ts`, `types/models.ts`, ESLint/Prettier, `.env.example` with every var from Section 2 defaulted to mock/off.
- **DoD:** app boots to a blank home screen with the 4-icon nav shell rendered from `theme.ts`, no red screens, `tsc --noEmit` clean.

### Phase 1 — Auth
- Supabase email/password + Google/Microsoft OAuth buttons (OAuth can be stubbed behind `AUTH_PROVIDER=mock` returning a fake session).
- Session context + 30-min inactivity auto-logout timer.
- Settings screen: manage connected platforms (toggle on/off), log out.
- **DoD:** can sign up, log in, see session persist across app reload, log out; inactivity timer demonstrably logs out in a shortened test mode (`AUTO_LOGOUT_MS` env override).

### Phase 2 — Calendar Core (matches screenshots 1 & 2)
- Week-grid view ("Good morning, {name}" header, weekday columns, hour rows, colored event blocks) + Month view ("Schedule Calendar").
- `CalendarEvent` CRUD against mock adapters for Canvas/Classroom/Teams/Google Calendar/Outlook (fixture data in `/fixtures`), consolidated + de-duplicated client-side.
- "Add Event" modal exactly as in screenshot: title, day, start hour, duration, amber "Add Event" button.
- Manual pull-to-refresh triggers on-demand sync (no timers/polling).
- **DoD:** week and month views render fixture events with no overlap-rendering bugs; adding a manual event updates both views; refresh re-fetches without any background interval running.

### Phase 3 — Chat + Router Agent (matches screenshot "Alken assist you")
- Chat screen: greeting bubble, quick-action pills, composer with send button.
- `RouterAgent` interface + `mock` implementation: pattern-match common intents ("what's due this week", "have a concern regarding school?") and return canned-but-data-backed answers pulling from the Phase 2 event store.
- "Student Concerns" quick menu (Missed a Class, Late Assignment Submission, Academic Appeal, Exam Conflict, Medical Leave, Attendance Exception) → deterministic templated answers (can be RAG-backed once Phase 3b lands).
- **DoD:** typing "what's due this week" returns an accurate list derived from actual stored events, not hardcoded text; tapping a Student Concerns pill returns a canned policy answer with a citation placeholder.

### Phase 3b — Document Upload + RAG (Student Handbook tab)
- Upload flow (PDF/text) → chunk → mock `VectorStore.upsert`.
- Handbook tab UI matching screenshot: card list of policy sections (Attendance Policy, Late Assignment Submission, Academic Integrity, ...).
- RAG query path: retrieve top chunks, feed to `RouterAgent`, response includes a `sourceSnippets` citation per the hallucination guard in Section 3.
- **DoD:** uploading a sample handbook fixture and asking a policy question returns an answer with a real quoted snippet from that fixture; low-confidence queries return the "couldn't find this" fallback, never a fabricated answer.

### Phase 4 — Planner Agent + Deep Work/Pomodoro (matches "Enter Deep Work Mode" & "Pomodoro Timer" modals)
- `PlannerAgent` (mock impl fine): given a goal + current calendar + `weight`, returns a `StudyPlanStep[]` DAG and proposed Deep Work blocks that don't overlap existing events (enforce this in code, not just prompt instructions).
- "Enter Deep Work Mode" modal: deadline date picker, "allow notifications to be muted?" toggle, Start/Cancel — muting is stubbed via `expo-notifications` interface behind a permission-request flow; never auto-granted.
- Pomodoro Timer modal: 25:00 countdown, Start/Reset/Close, standard 4x pomodoro + long break cycle.
- **DoD:** asking "help me study for midterms" produces a step list + at least one proposed Deep Work block with a plain-language "why" explanation (NFR-U2); starting Deep Work asks for mute permission every time; Pomodoro timer counts down accurately and survives app backgrounding (use timestamps, not naive `setInterval` countdowns).

### Phase 5 — HITL layer
- `PendingAction` table/store + a small "Pending Approvals" surface (banner or list) with Approve/Reject, 48h expiry countdown, auto-discard job (client-triggered check on app open is fine — no server cron needed for the demo).
- Wire every calendar-write and DND-toggle from Phases 2 & 4 through this gate — no direct writes remain.
- **DoD:** proposing a Deep Work block creates a PendingAction, does **not** appear on the calendar until approved, disappears from pending after 48h if untouched, and rejecting it fully discards the proposal.

### Phase 6 — Reports Dashboard
- Charts (recharts-equivalent RN chart lib, or simple custom SVG bars if you want zero extra deps) for: upcoming deadlines, completed tasks, focus time, completion rate; weekly/monthly toggle; empty-state graphic for new users.
- **DoD:** dashboard reflects real Pomodoro/Deep Work session data logged during Phase 4 testing, not static numbers; empty state shows correctly for a freshly seeded user with no activity.

### Phase 7 — Real adapters (optional, only if credentials are supplied)
- Implement one real OAuth + one real LMS/calendar adapter (e.g., Google Calendar) behind the same interfaces from Phase 2, gated by env vars; everything else stays on mock.
- **DoD:** toggling `LLM_PROVIDER`/`AUTH_PROVIDER`/calendar provider env vars from mock→real requires zero code changes elsewhere.

### Phase 8 — Polish
- WCAG 2.1 AA pass: color contrast check against `theme.ts`, screen-reader labels on icon-only nav buttons, dynamic type support.
- Error/empty states everywhere (sync failure banners, no-upcoming-tasks state).
- Basic Jest unit tests for: overlap-prevention logic, HITL expiry logic, RAG citation guard.
- **DoD:** `jest` passes; a manual VoiceOver/TalkBack pass on the 4 main tabs completes without dead-ends.

---

## 7. WORKING AGREEMENT FOR THE AGENT

- After each phase, output: (1) list of files created/changed, (2) how you verified the DoD, (3) anything deferred + why (append to `DECISIONS.md`).
- If a phase's DoD fails twice in a row, stop looping blindly — summarize the failure mode in one paragraph and ask for guidance instead of burning further turns.
- Keep the mock layer fully functional at all times; real-provider work in Phase 7 must never break the mock path.

Begin with **Phase 0** now.
