# Aira - Frontend Assignment

Aira is your AI assistant that works 24/7 on your behalf. The main interaction happens through WhatsApp — you chat with Aira directly, and it manages your life across groups, email, calendar, and more.

The core concept is **rules**: you tell Aira what to watch for ("notify me if someone mentions my name", "flag anything marked urgent", "summarize this group every morning at 9am"), and Aira follows them automatically.

## What's Inside

This is a Turborepo monorepo with the following structure:

### Apps

- **`apps/aira-web`** — Next.js web dashboard ([app.airaai.in](https://app.airaai.in)) where users configure connectors, rules, and manage tasks

### Packages

- **`packages/core`** — Shared API client, schemas, auth utilities, and stores used by both apps
- **`packages/typescript-config`** — Shared `tsconfig.json` configurations

### Tech Stack

- **TypeScript** everywhere
- **Next.js** (web)
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Zod** for schema validation
- **Axios** for HTTP

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install


# Start the web app in development
pnpm dev --filter=aira-web


## The Assignment: Solving the "Black Box" Problem

AiRA is a powerful tool, but like many early-stage AI products, it suffers from a **Trust & Transparency Gap**. Users give an AI control over their WhatsApp and Gmail, but if they don't see the "gears turning," they feel uncertain.

I chose to fix the **"Uncertainty"** associated with the product. My focus was on transforming AiRA from a passive automation engine into a transparent, observable control plane.

### 🛠️ What I Built

#### 1. Rule Observability & "Health" Badges
- **Problem**: Users set a rule but don't know if it's actually monitoring their chats or if it's stalled.
- **Solve**: Implemented inline "Health" indicators on Rule cards. These badges derive state from existing API timestamps to show if a rule is **Live**, **Standby**, or **Paused**.

#### 2. Service Connectivity Health
- **Problem**: Silent failures. A user might have rules active while their WhatsApp (WAHA) session has expired.
- **Solve**: Added a connectivity heartbeat to the workspace. Users can now see real-time "Healthy" vs "Disconnected" indicators for their connectors.

#### 3. Onboarding & Template Injection
- **Problem**: The "Blank Page" paralysis. New users don't know what a "good" rule looks like.
- **Solve**: Replaced empty states with a **Template Injection System**. Instead of a blank screen, users see actionable templates (e.g., "Summarize LinkedIn Job Pitches") that pre-populate the creation flow.

#### 4. System Transparency (The Mascot Integration)
- **Problem**: Technical tools often feel clinical and opaque.
- **Solve**: Integrated the AiRA mascot into empty states and loading sequences to provide personality-driven feedback, reinforcing the idea that the AI is "working for you."

### 🚀 Future Roadmap

If I were to take this further, here is how I would scale the "Reliability" engine:
- **Instruction Validation**: Implement client-side linting for rules to prevent non-deterministic loops or conflicting instructions.
- **The "Dry Run" Mode**: Before activating a rule, allow users to "sim-test" it against their last 50 messages to see a preview of what the AI would have sent.
- **Granular Sync Monitoring**: Move from a generic loading spinner to an SSE-driven progress bar that shows exactly which chats are being indexed during the initial sync.

---

## Technical Highlights
- **TanStack Query Transformation**: Used `select` transforms to compute high-level "Health" states from raw API metadata, keeping components clean and focused on UI.
- **Zustand for Cross-Tab State**: Implemented a draft store to handle template injection, allowing users to move from "Suggestion" to "Creation" without losing context.
- **Optimistic UI**: Rule toggles and sync actions use optimistic updates to ensure the interface feels snappy while the backend synchronizes.

## Project Structure

## Project Structure

```
├── apps/
│   ├── aira-web/          # Next.js dashboard
│   │   ├── src/
│   │   │   ├── app/       # Next.js app router pages
│   │   │   ├── components/
│   │   │   └── lib/       # API client, utilities
├── packages/
│   ├── core/              # Shared business logic
│   │   └── src/
│   │       ├── api/       # API client & endpoints
│   │       ├── auth/      # Auth utilities
│   │       ├── schemas/   # Zod schemas
│   │       └── stores/    # Zustand stores
│   └── typescript-config/ # Shared TS configs
└── turbo.json
```

## License

MIT — see [LICENSE](./LICENSE)
