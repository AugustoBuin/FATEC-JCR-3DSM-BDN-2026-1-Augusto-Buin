# TurboFlow — Code Review Guide

Use the `/review` skill for automated PR review. This document defines the standards that review is measured against.

---

## Review Dimensions

### 1. Architecture & Feature Isolation
- Feature code lives only in `src/features/[feature]/`
- No cross-feature imports
- Shared utilities in `lib/`, `components/`, or `utils/`
- Clear Server/Client component boundaries

### 2. Type Safety
- No `any` types without justification
- Zod schemas match TypeScript types
- API response types match backend contract
- Props and state are properly typed
- No type assertions (`as Type`) that hide errors

### 3. Testing
- New code has corresponding tests in `__tests__/`
- Tests follow AAA pattern (Arrange-Act-Assert)
- Edge cases and error paths are tested
- Test names are descriptive (describe what should happen, in Portuguese)
- No flaky or time-dependent tests

### 4. Performance
- No unnecessary re-renders (check dependency arrays in `useEffect`/`useMemo`)
- Large lists use keys; consider virtualization for 100+ items
- Images are optimized and lazy-loaded
- Heavy computations are memoized or moved to server
- No N+1 query patterns

### 5. State Management
- Server state uses React Query (not Zustand)
- Client state uses appropriate tool (`useState`, Zustand)
- No duplicate state synchronization
- Mutations use `useMutation`, not raw `api` calls inside components

### 6. API Integration
- Uses `api` client from `@/lib/api-client.ts`
- Requests are properly typed (generics on `api.get<T>`, `api.post<T>`)
- Error handling is in place
- No hardcoded URLs or API keys

### 7. UI & Accessibility
- Semantic HTML (`button`, `article`, `nav`, `section`, `h1`–`h6`)
- ARIA labels where element purpose isn't self-evident
- Keyboard navigation works (tabIndex, onKeyDown for custom interactive elements)
- Uses Tailwind semantic classes — no hardcoded hex colors

### 8. Code Quality (padroes-dev-turbo.md §4)
- No dead code or commented-out logic
- Clear naming: functions say what they do, in English
- Single Responsibility Principle: one component = one purpose
- No magic strings/numbers — extract to constants
- Comments in Portuguese, explaining WHY not WHAT

### 9. Next.js 16 Specifics
- Uses App Router patterns correctly
- `'use client'` used only where interactivity is needed
- Data fetching at the correct layer (server > client)
- Layouts vs. page components used appropriately

### 10. Dependencies & Security
- No unnecessary dependencies added
- No direct `eval` or `innerHTML` with user data
- Environment variables validated via Zod in `src/config/env.ts`
- No secrets or API keys in code

---

## Severity Levels

| Severity | Definition | Action |
|----------|-----------|--------|
| **CRITICAL** | Security, type safety, or architecture violation | Must fix before merge |
| **IMPORTANT** | Test coverage gap, performance issue, accessibility | Should fix before merge |
| **NICE-TO-HAVE** | Optional improvement, minor refactoring | Non-blocking comment |
| **QUESTION** | Clarification needed | Ask before approving |

---

## PR Checklist (padroes-dev-turbo.md §11)

- [ ] Branch created from the correct base branch
- [ ] Branch name follows GitFlow (`feature/*`, `bugfix/*`, `hotfix/*`)
- [ ] Code follows naming conventions (English identifiers, Portuguese comments)
- [ ] Responsibilities are clearly separated
- [ ] No business logic in wrong layers (controllers, repositories)
- [ ] No inline magic strings or numbers
- [ ] User-facing messages are in Portuguese and non-technical
- [ ] Technical errors are not exposed to the client
- [ ] New libraries are documented
- [ ] Code tested locally
- [ ] Task updated in Jira

---

## Approval Criteria

**Approve when:**
- No CRITICAL or IMPORTANT issues
- Tests pass and coverage is adequate
- Architecture is respected
- Code is maintainable and type-safe

**Request changes when:**
- Any CRITICAL issue exists (architecture violation, type safety, security)
- Test coverage is missing or inadequate
- IMPORTANT performance or accessibility problems
