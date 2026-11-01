# SPEC-020 — Implementação da moderação de denúncias

## Escopo implementado

- **Só o Administrador da plataforma (RB-25):** novo item "Denúncias" no menu da administração. Conta da Empresa, Recrutador e candidato são recusados em todas as rotas de moderação.
- **Fila (OPEN-080):** em aberto, com prioridade alta primeiro e, entre as de mesma prioridade, as mais antigas; mostra a meta de 5 dias úteis (fins de semana descontados; feriados não) e destaca meta vencida e resposta da empresa recebida. Aba "Histórico (concluídas)" com a data de conclusão.
- **Detalhe (OPEN-078):** tipo, descrição, evidências, indicação de risco pelo denunciante, a avaliação vinculada (só as notas), a vaga e a acessibilidade declarada, os esclarecimentos da empresa e o histórico de moderação. A identidade do denunciante não aparece.
- **Passos:**
  1. "Assumir análise" (Recebida → Em análise; o denunciante é avisado).
  2. "Marcar/Remover prioridade alta".
  3. "Pedir informações à empresa" (Em análise → Aguardando informações): o Administrador escreve **os pontos** que a empresa deve responder e o **motivo da ampliação do prazo**; a empresa recebe só esses pontos e o denunciante é avisado da demora. A resposta da empresa volta a denúncia para Em análise.
  4. "Registrar decisão" (Em análise → Concluída): procedente, parcialmente procedente, improcedente ou inconclusiva (OPEN-079); justificativa resumida para o denunciante; justificativa para a empresa; e **medidas**, obrigatórias só quando procedente ou parcialmente procedente (improcedente e inconclusiva encerram sem penalidade). Denunciante e empresa são avisados.
- **Empresa denunciada (OPEN-077/081):** "Denúncias" no menu da empresa e do recrutador. Aparecem só as denúncias em que a moderação pediu informações ou que foram concluídas: tipo, vaga, os pontos da moderação, o formulário de resposta, e na conclusão a decisão, a justificativa e as medidas. Nunca o denunciante, o texto original nem as evidências.
- **Sem efeito automático (RB-44/45):** nenhum passo altera a vaga, avaliações ou a distribuição de estrelas; as medidas ficam registradas e comunicadas (OPEN-096).
- **Rastreabilidade:** cada passo grava um evento imutável (`ReportEvent`, protegido por gatilho no banco) com ator e data, e um evento de auditoria (`REPORT_ANALYSIS_STARTED`, `REPORT_PRIORITY_CHANGED`, `REPORT_INFO_REQUESTED`, `REPORT_COMPANY_RESPONDED`, `REPORT_CONCLUDED`). Mudanças de estado usam atualização condicional (a decisão de duas pessoas ao mesmo tempo não se sobrepõe).
- **Avisos (SPEC-017):** andamento e resultado para o denunciante; pedido de informações e conclusão para a conta da Empresa — no site e, se a pessoa quiser, por e-mail.

## Pontos em aberto

- **OPEN-096:** quais medidas podem ser executadas pela moderação (hoje só registradas e comunicadas).
- Os alertas de abuso das avaliações (`EVALUATION_ABUSE_SUSPECTED`, OPEN-095) ficam na auditoria; não há tela para eles nesta entrega.

## Arquivos principais

- `src/lib/reports/moderation-service.ts`
- `src/app/api/admin/denuncias/...`, `src/app/api/empresa/denuncias/...`
- Páginas `src/app/admin/denuncias/...`, `src/app/{empresa,recrutador}/denuncias/page.tsx`; componentes `src/components/reports/{moderation-queue,moderation-detail,company-reports}.tsx`

## Verificações

- Vitest: ordem da fila e meta vencida, início da análise uma vez com histórico/auditoria/aviso, pedido à empresa só com os pontos e aviso de demora, resposta só da empresa denunciada e só com pedido aberto, medidas obrigatórias apenas na procedência, decisão avisando as partes sem mandar a justificativa resumida à empresa, visão da empresa sem denunciante/descrição/evidências, visão do administrador sem identidade; telas (decisão com medidas condicionais, resposta da empresa, axe-core).
- E2E: empresa e candidato recusados na fila e nas ações, conclusão exigindo análise, início, prioridade, pedido validado, empresa vê os pontos e não o denunciante/texto/evidências, outra empresa não vê nem responde, resposta única, decisão procedente sem medidas recusada, conclusão, segunda decisão recusada, vaga e avaliação inalteradas, denunciante vê resultado e resumo (sem justificativa interna nem medidas), empresa vê justificativa e medidas, histórico completo e imutável, avisos às partes, páginas e bloqueio do candidato na área de moderação.
- Teste manual: `docs/operacao/validacao-manual-spec-019-020.md`.
