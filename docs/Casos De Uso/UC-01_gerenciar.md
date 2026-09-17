# UC-01 — Gerenciar Perfil e Necessidades Funcionais

## Objetivo

Cadastrar e atualizar dados pessoais, laudos/documentações e o vetor de necessidades funcionais (arquitetônicas, comunicacionais, tecnológicas e sensoriais) que alimentará o motor de match.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado na plataforma.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): Validar Estrutura do Vetor de Acessibilidade.

## Fluxo Principal

1. O candidato acessa a seção "Meu Perfil" e seleciona "Necessidades de Acessibilidade".
2. O candidato marca os recursos indispensáveis para sua rotina de trabalho (ex.: presença de rampa, elevador falado, leitor de tela, intérprete de LIBRAS, flexibilidade de horário).
3. O candidato faz o upload opcional de laudo ou autodeclaração.
4. O candidato confirma o salvamento dos dados.
5. O sistema valida os campos, estrutura o vetor funcional e atualiza a base do candidato.

## Exceções e Fluxos Alternativos

- EX01 (Campos Obrigatórios Incompletos): Caso o candidato tente salvar o perfil sem selecionar os requisitos de acessibilidade essenciais, o sistema impede o salvamento e destaca as pendências.
- FA01 (Atualização Dinâmica de Laudo): O candidato pode anexar ou substituir laudos médicos a qualquer momento sem alterar seu vetor funcional básico.

## Pós-condições

- Vetor funcional do candidato atualizado e persistido.
- Laudos/documentações armazenados com controle de acesso e vínculo ao perfil.
- Versão do vetor e data de última atualização gravadas para auditoria.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — apenas vagas compatíveis com necessidades essenciais são apresentadas no motor de busca (aplicado em UC02).
- RB-06: Necessidades obrigatórias — determinados itens do vetor podem ser marcados como obrigatórios pelo candidato (ex.: intérprete de LIBRAS), tornando-os eliminatórios no cálculo de compatibilidade.
- RB-07: Perfil técnico — o vetor de necessidades deve ser combinado com o perfil técnico ao calcular match.
- RB-26: Validação de documentos — laudos aceitos têm formato, tamanho e validade definidos; documentos inválidos ou expirados devem ser sinalizados.
- RB-27: Confidencialidade de documentação — laudos e documentos sensíveis só são visíveis para usuários autorizados (recrutador com permissão) e dentro do contexto de candidatura.
- RB-28: Histórico de alterações — alterações no vetor funcional devem ser versionadas com carimbo de tempo para rastreabilidade.
- RB-29: Autodeclaração — o candidato pode optar por autodeclarar necessidades quando não possuir laudo; nesse caso, o sistema deve indicar a natureza da informação (autodeclarada vs. comprovada).
- RB-30: Entrada mínima — para que o candidato seja elegível ao UC02, um vetor funcional básico (conjunto mínimo de campos) deve estar preenchido.

## Requisitos relacionados

- RF-01 — Cadastro de usuário (manutenção de dados pessoais).
- RF-05 — Interface acessível (telas de edição e upload compatíveis com leitores de tela e navegação por teclado).
- RF-08 — Identificação de barreiras (modelagem do vetor e campos obrigatórios).
- RF-19 — Upload seguro de documentos (controle de tipos, tamanho, armazenamento seguro e expiração).
- RF-20 — Versionamento de perfil (registro de alterações e data/hora).
- RF-21 — Formulários dinâmicos (validadores e ajuda contextual para preenchimento de necessidades).
- RF-22 — Preferências de privacidade (controle sobre quem pode ver documentos/necessidades).
- RF-23 — Notificações (confirmar atualização de perfil por e-mail/SMS se configurado).

## Critérios de aceitação

- O candidato consegue salvar o vetor funcional quando os campos obrigatórios estão preenchidos.
- Laudos/documentos aceitos são armazenados e vinculados ao perfil; tipos inválidos são rejeitados com mensagem clara.
- Alterações ao vetor geram nova versão com timestamp.
- Perfil atualizado é considerado pelo motor de match (UC13) nas buscas subsequentes.

---
