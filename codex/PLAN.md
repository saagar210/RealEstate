# Delta Improvement Plan

## A) Executive Summary

### Current state (repo-grounded)
- The app is a Tauri desktop product with a React/TypeScript UI and Rust backend (`src/`, `src-tauri/`).
- Frontend routing and shell layout are centralized in `src/App.tsx`.
- Frontend-to-backend contracts are centralized in `src/lib/tauri.ts` using `invoke` calls.
- Client state management is Zustand-based (`src/stores/*Store.ts`).
- Persistence uses SQLite via SQLx migrations (`src-tauri/migrations/20240101000001_initial.sql`).
- Backend command boundary is `src-tauri/src/commands/*` with DB modules in `src-tauri/src/db/*`.
- Baseline frontend build is green (`pnpm build`).
- Baseline frontend test gate is red because no test files exist (`pnpm test` exits non-zero).
- Rust verification in this environment is blocked by missing `glib-2.0` pkg-config dependency.

### Key risks
- No executable frontend tests means regressions can slip into core flows.
- `pnpm test` is currently a failing CI/local gate by default.
- Contract-heavy data entry (`PropertyForm`) lacks regression protection despite non-trivial validation + transformation logic.
- Backend verification cannot be fully established in this container due to system library mismatch.

### Improvement themes (prioritized)
1. Establish a passing frontend test baseline with meaningful coverage.
2. Add regression tests around high-risk user input transformation/validation.
3. Document verification constraints and preserve auditable resume artifacts.

## B) Constraints & Invariants (Repo-derived)

### Explicit invariants
- Property creation payload must match `CreatePropertyInput` shape (`src/lib/types.ts`).
- Required property fields (address/city/state/zip/sqft/price/propertyType/keyFeatures) must remain validated before submit (`src/components/property/PropertyForm.tsx`).
- Existing build pipeline (`pnpm build`) must remain green.

### Implicit invariants (inferred)
- Form UX expects key features to be tag-driven and non-empty before submit.
- Price is represented in cents at domain boundary and user-facing as formatted dollars string.
- Validation errors are presented inline and block submit.

### Non-goals
- No persistence schema changes.
- No AI generation flow changes.
- No Rust/Tauri contract refactor in this iteration.

## C) Proposed Changes by Theme (Prioritized)

### Theme 1 — Frontend test baseline
- **Current approach:** Vitest is configured, but no tests are present (`vitest.config.ts`, `src/__tests__/setup.ts`).
- **Proposed change:** Add targeted component tests for `PropertyForm`.
- **Why:** Converts `pnpm test` from failing due to empty suite into meaningful regression gate.
- **Tradeoffs + alternatives rejected:**
  - Rejected `--passWithNoTests` style workaround because it weakens quality guarantees.
- **Scope boundary:** only frontend tests and minimal code exposure for testability.
- **Migration approach:** introduce tests first, then run verification and adjust implementation only if tests expose defects.

### Theme 2 — High-risk form transformation/validation coverage
- **Current approach:** Validation and transformation logic exists but is untested.
- **Proposed change:** Add tests for required-field blocking and successful payload transformation (formatted price -> cents, string numeric fields -> numbers, trimmed optionals -> null).
- **Why:** `PropertyForm` is a domain-critical entrypoint and likely regression hotspot.
- **Tradeoffs:** Test maintenance overhead in exchange for safety.
- **Scope boundary:** no UI redesign, no backend contract change.
- **Migration approach:** behavior-preserving tests against current component behavior.

### Theme 3 — Audit trail + resumability
- **Current approach:** no codex progress artifacts.
- **Proposed change:** maintain session logs, decisions, checkpoints, verification records, and changelog draft.
- **Why:** enables interruption-safe long-running autonomous work.
- **Scope boundary:** documentation-only artifacts under `codex/`.

## D) File/Module Delta (Exact)

### ADD
- `codex/SESSION_LOG.md` — chronological implementation log.
- `codex/PLAN.md` — this delta plan.
- `codex/DECISIONS.md` — judgment call records.
- `codex/CHECKPOINTS.md` — checkpoint trail + rehydration summaries.
- `codex/VERIFICATION.md` — command/result history.
- `codex/CHANGELOG_DRAFT.md` — draft delivery notes.
- `src/components/property/PropertyForm.test.tsx` — regression tests for form behavior.

### MODIFY
- `src/components/property/PropertyForm.tsx` — only if needed for testability/behavior fix uncovered by tests.

### REMOVE/DEPRECATE
- None.

### Boundary rules
- Tests may mock callback boundaries but must not alter Tauri invoke contracts.
- No new cross-layer dependencies (`src` must not import Rust-layer code directly).

## E) Data Models & API Contracts (Delta)
- **Current definitions:** `src/lib/types.ts` and Rust DB models/commands.
- **Proposed changes:** none to runtime contracts.
- **Compatibility:** full backward compatibility (tests only; no API shape change).
- **Migrations:** none.
- **Versioning strategy:** not applicable for this scope.

## F) Implementation Sequence (Dependency-Explicit)

1. **Step P1 — Author test spec for `PropertyForm` required validations**
   - Files: `src/components/property/PropertyForm.test.tsx`
   - Preconditions: Vitest config available.
   - Dependencies: none.
   - Verification: `pnpm test src/components/property/PropertyForm.test.tsx`
   - Rollback: remove test file if irreconcilable.

2. **Step P2 — Add success-path submit transformation test**
   - Files: `src/components/property/PropertyForm.test.tsx`
   - Preconditions: P1 test scaffold exists.
   - Dependencies: P1.
   - Verification: `pnpm test src/components/property/PropertyForm.test.tsx`
   - Rollback: revert added case.

3. **Step P3 — Apply minimal component tweak only if tests expose defect**
   - Files: `src/components/property/PropertyForm.tsx` (conditional)
   - Preconditions: failing regression test proves issue.
   - Dependencies: P1/P2.
   - Verification: `pnpm test src/components/property/PropertyForm.test.tsx`
   - Rollback: `git checkout -- src/components/property/PropertyForm.tsx`.

4. **Step P4 — Full frontend verification + artifact updates**
   - Files: `codex/VERIFICATION.md`, `codex/SESSION_LOG.md`, `codex/CHANGELOG_DRAFT.md`, `codex/CHECKPOINTS.md`
   - Preconditions: tests passing.
   - Dependencies: P1-3.
   - Verification: `pnpm test` and `pnpm build`.
   - Rollback: revert last doc-only updates if needed.

## G) Error Handling & Edge Cases
- **Current patterns:** validation returns keyed field errors and blocks submit.
- **Proposed improvements:** assert with tests that invalid input prevents submit callback.
- **Edge cases to cover:**
  - submit with empty required fields
  - submit with valid minimal data + one key feature
  - conversion behavior for `priceDisplay` into cents
- **Tests:** add component-level tests that assert callback invocation and payload shape.

## H) Integration & Testing Strategy
- **Integration points:** `PropertyForm` -> page submit callback -> store/tauri invoke boundary.
- **Unit/component tests to add:** `PropertyForm.test.tsx` (invalid + valid flow).
- **Regression criteria:**
  - `pnpm test` returns zero.
  - `pnpm build` remains green.
- **Definition of done per theme:**
  - Theme 1: at least one meaningful test file exists and suite passes.
  - Theme 2: submit transform + validation guard behavior covered.
  - Theme 3: logs/checkpoints updated with commands + outcomes.

## I) Assumptions & Judgment Calls
- **Assumptions:**
  - UI labels/placeholders in `PropertyForm` are stable enough for test selectors.
  - Environment remains unable to run Rust tests due to missing `glib-2.0`.
- **Judgment calls:**
  - Prefer component tests over internal-function export refactor to avoid widening API surface.
  - Keep scope bounded to frontend reliability rather than cross-stack changes.
