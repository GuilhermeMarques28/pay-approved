# Feature Implementation Workflow

Pipeline sequencial para implementação de features. Cada fase tem responsabilidade clara, critérios de saída e commit próprio.

**Pré-requisitos:** Ler `docs/constitution.md`, a skill `bulletproof-react` e a skill `vercel-composition-patterns` antes de iniciar.

---

## Fase 1: Analyze

**Objetivo:** Entender o escopo, dependências e impacto da feature.

**Ações:**

1. Ler a tarefa/solicitação do usuário completamente.
2. Consultar `docs/constitution.md` para regras aplicáveis.
3. Consultar a skill `vercel-composition-patterns` para definir a arquitetura de componentes (compound components, composição, evitar boolean prop proliferation).
4. Identificar features existentes que serão impactadas (`src/features/`).
5. Identificar componentes compartilhados necessários (`src/components/`).
6. Verificar se há dependências externas (pacotes, APIs, SDK Expo).
7. Criar/atualizar `specs/[feature]/spec.md` com:
   - Descrição da feature
   - Requisitos funcionais
   - Dependências identificadas
   - Escopo (o que entra e o que não entra)
8. Criar/atualizar `specs/[feature]/plan.md` com:
   - Decisões técnicas
   - Constitution Check (checklist da constituição)
   - Riscos e trade-offs
9. Criar/atualizar `specs/[feature]/tasks.md` com as etapas de implementação.

**Critério de saída:** Specs criadas, escopo claro, Constitution Check respondido.

**Commit:** `docs(<feature>): add spec, plan and tasks`

---

## Fase 2: Structure

**Objetivo:** Criar a estrutura de pastas da feature seguindo Bulletproof React.

**Ações:**

1. Criar pasta `src/features/<feature-name>/`.
2. Criar apenas as subpastas necessárias para a feature:
   - `api/` — se a feature consome API
   - `components/` — se tem componentes específicos
   - `hooks/` — se tem hooks específicos
   - `types/` — se tem tipos próprios
   - `stores/` — se tem estado local
   - `utils/` — se tem utilitários específicos
   - `keys/` — se usa React Query
3. Não criar subpastas vazias ou desnecessárias.
4. Validar que a estrutura respeita o fluxo `shared -> features -> app`.

**Critério de saída:** Estrutura de pastas criada, sem arquivos vazios.

**Commit:** `chore(<feature>): scaffold feature structure`

---

## Fase 3: Contracts

**Objetivo:** Definir tipos, schemas e contratos de API da feature.

**Ações:**

1. Criar tipos em `src/features/<feature>/types/index.ts`:
   - Tipos de resposta de API
   - Tipos de domínio da feature
   - Tipos de props de componentes (quando complexos)
2. Criar query keys em `src/features/<feature>/keys/index.ts`:
   - Seguir padrão hierárquico (ver `src/features/faq/keys/index.ts` como referência)
3. Definir contratos de API em `src/features/<feature>/api/`:
   - Separar por verbo HTTP: `get.ts`, `post.ts`, `put.ts`, `delete.ts`
   - Queries recebem `signal?: AbortSignal`
   - Usar `getInstance()` de `@/lib/api/instance`
   - Tipar retornos com os tipos da feature

**Referência de padrão:**

```typescript
// types/index.ts
export type ExampleResponse = { ... };

// keys/index.ts
export const exampleKeys = {
  all: ["example"] as const,
  list: () => [...exampleKeys.all, "list"] as const,
  detail: (id: string) => [...exampleKeys.all, "detail", id] as const,
};

// api/get.ts
import { getInstance } from "@/lib/api/instance";
import type { ExampleResponse } from "../types";

export const getExample = async (signal?: AbortSignal) => {
  const { data } = await getInstance().get("/example", { signal });
  return data as ExampleResponse;
};
```

**Critério de saída:** Tipos definidos, keys criadas, funções de API tipadas.

**Commit:** `feat(<feature>): add types, keys and api contracts`

---

## Fase 4: Core

**Objetivo:** Implementar hooks, lógica de negócio e estado da feature.

**Ações:**

1. Criar hooks de query em `src/features/<feature>/hooks/`:
   - Usar `queryOptions` + `useQuery` do `@tanstack/react-query`
   - Passar `signal` do `queryFn` para as chamadas de API
   - Aceitar `queryConfig` opcional via `QueryConfig` de `@/lib/react-query`
   - Seguir padrão de nomenclatura: `use-<nome>.ts`
2. Criar hooks de mutation quando necessário:
   - `useMutation` com `onSuccess` para refetch (sem `useQueryClient` direto)
3. Criar stores locais em `src/features/<feature>/stores/` se necessário.
4. Criar utils específicos em `src/features/<feature>/utils/` se necessário.

**Regra de loading:** Sempre usar `isPending` do React Query como indicador de loading (não `isLoading` ou `isFetching`). `isPending` é `true` quando não há dados no cache e a query está em andamento — o comportamento correto para skeleton/loading states.

**Referência de padrão:**

```typescript
// hooks/use-example.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { exampleKeys } from "../keys";
import { getExample } from "../api/get";

const exampleListOptions = () =>
  queryOptions({
    queryKey: exampleKeys.list(),
    queryFn: ({ signal }) => getExample(signal),
  });

type UseExampleOptions = {
  queryConfig?: QueryConfig<typeof exampleListOptions>;
};

export function useExample({ queryConfig }: UseExampleOptions = {}) {
  return useQuery({ ...exampleListOptions(), ...queryConfig });
}

// No componente consumer:
const { data, isPending } = useExample();
// isPending para loading states — NUNCA isLoading ou isFetching
```

**Critério de saída:** Hooks funcionais, lógica encapsulada, sem dependência direta da UI.

**Commit:** `feat(<feature>): implement hooks and core logic`

---

## Fase 5: UI

**Objetivo:** Implementar componentes visuais nas features e compor a screen.

**Importante: Screens são orquestradoras, NÃO features.**

A screen apenas importa e compõe. Componentes de domínio pertencem à feature, não à screen.

**Ações:**

1. **Criar componentes de domínio em `src/features/<feature>/components/`:**
   - Cada componente pertence à feature do seu domínio
   - Ex: seção de patrimônio → `src/features/patrimony/components/`
   - Ex: timeline de investimentos → `src/features/investments/components/`
   - Componentes consomem dados via hooks da própria feature
   - Seguir padrão composable (Card.Header, Card.Title) para componentes complexos
   - Usar primitives de `src/components/ui/` (Card, BottomSheet, Button, Icon, etc.)

2. **Criar a screen em `src/screens/<Screen>/`:**
   - `view.tsx` — orquestra: importa componentes de features e compõe a tela
   - `components/` — SOMENTE componentes sem domínio específico (ex: header com greeting, carousel informativo genérico)
   - A screen NÃO tem `api/`, `hooks/`, `types/` ou `stores/` — esses pertencem às features

3. Verificar se componentes compartilhados existem antes de criar novos.
4. Se um componente for realmente transversal, criar em `src/components/`.
5. **Ao criar novos componentes UI**, consultar a skill `creating-new-ui-components` para seguir o padrão composable (CVA + NativeWind + composable API).
6. Compor a screen nas rotas:
   - Rotas finas: apenas importam e renderizam a screen de `src/screens/`
   - Sem lógica de negócio nas rotas
6. Nomenclatura de arquivos: `kebab-case` para todos os arquivos.

**Hierarquia de decisão para componentes:**

```
O componente pertence a um domínio/feature?
  → SIM → src/features/<feature>/components/
  → NÃO, é exclusivo da screen e sem domínio?
    → SIM → src/screens/<Screen>/components/
  → É transversal (usado por múltiplas features/screens)?
    → SIM → src/components/
```

**Critério de saída:** Componentes nas features corretas, screen orquestrando composição, rotas finas.

**Commit:** `feat(<feature>): implement ui components and screens`

---

## Fase 6: Review

**Objetivo:** Validar conformidade com a constituição e qualidade do código.

**Ações:**

1. **Constitution Check automático:**
   - [ ] Organização feature-first respeitada
   - [ ] Camada de app/rotas fina
   - [ ] Fluxo `shared -> features -> app` respeitado
   - [ ] Sem importação cruzada entre features
   - [ ] TypeScript strict, sem `any` injustificado
   - [ ] Dados externos validados quando necessário
   - [ ] Componentes de domínio dentro da feature correspondente
   - [ ] Screens são orquestradoras — sem lógica de negócio, sem api/hooks/types próprios
   - [ ] Componentes em `src/screens/` SOMENTE quando sem domínio específico
   - [ ] Componentes compartilhados são transversais
   - [ ] Estado global só para necessidades transversais
   - [ ] APIs/queries dentro da feature
   - [ ] Comentários apenas quando essenciais
   - [ ] Código e artefatos em inglês
   - [ ] Composition patterns aplicados (skill `vercel-composition-patterns`): sem boolean prop proliferation, compound components onde aplicável, composição sobre herança
   - [ ] Loading states usam `isPending` do React Query (nunca `isLoading`)

2. **Validação de UI (quando a feature tem design no Figma):**
   - Usar o MCP do Figma para buscar o design da feature
   - Comparar a implementação com o design: espaçamentos, cores, tipografia, estados
   - Corrigir divergências visuais encontradas

3. **Validações técnicas:**
   - Executar `npx tsc --noEmit` (type-check)
   - Executar lint se configurado
   - Revisar imports para garantir fluxo unidirecional

4. **Correções:**
   - Corrigir qualquer violação encontrada
   - Remover código morto ou comentários desnecessários

5. **Atualizar documentação de estado:**
   - `FEATURE_LIST.md` — adicionar/atualizar entrada da feature
   - `IMPLEMENTATION_STATUS.md` — atualizar percentual

**Critério de saída:** Todas as validações passam, documentação atualizada.

**Commit:** `chore(<feature>): review conformance and update status`

---

## Resumo do Fluxo

```
Analyze → Structure → Contracts → Core → UI → Review
  docs()     chore()     feat()    feat()  feat()  chore()
```

Cada fase usa a skill `commit-work` para realizar o commit. Commits seguem Conventional Commits.

## Notas

- Se a feature for simples (ex: sem API), pular fases que não se aplicam.
- Fases 3 e 4 podem ser combinadas se a feature for pequena.
- A fase 1 (Analyze) pode ser mais leve para bug fixes — spec resumida no plan.
- Agentes DEVEM consultar este workflow antes de iniciar qualquer feature.
- Skills existentes (bulletproof-react, creating-new-ui-components, etc.) continuam disponíveis e devem ser consultadas quando relevantes.
