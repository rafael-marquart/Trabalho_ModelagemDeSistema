# UC-03 — Candidatar-se a Vaga

## Objetivo

Registrar candidatura em vaga elegível.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- Vaga disponível, não bloqueada e compatível com necessidades obrigatórias.

## Fluxo Principal

1. Candidato seleciona vaga elegível.
2. Solicita candidatura.
3. Sistema verifica elegibilidade e candidatura ativa existente.
4. Sistema confirma que o score determinístico está calculado.
5. Sistema registra a candidatura com estado inicial `Inscrita` e data de inscrição gerada pelo sistema, somente quando todas as condições forem atendidas.
6. Sistema comunica os usuários envolvidos conforme regras de notificação.

## Exceções

- EX01: candidatura ativa duplicada é impedida.
- EX02: vaga encerrada ou bloqueada impede candidatura.
- EX03: barreira crítica impede candidatura independentemente do score.
- EX04: score determinístico indisponível impede o registro da candidatura.

## Pós-condições

- Candidatura registrada com estado inicial `Inscrita`, data de inscrição gerada pelo sistema e score determinístico disponível.
- Histórico atualizado.
- Notificações emitidas conforme regras aplicáveis.

## Regras de negócio relacionadas

- RB-01 — Elegibilidade para candidatura.
- RB-14 — Uma candidatura ativa por vaga.
- RB-15 — Barreira crítica prevalece sobre a pontuação.
- RB-34 — Candidatura somente em vaga elegível.
- RB-36 — Cancelamento de candidatura.

## Requisitos relacionados

- RF-26 — Registro de candidatura.
- RF-28 — Gestão da candidatura pelo candidato.
- RF-27 — Notificações do processo seletivo.

## Critérios de aceitação

- Candidatura somente em vaga elegível.
- Segunda candidatura ativa para a mesma vaga é impedida.
- Vaga encerrada, bloqueada ou incompatível não aceita candidatura.
