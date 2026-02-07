# Feature branch: session-improvements

**Branch:** `feature/session-improvements`  
**Base:** created from `master` (or previous default branch)

## Commits (in order)

1. **feat(schedule): Once/Daily time range, run count, interval within span**
   - `schedule-selector.tsx`: Once = between start/end time + how many times; Daily = start time, optional time span, optional repeat every N min
   - `packages/core/src/schemas/rules.ts`: `trigger_time_end`, `run_count`, `interval_minutes`
   - `rules/new/page.tsx`, `rules/[id]/page.tsx`: new schedule state and payload; Edit rule Save button width aligned (max-w-lg)

2. **feat(api): CORS proxy via Next.js rewrites**
   - `next.config.js`: rewrites `/api/*` → `API_UPSTREAM` when set
   - `.env.example`: `NEXT_PUBLIC_API_BASE_URL=/api`, `API_UPSTREAM` for local dev

3. **feat(theme): switcher in hub header, mobile toggle, toasts bottom-right**
   - `theme-switcher.tsx`: beside name/avatar in hub; mobile = single light/dark toggle, desktop = full pill; hydration-safe
   - `(app)/layout.tsx`: removed floating theme (only in hub now)
   - `toast.tsx`: position bottom-right (`bottom-28 right-6`), `flex-col-reverse`
   - `hub-header.tsx`, `auth-layout.tsx`: ThemeSwitcher usage

4. **fix(build): skeleton type import, tsconfig react-jsx**
   - `skeleton.tsx`: `import type { HTMLAttributes } from 'react'`
   - `tsconfig.json`: `"jsx": "react-jsx"`

5. **fix(build): wrap useSearchParams in Suspense**
   - `(app)/page.tsx`, `(app)/workspace/page.tsx`, `(app)/whatsapp/group-selection/page.tsx`: *Content + Suspense wrapper + fallback
   - `rules/new/page.tsx`: already wrapped in commit 1

6. **chore: remove dev bypasses**
   - `api.ts`: removed `NEXT_PUBLIC_DEV_ACCESS_TOKEN` fallback
   - `.env.example`: removed dev token comment
   - Auth bypass (`NEXT_PUBLIC_SKIP_AUTH`) was not in the committed code on this branch; guard is clean.

## Bypasses removed (for future reference)

- **Auth:** No `NEXT_PUBLIC_SKIP_AUTH` in `auth-guard.tsx` on this branch.
- **Token:** No `NEXT_PUBLIC_DEV_ACCESS_TOKEN` in `api.ts` or `.env.example`.

## Uncommitted (left on purpose)

- `app/globals.css`, `app/layout.tsx`, `app/providers.tsx`, `oauth-buttons.tsx`, `header.tsx`, `package.json`, `pnpm-lock.yaml` — not part of this feature set; you can commit or discard separately.

## Working ahead

- Merge or rebase `feature/session-improvements` when ready.
- For local dev without login: use real OAuth or set cookies manually; no env bypasses remain.
- For CORS: keep using `NEXT_PUBLIC_API_BASE_URL=/api` and `API_UPSTREAM` in `.env.local` when needed.
