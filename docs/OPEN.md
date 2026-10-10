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

