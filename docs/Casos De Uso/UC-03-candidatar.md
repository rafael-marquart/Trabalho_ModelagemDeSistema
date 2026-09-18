
# UC-03 — Candidatar-se a Vaga

## Objetivo

Registrar formalmente a candidatura em uma vaga elegível e disponibilizar o perfil profissional ao recrutador.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado e vaga com status "Ativa" aprovada na trava crítica (UC02).

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC04 (Solicitar Acomodação no Processo Seletivo).

## Fluxo Principal

1. O candidato seleciona uma vaga detalhada no catálogo de buscas (UC02).
2. O candidato clica no botão "Candidatar-se".
3. O sistema confirma a elegibilidade do candidato e vincula seu perfil ao funil de seleção da vaga.
4. O sistema exibe mensagem de confirmação da candidatura enviada.

## Exceções e Fluxos Alternativos

- EX01 (Candidatura Duplicada): Se o candidato tentar se inscrever em uma vaga para a qual já enviou candidatura, o sistema bloqueia a ação e exibe o status atual do processo.
- EX02 (Vaga Encerrada Durante o Processo): Se a vaga for desativada ou encerrada no momento do clique, o sistema cancela a operação e atualiza a interface.

## Pós-condições

- Registro de candidatura associado ao candidato e à vaga.
- Notificação ao recrutador sobre nova candidatura (conforme preferências de notificação).
- Histórico de candidaturas atualizado no perfil do candidato.

## Regras de negócio relacionadas

- RB-01: Limite de candidaturas — política de limite (por dia ou por vaga) quando aplicável.
- RB-09: Restrição de vaga incompatível — vagas incompatíveis não permitem candidatura através da trilha.
- RB-26: Validação de documentos na candidatura — anexos exigidos na candidatura devem ser validados.
- RB-33: Confirmação explícita — candidatura só é enviada após confirmação explícita do candidato.
- RB-34: Privacidade de perfil — informações sensíveis do candidato só são enviadas ao recrutador mediante consentimento e conforme necessidade.

## Requisitos relacionados

- RF-03 — Recuperação de senha (apenas se necessário no fluxo de candidatura enviado por usuário não logado — cenário raro).
- RF-10 — Visualização da vaga (botões de candidatura e indicação de elegibilidade).
- RF-26 — Registro de candidatura (persistência e associação com o funil de seleção).
- RF-19 — Upload seguro de documentos (quando anexos são solicitados na candidatura).
- RF-27 — Notificações ao recrutador e candidato (e-mail/SMS/alerta interno).
- RF-28 — Prevenção de candidaturas duplicadas (verificação prévia).

## Critérios de aceitação

- Ao candidatar-se, o sistema registra a candidatura e notifica o recrutador.
- Ação de candidatura bloqueada se o candidato já estiver inscrito; mensagem clara sobre status.
- Candidatura não é aceita para vagas encerradas ou desativadas no momento da tentativa.

---

# UC-04 — Solicitar Acomodação no Processo Seletivo

## Objetivo

Especificar adaptações ou recursos de acessibilidade necessários para a realização de etapas seletivas específicas (entrevistas, testes práticos).

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar em fluxo de candidatura (UC03) ou com processo seletivo ativo (UC05).

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): Estende o UC03 (Candidatar-se a Vaga) e o UC05 (Acompanhar Funil).

## Fluxo Principal

1. Durante a candidatura ou antes de uma etapa, o candidato ativa a opção "Solicitar Acomodação para a Seleção".
2. O candidato seleciona as necessidades específicas do evento (ex.: intérprete de LIBRAS na chamada, tempo adicional para teste escrito, software de leitura de tela configurado).
3. O candidato inclui observações técnicas adicionais, se necessário.
4. O sistema salva a solicitação e a vincula ao registro da candidatura para análise do recrutador (UC09).

## Exceções e Fluxos Alternativos

- EX01 (Solicitação Fora do Prazo Mínimo): Se o pedido for realizado com menos de 24 horas de antecedência da etapa agendada, o sistema emite um alerta informando que a viabilização dependerá da aprovação direta do recrutador.

## Pós-condições

- Solicitação registrada e visível ao recrutador no painel do processo seletivo.
- Histórico de solicitações e respostas armazenado para auditoria.

## Regras de negócio relacionadas

- RB-35: Prazo mínimo para atendimento — solicitar acomodação com menos de 24 horas pode ser aceito, mas depende de aprovação do recrutador.
- RB-36: Priorização de solicitações — solicitações presentes e comprovadas podem ter prioridade na organização da etapa (dependente do recrutador).
- RB-37: Registro de resposta — recrutador deve registrar aceite, negativa ou contraproposta; resposta gera notificação ao candidato.
- RB-38: Documentação obrigatória — para determinados recursos (por exemplo, auxílio de deslocamento), pode ser exigida documentação adicional.
- RB-39: Confidencialidade das solicitações — detalhes sensíveis sobre acomodação só são compartilhados com pessoas do processo seletivo diretamente envolvidas.

## Requisitos relacionados

- RF-29 — Formulário de solicitação de acomodação (campos padronizados e opcionais).
- RF-30 — Visibilidade para recrutadores (painel com gestão de solicitações e emissão de respostas).
- RF-31 — Notificações e rastreamento (notificar candidato sobre decisão e registrar timestamps).
- RF-32 — SLA interno (registro de tempo de resposta esperado do recrutador).
- RF-33 — Upload e anexos (quando for necessário comprovar a solicitação).
- RF-34 — Controle de acesso (quem pode ver e responder à solicitação dentro da organização recrutadora).

## Critérios de aceitação

- O candidato consegue enviar uma solicitação de acomodação vinculada à candidatura.
- Recrutador visualiza a solicitação e pode registrar decisão (aceitar/recusar/contrapropor).
- Solicitações fora do prazo mínimo são sinalizadas e ainda podem ser enviadas, com indicação de que dependem de aprovação manual.

---

## Observação

Posso abrir um pull request com este arquivo em `docs/casos-de-uso/UC-01-gerenciar-perfil-e-acomodacao.md` ou alterar um arquivo existente conforme preferir.