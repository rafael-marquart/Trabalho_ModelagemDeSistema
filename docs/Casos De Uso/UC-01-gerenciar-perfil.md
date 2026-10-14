# UC-01 — Gerenciar Perfil

## Objetivo

Cadastrar e atualizar dados pessoais e necessidades funcionais de acessibilidade que alimentam a análise de compatibilidade.

## Ator principal

- Candidato PcD.

## Fluxo Principal

1. O candidato acessa seu perfil.
2. O candidato informa necessidades funcionais e recursos indispensáveis.
3. O candidato pode registrar necessidades por autodeclaração.
4. O sistema valida os campos mínimos de identificação/cadastro explicitamente definidos e aprovados; a lista exata permanece pendente na OPEN-007.1.
5. O sistema permite preencher progressivamente as demais categorias e indica dados insuficientes quando faltarem informações necessárias à análise de uma vaga, sem presumir compatibilidade conforme RB-16.
6. O sistema atualiza o perfil.
7. O sistema registra alterações relevantes para rastreabilidade.

## Exceções e Fluxos Alternativos

- EX01: A ausência de campo mínimo de identificação/cadastro explicitamente definido e aprovado impede o salvamento e é destacada ao candidato. A lista exata permanece pendente na OPEN-007.1.
- EX02: Se faltarem dados necessários à análise de uma vaga, o sistema indica insuficiência de informação sem presumir compatibilidade, conforme RB-16; isso não impede automaticamente o salvamento do perfil.

## Pós-condições

- Perfil atualizado e persistido.
- Alteração relevante registrada.

## Regras de negócio relacionadas

- RB-06 — Necessidades obrigatórias.
- RB-07 — Perfil técnico.
- RB-26 — Confidencialidade das informações de acessibilidade.
- RB-27 — Histórico de alterações.
- RB-28 — Autodeclaração das necessidades.
- RB-29 — Informações mínimas do perfil.

## Requisitos relacionados

- RF-04 — Cadastro de candidato.
- RF-19 — Gestão do perfil e necessidades de acessibilidade.
- RF-38 — Auditoria de operações.

## Critérios de aceitação

- Necessidades podem ser registradas por autodeclaração.
- O sistema não exige nem armazena laudo médico.
- Alterações relevantes ficam registradas.
- O perfil atualizado participa das análises posteriores.
- O salvamento não exige categorias inteiras apenas por existirem no modelo; a ausência de dados necessários à compatibilidade é indicada sem presumir compatibilidade, conforme RB-16.
