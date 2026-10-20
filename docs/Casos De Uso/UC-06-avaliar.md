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
3. O sistema valida que o candidato autenticado está vinculado à candidatura e à entrevista concluída, que a submissão ocorre em até 60 dias corridos após a conclusão e que ainda não existe avaliação desse candidato para a entrevista.
4. O sistema valida que ambas as notas estão preenchidas e dentro da escala de 1 a 5 estrelas e valida o comentário quando informado.
5. Se o prazo tiver expirado, o vínculo não for válido, já existir avaliação para a entrevista ou os campos obrigatórios forem inválidos, o sistema recusa a submissão.
6. Se a validação for bem-sucedida, o sistema registra a avaliação e preserva os dados necessários à moderação. Cada candidato pode registrar uma única avaliação por entrevista; após o envio, não pode editar nem substituir a avaliação.
7. Eventos relevantes são registrados. Quando houver denúncia ou indício relevante de abuso, o caso segue para análise administrativa, sem bloqueio automático.
8. O Administrador analisa a ocorrência e registra a decisão conforme o fluxo de moderação existente.
9. A administração não altera diretamente a avaliação nem a distribuição pública de estrelas; qualquer efeito depende das regras aplicáveis e da decisão administrativa registrada.
10. A apresentação pública exibe somente a distribuição agregada das avaliações válidas por quantidade de estrelas, sem identidade, identificadores ou comentários individuais. Os registros individuais e comentários opcionais ficam acessíveis somente a pessoas autorizadas para finalidades legítimas da plataforma e são retidos por 1 ano após o envio; ao fim do prazo, são excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação. A distribuição agregada pode ser mantida por prazo indeterminado apenas se não permitir reconstruir avaliações individuais nem identificar candidatos.

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
- O candidato pode revisar a avaliação antes de enviá-la, mas não pode editar, substituir ou registrar uma segunda avaliação para a mesma entrevista após o registro inicial.
- Novas submissões são aceitas somente até 60 dias corridos após a conclusão da entrevista; após o prazo, são recusadas.
- Indícios relevantes de abuso são registrados e encaminhados para análise administrativa, sem bloqueio automático.
- Avaliações submetidas são gravadas para composição da nota pública conforme as regras aplicáveis; publicamente, somente a distribuição agregada por quantidade de estrelas é exibida, sem comentários individuais.
- O acesso aos registros individuais e comentários opcionais é restrito a pessoas autorizadas para finalidades legítimas da plataforma; os registros são retidos por 1 ano após o envio e, ao fim do prazo, excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação.
- Avaliação anônima preserva anonimato enquanto permite a triagem de conteúdo pela equipe de moderação.
- A apresentação pública exibe somente a distribuição agregada por quantidade de estrelas; comentários individuais, identidade e identificadores dos candidatos não são publicados.
- Registros individuais e comentários opcionais têm acesso restrito a pessoas autorizadas para finalidades legítimas da plataforma e são excluídos ou irreversivelmente anonimizados após 1 ano do envio, respeitando obrigações aplicáveis de preservação.
- A distribuição agregada só pode ser mantida por prazo indeterminado se não permitir reconstruir avaliações individuais nem identificar candidatos.
- Denúncias acionam o fluxo de moderação e ficam sujeitas à análise administrativa.

---