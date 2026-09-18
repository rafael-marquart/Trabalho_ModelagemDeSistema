# UC-10 — Validar Documentação e Requisitos da Seleção

## Objetivo

Validar a documentação e os requisitos exigidos para a etapa de seleção, garantindo que o candidato esteja apto para avançar no processo, que os documentos estejam corretos e que o recrutador possa tomar a decisão com base em informações consistentes.

## Ator principal

- Recrutador.

## Pré-condições

- O recrutador deve estar autenticado no sistema.
- O processo seletivo ou a etapa de avaliação deve estar ativa.
- A candidatura deve estar associada a uma vaga ou etapa em andamento.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-09 (Gerenciar Funil de Seleção).
- Extensão (<<extend>>): UC-04 (Solicitar Acomodação no Processo Seletivo).

## Fluxo Principal

1. O recrutador acessa a avaliação da candidatura ou da etapa de seleção.
2. O sistema exibe os requisitos exigidos para a etapa, como documentos, formulários ou critérios de elegibilidade.
3. O recrutador valida se o candidato enviou os itens esperados e se os dados estão completos e consistentes.
4. O sistema verifica se há pendências, inconsistências ou ausência de documentos.
5. O recrutador aprova, solicita complementação ou rejeita a candidatura conforme a validação.
6. O sistema registra a decisão, atualiza o status e notifica o candidato.

## Exceções e Fluxos Alternativos

- EX01 (Documentação incompleta): Se o candidato não enviou os documentos necessários, o sistema solicita a complementação e mantém a etapa em pendência.
- EX02 (Documento inválido): Se o documento enviado não atender ao padrão esperado, o sistema identifica o problema e informa a correção necessária.
- EX03 (Solicitação de acomodação pendente): Se houver reclamação ou necessidade de acomodação em análise, a validação pode aguardar a decisão do recrutador antes de avançar a etapa.

## Pós-condições

- A etapa de seleção é atualizada de acordo com a validação.
- O candidato recebe resposta sobre a documentação e o status da etapa.
- O histórico da validação fica disponível para rastreio e auditoria.
- O funil de seleção permanece consistente com o processo realizado.

## Regras de negócio relacionadas

- RB-26: Validação de documentos na candidatura — anexos exigidos na candidatura devem ser validados.
- RB-37: Registro de resposta — respostas sobre acolhimento de acomodação devem ser registradas.
- RB-41: Estados do funil — o sistema deve padronizar os estados e impedir transições inválidas.
- RB-43: Auditoria de alterações — mudanças de status e validação devem ser registradas com usuário e timestamp.
- RB-45: Confiança da seleção — somente candidatos com documentação validada podem ser avançados para etapas críticas.

## Requisitos relacionados

- RF-19 — Upload seguro de documentos.
- RF-26 — Registro de candidatura.
- RF-27 — Notificações ao recrutador e candidato.
- RF-30 — Visibilidade para recrutadores.
- RF-31 — Notificações e rastreamento.
- RF-40 — Controle de acesso para gestão do processo.

## Critérios de aceitação

- O recrutador consegue validar documentos e requisitos da etapa de seleção.
- O sistema sinaliza pendências e impedimentos de avanço quando necessário.
- O candidato recebe o retorno da validação com status claro.
- O histórico da decisão é mantido para rastreio e auditoria.

---
