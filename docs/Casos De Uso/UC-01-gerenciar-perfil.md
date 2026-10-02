# UC-01 — Gerenciar Perfil

## Objetivo

Cadastrar e atualizar dados pessoais e necessidades funcionais de acessibilidade que alimentam a análise de compatibilidade.

## Ator principal

- Candidato PcD.

## Fluxo Principal

1. O candidato acessa seu perfil.
2. O candidato informa necessidades funcionais e recursos indispensáveis.
3. O candidato pode registrar necessidades por autodeclaração.
4. O sistema valida os dados mínimos e atualiza o perfil.
5. O sistema registra alterações relevantes para rastreabilidade.

## Exceções e Fluxos Alternativos

- EX01: Dados mínimos incompletos impedem o salvamento e são destacados ao candidato.

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
