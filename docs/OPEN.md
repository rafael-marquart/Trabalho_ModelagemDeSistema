# Questões em Aberto


## OPEN-02 — Representação de usuário e recrutador no modelo conceitual

A baseline funcional define que a **Empresa** é uma entidade organizacional associada a usuários com perfil de **Recrutador**. Porém, o modelo conceitual atual não apresenta uma entidade explícita **USUARIO** nem **RECRUTADOR**, nem define seus atributos e relacionamentos.

**Decisão necessária:** definir como usuários e o perfil de recrutador serão representados no modelo conceitual e como a associação entre usuário, perfil e empresa será formalizada.

**Impacto:** SPEC-001, SPEC-004, SPEC-006, SPEC-013 e SPEC-015.


## Decisões consolidadas

- A **Empresa** existe como entidade organizacional e pode estar associada a um ou mais usuários com perfil de **Recrutador**.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga nem altera automaticamente a nota de acessibilidade. A denúncia deve ser analisada por um Administrador antes de qualquer decisão.
- A deduplicação definida em **RB-31** aplica-se aos dados externos importados.
- O funil de seleção utiliza os estados e transições formalizados em \`docs/Fluxos e Estados/estados-trilha.md\`.
