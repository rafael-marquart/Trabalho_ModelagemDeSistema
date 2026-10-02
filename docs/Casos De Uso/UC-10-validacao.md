# UC-10 — Validar Requisitos da Seleção

## Objetivo

Validar os requisitos exigidos para a etapa de seleção, garantindo que o recrutador possa decidir sobre o avanço do candidato com base em informações consistentes.

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
2. O sistema exibe os requisitos exigidos para a etapa, como formulários, critérios de elegibilidade ou itens solicitados no processo.
3. O recrutador valida se os requisitos esperados foram atendidos e se os dados estão completos e consistentes.
4. O sistema verifica se há pendências ou inconsistências nos requisitos.
5. O recrutador aprova, solicita complementação ou rejeita a candidatura conforme a validação.
6. O sistema registra a decisão, atualiza o status e notifica o candidato.

## Exceções e Fluxos Alternativos

- EX01 (Requisitos incompletos): Se o candidato não atender aos requisitos necessários, o sistema solicita a complementação e mantém a etapa em pendência.
- EX02 (Informação inválida): Se um item ou informação não atender ao padrão esperado, o sistema identifica o problema e informa a correção necessária.
- EX03 (Solicitação de acomodação pendente): Se houver solicitação de acomodação em análise, a validação pode aguardar a decisão do recrutador antes de avançar a etapa.

## Pós-condições

- A etapa de seleção é atualizada de acordo com a validação.
- O candidato recebe resposta sobre os requisitos e o status da etapa.
- O histórico da validação fica disponível para rastreio e auditoria.
- O funil de seleção permanece consistente com o processo realizado.

## Regras de negócio relacionadas

- RB-23
- RB-27
- RB-39
- RB-40
- RB-41
- RB-43

## Requisitos relacionados

- RF-30
- RF-31
- RF-35
- RF-38

## Critérios de aceitação

- O recrutador consegue validar os requisitos da etapa de seleção.
- O sistema sinaliza pendências e impedimentos de avanço quando necessário.
- O candidato recebe o retorno da validação com status claro.
- O histórico da decisão é mantido para rastreio e auditoria.
