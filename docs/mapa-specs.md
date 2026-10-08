# Mapa de Specs — AcessaVagas

## 1. Objetivo

Este arquivo apresenta o **mapa ordenado de Specs** do AcessaVagas, derivado da baseline de requisitos, regras de negócio, RNFs, casos de uso, modelo conceitual, Drivers Arquiteturais e ADRs.

A decomposição segue o critério do processo SDD: **capacidades verticais observáveis**, pequenas o suficiente para implementação e validação isoladas, sem transformar mecanicamente cada RF em uma Spec e sem criar Specs independentes para RNFs transversais.

> **Importante:** este arquivo é somente o mapa. O conteúdo completo de cada Spec, código, banco, endpoints ou contratos técnicos detalhados não faz parte desta etapa.

## 2. Questões em aberto que afetam o mapa

A baseline possui duas lacunas de modelagem que não foram resolvidas silenciosamente:

- **OPEN-02:** a baseline funcional define usuários com perfil de Recrutador associados à Empresa, mas o modelo conceitual não possui uma entidade explícita para usuário/recrutador.
- **OPEN-03:** RF-15 e UC-14 definem gestão de selos, mas o modelo conceitual não possui uma entidade **SELO**.

As Specs que dependem dessas definições registram explicitamente essas questões.

---

## 3. Mapa ordenado

### SPEC-001 — Acessar a plataforma e identificar perfil organizacional

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-001 |
| **Objetivo** | Permitir cadastro, autenticação, recuperação de senha, aplicação das permissões correspondentes aos perfis de acesso e, para o perfil de Recrutador, o cadastro/associação da Empresa responsável pela atuação na plataforma. |
| **Valor** | Estabelece a identidade, a autorização e o vínculo organizacional necessários para que candidatos, recrutadores e administradores acessem as capacidades correspondentes. |
| **RF** | RF-01, RF-02, RF-03, RF-17, RF-40 |
| **RB** | RB-12, RB-21, RB-22, RB-27 |
| **RNF** | RNF-07, RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-00 — Login; UC-07 — Infraestrutura / gestão da empresa |
| **Entidades** | CANDIDATO, ADMINISTRADOR, EMPRESA; associação de USUÁRIO/RECRUTADOR depende de OPEN-02. |
| **Drivers** | DA-02 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | Nenhuma. |
| **Justificativa da ordem** | A entrada na plataforma e a identificação do perfil organizacional formam uma capacidade inicial única: primeiro o usuário é autenticado e autorizado e, quando aplicável, estabelece seu vínculo com a Empresa. As capacidades posteriores dependem dessa identidade e autorização. |

### SPEC-002 — Gerenciar perfil e necessidades de acessibilidade do candidato

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-002 |
| **Objetivo** | Permitir ao candidato cadastrar, consultar e atualizar dados profissionais e necessidades funcionais de acessibilidade. |
| **Valor** | Disponibiliza os dados necessários para busca, compatibilidade e candidatura, preservando a possibilidade de autodeclaração. |
| **RF** | RF-04, RF-19 |
| **RB** | RB-06, RB-26, RB-27, RB-28, RB-29 |
| **RNF** | RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-01 — Gerenciar Perfil |
| **Entidades** | CANDIDATO, VETOR_ACESSIBILIDADE_CANDIDATO |
| **Drivers** | DA-01, DA-02 |
| **ADRs** | ADR-001, ADR-002, ADR-004 |
| **Dependências** | SPEC-001. |
| **Justificativa da ordem** | O perfil do candidato é uma entrada necessária para o cálculo de compatibilidade e para a elegibilidade da candidatura. |

### SPEC-003 — Disponibilizar recursos de acessibilidade da interface

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-003 |
| **Objetivo** | Disponibilizar os recursos funcionais de acessibilidade previstos para uso da plataforma, incluindo leitores de tela, navegação por teclado, alto contraste e comandos de voz. |
| **Valor** | Permite que usuários PcD utilizem as capacidades do sistema com autonomia. |
| **RF** | RF-16 |
| **RB** | — |
| **RNF** | RNF-01, RNF-02, RNF-03, RNF-04, RNF-13 |
| **UC / fluxo** | UC-00, UC-01, UC-02 e UC-03, como capacidade transversal da interação. |
| **Entidades** | — |
| **Drivers** | DA-01 |
| **ADRs** | ADR-001 |
| **Dependências** | SPEC-001. |
| **Justificativa da ordem** | RF-16 é uma capacidade funcional observável, distinta dos RNFs transversais; por isso a Spec trata os recursos funcionais de acessibilidade sem transformar RNFs em Specs independentes. |

### SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-004 |
| **Objetivo** | Permitir registrar e manter as informações de acessibilidade física, digital e atitudinal da empresa. |
| **Valor** | Fornece dados objetivos de acessibilidade usados na transparência e na análise de compatibilidade. |
| **RF** | RF-17 |
| **RB** | RB-08, RB-20, RB-27, RB-37 |
| **RNF** | RNF-09, RNF-14 |
| **UC / fluxo** | UC-07 — Infraestrutura |
| **Entidades** | EMPRESA, INFRAESTRUTURA_EMPRESA |
| **Drivers** | DA-01, DA-04, DA-07 |
| **ADRs** | ADR-001, ADR-004 |
| **Dependências** | SPEC-001. |
| **Justificativa da ordem** | A infraestrutura é uma capacidade distinta do cadastro organizacional e precisa estar disponível antes da publicação e análise de vagas. |

### SPEC-005 — Cadastrar e gerenciar vagas próprias

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Objetivo** | Permitir que recrutadores autorizados cadastrem, editem, publiquem e gerenciem vagas próprias da empresa. |
| **Valor** | Disponibiliza vagas internas com informações necessárias para busca, transparência e compatibilidade. |
| **RF** | RF-18, RF-25 |
| **RB** | RB-01, RB-13, RB-16, RB-27 |
| **RNF** | RNF-07, RNF-09, RNF-14 |
| **UC / fluxo** | UC-08 — Publicar Vaga |
| **Entidades** | EMPRESA, VAGA, TRAVA_CRITICA_VAGA, INFRAESTRUTURA_EMPRESA |
| **Drivers** | DA-02, DA-03, DA-04 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-001, SPEC-004. |
| **Justificativa da ordem** | A vaga própria depende da empresa e das informações de acessibilidade que serão utilizadas nas etapas posteriores. |

### SPEC-006 — Importar e normalizar vagas externas

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-006 |
| **Objetivo** | Receber dados externos estruturados, validar, normalizar, deduplicar e registrar a origem das vagas antes de disponibilizá-las ao domínio. |
| **Valor** | Permite ampliar o catálogo sem perder integridade, rastreabilidade ou padronização. |
| **RF** | RF-05, RF-36, RF-37, RF-38, RF-39 |
| **RB** | RB-10, RB-11, RB-17, RB-18, RB-31, RB-32, RB-33, RB-37, RB-41 |
| **RNF** | RNF-05, RNF-09, RNF-14, RNF-16 |
| **UC / fluxo** | UC-14 — Ingestão de JSON |
| **Entidades** | VAGA |
| **Drivers** | DA-05, DA-06, DA-08 |
| **ADRs** | ADR-003, ADR-004 |
| **Dependências** | SPEC-001. |
| **Justificativa da ordem** | A ingestão externa precisa produzir uma vaga válida no modelo da plataforma antes de entrar na busca e na compatibilidade. |

### SPEC-007 — Calcular compatibilidade entre candidato e vaga

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-007 |
| **Objetivo** | Calcular deterministically a compatibilidade entre candidato e vaga, verificando primeiro barreiras críticas e necessidades obrigatórias e, quando aplicável, calculando o score ponderado. |
| **Valor** | Evita que o candidato avance em vagas incompatíveis e fornece resultado consistente para recomendação e transparência. |
| **RF** | RF-07, RF-08, RF-09, RF-24, RF-25 |
| **RB** | RB-02, RB-03, RB-04, RB-05, RB-06, RB-07, RB-15, RB-16, RB-30 |
| **RNF** | RNF-10, RNF-15 |
| **UC / fluxo** | UC-13 — Match; acionado também por UC-02 e UC-03. |
| **Entidades** | CANDIDATO, VETOR_ACESSIBILIDADE_CANDIDATO, VAGA, TRAVA_CRITICA_VAGA |
| **Drivers** | DA-03, DA-04 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-002, SPEC-005, SPEC-006. |
| **Justificativa da ordem** | A compatibilidade depende de candidato e vaga estruturados; deve existir antes da busca final e do registro de candidatura. |

### SPEC-008 — Buscar e filtrar vagas

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-008 |
| **Objetivo** | Permitir localizar e filtrar vagas por critérios relevantes, considerando a elegibilidade e os resultados de compatibilidade disponíveis. |
| **Valor** | Reduz o esforço de busca e evita apresentar como recomendáveis vagas incompatíveis. |
| **RF** | RF-06, RF-09 |
| **RB** | RB-02, RB-03, RB-04, RB-05, RB-10, RB-13, RB-16, RB-17, RB-30 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-13 |
| **UC / fluxo** | UC-02 — Buscar Vagas |
| **Entidades** | VAGA, EMPRESA, INFRAESTRUTURA_EMPRESA, TRAVA_CRITICA_VAGA |
| **Drivers** | DA-01, DA-03, DA-04, DA-06, DA-08 |
| **ADRs** | ADR-001, ADR-004 |
| **Dependências** | SPEC-002, SPEC-005, SPEC-006, SPEC-007. |
| **Justificativa da ordem** | A busca depende do catálogo e do mecanismo de compatibilidade para aplicar as restrições relevantes. |

### SPEC-009 — Visualizar vaga e resultado de compatibilidade

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-009 |
| **Objetivo** | Exibir detalhes da vaga, informações de acessibilidade e os principais fatores considerados no resultado de compatibilidade. |
| **Valor** | Garante transparência antes da candidatura e permite decisão informada. |
| **RF** | RF-10, RF-24, RF-25 |
| **RB** | RB-13, RB-16, RB-30 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-08 |
| **UC / fluxo** | UC-02 — Buscar Vagas |
| **Entidades** | VAGA, EMPRESA, INFRAESTRUTURA_EMPRESA, TRAVA_CRITICA_VAGA |
| **Drivers** | DA-01, DA-03, DA-04, DA-06 |
| **ADRs** | ADR-001, ADR-004 |
| **Dependências** | SPEC-007, SPEC-008. |
| **Justificativa da ordem** | A visualização transparente só pode ser validada depois que a vaga e o resultado de compatibilidade existem. |

### SPEC-010 — Registrar candidatura

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-010 |
| **Objetivo** | Registrar uma candidatura somente quando a vaga estiver disponível, elegível e sem incompatibilidade crítica, respeitando a unicidade de candidatura ativa. |
| **Valor** | Permite ao candidato iniciar formalmente um processo seletivo sem contornar as regras de acessibilidade. |
| **RF** | RF-26 |
| **RB** | RB-01, RB-14, RB-15, RB-34, RB-42 |
| **RNF** | RNF-07, RNF-09, RNF-10, RNF-15 |
| **UC / fluxo** | UC-03 — Candidatar |
| **Entidades** | CANDIDATO, VAGA, CANDIDATURA |
| **Drivers** | DA-02, DA-03, DA-04 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-001, SPEC-002, SPEC-007, SPEC-009. |
| **Justificativa da ordem** | A candidatura depende de identidade, perfil, vaga elegível e compatibilidade previamente estabelecidos. |

### SPEC-011 — Gerenciar candidatura pelo candidato

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-011 |
| **Objetivo** | Permitir ao candidato consultar e gerenciar sua candidatura, incluindo o cancelamento quando permitido pelas regras do processo. |
| **Valor** | Dá autonomia ao candidato sobre sua participação no processo seletivo. |
| **RF** | RF-28, RF-34 |
| **RB** | RB-23, RB-36, RB-41, RB-42 |
| **RNF** | RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-05 — Funil / UC-12 — Status da Vaga |
| **Entidades** | CANDIDATO, CANDIDATURA, VAGA |
| **Drivers** | DA-02, DA-07 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-010. |
| **Justificativa da ordem** | A gestão da candidatura só existe depois do seu registro e depende de seus estados e regras de cancelamento. |

### SPEC-012 — Gerenciar processo seletivo e funil

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-012 |
| **Objetivo** | Permitir ao recrutador autorizado consultar candidatos e administrar o andamento das candidaturas no funil, respeitando estados e transições válidas. |
| **Valor** | Estrutura o processo seletivo da empresa e evita alterações de etapa inconsistentes. |
| **RF** | RF-20, RF-30, RF-35 |
| **RB** | RB-23, RB-27, RB-37, RB-38, RB-39, RB-40, RB-41, RB-42, RB-43 |
| **RNF** | RNF-07, RNF-09, RNF-14, RNF-15 |
| **UC / fluxo** | UC-09 — Gerenciar Funil; estados e transições definidos em docs/Fluxos e Estados/estados-trilha.md. |
| **Entidades** | CANDIDATURA, VAGA, ENTREVISTA; RECRUTADOR/USUÁRIO depende de OPEN-02. |
| **Drivers** | DA-02, DA-07 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-001, SPEC-004, SPEC-010. |
| **Justificativa da ordem** | A gestão do funil depende de recrutador autorizado, empresa/vaga e candidaturas já registradas. |

### SPEC-013 — Solicitar acomodação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-013 |
| **Objetivo** | Permitir ao candidato solicitar acomodações necessárias para participar do processo seletivo. |
| **Valor** | Transforma necessidades declaradas em uma solicitação formal de apoio no processo. |
| **RF** | RF-29 |
| **RB** | RB-26, RB-27, RB-40 |
| **RNF** | RNF-08, RNF-09 |
| **UC / fluxo** | UC-04 — Acomodação |
| **Entidades** | CANDIDATURA, SOLICITACAO_ACOMODACAO |
| **Drivers** | DA-02 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-010, SPEC-011. |
| **Justificativa da ordem** | A solicitação depende de uma candidatura existente e de acesso autorizado às informações de acessibilidade. |

### SPEC-014 — Processar solicitação de acomodação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-014 |
| **Objetivo** | Permitir ao recrutador autorizado consultar, tratar e registrar decisões sobre solicitações de acomodação, mantendo histórico. |
| **Valor** | Dá continuidade operacional às solicitações e preserva rastreabilidade das decisões. |
| **RF** | RF-32, RF-33 |
| **RB** | RB-23, RB-27, RB-37, RB-40, RB-41 |
| **RNF** | RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-04 — Acomodação; UC-09 — Gerenciar Funil |
| **Entidades** | SOLICITACAO_ACOMODACAO, CANDIDATURA; RECRUTADOR/USUÁRIO depende de OPEN-02. |
| **Drivers** | DA-02, DA-07 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-012, SPEC-013. |
| **Justificativa da ordem** | O tratamento exige uma solicitação já registrada e um recrutador autorizado para decidir sobre ela. |

### SPEC-015 — Acompanhar candidatura e processo seletivo

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-015 |
| **Objetivo** | Permitir ao candidato acompanhar etapas e status da candidatura durante o processo seletivo. |
| **Valor** | Dá visibilidade sobre o andamento do processo e reduz incerteza sobre a situação da candidatura. |
| **RF** | RF-11, RF-31 |
| **RB** | RB-23, RB-36, RB-42, RB-43 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-08 |
| **UC / fluxo** | UC-05 — Funil |
| **Entidades** | CANDIDATURA, VAGA, ENTREVISTA |
| **Drivers** | DA-01, DA-02, DA-07 |
| **ADRs** | ADR-001, ADR-002, ADR-004 |
| **Dependências** | SPEC-011, SPEC-012. |
| **Justificativa da ordem** | O acompanhamento depende dos estados efetivamente registrados no funil. |

### SPEC-016 — Notificar alterações do processo seletivo

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-016 |
| **Objetivo** | Informar alterações relevantes em vagas, candidaturas e etapas do processo seletivo. |
| **Valor** | Mantém candidatos informados sobre mudanças que afetam sua participação. |
| **RF** | RF-12, RF-27 |
| **RB** | RB-23, RB-42 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-08 |
| **UC / fluxo** | UC-12 — Status da Vaga; UC-05 — Funil |
| **Entidades** | VAGA, CANDIDATURA |
| **Drivers** | DA-02, DA-08 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-011, SPEC-012, SPEC-015. |
| **Justificativa da ordem** | As notificações precisam de eventos de mudança de status já produzidos pelas capacidades de candidatura e funil. |

### SPEC-017 — Avaliar processo seletivo

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-017 |
| **Objetivo** | Permitir ao candidato registrar avaliação sobre a acessibilidade e a experiência encontrada no processo seletivo. |
| **Valor** | Produz dados de avaliação que alimentam transparência e reputação de acessibilidade. |
| **RF** | RF-21 |
| **RB** | RB-19, RB-20, RB-24, RB-27, RB-37 |
| **RNF** | RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-06 — Avaliar |
| **Entidades** | ENTREVISTA, AVALIACAO_POS_ENTREVISTA |
| **Drivers** | DA-07 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-012, SPEC-015. |
| **Justificativa da ordem** | A avaliação depende de participação no processo seletivo e de uma entrevista/processo já existente para contextualizar o registro. |

### SPEC-018 — Denunciar incompatibilidade ou falsa inclusão

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-018 |
| **Objetivo** | Permitir registrar denúncia sobre divergência de acessibilidade, incompatibilidade ou falsa inclusão, sem produzir bloqueio ou alteração automática. |
| **Valor** | Cria um mecanismo formal de sinalização de problemas de acessibilidade. |
| **RF** | RF-14 |
| **RB** | RB-24, RB-25, RB-27, RB-37, RB-44 |
| **RNF** | RNF-08, RNF-14 |
| **UC / fluxo** | UC-11 — Denúncia |
| **Entidades** | DENUNCIA_FALSA_INCLUSAO, AVALIACAO_POS_ENTREVISTA, EMPRESA |
| **Drivers** | DA-07 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-017. |
| **Justificativa da ordem** | A denúncia usa informações do processo/avaliação e deve existir antes da capacidade administrativa de moderação. |

### SPEC-019 — Moderar denúncias de incompatibilidade

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-019 |
| **Objetivo** | Permitir ao Administrador consultar, analisar e decidir sobre denúncias antes de qualquer bloqueio ou alteração de nota. |
| **Valor** | Evita decisões automáticas sobre reputação ou disponibilidade de vagas e estabelece apuração administrativa. |
| **RF** | RF-22 |
| **RB** | RB-20, RB-24, RB-25, RB-27, RB-37, RB-44, RB-45 |
| **RNF** | RNF-07, RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-11 — Denúncia |
| **Entidades** | ADMINISTRADOR, DENUNCIA_FALSA_INCLUSAO, AVALIACAO_POS_ENTREVISTA, EMPRESA |
| **Drivers** | DA-02, DA-07 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-001, SPEC-018. |
| **Justificativa da ordem** | A moderação depende da denúncia registrada e da identidade administrativa autorizada. |

### SPEC-020 — Gerenciar nota pública de acessibilidade

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-020 |
| **Objetivo** | Calcular, atualizar e disponibilizar a nota pública de acessibilidade da empresa com base em informações e avaliações válidas, respeitando decisões administrativas. |
| **Valor** | Oferece transparência pública sobre acessibilidade sem expor a identidade dos avaliadores. |
| **RF** | RF-13 |
| **RB** | RB-19, RB-20, RB-27, RB-37, RB-44, RB-45 |
| **RNF** | RNF-08, RNF-09, RNF-14 |
| **UC / fluxo** | UC-06 — Avaliar; UC-11 — Denúncia |
| **Entidades** | EMPRESA, AVALIACAO_POS_ENTREVISTA, DENUNCIA_FALSA_INCLUSAO |
| **Drivers** | DA-07 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-017, SPEC-019. |
| **Justificativa da ordem** | A nota depende de avaliações válidas e, quando aplicável, das decisões administrativas que podem afetar os dados considerados. |

### SPEC-021 — Consultar status e disponibilidade da vaga

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-021 |
| **Objetivo** | Permitir consultar o estado atual da vaga e refletir alterações que afetem a possibilidade de candidatura. |
| **Valor** | Evita candidaturas em vagas encerradas ou indisponíveis e mantém o candidato informado. |
| **RF** | RF-10, RF-12, RF-27 |
| **RB** | RB-01, RB-23, RB-42 |
| **RNF** | RNF-05, RNF-08, RNF-09 |
| **UC / fluxo** | UC-12 — Status da Vaga |
| **Entidades** | VAGA, CANDIDATURA |
| **Drivers** | DA-02, DA-08 |
| **ADRs** | ADR-002, ADR-004 |
| **Dependências** | SPEC-005, SPEC-006, SPEC-010, SPEC-012. |
| **Justificativa da ordem** | O status precisa refletir o estado real de vagas e processos já cadastrados para ser usado na elegibilidade e comunicação ao candidato. |


---

### SPEC-022 — Ingerir dados externos

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-022 |
| **Objetivo** | Permitir a ingestão de dados estruturados provenientes de fontes externas, especialmente vagas, realizando validação, normalização, deduplicação e registro da origem antes da disponibilização para uso na plataforma. |
| **Valor** | Integra fontes externas ao AcessaVagas de forma controlada, reduzindo inconsistências e preservando a rastreabilidade dos dados importados. |
| **RF** | RF-05, RF-36, RF-37, RF-38, RF-39 |
| **RB** | RB-10, RB-11, RB-17, RB-18, RB-31, RB-32, RB-33, RB-37, RB-41 |
| **RNF** | RNF-07, RNF-09, RNF-14, RNF-16 |
| **UC / fluxo** | UC-14 — Ingerir Dados em JSON |
| **Entidades** | VAGA e dados estruturados de origem externa; detalhes de integração dependem da implementação técnica. |
| **Drivers** | DA-02, DA-07 |
| **ADRs** | ADR-002, ADR-003, ADR-004 |
| **Dependências** | SPEC-001, SPEC-004, SPEC-005, SPEC-019, SPEC-020, SPEC-021. |
| **Justificativa da ordem** | A ingestão externa depende de identidade/autorização, estrutura de vagas e capacidades de validação e auditoria. Os dados importados devem estar normalizados e validados antes de serem utilizados pelas demais capacidades da plataforma. |

## 4. Dependências resumidas

A ordem proposta é:

**SPEC-001**
→ **SPEC-002**, **SPEC-003**, **SPEC-004**
→ **SPEC-005**, **SPEC-006**
→ **SPEC-007**
→ **SPEC-008**
→ **SPEC-009**
→ **SPEC-010**
→ **SPEC-011**, **SPEC-012**
→ **SPEC-013**
→ **SPEC-014**
→ **SPEC-015**
→ **SPEC-016**
→ **SPEC-017**
→ **SPEC-018**
→ **SPEC-019**
→ **SPEC-020**
→ **SPEC-021**
→ **SPEC-022**

A ordem não significa que cada Spec precise ser implementada de forma estritamente serial quando não houver dependência direta; ela representa uma **ordem de implementação e validação orientada pelas dependências funcionais e arquiteturais**.

## 5. RNFs transversais

Os RNFs não foram transformados em Specs independentes. Eles foram associados às capacidades em que são verificáveis, conforme a orientação do processo SDD.

Em especial:

- **RNF-01 a RNF-04 e RNF-13:** aplicam-se principalmente às Specs de interação e consulta.
- **RNF-05 e RNF-06:** aplicam-se às operações de busca, consulta, candidatura, administração e integração.
- **RNF-07 e RNF-08:** aplicam-se às capacidades que tratam identidade, autorização e dados pessoais.
- **RNF-09 e RNF-10:** aplicam-se às capacidades de domínio e persistência de dados críticos.
- **RNF-11 e RNF-12:** permanecem transversais à evolução da solução.
- **RNF-14 e RNF-15:** aplicam-se especialmente às capacidades auditáveis e às regras críticas.
- **RNF-16:** aplica-se principalmente à importação, normalização e integração de dados externos.

## 6. Decisões arquiteturais transversais

As ADRs não originam Specs técnicas independentes:

- **ADR-001:** acessibilidade incorporada à camada de apresentação.
- **ADR-002:** autenticação e autorização centralizadas no backend.
- **ADR-003:** LLM isolada no backend por adaptador e submetida à validação.
- **ADR-004:** separação em camadas e concentração das regras de domínio.

## 7. Questões em aberto

- **OPEN-02:** representação de USUÁRIO/RECRUTADOR no modelo conceitual.

Nenhuma dessas lacunas foi resolvida silenciosamente neste mapa.

## 8. Parada obrigatória

Este documento contém **somente o mapa de Specs**.

Após a aprovação humana do mapa:

1. uma Spec individual poderá ser detalhada por vez;
2. cada Spec deverá manter a rastreabilidade indicada aqui;
3. não devem ser gerados código, banco de dados ou endpoints como parte da criação do mapa;
4. decisões ausentes da baseline devem continuar sendo registradas como OPEN-XX.
