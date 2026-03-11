# Phase 6: GitHub Actions CI — PLAN

## Goal
Automated CI pipeline that runs lint, type-check, and build on every push and PR to `master`.

## Success Criteria
- Every push to `master` and every PR triggers the CI workflow
- CI runs lint (`npm run lint`), type-check (`npx tsc --noEmit`), and build (`npm run build`)
- `node_modules` cached for faster runs
- Build must pass with env var stubs (API keys not needed at build time for Next.js)

## Tasks

### Task 1: Create CI workflow file
**File:** `.github/workflows/ci.yml`

- Trigger on: `push` to `master`, `pull_request` to `master`
- Runner: `ubuntu-latest`
- Node.js version: 20 (LTS, matches project)
- Steps:
  1. Checkout code
  2. Setup Node.js 20 with npm cache
  3. `npm ci` (clean install)
  4. `npm run lint`
  5. `npx tsc --noEmit`
  6. `npm run build`
- Environment: stub `OPENAI_API_KEY`, `PINECONE_API_KEY`, `ANTHROPIC_API_KEY` as dummy values so Next.js build doesn't fail on missing env vars (they're only used at runtime)

### Task 2: Verify locally
- Validate YAML syntax
- Confirm `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass locally before pushing

## Execution Order
1. Task 1 (create workflow file)
2. Task 2 (local verification)

## Notes
- Single job is sufficient — no need for matrix or parallel jobs for this project size
- npm cache via `setup-node` cache option (simpler than manual caching)
- Dummy env vars avoid build failures without exposing real secrets
