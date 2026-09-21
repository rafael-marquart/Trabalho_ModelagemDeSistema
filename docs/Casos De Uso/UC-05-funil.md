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

- RB-37: Registro de resposta — recrutador deve registrar aceite, negativa ou contraproposta; resposta gera notificação ao candidato (aplicável também ao UC05).
- RB-40: Cancelamento de candidatura — candidato pode cancelar sua candidatura até um prazo definido antes de etapas críticas (por exemplo, 24 horas antes da entrevista), dependendo das regras da vaga.
- RB-41: Estados do funil — o sistema deve padronizar os estados do funil (Inscrito, Triagem, Selecionado para Entrevista, Entrevista Agendada, Finalizado, Rejeitado) e impedir transições inválidas.
- RB-42: Visibilidade de acomodações — confirmação/recusa de solicitações de acomodação deve ser claramente exibida no funil.
- RB-43: Auditoria de alterações — mudanças de status e cancelamentos devem ser versionadas e registradas com usuário e timestamp.
- RB-44: Notificação de vaga encerrada — quando a vaga é encerrada, candidatos em fase ativa recebem aviso e a vaga é removida do painel ativo.

## Requisitos relacionados

- RF-27 — Notificações ao recrutador e candidato (e-mail/SMS/alerta interno).
- RF-26 — Registro de candidatura (persistência e associação com o funil de seleção).
- RF-30 — Visibilidade para recrutadores (painel com gestão de solicitações e emissão de respostas).
- RF-31 — Notificações e rastreamento (notificar candidato sobre decisão e registrar timestamps).
- RF-12 — Gestão de sessão e tokens (garantir que apenas usuário autenticado veja o funil).
- RF-35 — Cancelamento de candidatura (função para alterar status por iniciativa do candidato, com regras de bloqueio temporal).

## Critérios de aceitação

- O candidato visualiza sua lista de candidaturas com o estado correto atualizado.
- O candidato recebe notificação quando uma acomodação é aceita/recusada pelo recrutador.
- Candidaturas canceladas pelo candidato são registradas e removidas/arquivadas do funil ativo conforme regras.

---