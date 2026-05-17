# Lead Management System (v2) - Gemini CLI Context

Este projeto é um sistema de gerenciamento de leads reescrito seguindo rigorosamente os princípios de **Domain-Driven Design (DDD)** e **Test-Driven Development (TDD)**.

## 🚀 Tecnologias Principais

- **Backend:** NestJS (Node.js), MongoDB (Mongoose), Zod (Validation), Jest (Testing).
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, CVA (Class Variance Authority), React Query, Axios.

## 🏗️ Arquitetura e Padrões

O projeto segue uma separação rigorosa de camadas (Clean Architecture):
1. **Domain (Core):** Regras de negócio puras (Entities, Value Objects). Sem dependências externas.
2. **Application (Use Cases):** Orquestração e lógica de aplicação.
3. **Infrastructure (Adapters):** Implementações de banco de dados (Mongoose), Controllers (NestJS), APIs externas.

**Regra de Ouro:** A dependência sempre aponta para dentro: `Infrastructure -> Application -> Domain`.

### Convenções de Nomenclatura
- **Código (Classes, Vars, Funções):** Inglês (`camelCase` / `PascalCase`).
- **Mensagens para Usuário:** Português.
- **Mensagens de Log/Dev:** Inglês.
- **Arquivos:** Inglês (`kebab-case`).

## 🛠️ Comandos Principais

### Backend (`/backend`)
- **Desenvolvimento:** `npm run start:dev`
- **Testes:** `npm test` ou `npm run test:watch`
- **Build:** `npm run build`

### Frontend (`/frontend`)
- **Desenvolvimento:** `npm run dev`
- **Testes:** `npm test`
- **Lint:** `npm run lint`

## 📋 Documentação de Referência

Consulte estes arquivos na raiz para diretrizes detalhadas:
- `DEV_STANDARDS.md`: Padrões de Clean Code, nomenclatura e critérios de qualidade.
- `REWRITE_SPEC.md`: Especificação técnica completa, arquitetura de pastas e stack.
- `TEST_PATTERNS.md`: Protocolos de TDD (Red-Green-Refactor) e padrões de Mocking.
- `SPRINT_0.md`: Checklist de progresso do scaffold inicial.
- `nosql-structure.json`: Estrutura das coleções do MongoDB.

## 🤖 Agentes Especializados (Sub-Agents)

Este projeto conta com agentes especializados para tarefas específicas, que podem ser invocados via `invoke_agent`:

1.  **`backend-ddd-architect`**: Especialista em NestJS, DDD e TDD. Use para criar entidades, value objects, use cases e módulos seguindo a arquitetura definida.
2.  **`ui-component-factory`**: Especialista em Next.js, Tailwind CSS e CVA. Use para gerar componentes UI atômicos ou de feature, sempre acompanhados de testes.
3.  **`project-compliance-officer`**: Auditor de padrões. Use para verificar se o código segue o `DEV_STANDARDS.md`, se há isolamento de camadas e se as convenções de nomenclatura estão corretas.

## 🛠️ Instruções para IA (Gemini CLI)

1. **TDD First:** Sempre gere o teste (Red) antes da implementação (Green).
2. **Delegue com Sabedoria:** Use os agentes especializados acima para tarefas de grande escala ou que exijam conformidade rigorosa.
3. **Isolamento de Domínio:** Nunca importe nada de `infrastructure` ou `@nestjs/common` dentro da pasta `domain`.
4. **Validations:** Use Value Objects para garantir invariantes de negócio (ex: Email, CPF).
5. **Surgical Edits:** Ao modificar código existente, mantenha a consistência com os padrões de design (CVA no frontend, Injeção de Dependência no backend).
