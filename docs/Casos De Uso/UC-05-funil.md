# UC-05 — Acompanhar Funil de Candidaturas

## Objetivo

Monitorar em tempo real a evolução de suas candidaturas, visualizar confirmações de acomodações solicitadas e acessar detalhes de agendamentos.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado com pelo menos uma candidatura ativa.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): FA01 (Cancelar Candidatura), FA02 (Visualizar Agendamento), EX01 (Alerta de Vaga Encerrada).

## Fluxo Principal

1. O candidato acessa a área "Minhas Candidaturas".
2. O sistema exibe o painel consolidado com a lista de vagas e a etapa atual de cada processo (Inscrito, Triagem, Entrevista Agendada, Finalizado).
3. O candidato seleciona um item para visualizar a linha do tempo detalhada e o status do aceite da sua solicitação de acomodação (UC04).

## Exceções e Fluxos Alternativos

- FA01 (Cancelar Candidatura): O candidato opta por desistir do processo seletivo, alterando o status da inscrição e liberando sua participação.
- FA02 (Visualizar Detalhes do Agendamento): Quando o status for Entrevista Agendada, o candidato acessa local, horário e recursos confirmados (UC10).
- EX01 (Vaga Cancelada pela Empresa): O sistema sinaliza quando uma oportunidade foi encerrada precocemente pela empresa.

## Pós-condições

- Status das candidaturas atualizado no painel do candidato.
- Notificações geradas para o candidato sobre alterações críticas (cancelamento, reagendamento, resposta à solicitação de acomodação).

## Regras de negócio relacionadas

- RB-23
- RB-27
- RB-36
- RB-38
- RB-39
- RB-40
- RB-42

## Requisitos relacionados

- RF-11
- RF-27
- RF-31
- RF-34
- RF-33

## Critérios de aceitação

- O candidato visualiza sua lista de candidaturas com o estado correto atualizado.
- O candidato recebe notificação quando uma acomodação é aceita/recusada pelo recrutador.
- Candidaturas canceladas pelo candidato são registradas e removidas/arquivadas do funil ativo conforme regras.

---