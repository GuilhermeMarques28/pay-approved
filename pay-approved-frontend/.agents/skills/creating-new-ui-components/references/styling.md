# Styling UI Components With Uniwind

Reference based on the Uniwind documentation at https://docs.uniwind.dev/llms-full.txt. Uniwind is not installed in this project yet; use this as the target styling convention for universal UI components once the setup is added.

## Goal

Style universal UI components with Tailwind classes through Uniwind's `className` support. Prefer small, readable class groups, semantic theme tokens, and explicit variant mappings over ad hoc `StyleSheet` objects or hardcoded inline styles.

## Default Styling Pattern

Use `className` as the primary styling API:

```tsx
function ButtonRoot({ className, children, ...props }: ButtonRootProps) {
  return (
    <Pressable
      className={cn(
        'h-12 flex-row items-center justify-center rounded-lg px-4',
        'bg-primary active:opacity-80 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}
```

Use semantic tokens from the theming reference for colors:

```tsx
<View className="bg-surface border border-border rounded-lg p-4">
  <Text className="text-content-primary">Title</Text>
</View>
```

## Class Name Merging

Uniwind does not automatically dedupe conflicting classes. Once the project adds Uniwind, also add a `cn` utility backed by `clsx` and `tailwind-merge`.

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn` whenever a component accepts `className`, has variants, or combines conditional classes:

```tsx
className={cn(
  'rounded-lg border px-4 py-2',
  disabled && 'opacity-50',
  selected && 'border-primary bg-primary/10',
  className,
)}
```

Put consumer-provided `className` last so consumers can intentionally override safe visual details.

## Dynamic Classes

Always write complete Tailwind class names in source code. Uniwind parses classes at build time, so dynamically constructed class strings cannot be detected.

Do not build class names with interpolation:

```tsx
<Text className={`text-${color}`} />
```

Use complete class mappings:

```tsx
const textToneClass = {
  default: 'text-content-primary',
  muted: 'text-content-secondary',
  critical: 'text-feedback-critical-low-content',
} as const;

<Text className={cn('text-base', textToneClass[tone])} />;
```

## Variants

For small variant sets, use typed mapping objects with complete class names:

```tsx
const buttonVariantClass = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  ghost: 'bg-transparent text-content-primary',
} as const;

const buttonSizeClass = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4 text-base',
  lg: 'h-14 px-5 text-lg',
} as const;
```

For complex combinations with multiple variants and compound variants, prefer a dedicated variant helper such as `tailwind-variants` after it is added to the project. Do not invent large nested conditional expressions inside JSX.

## Prop-Driven State

Use Uniwind data selectors when styles depend on component props. They map `data-[prop=value]:...` classes to `data-*` props on the same component.

```tsx
<Pressable
  data-state={state}
  data-disabled={disabled}
  className={cn(
    'rounded-lg border px-4 py-2',
    'data-[state=selected]:border-primary data-[state=selected]:bg-primary/10',
    'data-[disabled=true]:opacity-50'
  )}
/>
```

Supported selector forms:

- `data-[state=open]:...`
- `data-[selected=true]:...`
- multiple different data selectors in the same `className`

Only equality checks are supported. Do not use presence-only selectors such as `data-[disabled]:...`.

## Interaction States

For pressable components, use Uniwind state selectors:

- `active:` for pressed state.
- `disabled:` when the `disabled` prop is true.
- `focus:` for keyboard/TV focus.

```tsx
<Pressable className="bg-primary rounded-lg px-4 py-3 active:opacity-80 focus:ring-2 focus:ring-primary disabled:opacity-50">
  <Text className="text-primary-foreground text-center">Continue</Text>
</Pressable>
```

Avoid web-only pseudo classes such as `hover:` and `visited:` for native components. Prefer `active:` and `focus:`.

## Platform-Specific Styling

Use platform selectors only when the platform genuinely needs different styling:

```tsx
<View className="pt-4 ios:pt-6 android:pt-5 web:pt-3" />
```

Available selectors include `ios:`, `android:`, `web:`, and `native:`. Keep platform-specific classes rare in universal UI components; prefer shared styling first.

## Safe Area And Native Differences

React Native is not browser CSS. Keep styles aligned with Yoga layout:

- Use flexbox-oriented utilities.
- Do not rely on CSS cascade or inheritance.
- Avoid unsupported web CSS such as floats, pseudo-elements, and general media query utilities.
- Use safe-area utilities only after the project configures Uniwind safe area support.

## Color Props And Accent Classes

Some React Native props expect raw color values rather than style objects. For Uniwind `*ClassName` props that map to color props, use `accent-*`.

```tsx
<ActivityIndicator colorClassName="accent-primary" />
<TouchableHighlight underlayColorClassName="accent-primary/80" />
```

Use regular classes for style props:

```tsx
<View className="bg-primary" />
```

## Custom CSS And Utilities

Prefer Tailwind utilities for simple styles. Use custom CSS classes or `@utility` in `global.css` only when a repeated pattern would be verbose or cannot be expressed clearly with utilities.

```css
@utility h-hairline {
  height: hairlineWidth();
}
```

CSS functions such as `hairlineWidth()`, `fontScale()`, `pixelRatio()`, and `light-dark()` must be defined as utilities in `global.css`; do not place them directly in `className`.

## Escape Hatches

Use these only when `className` is not enough:

- `style` for dynamic numeric values that cannot be expressed as classes.
- `useResolveClassNames` for libraries that require a React Native style object and cannot be wrapped.
- `withUniwind` for third-party components that should accept `className`.
- `useCSSVariable` for raw theme values required by charts, maps, animations, or native APIs.

## Styling Checklist

- [ ] Use `className` as the default styling API.
- [ ] Use semantic theme token classes for colors.
- [ ] Keep all class names complete and statically detectable.
- [ ] Use `cn` when merging base, variant, state, and consumer classes.
- [ ] Put `className` overrides last in `cn`.
- [ ] Use typed mapping objects for simple variants.
- [ ] Use data selectors for prop-driven styling.
- [ ] Use `active:`, `disabled:`, and `focus:` for interaction states.
- [ ] Keep platform selectors rare and intentional.
- [ ] Avoid unsupported web CSS patterns in native components.
