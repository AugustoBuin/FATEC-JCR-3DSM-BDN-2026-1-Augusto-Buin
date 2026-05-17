# Sprint 0 — Initial Scaffold Progress

This document tracks the step-by-step implementation of the project skeleton. Check each item as it is completed.

---

## Phase 0 — Toolchain Install

- [ ] **0.1** Scaffold NestJS backend from `Projeto-ABP/`:
  ```bash
  npx @nestjs/cli@latest new backend --package-manager npm --skip-git --language TypeScript
  ```
- [ ] **0.2** Install backend dependencies from `backend/`:
  ```bash
  npm install @nestjs/mongoose mongoose zod
  npm install --save-dev jest @types/jest ts-jest @nestjs/testing supertest @types/supertest
  ```
- [ ] **0.3** Install frontend dependencies from `frontend/`:
  ```bash
  npm install axios @tanstack/react-query class-variance-authority clsx
  npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event ts-node @types/jest
  ```

---

## Phase 1 — Backend: Shared Kernel

- [ ] **1.1** `backend/src/shared/core/entity.ts`
  - Abstract base class for domain entities
  - Holds `_id` (UUID via `crypto.randomUUID()` if none provided), `props`, identity-based `equals()`

- [ ] **1.2** `backend/src/shared/core/value-object.ts`
  - Abstract base for immutable value objects
  - Props frozen at construction, `equals()` via `JSON.stringify` comparison

- [ ] **1.3** `backend/src/shared/errors/domain-error.ts`
  - Extends `Error`, carries `code: string` (UPPER_SNAKE_CASE for devs)
  - User-facing `message` always in Portuguese

---

## Phase 2 — Backend: Leads Domain (TDD)

- [ ] **2.1** `backend/src/modules/leads/__tests__/domain/email.value-object.spec.ts` **(Red first)**
  - valid email creates VO
  - empty string throws `DomainError` with code `INVALID_EMAIL`
  - string without `@` throws
  - string without domain throws
  - two VOs with same value are equal via `equals()`

- [ ] **2.2** `backend/src/modules/leads/domain/value-objects/email.value-object.ts` **(Green)**
  - Static factory `Email.create(raw)`: validates regex, normalizes lowercase
  - Throws `DomainError('E-mail inválido.', 'INVALID_EMAIL')` on failure
  - Private constructor, `get value(): string`

- [ ] **2.3** `backend/src/modules/leads/__tests__/domain/lead.entity.spec.ts` **(Red first)**
  - creates Lead with auto-generated id
  - stores email as `Email` VO
  - stores name
  - `Lead.reconstitute()` preserves the provided id

- [ ] **2.4** `backend/src/modules/leads/domain/entities/lead.entity.ts` **(Green)**
  - Props: `name: string`, `email: Email`, `createdAt: Date`
  - `static create({ name, email })` — factory for new leads
  - `static reconstitute({ name, email, createdAt }, id)` — factory for DB reconstruction

- [ ] **2.5** `backend/src/modules/leads/domain/repositories/lead-repository.interface.ts`
  - Interface: `save`, `findById`, `findAll`
  - Exports `LEAD_REPOSITORY = 'LEAD_REPOSITORY'` injection token

---

## Phase 3 — Backend: Application Layer (TDD)

- [ ] **3.1** `backend/src/modules/leads/application/dtos/create-lead.dto.ts`
  - Zod schema with `name` (min 2 chars) and `email` (email format)
  - Error messages in Portuguese
  - `CreateLeadDto` type inferred from schema

- [ ] **3.2** `backend/src/modules/leads/__tests__/application/create-lead.use-case.spec.ts` **(Red first)**
  - calls `mockRepo.save` once with valid data
  - throws `DomainError` when email is invalid
  - does not call `mockRepo.save` on validation failure

- [ ] **3.3** `backend/src/modules/leads/application/use-cases/create-lead.use-case.ts` **(Green)**
  - `@Inject(LEAD_REPOSITORY)` is the only NestJS import allowed here
  - Calls `Lead.create(dto)` then `leadRepository.save(lead)`

---

## Phase 4 — Backend: Infrastructure Layer

- [ ] **4.1** `backend/src/modules/leads/infrastructure/database/mongoose/lead.schema.ts`
  - `@Schema({ collection: 'leads', timestamps: true })`
  - Fields: `name: string`, `email: string (lowercase)`

- [ ] **4.2** `backend/src/modules/leads/infrastructure/database/repos/mongoose-lead.repository.ts`
  - Implements `ILeadRepository`
  - `save()` → `model.create({ _id: lead.id, name, email: lead.email.value })`
  - `findById()` / `findAll()` → call `Lead.reconstitute()` for mapping

- [ ] **4.3** `backend/src/modules/leads/infrastructure/http/pipes/zod-validation.pipe.ts`
  - `PipeTransform` using `schema.safeParse(value)`
  - Throws `BadRequestException` with flattened field errors on failure

- [ ] **4.4** `backend/src/modules/leads/infrastructure/http/leads.controller.ts`
  - `POST /leads` → `@Body(new ZodValidationPipe(CreateLeadSchema))` → `useCase.execute(dto)`
  - Returns 201

- [ ] **4.5** `backend/src/modules/leads/leads.module.ts` — NestJS DI wiring
  - `MongooseModule.forFeature([{ name: LeadModel.name, schema: LeadSchema }])`
  - `{ provide: LEAD_REPOSITORY, useClass: MongooseLeadRepository }`
  - Providers: `CreateLeadUseCase`; Controllers: `LeadsController`

- [ ] **4.6** `backend/src/app.module.ts` — Replace generated
  - `MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/leads-crm')`
  - Imports `LeadsModule`

- [ ] **4.7** `backend/src/main.ts` — Update generated
  - `app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' })`
  - `app.setGlobalPrefix('api')`
  - Listens on `process.env.PORT ?? 3001`

- [ ] **4.8** Add `@/*` path alias to `backend/tsconfig.json`
  ```json
  "paths": { "@/*": ["./src/*"] }
  ```

- [ ] **4.9** `backend/jest.config.ts` — ts-jest, `rootDir: 'src'`, `moduleNameMapper` for `@/`

---

## Phase 5 — E2E Stub

- [ ] **5.1** `backend/src/modules/leads/__tests__/e2e/leads.e2e.spec.ts`
  - `POST /api/leads` with valid body → expect 201
  - Will stay Red until MongoDB is connected — establishes the structural contract

---

## Phase 6 — Frontend: Config & Shared Utilities

- [ ] **6.1** `frontend/jest.config.ts` — uses `next/jest` transformer (handles aliases, CSS/font mocks)
- [ ] **6.2** `frontend/jest.setup.ts` — `import '@testing-library/jest-dom'`
- [ ] **6.3** Add test scripts to `frontend/package.json`: `test`, `test:watch`, `test:coverage`
- [ ] **6.4** `frontend/src/shared/lib/cn.ts` — `cn()` utility wrapping `clsx`
- [ ] **6.5** `frontend/src/shared/api/axios-instance.ts`
  - `baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'`
  - Response interceptor logging `[API Error]` with status + URL

---

## Phase 7 — Button Component (TDD)

- [ ] **7.1** `frontend/src/shared/ui/Button/Button.test.tsx` **(Red first)**
  - renders with primary variant by default
  - renders secondary variant styles when `variant="secondary"`
  - calls onClick when clicked
  - does not call onClick when disabled
  - renders children text

- [ ] **7.2** `frontend/src/shared/ui/Button/Button.tsx` **(Green)**
  - `'use client'`
  - CVA variants: `primary` / `secondary`; sizes: `sm` / `md`
  - Extends `ButtonHTMLAttributes<HTMLButtonElement>`

---

## Phase 8 — Frontend: Leads Feature Module

- [ ] **8.1** `frontend/src/modules/leads/domain/lead.types.ts`
  - `Lead` interface: `id`, `name`, `email`, `createdAt: string` (ISO from JSON)
  - `CreateLeadInput` interface: `name`, `email`

- [ ] **8.2** `frontend/src/modules/leads/infrastructure/leads.api.ts`
  - `leadsApi.getAll()` → `GET /leads`
  - `leadsApi.create(input)` → `POST /leads`

- [ ] **8.3** `frontend/src/modules/leads/application/use-leads.hook.ts`
  - `useLeads()` — `useQuery({ queryKey: ['leads'], queryFn: leadsApi.getAll })`
  - `useCreateLead()` — `useMutation` that invalidates `['leads']` on success

- [ ] **8.4** `frontend/src/modules/leads/presentation/views/LeadsView.tsx`
  - `'use client'`
  - Uses `useLeads()`, shows loading/error in Portuguese
  - Renders lead list + "Novo Lead" Button

---

## Phase 9 — Next.js Pages

- [ ] **9.1** `frontend/src/shared/api/query-provider.tsx`
  - `'use client'`; `useState(() => new QueryClient())` per session
  - Wraps children in `<QueryClientProvider>`

- [ ] **9.2** Modify `frontend/src/app/layout.tsx`
  - Wrap children with `<QueryProvider>`
  - Update `<html lang="pt-BR">` and metadata title

- [ ] **9.3** Replace `frontend/src/app/page.tsx` with `redirect('/leads')`

- [ ] **9.4** Create `frontend/src/app/leads/page.tsx`
  - Server Component; composes `<LeadsView />`
  - Exports `metadata = { title: 'Leads | CRM' }`

---

## Phase 10 — Env Files & Database Schema

- [ ] **10.1** `backend/.env.example`
  ```ini
  MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/leads-crm
  PORT=3001
  FRONTEND_URL=http://localhost:3000
  ```
- [ ] **10.2** `frontend/.env.example`
  ```ini
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
  ```
- [ ] **10.3** `nosql-structure.json` (project root) — documents the 5 collections:
  - `times`, `usuarios`, `clientes`, `leads` (with embedded `negotiations[]`), `logEventos`

---

## Verification Checklist

- [ ] `cd backend && npm test` — Email VO and CreateLead use case tests pass
- [ ] `cd backend && npx tsc --noEmit` — no TypeScript errors
- [ ] `cd frontend && npm test` — Button tests pass
- [ ] `cd frontend && npx tsc --noEmit` — no TypeScript errors
- [ ] Backend starts on port 3001: `cd backend && npm run start:dev`
- [ ] Frontend starts on port 3000: `cd frontend && npm run dev`
- [ ] Root `/` redirects to `/leads`; page renders "Carregando leads..." (expected — API not connected)
- [ ] E2E test stays Red (expected — needs real MongoDB)

---

## Critical Files to Get Right

| File                                                                         | Why                                                                                |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `backend/src/shared/core/value-object.ts`                                    | Foundation for all VOs; errors here break the entire domain layer                  |
| `backend/src/modules/leads/domain/repositories/lead-repository.interface.ts` | `LEAD_REPOSITORY` token must match exactly in `leads.module.ts`                    |
| `backend/src/modules/leads/leads.module.ts`                                  | All DI wiring; misconfiguration causes silent injection failures                   |
| `frontend/src/shared/api/query-provider.tsx`                                 | Without this client wrapper, `QueryClientProvider` in `layout.tsx` crashes Next.js |
| `frontend/jest.config.ts`                                                    | Must use `next/jest` transformer; hand-rolled config fails on `@/` imports         |
