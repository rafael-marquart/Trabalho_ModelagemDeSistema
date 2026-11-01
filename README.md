# Trabalho_ModelagemDeSistema
Repositório para o trabalho de modelagem de sistemas - GRUPO: Gabriella Mansur (10735556), Julia Muniz (10737947) e Rafael Fontes (10737568).

# Visão Geral do Projeto
- O **AcessaVagas** é uma plataforma de recrutamento e seleção inclusiva projetada para conectar profissionais com deficiência (PCD) a ambientes de trabalho genuinamente acessíveis, combatendo diretamente o fenômeno da falsa inclusão

# Questão Problematizadora
- A maioria dos portais de emprego limita a acessibilidade a um *checkbox* genérico ("Vaga para PCD"), sem detalhar a infraestrutura do local de trabalho. Isso faz com que profissionais PCD invistam tempo, recursos e energia em processos seletivos para postos que possuem barreiras físicas ou digitais incompatíveis com suas necessidades funcionais reais.

# Solução
- Plataforma efetua um mapeamento detalhado do perfil do candidato e da estrutura real da empresa, aplicando um algoritmo de compatibilidade funcional determinística, assegurando transparência ao candidato antes da candidatura e validação contínua da infraestrutura após a entrevista.

# Diferenciais 
* **Algoritmo de Correspondência com Trava Crítica:** Avalia a compatibilidade entre o candidato, a vaga e a infraestrutura disponível pela empresa em três camadas:
  * **50% Acessibilidade:** Se houver qualquer barreira física ou digital eliminatória, o sistema aciona a trava crítica e zera o *match*, ocultando a vaga.
  * **30% Perfil Técnico:** Cruzamento de competências, escolaridade e experiências.
  * **20% Geolocalização/Modalidade:** Avaliação de tempo de deslocamento e formato da vaga (presencial, híbrido ou remoto).
* **Auditoria Colaborativa Pós-Entrevista:** Pesquisa anônima e adaptativa enviada ao candidato após a entrevista para avaliar a estrutura real encontrada. Alimenta a Nota Pública de Acessibilidade da empresa e dispara o bloqueio preventivo de vagas para moderação em caso de denúncias de falsa acessibilidade.
* **Modelo Duplo de Entrada de Vagas:** 
  * **Publicação Nativa:** Painel para empresas parceiras cadastrarem e gerenciarem processos seletivos.
  * **Publicação de Vagas Externas:** Extração e estruturação automática de anúncios públicos (via URL ou texto colado) utilizando IA (LLM) para conversão em formato JSON padronizado.
* **Acessibilidade por Design (WCAG 2.1 AA):** Desenvolvida em conformidade com Lei Brasileira de Inclusão (LBI nº 13.146/2015), garantindo autonomia total com leitores de tela, navegação por teclado, comandos de voz e modo de alto contraste.
* **Funil Seletivo Transparente:** Painéis exclusivos para acompanhamento de etapas em tempo real com indicação clara do formato da entrevista (presencial ou online).


## Aplicação web — início da implementação

A aplicação está sendo construída incrementalmente na raiz deste repositório, mantendo os documentos de requisitos em `docs/`.

**Stack inicial:** Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Argon2id, Zod e Vitest.

### Executar localmente

**Pré-requisitos:** Docker com Docker Compose, Node.js 20.9+ e npm.

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o PostgreSQL e o Mailpit (captura local de e-mails):
   ```bash
   docker compose up -d postgres mailpit
   docker compose ps
   ```
3. Copie o arquivo de exemplo e mantenha os valores locais padrão:
   ```bash
   cp .env.example .env
   ```
   No Windows PowerShell, use `Copy-Item .env.example .env`.
4. Gere o Prisma Client e aplique as migrações versionadas:
   ```bash
   npm run db:generate
   npx prisma migrate deploy
   ```
5. Inicie a aplicação em outro terminal:
   ```bash
   npm run dev
   ```
6. Abra a aplicação em http://localhost:3000 e a caixa de entrada de e-mails em http://localhost:8025.

#### Conta de administrador (catálogo de acessibilidade)

Para gerenciar o catálogo de necessidades em `/admin/catalogo-acessibilidade`, crie uma conta de administrador (apenas ambiente local):

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_NAME="Administrador" ADMIN_PASSWORD="SenhaForte123" npm run admin:create
```

Depois acesse http://localhost:3000/admin/login. A página não é ligada à tela de entrada.

#### E-mail de desenvolvimento (Mailpit)

O serviço Mailpit captura mensagens SMTP e **não envia e-mails para destinatários externos**. Use os seguintes valores no `.env` quando a aplicação Next.js estiver rodando diretamente na máquina host:

| Variável | Valor local |
|---|---|
| `SMTP_HOST` | `127.0.0.1` |
| `SMTP_PORT` | `1025` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | vazio |
| `SMTP_PASSWORD` | vazio |
| `SMTP_FROM` | `Acessa Vagas <nao-responda@acessavagas.local>` |
| `APP_BASE_URL` | `http://localhost:3000` |

- A interface web do Mailpit fica em **http://localhost:8025**. Abra-a depois de solicitar confirmação de empresa, recuperação de senha ou convite de recrutador; os links de teste estarão nas mensagens capturadas.
- A porta SMTP local é `1025`; a interface web é `8025`. Não use `localhost` como `SMTP_HOST` se a aplicação for movida para outro container: nesse caso, use o nome do serviço `mailpit` na rede Docker.
- O banco local usa a porta `5432`, banco `acessa_vagas`, usuário/senha `postgres`. Esses valores são apenas para desenvolvimento local sem dados reais.
- Para parar os serviços: `docker compose down`. Para apagar também o banco de desenvolvimento: `docker compose down -v` (isso exclui permanentemente os dados locais).
- O script `node scripts/auth-e2e.mjs` inicia seu próprio servidor SMTP de captura para E2E e usa `AUTH_E2E_PORT`/`AUTH_E2E_SMTP_PORT`; não depende do Mailpit nem envia mensagens externas.

### Publicação (Vercel)

O passo a passo para publicar na Vercel com banco Neon, e-mail Brevo e agendamentos está em [`docs/operacao/deploy-vercel.md`](docs/operacao/deploy-vercel.md).

### Estado da implementação

A branch de implementação contém a entrada/login, autenticação por credenciais, sessões revogáveis, cadastro inicial de candidato e empresa, recuperação/redefinição de senha, confirmação de e-mail corporativo por link de uso único válido por 24 horas e fluxo inicial de convites de recrutadores (envio, reenvio, cancelamento, aceite e recusa). O cadastro aceita inicialmente apenas empresas brasileiras que informem um CNPJ com exatamente 14 dígitos, sem validar dígitos verificadores ou consultar sua existência em fonte oficial. A conta empresarial permanece inativa até a confirmação do e-mail corporativo e é ativada após essa confirmação. Empresas estrangeiras ou sem CNPJ estão fora do escopo inicial. Convites para recrutadores também podem iniciar uma conta pendente, que só é ativada após a pessoa definir sua senha e aceitar o vínculo pelo link de uso único. A implementação inclui migração PostgreSQL, restrição de unicidade para vínculo ativo, testes SQL de concorrência, CI com validação de Prisma, TypeScript, lint, testes unitários e build. A rotina de retenção de auditoria oferece simulação por padrão e descarte explícito de eventos com mais de um ano-calendário, preservando eventos marcados com `retentionHold`; veja `docs/operacao/retencao-auditoria.md`.

A CI automatizada executa migrações PostgreSQL, geração do Prisma Client, typecheck, lint, testes unitários, build de produção e o fluxo E2E de autenticação com PostgreSQL e SMTP de captura. Os E2E atuais verificam também login de candidato por CPF formatado e recuperação de senha de Empresa, incluindo redefinição, rejeição de reutilização do link e login com a nova senha. **Permanecem pendentes a execução manual do app no navegador, a conferência dos links reais no Mailpit e a comparação visual das telas com os SVGs.** O ambiente local descrito acima usa Mailpit e não envia mensagens para destinatários externos. Para executar a conferência manual de forma guiada, siga o [roteiro de validação manual da SPEC-001](docs/operacao/validacao-manual-spec-001.md).
