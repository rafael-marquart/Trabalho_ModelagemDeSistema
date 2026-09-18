# UC-01 — Gerar trilha de vagas compatíveis

## Objetivo

Permitir que o candidato consulte uma trilha de vagas compatíveis com suas necessidades funcionais de acessibilidade, seu perfil técnico, sua localização e sua modalidade de trabalho preferida.

## Atores

- **Ator principal:** candidato.
- **Atores secundários:** sistema de compatibilidade e base de vagas.

## Pré-condições

- O candidato está autenticado na plataforma.
- O perfil do candidato possui suas necessidades funcionais e informações profissionais.
- Existem vagas cadastradas ou importadas para análise.

## Fluxo principal

1. O candidato acessa a área de busca ou recomendações de vagas.
2. O sistema recupera as necessidades funcionais obrigatórias, formação, competências, idiomas, localização e preferência de modalidade do candidato.
3. O sistema consulta as vagas disponíveis e não bloqueadas.
4. O sistema compara as necessidades obrigatórias do candidato com as informações de acessibilidade de cada vaga.
5. O sistema elimina da trilha as vagas que possuem barreiras incompatíveis.
6. Para as vagas compatíveis, o sistema calcula o resultado considerando:
   - 50% para acessibilidade;
   - 30% para perfil técnico;
   - 20% para distância e modalidade.
7. O sistema ordena as vagas pelo resultado de compatibilidade.
8. O sistema apresenta a trilha ao candidato, incluindo acessibilidade, requisitos técnicos, modalidade e localização.
9. O candidato consulta os detalhes de uma vaga e pode iniciar uma candidatura.

## Fluxos alternativos

### A1 — Vaga externa

1. O sistema identifica que a vaga foi obtida de uma fonte externa.
2. A vaga é identificada como externa e tem suas informações estruturadas.
3. Caso tenha sido utilizada inteligência artificial na extração, os dados são validados antes do cálculo de compatibilidade.
4. O fluxo retorna à análise de acessibilidade da vaga.

### A2 — Barreira incompatível

1. O sistema identifica uma barreira incompatível com uma necessidade obrigatória do candidato.
2. A vaga é considerada incompatível.
3. A vaga não é recomendada e o candidato não pode se candidatar por meio da trilha.
4. O sistema continua a análise da próxima vaga.

### A3 — Nenhuma vaga compatível

1. O sistema conclui a análise sem encontrar vagas compatíveis.
2. O sistema informa o resultado ao candidato.
3. O candidato pode ajustar filtros não obrigatórios e realizar uma nova busca.

## Pós-condições

- A trilha apresenta somente vagas aprovadas na análise de compatibilidade.
- As informações de acessibilidade são exibidas antes da candidatura.
- Vagas incompatíveis ou bloqueadas não podem receber candidatura.

## Regras de negócio relacionadas

- **RB-01:** Limite de candidaturas.
- **RB-02:** Trava de acessibilidade.
- **RB-03:** Peso da acessibilidade.
- **RB-04:** Peso do perfil técnico.
- **RB-05:** Peso de distância e modalidade.
- **RB-06:** Necessidades obrigatórias.
- **RB-07:** Perfil técnico.
- **RB-10:** Vagas externas.
- **RB-11:** Validação da IA.
- **RB-13:** Transparência.

## Requisitos relacionados

- RF-04 — Cadastro de candidato.
- RF-05 — Importação de vagas externas.
- RF-06 — Busca e filtro.
- RF-07 — Análise de compatibilidade.
- RF-08 — Identificação de barreiras.
- RF-09 — Restrição de vaga incompatível.
- RF-10 — Visualização da vaga.

## Critérios de aceitação

- Vagas com barreiras incompatíveis não aparecem na trilha.
- O cálculo respeita os pesos de 50%, 30% e 20%.
- A acessibilidade da vaga é exibida antes da candidatura.
- Vagas externas são identificadas e estruturadas antes da análise.
- Dados extraídos por inteligência artificial são validados antes de serem utilizados.

## Referência visual

As imagens usadas como referência para este caso de uso estão na pasta [seq-UC-01.png](../uml/seq-UC-01.png).
