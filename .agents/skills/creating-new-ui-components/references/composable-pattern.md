# Composable Pattern For UI Components

Reference based on [Implementando Composition Pattern em aplicações React](https://vinniciusgomes.dev/articles/implementando-composition-pattern-em-aplicacoes-react), by Vinnicius Gomes, adapted for Trix universal components.

## Goal

Create UI components as a set of small, composable parts. The consuming screen should build the desired variation by composing subcomponents through `children`, instead of enabling many internal rendering branches with boolean props.

Use this pattern for universal components that need to support different combinations of content, icons, actions, prefixes, suffixes, labels, helper messages, or containers.

## Principles

- Prefer composition over inheritance and over monolithic components.
- Each subcomponent must have a clear responsibility.
- The root component owns layout, spacing, shared visual state, and context when needed.
- Optional parts should be optional because the consumer includes or omits them in JSX.
- Avoid `hasIcon`, `showAction`, `withFooter`, `leftElement`, `rightElement`, and similar props when a composable part expresses the variation better.
- Use props for data and behavior that belong to the specific part, not to control the entire internal tree.
- Keep explicit typing; do not use `any`.

## Recommended Structure

For a `Notification` component, keep all parts in the same file, following the same approach used by component libraries like shadcn:

```text
Notification/
  notification.tsx
  styles.ts
  models.ts
```

The main file should declare each part with named function declarations, then attach the parts to the root component as static properties with `Object.assign`, following the same approach used by `src/components/ui/card.tsx`:

```tsx
function NotificationRoot({ children }: NotificationRootProps) {
  return <Container>{children}</Container>;
}

function Content({ children }: ContentProps) {
  return <ContentText>{children}</ContentText>;
}

function Icon({ name }: IconProps) {
  return <IconView name={name} />;
}

function Actions({ children }: ActionsProps) {
  return <ActionsContainer>{children}</ActionsContainer>;
}

function ActionButton({ children, onPress }: ActionButtonProps) {
  return <Button onPress={onPress}>{children}</Button>;
}

export const Notification = Object.assign(NotificationRoot, {
  Content,
  Icon,
  Actions,
  ActionButton,
});
```

Use this naming and export pattern consistently:

- Declare components as `function ComponentName(...)`, not anonymous arrow functions.
- Prefix only the root function with the parent component name, such as `NotificationRoot`. Subcomponent functions stay unprefixed (`Content`, `Icon`, `Actions`) since they are accessed as static properties, such as `Notification.Content`.
- Attach subcomponents to the root with `Object.assign(RootComponent, { PartOne, PartTwo })` and export the resulting object as the single named export, such as `export const Notification = Object.assign(...)`.
- Avoid default exports and avoid exporting subcomponents individually — consumers should only import `Notification` and reach parts through dot access.

## Expected Usage

The consumer chooses the composition in JSX. The root renders directly as `<Notification>`, not `<Notification.Root>`:

```tsx
<Notification>
  <Notification.Icon name="bell" />
  <Notification.Content>Sua transferência foi agendada.</Notification.Content>
  <Notification.Actions>
    <Notification.ActionButton onPress={handleCancel}>Cancelar</Notification.ActionButton>
    <Notification.ActionButton onPress={handleConfirm}>Confirmar</Notification.ActionButton>
  </Notification.Actions>
</Notification>
```

Simple variations should remove parts instead of passing flags:

```tsx
<Notification>
  <Notification.Content>Sua transferência foi concluída.</Notification.Content>
</Notification>
```

## Antipattern To Avoid

Do not concentrate multiple combinations into a single component controlled by boolean props:

```tsx
<Notification
  hasIcon
  hasActions
  icon="bell"
  content="Sua transferência foi agendada."
  onCancel={handleCancel}
  onConfirm={handleConfirm}
/>
```

This model tends to grow with new flags, internal conditionals, and props that only make sense for some combinations.

Also avoid exporting subcomponents as separate named exports (`NotificationContent`, `NotificationIcon`, ...). That forces consumers to import each part individually and loses the discoverable `Notification.Content` dot-access grouping.

## Implementation Checklist

- [ ] Identify the real component parts before coding.
- [ ] Create a root function for the main structure, e.g. `NotificationRoot`.
- [ ] Create subcomponents for reusable or optional parts, named without the parent prefix.
- [ ] Keep all subcomponents in the component's main file.
- [ ] Name each part with `function ComponentName(...)`.
- [ ] Attach parts to the root with `Object.assign` and export the single resulting object, e.g. `export const Notification = Object.assign(NotificationRoot, { Content, Icon, ... })`.
- [ ] Keep styles and typed models next to the component.
- [ ] Use `children` for visual composition.
- [ ] Use specific props only when a part needs its own data or handlers.
- [ ] Ensure usage without optional parts remains simple and readable.

## When Not To Apply

Do not force the composable pattern into small components without meaningful variations. If the component always renders the same structure and only receives simple data, a single component with clear props is enough.
