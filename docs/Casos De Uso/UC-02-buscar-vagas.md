
# UC-02 — Buscar Vagas (Trava Crítica / Match)

## Objetivo

Filtrar e visualizar exclusivamente vagas compatíveis com o perfil, ocultando automaticamente oportunidades impeditivas por meio da trava crítica de acessibilidade.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado com vetor funcional cadastrado (UC01).

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC13 (Calcular Match Determinístico).

## Fluxo Principal

1. O candidato acessa o painel de busca de vagas e insere termos de interesse ou filtros de localização/cargo.
2. O sistema dispara internamente a execução do UC13 para cruzar o vetor do candidato com o banco de vagas ativas.
3. O sistema aplica a trava crítica eliminatória (filtro booleano).
4. O sistema exibe o catálogo de vagas elegíveis ordenadas pelo percentual de compatibilidade.

## Exceções e Fluxos Alternativos

- EX01 (Nenhuma Vaga Compatível Encontrada): Se o motor de match descartar todas as vagas por incompatibilidade na trava crítica, o sistema exibe mensagem informativa e sugere ajuste nos filtros de localização/cargo.
- FA01 (Filtro Manual por Categoria de Acessibilidade): O candidato aplica filtros adicionais refinando os resultados apenas por tipo de regime (remoto, híbrido, presencial).

## Pós-condições

- Lista de vagas compatíveis retornada e ordenada por compatibilidade.
- Logs de pesquisa e parâmetros armazenados para análise e melhoria do motor.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — barreiras incompatíveis tornam a vaga não elegível.
- RB-03: Peso da acessibilidade — acessibilidade compõe parte relevante do cálculo de compatibilidade (ex.: 50% do score, conforme UC-01-gerar-trilha).
- RB-04: Peso do perfil técnico — perfil técnico é considerado no cálculo do match.
- RB-05: Peso de distância e modalidade — distância e modalidade contribuem para o score de compatibilidade.
- RB-10: Vagas externas — vagas importadas devem ser normalizadas antes da análise.
- RB-11: Validação da IA — dados extraídos por IA de vagas externas devem ser validados antes do uso.
- RB-31: Transparência do resultado — o sistema deve expor ao candidato os principais fatores que influenciaram a compatibilidade (quais requisitos foram decisivos).
- RB-32: Cache de resultados — para performance, resultados de busca podem ser cacheados por conjunto de parâmetros por período curto.

## Requisitos relacionados

- RF-06 — Busca e filtro (filtros por localização, cargo, modalidade, categoria de acessibilidade).
- RF-07 — Análise de compatibilidade (integração com UC13 e aplicação da trava crítica).
- RF-10 — Visualização da vaga (detalhes de acessibilidade visíveis antes da candidatura).
- RF-05 — Interface acessível (resultados e filtros acessíveis).
- RF-24 — Paginação e performance (retorno rápido em grandes volumes de vagas).
- RF-25 — Transparência de pontuação (exibir breakdown do score para cada vaga).

## Critérios de aceitação

- Busca retorna apenas vagas que passaram pela trava crítica.
- Resultados são ordenados pelo percentual de compatibilidade calculado.
- Quando nenhuma vaga compatível for encontrada, o sistema sugere ações ao candidato (ajustar filtros, salvar alerta por e-mail).

---