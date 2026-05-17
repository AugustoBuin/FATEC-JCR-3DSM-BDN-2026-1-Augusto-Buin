# Lead Management System (v2) — Agents Guide

## Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `feature-architect` | Complete feature implementation — tests (RED first), domain, use cases, infrastructure, controller | Building any new bounded context or feature end-to-end |
| `quality-auditor` | Codebase audit for DDD integrity, TDD compliance, code quality, and convention compliance | Before PRs, after implementing a module, weekly health checks |

## Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `test-driven-development` | Enforces TDD methodology — RED → GREEN → REFACTOR with no shortcuts | Implementing any feature or bug fix |
| `systematic-debugging` | Four-phase root-cause debugging process | Investigating any bug, test failure, or unexpected behavior |
| `tailwind-design-system` | Tailwind v4 component patterns — CVA, tokens, dark mode, responsive grid | Building UI components |

## Workflows

### New Feature
```
1. feature-architect   — plan, write failing tests, types, hooks, components
2. quality-auditor     — triggered automatically on git push
```

### Bug Fix
```
1. systematic-debugging skill  — find root cause (Phase 1–3 before any fix)
2. test-driven-development skill — write the failing test for the bug
3. Implement the fix
```

### Before Push / PR
```
1. Pre-push hook triggers quality-auditor reminder automatically
2. Invoke quality-auditor agent — review CRITICAL and HIGH findings
3. Fix blockers, then push
```

## Configuration

- **Pre-push hook**: `.agents/hooks/pre-push-quality-gate.ps1` (wired in `.claude/settings.local.json`)
- **Agents use**: `claude-opus-4-7` for comprehensive reasoning
- **Temperature**: `feature-architect` → `0.3` (consistent planning), `quality-auditor` → `0.1` (strict auditing)

## Reference Documents

- `.agents/docs/code-review-guide.md` — PR review standards and checklist (used alongside `/review` skill)
- `DEV_STANDARDS.md` (project root) — naming, clean code conventions, DoD, message patterns
- `REWRITE_SPEC.md` (project root) — full architecture blueprint, database schema, layer structure
- `CLAUDE.md` (project root) — architecture rules, tech stack, development commands
