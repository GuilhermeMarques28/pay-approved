---
name: bulletproof-react
description: Apply Bulletproof React architecture principles to React projects. Use when scaffolding features, reviewing project structure, enforcing coding standards, deciding file organization, configuring workflow tools, or making architectural decisions for Vite, React Router, TanStack Query, TypeScript, Biome, and feature-based React applications.
---

# Bulletproof React

Use this skill to apply an opinionated architectural blueprint for production React applications, especially projects built with Vite, React Router, TanStack Query, TypeScript, and Biome.

This skill focuses on project structure, code organization, and baseline project standards. For deeper domain-specific guidance, load the relevant specialist skill listed below.

## When to Use This Skill

Use these guidelines when you need to:

- Scaffold a new React project or feature
- Review or audit project structure
- Decide where new files should live
- Set up or review project standards such as Biome, TypeScript, package manager, and import aliases
- Make architectural decisions about code organization
- Onboard to an existing React codebase
- Refactor toward a feature-based architecture

## Core Principles

Follow these principles unless the existing project has stronger conventions:

1. Organize application code by feature package, not by technical layer only.
2. Keep shared code independent from feature-specific code.
3. Enforce one-way import direction: `shared` → `features` → `app`.
4. Prevent direct cross-feature imports.
5. Colocate related files inside the feature that owns them.
6. Export feature public APIs through a single `index.ts`.
7. Use strict TypeScript and explicit boundaries.
8. Prefer absolute imports using the project alias, usually `@/`.
9. Keep file names in `kebab-case`.
10. Use Biome for formatting, linting, and import organization when available.

## Specialist Skills

This is an umbrella skill for structure and standards. For deeper guidance, load the relevant specialist skill when applicable:

| Domain | Skill | Use when |
|---|---|---|
| Component patterns | `composition-patterns` | Designing reusable components, slots, compound components, or composition APIs |
| React/Next.js performance | `react-best-practices` | Reviewing rendering behavior, hooks, memoization, hydration, or performance risks |
| Tailwind CSS styling | `tailwind-best-practices` | Styling with Tailwind CSS, class organization, variants, and design tokens |
| API layer and data fetching | `api-layer` | Creating API clients, query hooks, mutations, caching, and request boundaries |
| State management | `state-management` | Choosing local, server, URL, or global state patterns |
| Testing strategy | `testing-strategy` | Planning unit, integration, component, or e2e tests |
| Error handling | `error-handling` | Designing user-facing errors, boundaries, logging, and recoverability |
| Security | `security` | Reviewing auth, authorization, user input, secrets, and frontend security risks |

Only load a specialist skill when the current task needs that deeper guidance.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Project Structure | Critical | `structure-` |
| 2 | Project Standards | High | `standards-` |

## Project Structure Rules

Apply these rules when creating or reviewing files.

### `structure-feature-packages`

Organize code as self-contained feature packages.

Prefer:

```txt
src/
  app/
  features/
    auth/
    dashboard/
    invoices/
  shared/
```

Avoid global technical folders that mix unrelated domain logic:

```txt
src/
  components/
  hooks/
  services/
  utils/
```

Technical folders are acceptable inside a feature when they serve that feature.

### `structure-unidirectional-flow`

Respect this dependency direction:

```txt
shared → features → app
```

Rules:

- `shared` must not import from `features` or `app`.
- `features` may import from `shared`.
- `app` may import from `features` and `shared`.
- Feature internals should not depend on application shell details.

### `structure-no-cross-feature-imports`

Features must not import directly from each other.

Avoid:

```ts
import { useUser } from '@/features/auth/hooks/use-user';
```

Prefer one of these:

```ts
import { useUser } from '@/features/auth';
```

Or move truly shared logic to:

```txt
src/shared/
```

### `structure-layer-hierarchy`

Inside a feature, organize code by responsibility when the feature is large enough:

```txt
features/
  billing/
    api/
    components/
    hooks/
    routes/
    schemas/
    types/
    utils/
    index.ts
```

Do not create empty folders preemptively. Add structure as the feature grows.

### `structure-colocation`

Colocate related files with the feature or component that owns them.

Prefer:

```txt
features/
  invoices/
    components/
      invoice-card.tsx
      invoice-card.test.tsx
      invoice-card.types.ts
```

Avoid placing tests, types, and helpers far away from their owner without a strong reason.

### `structure-naming-conventions`

Use:

- `kebab-case` for files and folders
- `PascalCase` for React components
- `camelCase` for functions and variables
- `UPPER_SNAKE_CASE` for constants
- `index.ts` only for public exports or intentional module boundaries

Examples:

```txt
user-profile-card.tsx
create-invoice-form.tsx
use-current-user.ts
```

### `structure-index-exports`

Each feature should expose a public API through `index.ts`.

Prefer:

```ts
import { LoginForm, useCurrentUser } from '@/features/auth';
```

Avoid deep imports into feature internals:

```ts
import { LoginForm } from '@/features/auth/components/login-form';
```

Keep `index.ts` intentional. Do not export every internal file automatically.

## Project Standards Rules

Apply these standards when configuring or reviewing the project.

### `standards-biome-config`

Prefer Biome for:

- Formatting
- Linting
- Import sorting
- File naming conventions

Use project-local configuration if it already exists. Do not introduce conflicting tools unless required.

### `standards-typescript-strict`

Use strict TypeScript.

Prefer:

- Explicit domain types
- Runtime validation at external boundaries
- Narrow types over broad `any`
- Type declarations close to the feature that owns them

Avoid:

```ts
const data: any = response;
```

### `standards-absolute-imports`

Prefer absolute imports through the project alias, usually `@/`.

Prefer:

```ts
import { Button } from '@/shared/ui/button';
```

Avoid deep relative imports:

```ts
import { Button } from '../../../../shared/ui/button';
```

### `standards-kebab-case-files`

Use `kebab-case` filenames consistently.

Prefer:

```txt
user-settings-form.tsx
```

Avoid:

```txt
UserSettingsForm.tsx
userSettingsForm.tsx
user_settings_form.tsx
```

### `standards-pnpm-exact`

Prefer deterministic dependency management.

If the project uses `pnpm`, prefer exact versions and keep lockfiles committed.

Do not switch package managers without explicit user approval.

### `standards-husky-hooks`

When the project uses Git hooks, pre-commit checks should generally include:

- Formatting/linting
- Type checking
- Relevant tests when fast enough

Avoid adding slow hooks that make normal development painful.

## How to Use Rule Files

If this skill directory contains detailed rule files, read them when the task needs more depth:

```txt
rules/structure-feature-packages.md
rules/standards-biome-config.md
```

Each rule file should provide:

- Why the rule matters
- Incorrect example
- Correct example
- Additional context and tradeoffs

## Working in Existing Codebases

When modifying an existing project:

1. Inspect the current structure before changing files.
2. Prefer existing conventions when they are consistent.
3. Apply these rules incrementally instead of large rewrites.
4. Avoid renaming or moving files unless the user asked for refactoring.
5. Do not introduce new dependencies or tooling without a clear reason.
6. Explain architectural changes and migration impact clearly.

## Output Expectations

When using this skill in a coding task:

- State which architectural rule influenced the change.
- Reference changed files by project-relative path.
- Keep changes minimal and focused.
- Mention any follow-up refactor that would improve consistency but was outside the requested scope.
