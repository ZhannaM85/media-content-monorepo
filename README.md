# Media Rights Admin Platform

A small production-style Angular platform demonstrating **Nx monorepo**, **Module Federation** (micro frontends), shared libraries, and role-based access control. It simulates a simplified media/content rights management platform.

## Architecture

- **admin-shell** (host): Main app with layout, nav, login, and lazy-loaded remotes.
- **contentapp** (remote): Content list from TMDB API, filter, and create/edit forms (drafts in memory).
- **rightsapp** (remote): Assign regions, expiration date, and EU/GDPR dynamic form.

**Shared libs:**

- `shared-types`: Interfaces and enums (Content, Rights, User, Role, Region).
- `shared-ui`: Reusable components (table, button, input, pagination, SafeUrl pipe).
- `shared-data-access`: TMDB service, rights store, API tokens.
- `shared-auth`: Mock JWT auth, HTTP interceptor, guards (auth, role), `*libHasRole` directive.

**Roles:** `admin` (full access), `editor` (create/edit content and rights), `viewer` (read-only).

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

## Setup

```bash
cd media-content-monorepo
npm install
```

### TMDB API (optional)

For the Content app to load movies, set a TMDB API key:

1. Get a free key at [The Movie Database (TMDB)](https://developer.themoviedb.org/docs/getting-started).
2. When serving or building, set the key (e.g. in `.env` or shell):
   - `NX_TMDB_API_KEY=your_key`
   - Or put it in `apps/admin-shell/src/environments/environment.ts` (do not commit real keys).

Without a key, the content list will show empty or errors when loading from TMDB.

## Run

```bash
# Serve the host (and remotes) on http://localhost:4200
npx nx serve admin-shell
```

Then open http://localhost:4200. You will be redirected to `/login`. Log in with any username and role (viewer, editor, admin) to access Content and Rights.

## Build

```bash
npx nx build admin-shell
```

Output is in `dist/apps/admin-shell`.

## Test

**Unit (Jest):**

```bash
npx nx run admin-shell:test
# Or run shared-auth tests from lib folder:
cd libs/shared-auth && npx jest -c jest.config.cts
```

**E2E (Playwright):**

```bash
npx nx run admin-shell-e2e:e2e
```

E2E covers: redirect to login when unauthenticated, login flow, content page, rights assign flow, and viewer not seeing “Add content”.

## Project structure

```
apps/
  admin-shell/     # Host (layout, auth, routes to remotes)
  contentapp/      # Remote: content list + form
  rightsapp/       # Remote: rights list + assign form
libs/
  shared-ui/
  shared-types/
  shared-data-access/
  shared-auth/
```

## Decisions

- **Nx**: Monorepo tooling, Module Federation generators, and clear app/lib boundaries.
- **Module Federation**: Host loads remotes at runtime; each remote can be built and deployed independently.
- **TMDB API**: Free, non-commercial API for movie data; content list and detail use it; drafts are stored in memory.
- **Mock JWT**: No backend; token payload (username, role) is stored in memory/localStorage for demo and RBAC.

## Optional: CI

To add CI (e.g. GitHub Actions):

```bash
npx nx g ci-workflow
```

Then add steps: `npm ci`, `npx nx run-many -t lint`, `npx nx run-many -t test`, `npx nx build admin-shell`, and optionally `npx nx run admin-shell-e2e:e2e`.
