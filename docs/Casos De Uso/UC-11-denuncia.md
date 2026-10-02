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

1. O usuário registra uma denúncia de incompatibilidade.
2. O sistema registra a denúncia e a encaminha ao Administrador.
3. O Administrador analisa a denúncia e os dados disponíveis.
4. O Administrador registra a decisão da apuração.
5. Eventual bloqueio, correção ou alteração de nota ocorre somente conforme a decisão administrativa e as regras aplicáveis.

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

- RB-20
- RB-24
- RB-25
- RB-37
- RB-44
- RB-45

## Requisitos relacionados

- RF-14
- RF-22
- RF-38
- RF-39

## Critérios de aceitação

- O candidato consegue denunciar uma vaga incompatível ou inadequada ao seu perfil.
- A denúncia é registrada com motivo, data e vínculo à vaga.
- A equipe responsável recebe a ocorrência para revisão.
- O sistema comunica ao candidato que a denúncia foi registrada e fornece acompanhamento do status da revisão.

---
