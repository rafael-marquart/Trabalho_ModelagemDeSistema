# UC-06 — Avaliar Pós-Entrevista

## Objetivo

Avaliar a experiência da entrevista quanto ao cumprimento dos recursos de acessibilidade e postura inclusiva da equipe, gerando nota de reputação.

## Ator principal

- Candidato PcD.

## Pré-condições

- Entrevista cadastrada no sistema e concluída.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC11 (Moderar Denúncias e Falsa Inclusão), FA01 (Avaliação Anônima).

## Fluxo Principal

1. O candidato registra uma avaliação sobre o processo seletivo.
2. O sistema registra a avaliação e preserva os dados necessários à moderação.
3. Quando houver denúncia ou indício de abuso, o registro segue para análise administrativa.
4. O Administrador analisa a ocorrência e registra a decisão.
5. Qualquer alteração de nota ou efeito de moderação ocorre somente após a decisão administrativa.

## Exceções e Fluxos Alternativos

- FA01 (Optar por Anonymity): O candidato marca a opção de enviar a avaliação de forma 100% anônima.
- UC11 (Denúncia de Falsa Inclusão): Em caso de conduta preconceituosa ou ausência grave de acessibilidade combinada, o candidato marca a opção de denúncia formal, estendendo para a moderação administrativa.
- EX01 (Prazo Expirado): Se passarem mais de 30 dias do evento sem avaliação, o formulário é desativado.

## Pós-condições

- Avaliação persistida e média de pontuação da empresa atualizada.
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

- Avaliações submetidas dentro do prazo são gravadas e contabilizadas na média da empresa.
- Avaliação anônima preserva anonimato enquanto permite a triagem de conteúdo pela equipe de moderação.
- Denúncias acionam o fluxo de moderação com evidências suficientes para investigação.

---