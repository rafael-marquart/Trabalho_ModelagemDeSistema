# UC-16 — Aprovar Solicitação ou Decisão Final

## Objetivo

Permitir que o recrutador ou responsável pelo processo avalie e confirme uma solicitação, vaga, acomodação ou etapa relevante, formalizando a decisão e atualizando o status do processo.

## Ator principal

- Recrutador.
- Gestor de seleção.

## Pré-condições

- O ator deve estar autenticado no sistema.
- A solicitação ou a etapa a ser aprovada deve existir e estar registrada no processo.
- O sistema deve apresentar o contexto completo da decisão para o responsável.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-15 (Exibir Resultado e Decisão da Vaga).
- Extensão (<<extend>>): UC-04 (Solicitar Acomodação no Processo Seletivo).
- Extensão (<<extend>>): UC-09 (Gerenciar Funil de Seleção).

## Fluxo Principal

1. O responsável acessa a tela de aprovação ou de decisão da solicitação.
2. O sistema exibe o contexto da situação, incluindo dados do candidato, da vaga, da etapa e da solicitação.
3. O responsável analisa as informações e escolhe a ação: aprovar, recusar ou propor ajuste.
4. O sistema registra a tomada de decisão e atualiza o status correspondente.
5. O sistema notifica o usuário afetado e registra o histórico da decisão.

## Exceções e Fluxos Alternativos

- EX01 (Solicitação fora do prazo): Se a solicitação ocorrer fora do prazo mínimo, o responsável pode aprovar com justificativa ou rejeitar.
- EX02 (Dados insuficientes): Se não houver informações suficientes para decidir, o sistema solicita complementação antes da aprovação.
- EX03 (Decisão já registrada): Se a solicitação já foi processada, o sistema informa o status atual e bloqueia nova decisão duplicada.

## Pós-condições

- A decisão é registrada com responsável, data e observações.
- O status do processo, da vaga ou da solicitação é atualizado.
- O candidato recebe notificação da resposta final.
- O histórico de aprovação fica disponível para auditoria.

## Regras de negócio relacionadas

- RB-35: Prazo mínimo para atendimento — solicitações fora do prazo podem exigir aprovação manual.
- RB-37: Registro de resposta — aprovação, recusa ou contraproposta devem gerar notificação.
- RB-41: Estados do funil — transições entre estados devem seguir regras válidas.
- RB-43: Auditoria de alterações — decisões devem ser versionadas com responsável e timestamp.
- RB-45: Confiança da seleção — somente decisões validadas podem avançar etapas críticas.

## Requisitos relacionados

- RF-27 — Notificações ao recrutador e candidato.
- RF-30 — Visibilidade para recrutadores.
- RF-31 — Notificações e rastreamento.
- RF-32 — SLA interno.
- RF-40 — Controle de acesso para gestão do processo.

## Critérios de aceitação

- O responsável consegue aprovar, recusar ou ajustar a solicitação ou decisão da vaga.
- A decisão fica registrada com histórico e responsável.
- O usuário afetado recebe comunicação clara sobre a resposta.
- O processo segue corretamente após a decisão final.

---
