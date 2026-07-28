---
name: creating-new-ui-components
description: Create universal mobile UI components for Trix from the Lynch design system. Use when Lynch marks a component as universal, when adding components under the mobile UI library, or when implementing reusable React Native UI primitives.
version: 1.0.0
license: MIT
---

# Creating New UI Components

This skill covers the creation of basic, reusable, universal UI components for the Trix mobile app.

Use it when implementing React Native UI primitives that should be shared across screens and follow the Lynch design system.

## References

Use these references when creating universal UI components:

- [Composable Pattern](./references/composable-pattern.md) -- use to design the component API, split the component into composable parts, name each part, and export all parts with shadcn-style named exports.
- [Theming](./references/theming.md) -- use to choose semantic Lynch/Tailwind color tokens, define light/dark theme behavior, and avoid hardcoded color values.
- [Styling](./references/styling.md) -- use to write `className` styles with Uniwind, handle variants, merge classes, style interaction states, and avoid unsupported React Native CSS patterns.

## When To Create A UI Component

Create a new UI component when Lynch explicitly signals, usually through Slack, that the component is universal.

Universal components are reusable building blocks that belong to the shared mobile UI layer instead of a specific screen or feature flow.

## File Structure

UI components must live under the mobile UI components directory:

```text
packages/mobile/src/Components/ui
  ComponentName/
    component-name.tsx
    styles.ts
    models.ts
```

Create the `ui` directory if it does not exist yet. Keep all composable pieces for the component in the main component file, following the shadcn-style pattern described in the reference. Keep styles and local type models next to the component.

## When Not To Create A UI Component

Do not create a universal UI component when Lynch signals that the component belongs to another category or is specific to a feature, screen, or product flow.

In that case, place the implementation inside the owning screen or feature module instead.

## Component Pattern

All new universal UI components must follow the composable component pattern.

Before implementing, read the composable pattern reference and identify the component parts:

- `Root` for the base structure.
- Optional subcomponents exposed through composition.
- Props only for data or handlers that belong to each specific part.
- No broad boolean props for toggling internal layout branches when JSX composition can express the variation.

## Styling And Tokens

When styling new universal components:

- Read the theming reference before choosing colors or semantic tokens.
- Read the styling reference before writing Uniwind `className` strings, variants, or state styles.
- Prefer semantic token classes and complete Tailwind class names.
- Keep temporary `StyleSheet` or inline styles out of universal components unless Uniwind cannot express the value.

## Implementation Checklist

- [ ] Confirm the component is universal according to Lynch.
- [ ] Place it under `packages/mobile/src/Components/ui`.
- [ ] Model the API with composable parts in one main component file.
- [ ] Declare parts as named functions and export them with a named export block.
- [ ] Keep TypeScript props explicit and avoid `any`.
- [ ] Reuse Lynch semantic tokens and Uniwind styling conventions.
- [ ] Keep business logic out of the UI component.
- [ ] Add or update usage examples when the component API is not obvious.
