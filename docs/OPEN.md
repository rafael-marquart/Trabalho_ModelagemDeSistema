# Questões em Aberto

Este arquivo centraliza lacunas e decisões pendentes da baseline. Cada questão possui um ID estável e aponta para as Specs afetadas. A presença de uma questão aqui **não significa que a decisão já foi tomada**.

## Antes de revisar as questões em aberto

Antes de discutir OPEN-001 em diante, o grupo deve revisar e validar os seguintes pontos documentais. Eles são correções/checagens da consistência das Specs, não decisões de produto; não marcar OPEN como resolvida por causa deles.

1. **Rastreabilidade dos requisitos — parcialmente corrigida:** RF-34 foi associado à SPEC-012 e RF-35 à SPEC-013. Conferir se os fluxos e critérios dessas Specs cobrem integralmente cancelamento e gestão do funil.
2. **Fluxos específicos das Specs 011–021 — revisão concluída:** o detalhamento aplicado aos fluxos, contratos conceituais, critérios de aceitação e testes foi aprovado pelo grupo (REV-002 encerrada). A aprovação formal individual das Specs e dos layouts aplicáveis continua sendo um controle separado.
3. **Referências a casos de uso — validar contra os arquivos individuais:** UC-03, UC-05, UC-06, UC-09 e UC-11 foram associados às capacidades correspondentes. Verificar especialmente UC-14/ingestão e se cada referência descreve realmente o fluxo citado.
4. **Seção de layout — conferir todas as Specs:** separar descrição das telas/áreas das questões OPEN. Layout é protótipo/evidência visual, não código; o estado de layout continua sendo uma aprovação separada.
5. **Requisitos transversais — tornar verificáveis:** revisar critérios de aceitação de acessibilidade, segurança, privacidade, integridade e auditoria por operação, sem inventar métricas ausentes da baseline.
6. **Permissões organizacionais — preservar o invariante:** Empresa gerencia seus Recrutadores; Administrador é exclusivo da plataforma. Confirmar que nenhum trecho sugere Administrador associado à Empresa.
7. **Compatibilidade e nota pública — manter separação de responsabilidades:** a trava crítica precede o score; dados ausentes não significam compatibilidade; a administração da plataforma atua sobre denúncias e não altera diretamente avaliações nem a distribuição pública de estrelas. Não inventar fórmula da compatibilidade.
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

## Acesso e perfis

### SPEC-001 — Acessar a plataforma e identificar perfil organizacional

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-001 | resolvida | Como deve funcionar a verificação da recuperação de senha, qual a validade da solicitação e qual canal será usado para envio? | Decisão aprovada: link enviado por e-mail, validade de 30 minutos, uso único e invalidação do link anterior quando uma nova solicitação for emitida. O sistema informa quando o e-mail não está cadastrado. Aplicar limitação de frequência, com limites numéricos a definir. A política para sessões existentes após a redefinição fica para OPEN-002. A decisão de informar e-mails não cadastrados permite identificar contas existentes e esse risco foi aceito pelo grupo. |
| OPEN-002 | resolvida | Quais são os tempos de expiração da sessão e os eventos que a invalidam? | Decisão aprovada: sessão comum expira após 60 minutos sem atividade, sem limite máximo absoluto enquanto houver atividade; logout explícito, troca/redefinição de senha e bloqueio/desativação invalidam as sessões. Será oferecida opção “manter conectado” por 30 dias, com renovação conforme uso. Detalhes técnicos de atividade, renovação segura e invalidação no servidor devem respeitar estas regras e ser definidos na implementação, sem alterar a decisão funcional. |
| OPEN-003 | resolvida | Quais critérios de senha e bloqueio devem ser aplicados? | Decisão aprovada: senha com mínimo de 10 caracteres, exigindo ao menos uma letra maiúscula, uma minúscula e um número, sem exigir símbolo. Após 10 tentativas consecutivas incorretas de login, aplicar bloqueio temporário por 15 minutos. A conta desbloqueia automaticamente ao fim do prazo ou por recuperação de senha válida. |
| OPEN-004 | resolvida | Quais campos são obrigatórios no cadastro de Empresa e como será validada sua identidade organizacional? | Decisão aprovada: razão social, identificador oficial e e-mail corporativo de contato são obrigatórios; nome fantasia é opcional. O identificador oficial deve ser validado e o e-mail corporativo confirmado separadamente. As funcionalidades organizacionais só são liberadas após as duas verificações. Impedir novo cadastro com identificador oficial já associado a uma Empresa e orientar recuperação/associação à conta existente. A Empresa permanece responsável por cadastrar/vincular Recrutadores conforme RF-17/RB-46. Procedimentos concretos de validação, tratamento de empresas estrangeiras/sem o identificador adotado e detalhes de associação permanecem lacunas; esta última é tratada na OPEN-005. |
| OPEN-005 | resolvida | Como tratar um e-mail que já pertence a uma conta ao cadastrar/associar um Recrutador? É necessário um fluxo de consentimento ou aceite? | Decisão aprovada: quando o e-mail já pertencer a uma conta, a Empresa autenticada e autorizada pode solicitar o vínculo. O sistema envia link de confirmação ao e-mail da conta e exige aceite explícito do titular. O vínculo só é efetivado após o aceite; enquanto isso, o convite fica pendente e a Empresa é informada sem receber dados adicionais da conta existente. Antes de efetivar, validar novamente a autorização da Empresa e respeitar RB-46; o aceite não autoriza automaticamente transferir ou administrar vínculos de outra Empresa. Permanecem em aberto prazo de validade, cancelamento/reenvio, tratamento de recusa/expiração e regras para múltiplos vínculos empresariais. Eventos do convite e do vínculo são relevantes para auditoria; lista e retenção ficam na OPEN-006. |
| OPEN-006 | resolvida | Quais eventos devem ser auditados e por quanto tempo os registros serão retidos? | Decisão aprovada: auditar eventos relevantes de negócio e segurança, incluindo autenticação/sessão, alterações de dados e vínculos, operações de vagas e candidaturas, transições e decisões do processo seletivo, denúncias/moderação e ações administrativas relevantes; não registrar indiscriminadamente todas as consultas e visualizações. Manter os registros por 1 ano, com acesso restrito e proteção contra alteração ou exclusão indevida. Registrar apenas dados necessários à rastreabilidade, evitando credenciais, tokens e dados sensíveis desnecessários. Após o prazo, aplicar política de descarte, respeitando obrigações aplicáveis de preservação. O catálogo técnico exaustivo, campos, início exato da contagem e procedimento de descarte não foram fixados nesta decisão. |

### SPEC-002 — Gerenciar perfil e necessidades de acessibilidade do candidato

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-007 | resolvida | Quais categorias de dados compõem o perfil profissional do candidato? | Decisão aprovada: o perfil inclui dados pessoais básicos (nome e e-mail reutilizados da conta), formação/escolaridade, competências, idiomas, necessidades funcionais de acessibilidade, recursos indispensáveis para acessibilidade, experiências profissionais, cursos, certificações e links profissionais. As categorias profissionais podem ser preenchidas progressivamente; formação, competências, idiomas, experiências, cursos, certificações e links não são obrigatórios por categoria para salvar o perfil, conforme OPEN-007.1. Necessidades podem ser autodeclaradas, sem exigir ou armazenar laudo, distinguindo “não informado” de declaração de inexistência de necessidade. Dados ausentes necessários à análise de uma vaga são tratados como insuficiência, sem presumir compatibilidade (RB-16). A decisão define categorias, não os campos internos, formatos, limites ou cardinalidades, que permanecem sujeitos à baseline e às OPEN-007.1/007.2. |
| OPEN-007.1 | resolvida | Quais campos e categorias do perfil profissional são obrigatórios para salvar o perfil, e quais podem ser preenchidos posteriormente? | Decisão aprovada: o formulário de perfil não exige preenchimento duplicado de nome e e-mail, pois reutiliza os dados mantidos na conta, sujeitos às regras próprias de cadastro/autenticação da SPEC-001. CPF não é obrigatório para salvar o perfil, pois a baseline não apresenta justificativa funcional aprovada para exigi-lo. Formação/escolaridade, competências e idiomas são opcionais para salvar; quando pertinentes à análise de uma vaga, a ausência deve ser indicada como insuficiência sem presumir compatibilidade (RB-16). Experiências profissionais, cursos, certificações e links profissionais também não são obrigatórios por categoria, sem prejuízo da decisão de escopo das categorias na OPEN-007. Necessidades funcionais e recursos indispensáveis não têm declaração obrigatória universal: é permitido declarar por autodeclaração, sem exigir ou armazenar laudo, e deve-se distinguir “não informado” de “declarado que não possui necessidade”. A validação detalhada permanece na OPEN-007.2. Decisão refletida na SPEC-002 e no UC-01. |
| OPEN-007.2 | resolvida | Quais regras de validação se aplicam aos campos e registros de cada categoria do perfil profissional? | Decisão aprovada: adotar validação básica por categoria, verificando o preenchimento dos campos obrigatórios já definidos e a consistência básica dos valores. Violações de regras definidas impedem o salvamento e devem destacar os dados a corrigir. A validação respeita o cadastro progressivo da OPEN-007.1 e não torna uma categoria obrigatória por si só. Permanecem em aberto os campos obrigatórios por categoria, formatos exatos, limites, quantidade máxima de registros, campos internos por registro, critérios específicos de consistência, regras exatas para links e catálogo completo das necessidades de acessibilidade. Preservam-se autodeclaração, não exigência/armazenamento de laudos e RB-16. |
| OPEN-008 | resolvida | Quais opções compõem o catálogo de necessidades por categoria e como será representada uma necessidade obrigatória? | Decisão aprovada: adotar catálogo estruturado e extensível, organizado nas categorias existentes no modelo conceitual: necessidades arquitetônicas, de comunicação e tecnológicas. A lista inicial de opções deverá ser definida e aprovada explicitamente; inclusão, alteração ou descontinuação depende de decisão explícita do projeto. A representação deverá distinguir necessidades obrigatórias e não obrigatórias conforme RB-06, sem inferir obrigatoriedade pela categoria ou pela ausência de dados. Preservam-se autodeclaração, não exigência/armazenamento de laudos, confidencialidade e RB-16. Permanecem em aberto a lista de opções, seu significado operacional, processo de evolução, detalhes de representação/persistência da obrigatoriedade e tratamento de necessidades não contempladas. |
| OPEN-009 | resolvida | Quais dados/versões devem ser guardados no histórico e qual o prazo de retenção? | Decisão aprovada: adotar histórico de alterações relevantes, sem exigir versionamento completo do perfil a cada modificação. O registro deve permitir rastrear quando ocorreu a alteração, o ator responsável conforme autorização, a categoria/informação afetada e o tipo de alteração, com campos finais a confirmar na especificação. Aplicar minimização de dados, acesso restrito, proteção contra alteração/exclusão indevida e não armazenar laudos médicos. A retenção de um ano definida na OPEN-006 será referência para eventos de auditoria relacionados; a aplicação exata ao histórico funcional e casos de preservação de valores anteriores/versões completas ainda deve ser confirmada. Permanecem em aberto catálogo exato de alterações relevantes, campos definitivos, casos que exigem valores anteriores/versões completas e procedimentos de descarte, respeitando obrigações de preservação. |
| OPEN-010 | resolvida | Como USUARIO se associa a CANDIDATO no modelo conceitual (chave, cardinalidade e ciclo de vida)? | Decisão aprovada: associação 1:1 opcional para USUARIO e obrigatória para CANDIDATO. Cada CANDIDATO deve estar associado a exatamente um USUARIO; um USUARIO pode estar associado a nenhum ou a um único CANDIDATO. Não permitir candidato sem usuário correspondente nem mais de um perfil de candidato por usuário. A associação deve manter identificação consistente na autenticação, consulta e atualização, respeitando autorização e preservando os demais perfis/vínculos organizacionais da baseline. O modelo conceitual deverá explicitar associação e cardinalidade; chaves e restrições de persistência serão detalhadas no modelo de dados, sem inventar estruturas não aprovadas. Permanecem em aberto o momento exato de criação do perfil, comportamento em desativação/exclusão, conversão entre perfis e definição técnica de chave/restrições de integridade. |
| OPEN-011 | resolvida | Quais dados do perfil e das necessidades podem ser vistos por Recrutadores e em qual etapa do processo? | Decisão aprovada: após o registro de candidatura, permitir que Recrutador autenticado e autorizado da Empresa responsável pela vaga consulte os dados do perfil profissional e as necessidades de acessibilidade no contexto daquela candidatura. Restringir o acesso às vagas da Empresa à qual está vinculado e autorizado, conforme RF-30/RB-46; a candidatura não autoriza acesso a perfis sem relação com a vaga nem a candidaturas de outras Empresas. Acesso às informações de acessibilidade deve respeitar RB-26 e a necessidade no processo; dados pessoais/profissionais permanecem protegidos e o acesso é compatível com a finalidade. Preservar autodeclaração e não armazenamento de laudos (RB-28). A decisão não implica exposição indiscriminada de todos os campos. Permanecem em aberto a matriz definitiva de campos, distinção entre dados profissionais e funcionais, necessidade por categoria/etapa, restrições adicionais e eventual registro específico de acessos. |

### SPEC-003 — Disponibilizar recursos de acessibilidade da interface

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-012 | resolvida | Alto contraste será um modo controlado pela aplicação ou dependerá das configurações do sistema operacional/navegador? | Decisão aprovada: adotar abordagem combinada, respeitando as preferências de contraste do sistema operacional/navegador e oferecendo controle próprio na plataforma para ativar/desativar o alto contraste. O modo deve preservar distinção visual e operabilidade de conteúdo, controles e mensagens conforme os requisitos de acessibilidade aplicáveis. A decisão não define persistência entre telas, sessões ou dispositivos (OPEN-013). Permanecem em aberto o comportamento quando preferências externa e interna divergirem, estratégia técnica de aplicação, persistência (OPEN-013) e procedimento/evidências de validação (OPEN-016). |
| OPEN-013 | resolvida | Preferências de acessibilidade persistirão entre sessões ou somente durante a sessão atual? | Decisão aprovada: salvar as preferências de acessibilidade definidas pela plataforma na conta do usuário e reaplicá-las em sessões futuras, inclusive em outro dispositivo. O alto contraste mantém o controle próprio previsto na OPEN-012 e considera as preferências externas suportadas. A decisão não define o catálogo completo de preferências persistidas, a resolução de divergências entre preferências internas e externas, o comportamento para usuários não autenticados nem a estratégia técnica de armazenamento e recuperação, que será detalhada na SPEC-003 sem impor tecnologia antecipadamente. |
| OPEN-014 | resolvida | Quais comandos, fluxos, idiomas e tecnologia serão suportados pela interação por voz? | Decisão aprovada: interação por voz em português brasileiro (pt-BR), cobrindo navegação e operações comuns em formulários nos fluxos suportados. Inclui navegar entre áreas, acionar controles, preencher campos e confirmar ações, sempre respeitando permissões, validações e confirmações exigidas. Deve comunicar resultados e falhas de forma acessível quando aplicável, sem substituir alternativas acessíveis. Catálogo e frases exatas, cobertura de fluxos/controles, tratamento detalhado de ambiguidades/falhas/confirmações, tecnologia e compatibilidade dos ambientes, e outros idiomas permanecem em aberto para detalhamento na SPEC-003. |
| OPEN-015 | resolvida | Quais combinações de navegador, leitor de tela e dispositivo serão usadas como ambientes de referência para validação? | Decisão aprovada: estabelecer uma matriz de ambientes de referência para validar navegação por teclado, leitores de tela, contraste, responsividade e fluxos essenciais da SPEC-003, cobrindo entrada/autenticação, perfil do candidato e necessidades de acessibilidade. A matriz combina navegadores, tecnologias assistivas e dispositivos e serve como referência de teste, sem implicar suporte exclusivo a esses ambientes. Nomes/versões, cobertura mínima por combinação, frequência de revalidação e evidências por ambiente permanecem pendentes; o processo de avaliação e as evidências de conformidade WCAG 2.1 AA ficam na OPEN-016. |
| OPEN-016 | resolvida | Qual processo de verificação e quais evidências demonstrarão conformidade com WCAG 2.1 AA? | Decisão aprovada: adotar validação combinada por verificações automatizadas e avaliações manuais, com evidências registradas nos ambientes de referência definidos na OPEN-015. Avaliar teclado/foco, identificação de controles, mensagens/estados, contraste, redimensionamento, recursos de acessibilidade e leitores de tela conforme ambientes aplicáveis. Registrar ambiente, fluxo, procedimento, resultado, problemas encontrados e situação após correção/reverificação. Ferramentas específicas, cobertura mínima, frequência, formato/local das evidências, severidade/priorização/aceite de problemas e condições formais para declarar conformidade permanecem pendentes. Testes automatizados ou parciais, isoladamente, não bastam para declarar conformidade integral com WCAG 2.1 AA. |


## Empresa, vagas próprias e ingestão externa

### SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa

| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-017 | resolvida | Qual é a lista definitiva de campos, categorias e itens obrigatórios do questionário de infraestrutura? | Decisão aprovada: organizar o questionário em categorias estruturadas, preservando os itens citados no UC-07: rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas. Categorias propostas: acesso físico e circulação; instalações; comunicação e orientação; recursos tecnológicos; políticas e práticas inclusivas. Sugestões adicionais — rotas acessíveis, circulação interna, estacionamento acessível, sinalização tátil/Braille, alternativas de comunicação, compatibilidade com tecnologias assistivas e práticas de acolhimento — só passam a integrar o escopo após aprovação explícita. O salvamento será impedido quando itens definidos como obrigatórios estiverem pendentes, mas a lista individual de obrigatórios não foi definida nem todos os campos são automaticamente obrigatórios. Os dados seguem associados à Empresa e servem aos usos previstos na baseline, distinguindo infraestrutura geral de barreiras/critério específico da vaga. Tipos de resposta, escalas, validações detalhadas, persistência, versionamento e conversão em barreiras impeditivas permanecem pendentes nas OPEN-018/023 e no detalhamento da SPEC-004. |
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


## Compatibilidade e descoberta de vagas

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


## Candidaturas e processo seletivo

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

## Acompanhamento e notificações

### SPEC-016 — Acompanhar candidatura e processo seletivo
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-063 | aberta | Quais eventos, datas e campos compõem a linha do tempo? | UC-05 pede histórico, mas a composição detalhada não está definida. |
| OPEN-065 | aberta | Por quanto tempo o histórico fica disponível após cancelamento ou encerramento? | A baseline exige rastreabilidade, mas não define retenção. |

### SPEC-017 — Notificar alterações do processo seletivo
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-066 | aberta | Quais eventos geram notificações obrigatórias? | RF-12/RF-27 falam em alterações relevantes, sem catálogo completo. |
| OPEN-067 | aberta | Quais canais de envio e preferências do usuário serão suportados? | RF-02 cita e-mail para recuperação de senha, mas não determina o canal das notificações do processo. |
| OPEN-068 | aberta | Quais prazos, retentativas e políticas de falha/reenvio serão aplicados? | Necessário para operacionalizar a entrega sem presumir infraestrutura. |
| OPEN-069 | aberta | Haverá central/histórico interno de notificações e qual será sua retenção? | A baseline exige comunicação, mas não estabelece central nem política de retenção. |

## Avaliações, denúncias e nota pública

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
| OPEN-079 | aberta | Qual catálogo de decisões e quais efeitos cada decisão pode autorizar sobre a denúncia? | RB-45 prevê consequências conforme decisão registrada; definir os efeitos de moderação da denúncia sem alterar diretamente avaliações ou a distribuição pública de estrelas. |
| OPEN-080 | aberta | Quais prazos e prioridades serão aplicados à fila de moderação? | A baseline não estabelece SLA ou priorização. |
| OPEN-081 | aberta | Quais informações da decisão serão comunicadas às partes e quais permanecem confidenciais? | Impacta transparência, privacidade e segurança. |

### SPEC-021 — Gerenciar nota pública de acessibilidade
| ID | Estado | Questão em aberto | Contexto/impacto |
|---|---|---|---|
| OPEN-082 | parcialmente definida | Como apresentar a nota pública com base em estrelas? | Decisão do grupo: exibir a frequência de avaliações válidas em cada quantidade de estrelas, sem presumir média ou pesos adicionais. |
| OPEN-083 | parcialmente definida | Qual quantidade mínima e quais critérios de validade tornam dados/avaliações suficientes para a nota? | Decisão do grupo: uma avaliação válida é suficiente para apresentar a distribuição; os critérios adicionais de validade permanecem conforme a baseline e as decisões ainda necessárias. |
| OPEN-084 | parcialmente definida | Como a nota será apresentada quando os dados forem insuficientes ou conflitantes? | Decisão do grupo: sem avaliações válidas, não exibir nota e informar que os dados são insuficientes. O tratamento de dados conflitantes permanece a confirmar se aplicável. |
| OPEN-085 | resolvida | A moderação pode alterar a nota pública ou a distribuição de estrelas? | Decisão do grupo: não. A administração atua sobre denúncias; a nota pública é formada pelas avaliações válidas e não pode ser editada ou recalculada diretamente por administradores. |

## Decisões consolidadas

- A **Empresa** existe como conta organizacional e pode cadastrar um ou mais usuários com perfil de **Recrutador** dentro de suas configurações.
- A tela inicial oferece apenas as opções de criação de conta como **Usuário** ou **Empresa**. O **Recrutador não possui uma opção de cadastro independente**.
- O **Recrutador é um perfil de Usuário** criado ou vinculado pela Empresa e permanece associado à empresa que o cadastrou.
- **Não existe Administrador associado à Empresa.** O perfil **Administrador é exclusivo da plataforma**, para moderação e operações administrativas da própria plataforma.
- Não existe o papel de **Gestor de Seleção** no modelo.
- O sistema **não armazena laudos médicos**. As necessidades de acessibilidade podem ser informadas pelo candidato, inclusive por autodeclaração.
- Uma denúncia **não bloqueia automaticamente** uma vaga. A administração da plataforma atua sobre denúncias e não altera diretamente as avaliações nem a distribuição pública de estrelas; a nota é exibida conforme as avaliações válidas.
- A deduplicação definida em **RB-31** aplica-se aos dados externos importados.
- O funil de seleção utiliza os estados e transições formalizados em `docs/Fluxos e Estados/estados-trilha.md`.

## Referência visual

A pasta [Identidade Visual](Identidade%20Visual/) contém o README de direção visual e uma imagem de referência. O README descreve uma direção profissional, acolhedora e minimalista, com roxo/lilás, fundos claros, contraste legível e componentes simples. Essa referência orienta a futura elaboração dos layouts, mas **não substitui protótipos específicos por Spec nem representa aprovação de layout**.

