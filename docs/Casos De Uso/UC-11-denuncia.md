# UC-11 — Denunciar Vaga Incompatível

## Objetivo

Permitir que um candidato autenticado com acesso à vaga reporte uma possível incompatibilidade relacionada à acessibilidade ou uma possível falsa inclusão associada à vaga, para análise administrativa.

## Ator principal

- Candidato autenticado com acesso à vaga.

## Pré-condições

- O candidato deve estar autenticado no sistema.
- O candidato deve ter acesso à vaga no catálogo ou no detalhe da oportunidade.
- O candidato deve identificar uma possível incompatibilidade relacionada à acessibilidade ou uma possível falsa inclusão associada à vaga.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-12 (Status da Vaga).

## Fluxo Principal

1. O candidato seleciona uma vaga válida e informa a categoria da situação: possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga.
2. O candidato preenche a descrição/justificativa da denúncia; pode anexar evidências adicionais, mas isso não é obrigatório. O sistema não exige laudo médico nem documento pessoal sensível como condição de registro.
3. O sistema vincula a denúncia à vaga e, por meio dela, à Empresa responsável. Se a denúncia questionar uma avaliação específica, pode ser vinculada ao registro correspondente após validação; esse vínculo não é obrigatório quando nenhuma avaliação específica é questionada.
4. O sistema registra a denúncia e a encaminha ao Administrador.
5. O Administrador analisa a denúncia e os dados disponíveis.
6. O Administrador registra a decisão da apuração.
7. Eventual bloqueio, correção ou alteração de nota ocorre somente conforme a decisão administrativa e as regras aplicáveis.

## Exceções e Fluxos Alternativos

- EX01 (Denúncia sem motivo válido): Se o candidato não preencher a justificativa mínima, o sistema bloqueia o envio e solicita dados complementares.
- EX02 (Vaga já revisada): Se a vaga já foi analisada recentemente, o sistema informa que a denúncia foi registrada anteriormente e apresenta o status da revisão.
- EX03 (Denúncia duplicada): Se o mesmo candidato denunciar a mesma vaga em pouco intervalo de tempo, o sistema bloqueia a duplicidade e informa o status atual da ocorrência.

## Pós-condições

- A denúncia é registrada no sistema e vinculada à vaga e à Empresa responsável por meio da vaga; quando aplicável, também pode ficar vinculada à avaliação específica questionada.
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

- Um candidato autenticado com acesso à vaga consegue denunciar possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga.
- A denúncia é registrada com categoria da situação, descrição/justificativa, data e vínculo à vaga e à Empresa responsável; evidências adicionais são opcionais. Quando a denúncia questiona avaliação específica, pode haver vínculo à avaliação correspondente após validação. O registro e as evidências, por si sós, não comprovam irregularidade, não bloqueiam a vaga nem alteram automaticamente a nota.
- A equipe responsável recebe a ocorrência para revisão.
- O sistema comunica ao candidato que a denúncia foi registrada e fornece acompanhamento do status da revisão.

---
