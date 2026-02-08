# 🤖 AiRA — The Intelligent Control Plane

AiRA is an AI assistant that works 24/7 on your behalf, managing your life across WhatsApp, Gmail, and Calendar through proactive **Rules**.

---

## 🎯 The Mission: From "Black Box" to Observable Automation

Most AI tools suffer from a **Trust & Transparency Gap**. Users give an AI control over their digital life, but without visibility into the "gears turning," they feel uncertain.

I refactored the AiRA experience to bridge this gap, transforming a passive background engine into a **Transparent Control Plane**.

---

## ✨ Key Improvements

### 1. Unified "Actions" Center
> [!IMPORTANT]
> **Product Refinement**: I consolidated "Quick Actions" and "Suggestions" into a single, high-leverage **Actions** tab. This reduces cognitive load and provides a unified entry point for all manual and AI-suggested interventions.

![Screenshot Placeholder: The new consolidated Actions Tab](file:///placeholder_actions_tab.png)

### 2. Rule "Pulse" & Health Badges
Users no longer have to guess if a rule is active. Inline **Health Badges** derive state from execution metadata to show real-time liveness.

```diff
+ // Derived health logic in RuleCard.tsx
+ const status = last_fired < 15min ? 'Live' : 'Standby';
+ <Badge variant={status === 'Live' ? 'green' : 'gray'}>
+   {status}
+ </Badge>
```

![Screenshot Placeholder: Rule Cards with Live/Standby badges](file:///placeholder_rule_health.png)

### 3. Service Connectivity Heartbeat
Connectivity health is surfaced directly in the workspace, preventing the "Silent Failure" problem where rules appear active but the background session (WAHA) has expired.

![Screenshot Placeholder: Connector list with "Healthy" indicator](file:///placeholder_connection_health.png)

### 4. Guided Onboarding (Template Injection)
I replaced "Empty States" with a **Template Injection System**. Instead of a blank page, new users are greeted with actionable templates that pre-populate the creation flow.

![Screenshot Placeholder: Template Suggestions in the empty Rules state](file:///placeholder_onboarding.png)

---

## 🛠️ Technical Architecture

### Performance & State Integrity
- **TanStack Query Transformations**: Used `select` hooks to compute high-level "Health" states from raw API metadata, ensuring the UI stays in sync without redundant re-renders.
- **Zustand for Cross-Tab State**: Implemented a global draft store to handle template injection, allowing seamless transitions from "Actions" to "Rule Creation".
- **Optimistic UI Updates**: Rule toggles and sync actions feel instantaneous while the backend processes changes in the background.

```bash
# Tech Stack
TypeScript | Next.js | TanStack Query | Zustand | Zod | Axios
```

---

## 🚀 Future Roadmap: Scaling Reliability

- **Dry Run Mode**: Preview rule behavior against the last 50 messages before activation.
- **Instruction Linting**: Client-side validation to prevent conflicting or non-deterministic AI logic.
- **Granular Sync Monitoring**: SSE-driven progress bars for real-time indexing visibility.

---

## 🏗️ Project Structure

```
├── apps/
│   ├── aira-web/          # Next.js Dashboard & Rive animations
├── packages/
│   ├── core/              # Shared API client, Schemas, & Auth
│   └── typescript-config/ # Global TS configurations
```

## 🏁 Getting Started

```bash
pnpm install
pnpm dev --filter=aira-web
```

---
MIT License © 2026 alwaysvivek
