# Screen Refactoring Workflow

Pipeline sequencial para refatoração de telas legadas. Foco em migrar para a arquitetura atual (Bulletproof React, UI kit composable, NativeWind) sem alterar comportamento funcional.

**Pré-requisitos:** Ler `docs/constitution.md`, e as skills `bulletproof-react`, `vercel-composition-patterns`, `creating-new-ui-components` e `form-accessibility` antes de iniciar.

---

## Fase 1: Audit

**Objetivo:** Mapear o estado atual da tela/grupo de telas e identificar tudo que precisa mudar.

**Ações:**

1. Ler todos os arquivos da tela (view, styles, view.models, models, index).
2. Identificar o **domínio** da tela — a qual feature(s) ela pertence.
3. Inventariar **componentes legados** importados de `src/components/`:
   - Quais são exclusivos desta tela? → candidatos a remoção após migração.
   - Quais são compartilhados com outras telas? → manter, migrar depois.
4. Inventariar **bibliotecas e ícones defasados** usados na tela:
   - Libs: `react-native-animate-loading-button`, `FloatingLabelInput`, `AdvancedTextArea`, `AdvancedButton`, `CodePin`, `react-native-modal` (→ BottomSheet nativo).
   - Ícones: `react-native-vector-icons/*` (FontAwesome5, Feather, Ionicons, MaterialCommunityIcons) → `Icon` do UI kit (RemixIcon).
5. Verificar se a tela segue o padrão **screen como orquestradora**:
   - Tem lógica de negócio que deveria estar na feature?
   - Tem componentes de domínio que deveriam estar em `src/features/<f>/components/`?
6. Verificar se o view model usa **React Query corretamente** (`isPending`, sem Redux para server state).
7. Listar **StyleSheet.create** e inline styles que devem virar NativeWind.
8. Auditar **acessibilidade e UX de formulário** (consultar skill `form-accessibility`):
   - Campos com `keyboardType` incorreto ou ausente.
   - Campos sem `textContentType` / `autoComplete`.
   - Falta de focus chain (`onSubmitEditing` / `returnKeyType`).
   - Elementos interativos sem `accessibilityRole` / `accessibilityLabel`.

**Entregável:** Relatório de audit com:
- Componentes legados → substituto no UI kit (ou "criar novo")
- Bibliotecas/ícones defasados → substituto moderno
- Violações de arquitetura → ação corretiva
- Componentes exclusivos da tela em `src/components/` → candidatos a remoção
- Violações de acessibilidade → ação corretiva por campo

**Critério de saída:** Mapeamento completo, zero pontos cegos.

---

## Fase 2: Dependencies

**Objetivo:** Resolver dependências: criar componentes UI faltantes, confirmar substitutos de libs.

**Ações:**

1. Para cada componente legado sem substituto no UI kit atual (`src/components/ui/`):
   - Avaliar se é um componente genérico reutilizável → criar em `src/components/ui/` usando a skill `creating-new-ui-components` (CVA + NativeWind + composable API).
   - Avaliar se é componente de domínio → criar em `src/features/<f>/components/`.
   - Avaliar se é tão simples que pode ser inline → não criar componente.
2. Para cada biblioteca/ícone defasado:
   - Consultar o MCP do Expo para alternativas nativas/recomendadas.
   - Para ícones `react-native-vector-icons/*`, mapear para nomes equivalentes do RemixIcon (`Icon` do UI kit).
   - Se não houver substituto direto, avaliar se o comportamento pode ser reproduzido com componentes existentes.
3. Verificar se os componentes UI existentes atendem às necessidades:
   - `Input` — campos de texto (suporta `leftIcon`, `rightIcon`, `error`, `hint`).
   - `OtpInput` — códigos SMS/PIN (configurable count, type, secureTextEntry).
   - `Button` — ações (primary, secondary, tertiary + loading/disabled).
   - `Form` — formulários composable (Form.Field, Form.Item, Form.Input, Form.Message).
   - `BottomSheet` — modais bottom-mounted (composable: Header, Title, Content, Footer).
   - `RadioGroup` / `RadioButton` — seleção única.
   - `Checkbox` — seleção múltipla / aceite de termos.
   - `Card` — containers composable (Header, Title, Description, Content, Footer).
   - `Icon` — ícones via RemixIcon (type-safe).
   - `Badge` — labels com variantes.
   - `Progress` — barras de progresso.

**Critério de saída:** Todos os substitutos definidos, componentes novos criados se necessário.

**Commit (se criou componentes):** `feat(ui): add <component> for <context>`

---

## Fase 3: Structure

**Objetivo:** Reorganizar arquivos e pastas para conformidade com a constituição.

**Ações:**

1. Mover **componentes de domínio** de `src/components/` ou `src/screens/<Screen>/` para `src/features/<f>/components/`.
2. Mover **lógica de negócio** (hooks, API calls, tipos) de screens para features:
   - `view.models.ts` com lógica de domínio → extrair hooks para `src/features/<f>/hooks/`.
   - Chamadas API inline → extrair para `src/features/<f>/api/`.
   - Tipos de domínio → mover para `src/features/<f>/types/`.
3. Verificar se o `view.models.ts` restante é apenas orquestração de UI (form state, navigation, refs) — isso pode ficar na screen.
4. Deletar barrel files (`index.ts`) desnecessários ou que só re-exportam default.
5. Renomear arquivos para **kebab-case** quando não estiverem.

**Critério de saída:** Estrutura de pastas alinhada com a constituição. Screen é orquestradora.

**Commit:** `refactor(<scope>): reorganize to feature-first architecture`

---

## Fase 4: Migrate

**Objetivo:** Aplicar as mudanças de código — substituir componentes, libs, estilos.

**Ações:**

1. **Substituir componentes legados** pelos do UI kit:
   - `FloatingLabelInput` (plain text) → `Form.Input`.
   - `FloatingLabelInput` (com mask) → `Form.Input mask="cpf|cnpj|money|zip-code|only-numbers|phone"`.
   - `TextInputMask` (react-native-masked-text) → `Form.Input mask="..."`. Remover import da lib antiga.
   - `AnimateLoadingButton` / `RoundWideButton` / `AdvancedButton` → `Button` (com `loading`, `disabled`, `variant`, `size`).
   - `CodePin` / `CodeComponent` → `OtpInput` (ou `Form.Input type="otp"`).
   - `AlertModal` / `react-native-modal` / `NewAlertModalComponent` / `Modal` (react-native) → `BottomSheet` composable (quando exclusivo da tela).
     - Respeitar o comportamento de dismiss: se o modal legado **não permite fechar tocando fora** (ex: confirmação crítica, pin, alerta obrigatório), usar `preventDismiss={true}` no BottomSheet.
     - Se o modal legado **permite fechar tocando fora** (ex: informativo, opções), manter `preventDismiss={false}` (default).
     - Verificar prop `onBackdropPress`, `backdropPressToClose`, `closeOnBackdropPress` ou lógica de `onRequestClose` no modal legado para determinar o comportamento correto.
     - Sempre usar ref imperativa (`useRef<BottomSheetRef>`) e chamar `present()`/`dismiss()` nos handlers — **nunca** controlar via `useState` + `isPresented` + `useEffect` para sincronizar.
   - `AdvancedTextArea` + mask → `TextInputMask` com classes NativeWind.
   - Radio buttons manuais → `RadioGroup` + `RadioButton`.
   - Custom checkbox → `Checkbox` (ou `Form.Input type="checkbox"`).
   - Headers legados exclusivos (ex: `CardDetailsHeader`) → inline com NativeWind + `Pressable` + `BackArrow`.
   - Seções de conteúdo → envolver em `Card` composable quando fizer sentido visual.

2. **Substituir ícones legados** pelos do UI kit:
   - `react-native-vector-icons/FontAwesome5` → `Icon` (RemixIcon). Mapear nomes (ex: `receipt` → `file-text-line`).
   - `react-native-vector-icons/Feather` → `Icon` (ex: `eye` → `eye-line`, `check` → `check-line`).
   - `react-native-vector-icons/Ionicons` → `Icon` (ex: `warning-outline` → `error-warning-line`).
   - `react-native-vector-icons/MaterialCommunityIcons` → `Icon` (ex: `lightbulb-outline` → `lightbulb-line`).
   - SVGs de ação (ex: `CloseIcon` / `close_cicle.svg`) → `Icon` (ex: `close-circle-line`).

3. **Migrar formulários para o componente `Form` composable** (`src/components/ui/form.tsx`):
   - Usar `const form = useForm(...)` e envolver com `<Form {...form}>`.
   - Substituir `Controller` por `Form.Field` — provê contexto para filhos.
   - Campos simples (text, password): usar `Form.Input` (auto-bind de value/onChange/error).
   - Campos com OTP: usar `Form.Input type="otp"`.
   - Campos com checkbox: usar `Form.Input type="checkbox"`.
   - Campos com mask: usar `Form.Input` com prop `mask` (`cpf`, `cnpj`, `money`, `zip-code`, `only-numbers`, `phone`). Substitui `FloatingLabelInput` com mask e `TextInputMask` da lib antiga. Para transforms customizados no `onChangeText` (ex: money → número), usar `Form.Field` com render explícito + `Input mask="..."` + `Form.Message`.
   - Sempre usar `Form.Message` no lugar de `{error?.message && <Text>...}` manual.
   - Usar `Form.Item` como container de cada campo (provê a11y id).

4. **Substituir StyleSheet.create** por classes NativeWind/Tailwind:
   - **Cores:** usar tokens semânticos (`text-content-primary`, `bg-bg-primary`, `border-border-secondary`). Nunca hardcodar cores.
   - **Espaçamento:** **sempre priorizar `gap`** no container pai (`gap-2`, `gap-3`, `gap-4`) em vez de `mt-X` / `mb-X` em cada filho. Usar `mt-X` / `mb-X` somente quando o espaçamento entre dois elementos específicos precisa ser diferente do gap padrão do container. Na dúvida, usar `gap` — é mais limpo, mais fácil de manter, e evita margin collapse.
   - **Tipografia:** usar tokens semânticos (`text-heading-xs`, `text-heading-sm`, `text-heading-lg`, `text-body-sm`, `text-body-md`, `text-label-sm`, `text-label-md`). Evitar `text-sm`, `text-base`, `text-lg` genéricos.
   - **Safe areas:** usar `pt-safe`, `pb-safe` ou `ScreenLayout` com edges configurados. Nunca usar `useSafeAreaInsets()` + `style={{ paddingTop: insets.top }}` manualmente quando NativeWind resolve.
   - **Conditional classes:** usar `cn()` de `@/utils/cn` para composição condicional.
   - Deletar arquivo `styles.ts` após migração completa.

5. **Envolver a tela com `ScreenLayout`** (`src/components/layouts/screen-layout.tsx`):
   - **Toda tela DEVE usar `ScreenLayout`** como wrapper raiz — provê SafeAreaView + `bg-bg-primary`.
   - Configurar `edges` conforme o layout:
     - `edges={['top', 'bottom']}` (padrão) — tela sem header custom ou header do navigator.
     - `edges={['bottom']}` — quando a tela tem header custom que já cuida do `pt-safe` (ex: `WalletHeader`, header inline).
     - `edges={['top']}` — quando o footer já cuida do bottom safe area.
   - **Nunca** usar `<View className="flex-1">` como root da tela — sempre `ScreenLayout`.
   - **Nunca** usar `useSafeAreaInsets()` + `style={{ paddingTop: insets.top }}` manualmente — usar `ScreenLayout` com edges ou `pt-safe`/`pb-safe` do NativeWind.
   - Se a tela tem header inline (back + título + imagem), o header deve ter `pt-safe` e o `ScreenLayout` deve usar `edges={['bottom']}`.
   - Remover `pb-safe` redundante quando `ScreenLayout` já inclui `'bottom'` nos edges.

6. **Substituir `TouchableOpacity`/`TouchableWithoutFeedback`** por `Pressable` quando possível.

7. **Atualizar view.models:**
   - Remover refs de componentes legados (ex: `AnimateLoadingButton`).
   - Remover imports de libs removidas.
   - Usar `isPending` para loading states (nunca `isLoading`).

8. **Atualizar models/types:**
   - Remover tipos que referenciam componentes legados.

9. **Deletar componentes exclusivos** da tela em `src/components/` que foram substituídos.

**Regras:**
- NÃO alterar lógica de negócio — apenas trocar a camada visual/componentes.
- Manter modais/componentes legados que são compartilhados com outras telas.
- Usar composição (compound components) para BottomSheets e Cards.

**Critério de saída:** Tela funcional, sem imports de componentes/libs legados exclusivos, sem StyleSheet.

**Commit:** `refactor(<scope>): migrate to composable UI kit and NativeWind`

---

## Fase 5: Polish

**Objetivo:** Melhorias de código, limpeza e otimizações.

**Ações:**

1. **Remover imports não utilizados** em todos os arquivos alterados.
2. **Eliminar `useEffect` desnecessários** (consultar skill `no-use-effect`):
   - **Sync estado → ref imperativa** (ex: `useEffect(() => { if (visible) ref.present() }, [visible])`) → chamar a ref direto no handler que muda o estado (ex: `showSheet()` que faz `ref.current?.present()`). Eliminar o estado booleano intermediário.
   - **Derivar estado de props/estado existente** em vez de sincronizar com `useEffect` (ex: `const isTutorialActive = tutorialAssistant.type === X && tutorialAssistant.step === Y` em vez de `useEffect → setState`).
   - **Inicialização de dados do servidor** (ex: selecionar último mês quando dados chegam) → mover para o view model e usar guard `!selectedPosition` para executar uma vez.
   - **Refresh ao montar** (ex: `useEffect(() => { refresh() }, [])`) → avaliar se React Query com `enabled` já resolve. Remover se redundante.
   - **useEffect de navegação/params** (ex: `useEffect(() => { ... }, [params])`) → avaliar se React Query `enabled` + key já refetch automaticamente.
3. **Eliminar estados desnecessários no view model:**
   - Estados booleanos que existiam apenas para controlar modais/BottomSheets via `useEffect` → remover, controlar via ref imperativa direto.
   - Estados que duplicam dados deriváveis de outros estados ou props → substituir por `useMemo` ou valor computado inline.
   - Setters exportados que não são mais usados na view → remover do return e da interface.
4. **Simplificar lógica** onde a migração criou oportunidades:
   - View models com estado desnecessário (ex: `passwordMasked` quando `Input` já gerencia).
   - Timers manuais que podem virar hooks reutilizáveis.
   - Funções com lógica duplicada ou que podem ser simplificadas (ex: `getColorCard` com múltiplos `if` → `palette[index % len]`).
5. **Extrair patterns repetidos:**
   - Se múltiplas telas usam timer de resend → criar `useCountdown` hook em shared.
   - Se múltiplas telas usam CPF mask + Input → avaliar criar `MaskedInput` no UI kit.
6. **Aplicar acessibilidade e UX de formulário** (consultar skill `form-accessibility`):
   - Definir `keyboardType` correto para cada campo (number-pad para CPF/CEP/telefone, email-address para e-mail, etc.).
   - Definir `textContentType` (iOS) e `autoComplete` (Android) para cada campo — ativa autofill nativo.
   - Configurar `autoCapitalize` correto: `"none"` para email/senha/CPF, `"words"` para nomes, `"characters"` para códigos.
   - `autoCorrect` e `autoComplete` são desabilitados por padrão no componente `Input` — não é necessário passar explicitamente. Sobrescrever com `autoCorrect={true}` somente em campos de texto livre (ex: observações).
   - Implementar **focus chain** com `onSubmitEditing` + `returnKeyType="next"` em todos os campos intermediários.
   - Último campo: `returnKeyType="done"` + `onSubmitEditing` chamando submit ou `Keyboard.dismiss`.
   - Usar `blurOnSubmit={false}` em campos intermediários para evitar keyboard flicker.
   - Adicionar `accessibilityRole="button"` em todos os `Pressable` / `TouchableOpacity` interativos.
   - Adicionar `accessibilityLabel` em ícones de ação (clear, toggle senha, voltar).
   - Marcar elementos decorativos com `accessible={false}`.
   - Envolver formulários com `KeyboardAvoidingView` (behavior por plataforma) + `ScrollView` com `keyboardShouldPersistTaps="handled"`.
7. **Remover código morto:**
   - Constantes, funções, estilos não referenciados.
   - Imports comentados ou eslint-disable sem motivo.
   - Dead code de componentes legados (states, refs que só existiam por causa de componentes removidos).

**Critério de saída:** Código limpo, sem warnings de lint nos arquivos alterados.

**Commit:** `chore(<scope>): polish and cleanup`

---

## Fase 6: Review

**Objetivo:** Validar conformidade total com a constituição e garantir zero regressão.

**Ações:**

1. **Constitution Check:**
   - [ ] Organização feature-first respeitada
   - [ ] Screens são orquestradoras — sem lógica de negócio, sem api/hooks/types próprios
   - [ ] Fluxo `shared → features → app` respeitado
   - [ ] Sem importação cruzada entre features
   - [ ] TypeScript strict, sem `any` injustificado
   - [ ] Componentes de domínio dentro da feature correspondente
   - [ ] Componentes em `src/screens/` SOMENTE quando sem domínio específico (ex: UI local como `WalletHeader`)
   - [ ] Componentes compartilhados são transversais
   - [ ] Loading states usam `isPending` do React Query
   - [ ] Composition patterns aplicados (sem boolean prop proliferation, compound components)

2. **Styling Check:**
   - [ ] NativeWind/Tailwind com tokens semânticos (sem cores hardcoded)
   - [ ] Espaçamento via `gap` entre irmãos (sem `margin` redundante entre siblings)
   - [ ] Tipografia com tokens semânticos (`text-heading-*`, `text-body-*`, `text-label-*`)
   - [ ] Classes condicionais via `cn()` (sem ternários em `style={{}}`)
   - [ ] Nenhum `StyleSheet.create` restante nos arquivos da tela
   - [ ] `ScreenLayout` como wrapper raiz da tela (nunca `<View className="flex-1">` como root)
   - [ ] `ScreenLayout edges` corretos: `['top', 'bottom']` padrão, `['bottom']` se header custom com `pt-safe`
   - [ ] Sem `useSafeAreaInsets()` manual — usar `ScreenLayout` edges ou `pt-safe`/`pb-safe`
   - [ ] Sem `pb-safe`/`pt-safe` redundante quando `ScreenLayout` já inclui o edge correspondente

3. **Components Check:**
   - [ ] Nenhum componente legado exclusivo restante em `src/components/`
   - [ ] Ícones via `Icon` do UI kit (sem `react-native-vector-icons/*`)
   - [ ] Botões via `Button` do UI kit (sem `RoundWideButton`, `AdvancedButton`, etc.)
   - [ ] Seções de conteúdo em `Card` composable quando aplicável
   - [ ] Headers inline com NativeWind (sem componentes legados exclusivos)

4. **Form Check** (quando a tela tem formulário):
   - [ ] Formulários usam `Form` composable (`Form.Field` + `Form.Item` + `Form.Input` + `Form.Message`) — sem `Controller` manual
   - [ ] Sem `{error?.message && <Text>...}` manual — usar `Form.Message` via contexto
   - [ ] Acessibilidade de formulário (skill `form-accessibility`):
     - [ ] `keyboardType` correto para cada campo
     - [ ] `textContentType` / `autoComplete` definidos
     - [ ] Focus chain via `onSubmitEditing` + `returnKeyType="next"` em campos intermediários
     - [ ] Último campo com `returnKeyType="done"` + submit/dismiss
     - [ ] `autoCapitalize` e `autoCorrect` corretos por tipo de campo
     - [ ] `blurOnSubmit={false}` em campos intermediários
   - [ ] `KeyboardAvoidingView` com behavior correto por plataforma
   - [ ] `ScrollView` com `keyboardShouldPersistTaps="handled"`

5. **Code Quality Check:**
   - [ ] Zero `useEffect` para sincronizar estado booleano → ref imperativa (BottomSheet, Modal)
   - [ ] Zero `useEffect` para derivar estado que pode ser computado inline ou com `useMemo`
   - [ ] Zero `useEffect(() => { refresh() }, [])` redundante quando React Query `enabled` já resolve
   - [ ] Zero estados booleanos intermediários que existiam só para controlar refs via `useEffect`
   - [ ] Listas/arrays derivados são `useMemo` (não recalculados a cada render)
   - [ ] View model não exporta setters/estados que a view não usa
   - [ ] Sem funções com lógica desnecessariamente complexa (ex: múltiplos if/else quando `%` resolve)
   - [ ] Sem código morto: constantes, funções, imports comentados, eslint-disable sem motivo

6. **Accessibility Check:**
   - [ ] `accessibilityRole="button"` em todos os interativos
   - [ ] `accessibilityLabel` em ícones de ação (clear, toggle, voltar)
   - [ ] Elementos decorativos com `accessible={false}`
   - [ ] Botão de submit com `disabled` + `loading` durante submissão

7. **Validações técnicas:**
   - `npx tsc --noEmit` — zero errors
   - `npx oxlint . --fix` — sem novos warnings nos arquivos alterados
   - Verificar que nenhum import quebrado existe no projeto (componentes deletados ainda importados em outro lugar)

8. **Verificação de completude:**
   - Todos os arquivos `styles.ts` da tela foram deletados (ou justificativa se mantidos)
   - Todos os componentes exclusivos em `src/components/` foram removidos
   - View models não referenciam libs/componentes legados
   - Models/types não têm tipos de componentes legados

9. **Smoke test mental:**
   - Ler a tela refatorada como um todo — ela deve ser legível como composição visual
   - Verificar que o comportamento funcional foi preservado (mesmos handlers, mesma navegação, mesmos modais)

**Critério de saída:** Todas as validações passam, tela pronta para review humano.

**Commit:** `chore(<scope>): review conformance and cleanup`

---

## Resumo do Fluxo

```
Audit → Dependencies → Structure → Migrate → Polish → Review
                feat()    refactor()  refactor()  chore()   chore()
```

Cada fase usa a skill `commit-work` para realizar o commit. Commits seguem Conventional Commits.

## Notas

- Se a tela for simples (sem componentes exclusivos, sem reorganização), combinar fases 2+3 com fase 4.
- Fases 2 e 3 podem ser puladas se a tela já estiver na estrutura correta e sem componentes novos necessários.
- Para refatorações em batch (ex: todas as telas de auth), agrupar telas na mesma execução mas manter commits por grupo lógico.
- Sempre priorizar **preservar comportamento** — refatoração não é feature.
- Consultar o MCP do Expo (`expo:building-native-ui`, `expo:native-data-fetching`) para validar que componentes nativos estão sendo usados corretamente.
- Componentes legados **compartilhados** com outras telas devem ser mantidos até que todas as telas que os usam sejam refatoradas. Registrar como débito técnico.

## Mapa de Substituição de Componentes Legados

| Legado | Substituto UI Kit | Notas |
|--------|-------------------|-------|
| `FloatingLabelInput` (plain text) | `Form.Input` | Sem floating label, usar placeholder |
| `FloatingLabelInput` (com mask) | `Form.Input mask="cpf\|cnpj\|money\|zip-code\|only-numbers\|phone"` | Mesma mask via prop |
| `TextInputMask` (react-native-masked-text) | `Form.Input mask="..."` | Remover import da lib antiga |
| `AnimateLoadingButton` | `Button` | Prop `loading` nativa |
| `RoundWideButton` | `Button` | Variant primary, size xl |
| `RoundSmallButton` | `Button` | Variant secondary, size sm |
| `AdvancedButton` | `Button` | CVA variants cobrem todos os casos |
| `AdvancedTextArea` + mask | `Form.Input mask="..."` | Mesma mask via prop |
| `CodePin` / `CodeComponent` | `OtpInput` ou `Form.Input type="otp"` | Props: count, type, secureTextEntry |
| `AlertModal` / `react-native-modal` | `BottomSheet` | Composable: Header, Title, Content, Footer |
| Radio buttons manuais | `RadioGroup` + `RadioButton` | Animated, acessível |
| Custom checkbox | `Checkbox` ou `Form.Input type="checkbox"` | Suporta label inline |
| `CardDetailsHeader` (exclusivo) | Header inline com NativeWind | Back arrow + image + title inline |
| `CardAsset` (exclusivo) | `Card` composable + Pressable | Card.Header + Card.Content |
| `TouchableOpacity` (botão) | `Button` ou `Pressable` | Pressable para ações genéricas |
| `StyleSheet.create` | NativeWind/Tailwind classes | Tokens semânticos do design system |
| Inline styles (`style={{}}`) | NativeWind classes (`className`) | Usar `cn()` para condicionais |

## Mapa de Substituição de Ícones

| Legado | RemixIcon (`Icon` do UI kit) |
|--------|------------------------------|
| FontAwesome5 `receipt` | `file-text-line` |
| FontAwesome5 `calculator` | `calculator-line` |
| FontAwesome5 `sign-out-alt` | `send-plane-line` |
| FontAwesome5 `wallet` | `wallet-line` |
| FontAwesome5 `info` | `information-line` |
| Feather `eye` / `eye-off` | `eye-line` / `eye-off-line` |
| Feather `check` | `check-line` |
| Ionicons `warning-outline` | `error-warning-line` |
| Ionicons `close-circle` | `close-circle-line` |
| MaterialCommunityIcons `lightbulb-outline` | `lightbulb-line` |
| MaterialCommunityIcons `glasses` | `glasses-line` |
| MaterialCommunityIcons `emoticon-neutral-outline` | `emotion-normal-line` |
| SVG `close_cicle.svg` | `Icon name="close-circle-line"` |
