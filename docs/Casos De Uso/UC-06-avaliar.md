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

1. Após a data do evento seletivo, o candidato recebe notificação e clica em "Avaliar Entrevista".
2. O candidato responde ao checklist sobre cumprimento dos recursos solicitados (UC04) e atitude dos entrevistadores.
3. O sistema grava os dados e atualiza a média de pontuação de acessibilidade da empresa.

## Exceções e Fluxos Alternativos

- FA01 (Optar por Anonymity): O candidato marca a opção de enviar a avaliação de forma 100% anônima.
- UC11 (Denúncia de Falsa Inclusão): Em caso de conduta preconceituosa ou ausência grave de acessibilidade combinada, o candidato marca a opção de denúncia formal, estendendo para a moderação administrativa.
- EX01 (Prazo Expirado): Se passarem mais de 30 dias do evento sem avaliação, o formulário é desativado.

## Pós-condições

- Avaliação persistida e média de pontuação da empresa atualizada.
- Denúncias encaminhadas ao fluxo de moderação quando aplicável.

## Regras de negócio relacionadas

- RB-45: Avaliação anônima opcional — permitir avaliações anônimas mantendo integridade dos dados para prevenção de abuso.
- RB-46: Prazo de avaliação — avaliações só podem ser submetidas até 30 dias após a entrevista.
- RB-47: Impacto na reputação — pontuação agregada de acessibilidade influencia métricas públicas/privadas da empresa (conforme política de transparência).
- RB-48: Triagem de denúncias — denúncias abertas por avaliações devem seguir um fluxo de moderação com evidências antes de ações punitivas.
- RB-49: Confidencialidade — conteúdo da avaliação só é visível ao nível adequado (anônimo à empresa quando necessário, detalhado para moderadores internos).

## Requisitos relacionados

- RF-36 — Formulário de avaliação pós-entrevista (questões padronizadas e escala de avaliação).
- RF-37 — Anonimização de respostas (opção para enviar sem identificar o candidato ao recrutador).
- RF-11 — Autenticação em Dois Fatores (para verificações em casos de disputas/denúncias críticas).
- RF-38 — Fluxo de moderação (ferramentas para analisar denúncias e tomar ações).
- RF-39 — Métricas e dashboard (visualização agregada das avaliações por empresa/unidade).

## Critérios de aceitação

- Avaliações submetidas dentro do prazo são gravadas e contabilizadas na média da empresa.
- Avaliação anônima preserva anonimato enquanto permite a triagem de conteúdo pela equipe de moderação.
- Denúncias acionam o fluxo de moderação com evidências suficientes para investigação.

---