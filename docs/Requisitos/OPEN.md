# Questões em Aberto

## OPEN-01 — Decisões arquiteturais dependentes da baseline

Algumas decisões arquiteturais permanecem condicionadas à consolidação da baseline de requisitos, regras de negócio, casos de uso, drivers arquiteturais e ADRs. Essas decisões deverão ser tratadas após a conclusão da revisão da baseline, sem antecipar decisões de implementação.

## Decisões já consolidadas

- A **Empresa** existe como entidade organizacional e pode estar associada a um ou mais usuários com perfil de **Recrutador**.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga nem altera automaticamente a nota de acessibilidade. A denúncia deve ser analisada por um Administrador antes de qualquer decisão.
