# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lead Management System (v2) — a full-stack TypeScript application built with **NestJS + MongoDB** (backend) and **Next.js + Tailwind** (frontend), strictly following **Domain-Driven Design (DDD)** and **Test-Driven Development (TDD)** principles.

## Development Commands

### Backend (NestJS + MongoDB)

Located in `backend/` directory.

```bash
# Development
cd backend
npm run start:dev              # Run with watch mode

# Build & Production
npm run build                  # Compile to dist/
npm run start:prod             # Run compiled version
npm start                      # Start server

# Testing
npm test                       # Run all unit tests
npm run test:watch             # Watch mode for tests
npm run test:e2e               # Run e2e tests (configured in test/jest-e2e.json)
npm run test:cov               # Coverage report

# Code Quality
npm run lint                   # Fix ESLint issues
npm run format                 # Format code with Prettier
```

### Frontend (Next.js + React)

Located in `frontend/` directory.

```bash
# Development
cd frontend
npm run dev                    # Start dev server (http://localhost:3000)

# Build & Production
npm run build                  # Build for production
npm start                      # Run production build

# Code Quality
npm run lint                   # Run ESLint
```

## Architecture Overview

### Backend Structure (NestJS + DDD)

```
backend/src/
├── modules/[feature]/
│   ├── domain/                 # Pure business logic (no framework deps)
│   │   ├── entities/           # Business entities
│   │   ├── value-objects/      # Immutable value objects
│   │   └── repositories/       # Repository interfaces (ports)
│   ├── application/            # Use cases & orchestration
│   │   ├── use-cases/
│   │   └── dtos/
│   ├── infrastructure/         # Adapters (frameworks, DB, HTTP)
│   │   ├── database/mongoose/
│   │   ├── database/repos/
│   │   └── http/               # NestJS controllers
│   └── __tests__/              # TDD tests
│       ├── domain/
│       ├── application/
│       └── e2e/
└── shared/                     # Shared kernel
    ├── core/                   # Base classes (AggregateRoot, Entity, ValueObject)
    └── errors/                 # Global domain errors
```

**Dependency Rule:** Infrastructure → Application → Domain (always points inward, never outward from Domain).

### Frontend Structure (Next.js)

```
frontend/src/
├── app/                        # Next.js App Router (file-based routing)
│   └── leads/
│       └── page.tsx            # Route handler/page
├── shared/                     # Design system & utilities
│   ├── ui/                     # Atomic components (Tailwind + CVA)
│   │   └── Button/
│   │       ├── Button.tsx
│   │       └── Button.test.tsx
│   ├── api/                    # Axios setup & interceptors
│   └── lib/                    # Utils (cn helper, etc.)
└── modules/[feature]/          # Feature modules
    └── leads/
        ├── domain/             # Types & business logic
        ├── infrastructure/     # Axios API services
        ├── application/        # React Query hooks & state
        ├── presentation/       # Feature-specific components
        └── __tests__/
```

**Key Principle:** Separate Server Components (for data fetching/SEO) from Client Components (interactivity/hooks).

## Coding Standards

### Naming Conventions

| Type | Language | Pattern | Example |
|------|----------|---------|---------|
| Code (Classes, Variables, Functions) | English | camelCase / PascalCase | `createLead()`, `LeadEntity` |
| React Components | English | PascalCase | `LeadCard.tsx` |
| Global Constants | English | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Files | English | kebab-case | `auth-repository.ts` |
| User Messages | Portuguese | — | "E-mail inválido." |

### Code Principles

- **Single Responsibility:** Functions/classes do one thing well.
- **DRY:** Extract reused logic to `shared/` or module utils.
- **Clean Code:** Prefer clarity over cleverness. Autoexplicative names.
- **Comments:** Only for non-obvious business rules or technical decisions. Never describe what code obviously does.
- **Value Objects:** Use for domain concepts with logic but no identity (CPF, Email, Status).
- **CVA on Frontend:** All shared UI components must use `class-variance-authority` for variant management.

### Definition of Done

A feature/fix is complete when:
1. **TDD:** Unit/integration tests cover main logic paths.
2. **Architecture:** Respects DDD layer separation and dependency rules.
3. **Code Quality:** Passes linting, follows naming standards.
4. **No Accidental Coupling:** Modules remain independent via dependency inversion.
5. **Documentation:** New libs/patterns explained in module README if non-obvious.

## Key Files & References

- **Architecture Spec:** [`REWRITE_SPEC.md`](REWRITE_SPEC.md) — Full technical blueprint (database schema, detailed layer structure).
- **Dev Standards:** [`DEV_STANDARDS.md`](DEV_STANDARDS.md) — Nomenclature, message patterns, TDD criteria.
- **Database Schema:** [`nosql-structure.json`](nosql-structure.json) — MongoDB collection & field specifications.
- **Backend Tests Setup:** `backend/test/jest-e2e.json` — E2E test configuration.

## Testing Patterns

### Backend TDD Workflow

1. **Domain Tests (Unit):** Test entities, value objects, pure business logic.
   ```bash
   backend/src/modules/leads/__tests__/domain/
   ```
2. **Application Tests (Unit):** Test use cases with mocked repositories.
   ```bash
   backend/src/modules/leads/__tests__/application/
   ```
3. **E2E Tests (Integration):** Test full request flow with real database.
   ```bash
   backend/test/jest-e2e.json
   npm run test:e2e
   ```

### Frontend Testing

Use `@testing-library/react` for component tests.

```bash
frontend/src/shared/ui/Button/Button.test.tsx
```

## Dependency Injection & Modules

Backend uses NestJS Dependency Injection via the module system:

- **Module Composition:** `*.module.ts` wires providers (services, repositories) for each bounded context.
- **Service Layer:** Application services orchestrate domain logic and delegate to repository interfaces.
- **Repository Implementations:** Infrastructure layer provides concrete Mongoose repositories.

Frontend uses React Context and React Query for state/data management — no DI needed.

## Common Pitfalls to Avoid

1. **Domain Layer Pollution:** Never import `@nestjs/common`, external libraries, or infrastructure into `domain/`.
2. **Circular Dependencies:** Ensure dependency graph only points inward.
3. **Hardcoded Values:** Extract to constants in `shared/` or module-level `constants.ts`.
4. **Magic Strings:** Use enums or value objects for status, roles, error codes.
5. **Untested Code:** TDD is non-negotiable — write tests first, then implementation.
6. **Over-Engineering:** Don't create abstractions for hypothetical future use; keep it simple until needed.

## Environment & Setup

- **Node Version:** ^18.x (check `package.json`)
- **Package Manager:** npm
- **Database:** MongoDB Atlas (connection string in `.env` — not committed)
- **Frontend Port:** 3000 (default)
- **Backend Port:** 3001 (default, check `main.ts`)

## Next.js Version Note

The frontend uses Next.js 16.2.6 with the App Router — APIs and conventions may differ from older Next.js versions. When in doubt, check `node_modules/next/dist/docs/`.

---

For in-depth guidance on specific patterns, refer to [`DEV_STANDARDS.md`](DEV_STANDARDS.md) and [`REWRITE_SPEC.md`](REWRITE_SPEC.md).
