# UC-06 — Avaliar Pós-Entrevista

## Objetivo

Avaliar a experiência da entrevista quanto ao cumprimento dos recursos de acessibilidade e postura inclusiva da equipe, gerando nota de reputação.

## Ator principal

- Candidato PcD.

## Pré-condições

- Entrevista cadastrada no sistema e concluída.
- Candidato autenticado com candidatura vinculada à entrevista.
- Submissão dentro do prazo de até 60 dias corridos após a conclusão da entrevista.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC11 (Moderar Denúncias e Falsa Inclusão), FA01 (Avaliação Anônima).

## Fluxo Principal

1. O sistema apresenta campos separados para avaliar acessibilidade e postura inclusiva, cada um em escala de 1 a 5 estrelas.
2. O candidato informa obrigatoriamente as duas notas e, se desejar, um comentário opcional; antes de enviar, pode revisar os dados.
3. O sistema valida que o candidato autenticado está vinculado à candidatura e à entrevista concluída e que a submissão ocorre em até 60 dias corridos após a conclusão.
4. O sistema valida que ambas as notas estão preenchidas e dentro da escala de 1 a 5 estrelas e valida o comentário quando informado.
5. Se o prazo tiver expirado, o vínculo não for válido ou os campos obrigatórios forem inválidos, o sistema recusa a submissão.
6. Se a validação for bem-sucedida, o sistema registra a avaliação e preserva os dados necessários à moderação. Após o envio, o candidato não pode editar a avaliação.
5. Quando houver denúncia ou indício de abuso, o registro segue para análise administrativa.
6. O Administrador analisa a ocorrência e registra a decisão.
7. Qualquer alteração de nota ou efeito de moderação ocorre somente após a decisão administrativa.

## Exceções e Fluxos Alternativos

- FA01 (Optar por Anonymity): O candidato marca a opção de enviar a avaliação de forma 100% anônima.
- UC11 (Denúncia de Falsa Inclusão): Em caso de conduta preconceituosa ou ausência grave de acessibilidade combinada, o candidato marca a opção de denúncia formal, estendendo para a moderação administrativa.
## Pós-condições

- Avaliação persistida para composição da nota pública conforme as regras aplicáveis.
- Denúncias encaminhadas ao fluxo de moderação quando aplicável.

## Regras de negócio relacionadas

- RB-19
- RB-20
- RB-24
- RB-25
- RB-37
- RB-44
- RB-45

## Requisitos relacionados

- RF-21
- RF-13
- RF-14
- RF-22
- RF-38

## Critérios de aceitação

- Apenas candidato autenticado vinculado à candidatura e à entrevista concluída pode avaliar; a elegibilidade independe de contratação ou rejeição.
- A avaliação contém duas notas obrigatórias e separadas: acessibilidade e postura inclusiva, cada uma de 1 a 5 estrelas.
- O comentário é opcional; quando informado, é validado.
- O candidato pode revisar a avaliação antes de enviá-la, mas não pode editar ou reenviar para alterar uma avaliação já registrada.
- Novas submissões são aceitas somente até 60 dias corridos após a conclusão da entrevista; após o prazo, são recusadas.
- Avaliações submetidas são gravadas para composição da nota pública conforme as regras aplicáveis.
- Avaliação anônima preserva anonimato enquanto permite a triagem de conteúdo pela equipe de moderação.
- Denúncias acionam o fluxo de moderação e ficam sujeitas à análise administrativa.

---