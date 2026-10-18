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
4. O sistema apresenta informações relevantes da candidatura, incluindo perfil e status.
5. O recrutador decide a próxima etapa ou a decisão final e solicita a alteração.
6. O sistema valida a autorização do recrutador, se a transição está prevista na RB-39 e se existem pendências impeditivas conhecidas para o avanço.
7. Se a transição for válida e não houver pendência impeditiva, o sistema atualiza o status da candidatura, registra o histórico da ação e notifica o candidato. Caso contrário, recusa a mudança sem alterar a etapa.

## Exceções e Fluxos Alternativos

- EX01 (Candidatura com pendências): Se houver pendência impeditiva para o avanço, o sistema não altera a etapa. O recrutador pode solicitar complementação das informações necessárias antes de tentar avançar novamente.
- EX03 (Vaga encerrada): Se a vaga for encerrada ou desativada, o recrutador não consegue mover candidatos para etapas posteriores sem registrar a justificativa.

## Pós-condições

- O status da candidatura é atualizado no funil de seleção.
- O histórico da movimentação fica registrado para auditoria.
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
- Alterações de status são registradas no histórico para rastreabilidade.
- Candidatos recebem notificações sobre mudanças de fase e decisões relevantes.
