# Publicação na Vercel

Guia para colocar o AcessaVagas no ar com **Vercel (Hobby, grátis)** + **Neon (PostgreSQL grátis, região São Paulo)** + **Brevo (e-mail)** + **HERE (deslocamento)**. Todos os segredos ficam só nos painéis da Vercel e do GitHub — nunca no repositório, em prints ou na conversa.

## O que já está preparado no código

| Ponto | Como ficou |
|---|---|
| Build | `vercel.json` usa `npm run vercel-build` (`scripts/vercel-build.mjs`): na **produção** (`main`) e no **ambiente de testes** (`desenvolvimento-do-projeto` com `APP_ENV=staging`) aplica as migrações pendentes no banco daquele ambiente e depois gera o Prisma Client e o build do Next. Outros previews nunca mexem no banco. |
| Branches publicadas | `ignoreCommand` do `vercel.json`: só `main` (produção) e `desenvolvimento-do-projeto` (testes) geram deploy; as demais branches são ignoradas. |
| Região | Funções em `gru1` (São Paulo), perto do banco. |
| Documentos do candidato | Guardados no banco (tabela `CandidateDocumentContent`), porque a Vercel não tem disco persistente. Limite de **4 MB** por arquivo (a Vercel recusa requisições acima de 4,5 MB) — OPEN-099. |
| E-mails de notificação | Enviados logo após cada evento com `after()`; as novas tentativas vêm de `/api/cron/notificacoes`. |
| Retenção de dados | `/api/cron/retencao` roda as mesmas rotinas dos comandos `npm run ...:retention -- --execute`. |
| Agendamento | Vercel Cron (Hobby: no máximo 1×/dia, horário com variação de até 59 min): retenção às 03h e notificações às 06h (horário de Brasília). O workflow `.github/workflows/agendador.yml` chama as notificações a cada 15 min. |
| Segurança | Rotas de cron só respondem com `Authorization: Bearer <CRON_SECRET>`; cabeçalhos de segurança em todas as respostas; cookie de sessão `Secure` em HTTPS; links de e-mail só com `APP_BASE_URL` em HTTPS. |
| Dependências | `package-lock.json` versionado; CI com `npm ci` e Node 22; `nodemailer` 10. |

## Passo a passo

### 1. Escolher a branch de produção

A Vercel publica em produção a branch escolhida (recomendado: `main`). Antes do primeiro deploy, leve `desenvolvimento-do-projeto` para `main` por PR, como de costume. O agendador do GitHub também só roda a partir de `main`.

### 2. Criar o projeto na Vercel

1. Em vercel.com, entre com a conta do GitHub.
2. **Add New → Project** → importe `rafael-marquart/Trabalho_ModelagemDeSistema`.
3. Framework: Next.js (detectado). Não mude o comando de build — ele vem do `vercel.json`.
4. **Ainda não clique em Deploy**: primeiro crie o banco (passo 3) e as variáveis (passo 4). Se clicar, o primeiro deploy falha por falta de banco; basta refazer depois.

### 3. Criar o banco (Neon)

1. No projeto da Vercel: **Storage → Create Database → Neon**.
2. Região: **AWS São Paulo (sa-east-1)**. Plano Free.
3. Conecte ao projeto marcando os ambientes **Production** (e Development, se quiser).
4. A integração cria sozinha `DATABASE_URL` (conexão com pool, usada pelo site) e `DATABASE_URL_UNPOOLED` (conexão direta, usada pelas migrações no build).

Limites do Neon Free: 1 GB por projeto e 100 horas de computação por mês; o banco "dorme" após 5 minutos parado, então a primeira página depois de um tempo pode levar 1–2 s a mais.

### 4. Variáveis de ambiente

Em **Settings → Environment Variables**, ambiente **Production**:

| Variável | Valor |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Criadas pelo Neon (não mexa) |
| `APP_BASE_URL` | Endereço público, ex.: `https://acessa-vagas.vercel.app` (sem barra no fim) |
| `APP_ENV` | `production` |
| `SESSION_COOKIE_NAME` | `acessa_session` |
| `CRON_SECRET` | Valor aleatório longo (como gerar, abaixo) |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_REQUIRE_TLS` | `true` |
| `SMTP_USER` | Login SMTP do Brevo (o mesmo do seu `.env`) |
| `SMTP_PASSWORD` | Chave SMTP do Brevo — **gere uma nova só para produção** |
| `SMTP_FROM` | Remetente verificado no Brevo, ex.: `AcessaVagas <seu-remetente@...>` |
| `HERE_API_KEY` | Chave da HERE — use uma **nova** (a antiga apareceu na conversa) |
| `HERE_QUOTA_PERCENT` | `60` |

Para gerar o `CRON_SECRET` no seu computador (PowerShell):

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copie o resultado direto para a Vercel; não salve em arquivo do projeto.

**Brevo:** se em *Security → Authorized IPs* a restrição por IP estiver ativa, desative-a para o SMTP (a Vercel não tem IP fixo), senão os e-mails são recusados.

### 5. Primeiro deploy

**Deployments → Redeploy** (ou o botão Deploy). No log do build aparecem `prisma migrate deploy` (as 30 migrações na primeira vez) e depois o `next build`.

### 6. Criar o administrador

Do seu computador, apontando para o banco de produção com a conexão **direta** (copie `DATABASE_URL_UNPOOLED` do painel da Vercel ou do Neon). No PowerShell, na pasta do projeto:

```
$env:DATABASE_URL="<cole aqui a DATABASE_URL_UNPOOLED>"
$env:ADMIN_EMAIL="seu-email-de-admin@..."
$env:ADMIN_NAME="Seu nome"
$env:ADMIN_PASSWORD="<senha forte, 10 a 128 caracteres>"
npm.cmd run admin:create
```

Depois **feche o terminal** (as variáveis somem com ele). Não cole a URL do banco nem a senha na conversa.

### 7. Agendador a cada 15 minutos (GitHub)

No GitHub: **Settings → Secrets and variables → Actions → New repository secret**:

- `APP_URL` = o mesmo valor de `APP_BASE_URL`
- `CRON_SECRET` = o mesmo valor da Vercel

Teste em **Actions → Agendador → Run workflow**: o passo deve terminar com `{"ok":true,...}`. Observação: o GitHub pode pausar agendamentos depois de 60 dias sem commits no repositório (basta reativar em Actions).

### 8. Outras branches

Só `main` e `desenvolvimento-do-projeto` geram deploy (`ignoreCommand` no `vercel.json`); as branches de feature aparecem como "Ignored" na Vercel, sem gastar build.

## Ambiente de testes (branch `desenvolvimento-do-projeto`)

Um segundo site, com **banco próprio** e **e-mails presos numa caixa de teste**, para criar à vontade vagas, empresas e candidatos fictícios sem tocar na produção. Cada merge em `desenvolvimento-do-projeto` atualiza esse site.

| | Produção | Testes |
|---|---|---|
| Branch | `main` | `desenvolvimento-do-projeto` |
| Ambiente na Vercel | Production | Preview |
| Endereço | `acessa-vagas.vercel.app` | `acessa-vagas-dev.vercel.app` |
| Banco | Neon `acessavagas` | Neon `acessavagas-dev` (separado) |
| E-mail | Brevo (chega de verdade) | Ethereal (caixa de teste na web; nada chega a ninguém) |
| Faixa no topo | — | "Ambiente de testes" |
| Agendamentos | Vercel Cron + GitHub a cada 15 min | Não (os e-mails saem na hora; sem novas tentativas) |

### T1. Caixa de e-mail de teste (Ethereal)

1. Em **ethereal.email**, clique em **Create Ethereal Account**.
2. Anote o **Username** e o **Password** que aparecem (são da caixa de teste, não de um e-mail real). Para ver as mensagens depois: **Login** no site com esses dados → **Messages**.
3. Limites: grátis, até 200 e-mails por hora; as mensagens ficam guardadas por algumas horas.

### T2. Banco de testes (Neon)

1. Na Vercel: **Storage → Create Database → Neon**, região **São Paulo**, **Auth desligado**, plano Free, nome `acessavagas-dev`.
2. **Connect Project** → `acessa-vagas`, marcando **só Preview** (desmarque Production e Development) e **Custom Prefix vazio**.
3. Confira em **Settings → Environment Variables**: agora há `DATABASE_URL` em *Production and Development* (banco de produção) e outra `DATABASE_URL` em *Preview* (banco de testes). **Nunca** conecte o banco de produção ao Preview.

### T3. Endereço fixo do site de testes

**Settings → Domains → Add Domain** → `acessa-vagas-dev.vercel.app` → em *Connect to an environment* escolha **Preview** e, em **Git Branch**, `desenvolvimento-do-projeto` → **Save**.

### T4. Variáveis do ambiente de testes

**Settings → Environment Variables → Add**, ambiente **Preview** (e, se a tela oferecer, branch `desenvolvimento-do-projeto`):

| Tipo | Key | Value |
|---|---|---|
| Config | `APP_ENV` | `staging` (liga a faixa "Ambiente de testes" e autoriza as migrações no banco de testes) |
| Config | `APP_BASE_URL` | `https://acessa-vagas-dev.vercel.app` |
| Config | `SESSION_COOKIE_NAME` | `acessa_session` |
| Config | `SMTP_HOST` | `smtp.ethereal.email` |
| Config | `SMTP_PORT` | `587` |
| Config | `SMTP_SECURE` | `false` |
| Config | `SMTP_REQUIRE_TLS` | `true` |
| Config | `SMTP_FROM` | `AcessaVagas Testes <nao-responda@acessavagas.test>` |
| Config | `HERE_QUOTA_PERCENT` | `20` (a cota grátis da HERE é dividida: produção 60% + testes 20%) |
| Secret | `SMTP_USER` | Username do Ethereal |
| Secret | `SMTP_PASSWORD` | Password do Ethereal |
| Secret | `HERE_API_KEY` | A mesma chave da produção |
| Secret | `CRON_SECRET` | Outro valor aleatório (mesmo comando `node -e ...` da produção) |

### T5. Quem pode abrir o site de testes

No plano Hobby, os deploys de Preview ficam protegidos por login da Vercel (**Settings → Deployment Protection → Vercel Authentication**): só você, logado, consegue abrir. Para a equipe ou o professor testarem, desative essa proteção (os dados ali são fictícios e a Vercel não deixa previews aparecerem em buscadores).

### T6. Primeiro deploy e administrador de testes

1. **Deployments** → no último deploy de `desenvolvimento-do-projeto`, **⋯ → Redeploy** (ou faça um merge nessa branch). O log mostra "Aplicando migrações (ambiente de testes)".
2. Crie um administrador de testes como no passo 6, usando a `DATABASE_URL_UNPOOLED` do **Preview**.

## Conferência depois do deploy

| # | Teste | Esperado |
|---|---|---|
| 1 | Abrir o endereço | Página inicial; em DevTools → Network, a resposta tem `x-frame-options: DENY` |
| 2 | Cadastrar candidato e empresa | Contas criadas; a empresa recebe o e-mail de confirmação (Brevo) com link `https://...vercel.app/...` |
| 3 | Entrar como administrador (`/admin/login`) | Catálogo e Denúncias abrem |
| 4 | Candidato anexa um PDF de até 4 MB e baixa de novo | Funciona; um arquivo de 5 MB é recusado com a mensagem de 4 MB |
| 5 | Empresa muda a etapa de uma candidatura | Candidato vê o aviso em Notificações e recebe o e-mail |
| 6 | Vaga presencial com endereço | Tempo de deslocamento calculado (HERE) |
| 7 | Vercel → **Settings → Cron Jobs** → *Run* em cada rota | Resposta `ok: true` (veja em **Logs**) |
| 8 | Abrir `/api/cron/retencao` no navegador | `401` (sem o segredo) |

## Custos e limites

- **Vercel Hobby:** grátis, uso **não comercial** (adequado para trabalho acadêmico). Funções com tempo máximo configurado de 60 s nas rotas de cron.
- **Neon Free:** grátis, 1 GB. Os documentos dos candidatos ocupam esse espaço — acompanhe em *Neon → Usage*.
- **Brevo grátis:** limite diário de envios do plano.
- **HERE:** o próprio sistema para de consultar ao atingir `HERE_QUOTA_PERCENT` da cota mensal (`npm.cmd run here:usage` mostra o consumo, apontando o `DATABASE_URL` para produção como no passo 6).

## Atualizações seguintes

Basta fazer o merge em `main`: a Vercel publica sozinha e, se houver migração nova, ela é aplicada no build antes do site novo entrar no ar. Se uma migração falhar, o deploy falha e o site anterior continua no ar.
