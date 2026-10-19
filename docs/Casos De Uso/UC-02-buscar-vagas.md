
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

1. O candidato acessa o painel de busca de vagas e pode inserir termos de interesse ou filtros por cargo, área profissional, modalidade e localização. A busca textual consulta título/cargo da vaga, descrição e nome da Empresa; ignora maiúsculas/minúsculas e acentos; considera palavras ou trechos contidos e exige que todos os termos sejam encontrados, podendo estar distribuídos entre os campos. Busca vazia não restringe por texto. Não há expansão automática por sinônimos, correção de erros de digitação ou interpretação por IA. O filtro de acessibilidade previsto no RF-06 utiliza apenas opções definidas e validadas na OPEN-023, sem expor necessidades funcionais individuais.
2. O sistema combina filtros de categorias diferentes por AND e valores selecionados dentro da mesma categoria por OR. Filtros não selecionados não restringem a busca; ao remover um filtro, os demais permanecem aplicados.
3. O sistema dispara internamente a execução do UC13 para cruzar o vetor do candidato com o banco de vagas ativas
4. O sistema aplica a trava crítica eliminatória (filtro booleano), considera somente vagas ativas e válidas e respeita os filtros informados.
5. O sistema exibe até 100 vagas elegíveis, em páginas de 20, ordenadas pela opção selecionada: maior compatibilidade (padrão, conforme SPEC-007), mais recentes ou mais antigas (data de publicação). A paginação é numerada, com navegação anterior/próxima, preservando busca, filtros e ordenação; alterações em busca/filtros reiniciam na primeira página. Empates usam identificador interno para estabilidade, sem expô-lo

## Exceções e Fluxos Alternativos

- EX01 (Nenhuma Vaga Compatível Encontrada): Se o motor de match descartar todas as vagas por incompatibilidade na trava crítica, o sistema exibe mensagem informativa e sugere revisar os filtros aplicados.
- FA01 (Filtros adicionais): O candidato pode refinar os resultados por cargo, área profissional, modalidade e localização, conforme as regras de combinação definidas. Filtro de acessibilidade só é disponibilizado conforme critérios validados na OPEN-023.

## Pós-condições

- Lista de vagas compatíveis retornada e ordenada por compatibilidade.
- Logs de pesquisa e parâmetros armazenados para análise e melhoria do motor.

## Regras de negócio relacionadas
\n- RB-02: Existência de incompatibilidade de acessibilidade — incompatibilidades podem tornar a vaga não elegível.
- RB-03: Peso da acessibilidade — acessibilidade representa 50% da compatibilidade.
- RB-04: Peso do perfil técnico — perfil técnico representa 30% da compatibilidade.
- RB-05: Peso de distância e modalidade — distância e modalidade representam 20% da compatibilidade.
- RB-10: Vagas externas — vagas externas seguem as regras de ingestão e validação.
- RB-11: Validação da IA — dados extraídos por IA devem ser validados antes do uso.
- RB-13: Transparência — o resultado de compatibilidade deve ser apresentado de forma compreensível.
- RB-16: Dados de acessibilidade não informados — ausência de informação deve ser tratada conforme as regras de compatibilidade.
- RB-17: Validação de vaga externa — vaga externa deve ser validada antes de disponibilização.
- RB-30: Transparência do resultado — o candidato deve conhecer os fatores relevantes do resultado.

## Requisitos relacionados
\n- RF-06 — Busca e filtro.
- RF-07 — Análise de compatibilidade.
- RF-09 — Restrição de vaga incompatível.
- RF-10 — Visualização da vaga.
- RF-24 — Transparência do resultado de compatibilidade.
- RF-25 — Transparência da compatibilidade da vaga.

## Critérios de aceitação

- Busca retorna apenas vagas que passaram pela trava crítica.
- Resultados respeitam o limite de 100 vagas elegíveis e 20 por página, com paginação e ordenações alternativas conforme SPEC-008.
- Quando nenhuma vaga compatível for encontrada, o sistema informa o estado sem resultados e permite revisar os filtros aplicados. Alertas por e-mail e salvamento de buscas permanecem fora do escopo atual, conforme decisão da OPEN-039.

---