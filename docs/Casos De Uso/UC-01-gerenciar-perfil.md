# UC-01 — Gerenciar Perfil

## Objetivo

Cadastrar e atualizar dados pessoais e o vetor de necessidades funcionais (arquitetônicas, comunicacionais, tecnológicas e sensoriais) que alimentará o motor de match.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado na plataforma.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-13 (Calcular Match Determinístico).

## Fluxo Principal

1. O candidato acessa a seção "Meu Perfil" e seleciona "Necessidades de Acessibilidade".
2. O candidato marca os recursos indispensáveis para sua rotina de trabalho (ex.: presença de rampa, elevador falado, leitor de tela, intérprete de LIBRAS, flexibilidade de horário).
3. O candidato informa, quando necessário, as necessidades por autodeclaração.
4. O candidato confirma o salvamento dos dados.
5. O sistema valida os campos, estrutura o vetor funcional e atualiza a base do candidato.

## Exceções e Fluxos Alternativos

- EX01 (Campos Obrigatórios Incompletos): Caso o candidato tente salvar o perfil sem selecionar os requisitos de acessibilidade essenciais, o sistema impede o salvamento e destaca as pendências.

## Pós-condições

- Vetor funcional do candidato atualizado e persistido.
- Versão do vetor e data de última atualização gravadas para auditoria.

## Regras de negócio relacionadas
\n- RB-06: Necessidades obrigatórias — o candidato pode definir necessidades de acessibilidade que devem ser consideradas como obrigatórias.
- RB-07: Perfil técnico — o perfil técnico do candidato participa da análise de compatibilidade.
- RB-26: Confidencialidade das informações de acessibilidade — dados de acessibilidade devem ser acessíveis somente conforme autorização.
- RB-27: Histórico de alterações — alterações relevantes devem ser registradas para rastreabilidade.
- RB-28: Autodeclaração das necessidades — o candidato pode informar suas necessidades de acessibilidade por autodeclaração.
- RB-29: Informações mínimas do perfil — o perfil deve possuir os dados mínimos necessários para as funcionalidades dependentes dele.

## Requisitos relacionados
\n- RF-04 — Cadastro de candidato.
- RF-19 — Gestão do perfil e necessidades de acessibilidade.
- RF-38 — Auditoria de operações.

## Critérios de aceitação

- O candidato consegue salvar o vetor funcional quando os campos obrigatórios estão preenchidos.
- Laudos/documentos aceitos são armazenados e vinculados ao perfil; tipos inválidos são rejeitados com mensagem clara.
- Alterações ao vetor geram nova versão com timestamp.
- Perfil atualizado é considerado pelo motor de match (UC-13) nas buscas subsequentes.

---
