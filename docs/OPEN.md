# Questões em Aberto

Este arquivo centraliza lacunas e decisões pendentes da baseline. Cada questão possui um ID estável e aponta para as Specs afetadas. A presença de uma questão aqui **não significa que a decisão já foi tomada**.

## Estados

- **aberta:** precisa de análise/decisão.
- **resolvida:** decisão registrada e refletida nos artefatos relacionados.
- **fora de escopo:** foi explicitamente excluída do projeto.

## Bloco 1 — Acesso e perfis

### SPEC-001 — Acessar a plataforma e identificar perfil organizacional

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-001 | aberta | Como deve funcionar a verificação da recuperação de senha, qual a validade da solicitação e qual canal será usado para envio? | RF-02 não define o mecanismo completo. Impacta segurança e fluxo de recuperação. |
| OPEN-002 | aberta | Quais são os tempos de expiração da sessão e os eventos que a invalidam? | RB-22 estabelece o princípio de sessão, mas não todos os parâmetros. |
| OPEN-003 | aberta | Quais critérios de senha e bloqueio devem ser aplicados? | UC-00 menciona usuário bloqueado, mas os critérios específicos precisam ser confirmados na baseline. |
| OPEN-004 | aberta | Quais campos são obrigatórios no cadastro de Empresa e como será validada sua identidade organizacional? | Conferir RF-17 e o caso de uso correspondente antes de fixar campos ou validações. |
| OPEN-005 | aberta | Como tratar um e-mail que já pertence a uma conta ao cadastrar/associar um Recrutador? É necessário um fluxo de consentimento ou aceite? | UC-07/RB-46 permitem criação ou associação, mas não detalham esse cenário. Não criar uma regra por suposição. |
| OPEN-006 | aberta | Quais eventos devem ser auditados e por quanto tempo os registros serão retidos? | RB-27 e RNF-14 pedem rastreabilidade, mas a lista de eventos e retenção não estão detalhadas. |

### SPEC-002 — Gerenciar perfil e necessidades de acessibilidade do candidato

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-007 | aberta | Qual é a lista final de campos profissionais, sua obrigatoriedade e validação? | RF-04/RF-19 e UC-01 devem ser conferidos; o modelo conceitual utiliza o agregado `dados_profissionais`. |
| OPEN-008 | aberta | Quais opções compõem o catálogo de necessidades por categoria e como será representada uma necessidade obrigatória? | RB-06 exige considerar necessidades obrigatórias na compatibilidade, mas não define sozinho o catálogo completo. |
| OPEN-009 | aberta | Quais dados/versões devem ser guardados no histórico e qual o prazo de retenção? | RB-27 exige histórico/rastreabilidade, mas não detalha o formato nem a retenção. |
| OPEN-010 | aberta | Como USUARIO se associa a CANDIDATO no modelo conceitual (chave, cardinalidade e ciclo de vida)? | O modelo atual não detalha a associação. Não fixar estrutura de dados por inferência. |
| OPEN-011 | aberta | Quais dados do perfil e das necessidades podem ser vistos por Recrutadores e em qual etapa do processo? | RB-26 exige confidencialidade, mas a matriz de visibilidade não está definida. Impacta privacidade e contratos de consulta. |

### SPEC-003 — Disponibilizar recursos de acessibilidade da interface

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-012 | aberta | Alto contraste será um modo controlado pela aplicação ou dependerá das configurações do sistema operacional/navegador? | RF-16 cita o recurso, mas não determina o mecanismo. |
| OPEN-013 | aberta | Preferências de acessibilidade persistirão entre sessões ou somente durante a sessão atual? | Afeta experiência e eventual armazenamento de preferências; a baseline não define isso. |
| OPEN-014 | aberta | Quais comandos, fluxos, idiomas e tecnologia serão suportados pela interação por voz? | RF-16 não apresenta catálogo de comandos nem comportamento detalhado. |
| OPEN-015 | aberta | Quais combinações de navegador, leitor de tela e dispositivo serão usadas como ambientes de referência para validação? | Necessário para delimitar evidências de compatibilidade, sem inventar uma matriz de suporte. |
| OPEN-016 | aberta | Qual processo de verificação e quais evidências demonstrarão conformidade com WCAG 2.1 AA? | RNF-01 cita a referência, mas não define ferramentas, amostragem ou evidências. |


## Bloco 2 — Empresa, vagas próprias e ingestão externa

### SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-017 | aberta | Qual é a lista definitiva de campos, categorias e itens obrigatórios do questionário de infraestrutura? | UC-07 cita exemplos, mas a lista completa precisa ser conferida na baseline antes de fixar o formulário. |
| OPEN-018 | aberta | Quais tipos, escalas, versionamento e estrutura de persistência representam o mapeamento de infraestrutura? | O modelo conceitual indica INFRAESTRUTURA_EMPRESA, mas não detalha toda a estrutura. |
| OPEN-019 | aberta | Quais evidências e procedimentos se aplicam ao tratamento de divergências recorrentes nas informações declaradas pela Empresa? | RB-08 permite consequências após análise, mas os critérios operacionais precisam ser confirmados sem presumir automação. |

### SPEC-005 — Cadastrar e gerenciar vagas próprias

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-020 | aberta | Qual é a lista completa de campos da vaga própria e quais são obrigatórios? | UC-08 oferece exemplos, mas a definição integral deve ser conferida na baseline. |
| OPEN-021 | aberta | Quais validações e critérios de consistência se aplicam a cada campo da vaga? | UC-08 menciona validação, mas não detalha todas as regras por campo. |
| OPEN-022 | aberta | Quais são os limites de edição e encerramento de uma vaga depois de publicada ou após receber candidaturas? | O fluxo permite editar/gerenciar, mas as restrições por estado não estão totalmente definidas nos artefatos consultados. |
| OPEN-023 | aberta | Como os critérios de acessibilidade da vaga se relacionam com INFRAESTRUTURA_EMPRESA e TRAVA_CRITICA_VAGA, e quais informações são declaradas especificamente por vaga? | Necessário preservar a distinção entre informações gerais da empresa e barreiras/requisitos específicos da oportunidade. |

### SPEC-006 — Importar, ingerir e normalizar vagas externas

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-024 | aberta | Quais fontes externas são autorizadas, como os dados chegam ao sistema e qual esquema JSON será aceito? | UC-14 define ingestão de JSON, mas não especifica o contrato completo de entrada nem o catálogo de fontes. |
| OPEN-025 | aberta | Quais campos e validações são obrigatórios para considerar um registro externo uma vaga válida? | RB-10/RB-17 exigem estruturação e validação antes do uso, mas a lista completa de validações precisa ser definida. |
| OPEN-026 | aberta | O que fazer quando a LLM estiver indisponível ou produzir dados inválidos? | ADR-003 determina adaptação e validação; a política de contingência e eventual reprocessamento precisa ser definida. |
| OPEN-027 | aberta | Como serão representados execução/lote de ingestão, estado por registro e resultado da operação? | UC-14 exige registrar origem e resultado, mas o modelo conceitual não detalha uma estrutura específica de execução. |
| OPEN-028 | aberta | Qual critério determina que dois registros externos representam a mesma vaga? | RB-31 exige deduplicação, mas não define os atributos ou a regra de equivalência. |
| OPEN-029 | aberta | Qual política de transação, repetição, recuperação e tratamento de falhas parciais será usada? | RB-32 exige preservar registros válidos existentes; a estratégia operacional não está especificada. |
| OPEN-030 | aberta | Qual é a formulação exata de RNF-16 e como será verificada no contexto da ingestão/normalização? | O mapa associa RNF-16 à Spec, mas é necessário confirmar o texto e a medida na baseline antes de fechar os testes. |

## Decisões consolidadas

- A **Empresa** existe como conta organizacional e pode cadastrar um ou mais usuários com perfil de **Recrutador** dentro de suas configurações.
- A tela inicial oferece apenas as opções de criação de conta como **Usuário** ou **Empresa**. O **Recrutador não possui uma opção de cadastro independente**.
- O **Recrutador é um perfil de Usuário** criado ou vinculado pela Empresa e permanece associado à empresa que o cadastrou.
- **Não existe Administrador associado à Empresa.** O perfil **Administrador é exclusivo da plataforma**, para moderação e operações administrativas da própria plataforma.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga nem altera automaticamente a nota de acessibilidade. A denúncia deve ser analisada por um Administrador antes de qualquer decisão.
- A deduplicação definida em **RB-31** aplica-se aos dados externos importados.
- O funil de seleção utiliza os estados e transições formalizados em `docs/Fluxos e Estados/estados-trilha.md`.

## Referência visual

A pasta [Identidade Visual](Identidade%20Visual/) contém o README de direção visual e uma imagem de referência. O README descreve uma direção profissional, acolhedora e minimalista, com roxo/lilás, fundos claros, contraste legível e componentes simples. Essa referência orienta a futura elaboração dos layouts, mas **não substitui protótipos específicos por Spec nem representa aprovação de layout**.

