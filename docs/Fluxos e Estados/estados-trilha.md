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
