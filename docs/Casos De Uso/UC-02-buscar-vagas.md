
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
- Resultados são ordenados pelo percentual de compatibilidade calculado.
- Quando nenhuma vaga compatível for encontrada, o sistema sugere ações ao candidato (ajustar filtros, salvar alerta por e-mail).

---