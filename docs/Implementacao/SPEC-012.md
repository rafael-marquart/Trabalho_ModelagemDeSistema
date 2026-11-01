# SPEC-012 — Implementação do gerenciamento da candidatura pelo candidato

Implementada junto com a SPEC-016 (acompanhamento), que usa as mesmas telas; ver também `docs/Implementacao/SPEC-016.md`.

## Escopo implementado

- **Minhas candidaturas** (`/candidato/candidaturas`, novo item do menu do candidato, conforme D-02): lista somente as candidaturas do candidato da sessão, da mais recente para a mais antiga, com empresa, cargo, data de envio e estado atual — inclusive **Cancelada** (em cinza) e Recusada (em vermelho). Busca por cargo ou empresa e filtro por status apenas reduzem a lista na tela.
- **Detalhe da candidatura** (`/candidato/candidaturas/[id]`): vaga, data de inscrição e situação atual separadas do histórico; a linha do tempo é da SPEC-016. Candidatura de outra pessoa responde como inexistente (404), sem revelar dados.
- **Cancelar candidatura (RB-36, OPEN-050):** a seção aparece só no detalhe, quando a etapa é Inscrito, Triagem, Entrevista ou Finalista com a vaga aberta, ou Inscrito, Triagem ou Entrevista com a vaga encerrada (revisão de 01/11/2026). Abre uma confirmação explícita ("Voltar" ou Esc não alteram nada). O servidor confere de novo titularidade, etapa e situação da vaga; a etapa só muda se ainda for a que foi lida (atualização condicional). Etapa `Cancelada`, evento `CANCELLED` no histórico (ator: o próprio candidato) e auditoria `APPLICATION_CANCELLED` são gravados na mesma transação. Contratado, Recusada, Cancelada ou Finalista com a vaga encerrada são recusados sem alteração.
- **Resultado do cancelamento:** a página volta ao detalhe com o aviso "Candidatura cancelada", estado Cancelada em cinza e sem botão de cancelar. A candidatura continua em Minhas candidaturas e libera uma nova candidatura à mesma vaga (o índice de candidatura ativa já desconsiderava Cancelada).
- No detalhe da vaga, a caixa "Você já se candidatou" e a confirmação de candidatura levam a "Acompanhar minha candidatura".
- A empresa vê o cancelamento no histórico do funil ("Cancelada pelo candidato") e na contagem da etapa Cancelada (SPEC-013).

## Interpretações registradas

- **"Vaga bloqueada de forma que impeça o cancelamento":** não há bloqueio desse tipo definido. Vaga pausada ou com prazo de inscrição vencido não impede o cancelamento, porque o processo seletivo continua.
- **Vaga encerrada (decisão do responsável em 01/11/2026, revisando OPEN-050):** a Empresa pode continuar o funil depois de encerrar a vaga, então o candidato ainda pode cancelar se estiver em Inscrito, Triagem ou Entrevista; em Finalista, o cancelamento só é aceito com a vaga aberta.
- A notificação do cancelamento ao recrutador depende da SPEC-017; o evento e a auditoria já ficam disponíveis para ela.

## Arquivos principais

- `src/lib/applications/candidate-service.ts` (lista, detalhe, linha do tempo, regra dos 60 dias, cancelamento)
- `src/app/api/candidato/candidaturas/route.ts` (GET), `src/app/api/candidato/candidaturas/[id]/route.ts`, `src/app/api/candidato/candidaturas/[id]/cancelar/route.ts`
- `src/app/candidato/candidaturas/page.tsx`, `src/app/candidato/candidaturas/[id]/page.tsx`
- `src/components/candidate/{my-applications,cancel-application,application-format}.tsx|ts`

## Verificações

- Vitest: lista restrita ao candidato, regra dos 60 dias, linha do tempo sem ator nem observação interna, detalhe só do dono, motivos de recusa do cancelamento, cancelamento com atualização condicional + histórico + auditoria, recusas sem escrita; telas (filtros, confirmação, voltar sem alterar, resultado, mensagem de recusa, axe-core).
- E2E: lista e detalhe do candidato, empresa e anônimo recusados, observação interna não exposta, origem externa recusada, cancelamento registrado com histórico preservado e auditado, novo cancelamento recusado, tela de resultado sem botão, nova candidatura liberada, funil continuado após o encerramento e cancelamento em Entrevista com a vaga encerrada.
- Teste manual: `docs/operacao/validacao-manual-spec-012-016.md`.
- Teste manual executado pelo responsável em 01/11/2026; único ajuste pedido (cancelar com a vaga encerrada até Entrevista) aplicado no mesmo dia. Layout aprovado na mesma data. SPEC-012 encerrada; a notificação do cancelamento segue para a SPEC-017.
- Decisão de 01/11/2026 (OPEN-065 revisada): candidaturas Recusadas ou Canceladas podem ser removidas da lista pelo candidato antes dos 60 dias (apenas ocultadas; nada é apagado). Implementado com a SPEC-017; ver `docs/Implementacao/SPEC-017.md`.
