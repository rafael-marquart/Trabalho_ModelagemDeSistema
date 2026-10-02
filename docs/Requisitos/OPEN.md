# Questões em Aberto

## OPEN-01 — Consolidação da baseline

A baseline funcional e arquitetural foi revisada conforme as decisões registradas no projeto. Permanecem em aberto apenas decisões técnicas ou de modelagem que ainda não possuem fundamento suficiente nos requisitos, regras de negócio, drivers ou ADRs.

## Decisões consolidadas

- A **Empresa** existe como entidade organizacional e pode estar associada a um ou mais usuários com perfil de **Recrutador**.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga nem altera automaticamente a nota de acessibilidade. A denúncia deve ser analisada por um Administrador antes de qualquer decisão.
- A deduplicação definida em **RB-31** aplica-se aos dados externos importados.
- O funil de seleção utiliza os estados e transições formalizados em `docs/Fluxos e Estados/estados-trilha.md`.
