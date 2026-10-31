# SPEC-009 — Implementação do status e da disponibilidade da vaga

## Escopo implementado

- **Catálogo (OPEN-040):** Aberta, Indisponível e Encerrada, derivados do estado registrado da vaga (publicada, pausada, encerrada) e do prazo de inscrição (prazo vencido = indisponível). Nenhum estado novo foi criado.
- **Consulta no momento da operação:** `checkJobAvailability` (`src/lib/jobs/availability.ts`) lê o registro atual; se não for possível lê-lo, a disponibilidade não é presumida e a ação fica bloqueada. `acceptsApplications` é o ponto que a SPEC-011 usará antes de registrar uma candidatura.
- **API:** `GET /api/candidato/vagas/[id]/status` (somente candidato, somente leitura, sem cache); rascunhos respondem "não encontrada".
- **Estado atualizado:** no detalhe da vaga, o status é verificado de novo quando a página volta ao foco e a cada minuto; se a empresa mudou o status, o candidato é avisado numa região anunciada por leitor de tela e pode atualizar a página. A busca (SPEC-008) e o detalhe (SPEC-010) sempre leem o estado atual ao carregar.
- **Alteração de status (OPEN-041):** pelas ações já existentes da SPEC-005 (pausar = indisponível, reabrir, encerrar), somente pela Empresa responsável e por Recrutador com vínculo ativo; candidato e administrador da plataforma são recusados; encerrada → aberta é recusada. A mudança agora só é aplicada se o status ainda for o que foi verificado (mudanças simultâneas não se sobrepõem). A auditoria registra status anterior e resultante, data/hora e ator.
- **Encerramento (RB-42/OPEN-042):** identifica os candidatos ativos e registra quantos devem ser avisados (`activeCandidatesToNotify`). Como candidaturas só existem a partir da SPEC-011, a lista hoje é vazia; o envio do e-mail e a fila de tentativas pertencem à SPEC-017. O encerramento não depende do e-mail.
- Decisão mantida da SPEC-005 (27/10/2026): além do Recrutador, a conta da Empresa também altera o status das próprias vagas.

## Arquivos principais

- `src/lib/jobs/availability.ts`, `src/app/api/candidato/vagas/[id]/status/route.ts`
- `src/components/candidate/job-status-live.tsx`, `src/app/candidato/vagas/[id]/page.tsx`
- `src/app/api/vagas/[id]/acao/route.ts`

## Verificações

- Vitest: catálogo e prazo, API de status (autorização, rascunho, falha de leitura), aviso de mudança na tela, recusa a candidato e administrador, mudança simultânea, auditoria do encerramento.
- E2E: status lido pelo candidato, empresa pausa e o status lido em seguida é o atual, candidato não altera status, detalhe de vaga indisponível bloqueia a continuidade, auditoria com status anterior/resultante e ator, reabrir encerrada é recusado.
- Teste manual: `docs/operacao/validacao-manual-spec-009.md`.
