# UC-09 — Gerenciar Funil de Seleção

## Objetivo

Permitir que o recrutador acompanhe, avalie e gerencie candidaturas dentro do funil de seleção, definindo a etapa atual de cada candidato, emitindo decisões e mantendo o processo organizado e auditável.

## Ator principal

- Recrutador autorizado.

## Pré-condições

- O recrutador deve estar autenticado no sistema.
- A vaga deve estar cadastrada e ativa.
- Há pelo menos uma candidatura associada à vaga ou ao processo seletivo.

## Relação com outros casos de uso

- UC-09 é o caso de uso de referência para gestão do funil pelo Recrutador autorizado e está associado à SPEC-013.
- UC-05 — Acompanhar Funil de Candidaturas é voltado ao candidato para consultar as próprias candidaturas e acompanhar status/histórico. É um caso de uso distinto, não incluído por UC-09.

## Fluxo Principal

1. O recrutador acessa o painel do funil da vaga.
2. O sistema exibe as candidaturas agrupadas por etapa (Inscrito, Triagem, Entrevista, Finalista, Contratado, Recusado).
3. O recrutador seleciona uma candidatura para avaliar os dados do candidato e o histórico do processo.
4. O sistema apresenta somente os dados da candidatura necessários à vaga e ao processo sob responsabilidade do Recrutador, conforme RB-26. Informações de acessibilidade são exibidas apenas na medida necessária à avaliação de compatibilidade e à viabilização da acessibilidade; laudos médicos e candidaturas de outras Empresas não são disponibilizados. A etapa do processo não amplia automaticamente as permissões.
5. O recrutador decide a próxima etapa ou a decisão final e solicita a alteração.
6. O sistema valida a autorização do recrutador, se a transição está prevista na RB-39 e se existem pendências impeditivas conhecidas para o avanço.
7. Se a transição for válida e não houver pendência impeditiva, o sistema atualiza o status da candidatura e registra no histórico a etapa anterior e a resultante, data e hora, ator responsável e tipo de movimentação/decisão, incluindo justificativa quando exigida pelo fluxo ou regra aplicável; em seguida, notifica o candidato. Caso contrário, recusa a mudança sem alterar a etapa ou registrar uma transição concluída.

## Exceções e Fluxos Alternativos

- EX01 (Candidatura com pendências): Se houver pendência impeditiva para o avanço, o sistema não altera a etapa. O recrutador pode solicitar complementação das informações necessárias antes de tentar avançar novamente.
- EX03 (Vaga encerrada): Se a vaga for encerrada ou desativada, o recrutador não consegue mover candidatos para etapas posteriores sem registrar a justificativa.

## Pós-condições

- O status da candidatura é atualizado no funil de seleção.
- O histórico da movimentação fica registrado para auditoria, preservando eventos anteriores sem exclusão silenciosa.
- Não são permitidas reversões fora das transições previstas na RB-39; alterações futuras do fluxo exigem aprovação explícita do projeto.
- O candidato recebe notificação sobre a decisão ou etapa atual.
- A vaga permanece organizada e rastreável pelo Recrutador autorizado.

## Regras de negócio relacionadas

- RB-23
- RB-27
- RB-37
- RB-38
- RB-39
- RB-41
- RB-42
- RB-43

## Requisitos relacionados

- RF-20
- RF-30
- RF-35
- RF-38
- RF-40

## Critérios de aceitação

- O recrutador autorizado consegue visualizar as candidaturas vinculadas às vagas sob sua autorização e solicitar movimentação entre etapas.
- O sistema valida autorização, transição prevista na RB-39 e ausência de pendências impeditivas conhecidas antes de avançar.
- Transição não autorizada, inválida ou impedida por pendências não altera a etapa.
- Alterações de status são registradas com etapa anterior e resultante, data e hora, ator responsável e tipo de movimentação/decisão; a justificativa é registrada quando exigida.
- O histórico preserva eventos anteriores e não permite reversões fora da RB-39.
- O Recrutador não recebe dados além dos necessários à candidatura e à vaga sob sua responsabilidade, nem laudos médicos ou candidaturas de outras Empresas.
- Candidatos recebem notificações sobre mudanças de fase e decisões relevantes.
