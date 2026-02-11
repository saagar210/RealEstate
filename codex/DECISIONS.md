# Decisions

## 2026-02-10
1. **Scope decision:** prioritize frontend test baseline health over backend refactors.
   - **Why:** `pnpm test` is currently red due to missing tests, and this is directly actionable without changing product behavior.
   - **Alternatives considered:**
     - Change `test` script to pass with no tests (rejected: weakens quality gate).
     - Attempt full Rust stack fixes in container (rejected for this iteration due to missing system libs and high scope).
2. **Testing selector strategy:** used role-based indexed combobox selection in PropertyForm tests.
   - **Why:** component has two select inputs without explicit label-for linkage, causing ambiguous single-role query.
   - **Alternative:** add explicit htmlFor/id attributes in component (deferred to avoid behavior/markup change outside current scope).
