# Trabalho_ModelagemDeSistema
Repositório para o trabalho de modelagem de sistemas - GRUPO: Gabriella Mansur (10735556), Julia Muniz (10737947) e Rafael Fontes (10737568).

# Visão Geral do Projeto
- O **AcessaVagas** é uma plataforma de recrutamento e seleção inclusiva projetada para conectar profissionais com deficiência (PCD) a ambientes de trabalho genuinamente acessíveis, combatendo diretamente o fenômeno da falsa inclusão

# Questão Problematizadora
- A maioria dos portais de emprego limita a acessibilidade a um *checkbox* genérico ("Vaga para PCD"), sem detalhar a infraestrutura do local de trabalho. Isso faz com que profissionais PCD invistam tempo, recursos e energia em processos seletivos para postos que possuem barreiras físicas ou digitais incompatíveis com suas necessidades funcionais reais.

# Solução
- Plataforma efetua um mapeamento detalhado do perfil do candidato e da estrutura real da empresa, aplicando um algoritmo de compatibilidade funcional determinística, assegurando transparência ao candidato antes da candidatura e validação contínua da infraestrutura após a entrevista.

# Diferenciais
* **Algoritmo de compatibilidade com trava crítica** (determinístico, sem IA), em três dimensões:
  * **50% Acessibilidade:** se a vaga declara ausente um recurso que o candidato marcou como indispensável, a trava crítica torna a vaga incompatível e ela não aparece na busca.
  * **30% Perfil técnico:** competências, experiência, escolaridade e idiomas.
  * **20% Modalidade e deslocamento:** modalidade da vaga (presencial, híbrido ou remoto) e tempo de trajeto (HERE).
  * Com dados faltando, o resultado é "dados insuficientes", sem presumir compatibilidade.
* **Avaliação pós-entrevista:** depois de uma entrevista concluída, o candidato avalia acessibilidade e postura inclusiva (1 a 5 estrelas). A nota pública da empresa mostra só a distribuição de estrelas, sem identificar ninguém.
* **Denúncia moderada:** quem participou do processo pode denunciar incompatibilidade ou falsa inclusão; a administração analisa em até 5 dias úteis, pode ouvir a empresa (sem revelar o denunciante) e registra a decisão.
* **Publicação nativa de vagas:** a empresa e seus recrutadores cadastram vagas declarando a acessibilidade item a item. Vagas externas (SPEC-006) ficaram como implementação futura, fora da versão entregue: o código está só na branch `desenvolvimento-do-projeto` (OPEN-102).
* **Acessibilidade por design (WCAG 2.2 AA):** em conformidade com a Lei Brasileira de Inclusão (LBI nº 13.146/2015): leitores de tela, navegação por teclado, alto contraste e tema escuro. Comandos de voz próprios não fazem parte desta versão.
* **Funil seletivo transparente:** etapas, histórico e entrevistas visíveis ao candidato, com avisos na plataforma e por e-mail a cada mudança.

# Documentação

O projeto segue o processo SDD (Spec-Driven Development). A documentação fica em `docs/`:

| Artefato | Arquivo |
|---|---|
| Visão do produto | [`docs/Descrição Do Projeto/visão do produto.md`](docs/Descrição%20Do%20Projeto/visão%20do%20produto.md) |
| Personas | [`docs/Personas/personas.md`](docs/Personas/personas.md) |
| Requisitos funcionais, não funcionais e regras de negócio (EARS) | [`docs/Requisitos/`](docs/Requisitos/requisitos_EARS.md) — [RF](docs/Requisitos/RF.md), [RNF](docs/Requisitos/RNF.md), [RB](docs/Requisitos/RB.md) |
| Casos de uso | [`docs/Casos De Uso/UC-geral.md`](docs/Casos%20De%20Uso/UC-geral.md) e os arquivos UC-00 a UC-14 |
| Modelo conceitual | [`docs/Modelo Conceitual/ModeloConceitual.md`](docs/Modelo%20Conceitual/ModeloConceitual.md) |
| Estados da vaga e do funil | [`docs/Fluxos e Estados/estados-trilha.md`](docs/Fluxos%20e%20Estados/estados-trilha.md) |
| Drivers arquiteturais | [`docs/Drivers Arquiteturais/Drivers Arquiteturais.md`](docs/Drivers%20Arquiteturais/Drivers%20Arquiteturais.md) |
| ADRs | [`docs/ADRs/ADRs.md`](docs/ADRs/ADRs.md) |
| Decisões técnicas | [`docs/Decisões Técnicas/decisões tecnicas.md`](docs/Decis%C3%B5es%20T%C3%A9cnicas/decis%C3%B5es%20tecnicas.md) |
| Mapa de Specs | [`docs/mapa-specs.md`](docs/mapa-specs.md) |
| Specs detalhadas | [`docs/Specs.md`](docs/Specs.md) (situação de cada Spec no "Registro consolidado", ao final) |
| Questões (OPENs) e implementações futuras | [`docs/OPEN.md`](docs/OPEN.md) |
| Revisões de consistência | [`docs/revisao-consistencia-specs.md`](docs/revisao-consistencia-specs.md) |
| Notas de implementação por Spec | [`docs/Implementacao/`](docs/Implementacao/) |
| Desvios entre o planejado e o implementado | [`docs/Implementacao/desvios.md`](docs/Implementacao/desvios.md) |
| Auditoria e log | [`docs/logging.md`](docs/logging.md) |
| Operação, publicação e roteiros de teste manual | [`docs/operacao/`](docs/operacao/) |
| Identidade visual e layout | [`docs/Identidade Visual/`](docs/Identidade%20Visual/), [`docs/layout/`](docs/layout/) |

# Estado atual (26/11/2026)

- **Implementado na `main`:** SPEC-001 a SPEC-005 e SPEC-007 a SPEC-021: cadastro e entrada dos quatro perfis, perfil do candidato com consentimento para dados de acessibilidade, infraestrutura da empresa e recrutadores, vagas, compatibilidade, busca, candidatura, funil com entrevistas, avisos, avaliação, nota pública, denúncias e moderação.
- **Mudanças de 24/11/2026:** o perfil do candidato voltou a ter o campo Competências, usado também no cálculo do perfil técnico da compatibilidade; a busca deixou de ter o filtro por cargo e as listas de Localização e Área profissional ficam recolhidas quando têm mais de 6 opções.
- **Implementações futuras (fora da versão entregue):** SPEC-006 (vagas externas do Adzuna), com código só na branch `desenvolvimento-do-projeto` (OPEN-102), e comandos de voz próprios (roteiro proposto no PR #67, fechado sem merge).
- **SPEC-019 e SPEC-020 (denúncias e moderação):** teste manual e layout aprovados em 26/11/2026; todas as Specs da versão entregue estão encerradas. Não há questões em aberto: em 26/11/2026, as soluções provisórias das OPEN-092, 093 e 095 a 101 passaram a ser as definitivas, e o que faltava decidir ficou como implementação futura (`docs/OPEN.md`).
- **Qualidade:** a CI roda checagem de tipos, lint, testes (Vitest, com verificação axe-core das telas), build e o teste de ponta a ponta `scripts/auth-e2e.mjs` em todo pull request.

## Aplicação web

A aplicação fica na raiz deste repositório; os documentos ficam em `docs/`.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, PostgreSQL com Prisma 6, Argon2id, Zod, Nodemailer e Vitest (ADR-005). Hospedagem na Vercel com banco Neon; e-mail pela Brevo em produção; tempo de trajeto pela API da HERE.

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

### Testes

```bash
npm run typecheck
npm run lint
npm test
npm run build && node scripts/auth-e2e.mjs   # ponta a ponta; precisa do PostgreSQL local
```

Os roteiros de validação manual de cada Spec estão em `docs/operacao/validacao-manual-*.md`.
