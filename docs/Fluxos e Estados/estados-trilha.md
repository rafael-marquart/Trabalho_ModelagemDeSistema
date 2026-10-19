# Estado da trilha de vagas compatíveis

## Objetivo

Descrever o fluxo de processamento e apresentação das vagas compatíveis, complementando UC-02 e UC-13.

## Pré-condições

- Candidato autenticado.
- Perfil com informações mínimas.
- Existem vagas cadastradas ou importadas para análise.

## Fluxo principal

1. O sistema recupera necessidades obrigatórias, perfil técnico, localização e modalidade.
2. Consulta vagas disponíveis e não bloqueadas.
3. Verifica informações de acessibilidade.
4. Elimina vagas com barreira incompatível.
5. Para vagas elegíveis, calcula 50% acessibilidade, 30% perfil técnico e 20% distância/modalidade.
6. Apresenta resultados e principais fatores considerados.
7. O candidato pode consultar a vaga e iniciar candidatura elegível.

## Fluxos alternativos

### A1 — Vaga externa
A vaga é identificada, estruturada e validada antes da análise; dados de LLM somente são usados após validação.

### A2 — Barreira incompatível
A vaga é considerada incompatível e não é recomendada nem candidata.

### A3 — Acessibilidade não informada
A ausência de informação necessária é tratada como não informada, sem assumir compatibilidade.

### A4 — Nenhuma vaga compatível
O sistema informa o resultado e permite nova busca com filtros não obrigatórios.

## Regras de negócio relacionadas

- RB-02, RB-03, RB-04, RB-05, RB-06.
- RB-10, RB-11, RB-13, RB-15, RB-16, RB-17, RB-30.

## Requisitos relacionados

- RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-24, RF-25.


## Estados do funil de seleção

Os estados padronizados do funil de seleção são:

1. **Inscrito** — candidatura registrada para a vaga.
2. **Triagem** — candidatura em avaliação inicial.
3. **Entrevista** — candidato em etapa de entrevista.
4. **Finalista** — candidato selecionado para a etapa final do processo.
5. **Contratado** — decisão final de contratação registrada.
6. **Recusado** — candidatura encerrada sem contratação.

### Transições válidas

- Inscrito → Triagem.
- Triagem → Entrevista.
- Triagem → Recusado.
- Entrevista → Finalista.
- Entrevista → Recusado.
- Finalista → Contratado.
- Finalista → Recusado.

O sistema deve impedir transições que não estejam previstas nesse conjunto.

### Condições formais para avanço

Antes de alterar a etapa da candidatura, o sistema deve validar:

1. **Autorização:** o Recrutador está autenticado e autorizado a gerenciar a vaga e suas candidaturas.
2. **Transição permitida:** a mudança solicitada pertence ao conjunto de transições válidas listado acima, conforme RB-39.
3. **Pendências impeditivas:** não há pendências conhecidas que impeçam o avanço. Se houver, a etapa permanece inalterada e o Recrutador pode solicitar complementação das informações necessárias, conforme UC-09.
4. **Rastreabilidade:** quando a transição for válida, a etapa é atualizada e a movimentação é registrada conforme RB-27, RB-37 e RB-41. O histórico registra etapa anterior e resultante, data e hora, ator responsável e tipo de movimentação/decisão; a justificativa é registrada quando exigida pelo fluxo ou regra aplicável.

O histórico preserva eventos anteriores, sem exclusão silenciosa. Não são permitidas reversões fora das transições previstas na RB-39; alterações futuras do fluxo dependem de aprovação explícita do projeto e atualização dos artefatos afetados. O Recrutador acessa somente os dados necessários à candidatura e à vaga sob sua responsabilidade; informações de acessibilidade são limitadas à necessidade do processo, sem acesso a laudos médicos ou a candidaturas de outras Empresas. A etapa não amplia automaticamente as permissões.

Não são definidos critérios específicos adicionais por etapa, notas mínimas ou documentos obrigatórios sem decisão explícita do projeto.

## Regras relacionadas ao funil

- RB-38 — Estados do funil.
- RB-39 — Transições válidas do funil.
