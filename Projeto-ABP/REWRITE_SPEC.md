# Project Architecture: Lead Management System (v2)

This document outlines the architecture, tech stack, and directory structure for the rewritten Lead Management System. It is designed to be used as context for development, strictly adhering to **Domain-Driven Design (DDD)** and **Test-Driven Development (TDD)** principles.

## 🚀 Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** MongoDB Atlas with Mongoose
- **Methodology:** DDD + TDD
- **Testing:** Jest
- **Validation:** Zod

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Class Variance Authority (CVA)
- **HTTP Client:** Axios
- **State/Data Fetching:** React Query

---

## 🏗️ Backend Structure (NestJS + DDD)

```text
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root Module
│   ├── shared/                    # Shared Kernel
│   │   ├── core/                  # Base AggregateRoot, Entity, ValueObject
│   │   └── errors/                # Global Domain Errors
│   └── modules/                   # Bounded Contexts
│       └── leads/                 # Example Domain: Leads
│           ├── leads.module.ts    # NestJS Module (Dependency Injection wiring)
│           ├── domain/            # 1. CORE DOMAIN (No framework dependencies)
│           │   ├── entities/      # Business Entities
│           │   ├── value-objects/ # Immutable Value Objects
│           │   └── repositories/  # Repository Interfaces (Ports)
│           ├── application/       # 2. USE CASES
│           │   ├── use-cases/     # Application logic/orchestration
│           │   └── dtos/          # Data Transfer Objects
│           ├── infrastructure/    # 3. ADAPTERS (External world)
│           │   ├── database/
│           │   │   ├── mongoose/  # Mongoose Schemas & Models
│           │   │   └── repos/     # Mongoose Repository Implementations
│           │   └── http/          # NestJS Controllers & Routes
│           └── __tests__/         # 4. TDD / TESTS
│               ├── domain/        # Unit tests for domain logic
│               ├── application/   # Unit tests for use cases (mocking repos)
│               └── e2e/           # Integration tests
```

---

## 🎨 Frontend Structure (Next.js + Clean Architecture)

```text
frontend/
├── src/
│   ├── app/                       # 1. NEXT.JS ROUTING (Composes the UI)
│   │   ├── layout.tsx             # Global layout & providers
│   │   └── leads/                 # Leads route
│   │       └── page.tsx           # Composes presentation/views
│   ├── shared/                    # 2. SHARED DESIGN SYSTEM
│   │   ├── ui/                    # Atomic components (Tailwind + CVA)
│   │   │   └── Button/            # Example component
│   │   │       ├── Button.tsx
│   │   │       └── Button.test.tsx
│   │   ├── api/                   # Axios setup & interceptors
│   │   └── lib/                   # Utils (e.g., cn helper for Tailwind)
│   └── modules/                   # 3. FEATURE MODULES
│       └── leads/
│           ├── domain/            # Types and pure business logic
│           ├── infrastructure/    # API calls (Axios services)
│           ├── application/       # Hooks & State (React Query)
│           ├── presentation/      # Domain-specific components & views
│           └── __tests__/         # Feature-specific tests
```

---

## 🛠️ Development Principles

1.  **TDD First:** Write the test before the implementation.
    -   Backend: Test Value Objects -> Entities -> Use Cases -> Repositories -> Controllers.
    -   Frontend: Test Hooks/Logic -> UI Components.
2.  **Strict Domain Isolation:** The `domain/` folder should never import from `infrastructure/` or `@nestjs/common`.
3.  **Dependency Inversion:** High-level modules (Application) should not depend on low-level modules (Infrastructure). Both should depend on abstractions (Domain Interfaces).
4.  **Value Objects:** Use them for everything that has logic but no identity (e.g., CPF, Email, Phone, NegotiationStatus).
5.  **CVA on Frontend:** Use `class-variance-authority` for all shared UI components to manage design system variants strictly.

## 📦 Database Schema (MongoDB Atlas)
*References `nosql-structure.json` for specific field requirements.*
- **Collections:** `times`, `usuarios`, `clientes`, `leads`, `logEventos`.
- **Strategy:** Embed negotiations within leads; reference teams, users, and clients.
