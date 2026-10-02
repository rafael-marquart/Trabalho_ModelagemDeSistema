# UC-09 — Gerenciar Funil de Seleção

## Objetivo

Permitir que o recrutador acompanhe, avalie e gerencie candidaturas dentro do funil de seleção, definindo a etapa atual de cada candidato, emitindo decisões e mantendo o processo organizado e auditável.

## Ator principal

- Recrutador.

## Pré-condições

- O recrutador deve estar autenticado no sistema.
- A vaga deve estar cadastrada e ativa.
- Há pelo menos uma candidatura associada à vaga ou ao processo seletivo.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-05 (Acompanhar Funil de Candidaturas).
- Extensão (<<extend>>): UC-04 (Solicitar Acomodação no Processo Seletivo).

## Fluxo Principal

1. O recrutador acessa o painel do funil da vaga.
2. O sistema exibe as candidaturas agrupadas por etapa (inscrito, triagem, entrevista, finalista, contratado, recusado).
3. O recrutador seleciona uma candidatura para avaliar os dados do candidato e o histórico do processo.
4. O sistema apresenta informações relevantes da candidatura, incluindo perfil, status, documentação e solicitações de acomodação.
5. O recrutador decide a próxima etapa ou a decisão final e salva a alteração.
6. O sistema atualiza o status da candidatura, registra o histórico da ação e notifica o candidato.

## Exceções e Fluxos Alternativos

- EX01 (Candidatura sem dados completos): Se a candidatura estiver incompleta, o recrutador pode solicitar documentação adicional antes de avançar o candidato.
- EX02 (Candidato com acomodação pendente): Se o candidato tiver uma solicitação de acomodação em análise, o processo pode ser mantido em espera até a decisão do recrutador.
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
- RB-40
- RB-41
- RB-42
- RB-43

## Requisitos relacionados

- RF-20
- RF-30
- RF-32
- RF-35
- RF-38
- RF-40

## Critérios de aceitação

- O recrutador consegue visualizar todas as candidaturas vinculadas à vaga e movimentá-las entre etapas.
- Alterações de status são registradas no histórico com data, responsável e justificativa.
- Candidatos recebem notificações sobre mudanças de fase e decisões relevantes.
- Solicitações de acomodação impactam o andamento do processo conforme a regra de decisão do recrutador.

---
