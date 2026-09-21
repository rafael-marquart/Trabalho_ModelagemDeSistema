# UC-13 — Calcular Match Determinístico

## Objetivo

Calcular a compatibilidade entre o perfil do candidato e as vagas elegíveis, considerando critérios de acessibilidade, perfil profissional, modalidade de trabalho, localização e outros fatores definidos pela regra de negócio, para retornar uma classificação clara e transparente.

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar autenticado no sistema.
- O perfil do candidato deve conter informações necessárias para comparação, como vetor funcional, experiência, localização e preferências.
- O catálogo de vagas deve estar atualizado e disponível para processamento.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-11 (Denunciar Vaga Incompatível).

## Fluxo Principal

1. O candidato acessa a busca de vagas ou a área de perfil.
2. O sistema busca as vagas ativas e preparadas para análise.
3. O sistema compara os dados do candidato com o conjunto de requisitos e barreiras das vagas.
4. O sistema aplica a trava crítica de acessibilidade e mantém apenas vagas compatíveis.
5. O sistema calcula o score de compatibilidade com base em peso de acessibilidade, perfil técnico e demais critérios.
6. O sistema ordena as vagas por melhor adequação e exibe o resultado ao candidato.
7. O sistema apresenta o breakdown de compatibilidade para maior transparência.

## Exceções e Fluxos Alternativos

- EX01 (Nenhuma vaga compatível): Se nenhuma vaga passar na trava crítica, o sistema informa ao candidato que não há oportunidades elegíveis no momento.
- EX02 (Vagas externas com dados incompletos): Se uma vaga importada estiver incompleta ou sem dados padronizados, o sistema ignora ou sinaliza a inconsistência antes da análise.
- EX03 (Perfil incompleto): Se o perfil do candidato estiver incompleto, o sistema solicita complementação antes de calcular o match.

## Pós-condições

- As vagas compatíveis são identificadas e ordenadas por compatibilidade.
- O candidato recebe uma resposta clara sobre o nível de adequação das oportunidades.
- O histórico de cálculo e os parâmetros usados ficam registrados para auditoria e melhoria da recomendação.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — barreiras incompatíveis tornam a vaga não elegível.
- RB-03: Peso da acessibilidade — acessibilidade compõe parte relevante do cálculo de compatibilidade.
- RB-04: Peso do perfil técnico — perfil técnico é considerado no cálculo do match.
- RB-05: Peso de distância e modalidade — distância e modalidade contribuem para o score.
- RB-10: Vagas externas — vagas importadas devem ser normalizadas antes da análise.
- RB-11: Validação da IA — dados extraídos por IA de vagas externas devem ser validados antes do uso.
- RB-31: Transparência do resultado — o sistema deve expor ao candidato os principais fatores que influenciaram a compatibilidade.

## Requisitos relacionados

- RF-06 — Busca e filtro.
- RF-07 — Análise de compatibilidade.
- RF-10 — Visualização da vaga.
- RF-24 — Paginação e performance.
- RF-25 — Transparência de pontuação.
- RF-36 — Importação em JSON.

## Critérios de aceitação

- O sistema calcula corretamente a compatibilidade entre perfil e vaga.
- Vagas incompatíveis são filtradas pela trava crítica.
- O resultado da análise é exibido em ordem decrescente de compatibilidade.
- O candidato consegue visualizar os fatores que impactaram a pontuação da vaga.

---
