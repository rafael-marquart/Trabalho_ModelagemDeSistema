# UC-15 — Exibir Resultado e Decisão da Vaga

## Objetivo

Apresentar ao usuário o resultado da busca, da compatibilidade e da decisão vinculada a uma vaga ou solicitação, exibindo informações relevantes de forma clara, acessível e em conformidade com as regras do processo seletivo.

## Ator principal

- Candidato PcD.
- Recrutador.

## Pré-condições

- O usuário deve estar autenticado no sistema.
- A vaga, a candidaturas ou o status relacionado deve existir e estar associado ao contexto correto.
- O sistema deve possuir os dados necessários para montar a visualização.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Inclusão (<<include>>): UC-05 (Acompanhar Funil de Candidaturas).
- Extensão (<<extend>>): UC-16 (Aprovar Solicitação / Decisão Final).

## Fluxo Principal

1. O usuário acessa a tela de resultados ou de detalhe da vaga.
2. O sistema busca os dados atuais da vaga, do perfil e do status do processo.
3. O sistema consolida as informações relevantes em uma interface clara.
4. O sistema exibe os resultados, critérios, compatibilidade, estado atual e ações disponíveis.
5. O usuário visualiza a resposta e decide se segue para a ação correspondente.

## Exceções e Fluxos Alternativos

- EX01 (Sem resultados): Se não houver vaga compatível ou nenhum dado disponível, o sistema exibe mensagem informativa e orienta o usuário.
- EX02 (Status indisponível): Se a vaga estiver encerrada ou sem resultado, o sistema comunica a indisponibilidade e bloqueia ações incompatíveis.
- EX03 (Dados incompletos): Se faltarem informações essenciais, o sistema sinaliza a ausência de dados e sugere atualização ou retorno.

## Pós-condições

- O usuário recebe uma visualização correta da situação da vaga ou do processo.
- A decisão ou o estado da ação estão visíveis e consistentes com o sistema.
- O histórico e o contexto continuam disponíveis para acompanhamento.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — vagas incompatíveis devem ser ocultadas ou sinalizadas.
- RB-22: Transparência de status — o status da vaga deve ser informado claramente.
- RB-31: Transparência do resultado — resultados e compatibilidade devem ser explicados ao usuário.
- RB-42: Visibilidade de acomodações — decisões sobre acomodação devem ser exibidas no funil.
- RB-44: Notificação de vaga encerrada — enceramentos devem ser sinalizados ao candidato.

## Requisitos relacionados

- RF-06 — Busca e filtro.
- RF-10 — Visualização da vaga.
- RF-25 — Transparência de pontuação.
- RF-27 — Notificações ao recrutador e candidato.
- RF-30 — Visibilidade para recrutadores.

## Critérios de aceitação

- O sistema exibe corretamente os dados da vaga ou da situação do processo.
- O usuário visualiza o status atual, compatibilidade e ações permitidas.
- Mensagens de indisponibilidade ou ausência de resultados são claras e acessíveis.
- A exibição reflete o estado real do sistema e da vaga.

---
