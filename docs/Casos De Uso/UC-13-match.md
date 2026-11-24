# UC-13 — Calcular Compatibilidade (Match Determinístico)

## Objetivo

Calcular, de forma determinística e explicável, a compatibilidade entre o perfil do candidato e uma vaga, aplicando a trava de acessibilidade e os pesos de 50% (acessibilidade), 30% (perfil técnico) e 20% (modalidade e deslocamento). O cálculo não usa IA.

## Atores

- Candidato PcD (quem dispara, ao buscar vagas, abrir uma vaga ou consultar "Compatibilidade").
- Serviço externo de cálculo de trajeto (HERE), ator secundário.

## Pré-condições

- Candidato autenticado.
- Vaga publicada por empresa na plataforma e aberta. Vagas encerradas não são recalculadas; a candidatura guarda o resultado do momento em que foi feita.

## Pontos de Inclusão e Extensão

- Incluído por UC-02 (Buscar vagas), pelo detalhe da vaga e por UC-03 (Candidatar-se).

## Fluxo Principal

1. O sistema reúne os dados do perfil do candidato (UC-01) e da vaga (UC-08).
2. Se os dados do candidato e da vaga não mudaram desde o último cálculo, o sistema reaproveita o resultado registrado.
3. **Trava de acessibilidade:** se uma necessidade marcada como indispensável encontra o recurso correspondente declarado como Ausente na vaga, o resultado é **Incompatível**, qualquer que seja o score (RB-02).
4. **Acessibilidade (A):** cada necessidade do candidato que tem item correspondente na vaga vale 100 (Presente) ou 0 (Ausente); "Não informado" fica sem valor.
5. **Perfil técnico (T):** só os critérios que a vaga preencheu entram: competências (40%), experiência (30%), escolaridade mínima (20%) e idiomas (10%).
6. **Modalidade e deslocamento (D):** modalidade (60%) conforme as preferências do candidato e tempo de trajeto (40%) em faixas (até 30 min: 100; até 60: 75; até 90: 50; acima: 25). Vaga remota não considera deslocamento.
7. Dimensões sem critério aplicável ficam de fora e os pesos das demais são redistribuídos proporcionalmente.
8. O sistema calcula o score de 0 a 100, com arredondamento de metades para cima, e registra o resultado com a versão das regras.
9. O sistema mostra o resultado com o score de cada dimensão, os fatores que pesaram e o que falta informar, separando o que cabe ao candidato do que cabe à empresa (RB-30).

## Exceções e Fluxos Alternativos

- EX01 (Dados insuficientes): se alguma dimensão não puder ser avaliada (por exemplo, perfil sem a informação ou vaga com item "Não informado"), o resultado é **Dados insuficientes**: o sistema mostra as dimensões que conseguiu calcular e o que falta, mas não apresenta um score final como completo e não presume compatibilidade (RB-16, RB-29). Isso não impede a candidatura (UC-03).
- EX02 (Trajeto indisponível): se o serviço de trajeto falhar, passar de 8 segundos ou atingir a cota, o deslocamento fica sem valor, o resultado é "Dados insuficientes" e o cálculo é refeito na próxima consulta.
- EX03 (Necessidade sem correspondência): uma necessidade do catálogo sem item equivalente entre os seis da vaga aparece como "não avaliável", com a indicação de que não depende do candidato, e a dimensão de acessibilidade fica com dados insuficientes. Necessidades descritas em texto livre não entram no cálculo.
- EX04 (Sem necessidades): se o candidato declarou que não tem necessidades de acessibilidade, a dimensão A não se aplica e os pesos são redistribuídos. Se ele não preencheu a seção, a dimensão fica com dados insuficientes.

## Pós-condições

- Resultado registrado (Completo, Dados insuficientes ou Incompatível), com a versão das regras e a data. Esses registros são apagados após 1 ano (RNF-08).
- Com os mesmos dados, o resultado é sempre o mesmo (RNF-10).

## Regras de negócio relacionadas

- RB-02 — Trava de acessibilidade.
- RB-03 — Peso da acessibilidade.
- RB-04 — Peso do perfil técnico.
- RB-05 — Peso de modalidade e deslocamento.
- RB-06 — Necessidades obrigatórias.
- RB-07 — Perfil técnico.
- RB-16 — Dados de acessibilidade não informados.
- RB-29 — Informações mínimas do perfil.
- RB-30 — Transparência do resultado.

## Requisitos relacionados

- RF-07 — Análise de compatibilidade.
- RF-08 — Identificação de barreiras.
- RF-09 — Restrição de vaga incompatível.
- RF-24 — Transparência do resultado de compatibilidade.
- RF-25 — Transparência da compatibilidade da vaga.

## Critérios de aceitação

- Uma barreira crítica torna a vaga Incompatível, qualquer que seja o score.
- Com dados completos, o score usa os pesos 50/30/20, redistribuídos quando uma dimensão não se aplica.
- Com dados faltando, o resultado é "Dados insuficientes", com as dimensões calculadas e o que falta, sem score final.
- O mesmo perfil e a mesma vaga produzem sempre o mesmo resultado.
- O candidato vê os fatores que pesaram e o que pode completar.
