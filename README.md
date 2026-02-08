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


## The Assignment

**Deadline:** 3 days from receiving the assignment email

### What to do

1. Go to [airaai.in](https://airaai.in) → click "Try Aira" to get started
2. Connect your accounts, set up some rules, feel the friction
3. Find something that bugs you — onboarding, navigation, a specific flow, whatever
4. Build a working improvement

### What we're looking for

- Good taste
- Clear thinking about UX problems
- Code that works

### How to submit

Reply to the assignment email with your code and a short note explaining what you fixed and why.

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


## License

MIT — see [LICENSE](./LICENSE)


## 🎯 The Mission: Solving "Automation Uncertainty"

The biggest hurdle for AI tools is the **Trust Gap**. Users give an AI control over their digital life but often feel uncertain about whether it's actually working. My contribution focuses on **Observability** and **Reliability**.

---

## ✨ Changes & Improvements

### 1. Unified "Actions" Hub & Guided Onboarding
- **The Solve**: I consolidated "Quick Actions" and "Suggestions" into a single, high-leverage **Actions** tab. This creates a unified entry point for all manual and AI-suggested interventions.
- **Onboarding Boost**: Replaced empty states with a **Template Injection System**. New users are greeted with actionable rule templates that pre-populate the creation flow, eliminating "blank page" paralysis.

![Screenshot: Unified Actions Hub](https://github.com/alwaysvivek/aira-client-os/blob/master/demos/actions_center.png)
<!-- slide -->
![Screenshot: Guided Onboarding](./demos/onboarding_templates.png)


### 2. Rule "Pulse" & Clickable Observability
- **The Solve**: Rules now feature **Health Badges** and a live **Pulse Indicator** that derive liveness from metadata. The status text is now **clickable**, taking users directly to the schedule settings for immediate control.

![Screenshot: Rule Transparency & Pulse Indicators](./demos/workspace_rules_transparency.png)

### 3. Service Connectivity Heartbeat
- **The Solve**: Surfaced connector health directly in the workspace. This prevents "Silent Failures" (e.g., an expired WhatsApp/WAHA session) and builds immediate confidence in the system's status.

![Screenshot: Service Connectivity Heartbeat](./demos/connectivity_heartbeat.png)

---

## 🛠️ Technical Highlights

- **TanStack Query Transformations**: Used `select` hooks to compute system health states from raw API metadata, keeping the UI logic clean and performant.
- **Zustand for Cross-Tab State**: Implemented a global draft store to handle template injection, allowing users to move from "Actions" to "Rule Creation" without losing context.
- **Optimistic UI**: Rule toggles and sync actions feel instantaneous, providing immediate feedback while the server synchronizes.
- **Hydration Resilience**: Implemented `suppressHydrationWarning` on core layout components to ensure a seamless experience even with aggressive browser extensions.

---
