# Questões em Aberto


## OPEN-02 — Representação de usuário e recrutador no modelo conceitual

A baseline funcional define que a **Empresa** é uma entidade organizacional associada a usuários com perfil de **Recrutador**. Porém, o modelo conceitual atual não apresenta uma entidade explícita **USUARIO** nem **RECRUTADOR**, nem define seus atributos e relacionamentos.

**Decisão necessária:** definir como usuários e o perfil de recrutador serão representados no modelo conceitual e como a associação entre usuário, perfil e empresa será formalizada.

**Impacto:** SPEC-001, SPEC-004, SPEC-006, SPEC-013 e SPEC-015.

## OPEN-03 — Representação de selo de acessibilidade no modelo conceitual

RF-15 e UC-14 definem a gestão de **selos de acessibilidade**, incluindo concessão, atualização e remoção por Administrador. Entretanto, o modelo conceitual atual não apresenta uma entidade **SELO**, seus atributos ou seus relacionamentos.

**Decisão necessária:** definir a entidade SELO e sua relação com a empresa e/ou demais dados que sustentam os critérios de concessão.

**Impacto:** SPEC-023 e, conforme a decisão, as capacidades de consulta e transparência de acessibilidade.

## Decisões consolidadas

- A **Empresa** existe como entidade organizacional e pode estar associada a um ou mais usuários com perfil de **Recrutador**.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga nem altera automaticamente a nota de acessibilidade. A denúncia deve ser analisada por um Administrador antes de qualquer decisão.
- A deduplicação definida em **RB-31** aplica-se aos dados externos importados.
- O funil de seleção utiliza os estados e transições formalizados em \`docs/Fluxos e Estados/estados-trilha.md\`.
