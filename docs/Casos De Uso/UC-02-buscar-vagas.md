# UC-02 — Buscar Vagas

## Objetivo

Permitir que o candidato encontre vagas abertas, com busca por texto e filtros, vendo apenas as vagas que não têm barreira crítica para ele (trava de acessibilidade) e a compatibilidade de cada uma.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado. O perfil pode estar incompleto: o que faltar aparece como "não informado" na compatibilidade, sem presumir resultado (RB-16).

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-13 (Calcular compatibilidade), executado para cada vaga encontrada.

## Fluxo Principal

1. O candidato acessa "Vagas" e, se quiser, digita termos de busca e escolhe filtros por área profissional, modalidade, localização e recursos de acessibilidade da vaga (os seis itens da infraestrutura, UC-07). Para procurar um cargo, a pessoa digita o nome na busca por texto. Listas longas de localização e de área começam recolhidas, com o botão "Mostrar todas".
2. A busca por texto procura no título, na descrição e no nome da empresa; ignora maiúsculas, minúsculas e acentos, compara pela raiz das palavras ("engenharia" encontra "engenheiro") e exige que todos os termos apareçam em algum desses campos. Não há sinônimos, correção de digitação nem interpretação por IA. Busca vazia não restringe.
3. Filtros de categorias diferentes se combinam por "e"; valores da mesma categoria, por "ou". Remover um filtro mantém os demais.
4. O sistema considera somente vagas publicadas por empresas na plataforma, abertas e dentro do prazo de inscrição.
5. Para cada vaga encontrada, o sistema calcula a compatibilidade (UC-13). Vagas com barreira crítica para o candidato não aparecem; o sistema informa quantas foram ocultadas por esse motivo.
6. O sistema mostra até 100 vagas, 20 por página, ordenadas por maior compatibilidade (padrão), mais recentes ou mais antigas. Vagas sem score completo ficam depois das que têm score. A paginação mantém busca, filtros e ordenação; mudar a busca ou um filtro volta para a primeira página.
7. O candidato pode abrir uma vaga para ver o detalhe e a explicação da compatibilidade (RF-10, RF-24).

## Exceções e Fluxos Alternativos

- EX01 (Nenhuma vaga encontrada): o sistema informa que não há resultados e sugere revisar a busca e os filtros.
- EX02 (Cálculo de trajeto indisponível): se o serviço de trajeto não responder em 8 segundos, a dimensão de deslocamento fica sem esse dado e a busca continua (RNF-05).

## Pós-condições

- O candidato vê a lista de vagas elegíveis com a compatibilidade de cada uma.
- O resultado de cada análise de compatibilidade fica registrado e é reaproveitado enquanto os dados do candidato e da vaga não mudarem (UC-13). Os termos e filtros de busca não são gravados.

## Regras de negócio relacionadas

- RB-02 — Trava de acessibilidade.
- RB-03 — Peso da acessibilidade.
- RB-04 — Peso do perfil técnico.
- RB-05 — Peso de modalidade e deslocamento.
- RB-13 — Transparência antes da candidatura.
- RB-16 — Dados de acessibilidade não informados.
- RB-30 — Transparência do resultado.

## Requisitos relacionados

- RF-06 — Busca e filtro.
- RF-07 — Análise de compatibilidade.
- RF-09 — Restrição de vaga incompatível.
- RF-10 — Visualização da vaga.
- RF-24 — Transparência do resultado de compatibilidade.
- RF-25 — Transparência da compatibilidade da vaga.

## Vagas externas

Vagas externas (SPEC-006, UC-14) não aparecem na busca desta versão: a implementação está em revisão (PR #68) e a decisão de escopo ainda não foi tomada.

## Critérios de aceitação

- A busca não lista vagas com barreira crítica para o candidato e informa quantas foram ocultadas.
- Vagas encerradas ou com prazo vencido não aparecem.
- Os resultados respeitam o limite de 100 vagas e 20 por página, com as três ordenações.
- Sem resultados, o sistema informa e permite revisar a busca e os filtros.
- Alertas por e-mail e buscas salvas não fazem parte desta versão (OPEN-039).

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-02-buscar-vagas.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-02-buscar-vagas.puml` (PlantUML).
