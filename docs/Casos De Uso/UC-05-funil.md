# UC-05 — Acompanhar Funil de Candidaturas

## Objetivo

Permitir ao candidato consultar suas próprias candidaturas, acompanhar etapas, status e histórico disponível do processo seletivo e cancelar a própria candidatura conforme as regras aplicáveis.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- Existe candidatura registrada.

## Fluxo Principal

1. O candidato acessa “Minhas Candidaturas”.
2. O sistema apresenta as candidaturas e o estado atual de cada processo.
3. O candidato seleciona uma candidatura para consultar sua linha do tempo.
4. O sistema apresenta a linha do tempo com os tipos de evento “Candidatura realizada”, “Status” e “Candidatura cancelada”, quando aplicáveis. O tipo “Status” pode representar estados gerais como “Em andamento”, “Entrevista” e “Aprovado”. Cada evento apresenta a data, sem exigir horário, uma descrição breve e compreensível e o status ou etapa resultante, quando aplicável. Os eventos são exibidos do mais recente para o mais antigo. O histórico exibido limita-se à própria candidatura do candidato e não expõe dados de terceiros nem informações internas não destinadas ao acompanhamento.
5. O sistema permite ao candidato cancelar a própria candidatura após confirmação, somente nos estados `Inscrita`, `Triagem`, `Entrevista` ou `Finalista`, desde que a vaga não esteja encerrada nem bloqueada de forma que impeça o cancelamento.
6. Após confirmação e validação, o sistema registra o cancelamento, preserva o histórico e notifica o recrutador responsável. Se a candidatura estiver em `Contratado`, `Recusada` ou já cancelada, ou se a vaga estiver encerrada/bloqueada de forma impeditiva, o sistema recusa a operação sem alterar o estado.

## Exceções

- EX01: vaga encerrada é apresentada com o novo status e impede novas ações incompatíveis.
- EX02: candidatura cancelada permanece disponível no histórico por 60 dias após o cancelamento; depois desse prazo, deixa de ser exibida no acompanhamento do candidato.
- EX03: após o encerramento da vaga, o histórico permanece disponível ao candidato por 60 dias a partir do encerramento; depois desse prazo, deixa de ser exibido no acompanhamento. A retenção dos registros técnicos de auditoria é independente.
- EX04: tentativa de cancelar candidatura em estado final (`Contratado`, `Recusada` ou já cancelada), ou associada a vaga encerrada/bloqueada de forma impeditiva, é recusada sem alteração.

## Pós-condições

- O candidato visualiza o estado atualizado de suas candidaturas.
- Alterações relevantes permanecem registradas.
- O histórico funcional apresentado ao candidato não substitui a auditoria técnica, cuja retenção é independente.

## Regras de negócio relacionadas

- RB-23 — Transparência de status.
- RB-27 — Histórico de alterações.
- RB-36 — Cancelamento de candidatura.
- RB-38 — Estados do funil.
- RB-39 — Transições válidas do funil.
- RB-41 — Auditoria das alterações.
- RB-42 — Vaga encerrada.

## Escopo de gestão da candidatura (RF-28)

As operações disponíveis ao candidato são consultar suas próprias candidaturas, acompanhar status/etapas e histórico disponível e cancelar a própria candidatura nas condições definidas neste caso de uso. Editar uma candidatura já enviada, excluir seu registro ou alterar etapas do processo seletivo não fazem parte deste escopo.

## Requisitos relacionados

- RF-11 — Minhas candidaturas.
- RF-28 — Gestão da candidatura pelo candidato.
- RF-27 — Notificações do processo seletivo.
- RF-31 — Acompanhamento do processo seletivo.
- RF-34 — Cancelamento de candidatura.

## Critérios de aceitação

- O candidato visualiza candidaturas e estados atualizados.
- Alterações relevantes são comunicadas conforme as regras.
- O candidato pode cancelar a própria candidatura nos estados `Inscrita`, `Triagem`, `Entrevista` ou `Finalista`, após confirmação e se a vaga não estiver encerrada nem bloqueada de forma impeditiva.
- Candidaturas `Contratado`, `Recusada` ou já canceladas não podem ser canceladas novamente; a recusa não altera o estado.
- Cancelamento confirmado preserva o histórico e notifica o recrutador responsável.
- A linha do tempo apresenta eventos aplicáveis com data, descrição breve e status/etapa resultante quando aplicável, em ordem do mais recente para o mais antigo.
- O histórico apresentado contém somente informações destinadas ao acompanhamento da própria candidatura; a auditoria técnica mantém retenção independente.
