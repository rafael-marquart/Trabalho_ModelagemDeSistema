# UC-11 — Denunciar Vaga Incompatível

## Objetivo

Permitir que o candidato reporte uma vaga que seja inadequada, incompatível ou prejudicial ao seu perfil, com base em critérios de acessibilidade, compatibilidade funcional ou regras de inclusão, para que a operação seja revisada e, quando necessário, tratada pela equipe responsável.

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar autenticado no sistema.
- A vaga deve estar visível no catálogo ou no detalhe da oportunidade.
- O candidato deve ter identificado um problema de incompatibilidade, acessibilidade ou inadequação da vaga ao seu perfil.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-12 (Status da Vaga).

## Fluxo Principal

1. O candidato acessa a vaga ou o resultado de busca e seleciona a opção “Denunciar incompatibilidade”.
2. O sistema exibe um formulário para registrar a razão da denúncia, como barreiras de acessibilidade, requisitos incompatíveis, ausência de recursos esperados ou inconsistência com o perfil informado.
3. O candidato descreve o problema e, se necessário, anexa evidências ou observações complementares.
4. O sistema valida os dados da denúncia e registra o relato com data, usuário e vaga relacionada.
5. O sistema encaminha a denúncia para a equipe responsável por revisão da vaga ou do catálogo.
6. O sistema informa ao candidato que a denúncia foi registrada e que a situação será analisada.

## Exceções e Fluxos Alternativos

- EX01 (Denúncia sem motivo válido): Se o candidato não preencher a justificativa mínima, o sistema bloqueia o envio e solicita dados complementares.
- EX02 (Vaga já revisada): Se a vaga já foi analisada recentemente, o sistema informa que a denúncia foi registrada anteriormente e apresenta o status da revisão.
- EX03 (Denúncia duplicada): Se o mesmo candidato denunciar a mesma vaga em pouco intervalo de tempo, o sistema bloqueia a duplicidade e informa o status atual da ocorrência.

## Pós-condições

- A denúncia é registrada no sistema e vinculada à vaga.
- A equipe responsável pode avaliar a incompatibilidade e decidir pela correção, bloqueio ou manutenção da vaga.
- O candidato recebe confirmação da recepção da denúncia.
- O histórico da ocorrência fica preservado para auditoria.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — barreiras incompatíveis tornam a vaga não elegível.
- RB-06: Status da vaga — a vaga deve manter status consistente após revisão.
- RB-22: Transparência de status — o usuário deve receber retorno claro sobre a disponibilidade da vaga.
- RB-23: Denúncia e apuração — ocorrências de incompatibilidade devem ser registradas para análise interna.
- RB-24: Proteção contra abuso — denúncias repetidas ou falsas podem ser rastreadas e limitar novas submissões.

## Requisitos relacionados

- RF-06 — Busca e filtro.
- RF-07 — Análise de compatibilidade.
- RF-10 — Visualização da vaga.
- RF-25 — Transparência de pontuação.
- RF-38 — Registro de logs e auditoria.
- RF-39 — Tratamento de erros e relatórios de inconsistências.

## Critérios de aceitação

- O candidato consegue denunciar uma vaga incompatível ou inadequada ao seu perfil.
- A denúncia é registrada com motivo, data e vínculo à vaga.
- A equipe responsável recebe a ocorrência para revisão.
- O sistema comunica ao candidato que a denúncia foi registrada e fornece acompanhamento do status da revisão.

---
