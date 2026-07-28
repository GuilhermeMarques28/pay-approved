# Component Creation Workflow

Pipeline sequencial para criação de componentes UI. Garante que cada componente novo siga o padrão composable do projeto, seja documentado com JSDoc, e registrado no catálogo.

**Pré-requisitos:** Ler a skill `creating-new-ui-components` e suas referências (`composable-pattern.md`, `styling.md`, `theming.md`) antes de iniciar.

---

## Fase 1: Design Analysis

**Objetivo:** Entender o que será construído, analisar o design e definir o escopo.

**Ações:**

1. **Se houver link do Figma:**
   - Usar o MCP do Figma para buscar o frame/componente.
   - Identificar: variantes (sizes, states, intents), subcomponentes visuais, tokens usados (cores, espaçamentos, tipografia, border radius).
   - Mapear estados: default, hover/pressed, focused, disabled, error, loading.
   - Identificar se o componente no Figma tem variantes que devem virar composição (subcomponentes) vs variantes CVA (props de estilo).

2. **Se não houver Figma:**
   - Analisar a necessidade descrita pelo usuário.
   - Consultar componentes existentes em `src/components/ui/` para entender o padrão visual vigente.
   - Usar componentes similares como referência de tokens e espaçamentos.

3. **Definir o escopo do componente:**
   - **Universal** (`src/components/ui/`) → reutilizável por múltiplas features/screens.
   - **Feature** (`src/features/<f>/components/`) → específico de um domínio.
   - **Screen** (`src/screens/<S>/components/`) → sem domínio, exclusivo de uma tela.

**Regra de decisão:**

```
Será usado por múltiplas features/screens?
  → SIM → src/components/ui/ (universal)
Pertence a um domínio específico?
  → SIM → src/features/<f>/components/
É exclusivo de uma tela, sem domínio?
  → SIM → src/screens/<S>/components/
```

**Critério de saída:** Escopo definido (universal/feature/screen), variantes mapeadas, referência visual clara.

---

## Fase 2: Dependencies

**Objetivo:** Verificar bibliotecas necessárias e componentes existentes.

**Ações:**

1. **Verificar se já existe componente similar** no UI kit (`src/components/ui/`):
   - Se existe algo parecido → avaliar se é melhor estender ou criar novo.
   - Se o componente é uma composição de primitivos existentes → não duplicar.

2. **Verificar libs nativas necessárias:**
   - Consultar o MCP do Expo (`expo:building-native-ui`, `expo:expo-ui-swift-ui`, `expo:expo-ui-jetpack-compose`) para verificar se há componente nativo do Expo UI.
   - Consultar `expo:native-data-fetching` se o componente envolve data fetching.
   - Verificar se `react-native-reanimated` é necessário (animações de entrada/saída, springs).
   - Verificar se `@expo/ui` tem primitivo nativo adequado (ex: BottomSheet, Switch).

3. **Verificar libs de estilo:**
   - `class-variance-authority` (CVA) → para variantes com múltiplos eixos (variant, size, intent).
   - Mapas de objetos tipados → para variantes simples (1-2 eixos).
   - `cn` utility → para merge de classes.

4. **Instalar dependências faltantes** se necessário.

**Critério de saída:** Dependências definidas, nenhuma lib desnecessária adicionada.

---

## Fase 3: Build

**Objetivo:** Implementar o componente seguindo o padrão composable.

**Ações:**

1. **Decompor o componente em partes:**
   - Identificar Root, subcomponentes (Header, Content, Footer, Title, etc.).
   - Cada parte tem responsabilidade clara e props próprias.
   - Se o componente é simples sem variações significativas → componente único, sem forçar composição.

2. **Criar o arquivo principal** no local definido na Fase 1:
   - Universal: `src/components/ui/<component-name>.tsx`
   - Feature: `src/features/<f>/components/<component-name>.tsx`
   - Screen: `src/screens/<S>/components/<component-name>.tsx`

3. **Implementar seguindo os padrões:**

   **Estrutura do arquivo:**
   ```tsx
   // 1. Imports
   // 2. Constants (CVA variants, size maps, color maps)
   // 3. Types/Interfaces (com JSDoc em cada prop)
   // 4. Subcomponents (function declarations)
   // 5. Root component (function declaration)
   // 6. Export (Object.assign para composable, named export para simples)
   ```

   **API composable (quando aplicável):**
   ```tsx
   function ComponentRoot({ children, className, ...props }: ComponentProps) { ... }
   function Header({ className, ...props }: HeaderProps) { ... }
   function Title({ className, ...props }: TitleProps) { ... }
   function Content({ className, ...props }: ContentProps) { ... }

   export const Component = Object.assign(ComponentRoot, {
     Header,
     Title,
     Content,
   });
   ```

   **API simples (componente sem subpartes):**
   ```tsx
   export function Component({ variant, size, ...props }: ComponentProps) { ... }
   // ou
   export const Component = forwardRef<Ref, Props>((props, ref) => { ... });
   ```

4. **Regras de implementação:**
   - `className` como prop para override de estilos pelo consumer.
   - `cn()` para merge de classes (consumer `className` sempre por último).
   - Tokens semânticos do design system (nunca hex hardcoded).
   - `Pressable` ao invés de `TouchableOpacity` para novos componentes.
   - `accessibilityRole` e `accessibilityState` em componentes interativos.
   - Controlled + uncontrolled pattern quando fizer sentido (ver `Input`, `Checkbox`).
   - `forwardRef` quando o consumer pode precisar de ref (inputs, pressables).
   - `displayName` em componentes com forwardRef.

**Critério de saída:** Componente funcional, tipado, acessível.

---

## Fase 4: Document

**Objetivo:** Documentar o componente via JSDoc para facilitar IntelliSense.

**Ações:**

1. **JSDoc no export principal** — incluir:
   - Descrição do componente (1-2 frases).
   - Referência ao Figma quando existir (ex: "matching the Figma 'Component Name' component").
   - Exemplo de uso com composição completa.
   - Exemplo de uso simplificado (sem subcomponentes opcionais).

   ```tsx
   /**
    * Native bottom sheet built from `@expo/ui/community/bottom-sheet`.
    * Compose it with its static sections, matching the Figma "Bottom sheet" component:
    *
    * ```tsx
    * <BottomSheet ref={sheetRef} onDismiss={() => {}}>
    *   <BottomSheet.Header>
    *     <BottomSheet.Title>Título</BottomSheet.Title>
    *   </BottomSheet.Header>
    *   <BottomSheet.Content>{...}</BottomSheet.Content>
    *   <BottomSheet.Footer>
    *     <Button label="Confirmar" onPress={...} />
    *   </BottomSheet.Footer>
    * </BottomSheet>
    * ```
    */
   ```

2. **JSDoc em cada interface de props** — documentar props não óbvias:
   ```tsx
   export interface BottomSheetProps {
     /** Controls visibility declaratively. Omit to use ref.present()/dismiss(). */
     isPresented?: boolean;
     /** Heights the sheet can snap to (e.g. `["50%", "90%"]`). Omit to size to content. */
     snapPoints?: Array<string | number>;
     /** @default true */
     showDragIndicator?: boolean;
   }
   ```

3. **JSDoc em subcomponentes** — breve descrição de cada parte:
   ```tsx
   /** Top section of the sheet — wraps Hat + Title. */
   function Header({ ... }: HeaderProps) { ... }

   /** Free-form slot for the sheet's body content. No default padding. */
   function Content({ ... }: ContentProps) { ... }
   ```

4. **JSDoc em interfaces de ref** (quando imperativo):
   ```tsx
   export interface BottomSheetRef {
     /** Opens the sheet, playing the native present animation. */
     present: () => void;
     /** Closes the sheet, playing the native dismiss animation. */
     dismiss: () => void;
   }
   ```

**Regras de documentação:**
- Comentários em **inglês** (código e artefatos técnicos são em inglês por constituição).
- Não documentar o óbvio (`/** The children */` em uma prop `children`).
- `@default` para valores default não evidentes.
- Exemplos devem ser copiáveis e funcionais.

**Critério de saída:** IntelliSense mostra descrição, exemplo e tipos ao hover em qualquer parte do componente.

---

## Fase 5: Review

**Objetivo:** Validar qualidade, padrões e conformidade.

**Ações:**

1. **Checklist de código:**
   - [ ] Arquivo no local correto (ui/ para universal, features/ para domínio, screens/ para tela)
   - [ ] API composable quando há subpartes (Object.assign, sem boolean props para layout)
   - [ ] CVA para variantes com múltiplos eixos OU mapas tipados para variantes simples
   - [ ] `className` aceito e passado para `cn()` como último argumento
   - [ ] Tokens semânticos (sem hex hardcoded, sem `colors.*` direto)
   - [ ] `Pressable` ao invés de `TouchableOpacity`
   - [ ] `accessibilityRole` + `accessibilityState` em interativos
   - [ ] `forwardRef` + `displayName` quando necessário
   - [ ] Controlled + uncontrolled pattern quando fizer sentido
   - [ ] Props tipadas explicitamente, sem `any`
   - [ ] Sem lógica de negócio no componente

2. **Checklist de documentação:**
   - [ ] JSDoc no export principal com descrição + exemplo de uso
   - [ ] JSDoc em props não óbvias das interfaces
   - [ ] JSDoc em subcomponentes com descrição breve
   - [ ] `@default` em props com valores default
   - [ ] Exemplos são copiáveis e funcionais

3. **Validações técnicas:**
   - `npx tsc --noEmit` — zero errors
   - `npx oxlint . --fix` — sem warnings nos arquivos criados

**Critério de saída:** Componente pronto para uso, documentado, tipado, acessível.

---

## Fase 6: Register

**Objetivo:** Registrar o componente no catálogo para referência futura.

**Ações:**

1. **Atualizar `docs/ui-components.md`** — adicionar entrada do componente:

   ```markdown
   ### ComponentName

   **Local:** `src/components/ui/component-name.tsx`
   **Tipo:** Universal
   **Figma:** [link ou "sem referência"]

   **API:**
   - `<Component>` — Root
   - `<Component.Header>` — Cabeçalho
   - `<Component.Content>` — Conteúdo

   **Variantes:** `variant` (primary, secondary), `size` (sm, md, lg)

   **Exemplo:**
   ```tsx
   <Component variant="primary" size="md">
     <Component.Header>Título</Component.Header>
     <Component.Content>Conteúdo</Component.Content>
   </Component>
   ```
   ```

2. **Criar o catálogo** (`docs/ui-components.md`) caso não exista ainda.

**Critério de saída:** Componente registrado, descobrível por outros devs e agentes.

**Commit:** `feat(ui): add <component-name> component`

---

## Resumo do Fluxo

```
Design Analysis → Dependencies → Build → Document → Review → Register
                                  feat()                        feat()
```

## Notas

- Para componentes simples (ex: Divider, Badge), combinar fases 3-4-5 numa única etapa.
- Se o componente é de feature ou screen, pular a Fase 6 (Register) — catálogo é apenas para universais.
- Sempre usar componentes existentes como referência de estilo (ver `button.tsx`, `bottom-sheet.tsx`, `checkbox.tsx`).
- Consultar o MCP do Expo antes de implementar componentes que podem ter versão nativa (Switch, Slider, BottomSheet, DatePicker, etc.).
