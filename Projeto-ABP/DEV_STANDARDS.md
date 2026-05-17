# Desenvolvimento Turbo — Padrões de Projeto (v2)

Este documento define os padrões essenciais de desenvolvimento para o novo Lead Management System, adaptando os padrões corporativos para nossa arquitetura DDD/TDD com NestJS e Next.js.

## 1. Padrões Gerais de Código (Clean Code)

O código deve ser escrito com foco em clareza, manutenção e leitura futura.

- **Nomes Claros:** Variáveis, funções, classes e arquivos devem ter nomes autoexplicativos.
- **Responsabilidade Única (SRP):** Funções e classes devem fazer apenas uma coisa.
- **Evite Duplicação (DRY):** Extraia lógica comum para o Shared Kernel ou Utils.
- **Código Simples:** Prefira legibilidade a soluções excessivamente complexas ou "espertas".
- **Comentários:** Escrever em **português** apenas para explicar regras de negócio complexas ou decisões técnicas não óbvias. Não comente o óbvio.

## 2. Padrões de Nomenclatura

| Tipo de Informação              | Idioma    | Padrão                 | Exemplo                      |
| :------------------------------ | :-------- | :--------------------- | :--------------------------- |
| Código (Classes, Vars, Funções) | Inglês    | camelCase / PascalCase | `createLead()`, `LeadEntity` |
| Componentes React               | Inglês    | PascalCase             | `LeadCard.tsx`               |
| Constantes Globais              | Inglês    | UPPER_SNAKE_CASE       | `MAX_RETRY_ATTEMPTS`         |
| Arquivos                        | Inglês    | kebab-case             | `auth-repository.ts`         |
| Mensagens p/ Usuário            | Português | -                      | "E-mail inválido."           |

## 3. Constantes Globais

Evite "strings mágicas" e números fixos espalhados pelo código. Centralize valores reutilizados em arquivos de constantes dentro do `shared/` ou na raiz do módulo correspondente.

## 4. Padronização de Mensagens e Erros

- **Mensagens para o Cliente:** Simples, claras e em **português**. Nunca exponha detalhes técnicos (ex: erros de banco).
- **Mensagens para Desenvolvedores:** Detalhadas, em **inglês**, contendo contexto (Payload, IDs, Nome do UseCase) para logs e debugging.

## 5. Estrutura Backend (Adaptação NestJS + DDD)

Diferente do padrão anterior, seguimos a separação rigorosa de camadas do DDD:

1.  **Domain (Core):** Regras de negócio puras (Entities, Value Objects). Sem dependência de NestJS ou Mongoose.
2.  **Application (Use Cases):** Orquestração. Onde o TDD brilha. Depende apenas do Domain.
3.  **Infrastructure (Adapters):** Implementações reais (Mongoose, Controllers). Depende de frameworks.

**Regra de Ouro:** A dependência sempre aponta para dentro (Infrastructure -> Application -> Domain).

## 6. Frontend (Next.js + Tailwind + CVA)

- **Componentes Globais:** UI atômica (Botões, Inputs) em `src/shared/ui` usando **CVA** para variantes.
- **Componentes Específicos:** Em `src/modules/[feature]/presentation/components`.
- **Server vs Client:**
  - Use **Server Components** para fetch inicial de dados e SEO.
  - Use **Client Components** apenas quando houver interatividade (hooks, eventos, state).

## 7. Critérios de Qualidade (DoD)

Uma entrega é considerada completa quando:

1.  **TDD:** Possui testes unitários (e/ou integração) cobrindo a lógica principal.
2.  **Arquitetura:** Respeita as camadas definidas no `REWRITE_SPEC.md`.
3.  **Clean Code:** Passou por linting e segue as nomenclaturas deste documento.
4.  **Simplicidade:** Não criou acoplamento desnecessário entre módulos.
5.  **Documentação:** Se adicionou uma lib nova, explicou o "porquê" no README do módulo.
