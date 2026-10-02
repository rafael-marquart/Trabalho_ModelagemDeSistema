# UC-05 — Acompanhar Funil de Candidaturas

## Objetivo

Permitir ao candidato acompanhar suas candidaturas, etapas, status e decisões relacionadas às acomodações.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- Existe candidatura registrada.

## Fluxo Principal

1. O candidato acessa “Minhas Candidaturas”.
2. O sistema apresenta as candidaturas e o estado atual de cada processo.
3. O candidato seleciona uma candidatura para consultar sua linha do tempo.
4. O sistema apresenta alterações de status, decisões e informações de acomodação autorizadas.
5. O sistema permite cancelar a candidatura quando as regras do processo permitirem.

## Exceções

- EX01: vaga encerrada é apresentada com o novo status e impede novas ações incompatíveis.
- EX02: candidatura cancelada permanece no histórico conforme as regras aplicáveis.

## Pós-condições

- O candidato visualiza o estado atualizado de suas candidaturas.
- Alterações relevantes permanecem registradas.

## Regras de negócio relacionadas

- RB-23 — Transparência de status.
- RB-27 — Histórico de alterações.
- RB-36 — Cancelamento de candidatura.
- RB-38 — Estados do funil.
- RB-39 — Transições válidas do funil.
- RB-40 — Visibilidade das acomodações.
- RB-41 — Auditoria das alterações.
- RB-42 — Vaga encerrada.

## Requisitos relacionados

- RF-11 — Minhas candidaturas.
- RF-27 — Notificações do processo seletivo.
- RF-31 — Acompanhamento do processo seletivo.
- RF-33 — Histórico das acomodações.
- RF-34 — Cancelamento de candidatura.

## Critérios de aceitação

- O candidato visualiza candidaturas e estados atualizados.
- Alterações relevantes são comunicadas conforme as regras.
- Cancelamento respeita as regras do processo.
- Histórico permanece disponível para rastreabilidade.
