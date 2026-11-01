# SPEC-011 — Implementação do registro de candidatura

## Escopo implementado

- **Modelo `Application` (CANDIDATURA):** candidato, vaga, etapa (`INSCRITO` ao registrar), data de inscrição gerada pelo banco, score (0 a 100, vazio quando a análise não pôde ser concluída) e referência ao resultado da SPEC-007 usado no registro (rastreabilidade). Etapas do funil conforme `docs/Fluxos e Estados/estados-trilha.md`.
- **Uma candidatura ativa por vaga (RB-14):** índice único parcial no banco (candidato + vaga, ignorando candidaturas recusadas ou canceladas), além da verificação no serviço. Duas tentativas simultâneas resultam em uma única candidatura.
- **Verificações no servidor, nesta ordem:** vaga encontrada e aberta (SPEC-009) → sem candidatura ativa → resultado da SPEC-007 sem trava crítica. Cada recusa tem código e mensagem próprios (`JOB_UNAVAILABLE`, `DUPLICATE`, `INCOMPATIBLE`).
- **Decisão do responsável (31/10/2026, revisa OPEN-048/049):** dados insuficientes não impedem a candidatura, só a trava crítica. A tela explica o que falta (perfil ou empresa) e, se a vaga não informou um recurso indispensável, avisa que a elegibilidade não foi concluída; a candidatura é registrada com score vazio, nunca presumido.
- **Sem registro parcial:** a vaga é relida dentro da transação; candidatura e evento de auditoria (`APPLICATION_SUBMITTED`, sem dados pessoais) são gravados juntos.
- **API:** `POST /api/candidato/candidaturas` com `{ jobId }` — candidato vem da sessão; origem verificada; corpo estrito.
- **Tela (detalhe da vaga):** "Candidatar-se" abre uma confirmação ("Confirme sua candidatura para … com o seu score atual … etapa Inscrito"); depois do registro aparece "Candidatura registrada" com data, etapa e score. Quem já se candidatou vê "Você já se candidatou", com data e etapa atual. A continuidade é bloqueada apenas por vaga não aberta, candidatura já existente ou trava crítica.
- **Integração com SPEC-005 e SPEC-009:** a trava de edição das condições da vaga após candidaturas (OPEN-022) e a identificação de candidatos ativos no encerramento (RB-42) passaram a usar as candidaturas reais. O encerramento mantém as candidaturas.
- **Depois do encerramento (decisão de 31/10/2026):** quem se candidatou continua vendo, no detalhe da vaga, o resultado de compatibilidade registrado na candidatura, com a data; vagas que não estão abertas não são recalculadas.
- **Ajustes de tela (31/10/2026):** no detalhe da vaga, "Informações gerais da empresa" fica recolhida (abre e fecha como uma pasta) e a caixa de candidatura passou para o final da página, depois das descrições.
- A retenção de 1 ano dos resultados de compatibilidade preserva os resultados usados por candidaturas.
- A notificação do registro e do encerramento pertence à SPEC-017; a lista "Minhas candidaturas" e o cancelamento, às SPEC-012/016.

## Arquivos principais

- `prisma/migrations/20261031210000_spec_011_applications/migration.sql`
- `src/lib/applications/{service,stages}.ts`, `src/lib/jobs/applications.ts`
- `src/app/api/candidato/candidaturas/route.ts`, `src/components/candidate/apply-panel.tsx`

## Verificações

- Vitest: registro completo e auditado; recusas por vaga indisponível, duplicidade e trava crítica sem criar registro; candidatura com dados insuficientes registrada com score vazio; vaga que fecha durante o registro; duplicidade simultânea; API (sessão, origem, corpo); tela (confirmação, sucesso, recusa).
- E2E: acessos recusados, rascunho, registro com etapa e score, vínculo com o resultado da SPEC-007, auditoria, duplicidade, detalhe "já se candidatou", trava de edição da vaga, encerramento identifica 1 candidato ativo e mantém a candidatura, vaga encerrada recusa nova candidatura.
- Teste manual: `docs/operacao/validacao-manual-spec-011.md`.
- Teste manual executado pelo responsável em 31/10/2026; layout aprovado na mesma data. SPEC-011 encerrada.

- Correção (01/11/2026): a migração `20261101070000_application_score_nullable` torna `Application.score` opcional também nos bancos que aplicaram a primeira versão da migração da SPEC-011 (o arquivo original foi editado depois de aplicado). A API de candidatura passa a responder com mensagem clara e registrar o erro no servidor em caso de falha inesperada.
