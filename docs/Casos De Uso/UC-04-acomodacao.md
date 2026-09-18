# UC-04 — Solicitar Acomodação no Processo Seletivo

## Objetivo

Registrar e encaminhar a solicitação de recursos de acessibilidade ou de adequação de condições de participação em etapas seletivas, garantindo que o candidato possa participar de forma justa e acessível.

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar autenticado no sistema.
- O candidato deve estar em candidatura ativa em uma vaga ou em processo seletivo em andamento.
- A etapa ou a seleção em que a acomodação será solicitada deve estar registrada no sistema.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC-03 (Candidatar-se a Vaga).
- Extensão (<<extend>>): UC-05 (Acompanhar Funil).

## Fluxo Principal

1. O candidato acessa a candidatura ou o painel de processo seletivo e seleciona a opção “Solicitar Acomodação”.
2. O sistema exibe um formulário com opções de necessidades de acessibilidade e recursos solicitados (por exemplo: intérprete de LIBRAS, tempo extra, ambiente adequado, tecnologia assistiva, entre outros).
3. O candidato descreve as necessidades específicas, informa a etapa afetada e, quando necessário, adiciona observações adicionais.
4. O sistema valida os dados preenchidos e associa a solicitação à candidatura ou ao processo seletivo correspondente.
5. O sistema registra a solicitação e informa ao candidato que a demanda foi enviada para análise do recrutador.
6. O sistema notifica o recrutador responsável para que avalie a necessidade e responda.

## Exceções e Fluxos Alternativos

- EX01 (Solicitação fora do prazo mínimo): Se a solicitação for enviada com menos de 24 horas de antecedência da etapa, o sistema emite alerta informando que a viabilização depende da aprovação do recrutador.
- EX02 (Campo obrigatório ausente): Se o candidato não preencher informações mínimas exigidas para a solicitação, o sistema bloqueia o envio e solicita correção.
- EX03 (Acomodação não viável): Se a necessidade solicitada não puder ser atendida por limitações técnicas ou operacionais, o sistema registra a resposta do recrutador e a comunica ao candidato.

## Pós-condições

- Solicitação registrada e vinculada à vaga ou ao processo seletivo.
- Recrutador recebe a demanda para análise e resposta.
- Histórico da solicitação e da decisão ficam disponíveis para auditoria e acompanhamento.
- Candidato recebe atualização sobre a decisão e, quando necessário, pode ajustar a solicitação.

## Regras de negócio relacionadas

- RB-35: Prazo mínimo para atendimento — solicitações com menos de 24 horas de antecedência podem ser avaliadas, mas dependem de aprovação do recrutador.
- RB-36: Priorização de solicitações — dificuldades confirmadas e necessidades críticas podem ter prioridade na organização da etapa.
- RB-37: Registro de resposta — o recrutador deve registrar aceite, recusa ou contraproposta, e a decisão deve gerar notificação ao candidato.
- RB-38: Documentação obrigatória — em alguns casos, pode ser exigida documentação complementar para validar a necessidade da acomodação.
- RB-39: Confidencialidade das solicitações — informações sensíveis sobre a necessidade de acessibilidade devem ser compartilhadas apenas com pessoas diretamente envolvidas no processo seletivo.

## Requisitos relacionados

- RF-29 — Formulário de solicitação de acomodação com campos padronizados e opcionais.
- RF-30 — Visibilidade do pedido para o recrutador e gestão da análise da solicitação.
- RF-31 — Notificações e rastreio do status da acomodação.
- RF-32 — Registro de prazo de resposta e SLA interno do recrutador.
- RF-33 — Upload de anexos e documentação complementar, quando exigido.
- RF-34 — Controle de acesso para quem pode visualizar e responder à solicitação.

## Critérios de aceitação

- O candidato consegue solicitar uma acomodação vinculada à sua candidatura ou etapa seletiva.
- O recrutador visualiza a solicitação e pode registrar uma resposta formal.
- Solicitações tardias são sinalizadas com alerta e, se aprovadas, precisam de validação manual.
- O sistema mantém histórico do pedido, da resposta e das alterações no status.

---
