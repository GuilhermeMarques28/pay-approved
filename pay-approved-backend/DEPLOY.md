# 🚀 Guia de Deploy — Pay Approved Backend no Railway

## Pré-requisitos

- Conta no [Railway](https://railway.app) (pode criar com GitHub)
- Repositório no GitHub com o código atualizado
- Credenciais do Supabase (URL, Anon Key, Service Role Key)
- Domínio próprio com acesso ao painel DNS

---

## Passo 1: Subir o código para o GitHub

```bash
git add .
git commit -m "feat: prepare backend for production deployment"
git push origin develop
```

Em seguida, faça merge para a branch `main` (o Railway fará deploy a partir dela):

```bash
git checkout main
git merge develop
git push origin main
```

---

## Passo 2: Criar projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub Repo"**
4. Autorize o Railway a acessar seu repositório
5. Selecione o repositório **pay-approved**

### Configurar Root Directory

Como o backend está em um subdiretório:

1. Vá em **Settings** do serviço
2. Em **"Root Directory"**, coloque: `pay-approved-backend`
3. O Railway detectará o Dockerfile automaticamente

---

## Passo 3: Configurar variáveis de ambiente

No Railway, vá em **Variables** e adicione:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `SUPABASE_ANON_KEY` | Copie do Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Copie do Supabase Dashboard → Settings → API |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://seudominio.com,https://api.seudominio.com` |
| `EXPO_PUSH_NOTIFICATION_API_KEY` | Sua chave Expo (se usar push notifications) |

> ⚠️ **NÃO** configure `PORT` — o Railway injeta automaticamente.

---

## Passo 4: Deploy

Após configurar, clique em **"Deploy"**. O Railway irá:

1. Detectar o `Dockerfile`
2. Executar o build multi-stage (instalar deps → compilar TypeScript → criar imagem leve)
3. Iniciar o container com `node dist/index.js`

Acompanhe os logs em tempo real na aba **"Deployments"**.

---

## Passo 5: Configurar domínio próprio

1. No Railway, vá em **Settings → Networking → Custom Domain**
2. Clique em **"Add Domain"** e digite seu domínio (ex: `api.seudominio.com`)
3. O Railway mostrará um **CNAME target** (algo como `xxx.up.railway.app`)
4. No painel DNS do seu domínio, crie um registro:

```
Tipo: CNAME
Nome: api (ou o subdomínio desejado)
Valor: xxx.up.railway.app (o target que o Railway mostrou)
TTL: 300 (ou automático)
```

5. Aguarde propagação DNS (5-30 minutos)
6. O SSL (HTTPS) é configurado automaticamente pelo Railway

---

## Passo 6: Verificar deploy

Teste o health check:

```bash
curl https://api.seudominio.com/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2026-07-30T12:00:00.000Z"}
```

Teste o login:

```bash
curl -X POST https://api.seudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}'
```

---

## Passo 7: Atualizar o app mobile

No seu app Expo/React Native, atualize a URL base da API:

```typescript
// De:
const API_URL = 'http://localhost:3000';

// Para:
const API_URL = 'https://api.seudominio.com';
```

> 💡 Use variáveis de ambiente do Expo (`EXPO_PUBLIC_API_URL`) para alternar entre dev e prod.

---

## Deploys automáticos

O Railway faz deploy automático a cada push na branch `main`. Para atualizar:

```bash
git add .
git commit -m "fix: minha correção"
git push origin main
```

O deploy começa automaticamente em ~30 segundos.

---

## Monitoramento

- **Logs**: Railway → seu serviço → aba "Deployments" → clique no deploy ativo
- **Health Check**: O endpoint `/health` pode ser monitorado com UptimeRobot (gratuito)
- **Métricas**: Railway mostra CPU, memória e rede na aba "Metrics"

---

## Custos estimados (Railway)

| Recurso | Custo |
|---|---|
| **Hobby Plan** | $5/mês (inclui $5 de créditos de uso) |
| **Uso típico** (API leve) | ~$2-5/mês |
| **Free Trial** | 500 horas gratuitas no primeiro mês |

> O Railway cobra por uso (CPU + memória + rede). Um backend Express leve como este consome muito pouco.
