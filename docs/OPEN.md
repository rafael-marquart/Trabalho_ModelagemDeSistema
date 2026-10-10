# Questões em Aberto

Este arquivo centraliza lacunas e decisões pendentes da baseline. Cada questão possui um ID estável e aponta para as Specs afetadas. A presença de uma questão aqui **não significa que a decisão já foi tomada**.

## Antes de revisar as questões em aberto

Antes de discutir OPEN-001 em diante, o grupo deve revisar e validar os seguintes pontos documentais. Eles são correções/checagens da consistência das Specs, não decisões de produto; não marcar OPEN como resolvida por causa deles.

1. **Rastreabilidade dos requisitos — parcialmente corrigida:** RF-34 foi associado à SPEC-012 e RF-35 à SPEC-013. Conferir se os fluxos e critérios dessas Specs cobrem integralmente cancelamento e gestão do funil.
2. **Fluxos específicos das Specs 011–021 — revisão ainda necessária:** os comportamentos principais foram explicitados, mas critérios de aceitação/testes e detalhes de exceções, pré/pós-condições e dados de entrada/saída ainda precisam de conferência e aprofundamento contra os casos de uso. Não considerar esse ponto encerrado.
3. **Referências a casos de uso — validar contra os arquivos individuais:** UC-03, UC-04, UC-05, UC-06, UC-09 e UC-11 foram associados às capacidades correspondentes. Verificar especialmente UC-14/ingestão e se cada referência descreve realmente o fluxo citado.
4. **Seção de layout — conferir todas as Specs:** separar descrição das telas/áreas das questões OPEN. Layout é protótipo/evidência visual, não código; o estado de layout continua sendo uma aprovação separada.
5. **Requisitos transversais — tornar verificáveis:** revisar critérios de aceitação de acessibilidade, segurança, privacidade, integridade e auditoria por operação, sem inventar métricas ausentes da baseline.
6. **Permissões organizacionais — preservar o invariante:** Empresa gerencia seus Recrutadores; Administrador é exclusivo da plataforma. Confirmar que nenhum trecho sugere Administrador associado à Empresa.
7. **Compatibilidade e nota pública — manter separação de responsabilidades:** a trava crítica precede o score; dados ausentes não significam compatibilidade; denúncia não altera nota nem bloqueia vaga sem decisão administrativa. Não inventar fórmula da nota pública.
8. **Mapa e detalhamento — fazer conferência final:** verificar IDs, títulos, dependências, requisitos, regras, RNFs, entidades e casos de uso em `mapa-specs.md` e `Specs.md`.

### Ordem de trabalho sugerida
- [ ] Validar as correções documentais acima com a baseline e com o grupo.
- [ ] Registrar eventuais correções adicionais em `Specs.md` e no relatório `revisao-consistencia-specs.md`.
- [ ] Só então iniciar a discussão das questões OPEN, mantendo-as abertas até decisão explícita.
- [ ] Após as decisões, atualizar a OPEN correspondente e refletir a decisão nos artefatos afetados.
- [ ] Aprovar os textos das Specs e, separadamente, os layouts aplicáveis antes de qualquer implementação.

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


## Bloco 3 — Compatibilidade e descoberta de vagas

### SPEC-007 — Calcular compatibilidade entre candidato e vaga

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-031 | aberta | Qual fórmula detalhada será usada para subpontuações, normalização e arredondamento? | A baseline define pesos gerais, mas não detalha todos os cálculos intermediários. |
| OPEN-032 | aberta | Quais campos constituem os dados mínimos para cada dimensão do cálculo? | RB-29 exige dados mínimos, mas a lista completa precisa ser confirmada antes de definir validações. |
| OPEN-033 | aberta | Como distinguir e representar ausência de dados de acessibilidade de incompatibilidade comprovada? | RB-16 proíbe presumir compatibilidade quando faltam informações. |
| OPEN-034 | aberta | Como distância e modalidade serão avaliadas quando localização ou preferências do candidato estiverem ausentes? | RB-05 atribui peso conjunto a distância/modalidade, mas não resolve os dados incompletos. |
| OPEN-035 | aberta | Quais parâmetros e resultados precisam ser armazenados para permitir rastreabilidade ou reprodução do cálculo? | UC-13 menciona histórico/parâmetros, mas o formato e a retenção não estão definidos. |

### SPEC-008 — Buscar e filtrar vagas

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-036 | aberta | Qual é a lista definitiva de filtros e como filtros combinados devem ser aplicados? | UC-02 cita termos, localização/cargo e modalidade, mas não define o catálogo completo e a combinação. |
| OPEN-037 | aberta | Quais campos são consultáveis por busca textual e quais regras de correspondência devem ser usadas? | RF-06 descreve critérios gerais sem detalhar busca textual. |
| OPEN-038 | aberta | Quais limites de resultados, paginação e ordenações alternativas serão oferecidos? | A baseline não define esses comportamentos de interface/consulta. |
| OPEN-039 | aberta | Alertas por e-mail ou salvamento de busca fazem parte do escopo ou são apenas sugestões de UC-02? | A possibilidade é mencionada no caso de uso, mas não está estabelecida como requisito funcional próprio. |

### SPEC-009 — Consultar status e disponibilidade da vaga

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-040 | aberta | Qual é o catálogo formal de status e qual a diferença operacional entre “indisponível” e “encerrada”? | UC-12 apresenta exemplos, mas os significados e estados completos precisam ser confirmados. |
| OPEN-041 | aberta | Quais perfis/operações podem alterar status e quais transições são permitidas? | A Spec trata principalmente de consulta; as permissões de alteração precisam ser rastreadas na baseline. |
| OPEN-042 | aberta | Qual prazo e canal serão usados para informar candidatos ativos após encerramento da vaga? | RB-42 exige informar candidatos ativos, mas não define prazo/canal. |

### SPEC-010 — Visualizar vaga e resultado de compatibilidade

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-043 | aberta | Quais campos do detalhe da vaga devem ser exibidos e quais regras de visibilidade se aplicam? | RF-10 e o modelo conceitual oferecem campos, mas a apresentação completa não está especificada. |
| OPEN-044 | aberta | Qual formato e nível de detalhe serão usados para explicar a compatibilidade ao candidato? | RF-24/RF-25 e RB-30 exigem transparência, mas não determinam granularidade ou visualização. |
| OPEN-045 | aberta | Como exibir faixa salarial, localização e origem quando os dados estiverem ausentes ou variarem por fonte? | O modelo contempla alguns campos, mas não a política de apresentação para ausências. |
| OPEN-046 | aberta | Como apresentar o resultado de compatibilidade quando o perfil do candidato estiver incompleto? | UC-13 prevê solicitar complementação, mas a apresentação do score parcial ou sua ausência precisa ser confirmada. |


## Bloco 4 — Candidaturas e processo seletivo

### SPEC-011 — Registrar candidatura
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-047 | aberta | Qual caso de uso descreve integralmente o registro de candidatura e seu fluxo principal? | RF-26 define a capacidade, mas o mapeamento do caso de uso específico deve ser confirmado. |
| OPEN-048 | aberta | Quais verificações de elegibilidade são realizadas no registro e como cada recusa é comunicada? | É necessário conciliar status, compatibilidade e regras de candidatura. |
| OPEN-049 | aberta | Qual é o estado inicial e quais dados obrigatórios são registrados na candidatura? | O modelo apresenta etapa_funil/data_inscricao, mas a inicialização completa precisa ser confirmada. |

### SPEC-012 — Gerenciar candidatura pelo candidato
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-050 | aberta | Em quais estados e condições o candidato pode cancelar a candidatura? | RB-36 remete às regras/estados do processo, mas não detalha todos os casos. |
| OPEN-051 | aberta | Quais eventos e dados compõem o histórico mostrado ao candidato? | UC-05 exige acompanhamento, mas a granularidade da linha do tempo precisa ser definida. |
| OPEN-052 | aberta | Quais operações, além de consultar e cancelar, estão incluídas em RF-28? | O requisito fala em gerenciar conforme regras do processo; o conjunto completo de ações deve ser confirmado. |

### SPEC-013 — Gerenciar processo seletivo e funil
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-053 | aberta | Qual caso de uso descreve especificamente a gestão do funil pelo Recrutador? | UC-05 descreve principalmente o acompanhamento pelo candidato; confirmar artefato de gestão empresarial. |
| OPEN-054 | aberta | Quais condições formais precisam ser satisfeitas para avançar em cada etapa? | RB-43 exige condições de avanço, mas não detalha todos os critérios. |
| OPEN-055 | aberta | Quais dados do candidato são visíveis ao Recrutador em cada etapa? | RB-26 exige confidencialidade e necessidade de acesso. |
| OPEN-056 | aberta | Quais dados de decisão/histórico são obrigatórios e é permitido reverter transições? | RB-27/RB-41 exigem rastreabilidade; regras de reversão precisam ser confirmadas. |

## Bloco 5 — Acomodações, acompanhamento e notificações

### SPEC-014 — Solicitar acomodação
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-057 | aberta | Qual catálogo de recursos, campos e obrigatoriedades compõe a solicitação? | RF-29 descreve a capacidade sem detalhar o formulário integral. |
| OPEN-058 | aberta | Qual é o estado inicial e quais estados/transições a solicitação pode assumir? | O modelo possui status_confirmacao, mas o ciclo de vida precisa ser confirmado. |
| OPEN-059 | aberta | O candidato pode editar ou retirar uma solicitação? Em quais condições? | A baseline consultada não define os limites operacionais. |

### SPEC-015 — Processar solicitação de acomodação
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-060 | aberta | Quais campos, justificativas e dados são obrigatórios ao registrar decisão sobre acomodação? | RF-32 descreve gestão, mas não detalha todos os campos da decisão. |
| OPEN-061 | aberta | Quais estados e transições de processamento são permitidos? | Evita inventar estados além dos artefatos de baseline. |
| OPEN-062 | aberta | Uma decisão pode ser reconsiderada ou alterada? Em quais condições? | Necessário definir histórico e efeitos sem inferir política. |

### SPEC-016 — Acompanhar candidatura e processo seletivo
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-063 | aberta | Quais eventos, datas e campos compõem a linha do tempo? | UC-05 pede histórico, mas a composição detalhada não está definida. |
| OPEN-064 | aberta | Qual granularidade das informações de acomodação é apresentada ao candidato? | RB-40 exige visibilidade autorizada; os detalhes exibidos precisam ser delimitados. |
| OPEN-065 | aberta | Por quanto tempo o histórico fica disponível após cancelamento ou encerramento? | A baseline exige rastreabilidade, mas não define retenção. |

### SPEC-017 — Notificar alterações do processo seletivo
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-066 | aberta | Quais eventos geram notificações obrigatórias? | RF-12/RF-27 falam em alterações relevantes, sem catálogo completo. |
| OPEN-067 | aberta | Quais canais de envio e preferências do usuário serão suportados? | RF-02 cita e-mail para recuperação de senha, mas não determina o canal das notificações do processo. |
| OPEN-068 | aberta | Quais prazos, retentativas e políticas de falha/reenvio serão aplicados? | Necessário para operacionalizar a entrega sem presumir infraestrutura. |
| OPEN-069 | aberta | Haverá central/histórico interno de notificações e qual será sua retenção? | A baseline exige comunicação, mas não estabelece central nem política de retenção. |

## Bloco 6 — Avaliações, denúncias e nota pública

### SPEC-018 — Avaliar processo seletivo
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-070 | aberta | Quem pode avaliar e qual é a janela temporal de elegibilidade? | RF-21 define avaliação pós-processo, mas os critérios de elegibilidade precisam ser confirmados. |
| OPEN-071 | aberta | Quais critérios, escalas, campos obrigatórios e possibilidades de edição compõem a avaliação? | O modelo contém notas de acessibilidade e postura, mas não define a forma completa. |
| OPEN-072 | aberta | Quantas avaliações podem ser registradas por candidatura/entrevista e quais controles evitam abuso? | Necessário preservar integridade e confiabilidade. |
| OPEN-073 | aberta | Quais dados da avaliação podem ser publicados anonimamente e por quanto tempo são retidos? | RB-19 exige anonimato público; conteúdo publicado e retenção precisam ser definidos. |

### SPEC-019 — Denunciar incompatibilidade ou falsa inclusão
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-074 | aberta | Quem pode denunciar e em quais circunstâncias? | RF-14 descreve a capacidade sem detalhar toda elegibilidade. |
| OPEN-075 | aberta | Quais campos/evidências são permitidos e como a denúncia se associa à avaliação/empresa? | O modelo prevê descrição e referências, mas não detalha evidências adicionais. |
| OPEN-076 | aberta | Quais controles antiabuso e limites de frequência serão usados? | RB-24 exige proteção contra abuso, mas os parâmetros não estão definidos. |
| OPEN-077 | aberta | Qual conteúdo e andamento podem ser vistos pelo denunciante e pelo denunciado? | A política de confidencialidade e comunicação precisa ser delimitada. |

### SPEC-020 — Moderar denúncias de incompatibilidade
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-078 | aberta | Quais critérios e evidências o Administrador consulta para analisar uma denúncia? | RB-25 exige análise administrativa, mas não define o procedimento completo. |
| OPEN-079 | aberta | Qual catálogo de decisões e quais efeitos cada decisão pode autorizar? | RB-45 prevê consequências conforme decisão registrada; efeitos precisam ser explícitos. |
| OPEN-080 | aberta | Quais prazos e prioridades serão aplicados à fila de moderação? | A baseline não estabelece SLA ou priorização. |
| OPEN-081 | aberta | Quais informações da decisão serão comunicadas às partes e quais permanecem confidenciais? | Impacta transparência, privacidade e segurança. |

### SPEC-021 — Gerenciar nota pública de acessibilidade
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-082 | aberta | Qual fórmula, pesos e método de agregação definem a nota pública? | RF-13/RB-20 definem a fonte geral, mas não a fórmula detalhada. |
| OPEN-083 | aberta | Qual quantidade mínima e quais critérios de validade tornam dados/avaliações suficientes para a nota? | Necessário evitar nota baseada em dados insuficientes ou inválidos. |
| OPEN-084 | aberta | Como a nota será apresentada quando os dados forem insuficientes ou conflitantes? | O sistema não deve inventar valor nem presumir acessibilidade. |
| OPEN-085 | aberta | Quais efeitos uma decisão de moderação pode produzir na nota e nos dados publicados? | A alteração só pode ocorrer após decisão registrada, mas os efeitos autorizados precisam ser definidos. |

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

