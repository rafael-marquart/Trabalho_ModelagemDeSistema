# SPEC-005 — Implementação do cadastro e gestão de vagas próprias

## Escopo implementado

- Modelo `Job` (migração `20261027220000_spec_005_jobs`): empresa responsável, criador, estado (`DRAFT`, `OPEN`, `PAUSED`, `CLOSED`), origem (`OWN`), título, descrição, requisitos, modalidade, localização (cidade, estado, endereço), prazo (data), faixa salarial opcional, declaração de acessibilidade em JSON por código de item e datas de publicação/encerramento. A empresa e a origem são sempre definidas pelo sistema.
- Quem gerencia: conta da Empresa e Recrutador com vínculo ativo (decisão de 27/10/2026, extensão do texto da Spec). A empresa vem da sessão (`src/lib/jobs/access.ts`); vaga de outra empresa responde 404.
- API: `GET/POST /api/vagas`, `GET/PUT /api/vagas/[id]`, `POST /api/vagas/[id]/acao` (`publish`, `pause`, `reopen`, `close`). Rascunhos aceitam dados incompletos; publicar e reabrir reaplicam as validações de publicação (OPEN-020/021), devolvidas por campo (`accessibility.<CÓDIGO>`, `salary`, etc.).
- Transições: rascunho → publicada; publicada ↔ pausada; publicada/pausada → encerrada (final). Vaga encerrada não é editável.
- Vaga publicada ou pausada só é salva se continuar publicável.
- Acessibilidade da vaga: os seis itens da infraestrutura da Empresa, cada um Presente, Ausente ou Não informado, sem valor padrão; é preciso escolher uma opção em todos para publicar.
- Auditoria (`JOB_CREATED/UPDATED/PUBLISHED/PAUSED/REOPENED/CLOSED`) com ator, empresa, estados e nomes dos campos alterados, nunca o conteúdo da vaga.
- Interface: menu lateral compartilhado da área da empresa (`CompanyShell`); Empresa: Início, Vagas, Recrutadores e Configurações (infraestrutura); Recrutador: Visão geral e Vagas. Painel com abas (Publicadas, Rascunhos, Pausadas, Encerradas) e contagens, ações Editar/Pausar/Reabrir/Encerrar (com confirmação) e formulário de vaga com erros ao lado de cada campo.

## Pontos que dependem de outras Specs

- Trava de edição após candidaturas (OPEN-022) e lista de candidatos ativos ao encerrar: `jobHasApplications` e `listActiveCandidatesForJob` em `src/lib/jobs/applications.ts` são pontos de ligação que hoje retornam "sem candidaturas". A API de edição já responde 409 com `locked` quando `jobHasApplications` retornar verdadeiro.
- Catálogo e busca para candidatos: SPEC-008. A SPEC-005 só persiste as vagas publicadas.
- Vagas externas: SPEC-006. Compatibilidade e trava crítica: SPEC-007.
- "Revisão de publicação" é feita pela validação ao publicar, com indicação dos campos.

## Arquivos principais

- `prisma/schema.prisma`, `prisma/migrations/20261027220000_spec_005_jobs/migration.sql`
- `src/lib/jobs/{constants,schema,access,issues,applications}.ts`
- `src/app/api/vagas/**`
- `src/components/company-shell.tsx`, `src/components/jobs/{jobs-panel,job-editor}.tsx`
- `src/app/empresa/{page,configuracoes,vagas}`, `src/app/recrutador/vagas`

## Verificações

- Vitest (regras de publicação, API com autorização, isolamento entre empresas, transições, trava e auditoria sem conteúdo; interface), ESLint e `tsc --noEmit`.
- O E2E (CI com PostgreSQL) cobre: acesso anônimo, recrutador sem vínculo, origem cruzada, empresa não escolhida pelo corpo, rascunho incompleto, bloqueio de publicação, prazo vencido, ciclo publicar/pausar/reabrir/encerrar, isolamento entre empresas e auditoria sem conteúdo.
- Teste manual: `docs/operacao/validacao-manual-spec-005.md`. Aprovação de layout e encerramento da Spec pendentes do responsável.
- Teste manual executado pelo responsável em 27/10/2026; ajustes aplicados (mensagens de cidade/estado ao lado dos campos, aviso de campos pendentes com rolagem, espaçamento dos botões, item Recrutadores no menu, área do recrutador com o menu compartilhado e Vagas). Layout aprovado na mesma data.
- SPEC-005 encerrada em 27/10/2026, exceto os quatro critérios que dependem de candidaturas e do catálogo (disponibilidade no catálogo, trava após candidatura, bloqueio de novas candidaturas ao encerrar e identificação de candidatos ativos), que permanecem abertos para as Specs correspondentes.
