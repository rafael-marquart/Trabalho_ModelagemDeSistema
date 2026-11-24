# UC-06 — Avaliar Pós-Entrevista

## Objetivo

Permitir que o candidato avalie, depois de uma entrevista concluída, o cumprimento dos recursos de acessibilidade e a postura inclusiva da equipe. As avaliações compõem a nota pública de acessibilidade da Empresa (RF-13), mostrada como distribuição de estrelas.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado, dono da candidatura.
- A Empresa marcou a entrevista como concluída (UC-09).
- Ainda não passaram 60 dias corridos desde a conclusão e não existe avaliação do candidato para essa entrevista.

## Pontos de Inclusão e Extensão

- Estende UC-05 (Acompanhar candidaturas): a avaliação é feita no detalhe da candidatura.
- Relação com UC-11: o candidato pode, à parte, registrar uma denúncia sobre a vaga e apontar a própria avaliação a que ela se refere.

## Fluxo Principal

1. No detalhe da candidatura, o sistema mostra a entrevista concluída com a opção "Avaliar" e o prazo final.
2. O candidato escolhe de 1 a 5 estrelas para **acessibilidade** e de 1 a 5 estrelas para **postura inclusiva** (as duas obrigatórias) e, se quiser, escreve um comentário de até 1000 caracteres.
3. O candidato revisa e envia.
4. O sistema confere no servidor que a entrevista é de uma candidatura do próprio candidato, que foi concluída, que o prazo de 60 dias não passou e que ainda não há avaliação; valida as notas e o comentário.
5. O sistema grava a avaliação, que não pode ser editada nem substituída, e a mostra ao candidato como enviada.
6. A nota pública da Empresa passa a contar essa avaliação.

## Exceções e Fluxos Alternativos

- EX01 (Recusa): entrevista de outra pessoa, não concluída, fora do prazo, já avaliada, ou notas fora de 1 a 5, é recusada com o motivo; nada é gravado além do registro da tentativa.
- EX02 (Tentativas repetidas): a partir de 3 tentativas recusadas da mesma pessoa em 24 horas, o sistema registra um indício de abuso para análise administrativa, sem bloquear a conta.
- EX03 (Prazo expirado): depois de 60 dias, a opção de avaliar deixa de aparecer.
- EX04 (Sair sem enviar): se o candidato tentar sair do formulário preenchido, o sistema pergunta se deseja sair sem enviar (RF-44).

## Nota pública e privacidade

- A nota pública mostra, para cada critério, quantas avaliações deram 1, 2, 3, 4 e 5 estrelas, sem média nem pesos. Uma avaliação já basta para exibi-la; sem avaliações, o sistema informa que ainda não há dados suficientes. Ela aparece no detalhe da vaga e no painel da Empresa.
- A nota pública nunca mostra comentários, nomes nem identificadores. O comentário só aparece ao próprio candidato.
- O Administrador não edita nem remove avaliações; uma denúncia pendente não altera a nota.
- Após 1 ano do envio, a avaliação é anonimizada: mantém só as notas, a Empresa e o ano (RNF-08).

## Pós-condições

- Avaliação gravada, ligada à entrevista e à Empresa, e contada na nota pública.

## Regras de negócio relacionadas

- RB-19 — Anonimato das avaliações públicas.
- RB-20 — Nota de acessibilidade baseada em dados registrados.
- RB-24 — Proteção contra abuso.
- RB-37 — Registro das decisões.

## Requisitos relacionados

- RF-21 — Avaliação do processo seletivo.
- RF-13 — Nota de acessibilidade.
- RF-38 — Auditoria de operações.

## Critérios de aceitação

- Só o dono da candidatura avalia, e só entrevista concluída, até 60 dias após a conclusão.
- As duas notas são obrigatórias, de 1 a 5; o comentário é opcional, com até 1000 caracteres.
- Há no máximo uma avaliação por entrevista, sem edição depois do envio.
- Avaliar não depende de o candidato ter sido aprovado ou recusado.
- A nota pública mostra apenas a distribuição por estrelas, sem comentários nem identidade.
- Tentativas repetidas recusadas geram registro para análise, sem bloqueio automático.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-06-avaliar.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-06-avaliar.puml` (PlantUML).
