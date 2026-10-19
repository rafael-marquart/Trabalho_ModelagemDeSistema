# Specs — AcessaVagas

Documento de detalhamento das Specs do AcessaVagas, baseado na baseline do projeto e na estrutura do documento de referência do processo SDD.

## Controle do documento

- Escopo: SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021.
- Estado dos textos: especificada, aguardando revisão e aprovação humana.
- Estado dos layouts: pendente quando aplicável; não se aplica às capacidades sem interface própria.
- **Layout significa evidência visual/protótipo, não código.** A identidade visual existente é uma referência inicial de estilo; ainda será necessário especificar e aprovar os layouts das telas aplicáveis.
- Implementação: não autorizada. A aprovação do texto e a aprovação do layout são etapas separadas.
- Lacunas e conflitos são registrados em `docs/OPEN.md`, com IDs OPEN associados às Specs; não são resolvidos silenciosamente.

Estados possíveis: especificada, aprovada, em implementação, implementada ou fora de escopo. O estado do layout pode ser pendente, aprovado ou não se aplica. A identidade visual é uma referência de direção visual, mas não equivale à aprovação dos layouts funcionais.

---

# SPEC-001 — Acessar a plataforma e identificar perfil organizacional

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-001 |
|
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Cadastro de usuário/empresa, autenticação, recuperação de senha, autorização por perfil e vínculo organizacional de recrutador |

## 2. Rastreabilidade

- **RF:** RF-01 Autenticação; RF-02 Recuperação de senha; RF-03 Perfis de acesso; RF-17 Cadastro de empresa; RF-40 Controle de acesso às operações administrativas.
- **RB:** RB-12 Controle de acesso; RB-21 Segurança de autenticação; RB-22 Controle de sessão; RB-27 Histórico de alterações; RB-46 Cadastro de recrutador pela empresa.
- **RNF:** RNF-07 Segurança; RNF-08 Privacidade; RNF-09 Integridade dos dados; RNF-14 Rastreabilidade e auditoria.
- **Casos de uso:** UC-00 Login; UC-07 Cadastrar Infraestrutura da Empresa, no que diz respeito à gestão de recrutadores.
- **Modelo conceitual:** USUARIO, CANDIDATO, EMPRESA e ADMINISTRADOR. RECRUTADOR é um perfil de USUARIO vinculado a EMPRESA, não uma entidade independente.
- **Driver:** DA-02 Autenticação e autorização por perfil.
- **ADRs:** ADR-002 Autenticação e autorização centralizadas no backend; ADR-004 Arquitetura em camadas.
- **Decisões consolidadas:** não existe papel de Gestor de Seleção; a Empresa pode cadastrar um ou mais usuários com perfil de Recrutador; o Recrutador não tem cadastro independente na tela inicial.

## 3. Escopo

### Incluído
- Apresentar login por e-mail e senha e opções de criação de conta como Usuário ou Empresa.
- Autenticar usuários existentes e permitir recuperação de senha conforme RF-02.
- Permitir cadastro de conta de Empresa conforme RF-17.
- Identificar o perfil autenticado e aplicar permissões correspondentes.
- Permitir que Empresa autenticada cadastre ou associe usuários com perfil de Recrutador nas configurações.
- Manter o vínculo do Recrutador com a Empresa responsável.
- Proteger operações no backend e manter o comportamento de sessão previsto em RB-22.
- Registrar eventos relevantes de negócio e segurança conforme RB-27, RB-41, RNF-14 e decisão da OPEN-006; manter os registros por 1 ano, com acesso restrito e proteção contra alteração ou exclusão indevida.

### Fora do escopo
- Gestão de dados profissionais e necessidades de acessibilidade do candidato, tratada na SPEC-002.
- Implementação detalhada dos recursos de acessibilidade da interface, tratada na SPEC-003.
- Gestão do vetor de infraestrutura da Empresa, exceto o acesso necessário à área de recrutadores.
- Escolha de tecnologia específica de autenticação, sessão, banco de dados, framework ou provedor de e-mail.
- Definição de política de senha, duração de sessão ou mecanismo de bloqueio além do que a baseline determina.

## 3.1. Telas e evidência de layout

| Tela/área | Finalidade | Layout |
|---|---|---|
| Entrada/login | Login, recuperação de senha e opções de cadastro como Usuário ou Empresa | Pendente |
| Cadastro de Usuário | Iniciar criação de conta de usuário | Pendente |
| Cadastro de Empresa | Iniciar criação de conta organizacional | Pendente |
| Recuperação/redefinição de senha | Iniciar e concluir recuperação prevista em RF-02 | Pendente |
| Configurações da Empresa — Recrutadores | Cadastrar ou associar recrutador à Empresa autenticada | Pendente |
| Mensagens de autenticação | Informar falha ou bloqueio sem expor dados indevidos | Pendente |

A lista identifica áreas funcionais, não define quantidade final de páginas ou composição visual. Os protótipos devem ser anexados em docs/layout/ e aprovados separadamente.

## 4. Dependências

- Dependências de outras Specs: nenhuma; esta Spec estabelece identidade e autorização para as demais.
- Pré-condição para autenticação: conta existente e credenciais válidas.
- Pré-condição para cadastrar Recrutador: Empresa autenticada e autorizada.
- Provedor de e-mail e serviço externo de identidade não foram definidos na baseline.

## 5. Comportamento esperado

### 5.1 Entrada e autenticação
1. O visitante acessa a página de entrada.
2. O sistema apresenta e-mail, senha e opções de criação de conta como Usuário ou Empresa.
3. Se escolher cadastro, segue para o fluxo correspondente. Não existe cadastro independente de Recrutador.
4. O usuário existente informa as credenciais.
5. O sistema valida as credenciais.
6. Se válidas, autentica o usuário e encaminha para a área compatível com seu perfil.
7. Se inválidas, informa falha e não concede acesso.
8. A sessão comum expira após 60 minutos sem atividade. Não há limite máximo absoluto de duração enquanto houver atividade.
9. Logout explícito, troca ou redefinição de senha e bloqueio ou desativação da conta invalidam as sessões existentes.
10. A opção “manter conectado” permite permanência por 30 dias, com renovação conforme uso; ela não impede a invalidação por nenhum dos eventos acima.

### 5.2 Recuperação de senha
1. O usuário informa o e-mail na tela de recuperação.
2. O sistema informa quando o e-mail não estiver cadastrado; para uma conta existente, envia um link de recuperação por e-mail.
3. O link tem validade de 30 minutos e só pode ser utilizado uma vez.
4. A emissão de uma nova solicitação invalida o link emitido anteriormente.
5. Após a conclusão da redefinição, o link utilizado é invalidado.
6. O sistema aplica limitação de frequência às solicitações de recuperação; os limites numéricos permanecem pendentes de definição.
7. A redefinição de senha invalida as sessões existentes, conforme decisão registrada na OPEN-002.
3. O sistema valida a solicitação e permite redefinição quando válida.
4. As novas credenciais podem ser usadas no acesso.

A decisão aprovada define o envio por link de e-mail, validade de 30 minutos, uso único e invalidação do link anterior em nova solicitação. O formato técnico do token e o texto exato das mensagens permanecem por definir.

### 5.3 Cadastro e autorização por perfil
1. O sistema permite iniciar cadastro como Usuário ou Empresa.
2. Após autenticação, o perfil determina as operações permitidas.
3. O backend verifica permissões em toda operação protegida; ocultar controles na interface não é suficiente.
4. Operações administrativas são protegidas conforme RF-40.
5. Sessão inválida ou expirada não autoriza operações protegidas.

### 5.4 Cadastro de Recrutador
1. Uma Empresa autenticada e autorizada acessa as próprias configurações. **Não existe papel de Administrador associado à Empresa**; o perfil Administrador é reservado à moderação/gestão da plataforma.
2. A Empresa abre a área de Recrutadores e informa os dados necessários.
3. O sistema valida os dados e cria ou associa uma conta USUARIO com perfil de Recrutador.
4. O sistema mantém o vínculo com a Empresa que realizou o cadastro.
5. O sistema registra a alteração conforme as regras aplicáveis.
6. A Empresa não pode administrar vínculos de Recrutadores pertencentes a outra organização.

O comportamento deriva de UC-07 e RB-46. A forma de verificar consentimento ou tratar um e-mail que já pertença a uma conta precisa ser decidida antes da implementação. O perfil Administrador é exclusivo da plataforma e não participa da administração da conta Empresa.




## 6. Regras e invariantes

1. Credenciais devem ser validadas antes de conceder acesso (RB-21).
2. A senha deve conter no mínimo 10 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula e um número; símbolo não é obrigatório.
3. Após 10 tentativas consecutivas incorretas de login, a conta é bloqueada temporariamente por 15 minutos; o desbloqueio ocorre automaticamente ao fim do prazo ou por recuperação de senha válida.
4. O cadastro de Empresa exige razão social, identificador oficial e e-mail corporativo de contato; nome fantasia é opcional.
5. A liberação das funcionalidades organizacionais depende da validação do identificador oficial e da confirmação do e-mail corporativo.
6. Não permitir novo cadastro de Empresa com identificador oficial já associado a outra Empresa; orientar recuperação ou associação à conta existente.
7. A Empresa cadastra e vincula Recrutadores nas próprias configurações, conforme RF-17 e RB-46.
8. Quando o e-mail informado já pertencer a uma conta, a Empresa autenticada e autorizada pode solicitar o vínculo por convite enviado ao e-mail da conta; o titular deve dar aceite explícito antes da efetivação.
9. Enquanto o convite estiver pendente, não conceder permissões de Recrutador para a Empresa solicitante; informar à Empresa apenas o estado pendente, sem dados adicionais da conta existente.
10. Antes de efetivar o vínculo após o aceite, validar novamente a autorização da Empresa e respeitar RB-46; o aceite não autoriza automaticamente transferência ou administração de vínculo pertencente a outra Empresa.
11. Eventos de envio e resposta ao convite e de efetivação do vínculo são relevantes para rastreabilidade conforme RB-27 e RNF-14. Conforme decisão registrada na OPEN-006, os eventos relevantes de negócio e segurança devem ser auditados e os registros mantidos por 1 ano, com acesso restrito, proteção contra alteração/exclusão indevida e minimização dos dados registrados. Não se exige auditoria indiscriminada de consultas e visualizações; detalhes técnicos exaustivos e descarte permanecem para definição na implementação, respeitando a política aprovada e obrigações aplicáveis.
12. Operações protegidas devem verificar perfil e permissão no backend (RB-12, RF-40, DA-02).
13. Sessão expirada ou invalidada não pode autorizar operação protegida (RB-22).
14. Candidato, Recrutador e Administrador possuem permissões compatíveis com seus papéis (RF-03).
15. O cadastro inicial oferece Usuário ou Empresa; Recrutador é cadastrado/associado pela Empresa.
16. O Recrutador permanece vinculado à Empresa responsável (RB-46).
17. Uma Empresa só pode administrar vínculos sob sua própria responsabilidade.
18. Não se introduz o papel de Gestor de Seleção.
19. Cadastro, perfil e vínculo organizacional devem permanecer íntegros (RNF-09).
20. Alterações relevantes devem ser rastreáveis conforme RB-27 e RNF-14, respeitando RNF-08.
21. ADR-002 centraliza a autorização no backend, mas não determina JWT, sessão/cookie ou mecanismo específico.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| USUARIO | Identidade de acesso, e-mail, credenciais e perfil |
| CANDIDATO | Perfil associado ao usuário candidato; seus dados detalhados pertencem à SPEC-002 |
| EMPRESA | Conta organizacional e responsável pelo vínculo de recrutadores |
| ADMINISTRADOR | Perfil autorizado para operações administrativas |
| RECRUTADOR | Perfil de USUARIO vinculado a EMPRESA; não é entidade independente |

O modelo conceitual não detalha estrutura de credenciais, associação entre USUARIO e CANDIDATO ou mecanismo de recuperação. Esta Spec não cria atributos ou entidades para preencher essas lacunas.

## 8. Impacto arquitetural

- A fronteira de confiança fica no backend; operações protegidas não dependem apenas da interface.
- Autenticação e autorização devem ser aplicadas consistentemente.
- Recuperação de senha é um fluxo próprio, embora possa compartilhar serviços de identidade.
- O cadastro de Recrutador valida a Empresa responsável antes de persistir o vínculo.
- A apresentação deve cumprir os RNFs de acessibilidade; os recursos funcionais específicos são detalhados na SPEC-003.
- A arquitetura respeita ADR-004. Mecanismo de sessão, provedor de e-mail e bibliotecas permanecem abertos.

## 9. Contratos necessários

Contratos conceituais, sem definir endpoints HTTP:
- **Iniciar autenticação:** recebe credenciais e retorna sucesso ou falha.
- **Iniciar recuperação de senha:** inicia recuperação sem expor informações sensíveis da conta.
- **Concluir redefinição:** valida a solicitação e atualiza credenciais quando válida.
- **Criar conta de Usuário:** valida e registra a conta.
- **Criar conta de Empresa:** valida e registra a conta organizacional.
- **Consultar permissões:** identifica perfil e permissões para a operação solicitada.
- **Cadastrar/associar Recrutador:** valida autorização da Empresa e mantém vínculo organizacional.
- **Invalidar/encerrar sessão:** atende RB-22, com mecanismo específico ainda aberto.
- **Registrar alteração auditável:** rastreia alterações relevantes quando exigido pela baseline.

## 10. RNFs aplicáveis

- **RNF-07 Segurança:** credenciais e operações protegidas devem ser tratadas com segurança.
- **RNF-08 Privacidade:** dados de conta e autenticação não podem ser expostos indevidamente.
- **RNF-09 Integridade:** cadastro, perfil e vínculo organizacional permanecem consistentes.
- **RNF-14 Rastreabilidade e auditoria:** alterações relevantes devem ser rastreáveis.
- **RNF-01, RNF-02, RNF-03 e RNF-04** também se aplicam às telas, com cobertura transversal na SPEC-003.

## 11. Critérios de aceitação

- [ ] Entrada apresenta login por e-mail e senha.
- [ ] Cadastro oferece Usuário ou Empresa, sem cadastro independente de Recrutador.
- [ ] Credenciais válidas autenticam e encaminham conforme o perfil.
- [ ] Credenciais inválidas não autenticam.
- [ ] Recuperação permite redefinição quando a solicitação é válida.
- [ ] Operações protegidas verificam autorização no backend.
- [ ] Sessão expirada ou invalidada não executa operações protegidas.
- [ ] Empresa autorizada consegue cadastrar/associar Recrutador.
- [ ] Recrutador permanece vinculado à Empresa responsável.
- [ ] Empresa não consegue administrar vínculo de outra Empresa.
- [ ] Alterações relevantes são rastreáveis.
- [ ] Mensagens não expõem credenciais ou dados pessoais desnecessários.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-001-01 | Login válido | Usuário autenticado com perfil correto |
| T-001-02 | Credenciais incorretas | Acesso negado |
| T-001-03 | Operação protegida sem autenticação | Operação recusada |
| T-001-04 | Usuário sem permissão tenta operação | Backend recusa |
| T-001-05 | Sessão expirada tenta operação protegida | Operação recusada |
| T-001-06 | Recuperação de senha válida | Credenciais redefinidas |
| T-001-07 | Verificar opções de cadastro | Somente Usuário e Empresa |
| T-001-08 | Empresa autorizada cadastra Recrutador | Conta associada à Empresa |
| T-001-09 | Empresa tenta alterar vínculo de outra organização | Operação recusada |
| T-001-10 | Alteração de vínculo é concluída | Evento rastreável |
| T-001-11 | Erro de autenticação | Mensagem acessível sem exposição indevida |

## 13. Questões em aberto

As questões abaixo estão centralizadas em [OPEN.md](OPEN.md). Não são decisões tomadas nesta Spec.

- **OPEN-001:** resolvida; recuperação por link de e-mail, validade de 30 minutos, uso único, invalidação do link anterior em nova solicitação, informação quando o e-mail não está cadastrado e limitação de frequência sem limites numéricos definidos.
- **OPEN-002:** resolvida; sessão comum expira após 60 minutos sem atividade; sem limite máximo absoluto enquanto houver atividade; logout, troca/redefinição de senha e bloqueio/desativação invalidam as sessões; opção “manter conectado” por 30 dias, com renovação conforme uso.
- **OPEN-003:** resolvida; senha com mínimo de 10 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número, sem símbolo obrigatório; bloqueio temporário após 10 tentativas consecutivas incorretas por 15 minutos, com desbloqueio automático ao fim do prazo ou por recuperação de senha válida.
- **OPEN-004:** resolvida; razão social, identificador oficial e e-mail corporativo de contato obrigatórios; nome fantasia opcional. Validar o identificador oficial e confirmar separadamente o e-mail corporativo; liberar funcionalidades organizacionais somente após ambas as verificações. Impedir cadastro duplicado pelo identificador oficial e orientar recuperação/associação à conta existente. A Empresa cadastra/vincula Recrutadores conforme RF-17/RB-46. Permanecem a especificação dos procedimentos de validação, o tratamento de empresas sem o identificador adotado e os detalhes de associação tratados na OPEN-005.
- **OPEN-005:** resolvida; se o e-mail já pertencer a uma conta, a Empresa autenticada e autorizada pode solicitar vínculo por convite enviado ao e-mail da conta, exigindo aceite explícito do titular. O vínculo só se efetiva após o aceite e nova validação da autorização da Empresa. Até lá, o convite permanece pendente; a Empresa não recebe dados adicionais da conta. O aceite não autoriza automaticamente transferir ou administrar vínculos de outra Empresa. Prazo, cancelamento/reenvio, recusa/expiração e regras para múltiplos vínculos permanecem sem decisão. Eventos de convite e vínculo são relevantes para auditoria; lista e retenção ficam na OPEN-006.
- **OPEN-006:** eventos de auditoria e prazo de retenção.

## 14. Definition of Done

- [ ] Texto revisado e aprovado pelo responsável humano.
- [ ] Rastreabilidade de RF, RB, RNF, casos de uso, modelo, driver e ADR conferida.
- [ ] Questões em aberto decididas ou mantidas explicitamente como pendências.
- [ ] Layouts aplicáveis anexados em docs/layout/ e aprovados separadamente.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Invariantes de autenticação, autorização e vínculo organizacional verificáveis.
- [ ] Nenhuma implementação iniciada antes da aprovação do texto e do layout.

---

# SPEC-002 — Gerenciar perfil e necessidades de acessibilidade do candidato

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-002 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Consultar, cadastrar e atualizar dados profissionais e necessidades funcionais de acessibilidade |

## 2. Rastreabilidade

- **RF:** RF-04 Cadastro de candidato; RF-19 Gestão do perfil e necessidades de acessibilidade.
- **RB:** RB-06 Necessidades obrigatórias na compatibilidade; RB-26 Confidencialidade das informações de acessibilidade; RB-27 Histórico de alterações; RB-28 Autodeclaração das necessidades; RB-29 Informações mínimas do perfil.
- **RNF:** RNF-08 Privacidade; RNF-09 Integridade dos dados; RNF-14 Rastreabilidade e auditoria.
- **Caso de uso:** UC-01 Gerenciar Perfil.
- **Modelo conceitual:** CANDIDATO e VETOR_ACESSIBILIDADE_CANDIDATO.
- **Drivers:** DA-01 Acessibilidade nativa da interface; DA-02 Autenticação e autorização por perfil.
- **ADRs:** ADR-001 Interface acessível; ADR-002 Autenticação/autorização no backend; ADR-004 Arquitetura em camadas.
- **Dependência:** SPEC-001.

## 3. Escopo

### Incluído
- Permitir que candidato autenticado consulte seu perfil.
- Cadastrar e atualizar as categorias aprovadas na OPEN-007: dados pessoais básicos (nome/e-mail reutilizados da conta), formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais.
- Permitir autodeclaração e atualização de necessidades funcionais de acessibilidade e recursos indispensáveis para acessibilidade.
- Organizar necessidades nas categorias do vetor conceitual.
- Validar campos obrigatórios e informações mínimas definidas na baseline.
- Proteger as informações de acessibilidade e registrar alterações relevantes.
- Disponibilizar os dados para capacidades posteriores somente conforme autorização e finalidade.

### Fora do escopo
- Cálculo de compatibilidade, pertencente à SPEC-007.
- Busca e filtros de vagas.
- Armazenamento de laudos médicos: o sistema não armazena laudos; necessidades podem ser autodeclaradas.
- Definição de campos internos, formatos, limites, cardinalidades e validações específicas ainda não aprovados; essas lacunas permanecem nas OPEN-007.1/007.2.

## 3.1. Telas e evidência de layout

| Tela/área | Finalidade | Layout |
|---|---|---|
| Perfil do candidato | Consultar dados cadastrados | Pendente |
| Edição de dados profissionais | Cadastrar/atualizar dados previstos na baseline | Pendente |
| Necessidades de acessibilidade | Declarar e atualizar necessidades funcionais | Pendente |
| Validação de formulário | Indicar campos obrigatórios e erros acessivelmente | Pendente |

A divisão é funcional e provisória; não fixa a lista final de campos ou a disposição visual. Os protótipos devem ser anexados em docs/layout/ e aprovados separadamente.

## 4. Dependências

- **SPEC-001:** fornece autenticação e autorização.
- **Modelo de domínio:** CANDIDATO e VETOR_ACESSIBILIDADE_CANDIDATO.
- **Consumidora posterior:** SPEC-007 usa os dados no cálculo de compatibilidade; esta Spec não implementa o algoritmo.

## 5. Comportamento esperado

### 5.1 Consultar perfil
1. Candidato autentica-se e abre seu perfil.
2. Sistema recupera e apresenta dados profissionais e necessidades associados à conta.
3. Sistema não apresenta dados privados a outro candidato.

### 5.2 Cadastrar/atualizar dados profissionais
1. Candidato abre a edição.
2. Informa ou atualiza os dados previstos em RF-04/RF-19.
3. O formulário reutiliza nome e e-mail mantidos na conta, sem exigir preenchimento duplicado; o cadastro da conta segue as regras próprias da SPEC-001. CPF não é obrigatório para salvar o perfil, pois a baseline não apresenta justificativa funcional aprovada para exigi-lo.
4. Formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais fazem parte do escopo aprovado na OPEN-007, podem ser preenchidos progressivamente e não bloqueiam o salvamento por categoria.
5. Necessidades funcionais de acessibilidade e recursos indispensáveis não exigem declaração universal. Quando declarados, podem ser informados por autodeclaração, sem exigir ou armazenar laudo; a interface distingue “não informado” de “declarado que não possui necessidade”.
6. Dados válidos são persistidos, permitindo o preenchimento progressivo das categorias.
7. Erros de validação definidos são indicados para correção, sem descarte silencioso das informações preenchidas.
8. A ausência de dados necessários à análise de uma vaga é indicada como insuficiência de informação, sem presumir compatibilidade (RB-16); isso não torna automaticamente o campo obrigatório para salvar o perfil.

### 5.3 Declarar necessidades de acessibilidade
1. Candidato acessa a área de necessidades.
2. Declara necessidades funcionais por autodeclaração.
3. Sistema organiza os dados nas categorias do vetor: necessidades arquitetônicas, de comunicação e tecnológicas.
4. Sistema valida o preenchimento conforme os requisitos de dados mínimos.
5. Após confirmação e validação, persiste os dados com controles de acesso compatíveis com sua confidencialidade.

### 5.4 Atualizar necessidades
1. Candidato consulta suas necessidades atuais e altera o que deseja.
2. Sistema valida e salva a atualização.
3. A alteração relevante é rastreável conforme RB-27/RNF-14.
4. Os dados atualizados ficam disponíveis para usos autorizados, incluindo análise de compatibilidade.

## 6. Regras e invariantes

1. O candidato pode autodeclarar necessidades sem apresentar ou armazenar laudo médico (RB-28 e decisão em OPEN.md).
2. Necessidades de acessibilidade são informações protegidas (RB-26, RNF-08).
3. Dados profissionais e vetor devem permanecer associados ao candidato correto (RNF-09).
4. O candidato só pode consultar/alterar o próprio perfil, salvo permissões explicitamente previstas pela baseline.
5. O salvamento respeita RB-29 e o cadastro progressivo aprovado na OPEN-007.1. Nome e e-mail são reutilizados da conta, sem preenchimento duplicado no perfil; o cadastro da conta segue a SPEC-001. CPF não é obrigatório para salvar o perfil, pois não há justificativa funcional aprovada na baseline para exigi-lo.
6. As categorias aprovadas na OPEN-007 — formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais — não bloqueiam o salvamento por categoria.
7. Necessidades funcionais e recursos indispensáveis não exigem declaração universal. A interface deve distinguir ausência de informação (“não informado”) de declaração de inexistência de necessidade; necessidades declaradas podem ser autodeclaradas sem exigir ou armazenar laudo.
8. A ausência de dados necessários à análise de uma vaga deve ser indicada sem presumir compatibilidade, conforme RB-16, e não torna automaticamente esses dados obrigatórios para salvar o perfil.
9. A distinção de necessidades obrigatórias deve ser preservada quando suportada pela baseline, pois RB-06 determina que sejam consideradas na compatibilidade.
10. Alterações relevantes são rastreáveis conforme RB-27 e RNF-14.
11. O sistema registra necessidades funcionais declaradas; não infere diagnóstico nem exige documento não previsto.
12. Persistir o perfil não substitui as regras de compatibilidade da SPEC-007.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| CANDIDATO | Dados de perfil e associação com a identidade do candidato |
| VETOR_ACESSIBILIDADE_CANDIDATO | Necessidades arquitetônicas, de comunicação e tecnológicas |

O modelo conceitual usa o atributo agregado dados_profissionais e não especifica todos os subcampos, tipos, valores ou cardinalidades. Esta Spec não os inventa; devem ser confirmados na baseline de RF e UC-01.

## 8. Impacto arquitetural

- Leitura e atualização exigem identidade e autorização.
- Dados de acessibilidade recebem tratamento compatível com privacidade e finalidade.
- A apresentação permite preenchimento/correção acessíveis.
- Persistência mantém íntegra a associação entre candidato e vetor.
- Dados são disponibilizados a capacidades consumidoras por contratos autorizados.
- O serviço de perfil não incorpora o algoritmo de compatibilidade.

## 9. Contratos necessários

- **Consultar perfil próprio:** retorna dados profissionais e necessidades do candidato autenticado.
- **Criar/atualizar dados profissionais:** valida e persiste campos definidos na baseline.
- **Consultar necessidades:** retorna necessidades do candidato autorizado.
- **Criar/atualizar necessidades:** valida e persiste a autodeclaração.
- **Validar informações mínimas:** aplica RF-04/RF-19 e RB-29.
- **Registrar alteração de perfil:** mantém rastreabilidade conforme RB-27/RNF-14.

São responsabilidades conceituais, não endpoints ou métodos definitivos.

## 10. RNFs aplicáveis

- **RNF-08 Privacidade:** proteção de dados pessoais e necessidades de acessibilidade.
- **RNF-09 Integridade:** associação e persistência consistentes.
- **RNF-14 Rastreabilidade e auditoria:** alterações relevantes rastreáveis.
- **RNF-01, RNF-02, RNF-03 e RNF-04:** acessibilidade, leitores de tela, responsividade e usabilidade da interação; detalhamento transversal na SPEC-003.

## 11. Critérios de aceitação

- [ ] Candidato autenticado consulta seu perfil.
- [ ] Candidato cadastra e atualiza todas as categorias aprovadas na OPEN-007: dados pessoais básicos da conta, formação/escolaridade, competências, idiomas, necessidades funcionais, recursos indispensáveis, experiências profissionais, cursos, certificações e links profissionais.
- [ ] Candidato declara necessidades por autodeclaração.
- [ ] Necessidades são organizadas nas categorias conceituais do vetor.
- [ ] Nome e e-mail da conta são reutilizados sem exigir preenchimento duplicado no perfil; CPF não bloqueia o salvamento.
- [ ] Formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais não bloqueiam o salvamento por categoria.
- [ ] Necessidades funcionais e recursos indispensáveis não exigem declaração universal; “não informado” é distinguido de “declarado que não possui necessidade”, e a autodeclaração não exige nem armazena laudo.
- [ ] A ausência de dados necessários à análise de uma vaga é indicada sem presumir compatibilidade, conforme RB-16, sem tornar automaticamente esses dados obrigatórios para salvar o perfil.
- [ ] Um candidato não consulta nem altera perfil privado de outro.
- [ ] Dados de acessibilidade não são expostos sem autorização.
- [ ] Atualizações preservam integridade da associação entre candidato e necessidades.
- [ ] Alterações relevantes são rastreáveis.
- [ ] O sistema não exige nem armazena laudo médico como condição para declarar necessidades.
- [ ] Mensagens de validação são perceptíveis por tecnologias assistivas.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-002-01 | Consultar perfil próprio | Dados do candidato apresentados |
| T-002-02 | Salvar dados profissionais válidos | Dados persistidos |
| T-002-03 | Omitir campo obrigatório definido | Salvamento recusado e campo indicado |
| T-002-04 | Declarar necessidades | Vetor associado e persistido |
| T-002-05 | Atualizar necessidades | Dados atualizados sem perder associação |
| T-002-06 | Tentar consultar perfil de outro candidato | Acesso recusado |
| T-002-07 | Usuário sem autorização tenta ver necessidades privadas | Acesso recusado |
| T-002-08 | Atualização concluída | Alteração rastreável conforme política |
| T-002-09 | Autodeclarar necessidades sem laudo | Fluxo não exige laudo |
| T-002-10 | Usar formulário com leitor de tela/teclado | Campos e erros identificáveis e operáveis |
| T-002-11 | Consultar perfil com as categorias aprovadas | Categorias do perfil e dados de acessibilidade apresentados ao próprio candidato conforme autorização |
| T-002-12 | Salvar perfil sem experiências, cursos, certificações ou links profissionais | Salvamento permitido, desde que as demais validações aplicáveis sejam satisfeitas |
| T-002-13 | Categoria profissional ainda não preenchida é relevante para uma vaga | Insuficiência indicada sem presumir compatibilidade conforme RB-16 |

## 13. Questões em aberto

As questões abaixo estão centralizadas em [OPEN.md](OPEN.md). Não são decisões tomadas nesta Spec.

- **OPEN-007 (decisão aprovada; resolvida):** o perfil inclui dados pessoais básicos (nome/e-mail reutilizados da conta), formação/escolaridade, competências, idiomas, necessidades funcionais de acessibilidade, recursos indispensáveis para acessibilidade, experiências profissionais, cursos, certificações e links profissionais. As categorias profissionais são preenchidas progressivamente; os detalhes internos e regras específicas permanecem sujeitos à baseline e às OPEN-007.1/007.2.
- **OPEN-007.1 (decisão aprovada; resolvida):** nome e e-mail são reutilizados da conta, sem preenchimento duplicado no perfil; o cadastro da conta segue as regras da SPEC-001. CPF não é obrigatório para salvar o perfil. Formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais não bloqueiam o salvamento por categoria, sem antecipar o escopo de categorias da OPEN-007. Necessidades funcionais e recursos indispensáveis não exigem declaração universal; necessidades podem ser autodeclaradas sem exigir/armazenar laudo, e “não informado” deve ser distinto de “declarado que não possui necessidade”. Dados necessários à análise de uma vaga que estejam ausentes são indicados como insuficiência sem presumir compatibilidade (RB-16).
- **OPEN-007.2 (decisão aprovada):** validação básica por categoria, respeitando o cadastro progressivo; formatos, limites e critérios específicos permanecem pendentes.
- **OPEN-008 (decisão aprovada):** catálogo estruturado e extensível nas categorias arquitetônicas, de comunicação e tecnológicas, com distinção entre necessidades obrigatórias e não obrigatórias; lista inicial, significados operacionais e detalhes de representação permanecem pendentes.
- **OPEN-009 (decisão aprovada):** histórico de alterações relevantes, sem exigir versionamento completo do perfil a cada modificação; retenção de um ano da OPEN-006 serve como referência para auditoria, enquanto campos definitivos, casos de preservação de valores anteriores/versões completas e aplicação exata ao histórico funcional permanecem pendentes.
- **OPEN-010 (decisão aprovada):** associação 1:1 opcional para USUARIO e obrigatória para CANDIDATO; cada CANDIDATO pertence a exatamente um USUARIO, e cada USUARIO pode ter zero ou um CANDIDATO. O modelo conceitual deverá explicitar a cardinalidade. Momento de criação do perfil, desativação/exclusão, conversão entre perfis e definição técnica de chave/restrições permanecem pendentes.
- **OPEN-011 (decisão aprovada):** após candidatura, Recrutador autenticado e autorizado da Empresa responsável pode consultar perfil profissional e necessidades de acessibilidade no contexto daquela candidatura, respeitando RB-26, RB-28, RF-30 e RB-46. A candidatura não concede acesso a perfis sem relação com a vaga ou de outras Empresas, nem implica exposição indiscriminada de todos os campos. Matriz definitiva de campos, distinções por categoria/etapa, restrições adicionais e eventual auditoria específica de acessos permanecem pendentes.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Campos e validações conferidos com RF-04, RF-19, RB-26 a RB-29 e UC-01.
- [ ] Questões em aberto decididas ou mantidas como pendências explícitas.
- [ ] Layouts anexados em docs/layout/ e aprovados separadamente.
- [ ] Critérios e testes revisados.
- [ ] Invariantes de confidencialidade, integridade e autorização verificáveis.
- [ ] Nenhuma implementação iniciada antes da aprovação do texto e layout.

---

# SPEC-003 — Disponibilizar recursos de acessibilidade da interface

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-003 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Recursos funcionais de acessibilidade para interação com a plataforma |

## 2. Rastreabilidade

- **RF:** RF-16 Recursos de acessibilidade.
- **RB:** nenhuma regra de negócio específica listada para esta Spec no mapa.
- **RNF:** RNF-01 Acessibilidade; RNF-02 Compatibilidade com leitores de tela; RNF-03 Responsividade; RNF-04 Usabilidade; RNF-13 Compatibilidade.
- **Casos de uso:** UC-00, UC-01, UC-02 e UC-03 como capacidade transversal.
- **Modelo conceitual:** nenhuma entidade de domínio específica.
- **Driver:** DA-01 Acessibilidade nativa da interface.
- **ADR:** ADR-001 Interface web com acessibilidade incorporada à arquitetura.
- **Dependências:** SPEC-001; SPEC-002 utiliza os padrões acessíveis definidos por esta capacidade.

## 3. Escopo

### Incluído
- Disponibilizar os recursos funcionais citados para a plataforma: compatibilidade com leitores de tela, navegação por teclado, alto contraste e comandos de voz.
- Permitir operação dos fluxos cobertos pelo Bloco 1 sem dependência exclusiva de mouse ou interação visual.
- Manter controles, campos, mensagens de erro e estados identificáveis por tecnologias assistivas.
- Incorporar acessibilidade à camada de apresentação desde a construção dos componentes.
- Verificar acessibilidade nos fluxos de entrada, perfil e necessidades de acessibilidade.

### Fora do escopo
- Escolher biblioteca de interface, CSS ou tecnologia específica de voz.
- Definir comandos, idiomas ou mecanismo de reconhecimento não especificados na baseline.
- Reduzir acessibilidade a uma tela isolada de configurações.
- Fixar layout definitivo de todas as funcionalidades.
- Declarar conformidade integral sem critérios e evidências de avaliação.

## 3.1. Telas e evidência de layout

| Tela/área | Requisito de interação | Layout |
|---|---|---|
| Entrada/login | Teclado, campos rotulados e mensagens acessíveis | Pendente junto à SPEC-001 |
| Cadastro de Usuário/Empresa | Campos, instruções e erros acessíveis | Pendente junto à SPEC-001 |
| Perfil do candidato | Consulta e edição acessíveis | Pendente junto à SPEC-002 |
| Necessidades de acessibilidade | Controles identificáveis e operáveis | Pendente junto à SPEC-002 |
| Alto contraste, se houver controle explícito | Mecanismo de ativação ainda em aberto | Pendente |
| Interação por voz, se houver controle explícito | Estados e falhas precisam ser definidos | Pendente |

Esta capacidade pode afetar componentes transversais e não exige necessariamente uma tela independente. Protótipos e evidências devem ser anexados em docs/layout/ e aprovados separadamente.

## 4. Dependências

- **SPEC-001:** fluxos de entrada e autenticação.
- **SPEC-002:** consulta e edição de perfil.
- **RNFs transversais:** os padrões de acessibilidade continuam válidos nos demais blocos.
- Bibliotecas e tecnologias específicas não foram selecionadas.

## 5. Comportamento esperado

### 5.1 Navegação por teclado
1. O usuário abre uma tela funcional.
2. Controles interativos podem ser alcançados e operados por teclado.
3. O foco é perceptível e segue uma ordem coerente.
4. Ações essenciais não dependem exclusivamente de mouse.

### 5.2 Leitores de tela
1. O usuário percorre um fluxo usando leitor de tela.
2. Campos, botões, links, títulos, instruções e mensagens têm identificação semântica apropriada.
3. O propósito dos controles e resultado das ações podem ser compreendidos.
4. Erros e alterações de estado relevantes são perceptíveis por tecnologia assistiva.

### 5.3 Alto contraste
1. O usuário precisa de contraste visual elevado.
2. O recurso previsto em RF-16 fica disponível conforme a solução aprovada.
3. Textos, controles, foco e estados relevantes permanecem distinguíveis.
4. Informações importantes não dependem somente de cor.

O mecanismo de ativação e persistência da preferência não é definido pela baseline e permanece em aberto.

### 5.4 Comandos de voz
1. O usuário inicia uma interação por voz nos fluxos suportados.
2. A interface comunica disponibilidade e falha quando esses estados fizerem parte da solução aprovada.
3. Voz não é a única forma de executar ação necessária; há alternativas acessíveis.
4. Vocabulário e tratamento de falhas serão especificados antes da implementação desse recurso.

### 5.5 Responsividade e usabilidade
1. O usuário acessa a plataforma nos dispositivos cobertos por RNF-03.
2. Conteúdo e controles permanecem utilizáveis.
3. A organização da interface mantém consistência suficiente para reconhecer ações e mensagens entre telas.

## 6. Regras e invariantes

1. Acessibilidade é incorporada à apresentação, não adicionada apenas como correção posterior (DA-01, ADR-001).
2. Fluxos essenciais oferecem interação por teclado.
3. Controles e mensagens são identificáveis por leitores de tela.
4. Estados importantes não dependem exclusivamente de cor.
5. Comandos de voz, quando disponibilizados, não substituem outras formas acessíveis.
6. Interface permanece utilizável nos dispositivos previstos.
7. Padrões adotados respeitam RNF-13 e ambientes de validação acordados.
8. Nenhuma biblioteca ou tecnologia é escolhida por esta Spec.
9. A obrigação de acessibilidade continua válida nas demais Specs.

## 7. Modelo de domínio envolvido

Não há entidade de domínio específica; o escopo é a camada de apresentação e seus componentes.

A baseline não determina se preferências de alto contraste serão persistidas por usuário, sessão ou apenas durante a navegação.

## 8. Impacto arquitetural

- Componentes de apresentação devem suportar teclado e tecnologias assistivas.
- Acessibilidade deve ser verificada por componente e fluxo, não apenas por inspeção visual.
- Estados de validação, foco, carregamento e erro devem ser expostos de forma acessível.
- Se confirmada, a tecnologia de voz deve permanecer desacoplada das regras de domínio.
- Estratégia de alto contraste e persistência de preferências depende das questões em aberto.
- Biblioteca de componentes, CSS e tecnologia de voz permanecem abertas conforme ADR-001.

## 9. Contratos necessários

- **Operar controles por teclado:** controles funcionais devem permitir foco e operação por teclado.
- **Expor semântica a tecnologias assistivas:** controles, rótulos, instruções e mensagens comunicam propósito e estado.
- **Apresentar erros e confirmações acessíveis:** resultados são perceptíveis e identificáveis.
- **Ativar alto contraste:** disponibiliza o recurso conforme mecanismo aprovado.
- **Receber comando de voz:** se confirmado no escopo final, recebe comando e apresenta resultado/falha sem bloquear alternativas.
- **Adaptar apresentação ao dispositivo:** conteúdo e ações essenciais permanecem utilizáveis nos contextos cobertos por RNF-03.

São contratos de comportamento da interface, não APIs públicas.

## 10. RNFs aplicáveis

- **RNF-01 Acessibilidade:** o projeto cita WCAG 2.1 nível AA.
- **RNF-02 Compatibilidade com leitores de tela:** controles, conteúdo e mensagens utilizáveis com leitores de tela.
- **RNF-03 Responsividade:** adaptação aos dispositivos previstos.
- **RNF-04 Usabilidade:** ações, controles e feedback compreensíveis e operáveis.
- **RNF-13 Compatibilidade:** ambientes de uso cobertos pela baseline considerados na validação.

A referência a WCAG 2.1 AA não determina por si só ferramentas, combinações de navegador/leitor de tela ou evidências de validação. O plano de avaliação precisa ser definido.

## 11. Critérios de aceitação

- [ ] Recursos e controles essenciais são operáveis por teclado, com foco perceptível e ordem coerente.
- [ ] Nome, função e estado dos controles são identificáveis por tecnologia assistiva.
- [ ] Contraste e redimensionamento são verificados conforme RNF-01 a RNF-04, usando o procedimento de validação ainda a definir em OPEN-016.


- [ ] Fluxos essenciais do Bloco 1 podem ser operados sem mouse.
- [ ] Ordem e indicador de foco são perceptíveis e coerentes.
- [ ] Campos e controles são identificáveis por leitor de tela.
- [ ] Erros e resultados de ações são apresentados de forma acessível.
- [ ] Informações importantes não dependem exclusivamente de cor.
- [ ] Alto contraste, conforme RF-16, pode ser utilizado sem ocultar conteúdo necessário.
- [ ] Se comandos de voz forem confirmados, há alternativa acessível e tratamento de falhas definido.
- [ ] Fluxos são utilizáveis nos tamanhos de tela contemplados por RNF-03.
- [ ] Evidências suficientes são registradas para avaliar RNFs aplicáveis.
- [ ] Biblioteca específica não é critério de aceitação, pois não foi selecionada.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-003-01 | Navegar no login somente por teclado | Controles essenciais alcançáveis e operáveis |
| T-003-02 | Percorrer formulário com leitor de tela | Campos, rótulos e instruções identificáveis |
| T-003-03 | Enviar formulário com erro | Erros associados aos campos e perceptíveis |
| T-003-04 | Executar ação com confirmação | Resultado comunicado de forma acessível |
| T-003-05 | Usar alto contraste | Conteúdo e controles continuam distinguíveis |
| T-003-06 | Verificar estado comunicado por cor | Estado também indicado por texto, forma ou semântica |
| T-003-07 | Usar viewport estreita | Conteúdo e ações essenciais permanecem utilizáveis |
| T-003-08 | Usar voz, se aprovada | Comando suportado produz feedback e falha não bloqueia alternativa |
| T-003-09 | Revisar telas de perfil | Consulta e edição mantêm padrões acessíveis |
| T-003-10 | Avaliar conformidade | Evidências documentadas contra critérios acordados |

## 13. Questões em aberto

As questões abaixo estão centralizadas em [OPEN.md](OPEN.md). Não são decisões tomadas nesta Spec.

- **OPEN-012 (decisão aprovada):** abordagem combinada para alto contraste: respeitar preferências de contraste do sistema operacional/navegador e oferecer controle próprio para ativar/desativar na plataforma. A persistência fica para OPEN-013; divergência entre preferências, estratégia técnica e validação permanecem pendentes.
- **OPEN-013 (decisão aprovada):** salvar as preferências de acessibilidade definidas pela plataforma na conta do usuário e reaplicá-las em sessões futuras, inclusive em outro dispositivo. O alto contraste mantém o controle próprio da OPEN-012 e considera preferências externas suportadas. Permanecem pendentes o catálogo de preferências persistidas, divergências entre configurações internas/externas, usuários não autenticados e estratégia técnica de armazenamento/recuperação.
- **OPEN-014 (decisão aprovada):** interação por voz em português brasileiro (pt-BR), para navegação e operações comuns em formulários nos fluxos suportados, incluindo navegação entre áreas, acionamento de controles, preenchimento de campos e confirmação de ações, sempre respeitando permissões, validações e confirmações exigidas. Deve comunicar resultados/falhas de forma acessível quando aplicável e não substituir alternativas acessíveis. Permanecem pendentes o catálogo e frases exatas, cobertura de fluxos/controles, tratamento detalhado de ambiguidades/falhas/confirmações, tecnologia e compatibilidade dos ambientes e eventual suporte a outros idiomas.
- **OPEN-015 (decisão aprovada):** estabelecer matriz de ambientes de referência para validar teclado, leitores de tela, contraste, responsividade e fluxos essenciais da SPEC-003, incluindo entrada/autenticação, perfil do candidato e necessidades de acessibilidade. A matriz combinará navegadores, tecnologias assistivas e dispositivos e será referência de teste, não lista exclusiva de suporte. Nomes/versões, cobertura mínima por combinação, frequência de revalidação e evidências específicas por ambiente permanecem pendentes; processo e evidências de avaliação WCAG 2.1 AA ficam na OPEN-016.
- **OPEN-016 (decisão aprovada):** adotar validação combinada por ferramentas automatizadas e avaliações manuais, registrando evidências nos ambientes de referência da OPEN-015. Avaliar teclado/foco, controles, mensagens/estados, contraste, redimensionamento, recursos de acessibilidade e leitores de tela nos ambientes aplicáveis. Registrar ambiente, fluxo, procedimento, resultado, problemas encontrados e situação após correção/reverificação. Ferramentas, cobertura mínima, frequência, formato/local das evidências, severidade/priorização/aceite de problemas e condições formais de conformidade permanecem pendentes. Testes automatizados ou parciais isoladamente não comprovam conformidade integral com WCAG 2.1 AA.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Escopo de RF-16 confirmado, especialmente alto contraste e comandos de voz.
- [ ] Questões em aberto decididas ou mantidas explicitamente como pendências.
- [ ] Layouts anexados em docs/layout/ e aprovados separadamente.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Evidências de teclado, leitor de tela, responsividade e contraste documentadas conforme plano aprovado.
- [ ] Acessibilidade tratada como requisito transversal.
- [ ] Nenhuma implementação iniciada antes da aprovação do texto e do layout.

---

## Registro de revisão do Bloco 1

| Spec | Estado do texto | Estado do layout | Revisão humana |
|---|---|---|---|
| SPEC-001 — Acessar a plataforma e identificar perfil organizacional | especificada | pendente | aguardando |
| SPEC-002 — Gerenciar perfil e necessidades de acessibilidade do candidato | especificada | pendente | aguardando |
| SPEC-003 — Disponibilizar recursos de acessibilidade da interface | especificada | pendente | aguardando |

**Próxima etapa:** detalhar o Bloco 3. A revisão coletiva das questões em aberto pode ocorrer depois que todas as Specs estiverem detalhadas.


# Bloco 2 — Empresa, vagas próprias e ingestão externa

Este bloco detalha SPEC-004, SPEC-005 e SPEC-006. As questões pendentes são referenciadas em `docs/OPEN.md`; nenhuma delas é considerada decidida por estar descrita aqui.

---

# SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-004 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Registrar, consultar e atualizar informações de acessibilidade física, digital e atitudinal da Empresa |

## 2. Rastreabilidade

- **RF:** RF-17 — Cadastro de empresa; RF-18 — Gestão de vagas, no que depende das informações de acessibilidade; RF-38 — Auditoria de operações.
- **RB:** RB-08 — Divergências recorrentes; RB-20 — Nota baseada em dados registrados; RB-27 — Histórico de alterações; RB-37 — Registro das decisões.
- **RNF:** RNF-09 — Integridade; RNF-14 — Rastreabilidade e auditoria.
- **Caso de uso:** UC-07 — Cadastrar Infraestrutura da Empresa.
- **Modelo conceitual:** EMPRESA, INFRAESTRUTURA_EMPRESA e USUARIO/RECRUTADOR no contexto de autorização.
- **Drivers:** DA-01, DA-04, DA-07.
- **ADRs:** ADR-001, ADR-004.
- **Dependência:** SPEC-001, para autenticação e autorização.
- **Questões relacionadas:** OPEN-017 a OPEN-019, com OPEN-018 resolvida; OPEN-019 permanece aberta.

## 3. Escopo

### Incluído
- Permitir à Empresa autenticada acessar as configurações próprias.
- Apresentar um mapeamento estruturado de informações de acessibilidade da empresa.
- Permitir registrar e atualizar informações físicas, digitais e atitudinais previstas pelo questionário.
- Validar os itens obrigatórios definidos na baseline.
- Persistir as informações associadas à Empresa correta.
- Disponibilizar os dados registrados para usos autorizados, incluindo exibição relacionada às vagas e análise de compatibilidade.
- Registrar alterações relevantes para rastreabilidade.

### Fora do escopo
- Cadastro e vínculo organizacional de Recrutadores, detalhado na SPEC-001, embora UC-07 também mencione essa capacidade.
- Cadastro, edição e publicação de vagas, detalhados na SPEC-005.
- Cálculo da compatibilidade ou da nota pública de acessibilidade.
- Inferir condições de acessibilidade que a Empresa não informou.
- Definir campos, escalas, evidências ou classificações não estabelecidos na baseline.

## 3.1. Telas e evidência de layout

| Tela/área | Finalidade | Layout |
|---|---|---|
| Configurações da Empresa | Entrada para gerenciar informações organizacionais | Pendente |
| Mapeamento de infraestrutura | Consultar e preencher questionário de acessibilidade | Pendente |
| Validação do mapeamento | Apresentar itens obrigatórios pendentes ou inconsistências | Pendente |
| Resumo de infraestrutura | Consultar informações registradas que possam ser usadas em vagas | Pendente |

A lista é funcional, não determina quantidade final de telas ou composição visual. A identidade visual é referência de estilo; o protótipo funcional deve ser anexado em `docs/layout/` e aprovado separadamente.

## 4. Dependências

- **SPEC-001:** autenticação e autorização da Empresa.
- **SPEC-005:** poderá utilizar informações de infraestrutura ao cadastrar/publicar vaga.
- **SPEC-007/SPEC-008/SPEC-010:** capacidades posteriores poderão consumir ou exibir dados de acessibilidade conforme suas próprias regras.
- A estrutura categorizada do questionário e os itens citados no UC-07 estão definidos pela decisão da OPEN-017. Sugestões adicionais só integram o escopo após aprovação explícita. Conforme OPEN-018, o mapeamento usa dados estruturados e extensíveis, com respostas adequadas a cada item e distinção, quando aplicável, entre presença declarada, ausência declarada e informação não informada; não há escala universal de acessibilidade. O estado atual e o histórico de alterações relevantes são mantidos sem exigir cópia integral a cada modificação. A lista individual de campos obrigatórios, os valores/significados exatos, os campos internos e limites e os casos que exigem valores anteriores ou versões completas permanecem pendentes.

## 5. Comportamento esperado

### 5.1 Consultar infraestrutura
1. A Empresa autenticada acessa as configurações.
2. Seleciona o mapeamento de infraestrutura.
3. O sistema recupera e apresenta os dados já registrados para aquela Empresa.
4. O sistema não permite consultar ou alterar a infraestrutura de outra organização sem autorização explícita prevista na baseline.

### 5.2 Registrar infraestrutura
1. A Empresa abre o questionário estruturado.
2. Informa as características de acessibilidade solicitadas pelo sistema, incluindo os itens descritos no UC-07, como rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas.
3. O sistema valida os itens obrigatórios definidos pela baseline.
4. Se houver itens obrigatórios pendentes, o sistema impede o salvamento e identifica o que precisa ser completado.
5. Se os dados forem válidos, o sistema persiste o mapeamento associado à Empresa.
6. O sistema registra a alteração relevante.

### 5.3 Atualizar infraestrutura
1. A Empresa consulta os dados existentes e altera as informações desejadas.
2. O sistema valida novamente os itens obrigatórios e a consistência dos dados.
3. O sistema salva a versão atualizada sem associá-la a outra organização.
4. A alteração fica rastreável conforme RB-27/RB-37 e RNF-14.

### 5.4 Disponibilização dos dados
1. Capacidades autorizadas solicitam informações de acessibilidade registradas.
2. O sistema disponibiliza os dados conforme permissões e finalidade.
3. Dados ausentes permanecem não informados; o sistema não deve inferir que uma característica existe ou inexiste.
4. Esta Spec não calcula compatibilidade nem nota pública.

### 5.5 Tratar divergências recorrentes
1. Registrar a divergência relacionada às informações de acessibilidade declaradas pela Empresa, identificando sua origem ou referência, a data do registro e os elementos disponíveis para análise.
2. Encaminhar o registro para análise administrativa, sem considerar a divergência ou a recorrência de relatos como prova suficiente, por si só, de declaração incorreta.
3. Analisar as informações e evidências disponíveis antes de decidir sobre eventual alteração.
4. Registrar a decisão, sua justificativa e o responsável, mantendo a rastreabilidade conforme as regras aplicáveis.
5. Executar somente as alterações autorizadas pela decisão registrada e pelas regras de negócio aplicáveis.

O procedimento não define sanções automáticas, limiares numéricos de recorrência, evidências mínimas obrigatórias, prazos ou catálogo de decisões. Esses elementos permanecem sujeitos a decisões específicas.

### 5.6 Relação com os critérios específicos de cada vaga — decisão OPEN-023

1. INFRAESTRUTURA_EMPRESA registra informações gerais de acessibilidade declaradas pela Empresa e não garante, por si só, que todos os recursos estejam disponíveis ou sejam aplicáveis a toda vaga.
2. Quando um recurso ou condição geral for pertinente a uma oportunidade, sua aplicabilidade deve estar explícita na declaração específica da vaga quando depender das condições daquela oportunidade.
3. A disponibilização dos dados gerais a consumidores autorizados não substitui a declaração do estado das informações relevantes da vaga.
4. Presença declarada, ausência declarada e informação não informada permanecem distintas quando aplicáveis. A ausência de dado não permite inferir existência ou inexistência de recurso ou barreira.
5. Esta capacidade mantém a responsabilidade de registrar e disponibilizar infraestrutura geral; não cria nem preenche automaticamente TRAVA_CRITICA_VAGA e não calcula compatibilidade.
6. Alterações relevantes na infraestrutura continuam rastreáveis conforme RB-27/RB-37 e RNF-14.

## 6. Regras e invariantes

1. A infraestrutura pertence à Empresa à qual está associada. Os dados são estruturados por itens extensíveis, sem impor uma escala universal; quando aplicável, presença declarada, ausência declarada e informação não informada devem permanecer distintas.
2. Somente uma Empresa autenticada e autorizada pode alterar seu próprio mapeamento.
3. Itens obrigatórios definidos na baseline bloqueiam o salvamento quando pendentes (UC-07).
4. O sistema não deve converter informação ausente em afirmação de acessibilidade ou inacessibilidade.
5. Alterações relevantes devem ser rastreáveis (RB-27, RB-37, RF-38, RNF-14), registrando quando ocorreram, o ator responsável, a categoria/informação afetada e o tipo de alteração. Não é exigida cópia integral do mapeamento a cada modificação; a preservação de valores anteriores ou versões completas depende de decisão específica.
6. A persistência deve manter a integridade do vínculo Empresa–infraestrutura (RNF-09).
7. Divergências recorrentes podem resultar em alteração após análise administrativa (RB-08). O registro da divergência não comprova, por si só, declaração incorreta. A decisão, sua justificativa, o responsável e as alterações autorizadas devem ser rastreáveis. Não se aplicam alterações ou sanções automaticamente pela recorrência de relatos.
8. A nota pública de acessibilidade não é calculada nesta capacidade (RB-20).
9. Campos, escalas e itens obrigatórios não podem ser ampliados por suposição.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| EMPRESA | Conta organizacional proprietária dos dados |
| INFRAESTRUTURA_EMPRESA | Informações estruturadas de acessibilidade associadas à Empresa |
| USUARIO/RECRUTADOR | Identidade autorizada que atua em nome da Empresa, conforme regras de acesso |

A baseline citada não especifica todos os atributos, cardinalidades ou detalhes físicos de INFRAESTRUTURA_EMPRESA. Conforme OPEN-018, o mapeamento é organizado por itens estruturados e extensíveis, com tipos de resposta adequados a cada item, sem escala universal; mantém-se o estado atual e o histórico de alterações relevantes, sem cópia integral obrigatória a cada modificação. A tecnologia, o esquema físico, a lista individual de itens obrigatórios, os valores exatos e os casos de preservação de versões completas ou valores anteriores não foram definidos. A relação entre infraestrutura geral e critérios específicos por vaga permanece na OPEN-023.

## 8. Impacto arquitetural

- A aplicação deve verificar autorização antes de ler ou alterar os dados organizacionais.
- A persistência deve manter associação consistente entre Empresa e infraestrutura.
- O questionário precisa separar validação de obrigatoriedade de regras de compatibilidade.
- A capacidade deve expor dados estruturados às capacidades consumidoras sem implementar seus algoritmos.
- Alterações relevantes precisam produzir registros auditáveis.
- Não há decisão de tecnologia, biblioteca de formulários ou mecanismo específico de armazenamento.

## 9. Contratos necessários

Contratos conceituais, sem definir endpoints HTTP:
- **Consultar infraestrutura da própria Empresa:** retorna o mapeamento autorizado.
- **Criar mapeamento:** valida dados e itens obrigatórios antes de persistir.
- **Atualizar mapeamento:** valida alterações e preserva o vínculo organizacional.
- **Validar questionário:** identifica campos obrigatórios pendentes e inconsistências definidas na baseline.
- **Disponibilizar dados de infraestrutura:** fornece dados registrados a consumidores autorizados.
- **Registrar alteração:** cria registro rastreável conforme regras aplicáveis.

## 10. RNFs aplicáveis

- **RNF-09:** integridade do mapeamento e de sua associação à Empresa.
- **RNF-14:** rastreabilidade e auditoria das alterações.
- **RNF-01 a RNF-04:** aplicam-se à interação do questionário conforme a capacidade transversal da SPEC-003.

## 11. Critérios de aceitação

- [ ] Empresa autenticada consulta seu próprio mapeamento.
- [ ] Empresa registra informações estruturadas de acessibilidade.
- [ ] Itens obrigatórios pendentes são identificados e impedem o salvamento.
- [ ] Dados válidos são persistidos associados à Empresa correta.
- [ ] Empresa não altera dados de infraestrutura de outra organização sem autorização prevista.
- [ ] Dados ausentes não são interpretados automaticamente como compatibilidade.
- [ ] Atualizações preservam a integridade do vínculo organizacional.
- [ ] Alterações relevantes são rastreáveis.
- [ ] Dados podem ser disponibilizados a consumidores autorizados.
- [ ] A capacidade não calcula nota pública nem compatibilidade.
- [ ] Uma divergência registrada não provoca alteração automática das informações declaradas.
- [ ] A decisão administrativa e sua justificativa ficam rastreáveis, com identificação do responsável.
- [ ] Alterações decorrentes só são realizadas quando autorizadas pela decisão registrada e pelas regras aplicáveis.
- [ ] A recorrência de relatos, isoladamente, não é tratada como comprovação de declaração incorreta.
- [ ] Informações gerais da Empresa são distintas dos critérios específicos da vaga e não geram aplicabilidade automática.
- [ ] A infraestrutura geral não preenche automaticamente TRAVA_CRITICA_VAGA nem calcula compatibilidade.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-004-01 | Empresa consulta mapeamento próprio existente | Dados apresentados |
| T-004-02 | Empresa registra questionário completo | Dados persistidos |
| T-004-03 | Item obrigatório permanece pendente | Salvamento bloqueado e item indicado |
| T-004-04 | Empresa tenta alterar infraestrutura alheia | Acesso recusado |
| T-004-05 | Atualizar dados existentes | Alterações persistidas e vínculo mantido |
| T-004-06 | Campo opcional não informado | Sistema não inventa valor |
| T-004-07 | Atualização concluída | Registro rastreável |
| T-004-08 | Consumidor autorizado consulta dados | Apenas dados permitidos são disponibilizados |

## 13. Questões em aberto

As questões estão centralizadas em [OPEN.md](OPEN.md).

- **OPEN-017 (decisão aprovada):** estruturar o questionário da Empresa preservando os itens do UC-07 — rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas — nas categorias propostas: acesso físico e circulação; instalações; comunicação e orientação; recursos tecnológicos; políticas e práticas inclusivas. Sugestões adicionais (rotas acessíveis, circulação interna, estacionamento acessível, sinalização tátil/Braille, alternativas de comunicação, compatibilidade com tecnologias assistivas e práticas de acolhimento) dependem de aprovação explícita antes de integrar o escopo. Impedir salvamento se itens definidos como obrigatórios estiverem pendentes, sem tornar todos os campos obrigatórios automaticamente; a lista individual de obrigatórios permanece pendente. Dados associados à Empresa seguem os usos da baseline e devem ser distinguidos de barreiras/critérios específicos da vaga. Tipos de resposta, escalas, validações, persistência, versionamento e conversão em barreiras impeditivas permanecem pendentes, relacionados às OPEN-018/023.
- **OPEN-018 (resolvida):** tipos de resposta adequados a cada item, ausência de escala universal, histórico de alterações relevantes e organização estruturada/extensível do mapeamento. Permanecem pendentes os valores exatos, a lista individual de itens obrigatórios, campos internos/limites e casos de preservação de valores anteriores ou versões completas.
- **OPEN-019 (resolvida):** adotar registro, análise administrativa e decisão fundamentada, com rastreabilidade; relato ou recorrência isoladamente não comprova declaração incorreta nem gera alteração automática. Evidências mínimas, limiar de recorrência, prazos, contestação, catálogo de decisões e sanções possíveis permanecem em aberto.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Campos e obrigatoriedades conferidos com a baseline.
- [ ] Questões em aberto decididas ou mantidas explicitamente.
- [ ] Layout funcio# SPEC-005 — Cadastrar e gerenciar vagas próprias

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-005 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Criar, editar, publicar e gerenciar vagas cadastradas diretamente por uma Empresa |

## 2. Rastreabilidade

- **RF:** RF-18 — Gestão de vagas; RF-25 — Transparência da compatibilidade da vaga; RF-38 — Auditoria de operações.
- **RB:** RB-01 — Elegibilidade para candidatura; RB-13 — Transparência; RB-16 — Dados de acessibilidade não informados; RB-27 — Histórico de alterações; RB-33 — Registro da origem da vaga.
- **RNF:** RNF-07 — Segurança; RNF-09 — Integridade; RNF-14 — Rastreabilidade e auditoria.
- **Caso de uso:** UC-08 — Publicar Vaga.
- **Modelo conceitual:** EMPRESA, VAGA, TRAVA_CRITICA_VAGA e INFRAESTRUTURA_EMPRESA.
- **Drivers:** DA-02, DA-03, DA-04.
- **ADRs:** ADR-002, ADR-004.
- **Dependências:** SPEC-001 e SPEC-004.
- **Questões relacionadas:** OPEN-020 a OPEN-023.

## 3. Escopo

### Incluído
- Permitir que Recrutador autenticado e autorizado acesse o painel de vagas da Empresa vinculada.
- Criar uma vaga própria com os dados previstos em UC-08 e na baseline.
- Validar campos obrigatórios e consistência antes da publicação.
- Permitir salvar como rascunho ou publicar imediatamente, conforme UC-08.
- Tornar uma vaga publicada visível no catálogo para candidatos elegíveis.
- Permitir editar e gerenciar vagas próprias dentro das regras definidas.
- Registrar publicação e alterações relevantes para rastreabilidade.
- Manter informações de acessibilidade e origem conforme os requisitos aplicáveis.

### Fora do escopo
- Importar vagas de fontes externas, tratado na SPEC-006.
- Calcular compatibilidade, tratado na SPEC-007.
- Busca e filtros, tratados na SPEC-008.
- Gerenciar o funil e as candidaturas recebidas, tratados em Specs posteriores.
- Definir novos campos, etapas de status ou regras de encerramento não estabelecidos na baseline.

## 3.1. Telas e evidência de layout

| Tela/área | Finalidade | Layout |
|---|---|---|
| Painel de vagas da Empresa | Consultar e acessar vagas próprias | Pendente |
| Cadastro/edição de vaga | Informar dados da oportunidade | Pendente |
| Revisão de publicação | Conferir consistência antes de publicar | Pendente |
| Rascunho/publicação | Informar resultado da ação e estado da vaga | Pendente |
| Validação de dados | Destacar campos obrigatórios e inconsistências | Pendente |

A divisão é funcional e não fixa o layout final. Protótipos devem considerar a identidade visual e acessibilidade transversal, ser guardados em `docs/layout/` e aprovados separadamente.

## 4. Dependências

- **SPEC-001:** autenticação, perfil Recrutador e vínculo à Empresa.
- **SPEC-004:** dados de infraestrutura da Empresa disponíveis para uso quando aplicável.
- **SPEC-007:** análise de compatibilidade posterior.
- **SPEC-008:** busca de vagas publicadas.
- **SPEC-009:** consulta de status e disponibilidade.
- Campos completos e regras de edição/publicação precisam ser conferidos na baseline (OPEN-020/OPEN-021).

## 5. Comportamento esperado

### 5.1 Acessar painel de vagas
1. Recrutador autentica-se.
2. O sistema verifica se está vinculado à Empresa e autorizado a gerenciar suas vagas.
3. O sistema apresenta as vagas da organização para a qual o Recrutador tem autorização.
4. O sistema não permite gerenciar vagas de outra Empresa.

### 5.2 Criar vaga
1. Recrutador acessa o painel e inicia criação.
2. O sistema apresenta os campos definidos na matriz de campos desta Spec.
3. Recrutador preenche os dados disponíveis.
4. O sistema permite salvar como rascunho mesmo que haja campos obrigatórios pendentes.
5. Para publicação imediata, o sistema verifica o preenchimento dos campos obrigatórios e a consistência dos dados.
6. Se houver pendências ou inconsistências, o sistema indica os campos/problemas e não permite publicar.

### 5.2.1 Matriz de campos da vaga própria — decisão OPEN-020
Os campos abaixo definem o mínimo funcional para cadastro e publicação. As validações decididas na OPEN-021 complementam a matriz sem criar atributos, limites, formatos técnicos, moeda ou catálogos não definidos na baseline.

| Campo/grupo | Obrigatoriedade para publicação | Tratamento |
|---|---|---|
| Cargo/título (titulo) | Obrigatório | Identifica a oportunidade. |
| Descrição (descricao) | Obrigatório | Apresenta o trabalho e suas condições. |
| Requisitos | Obrigatório | Informa os requisitos da oportunidade; a decomposição detalhada permanece para especificação posterior quando necessária. |
| Modalidade (modalidade) | Obrigatório | Informa a modalidade de trabalho. |
| Localização | Obrigatório, com preenchimento compatível com a modalidade | Não pressupõe endereço físico quando não for pertinente; deve ser compatível com a modalidade quando as regras definidas permitirem determinar a inconsistência. |
| Critérios de acessibilidade | Obrigatório declarar o estado das informações relevantes | Não exige que todos os critérios indiquem atendimento; informação ausente não significa compatibilidade. Os critérios específicos por vaga permanecem na OPEN-023. |
| Prazo de inscrição | Obrigatório | Deve ser uma data válida e não anterior à data atual no momento da publicação, conforme UC-08/EX03. |
| Faixa salarial (faixa_salarial) | Opcional | Pode ser omitida. |
| Identificador da vaga (id_vaga) | Não é campo de formulário | Controlado pelo sistema. |
| Empresa responsável (id_empresa) | Não é campo de formulário | Derivada do vínculo e da autorização do Recrutador autenticado. |
| Estado da vaga (status_vaga) | Não é campo livre | Controlado pelo fluxo de rascunho, publicação e gerenciamento. |
| Origem da vaga (origem_ingestao) | Não é campo livre | Registrada pelo sistema conforme a origem; não se impõem aqui valores técnicos. |

A obrigatoriedade da matriz é condição para publicar, não para iniciar ou salvar um rascunho. Os atributos conceituais existentes são preservados; esta decisão não cria atributos, entidades ou cardinalidades. As regras de validação por campo e de consistência estão detalhadas abaixo; restrições de edição e encerramento ficam na OPEN-022.


### 5.2.2 Validações por campo e consistência — decisão OPEN-021

Antes de publicar, o sistema aplica as validações no domínio/aplicação, independentemente da interface utilizada:

| Campo/regra | Validação para publicação |
|---|---|
| Cargo/título (`titulo`) | Deve conter conteúdo efetivo; vazio ou composto apenas por espaços é inválido. |
| Descrição (`descricao`) | Deve conter conteúdo efetivo; vazio ou composto apenas por espaços é inválido. |
| Requisitos | Deve haver informação efetiva de requisitos; ausência ou conteúdo composto apenas por espaços não satisfaz a obrigatoriedade. Não se cria uma decomposição adicional dos requisitos. |
| Modalidade (`modalidade`) | Deve estar preenchida com um valor reconhecido entre os valores definidos pela baseline/sistema. Campo vazio ou valor não reconhecido bloqueia a publicação; esta decisão não cria um novo catálogo. |
| Localização | Deve estar preenchida de forma compatível com a modalidade. Bloquear quando a incompatibilidade puder ser determinada por regras definidas; não exigir endereço físico quando não for pertinente. |
| Critérios de acessibilidade | Deve estar declarado o estado das informações relevantes. Informação ausente não significa ausência de barreiras nem compatibilidade presumida; critérios específicos por vaga permanecem na OPEN-023. |
| Prazo de inscrição | Deve ser uma data válida e não anterior à data atual no momento da publicação. |
| Faixa salarial (`faixa_salarial`) | É opcional. Se informada como intervalo, o limite inferior não pode ser maior que o limite superior. Não se fixam moeda, formato ou limites adicionais. |
| Consistência entre campos | Bloquear conflitos identificáveis pelas regras definidas na baseline e nesta Spec. Não inventar combinações, limites ou catálogos. |

Se a publicação for bloqueada, o sistema preserva os dados informados e identifica os campos e problemas que precisam de correção, com mensagens compreensíveis e acessíveis. Rascunhos incompletos ou inconsistentes podem ser salvos; as validações de publicação são executadas novamente quando o usuário solicitar publicar. A validação crítica não pode existir apenas na interface.

### 5.3 Publicar vaga
1. Recrutador solicita publicação.
2. O sistema valida novamente os dados mínimos e a consistência das regras da vaga.
3. O sistema rejeita publicação com prazo de encerramento inválido ou anterior à data atual, conforme EX03 de UC-08.
4. Se válida, a vaga passa a ficar disponível no catálogo para candidatos elegíveis.
5. O sistema registra a publicação e o responsável para auditoria.

### 5.4 Editar e gerenciar vaga — decisão OPEN-022
1. Recrutador autenticado e autorizado seleciona uma vaga da Empresa vinculada.
2. O sistema verifica o estado atual da vaga e se existem candidaturas associadas.
3. Rascunhos podem ser editados e salvos mesmo incompletos.
4. Vagas publicadas sem candidaturas podem ser editadas; o sistema valida as alterações antes de gravá-las.
5. Depois que houver candidaturas, o sistema bloqueia a alteração dos campos que definem as condições da oportunidade: cargo/título, descrição, requisitos, modalidade, localização, critérios de acessibilidade, prazo de inscrição e faixa salarial.
6. Se uma alteração permitida for inválida, o sistema a recusa sem substituir os dados válidos existentes.
7. Alterações relevantes aceitas são registradas para auditoria, conforme RB-27/RF-38.
8. O sistema não permite edição nem encerramento por usuário sem autorização para gerenciar vagas da Empresa responsável.



### 5.5 Encerrar vaga — decisão OPEN-022
1. Recrutador autenticado e autorizado solicita o encerramento da vaga.
2. O sistema confirma a autorização e registra a mudança para o estado de encerramento previsto na baseline, sem criar um novo estado.
3. O sistema impede novas candidaturas após o encerramento.
4. Candidaturas existentes e o histórico do processo são preservados.
5. O sistema identifica candidatos ativos para comunicação, conforme RB-42 e SPEC-009/SPEC-017.
6. O encerramento não movimenta automaticamente candidatos entre etapas nem elimina candidaturas.
7. A mudança de estado e o responsável ficam registrados para auditoria.


### 5.6 Critérios de acessibilidade específicos da vaga — decisão OPEN-023

1. Cada vaga deve declarar o estado das informações relevantes de acessibilidade para a oportunidade, conforme a matriz de campos e validações já definidas.
2. As informações de INFRAESTRUTURA_EMPRESA podem contextualizar a vaga, mas não substituem a declaração específica quando a aplicabilidade depender das condições da oportunidade.
3. A declaração da vaga deve manter a distinção, quando aplicável, entre presença declarada, ausência declarada e informação não informada.
4. Não se presume que um recurso geral da Empresa esteja disponível ou seja aplicável à vaga sem declaração que sustente essa relação.
5. TRAVA_CRITICA_VAGA representa barreiras ou condições impeditivas pertinentes à oportunidade conforme as regras da SPEC-007. Dados ausentes, isoladamente, não criam uma barreira crítica.
6. Quando faltarem dados necessários à análise de compatibilidade, a SPEC-007 deve indicar insuficiência de dados sem inferir compatibilidade; esta decisão não altera pesos, fórmula ou limiares do cálculo.
7. Alterações relevantes nas informações de acessibilidade da vaga continuam sujeitas à rastreabilidade e às restrições de edição já definidas na OPEN-022.
8. Esta decisão não cria entidades, atributos, escalas universais, campos obrigatórios adicionais ou catálogos novos.

## 6. Regras e invariantes

1. Somente Recrutador autenticado e autorizado pode gerenciar vagas da Empresa vinculada.
2. A vaga própria deve permanecer associada à Empresa responsável.
3. A publicação exige dados mínimos obrigatórios completos e consistentes (UC-08).
4. Prazo de encerramento inválido ou anterior à data atual impede publicação (UC-08).
5. A vaga deve conter informações relevantes de acessibilidade para transparência (RB-13/RF-25).
6. Ausência de informação de acessibilidade não pode ser interpretada automaticamente como compatibilidade (RB-16).
7. Vagas externas devem ser tratadas pela SPEC-006; esta Spec trata cadastro próprio.
8. A elegibilidade para candidatura depende das regras aplicáveis de disponibilidade e compatibilidade (RB-01, RB-34), não apenas da publicação.
9. Publicação e alterações relevantes devem ser rastreáveis (RB-27, RF-38).
10. Campos, transições de status e permissões de edição não são ampliados por suposição.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| EMPRESA | Organização responsável pela vaga |
| VAGA | Dados da oportunidade e estado de publicação |
| TRAVA_CRITICA_VAGA | Representa barreiras relevantes para a análise de compatibilidade |
| INFRAESTRUTURA_EMPRESA | Fonte de informações organizacionais de acessibilidade quando aplicável |

A baseline não detalha aqui todos os atributos, tipos, cardinalidades ou restrições de edição. Esses pontos precisam ser conferidos nos requisitos e no modelo antes de implementação.

## 8. Impacto arquitetural

- A autorização por organização precisa ser verificada no backend.
- A validação de publicação deve ocorrer no domínio/aplicação, não apenas na interface.
- A vaga deve manter uma estrutura compatível com vagas externas normalizadas (DA-06), sem confundir os fluxos de criação.
- Regras de barreira crítica e score pertencem à SPEC-007.
- O registro de alterações precisa ser consistente e auditável.
- Não é definida tecnologia específica de formulário, banco ou API.

## 9. Contratos necessários

- **Listar vagas da Empresa autorizada:** retorna vagas que o usuário pode gerenciar.
- **Criar vaga própria:** valida e registra os dados da oportunidade.
- **Atualizar vaga própria:** verifica autorização e valida campos alterados.
- **Validar publicação:** verifica obrigatoriedade, consistência e prazo conforme baseline.
- **Publicar vaga:** torna a vaga elegível para aparecer no catálogo conforme regras de visibilidade.
- **Salvar rascunho:** persiste uma vaga ainda não publicada, conforme UC-08.
- **Registrar alteração de vaga:** mantém rastreabilidade de publicação e mudanças relevantes.

Contratos conceituais; não especificam endpoints HTTP.

## 10. RNFs aplicáveis

- **RNF-07:** proteção de operações de escrita.
- **RNF-09:** integridade entre vaga e Empresa, e consistência dos dados.
- **RNF-14:** rastreabilidade das publicações e alterações.
- **RNF-01 a RNF-04:** acessibilidade dos formulários e mensagens conforme SPEC-003.

## 11. Critérios de aceitação

- [ ] Recrutador autorizado acessa painel da Empresa vinculada.
- [ ] Usuário não autorizado não gerencia vagas de outra Empresa.
- [ ] Vaga apresenta cargo/título, descrição, requisitos, modalidade, localização, critérios de acessibilidade e prazo de inscrição.
- [ ] Faixa salarial é opcional.
- [ ] Identificador, empresa responsável, estado e origem não são campos de preenchimento livre do recrutador.
- [ ] Rascunho pode ser salvo com campos obrigatórios pendentes.
- [ ] Publicação exige o preenchimento dos campos obrigatórios da matriz; campos obrigatórios de texto vazios ou compostos apenas por espaços bloqueiam a ação.
- [ ] Modalidade vazia ou não reconhecida bloqueia publicação.
- [ ] Localização incompatível com a modalidade bloqueia publicação quando a inconsistência puder ser determinada por regras definidas.
- [ ] Informação de acessibilidade ausente não é interpretada como compatibilidade.
- [ ] Prazo de inscrição inválido ou anterior à data atual bloqueia publicação.
- [ ] Ausência de faixa salarial não bloqueia publicação.
- [ ] Intervalo salarial informado com limite inferior maior que o superior bloqueia publicação.
- [ ] Dados inconsistentes impedem publicação e são apontados por campo/problema, preservando os dados informados.
- [ ] Rascunhos incompletos ou inconsistentes podem ser salvos.
- [ ] Validações são aplicadas no domínio/aplicação independentemente da interface.
- [ ] Vaga válida pode ser salva como rascunho.
- [ ] Vaga válida pode ser publicada.
- [ ] Prazo de encerramento inválido impede publicação.
- [ ] Vaga publicada fica disponível para candidatos elegíveis no catálogo.
- [ ] Informações de acessibilidade são mantidas sem presumir valores ausentes.
- [ ] Publicação e alterações relevantes são rastreáveis.
- [ ] Rascunhos podem ser editados e salvos incompletos.
- [ ] Vagas publicadas sem candidaturas podem ser editadas se as validações forem satisfeitas.
- [ ] Após existir candidatura, alterações dos campos que definem as condições da oportunidade são bloqueadas.
- [ ] Alteração inválida não substitui os dados válidos existentes.
- [ ] Usuários sem autorização não conseguem editar nem encerrar vagas.
- [ ] Encerrar a vaga bloqueia novas candidaturas e preserva candidaturas e histórico.
- [ ] Encerramento identifica candidatos ativos para comunicação e não os movimenta automaticamente no funil.
- [ ] Compatibilidade e gestão do funil não são implementadas nesta capacidade.
- [ ] A declaração de acessibilidade específica da vaga permanece distinta das informações gerais da Empresa.
- [ ] A infraestrutura geral não preenche automaticamente TRAVA_CRITICA_VAGA nem presume aplicabilidade por vaga.
- [ ] Informação ausente não cria, isoladamente, barreira crítica nem permite presumir compatibilidade.
- [ ] Quando faltarem dados necessários, a análise indica insuficiência sem inferir compatibilidade.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-005-01 | Recrutador autorizado abre painel | Vagas autorizadas listadas |
| T-005-02 | Recrutador tenta acessar vaga de outra Empresa | Acesso recusado |
| T-005-03 | Criar vaga com dados completos | Vaga criada |
| T-005-04 | Publicar vaga com campos obrigatórios ausentes | Publicação bloqueada e campos indicados |
| T-005-05 | Publicar vaga inconsistente | Publicação bloqueada |
| T-005-06 | Publicar com prazo anterior à data atual | Publicação recusada |
| T-005-11 | Publicar com campo obrigatório de texto vazio ou só com espaços | Publicação bloqueada e campos identificados |
| T-005-12 | Publicar com modalidade vazia ou não reconhecida | Publicação bloqueada |
| T-005-13 | Publicar com localização incompatível conforme regra definida | Publicação bloqueada e inconsistência indicada |
| T-005-14 | Critérios de acessibilidade sem estado declarado | Publicação bloqueada; compatibilidade não presumida |
| T-005-15 | Publicar sem faixa salarial | Publicação permitida se os demais dados forem válidos |
| T-005-16 | Informar intervalo salarial invertido | Publicação bloqueada |
| T-005-17 | Salvar rascunho incompleto ou inconsistente | Rascunho salvo sem publicação |
| T-005-18 | Tentar contornar validação por outra interface | As mesmas regras são aplicadas no domínio/aplicação |
| T-005-07 | Salvar vaga válida como rascunho | Rascunho persistido sem ficar publicado |
| T-005-08 | Publicar vaga válida | Vaga visível para candidatos elegíveis |
| T-005-09 | Alterar vaga própria | Dados atualizados e evento rastreável |
| T-005-10 | Consultar vaga com acessibilidade não informada | Ausência permanece explicitamente não informada |
| T-005-19 | Editar rascunho incompleto | Alteração salva mesmo incompleta |
| T-005-20 | Editar vaga publicada sem candidaturas com dados válidos | Alteração salva e registrada |
| T-005-21 | Tentar alterar campo que define as condições após existir candidatura | Alteração bloqueada; dados originais preservados |
| T-005-22 | Tentar salvar alteração inválida em vaga publicada | Alteração recusada sem substituir dados válidos |
| T-005-23 | Usuário não autorizado tenta editar ou encerrar vaga | Operação recusada |
| T-005-24 | Encerrar vaga com candidaturas existentes | Novas candidaturas bloqueadas; candidaturas e histórico preservados; candidatos ativos identificados para comunicação |
| T-005-25 | Encerrar vaga com candidatos ativos no funil | Nenhuma movimentação automática de etapa ocorre |

## 13. Questões em aberto

As questões estão centralizadas em [OPEN.md](OPEN.md).

- **OPEN-020:** lista completa de campos e obrigatoriedade de vaga própria.
- **OPEN-021:** resolvida; validações por campo e consistência pré-publicação definidas nesta Spec.
- **OPEN-022:** resolvida; limites de edição por estado e encerramento definidos nesta Spec.
- **OPEN-023 (resolvida):** separação entre infraestrutura geral da Empresa, declaração específica por vaga e uso de TRAVA_CRITICA_VAGA; dados ausentes não presumem compatibilidade.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Campos e regras conferidos com RF-18, RF-25, UC-08, RB e modelo.
- [ ] Questões em aberto decididas ou mantidas explicitamente.
- [ ] Layouts anexados em `docs/layout/` e aprovados separadamente.
- [ ] Critérios e testes revisados.
- [ ] Autorização organizacional, validação e auditoria verificáveis.
- [ ] Nenhuma implementação iniciada antes das aprovações exigidas.

---

dos em `docs/layout/` e aprovados separadamente.
- [ ] Critérios e testes revisados.
- [ ] Autorização organizacional, validação e auditoria verificáveis.
- [ ] Nenhuma implementação iniciada antes das aprovações exigidas.

---

# SPEC-006 — Importar, ingerir e normalizar vagas externas

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-006 |
| Estado do texto | especificada |
| Estado do layout | não se aplica ao núcleo de ingestão; eventual interface administrativa permanece pendente |
| Capacidade | Receber dados externos estruturados, validar, normalizar, deduplicar e registrar o resultado da ingestão |

## 2. Rastreabilidade

- **RF:** RF-05 — Importação de vagas externas; RF-36 — Importação de dados estruturados; RF-37 — Normalização de dados externos; RF-38 — Auditoria de operações; RF-39 — Tratamento de erros e inconsistências; RF-40 — Controle de acesso às operações administrativas.
- **RB:** RB-10 — Vagas externas; RB-11 — Validação da IA; RB-17 — Validação de vaga externa; RB-18 — Resultado da LLM não é fonte de verdade; RB-31 — Deduplicação de dados externos; RB-32 — Integridade da importação; RB-33 — Registro da origem da vaga; RB-37 — Registro das decisões; RB-41 — Auditoria das alterações.
- **RNF:** RNF-05 — Desempenho; RNF-07 — Segurança; RNF-09 — Integridade; RNF-14 — Rastreabilidade e auditoria; RNF-16 — Compatibilidade/normalização de dados externos, conforme mapa.
- **Caso de uso:** UC-14 — Coletar e Ingerir Vagas Externas.
- **Modelo conceitual:** VAGA.
- **Drivers:** DA-02, DA-05, DA-06, DA-07, DA-08.
- **ADRs:** ADR-002, ADR-003, ADR-004.
- **Dependências:** SPEC-005 para o modelo comum de VAGA; SPEC-007/SPEC-008 para consumo das vagas normalizadas; ADR-003 para integração com LLM por adaptador. A execução automatizada deve usar configuração/credenciais de integração protegidas; eventual interface administrativa continua sujeita à autorização aplicável.
- **Questões relacionadas:** OPEN-025 a OPEN-030 e OPEN-086 a OPEN-087. OPEN-024 foi resolvida e registrada em OPEN.md; a viabilidade da fonte e a capacidade operacional permanecem condicionadas às OPEN-086 e OPEN-087.

## 3. Escopo

### Incluído
- Executar coleta automatizada diária de vagas a partir de uma fonte externa autorizada, começando pelo Adzuna após confirmação de acesso, cobertura e condições de uso.
- Consultar individualmente uma lista configurável de frases de busca por meio de `what_phrase`, consolidando os resultados.
- Receber e validar a resposta estruturada da API, incluindo sua estrutura JSON.
- Identificar registros inválidos, incompletos ou duplicados.
- Normalizar registros válidos para o modelo de vaga utilizado pela plataforma.
- Validar informações extraídas por LLM antes de permitir seu uso.
- Registrar origem e resultado da importação.
- Persistir registros válidos sem comprometer registros válidos já existentes.
- Tratar falhas e inconsistências com rastreabilidade.
- Deduplicar somente registros de origem externa, conforme decisão consolidada em OPEN.md.

### Fora do escopo
- Cadastro de vagas próprias, tratado na SPEC-005.
- Busca, filtros ou exibição detalhada de vagas, tratados em Specs posteriores.
- Cálculo de compatibilidade.
- Tornar a LLM fonte de verdade.
- Escolher fornecedor específico de LLM, biblioteca JSON, fila ou mecanismo de execução.
- Importar dados sem origem autorizada.
- Deduplicar vagas próprias como se fossem registros externos, contrariando a decisão consolidada.

## 3.1. Telas e evidência de layout

| Área | Finalidade | Layout |
|---|---|---|
| Configuração da coleta | Gerenciar fonte/frases de busca, caso essa interface seja adotada | Pendente, se houver interface |
| Resumo da execução | Exibir resultado agregado da ingestão | Pendente, se houver interface |
| Detalhe de falhas/validação | Consultar registros rejeitados ou inconsistentes | Pendente, se houver interface |

A execução principal é automatizada e diária; não exige que um administrador inicie cada coleta. Uma eventual interface de configuração ou acompanhamento não é presumida como obrigatória e, se adotada, terá layout especificado e aprovado separadamente. A configuração de fonte e frases deve ser protegida.

## 4. Dependências

- **Configuração protegida:** credenciais da API e alterações nas fontes/frases devem ser protegidas; isso não transforma a execução diária em uma ação manual do Administrador.
- **SPEC-005:** compartilha o modelo conceitual de VAGA, mas mantém o fluxo de cadastro próprio separado.
- **SPEC-007/SPEC-008:** dependem de vagas externas validadas e normalizadas.
- **ADR-003:** integração LLM no backend por adaptador, com validação antes do domínio.
- O uso do Adzuna depende de confirmação de acesso, cobertura, autorização e viabilidade operacional (OPEN-086 e OPEN-087); as frases iniciais ainda precisam ser definidas. Campos obrigatórios e validações de registros são tratados em OPEN-025.

## 5. Comportamento esperado

### 5.1 Executar coleta automatizada
1. Uma tarefa agendada inicia a coleta diária, sem exigir ação manual de Administrador para cada execução.
2. O sistema lê a lista configurável de frases e realiza consultas individuais à API da fonte autorizada, inicialmente o Adzuna, usando `what_phrase`.
3. O sistema respeita os limites e as condições de uso da fonte, consolida as respostas e registra a origem, a frase consultada e o resultado de cada consulta.
4. Falhas de uma consulta devem ser registradas; a política detalhada de repetição e recuperação permanece em OPEN-029.

### 5.2 Validar estrutura e registros
1. O sistema verifica se cada resposta recebida é JSON válido e compatível com o formato esperado da API.
2. Se a estrutura não puder ser processada, a execução registra a falha e não altera registros válidos existentes.
3. Para cada registro, o sistema valida os dados mínimos de vaga externa definidos nesta Spec, além dos demais requisitos da baseline aplicáveis ao modelo comum de VAGA.
4. Os dados mínimos são: título significativo, descrição útil, empresa contratante identificável, localidade utilizável e origem rastreável, incluindo referência ao anúncio original quando disponibilizada pela fonte.
5. A validação considera conteúdo efetivo e consistência, não apenas a presença do campo. Valores vazios, compostos apenas por espaços, genéricos sem utilidade ou incompatíveis com o significado esperado não satisfazem a obrigatoriedade.
6. Registros inválidos ou incompletos são identificados e não seguem para o domínio como vagas válidas.
7. O resultado da validação é mantido para compor o resultado da execução.

**Matriz de dados mínimos para vaga externa**

| Campo/informação | Obrigatoriedade | Regra de validação |
|---|---|---|
| Título | Obrigatório | Deve conter conteúdo significativo que identifique a oportunidade. |
| Descrição | Obrigatório | Deve conter conteúdo útil sobre a oportunidade, não apenas texto vazio, fragmentos irrelevantes ou mensagem genérica sem detalhes. |
| Empresa contratante | Obrigatório | A empresa que oferece a oportunidade deve ser identificável a partir de informação da fonte ou de extração validada; o portal de origem não substitui a identificação da contratante. |
| Localidade | Obrigatório | Deve existir informação de localização utilizável e suficientemente identificável para apresentação da vaga. |
| Origem e referência rastreável | Obrigatório | Registrar a fonte externa e preservar uma referência rastreável ao anúncio original, como link ou identificador, conforme disponível nos dados da fonte. |

A faixa salarial e outros dados complementares não se tornam obrigatórios por esta decisão, salvo quando exigidos por outra regra aplicável da baseline. A ausência de informação de acessibilidade continua representada como “não informado”; não é requisito declarar positivamente a existência de recursos de acessibilidade para que o registro passe por esta matriz.

### 5.3 Extrair e validar dados com LLM
1. Para vagas com dados incompletos ou que precisem de extração/normalização, o sistema tenta complementar os dados a partir do conteúdo do anúncio usando LLM no backend, por adaptador.
2. A resposta da LLM é tratada como não confiável e não substitui os dados originais da fonte.
3. O sistema valida os campos extraídos e sua conformidade com o modelo suportado antes de decidir se a vaga pode ser exibida, incluindo título, descrição útil, empresa contratante e localidade quando forem necessários para completar os dados mínimos.
4. A LLM não pode inventar empresa ou localidade ausente do anúncio nem tratar uma suposição como fato confirmado. Dados extraídos só satisfazem a obrigatoriedade após validação.
5. O sistema distingue dados fornecidos pela fonte, dados extraídos pela LLM e informações não informadas. Não presume acessibilidade nem transforma ausência de menção em declaração positiva ou negativa.
6. Se a LLM estiver indisponível, apresentar falha recuperável ou retornar dados inválidos, o sistema poderá realizar tentativas adicionais limitadas, conforme a política operacional definida. Cada resposta deverá passar por validação antes de ser utilizada. Esgotadas as tentativas, dados inválidos não serão persistidos como fatos. Se os dados originais atenderem a todos os requisitos aplicáveis, o processamento poderá continuar sem a LLM; caso contrário, se algum dado mínimo obrigatório continuar ausente ou inválido, o registro não será disponibilizado como vaga válida. A falha deverá ser registrada, e uma execução futura poderá reavaliar o anúncio. Os detalhes operacionais de repetição e recuperação devem respeitar a OPEN-029.

### 5.4 Normalizar e deduplicar
1. O sistema converte os dados válidos para a estrutura comum de VAGA e mantém a identificação da fonte externa.
2. A deduplicação aplica-se somente a registros externos; esta regra não classifica vagas próprias como duplicadas automaticamente.
3. Aplicar os critérios de equivalência em camadas e nesta ordem:
   - **Identificador externo:** considerar duplicados registros com o mesmo identificador externo dentro da mesma fonte.
   - **URL original normalizada:** se a primeira regra não estabelecer equivalência, considerar duplicados registros cuja URL original seja equivalente após normalização.
   - **Atributos normalizados:** quando os identificadores não forem suficientes, comparar conservadoramente atributos confiáveis, especialmente empresa contratante, título e localidade. Outros atributos só podem ser considerados quando forem confiáveis e úteis para distinguir ou confirmar a oportunidade.
4. A comparação por atributos só classifica automaticamente dois registros como duplicados quando houver evidências suficientes de que representam a mesma oportunidade; semelhança superficial de título ou descrição, isoladamente, não basta.
5. Quando a evidência for insuficiente ou houver dúvida, manter os registros separados, em vez de fundir oportunidades possivelmente distintas.
6. Ao identificar duplicidade, não criar uma representação equivalente adicional; registrar o resultado individual como duplicado e o motivo relevante disponível, associado à execução de ingestão conforme a OPEN-027.
7. A deduplicação não deve excluir, fundir ou sobrescrever indevidamente uma vaga válida existente. Semelhança incerta não autoriza alteração destrutiva.

### 5.5 Persistir e registrar resultado
1. Cada execução de ingestão recebe uma identificação que permite distingui-la de outras execuções.
2. O resultado agregado da execução registra a origem, as consultas realizadas — incluindo as frases de busca quando aplicável —, o resultado geral, os quantitativos e as falhas relevantes.
3. Cada registro recebido fica associado à execução correspondente e possui resultado individual que distingue, no mínimo, processado, rejeitado, duplicado e falha de processamento.
4. Rejeições e falhas individuais registram os motivos relevantes disponíveis para investigação; os resultados de consultas também permanecem rastreáveis.
5. Os quantitativos consolidados devem ser coerentes com os resultados individuais. A rastreabilidade permite investigar o resultado de um registro sem exigir o registro detalhado de cada etapa interna.
6. O sistema persiste os registros validados e normalizados. Falhas parciais não comprometem registros válidos existentes nem devem produzir duplicação indevida.
7. Os registros válidos tornam-se disponíveis às capacidades consumidoras após o processamento bem-sucedido.
8. O processamento é independente por registro: falha individual não impede o tratamento dos demais registros independentes quando for seguro continuar. Falha geral que comprometa a capacidade de processar com segurança pode interromper a execução.
9. A persistência de cada registro deve ser consistente: uma falha não pode deixar alterações parciais ou estado inválido. Uma operação malsucedida não pode ser registrada como processada com sucesso.
10. Somente falhas recuperáveis provocam tentativas adicionais, sempre limitadas. Erros permanentes, dados inválidos e violações de regra não são repetidos indefinidamente. Cada resposta ou resultado de nova tentativa passa pelas validações aplicáveis. Limites e intervalos operacionais serão definidos no detalhamento, alinhados à OPEN-026.
11. Uma execução interrompida ou parcialmente malsucedida pode ser reexecutada. A reexecução verifica o estado existente e reaplica a deduplicação externa conforme a seção 5.4, sem criar representações equivalentes adicionais. A mera existência de uma vaga não comprova, por si só, que uma operação anterior foi concluída com sucesso.
12. Quando não for possível recuperar um registro, o sistema registra o resultado de falha e os motivos relevantes disponíveis para investigação.
13. O resultado agregado distingue execução integralmente bem-sucedida, parcialmente bem-sucedida e malsucedida, de acordo com os resultados individuais reais. Uma nova execução não apaga a rastreabilidade das anteriores.
14. A recuperação não autoriza excluir, fundir ou sobrescrever vagas válidas sem fundamento suficiente nas regras aprovadas.

## 6. Regras e invariantes

1. Vagas externas devem ser identificadas e estruturadas antes do uso (RB-10).
2. Dados extraídos por LLM precisam ser validados (RB-11).
3. Vaga externa só participa da análise após estruturação e validação (RB-17).
4. Resultado de LLM não é fonte de verdade (RB-18).
5. Registros externos duplicados não devem gerar registros equivalentes múltiplos (RB-31).
6. Falhas de importação não podem comprometer registros válidos existentes (RB-32).
7. Vagas externas mantêm identificação da origem (RB-33).
8. Operação administrativa exige autenticação e autorização (RF-40, RB-12, ADR-002).
9. Operações relevantes devem ser rastreáveis (RF-38, RB-37, RB-41, RNF-14).
10. A LLM permanece atrás de adaptador no backend e pode ser substituída (ADR-003).
11. A deduplicação desta Spec se aplica somente a dados externos e usa os critérios conservadores em camadas definidos na seção 5.4; em caso de dúvida, mantém registros separados e não altera vagas válidas existentes por mera semelhança.
12. O sistema não deve afirmar que uma vaga é válida se seus dados obrigatórios não passaram pelas validações estabelecidas: título significativo, descrição útil, empresa contratante identificável, localidade utilizável e origem rastreável, além dos demais requisitos aplicáveis da baseline.
13. Cada registro é processado de forma independente e sua persistência deve ser consistente; falhas individuais não comprometem registros válidos existentes nem impedem outros registros independentes quando for seguro continuar.
14. Repetições são limitadas e reservadas a falhas recuperáveis; erros permanentes, dados inválidos e violações de regra não são repetidos indefinidamente. Limites e intervalos são detalhamento operacional.
15. Reexecuções verificam o estado existente e aplicam a deduplicação aprovada, sem criar representações equivalentes adicionais nem presumir sucesso apenas pela existência de uma vaga.
16. Resultados individuais e agregados refletem o ocorrido; execuções anteriores e sua rastreabilidade são preservadas. A recuperação não autoriza alteração destrutiva de vaga válida sem fundamento suficiente.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| VAGA | Modelo comum de vaga após validação e normalização |
| Origem externa | Identifica a fonte da qual o registro foi obtido; representação exata precisa ser confirmada |
| Execução de ingestão | Referência conceitual para agrupar consultas, resultado agregado e resultados individuais dos registros recebidos, sem impor uma entidade física ou tabela específica |

A rastreabilidade deve relacionar cada registro recebido à execução correspondente e permitir consultar os resultados agregado e individual. A OPEN-027 define esse requisito lógico, mas não determina entidade, tabela, chave, campos físicos ou tecnologia de persistência. A estrutura definitiva será detalhada no modelo de dados; permanecem válidas as decisões de equivalência da OPEN-028 e de transação/recuperação da OPEN-029.

## 8. Impacto arquitetural

- A ingestão e a integração LLM ficam no backend.
- A integração LLM usa porta/adaptador independente do fornecedor (ADR-003).
- Validação e normalização separam conteúdo externo do modelo de domínio.
- O fluxo deve proteger dados válidos existentes diante de erros.
- Operações potencialmente demoradas devem ser separadas do caminho interativo principal conforme DA-08; fila ou execução assíncrona não é presumida.
- O mecanismo de transação, repetição e recuperação deve ser escolhido após esclarecer os cenários de falha.
- Autorização administrativa é validada no backend.
- O resultado precisa permitir auditoria e diagnóstico.

## 9. Contratos necessários

Contratos conceituais, sem definir endpoints HTTP:
- **Executar coleta diária:** consulta a fonte autorizada usando a lista configurável de frases e registra a execução.
- **Validar estrutura JSON:** verifica sintaxe e formato suportado.
- **Validar registro de vaga:** verifica os campos e restrições obrigatórios.
- **Extrair dados via adaptador LLM:** quando habilitado, retorna dados candidatos à validação, nunca diretamente confiáveis.
- **Normalizar vaga externa:** transforma dados válidos para o modelo comum.
- **Identificar duplicidade externa:** compara registros externos conforme critério aprovado.
- **Persistir registros válidos:** grava cada registro de forma consistente, sem deixar estado parcial/inválido e sem comprometer dados válidos existentes.
- **Repetir falha recuperável:** realiza tentativas adicionais limitadas apenas para falhas recuperáveis, validando cada novo resultado.
- **Reexecutar ingestão:** verifica o estado existente e aplica a deduplicação aprovada para evitar representações equivalentes adicionais.
- **Consolidar resultado da execução:** distingue sucesso integral, sucesso parcial e execução malsucedida conforme os resultados individuais reais, preservando o histórico de execuções anteriores.
- **Registrar resultado agregado da ingestão:** registra a identificação da execução, origem, consultas realizadas, resultado geral, quantitativos e falhas relevantes.
- **Registrar resultado individual do registro:** associa cada registro recebido à execução correspondente e registra seu resultado (processado, rejeitado, duplicado ou falha de processamento), com motivos relevantes de rejeição/falha.
- **Consultar rastreabilidade da ingestão:** permite investigar o resultado agregado da execução e o resultado de cada registro sem exigir o histórico detalhado de todas as etapas internas.

## 10. RNFs aplicáveis

- **RNF-05:** desempenho da operação e tratamento de trabalho potencialmente demorado.
- **RNF-07:** proteger o acesso e a integração externa.
- **RNF-09:** manter integridade dos registros e da persistência.
- **RNF-14:** manter rastreabilidade da execução e das alterações.
- **RNF-16 — Interoperabilidade:** o sistema deve permitir a integração com fontes externas e a normalização das informações recebidas para o modelo utilizado pela plataforma. A verificação nesta Spec ocorre pelos contratos/formato da fonte autorizada, mapeamento documentado, conversões aplicáveis, compatibilidade dos registros normalizados e tratamento rastreável de dados incompatíveis.

## 11. Critérios de aceitação

- [ ] A coleta diária ocorre automaticamente, sem exigir início manual por Administrador; configuração e credenciais, quando existentes, são protegidas.
- [ ] Respostas válidas da API são processadas conforme o formato suportado.
- [ ] Estrutura inválida é rejeitada e registrada sem comprometer dados válidos existentes.
- [ ] Registros inválidos/incompletos não são disponibilizados como vagas válidas.
- [ ] Cada vaga externa disponibilizada possui título significativo, descrição útil, empresa contratante identificável, localidade utilizável e origem rastreável, além dos demais dados obrigatórios aplicáveis da baseline.
- [ ] Campos presentes, mas vazios, genéricos sem utilidade ou inconsistentes, não satisfazem a obrigatoriedade.
- [ ] Dados extraídos por LLM passam por validação antes de uso; a LLM não inventa empresa ou localidade nem converte suposições em fatos.
- [ ] Falha recuperável ou resposta inválida da LLM provoca somente tentativas adicionais limitadas, e cada resposta é validada antes do uso.
- [ ] Quando os dados originais já atendem aos requisitos aplicáveis, a vaga pode ser processada sem depender da LLM.
- [ ] Esgotadas as tentativas, dados inválidos não são persistidos como fatos; se faltarem dados mínimos obrigatórios, a vaga não é disponibilizada como válida e a falha é registrada.
- [ ] Falhas da LLM não comprometem registros válidos existentes, e uma execução futura pode reavaliar o anúncio.
- [ ] Vagas externas válidas são normalizadas para o modelo comum.
- [ ] Origem externa é preservada.
- [ ] Registros com o mesmo identificador externo na mesma fonte são reconhecidos como duplicados.
- [ ] URLs originais equivalentes após normalização são reconhecidas como duplicadas quando o identificador não estabelece a equivalência.
- [ ] Na ausência de identificadores suficientes, atributos normalizados confiáveis permitem classificar duplicidade somente quando há evidências suficientes; semelhança superficial não basta.
- [ ] Registros com equivalência incerta permanecem separados.
- [ ] Registros externos duplicados não geram representações equivalentes múltiplas, e o resultado individual registra duplicidade e motivo relevante disponível.
- [ ] A deduplicação não é aplicada automaticamente a vagas próprias nem exclui, funde ou sobrescreve vagas válidas por semelhança incerta.
- [ ] Falhas não comprometem registros válidos existentes.
- [ ] Cada execução de ingestão possui identificação própria e resultado agregado rastreável.
- [ ] O resultado agregado registra origem, consultas realizadas, quantitativos e falhas relevantes.
- [ ] Cada registro recebido está associado à execução correspondente e possui resultado individual distinguível entre processado, rejeitado, duplicado e falha de processamento.
- [ ] Motivos relevantes de rejeição/falha e resultados das consultas podem ser investigados.
- [ ] Os quantitativos consolidados são coerentes com os resultados individuais.
- [ ] A rastreabilidade não exige o registro detalhado de cada etapa interna.
- [ ] Falhas parciais não comprometem registros válidos existentes.
- [ ] A operação não depende de um fornecedor LLM específico.
- [ ] A integração valida as respostas conforme o contrato e o formato suportado da fonte autorizada.
- [ ] Os campos de origem utilizados possuem regras de mapeamento documentadas para o modelo comum de VAGA, incluindo conversões aplicáveis.
- [ ] Os registros aceitos após normalização são compatíveis com o modelo comum, respeitando tipos, formatos e dados mínimos exigidos.
- [ ] Estruturas ou valores que não possam ser interpretados com segurança são rejeitados ou tratados como falha, com motivo rastreável, sem conversão silenciosa em fatos incorretos.
- [ ] A normalização preserva o significado dos dados de origem e não inventa informações; campos opcionais não utilizados podem ser descartados conforme o mapeamento documentado.
- [ ] Cada fonte externa autorizada possui testes para os campos utilizados, conversões aplicáveis e tratamento de dados ausentes ou inválidos.
- [ ] A deduplicação não é aplicada a vagas próprias por esta Spec.
- [ ] Falha em um registro não impede o processamento de outros registros independentes quando for seguro continuar.
- [ ] Falha durante a persistência de um registro não deixa alterações parciais ou estado inválido.
- [ ] Somente falhas recuperáveis provocam tentativas adicionais, e o limite operacional é respeitado.
- [ ] Erros permanentes, dados inválidos e violações de regra não são repetidos indefinidamente.
- [ ] Reexecução de execução interrompida ou parcialmente malsucedida verifica o estado existente e não cria representações equivalentes adicionais.
- [ ] Falha em um registro não exclui, funde ou sobrescreve indevidamente uma vaga válida existente.
- [ ] Falhas não recuperáveis ficam registradas com os motivos relevantes disponíveis.
- [ ] O resultado agregado distingue sucesso integral, sucesso parcial e execução malsucedida, com quantitativos coerentes com os resultados individuais.
- [ ] Uma nova execução preserva a rastreabilidade das execuções anteriores.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-006-01 | Chega o horário diário de coleta | A tarefa automatizada inicia e registra a execução |
| T-006-02 | Configuração/credenciais são acessadas por usuário não autorizado | Acesso recusado |
| T-006-03 | JSON sintaticamente inválido | Falha registrada; dados existentes preservados |
| T-006-04 | Registro sem título significativo | Registro não é disponibilizado como vaga válida |
| T-006-05 | Registro sem descrição útil | Registro não é disponibilizado como vaga válida |
| T-006-06 | Empresa contratante não identificável | Registro não é disponibilizado como vaga válida |
| T-006-07 | Localidade ausente ou inutilizável | Registro não é disponibilizado como vaga válida |
| T-006-08 | Origem ou referência rastreável ausente | Registro não é disponibilizado como vaga válida |
| T-006-09 | LLM retorna campos inválidos ou não comprovados | Dados não entram no domínio como vaga válida |
| T-006-10 | LLM indisponível e falta dado mínimo obrigatório após tentativas limitadas | Registro não é disponibilizado como vaga válida e falha é registrada |
| T-006-11 | LLM indisponível, mas dados originais são suficientes | Processamento prossegue sem depender da LLM |
| T-006-19 | Falha recuperável da LLM é superada em nova tentativa | Resposta é validada antes de uso e fluxo prossegue se os dados forem suficientes |
| T-006-20 | Tentativas limitadas se esgotam com resposta inválida | Dados inválidos não são aceitos como fatos; falha é registrada |
| T-006-12 | Registro externo válido | Normalizado e persistido |
| T-006-13 | Registro externo duplicado | Não cria registro equivalente adicional |
| T-006-14 | Lote contém válidos e inválidos | Válidos são preservados/processados sem contaminação pelos inválidos |
| T-006-15 | Reexecutar ingestão do mesmo registro externo | Deduplicação conforme critério aprovado |
| T-006-16 | Finalizar execução com falhas | Origem, resultado e falhas ficam rastreáveis |
| T-006-17 | Verificar registro de vaga própria | Deduplicação externa não o trata como duplicado automaticamente |
| T-006-21 | Executar ingestão em mais de uma ocasião | Cada execução possui identificação própria e resultado agregado consultável |
| T-006-22 | Processar vários registros na mesma execução | Cada registro fica associado à execução correta e possui resultado individual |
| T-006-23 | Rejeitar registro ou falhar seu processamento | Resultado individual distingue rejeição de falha e registra o motivo relevante disponível |
| T-006-24 | Consolidar resultados individuais da execução | Quantitativos agregados são coerentes com os resultados individuais |
| T-006-25 | Investigar um registro após a execução | Origem, execução e resultado individual podem ser rastreados sem histórico detalhado de cada etapa interna |
| T-006-26 | Dois registros da mesma fonte possuem o mesmo identificador externo | São reconhecidos como duplicados e não criam representações equivalentes múltiplas |
| T-006-27 | Registros possuem URLs originais equivalentes após normalização, sem correspondência decisiva por identificador | São reconhecidos como duplicados |
| T-006-28 | Identificadores não bastam, mas empresa, título e localidade normalizados sustentam equivalência | Registros são classificados como duplicados somente se houver evidência suficiente; decisão e motivo relevante ficam rastreáveis |
| T-006-29 | Títulos ou descrições são semelhantes, mas os demais dados não comprovam equivalência | Registros permanecem separados |
| T-006-30 | Há dúvida ou dados insuficientes para determinar equivalência | Registros permanecem separados e nenhuma vaga válida existente é excluída, fundida ou sobrescrita |
| T-006-31 | Um registro de vaga própria se assemelha a um registro externo | A deduplicação externa não classifica automaticamente a vaga própria como duplicada |
| T-006-32 | Um registro falha durante o processamento, mas há outros registros independentes válidos | Os demais registros são processados quando for seguro continuar; a falha individual é registrada |
| T-006-33 | Ocorre falha durante a persistência de um registro | Não permanece alteração parcial ou estado inválido; a operação não é registrada como sucesso |
| T-006-34 | Uma falha recuperável ocorre durante a ingestão | Nova tentativa ocorre dentro do limite operacional e seu resultado passa pelas validações aplicáveis |
| T-006-35 | Ocorre erro permanente ou os dados são inválidos | Não há repetição indefinida; a falha ou rejeição é registrada com motivo relevante |
| T-006-36 | Reexecutar uma execução parcialmente concluída | Estado existente é verificado e não são criadas representações equivalentes adicionais |
| T-006-37 | Um registro falha quando já existe uma vaga válida | A vaga válida existente é preservada |
| T-006-38 | Não é possível recuperar um registro após tentativas permitidas | Resultado de falha e motivo relevante ficam rastreáveis |
| T-006-39 | Uma execução termina com resultados individuais mistos | Resultado agregado e quantitativos refletem os resultados individuais reais |
| T-006-40 | Executar nova ingestão após execução malsucedida | Rastreabilidade da execução anterior é preservada e a nova execução possui resultado próprio |
| T-006-41 | Resposta da fonte autorizada segue o contrato/formato esperado | Campos utilizados são mapeados conforme as regras documentadas |
| T-006-42 | Campo de origem exige conversão prevista no mapeamento | Conversão esperada é aplicada sem alterar o significado do dado |
| T-006-43 | Campo opcional não utilizado está ausente | Normalização prossegue sem inventar informação, desde que os dados mínimos sejam atendidos |
| T-006-44 | Estrutura ou tipo incompatível não pode ser interpretado com segurança | Registro é rejeitado ou tratado como falha, com motivo rastreável e sem normalização silenciosa incorreta |
| T-006-45 | Registro é aceito após normalização | Tipos, formatos e campos são compatíveis com o modelo comum de VAGA e suas validações |
| T-006-46 | Fonte autorizada é adicionada ou alterada | Testes cobrem campos utilizados, conversões e dados ausentes/inválidos sem acoplar o domínio ao fornecedor |

## 13. Questões em aberto

As questões estão centralizadas em [OPEN.md](OPEN.md).

- **OPEN-025:** campos obrigatórios e validações para considerar um registro externo uma vaga válida.
- **OPEN-026:** comportamento de contingência quando LLM estiver indisponível ou produzir dados inválidos.
- **OPEN-027 (resolvida):** cada execução possui identificação e resultado agregado rastreável; cada registro recebido está associado à execução e possui resultado individual, com quantitativos consolidados coerentes. A estrutura persistente será detalhada no modelo de dados, sem imposição de entidades/tabelas nesta decisão.
- **OPEN-028 (resolvida):** deduplicação externa conservadora em camadas por identificador na mesma fonte, URL original normalizada e, quando necessário, atributos normalizados confiáveis; casos incertos permanecem separados e não alteram vagas válidas existentes.
- **OPEN-029 (resolvida):** processamento independente por registro, persistência consistente, repetição limitada apenas para falhas recuperáveis, reexecução segura com deduplicação aprovada, preservação de vagas válidas e rastreabilidade dos resultados individuais/agregados e das execuções anteriores. Limites e intervalos operacionais ficam para detalhamento, alinhados à OPEN-026; não se impõem tecnologias ou estruturas físicas.
- **OPEN-030 (resolvida):** preservada a formulação oficial de RNF-16 — interoperabilidade com fontes externas e normalização para o modelo da plataforma. A SPEC-006 verifica contrato/formato, mapeamento documentado, conversões, compatibilidade dos registros normalizados, tratamento rastreável de dados incompatíveis e preservação semântica, com testes por fonte autorizada; sem métricas arbitrárias ou alteração da baseline.
- **OPEN-086:** confirmar acesso, cobertura, autorização e condições de uso da fonte externa, incluindo atribuição, links e uso de conteúdo com LLM.
- **OPEN-087:** verificar se as cotas e os limites da API comportam a coleta diária e definir a abordagem para limites excedidos.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Requisitos, regras, UC-14, drivers e ADRs conferidos.
- [ ] Questões em aberto decididas ou mantidas explicitamente.
- [ ] Se existir interface administrativa, layout anexado em `docs/layout/` e aprovado; se não existir, registrar formalmente não se aplica.
- [ ] Critérios e testes revisados.
- [ ] Validação, normalização, deduplicação, integridade e rastreabilidade verificáveis.
- [ ] Nenhuma implementação iniciada antes das aprovações exigidas.

---

## Registro de revisão do Bloco 2

| Spec | Estado do texto | Estado do layout | Revisão humana |
|---|---|---|---|
| SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa | especificada | pendente | aguardando |
| SPEC-005 — Cadastrar e gerenciar vagas próprias | especificada | pendente | aguardando |
| SPEC-006 — Importar, ingerir e normalizar vagas externas | especificada | não se aplica ao núcleo; interface opcional pendente | aguardando |

**Próxima etapa:** detalhar o Bloco 3 após registrar este bloco no documento. A revisão coletiva das questões em aberto pode ocorrer depois que todas as Specs estiverem detalhadas.


# Bloco 3 — Compatibilidade e descoberta de vagas

Este bloco detalha SPEC-007 a SPEC-010. As lacunas são registradas em docs/OPEN.md; a descrição não representa aprovação do texto nem dos layouts.

---

# SPEC-007 — Calcular compatibilidade entre candidato e vaga

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-007 |
|
| Estado do texto | especificada |
| Estado do layout | não se aplica ao cálculo; apresentação do resultado pertence à SPEC-010 |
| Capacidade | Aplicar trava crítica e calcular score determinístico de compatibilidade |

## 2. Rastreabilidade
- **RF:** RF-07, RF-08, RF-09, RF-24, RF-25.
- **RB:** RB-02, RB-03, RB-04, RB-05, RB-06, RB-07, RB-15, RB-16, RB-30.
- **RNF:** RNF-10, RNF-15.
- **UC:** UC-13 — Calcular Match Determinístico; acionado também pela busca UC-02.
- **Modelo:** CANDIDATO, VETOR_ACESSIBILIDADE_CANDIDATO, VAGA, TRAVA_CRITICA_VAGA.
- **Drivers:** DA-03, DA-04. **ADR:** ADR-004.
- **Dependências:** SPEC-002, SPEC-004, SPEC-005 e SPEC-006.
- **Questões:** OPEN-031 a OPEN-035.

## 3. Escopo
**Incluído:** verificar dados mínimos; comparar necessidades obrigatórias com barreiras da vaga; aplicar trava eliminatória; calcular score quando a vaga passar pela trava; produzir fatores que expliquem o resultado.

**Fora do escopo:** editar perfil/vaga; definir campos ainda não estabelecidos como obrigatórios; executar busca ou apresentar página detalhada; registrar candidatura; inferir compatibilidade quando faltam dados.

## 3.1. Telas e evidência de layout
O cálculo é uma capacidade de domínio e não exige tela própria. A visualização do percentual, fatores e explicação pertence à SPEC-010; o layout dessa apresentação permanece pendente.

## 4. Dependências
- SPEC-002 fornece perfil e necessidades.
- SPEC-004, SPEC-005 e SPEC-006 fornecem informações de acessibilidade e vagas próprias/externas válidas.
- SPEC-008 consome resultados para busca e ordenação.
- SPEC-010 apresenta score e fatores.

## 5. Comportamento esperado
1. Receber candidato e vaga preparada para análise.
2. Verificar se os dados mínimos definidos na OPEN-032 estão disponíveis; se faltar informação necessária em qualquer dimensão, classificar a análise como “dados insuficientes” e não apresentar o score final como completo. Informar quais dimensões puderam ser avaliadas e quais dados faltam, sem presumir valores.
3. Para acessibilidade (A), comparar somente necessidades funcionais e recursos indispensáveis explicitamente declarados pelo candidato com recursos, condições e requisitos de acessibilidade explicitamente declarados para a vaga.
4. Para perfil técnico (T), comparar critérios técnicos definidos para a vaga com competências e conhecimentos declarados pelo candidato; formação, experiência e idiomas só entram quando forem critérios aplicáveis à vaga.
5. Para distância/modalidade (D), calcular a compatibilidade de modalidade (peso interno 60%) e, em vagas presenciais ou híbridas, a compatibilidade de localização/distância (40%) pelas faixas em quilômetros da seção 6.1. Usar localização para determinar a distância entre candidato e local de trabalho; não calcular tempo de deslocamento até o trabalho. O método/provedor para obter a distância em quilômetros permanece a definir. Em vaga totalmente remota, excluir o componente de localização/distância e calcular D somente pela modalidade; não penalizar distância
6. Comparar necessidades funcionais obrigatórias com barreiras e recursos eliminatórios registrados para a vaga.
7. Se houver barreira incompatível com necessidade obrigatória, classificar a vaga como incompatível, independentemente de qualquer score.
8. Se não houver trava crítica, calcular o score determinístico com os pesos definidos na baseline.
9. Produzir resultado e fatores considerados, preservando transparência.
10. Ao analisar várias vagas, permitir que a capacidade consumidora ordene os resultados por score.

## 6. Regras e invariantes
1. Barreira incompatível com necessidade obrigatória torna a vaga incompatível (RB-02).
2. A trava crítica prevalece sobre a pontuação (RB-15).
3. Pesos: acessibilidade 50%, perfil técnico 30%, distância e modalidade 20% (RB-03 a RB-05).
4. Perfil técnico considera escolaridade, formação, competências e idiomas exigidos (RB-07).
5. Necessidades marcadas como obrigatórias participam da análise (RB-06).
6. Informação de acessibilidade ausente permanece não informada; não se presume compatibilidade (RB-16).
7. Resultado apresenta principais fatores considerados (RB-30).
8. Mesmas entradas e mesmas regras devem produzir resultado consistente (RNF-10).
9. Cálculo deve ser testável isoladamente (RNF-15).
10. As subpontuações A, T e D são calculadas pelos critérios e pesos internos documentados na seção 6.1; não se aplica uma regra genérica de pesos iguais a todas as dimensões.
11. O score final é calculado por S = 0,50 × A + 0,30 × T + 0,20 × D, em que A é acessibilidade, T é perfil técnico e D é distância/modalidade. A trava crítica continua sendo aplicada antes do score.
12. Manter a precisão das subpontuações durante o cálculo e arredondar somente o score final para o inteiro mais próximo; em empate exato de meio ponto, arredondar para cima.
13. Se faltar informação necessária em qualquer dimensão, sinalizar a análise como “dados insuficientes” e não apresentar o score final como completo. Podem ser exibidas as dimensões já avaliadas e os dados faltantes. Ausência de dados não recebe zero nem compatibilidade presumida. A composição de score parcial não está autorizada por esta decisão.

## 6.1. Parâmetros numéricos e cálculo das dimensões

**Pesos gerais:** A (acessibilidade) = 50%; T (perfil técnico) = 30%; D (distância/modalidade) = 20%. O score final é S = 0,50 × A + 0,30 × T + 0,20 × D.

**A — Acessibilidade (50% do score final):** comparar requisitos de acessibilidade aplicáveis da vaga com necessidades e recursos indispensáveis declarados pelo candidato. Para cada requisito com informação suficiente: recurso necessário confirmado disponível = 100; parcialmente disponível com limitação conhecida = 50; confirmado indisponível, mas não constituindo barreira crítica = 0. Informação não fornecida ou não validada não pontua. A = média simples das pontuações dos requisitos aplicáveis e avaliáveis. A trava crítica por barreira incompatível com necessidade obrigatória é aplicada antes do score.

**T — Perfil técnico (30% do score final):** comparar critérios da vaga com dados declarados pelo candidato. Pesos internos: competências e conhecimentos = 40%; experiência profissional = 30%; formação e escolaridade = 20%; idiomas = 10%. Só entram critérios aplicáveis à vaga. A nota T é a soma das notas de critério multiplicadas pelos pesos internos aplicáveis, normalizada pela soma desses pesos aplicáveis. As faixas/escala de pontuação por critério técnico devem seguir critérios explícitos da vaga e não são inventadas por esta especificação.

**D — Distância e modalidade (20% do score final):** pesos internos: compatibilidade com modalidade = 60%; compatibilidade de localização/distância = 40%. Modalidade atende à preferência informada = 100; atende parcialmente = 50; modalidade confirmada não atende = 0. Para vaga presencial ou híbrida, pontuar a distância entre a localização do candidato e o local de trabalho: até 10 km = 100; mais de 10 km até 25 km = 75; mais de 25 km até 50 km = 50; mais de 50 km = 25. Localização desconhecida não pontua e, quando necessária à avaliação, deve ser indicada como dado insuficiente conforme OPEN-033. Para vaga totalmente remota, localização/distância não se aplica: excluir o componente de 40%, não atribuir zero e calcular D somente pela nota de modalidade (D = M), se modalidade for avaliável. Em vagas presenciais/híbridas, D = 0,60 × M + 0,40 × L.

**Aplicabilidade e dados ausentes:** critérios não aplicáveis à vaga são excluídos da composição. Quando faltar informação necessária para avaliar uma dimensão (incluindo preferência de modalidade ou localização, conforme aplicável), indicar “dados insuficientes” e não apresentar score final completo, conforme OPEN-033. A distância é expressa em quilômetros; o método/provedor para determiná-la permanece a definir. Não calcular tempo de deslocamento. Ausência de dados não é nota zero nem compatibilidade presumida. Não calcular score parcial final por esta decisão. Manter precisão intermediária e arredondar somente o score final ao inteiro mais próximo, com meio ponto exato arredondado para cima.

## 6.2. Rastreabilidade e reprodução do cálculo (OPEN-035)

Cada execução do cálculo deve produzir um registro histórico imutável que permita explicar e reproduzir o resultado daquele momento, sem alterar a fórmula ou os critérios de pontuação definidos nesta Spec.

O registro deve incluir:
- identificador único do cálculo, identificação do candidato e da vaga e data/hora da execução;
- versão da SPEC-007 e do conjunto de regras/parâmetros aplicados; versão do mecanismo de cálculo quando houver versionamento;
- fotografia minimizada dos dados efetivamente usados nas dimensões A, T e D, preservando valores e estados informacionais relevantes naquele momento (por exemplo: declarado, não informado e não aplicável); para localização/distância, registrar a distância em quilômetros utilizada na faixa, sem copiar dados de localização ou rota desnecessários;
- notas/subresultados avaliáveis, fatores considerados e valores intermediários necessários para explicar a composição do resultado, score final quando completo e resultado da trava crítica;
- quando houver dados insuficientes, dimensões avaliáveis e informações faltantes, sem registrar nota zero como substituição e sem apresentar score final completo.

A reprodução deve utilizar os dados preservados e as mesmas regras/versões registradas. Alterações posteriores no perfil, na vaga ou nas regras não modificam o registro histórico. Um recálculo cria um novo registro, relacionado ao contexto pertinente, sem sobrescrever a execução anterior.

Aplicar minimização: não copiar o perfil integral nem dados da vaga que não participaram do cálculo. Restringir o acesso aos registros e proteger especialmente os dados de acessibilidade. Retenção: 1 ano conforme OPEN-006, seguida de descarte seguro, ressalvadas obrigações aplicáveis de preservação. Esse prazo técnico não altera o histórico funcional exibido ao usuário por 60 dias após cancelamento/encerramento de vaga, conforme OPEN-065.

## 7. Modelo de domínio
- **CANDIDATO:** dados profissionais.
- **VETOR_ACESSIBILIDADE_CANDIDATO:** necessidades funcionais e indicação de obrigatoriedade.
- **VAGA:** requisitos, modalidade, localização e dados de acessibilidade.
- **TRAVA_CRITICA_VAGA:** recursos eliminatórios e barreiras impeditivas.
- **Resultado de compatibilidade:** resultado lógico, score e fatores produzidos pelo cálculo; atributos persistidos adicionais não são presumidos.

## 8. Impacto arquitetural
A lógica fica concentrada em serviço de domínio independente da interface e da persistência. A trava ocorre antes do score. Dados externos precisam ter passado pela SPEC-006.

**Integração prevista para a etapa de implementação:** em vagas presenciais ou híbridas, usar localização para determinar a distância em quilômetros entre candidato e local de trabalho, aplicando as faixas da seção 6.1. Não calcular tempo de deslocamento até o trabalho. O método/provedor para obter a distância permanece a definir. Em vaga totalmente remota, não calcular localização/distância. Localização ausente ou impossibilidade de determinar a distância, quando necessária à avaliação, não será interpretada como distância zero nem incompatibilidade automática; indicar dados insuficientes conforme OPEN-033.

## 9. Contratos necessários
- **Verificar elegibilidade por barreiras:** compara necessidades obrigatórias e barreiras registradas.
- **Calcular score:** aplica pesos e critérios aprovados, quando aplicável.
- **Explicar resultado:** retorna os principais fatores considerados.
- **Analisar candidato/vaga:** coordena validação dos dados, trava e score.

Contratos conceituais, sem endpoints HTTP.

## 10. RNFs aplicáveis
- **RNF-10:** consistência dos resultados.
- **RNF-15:** testabilidade isolada.
- **RNF-09/RNF-14:** aplicáveis quando resultado e parâmetros forem registrados conforme regras de rastreabilidade.

## 11. Critérios de aceitação
- [ ] Barreira incompatível com necessidade obrigatória elimina a vaga independentemente do score.
- [ ] Score usa pesos 50%/30%/20%.
- [ ] Dados insuficientes não são convertidos em compatibilidade presumida.
- [ ] Perfil incompleto gera indicação de complementação, conforme UC-13.
- [ ] Resultado expõe fatores considerados.
- [ ] Mesmas entradas e regras produzem resultado consistente.
- [ ] Vaga externa só é analisada depois de validada e normalizada.
- [ ] Cálculo pode ser testado isoladamente.
- [ ] Subpontuações e score final seguem a fórmula aprovada na OPEN-031, com arredondamento apenas no resultado final.
- [ ] Quando faltar informação necessária em qualquer dimensão, análise sinaliza “dados insuficientes”, sem score final completo; informa dimensões avaliadas e dados faltantes, sem converter ausência em zero ou compatibilidade presumida.

## 12. Casos de teste derivados
| ID | Cenário | Resultado esperado |
|---|---|---|
| T-007-01 | Necessidade obrigatória encontra barreira impeditiva | Vaga incompatível |
| T-007-02 | Sem barreira crítica e dados completos | Score calculado |
| T-007-03 | Score alto, mas há barreira crítica | Vaga permanece incompatível |
| T-007-04 | Dados de acessibilidade ausentes | Não se presume compatibilidade |
| T-007-05 | Perfil sem dados mínimos | Solicita complementação |
| T-007-06 | Mesmas entradas em duas execuções | Resultado consistente |
| T-007-07 | Consultar explicação | Principais fatores retornados |
| T-007-08 | Vaga externa não validada | Não participa da análise |

## 13. Questões em aberto
- **OPEN-031:** resolvida; pesos gerais A=50%, T=30%, D=20%; parâmetros e pesos internos de A/T/D, score final, precisão e arredondamento estão na seção 6.1. A trava crítica precede o score; dados necessários ausentes seguem OPEN-033/034 e não recebem zero nem compatibilidade presumida.
- **OPEN-032:** dados mínimos necessários para cada dimensão do cálculo.
- **OPEN-033:** resolvida; quando faltar informação necessária em qualquer dimensão, indicar “dados insuficientes”, não apresentar score final como completo e informar dimensões avaliadas/dados faltantes; ausência não vira zero nem compatibilidade presumida.
- **OPEN-034:** resolvida; modalidade e distância em quilômetros, faixas de pontuação e regra de exclusão de distância para vagas totalmente remotas estão documentadas na seção 6.1
- **OPEN-035:** parâmetros e resultados que devem ser armazenados para rastreabilidade.
- **OPEN-088:** método/provedor para determinar a distância em quilômetros entre candidato e local de trabalho; uso de localização mantido, sem cálculo de tempo de deslocamento.

## 14. Definition of Done
- [ ] Texto aprovado.
- [ ] Fórmula e dados mínimos confirmados na baseline ou por decisão registrada.
- [ ] Trava crítica e pesos cobertos por testes.
- [ ] Apresentação do resultado aprovada na SPEC-010.
- [ ] Critérios e testes revisados.
- [ ] Sem implementação antes das aprovações necessárias.

---

# SPEC-008 — Buscar e filtrar vagas

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-008 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Buscar e filtrar vagas elegíveis e ordená-las por compatibilidade |

## 2. Rastreabilidade
- **RF:** RF-06, RF-09, RF-24, RF-25.
- **RB:** RB-02, RB-03, RB-04, RB-05, RB-10, RB-13, RB-16, RB-17, RB-30.
- **RNF:** RNF-01, RNF-03, RNF-04, RNF-05, RNF-13.
- **UC:** UC-02 — Buscar Vagas; integra UC-13.
- **Modelo:** VAGA, EMPRESA, INFRAESTRUTURA_EMPRESA, TRAVA_CRITICA_VAGA.
- **Drivers:** DA-01, DA-03, DA-04, DA-06, DA-08. **ADRs:** ADR-001, ADR-004.
- **Dependências:** SPEC-002, SPEC-005, SPEC-006, SPEC-007.
- **Questões:** OPEN-036 a OPEN-039.

## 3. Escopo
**Incluído:** buscar por termos de interesse e filtros citados nos casos de uso, incluindo cargo/localização e modalidade; consultar vagas ativas; aplicar a trava crítica pela SPEC-007; ordenar resultados elegíveis por compatibilidade; informar ausência de resultados.

**Fora do escopo:** cálculo do score; detalhe completo da vaga; candidatura; edição/publicação; alertas por e-mail, cuja inclusão precisa ser confirmada; inventar filtros ausentes da baseline.

## 3.1. Telas e evidência de layout
| Tela/área | Finalidade | Layout |
|---|---|---|
| Busca de vagas | Informar termos e critérios | Pendente |
| Filtros | Refinar resultados por critérios suportados | Pendente |
| Lista de resultados | Mostrar vagas elegíveis e compatibilidade | Pendente |
| Estado sem resultados | Informar ausência de vagas compatíveis | Pendente |

Protótipos devem seguir a identidade visual e acessibilidade transversal, ser anexados em docs/layout/ e aprovados separadamente.

## 4. Dependências
- SPEC-002: dados do candidato.
- SPEC-005/SPEC-006: catálogo de vagas próprias e externas válidas.
- SPEC-007: elegibilidade e score.
- SPEC-009: estado e disponibilidade.
- SPEC-010: detalhe do resultado.

## 5. Comportamento esperado
1. Candidato autenticado acessa a busca.
2. Informa termos e filtros disponíveis.
3. Sistema consulta vagas ativas e aplica filtros solicitados.
4. Sistema solicita à SPEC-007 a análise de compatibilidade das vagas candidatas.
5. Vagas que falham na trava crítica não são apresentadas como elegíveis.
6. Vagas elegíveis são ordenadas por compatibilidade conforme UC-02/UC-13.
7. Sistema apresenta resultados e informações relevantes de acessibilidade antes da candidatura.
8. Se nenhuma vaga passar pela trava, informa ausência de oportunidades elegíveis e permite ajustar critérios.
9. Alterações de status devem respeitar a SPEC-009.

## 6. Regras e invariantes
1. Busca respeita os filtros suportados.
2. Vagas incompatíveis por barreira crítica não aparecem como elegíveis (RF-09, RB-02, RB-15).
3. Vagas externas só participam após validação (RB-10, RB-17).
4. Dados ausentes não significam compatibilidade (RB-16).
5. Informações relevantes de acessibilidade devem estar disponíveis antes da candidatura (RB-13).
6. Ordenação usa resultado da SPEC-007, sem duplicar o algoritmo.
7. Fatores relevantes devem ser apresentados (RB-30).
8. Busca e filtros devem ser utilizáveis por teclado, leitores de tela e diferentes tamanhos de tela.
9. Salvar alertas por e-mail é citado como sugestão em UC-02, mas não é presumido como parte desta capacidade.

## 7. Modelo de domínio
- **VAGA:** oportunidade e status.
- **EMPRESA/INFRAESTRUTURA_EMPRESA:** informações organizacionais de acessibilidade.
- **TRAVA_CRITICA_VAGA:** barreiras impeditivas.
- **Resultado de compatibilidade:** fornecido pela SPEC-007.

## 8. Impacto arquitetural
A busca coordena consulta ao catálogo, filtros e serviço de compatibilidade sem duplicar o algoritmo. Deve respeitar RNF-05, sem presumir cache, indexador ou tecnologia específica. A interface precisa ser acessível e responsiva.

## 9. Contratos necessários
- **Buscar vagas:** recebe critérios suportados e retorna vagas candidatas.
- **Filtrar vagas:** aplica filtros aprovados.
- **Obter elegibilidade e score:** consome SPEC-007.
- **Consultar status:** confirma disponibilidade conforme SPEC-009.
- **Retornar resultados:** apresenta vagas elegíveis ordenadas.
- **Retornar estado sem resultados:** comunica ausência e permite revisar filtros.

## 10. RNFs aplicáveis
RNF-01/02 (acessibilidade e leitores de tela); RNF-03/04 (responsividade e usabilidade); RNF-05 (desempenho); RNF-13 (compatibilidade). RNF-10/15 aplicam-se ao cálculo consumido na SPEC-007.

## 11. Critérios de aceitação

- [ ] A consulta respeita autorização e não expõe dados pessoais ou necessidades de acessibilidade fora da finalidade autorizada (RNF-07/RNF-08).
- [ ] Filtros combinados e resultados mantêm comportamento consistente após erro ou ausência de dados (RNF-09); limites de paginação permanecem conforme OPEN-038.

- [ ] Candidato busca vagas com critérios suportados.
- [ ] Filtros restringem resultados conforme solicitado.
- [ ] Vagas com barreira crítica não aparecem como elegíveis.
- [ ] Resultados seguem o score da SPEC-007.
- [ ] Vagas externas não validadas são excluídas.
- [ ] Status atual da vaga é respeitado.
- [ ] Informações de acessibilidade aparecem antes da candidatura.
- [ ] Estado sem resultados é comunicado de forma acessível.

## 12. Casos de teste derivados
| ID | Cenário | Resultado esperado |
|---|---|---|
| T-008-01 | Buscar termo existente | Resultados correspondentes |
| T-008-02 | Filtrar modalidade | Resultados respeitam filtro |
| T-008-03 | Vaga falha na trava crítica | Não aparece como elegível |
| T-008-04 | Vagas elegíveis com scores diferentes | Ordem segue score |
| T-008-05 | Vaga externa não validada | Não aparece como elegível |
| T-008-06 | Vaga encerra após busca inicial | Estado atualizado é respeitado |
| T-008-07 | Nenhuma vaga elegível | Mensagem e ajuste de filtros |
| T-008-08 | Navegar filtros por teclado | Operação sem mouse possível |

## 13. Questões em aberto
- **OPEN-036:** filtros definitivos e combinação entre eles.
- **OPEN-037:** campos consultáveis e regras de busca textual.
- **OPEN-038:** paginação, limites de resultados e ordenações alternativas.
- **OPEN-039:** se alertas/salvamento de busca fazem parte do escopo ou são apenas sugestão.

## 14. Definition of Done
- [ ] Texto aprovado.
- [ ] Filtros conferidos na baseline.
- [ ] Integração com SPEC-007/SPEC-009 testável.
- [ ] Layouts e estados vazios anexados e aprovados.
- [ ] Acessibilidade e desempenho verificáveis.
- [ ] Sem implementação antes das aprovações necessárias.

---

# SPEC-009 — Consultar status e disponibilidade da vaga

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-009 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Exibir o estado atual da vaga e impedir ações incompatíveis com sua disponibilidade |

## 2. Rastreabilidade
- **RF:** RF-10, RF-12, RF-27.
- **RB:** RB-01, RB-13, RB-23, RB-42.
- **RNF:** RNF-05, RNF-09, RNF-14.
- **UC:** UC-12 — Status da Vaga; integra UC-02 e é relevante para UC-03.
- **Modelo:** VAGA, CANDIDATURA.
- **Drivers:** DA-02, DA-08. **ADRs:** ADR-002, ADR-004.
- **Dependências:** SPEC-001, SPEC-005 e SPEC-006.
- **Questões:** OPEN-040 a OPEN-042.

## 3. Escopo
**Incluído:** consultar e apresentar status atual; distinguir estados citados na baseline (aberta, encerrada ou indisponível); refletir alterações recentes; bloquear ações incompatíveis; identificar candidatos ativos afetados por encerramento para comunicação, conforme RB-42.

**Fora do escopo:** criar estados/transições novos; gerenciar o funil; publicar/editar vaga; implementar todos os tipos de notificação.

## 3.1. Telas e evidência de layout
| Tela/área | Finalidade | Layout |
|---|---|---|
| Indicador de status | Mostrar estado atual | Pendente |
| Mensagem de encerrada/indisponível | Explicar condição e bloquear ações incompatíveis | Pendente |
| Estado atualizado | Informar mudança desde consulta anterior | Pendente |

## 4. Dependências
- SPEC-005/SPEC-006 fornecem vagas.
- SPEC-008 apresenta vagas na busca.
- SPEC-010 exibe status no detalhe.
- SPEC-011 verifica disponibilidade antes de candidatura.
- SPEC-016/017 tratam acompanhamento e comunicação.

## 5. Comportamento esperado
1. Candidato consulta uma vaga no catálogo, busca ou detalhe.
2. Sistema recupera o status atual registrado.
3. Sistema apresenta o estado de forma clara e acessível.
4. Se aberta, o candidato pode seguir às verificações de elegibilidade.
5. Se encerrada ou indisponível, o sistema informa a condição e bloqueia ações incompatíveis, incluindo nova candidatura.
6. Se o status mudar após a busca, a operação seguinte verifica o estado atual.
7. Ao encerrar uma vaga, candidatos ativos são identificados para comunicação conforme RB-42 e a Spec de notificação.
8. Alterações relevantes são rastreáveis.

## 6. Regras e invariantes
1. Candidatura somente em vaga disponível e não bloqueada (RB-01).
2. Vaga encerrada não aceita novas candidaturas e candidatos ativos são informados (RB-42).
3. Status relevante deve ser claro antes da candidatura (RB-13, RB-23).
4. Estado exibido reflete o registro atual.
5. Estados novos não são criados sem decisão formal.
6. Esta Spec trata consulta e aplicação de restrições; não concede ao candidato permissão para alterar status.
7. Consulta de status não substitui verificação de compatibilidade da SPEC-007.

## 7. Modelo de domínio
- **VAGA:** contém status_vaga no modelo conceitual.
- **CANDIDATURA:** identifica candidatos ativos potencialmente afetados por encerramento.
- Estados e transições permanecem limitados à baseline.

## 8. Impacto arquitetural
A disponibilidade deve ser consultada por operações que dependem dela, especialmente candidatura. A validação ocorre no backend para impedir ações com estado desatualizado. A comunicação pode ser delegada à SPEC-017. Não se escolhe mecanismo em tempo real nem tecnologia de notificação.

## 9. Contratos necessários
- **Consultar status da vaga:** retorna estado atual.
- **Verificar disponibilidade:** informa se a ação solicitada é permitida.
- **Aplicar restrições por status:** bloqueia operações incompatíveis.
- **Identificar candidaturas afetadas:** fornece o conjunto para notificação.
- **Registrar alteração de status:** mantém rastreabilidade quando houver operação que altere estado.

## 10. RNFs aplicáveis
RNF-05 (desempenho), RNF-09 (consistência), RNF-14 (rastreabilidade) e RNF-07 (controle de acesso às operações protegidas).

## 11. Critérios de aceitação

- [ ] Somente perfis autorizados consultam informações protegidas e a consulta não permite alteração de status (RNF-07/RNF-08).
- [ ] Mudanças de status relevantes, quando originadas por operação autorizada, permanecem rastreáveis (RNF-14).

- [ ] Candidato visualiza estado atual.
- [ ] Vaga encerrada/indisponível bloqueia novas candidaturas.
- [ ] Mudança após a busca é respeitada pela operação seguinte.
- [ ] Encerramento identifica candidatos ativos para comunicação.
- [ ] O sistema não inventa status.
- [ ] Consulta e restrições são consistentes no backend.
- [ ] Mensagens são acessíveis e compreensíveis.

## 12. Casos de teste derivados
| ID | Cenário | Resultado esperado |
|---|---|---|
| T-009-01 | Consultar vaga aberta | Estado aberto |
| T-009-02 | Consultar vaga encerrada | Estado encerrado |
| T-009-03 | Candidatar-se em vaga encerrada | Ação bloqueada |
| T-009-04 | Vaga encerra após busca | Estado atualizado respeitado |
| T-009-05 | Encerrar vaga com candidaturas ativas | Candidatos identificados para notificação |
| T-009-06 | Status não definido/indisponível | Comunicar apenas estado registrado |

## 13. Questões em aberto
- **OPEN-040:** catálogo formal de status e significado de indisponível versus encerrada.
- **OPEN-041:** papéis que podem alterar status e transições permitidas.
- **OPEN-042:** prazo e canal para informar candidatos ativos após encerramento.

## 14. Definition of Done
- [ ] Texto aprovado.
- [ ] Estados e permissões conferidos.
- [ ] Verificação de disponibilidade testável no backend.
- [ ] Layouts dos estados aprovados.
- [ ] Integração com candidatura/notificação testável.
- [ ] Sem implementação antes das aprovações necessárias.

---

# SPEC-010 — Visualizar vaga e resultado de compatibilidade

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-010 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Apresentar detalhes da vaga, acessibilidade, status e explicação de compatibilidade |

## 2. Rastreabilidade
- **RF:** RF-10, RF-24, RF-25.
- **RB:** RB-13, RB-16, RB-30, RB-01, RB-34.
- **RNF:** RNF-01, RNF-02, RNF-03, RNF-04, RNF-13.
- **UC:** UC-02, UC-12, UC-13.
- **Modelo:** VAGA, EMPRESA, INFRAESTRUTURA_EMPRESA, TRAVA_CRITICA_VAGA.
- **Drivers:** DA-01, DA-03, DA-04. **ADRs:** ADR-001, ADR-004.
- **Dependências:** SPEC-004 a SPEC-009, especialmente SPEC-007 e SPEC-009.
- **Questões:** OPEN-043 a OPEN-046.

## 3. Escopo
**Incluído:** apresentar título, descrição, requisitos, modalidade, localização, faixa salarial quando disponível, informações de acessibilidade e origem quando aplicável; mostrar status atual e resultado/fatores de compatibilidade; distinguir dados conhecidos dos não informados; permitir continuidade para candidatura somente quando status e elegibilidade permitirem.

**Fora do escopo:** editar vaga; recalcular compatibilidade; realizar candidatura; alterar status; inferir atributos ausentes ou prometer acessibilidade não comprovada.

## 3.1. Telas e evidência de layout
| Tela/área | Finalidade | Layout |
|---|---|---|
| Detalhe da vaga | Apresentar informações disponíveis | Pendente |
| Seção de acessibilidade | Exibir informações declaradas e ausentes | Pendente |
| Resultado de compatibilidade | Mostrar score e fatores da SPEC-007 | Pendente |
| Estado incompatível | Explicar inelegibilidade com fatores disponíveis | Pendente |
| Ações conforme status | Permitir ou bloquear continuidade | Pendente |

O layout não deve depender apenas de cor para indicar compatibilidade, deve permitir leitura acessível e distinguir informação declarada, não informada e calculada.

## 4. Dependências
- SPEC-004/005/006 fornecem dados de vaga e acessibilidade.
- SPEC-007 fornece resultado e fatores.
- SPEC-009 fornece status/disponibilidade.
- SPEC-011 registra candidatura.
- SPEC-003 orienta acessibilidade da apresentação.

## 5. Comportamento esperado
1. Candidato abre vaga a partir da busca ou acesso autorizado.
2. Sistema recupera detalhes disponíveis e status atual.
3. Sistema apresenta os dados da oportunidade e acessibilidade registrada.
4. Campos ausentes são identificados como não informados.
5. Se existir resultado de compatibilidade, apresenta score e fatores retornados pela SPEC-007.
6. Se houver incompatibilidade por trava crítica, comunica que a vaga não é elegível para aquele candidato e apresenta fatores disponíveis.
7. Apresenta status aberto/encerrado/indisponível conforme registro atual.
8. A continuidade para candidatura só é oferecida quando status e elegibilidade permitirem; SPEC-011 fará validação final.
9. Apresentação funciona com teclado, leitores de tela e dispositivos suportados.

## 6. Regras e invariantes
1. Informações relevantes de acessibilidade disponíveis antes da candidatura (RB-13).
2. Dados ausentes não aparecem como confirmados (RB-16).
3. Principais fatores de compatibilidade apresentados (RB-30).
4. Trava crítica prevalece sobre score; incompatibilidade não pode ser apresentada como elegibilidade (RB-15).
5. Status reflete consulta atual (RB-23, RB-42).
6. Tela não calcula score alternativo nem altera resultado da SPEC-007.
7. Não revelar dados pessoais do candidato desnecessários à própria consulta.
8. A apresentação segue RNF-01/02/03/04/13.

## 7. Modelo de domínio
- **VAGA:** título, descrição, modalidade, faixa salarial, status e origem conforme modelo conceitual.
- **EMPRESA/INFRAESTRUTURA_EMPRESA:** informações organizacionais de acessibilidade.
- **TRAVA_CRITICA_VAGA:** barreiras e recursos eliminatórios.
- **Resultado de compatibilidade:** score e fatores calculados pela SPEC-007.
O modelo não define todos os campos visíveis nem a política de ocultação por campo; ver OPEN-043/044.

## 8. Impacto arquitetural
A apresentação compõe dados dos serviços de vaga, status e compatibilidade, sem duplicar regras. Deve distinguir score de trava crítica e manter semântica acessível. Não é definida biblioteca de UI.

## 9. Contratos necessários
- **Consultar detalhes da vaga:** retorna campos disponíveis e origem.
- **Consultar status:** obtém estado atual conforme SPEC-009.
- **Consultar compatibilidade:** obtém resultado/fatores da SPEC-007.
- **Montar apresentação transparente:** distingue dado registrado, não informado e calculado.
- **Verificar possibilidade de prosseguir:** orienta a ação, sem substituir validação final da SPEC-011.

## 10. RNFs aplicáveis
RNF-01 (WCAG 2.1 AA), RNF-02 (leitores de tela), RNF-03 (responsividade), RNF-04 (usabilidade), RNF-13 (compatibilidade) e RNF-08 (privacidade).

## 11. Critérios de aceitação

- [ ] A tela não expõe dados privados de outros candidatos e apresenta apenas fatores de compatibilidade autorizados (RNF-08).
- [ ] A informação de compatibilidade distingue incompatibilidade crítica, dados ausentes e resultado calculado, sem inferir equivalência entre eles.

- [ ] Detalhes disponíveis da vaga apresentados.
- [ ] Informações de acessibilidade exibidas antes da candidatura.
- [ ] Campos ausentes identificados como não informados.
- [ ] Score/fatores correspondem à SPEC-007.
- [ ] Vaga incompatível não é apresentada como elegível.
- [ ] Status atual apresentado e ações incompatíveis bloqueadas.
- [ ] Dados pessoais desnecessários não são expostos.
- [ ] Conteúdo navegável por teclado e leitores de tela.
- [ ] Interface responsiva nos dispositivos suportados.

## 12. Casos de teste derivados
| ID | Cenário | Resultado esperado |
|---|---|---|
| T-010-01 | Abrir vaga com dados completos | Detalhes apresentados |
| T-010-02 | Campo de acessibilidade ausente | Campo indicado como não informado |
| T-010-03 | Compatibilidade calculada | Score e fatores apresentados |
| T-010-04 | Incompatibilidade crítica | Mensagem de incompatibilidade, sem elegibilidade |
| T-010-05 | Vaga encerrada | Status e bloqueio de candidatura |
| T-010-06 | Navegar por teclado | Seções e ações acessíveis |
| T-010-07 | Leitor de tela lê resultado | Rótulos/status compreensíveis |
| T-010-08 | Resultado é atualizado | Tela reflete resultado atualizado |

## 13. Questões em aberto
- **OPEN-043:** campos do detalhe e regras de visibilidade.
- **OPEN-044:** formato e granularidade da explicação de compatibilidade.
- **OPEN-045:** apresentação de faixa salarial, localização e origem quando ausentes/variáveis.
- **OPEN-046:** apresentação do score quando os dados do candidato não estão completos.

## 14. Definition of Done
- [ ] Texto aprovado.
- [ ] Campos e explicação confirmados com a baseline.
- [ ] Integração com compatibilidade e status testável.
- [ ] Protótipos anexados em docs/layout/ e aprovados separadamente.
- [ ] Acessibilidade validável.
- [ ] Sem implementação antes das aprovações necessárias.

---

## Registro de revisão do Bloco 3

| Spec | Estado do texto | Estado do layout | Revisão humana |
|---|---|---|---|
| SPEC-007 — Calcular compatibilidade entre candidato e vaga | especificada | não se aplica ao cálculo; apresentação na SPEC-010 | aguardando |
| SPEC-008 — Buscar e filtrar vagas | especificada | pendente | aguardando |
| SPEC-009 — Consultar status e disponibilidade da vaga | especificada | pendente | aguardando |
| SPEC-010 — Visualizar vaga e resultado de compatibilidade | especificada | pendente | aguardando |

**Próxima etapa:** detalhar o Bloco 4 na ordem do mapa. A revisão coletiva de OPENs fica para depois do detalhamento de todas as Specs.


# SPEC-011 — Registrar candidatura

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-011 |
|
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Registrar candidatura |

## 2. Rastreabilidade
- **RF:** RF-26 — Registro de candidatura.
- **Dependências:** SPEC-001, 002, 007, 009, 010.
- **Caso de uso:** UC-03 — Candidatar-se a Vaga.
- **Questões abertas:** nenhuma pendente desta SPEC entre OPEN-047 e OPEN-049; as três foram resolvidas em `docs/OPEN.md`.

## 3. Escopo
Validar autenticação, status atual da vaga, compatibilidade/trava crítica, existência de candidatura ativa e disponibilidade do score determinístico. Se válido, registrar candidato, vaga, score obrigatório, data gerada pelo sistema no momento do registro e estado inicial `Inscrita`. Não permitir candidatura duplicada ativa nem criar registro parcial.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Confirmação de candidatura | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Resultado do registro | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Estado não elegível | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 002, 007, 009, 010. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Candidato autenticado seleciona vaga elegível e solicita candidatura.
2. Sistema consulta o status atual da vaga e verifica bloqueio, trava crítica e compatibilidade obrigatória.
3. Sistema verifica se já existe candidatura ativa do candidato para a vaga.
4. Sistema confirma que o score determinístico de compatibilidade está calculado; o score é obrigatório para registrar a candidatura.
5. Se alguma condição falhar ou o score não estiver disponível, recusa o registro e informa o motivo; nenhuma candidatura parcial é criada.
6. Se todas as condições forem satisfeitas, registra a candidatura com estado inicial `Inscrita`, gera `data_inscricao` no momento do registro e disponibiliza o resultado ao candidato.
7. Sistema registra o evento e aciona a capacidade de notificação quando aplicável.

## 6. Regras e invariantes
- Vaga disponível e não bloqueada; trava crítica prevalece; uma candidatura ativa por vaga; operação auditável.
- Cada avaliação contém duas notas obrigatórias e independentes, ambas em escala de 1 a 5 estrelas: acessibilidade e postura inclusiva. Comentário textual é opcional.
- Após o envio, a avaliação é imutável para o candidato; não oferecer fluxo de edição ou reenvio para alterar uma avaliação já registrada. Denúncias e moderação continuam no fluxo existente.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-26; RB-01, RB-14, RB-15, RB-34, RB-41, RB-42; RNF-07/08/09/14; CANDIDATO, VAGA, CANDIDATURA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Solicitar candidatura:** recebe a identificação da vaga e a identidade autenticada do candidato; não aceita identidade de candidato enviada como autoridade pelo cliente.
- **Consultar elegibilidade da vaga:** obtém status atual, bloqueio e resultado de compatibilidade/trava nas Specs responsáveis.
- **Verificar candidatura ativa:** consulta duplicidade para o mesmo candidato e vaga.
- **Registrar candidatura:** cria o vínculo candidato-vaga somente após todas as validações; retorna confirmação ou motivo de recusa.
- **Publicar evento de candidatura:** disponibiliza a mudança para acompanhamento/notificação, sem acoplar o registro à entrega da notificação.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Tentativa sem autenticação, com vaga não elegível ou com candidatura ativa duplicada é recusada sem criar registro parcial.
- [ ] O registro confirmado mantém vínculo íntegro entre candidato e vaga e é rastreável conforme RNF-09/RNF-14.

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-011-01 | Candidato autenticado envia candidatura a vaga disponível, sem duplicidade, sem trava crítica e com score calculado | Candidatura única é registrada com estado `Inscrita`, data gerada pelo sistema e score associado; confirmação é apresentada |
| T-011-02 | Visitante ou usuário não candidato tenta candidatar-se | Operação recusada sem registro |
| T-011-03 | Vaga encerrada, indisponível ou bloqueada | Operação recusada sem registro parcial |
| T-011-04 | Existe candidatura ativa para o mesmo candidato e vaga | Nova candidatura é recusada |
| T-011-05 | Compatibilidade indica trava crítica | Candidatura é recusada independentemente do score |
| T-011-06 | Falha ocorre antes da persistência | Nenhuma candidatura parcial permanece |
| T-011-07 | Candidatura é registrada com sucesso | Vínculo candidato-vaga e evento são rastreáveis |
| T-011-08 | Score determinístico não está disponível | Registro é recusado sem criar candidatura parcial |

## 13. Questões em aberto
As OPEN-047, OPEN-048 e OPEN-049 foram resolvidas e registradas em `docs/OPEN.md`. Novas lacunas identificadas para esta SPEC devem ser registradas ali antes de alterar comportamentos não definidos.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-012 — Gerenciar candidatura pelo candidato

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-012 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Gerenciar candidatura pelo candidato |

## 2. Rastreabilidade
- **Baseline:** RF-11, RF-28, RF-34; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-001, 011, 013, 016, 017.
- **Caso de uso:** UC-05 — Acompanhar Funil de Candidaturas; RF-34 — Cancelamento de candidatura.
- **Questões abertas:** OPEN-050, OPEN-051 e OPEN-052 foram resolvidas e registradas em `docs/OPEN.md`.

## 3. Escopo
Escopo de RF-28: (1) consultar somente candidaturas próprias; (2) acompanhar status, etapas e histórico disponível; e (3) cancelar a própria candidatura nos estados ativos `Inscrita`, `Triagem`, `Entrevista` e `Finalista`, desde que a vaga não esteja encerrada nem bloqueada de forma que impeça o cancelamento; preservar histórico após cancelamento. Editar uma candidatura já enviada, excluir seu registro ou alterar etapas do processo seletivo não fazem parte deste escopo.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Minhas candidaturas | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Detalhe e histórico | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Confirmação de cancelamento | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 011, 013, 016, 017. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Candidato autenticado abre a lista de candidaturas próprias.
2. Sistema retorna apenas candidaturas associadas ao candidato autenticado.
3. Ao selecionar uma candidatura, apresenta estado atual, vaga e histórico disponível.
4. A linha do tempo inclui, quando aplicáveis, os eventos “Candidatura realizada”, “Status” e “Candidatura cancelada”. Cada evento apresenta a data, sem exigir horário, uma descrição breve e compreensível e o status ou etapa resultante quando aplicável. Os eventos são exibidos do mais recente para o mais antigo.
5. O histórico exibido é limitado à própria candidatura do candidato autenticado e não expõe dados de terceiros nem informações internas não destinadas ao acompanhamento.
6. Ao solicitar cancelamento, o sistema confirma a intenção do candidato e verifica que a candidatura pertence ao candidato autenticado, está em estado `Inscrita`, `Triagem`, `Entrevista` ou `Finalista`, e que a vaga não está encerrada nem bloqueada de forma que impeça o cancelamento.
7. Se permitido, registra o cancelamento como estado final, preserva o registro e o histórico; se não, informa o motivo e não altera o estado.
8. Uma candidatura `Contratado`, `Recusado` ou já cancelada não pode ser cancelada novamente.
9. Sistema disponibiliza o estado atualizado para acompanhamento e notifica o recrutador responsável conforme SPEC-017.

## 6. Regras e invariantes
- Candidato só acessa seus processos. Pode cancelar candidatura nos estados `Inscrita`, `Triagem`, `Entrevista` e `Finalista`, se a vaga não estiver encerrada nem bloqueada de forma que impeça a operação. `Contratado`, `Recusado` e `Cancelada` não permitem novo cancelamento. O cancelamento exige confirmação, respeita RB-36, preserva o registro/histórico e não pode ser repetido.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-11, RF-28; RB-14, RB-23, RB-27, RB-36, RB-38, RB-39, RB-41, RB-42; CANDIDATO, CANDIDATURA, VAGA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Listar candidaturas próprias:** identifica o candidato pela sessão autenticada e retorna somente seus registros.
- **Consultar detalhe e histórico:** retorna vaga, estado atual e eventos funcionais disponíveis da candidatura selecionada, limitados ao histórico próprio e sem dados internos ou de terceiros não destinados ao candidato.
- **Solicitar cancelamento:** recebe a candidatura selecionada e verifica se o estado permite cancelamento conforme RB-36 e regras de estado.
- **Confirmar cancelamento:** quando permitido, registra o cancelamento e preserva o histórico; caso contrário, retorna recusa sem alterar o estado.
- **Publicar mudança de estado:** disponibiliza o cancelamento confirmado para acompanhamento e notificações.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Um candidato não consulta nem cancela candidaturas de outra pessoa (RNF-07/RNF-08).
- [ ] Cancelamento permitido preserva o registro e seu histórico; tentativa recusada não altera o estado (RNF-09/RNF-14).

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-012-01 | Candidato consulta suas candidaturas | Somente registros próprios são apresentados |
| T-012-02 | Candidato tenta consultar candidatura de outra pessoa | Acesso negado sem revelar os dados |
| T-012-03 | Candidatura em `Inscrita`, `Triagem`, `Entrevista` ou `Finalista`, com vaga não encerrada/bloqueada | Após confirmação, cancelamento é registrado e histórico preservado |
| T-012-04 | Candidatura em `Contratado`, `Recusado` ou já cancelada | Operação recusada e estado mantido |
| T-012-08 | Vaga encerrada ou bloqueada de forma que impeça cancelamento | Operação recusada sem alteração de estado |
| T-012-05 | Duas solicitações de cancelamento concorrentes | Não ocorre duplicação nem corrupção do estado |
| T-012-06 | Cancelamento concluído | Estado atualizado fica disponível para acompanhamento/notificação |
| T-012-07 | Histórico é consultado após cancelamento | Eventos anteriores continuam disponíveis conforme retenção aprovada |
| T-012-09 | Candidato consulta a linha do tempo | Eventos aplicáveis são exibidos com data, descrição breve e status/etapa resultante quando aplicável, do mais recente para o mais antigo |
| T-012-10 | Candidato tenta consultar histórico de outra pessoa ou dados internos restritos | Acesso negado ou conteúdo restrito não é exposto |
| T-012-11 | Histórico funcional deixa de ser exibido após o prazo aplicável | A retenção técnica de auditoria permanece independente da exibição funcional |

## 13. Questões em aberto
OPEN-050, OPEN-051 e OPEN-052 foram resolvidas e registradas em `docs/OPEN.md`.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-013 — Gerenciar processo seletivo e funil

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-013 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Gerenciar processo seletivo e funil |

## 2. Rastreabilidade
- **Baseline:** RF-20, RF-30, RF-35; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-001, 005, 011.
- **Caso de uso:** UC-09 — Gerenciar Funil de Seleção.
- **Questões:** OPEN-055 e OPEN-056 resolvidas. O Recrutador acessa apenas os dados necessários à candidatura e à vaga sob sua responsabilidade, com informações de acessibilidade limitadas à necessidade do processo; não acessa laudos médicos nem candidaturas de outras Empresas, e a etapa não amplia permissões automaticamente. O histórico de movimentações registra etapa anterior/resultante, data e hora, ator responsável e tipo de movimentação/decisão, além de justificativa quando exigida. Eventos anteriores são preservados e reversões fora da RB-39 não são permitidas. OPEN-053 definiu UC-09 como referência para gestão do funil pelo Recrutador, mantendo UC-05 para acompanhamento pelo candidato; OPEN-054 definiu as condições de avanço sem criar critérios adicionais por etapa.

## 3. Escopo
Recrutador autorizado consulta candidaturas das próprias vagas; solicita mudança de etapa; backend valida transição e condições de avanço; registra estado, decisão e histórico.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Painel de candidaturas | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Visão do funil | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Detalhe da candidatura | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Alteração de etapa | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 005, 011. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Recrutador autenticado acessa candidaturas somente das vagas da Empresa a que está vinculado e autorizado.
2. Sistema apresenta candidaturas e etapa atual, limitando os dados do candidato ao necessário para a candidatura e a vaga sob responsabilidade do Recrutador. Informações de acessibilidade só são disponibilizadas na medida necessária ao processo; não são exibidos laudos médicos nem candidaturas de outras Empresas. A etapa não amplia automaticamente as permissões.
3. Recrutador seleciona uma candidatura e solicita mudança de etapa.
4. O backend valida que o Recrutador está autenticado e autorizado a gerenciar a vaga, que a transição está prevista na RB-39 e que não há pendências impeditivas conhecidas para o avanço.
5. Se houver pendência impeditiva, o sistema não altera a etapa e permite ao Recrutador solicitar a complementação das informações necessárias, conforme UC-09. Transição não prevista ou não autorizada é recusada sem alteração de estado.
6. Transição válida atualiza etapa e histórico, mantendo a rastreabilidade conforme RB-27, RB-37 e RB-41. O evento registra etapa anterior e resultante, data e hora, ator responsável e tipo de movimentação/decisão; a justificativa é registrada quando exigida pelo fluxo ou regra aplicável. Eventos anteriores são preservados sem exclusão silenciosa, e reversões fora das transições previstas na RB-39 são recusadas.

## 6. Regras e invariantes
- Transições padronizadas: Inscrito→Triagem; Triagem→Entrevista/Recusado; Entrevista→Finalista/Recusado; Finalista→Contratado/Recusado. Antes de alterar a etapa, validar autorização do Recrutador, transição prevista na RB-39 e ausência de pendências impeditivas conhecidas. Transições não autorizadas ou inválidas e avanços com pendências impeditivas são recusados sem alterar a etapa. Dados visíveis conforme autorização e necessidade da candidatura, sem acesso a laudos médicos ou candidaturas de outras Empresas; a etapa não amplia automaticamente as permissões. O histórico registra etapa anterior/resultante, data e hora, ator responsável e tipo de movimentação/decisão, com justificativa quando exigida, preservando eventos anteriores sem exclusão silenciosa. Reversões fora da RB-39 são proibidas; mudanças futuras do fluxo dependem de aprovação explícita do projeto.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-20, RF-30; RB-12, RB-27, RB-38, RB-39, RB-41, RB-43; CANDIDATURA, CANDIDATO, VAGA, ENTREVISTA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Listar candidaturas da organização:** retorna somente candidaturas das vagas da Empresa vinculada ao Recrutador autenticado e autorizado.
- **Consultar funil e candidatura:** apresenta etapa atual e dados permitidos ao perfil, conforme RB-26.
- **Solicitar transição:** recebe candidatura e etapa de destino; não confia em autorização ou estado enviados pelo cliente.
- **Validar transição:** verifica a autorização do Recrutador, se a transição consta na RB-39 e se existem pendências impeditivas conhecidas para o avanço; não cria critérios específicos por etapa que não estejam definidos na baseline.
- **Persistir transição:** atualiza etapa e histórico apenas se válida; retorna recusa sem alteração em caso inválido.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Recrutador só consulta e altera candidaturas de vagas da Empresa à qual está vinculado e autorizado.
- [ ] O backend valida autorização do Recrutador, transição prevista na RB-39 e ausência de pendências impeditivas conhecidas antes de avançar.
- [ ] Pendência impeditiva impede a mudança de etapa e permite solicitar complementação; não são presumidos critérios específicos adicionais por etapa.
- [ ] Transição recusada não altera etapa; transição concluída registra mudança rastreável (RNF-07/RNF-09/RNF-14).

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-013-01 | Recrutador autorizado consulta funil da própria Empresa | São exibidas apenas candidaturas de vagas autorizadas |
| T-013-02 | Recrutador tenta consultar vaga de outra Empresa | Acesso negado |
| T-013-03 | Transição Inscrito→Triagem solicitada por Recrutador autorizado, sem pendência impeditiva | Transição aceita se a autorização e as demais pré-condições forem válidas |
| T-013-04 | Transição fora do fluxo padronizado solicitada | Transição recusada sem alterar estado ou histórico |
| T-013-08 | Recrutador não autorizado solicita transição | Operação recusada sem alterar etapa ou histórico |
| T-013-09 | Há pendência impeditiva conhecida para o avanço | Etapa não é alterada; Recrutador pode solicitar complementação das informações necessárias |
| T-013-05 | Transição válida é persistida | Etapa e evento de histórico são atualizados de forma íntegra |
| T-013-06 | Dados de candidato não necessários à etapa são solicitados | Dados protegidos não são expostos |
| T-013-07 | Falha ocorre durante a alteração | Estado anterior é preservado; não há transição parcial |

## 13. Questões em aberto
OPEN-055 e OPEN-056 foram resolvidas e estão registradas em `docs/OPEN.md`. O acesso do Recrutador é limitado pela finalidade e necessidade durante todas as etapas; o histórico de movimentações registra etapa anterior/resultante, data e hora, ator responsável e tipo de movimentação/decisão, com justificativa quando exigida, preservando eventos anteriores e proibindo reversões fora da RB-39. A OPEN-053 definiu UC-09 como referência para gestão do funil pelo Recrutador, enquanto UC-05 cobre o acompanhamento pelo candidato. A OPEN-054 definiu autorização, transição prevista na RB-39 e ausência de pendências impeditivas, sem criar critérios específicos adicionais por etapa.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


<!-- SPEC-014 e SPEC-015 removidas do escopo por decisão do projeto. -->

# SPEC-016 — Acompanhar candidatura e processo seletivo

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-016 |
|
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Acompanhar candidatura e processo seletivo |

## 2. Rastreabilidade
- **Baseline:** RF-11, RF-27, RF-31; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-011 a SPEC-013.
- **Caso de uso:** UC-05 — Acompanhar Funil de Candidaturas.
- **Questões abertas:** OPEN-065.

## 3. Escopo
Listar candidaturas próprias; apresentar status/etapa atual e linha do tempo; refletir cancelamento e encerramento sem confundir eventos antigos com estado atual.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Painel de acompanhamento | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Linha do tempo | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Detalhes da etapa | Apoiar a consulta de status e histórico da candidatura | Pendente |
| Estado encerrado/cancelado | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-011 a 015. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Candidato autenticado consulta somente candidaturas próprias.
2. Sistema apresenta etapa/status atual e a vaga correspondente.
3. Após cancelamento da candidatura ou encerramento da vaga, o histórico funcional permanece disponível ao candidato por 60 dias, contados do evento aplicável; depois desse prazo, deixa de ser exibido no acompanhamento. A regra não altera a retenção dos registros técnicos de auditoria.
3. Sistema apresenta a linha do tempo com os eventos históricos e suas datas, distinguindo histórico de estado atual.
4. Os tipos de evento exibidos são “Candidatura realizada”, “Status” e “Candidatura cancelada”, quando aplicáveis.
5. O tipo “Status” pode representar estados gerais do processo, como “Em andamento”, “Entrevista” e “Aprovado”.
6. Cada evento apresenta data (sem exigir horário na interface), tipo de evento, descrição breve e compreensível e status ou etapa resultante, quando aplicável. Os eventos são ordenados do mais recente para o mais antigo.
7. Se não houver evento histórico disponível, o sistema informa a ausência de histórico sem inventar eventos.
5. Cancelamento ou encerramento da vaga é refletido no acompanhamento conforme registro oficial.
6. O fluxo é somente de consulta; não altera etapa ou decisão do processo.

## 6. Regras e invariantes
- Apenas processos próprios; histórico preservado; não altera etapas nem decisões.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-11, RF-27, RF-31; RB-23, RB-27, RB-36, RB-38, RB-39, RB-41, RB-42; CANDIDATURA, VAGA, ENTREVISTA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Listar acompanhamento próprio:** retorna candidaturas vinculadas ao candidato autenticado.
- **Consultar estado atual:** obtém etapa/status oficial da candidatura na capacidade responsável pelo processo.
- **Consultar linha do tempo:** retorna eventos persistidos e datas disponíveis, distinguindo eventos históricos do estado vigente.
- **Consultar encerramento/cancelamento:** apresenta a mudança registrada sem reescrever eventos anteriores.
- **Não alterar processo:** esta Spec é de consulta; mudanças de candidatura ou etapa são realizadas pelas Specs responsáveis.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] O candidato consulta apenas o próprio histórico e dados compatíveis com sua autorização (RNF-07/RNF-08).
- [ ] Eventos apresentados correspondem aos registros persistidos e não são duplicados ou alterados silenciosamente (RNF-09/RNF-14).

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-016-01 | Candidato abre acompanhamento | Lista somente candidaturas próprias |
| T-016-02 | Candidato seleciona candidatura | Estado atual e vaga correspondente são apresentados |
| T-016-03 | Há eventos históricos registrados | Linha do tempo apresenta os eventos disponíveis sem alterar sua ordem factual |
| T-016-04 | Candidatura foi cancelada ou vaga encerrada | Estado atual reflete o registro correspondente e o histórico anterior permanece |
| T-016-05 | Candidato tenta acessar acompanhamento alheio | Acesso negado |
| T-016-06 | Usuário tenta alterar etapa pelo acompanhamento | Nenhuma alteração é realizada por esta capacidade |

## 13. Questões em aberto
Consultar OPEN-063 a OPEN-065 em `docs/OPEN.md`. As questões permanecem abertas até decisão explícita do grupo.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-017 — Notificar alterações do processo seletivo

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-017 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Notificar alterações do processo seletivo |

## 2. Rastreabilidade
- **Baseline:** RF-12, RF-27; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-009, 011 a 016.
- **Caso de uso:** Fluxos de notificação referenciados por UC-03, UC-05 e UC-09; canal de envio definido na OPEN-067.
- **Decisões relacionadas:** OPEN-067 a OPEN-069, com decisões registradas.

## 3. Escopo
Diante de alteração relevante, identificar destinatários autorizados, preparar e enviar comunicação pelo canal aprovado, registrar resultado conforme política; falha no envio não reverte alteração de domínio.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Não haverá central nem histórico separado de notificações enviadas. O candidato acompanha os acontecimentos do processo na linha do tempo da candidatura, conforme SPEC-016/OPEN-065 | Consultar os eventos e o status oficial da candidatura; a linha do tempo não representa uma lista de e-mails enviados | Não se aplica ao escopo atual |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-009, 011 a 016. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Uma capacidade de origem persiste um evento confirmado relevante.
2. Geram notificação obrigatória: registro de candidatura, para confirmar ao candidato; mudança relevante de etapa/status, incluindo avanço, reprovação ou outra atualização pertinente, para o candidato; agendamento, alteração ou cancelamento de entrevista, quando a operação ocorrer pela plataforma, para o candidato; cancelamento da candidatura pelo candidato, para o Recrutador responsável; e encerramento da vaga, para os candidatos ainda ativos conforme RB-42.
3. A regra geral é notificar quando um evento confirmado alterar a participação do candidato no processo ou exigir ciência do responsável pela vaga.
4. Sistema identifica apenas destinatários autorizados e relacionados ao evento.
5. Sistema prepara comunicação com o mínimo de dados necessário, sem expor dados privados de terceiros.
6. Sistema envia as notificações obrigatórias por e-mail. O usuário não pode desativar essas comunicações.
7. O envio é solicitado assim que o evento de origem é confirmado. Em caso de falha temporária, o sistema tenta novamente automaticamente, com intervalos crescentes. Se todas as tentativas falharem, registra a falha para identificação e acompanhamento. A quantidade exata de tentativas, os intervalos e os critérios técnicos para classificar falhas serão detalhados na implementação, conforme OPEN-068. Não haverá central nem histórico separado de notificações enviadas no escopo atual. O candidato consulta os acontecimentos da candidatura na linha do tempo funcional, conforme SPEC-016/OPEN-065, disponível por 60 dias após o cancelamento da candidatura ou o encerramento da vaga, conforme o evento ocorrido. Essa linha do tempo não é uma lista de e-mails enviados. Os registros técnicos de envio e falhas seguem a auditoria da OPEN-006, com retenção de 1 ano.
8. Falha no envio não desfaz a alteração de domínio, e o usuário pode consultar o estado oficial na capacidade de origem/acompanhamento.

## 6. Regras e invariantes
- Destinatário autorizado; conteúdo mínimo; encerramento informa candidatos ativos; notificação não substitui estado atual nem altera estado por si só.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.
- Não haverá central nem histórico separado de notificações enviadas no escopo atual. A linha do tempo funcional da candidatura segue a SPEC-016/OPEN-065 e fica disponível por 60 dias após o cancelamento da candidatura ou o encerramento da vaga, conforme o evento ocorrido; ela não é uma lista de e-mails enviados. Os registros técnicos de envio e falhas seguem a auditoria da OPEN-006, com retenção de 1 ano.

## 7. Modelo de domínio
RF-12, RF-27; RB-23, RB-27, RB-37, RB-41, RB-42; CANDIDATURA, VAGA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Receber evento de origem:** consome alteração relevante registrada por uma capacidade de domínio, sem ser a fonte oficial do estado.
- **Determinar destinatários:** resolve somente pessoas autorizadas relacionadas ao evento e à candidatura.
- **Preparar mensagem:** usa conteúdo mínimo necessário e não inclui dados privados de terceiros.
- **Solicitar envio:** envia a notificação obrigatória por e-mail, conforme a decisão registrada na OPEN-067.
- **Registrar resultado:** registra o resultado do envio e, se todas as tentativas falharem, a falha para identificação e acompanhamento; esses registros técnicos seguem a auditoria da OPEN-006, com retenção de 1 ano. Falha de entrega não desfaz a alteração original.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Cada um dos cinco tipos de evento aprovados em OPEN-066 gera comunicação ao destinatário definido para esse evento.
- [ ] Notificação é disparada apenas para destinatário autorizado e não expõe dados de outro candidato (RNF-07/RNF-08).
- [ ] Falhas de envio não apagam a alteração de origem nem geram falsa confirmação de entrega (RNF-09/RNF-14, quando aplicável).

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-017-01 | Evento relevante ocorre e há destinatário autorizado | É preparada notificação relacionada ao evento |
| T-017-02 | Usuário não relacionado tenta receber dados do evento | Notificação não é enviada a destinatário não autorizado |
| T-017-03 | Serviço de e-mail indisponível ou não configurado | O sistema trata a falha sem desfazer a alteração original nem informar falsamente que a notificação foi entregue; se a falha for temporária, solicita novas tentativas automáticas |
| T-017-04 | Todas as tentativas de envio falham | A falha final fica registrada para identificação e acompanhamento; não é apresentada como entrega confirmada e o estado de origem permanece |
| T-017-05 | Vaga é encerrada com candidatos ativos | A obrigação de informar candidatos ativos é acionada, respeitando canal/prazo ainda a definir |
| T-017-06 | Notificação é recebida | Usuário é orientado a consultar o estado oficial na área de acompanhamento |
| T-017-07 | Candidatura é registrada ou muda de etapa/status | Candidato recebe a notificação correspondente |
| T-017-08 | Entrevista é agendada, alterada ou cancelada por operação da plataforma | Candidato recebe a notificação correspondente |
| T-017-09 | Candidato cancela a candidatura | Recrutador responsável recebe a notificação |
| T-017-10 | Vaga é encerrada com candidatos ativos | Candidatos ativos são identificados para comunicação conforme RB-42 |

## 13. Questões em aberto
Consultar OPEN-068 e OPEN-069 em `docs/OPEN.md`. Os eventos obrigatórios e o envio por e-mail estão definidos pelas decisões OPEN-066 e OPEN-067; as questões restantes permanecem abertas até decisão explícita do grupo.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-018 — Avaliar processo seletivo

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-018 |
|
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Avaliar processo seletivo |

## 2. Rastreabilidade
- **Baseline:** RF-21; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-001, 011, 016.
- **Caso de uso:** UC-06 — Avaliar Pós-Entrevista.
- **Questões abertas:** OPEN-073 foi resolvida: publicar somente distribuição agregada por quantidade de estrelas, não publicar comentários individuais, restringir acesso aos registros individuais e reter esses registros por 1 ano após o envio. OPEN-072 também foi resolvida: uma avaliação por candidato por entrevista concluída, sem edição/substituição, com rejeição de duplicatas e registro/encaminhamento administrativo de indícios relevantes de abuso.

## 3. Escopo
Candidato elegível registra avaliação com campos definidos na baseline; o sistema valida associação e conteúdo, armazena registros individuais com acesso restrito por 1 ano após o envio e disponibiliza para a nota pública somente a distribuição agregada das avaliações válidas por quantidade de estrelas. Comentários individuais não são publicados; a distribuição agregada pode ser mantida por prazo indeterminado apenas se não permitir reconstruir avaliações individuais nem identificar candidatos.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Formulário de avaliação | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Confirmação | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Consulta de avaliação própria, se prevista | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 011, 016. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Somente candidato autenticado com candidatura vinculada a entrevista cadastrada e concluída pode avaliar o processo de que participou; a elegibilidade independe de contratação ou rejeição.
2. A avaliação deve ser enviada em até 60 dias corridos após a conclusão da entrevista. Após esse prazo, novas submissões para essa entrevista são recusadas.
3. O sistema valida no backend a associação entre o candidato autenticado, a candidatura e a entrevista, além do prazo de elegibilidade e da inexistência de avaliação anterior para aquela entrevista pelo mesmo candidato.
4. Sistema apresenta dois critérios separados: acessibilidade e postura inclusiva, cada um avaliado em escala de 1 a 5 estrelas.
5. Candidato informa obrigatoriamente uma nota em estrelas para cada critério e pode incluir comentário opcional; antes do envio, pode revisar os dados preenchidos.
6. Sistema valida presença e faixa das duas notas, valida o comentário quando informado e valida o vínculo com a candidatura/entrevista correspondente, incluindo a janela de 60 dias corridos.
7. Após o envio bem-sucedido, a avaliação é registrada com acesso individual restrito a pessoas autorizadas para finalidades legítimas da plataforma. Para a SPEC-021, são disponibilizados apenas dados válidos necessários à distribuição agregada por quantidade de estrelas; não são publicados comentários individuais, identidade ou identificadores dos candidatos. O registro individual e seu comentário opcional são retidos por 1 ano após o envio e, ao fim do prazo, excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação.
8. Cada candidato pode registrar uma única avaliação por entrevista concluída, vinculada à candidatura correspondente. Submissões duplicadas são recusadas; a avaliação não pode ser editada nem substituída após o envio. Eventuais denúncias ou indícios relevantes de abuso são registrados e encaminhados para análise administrativa, sem bloqueio automático.
9. A avaliação não altera diretamente a nota pública nesta capacidade.

## 6. Regras e invariantes
- Só avaliação válida participa da nota; identidade e comentários individuais não são públicos; a nota pública apresenta somente distribuição agregada por quantidade de estrelas. Registros individuais e comentários opcionais têm acesso restrito a pessoas autorizadas para finalidades legítimas da plataforma e são retidos por 1 ano após o envio; ao fim do prazo, são excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação. A distribuição agregada pode ser mantida por prazo indeterminado se não permitir reconstrução de avaliações individuais nem identificação. A avaliação não altera nota diretamente nesta Spec; registrar auditoria. O limite é uma avaliação por candidato por entrevista concluída; duplicatas são recusadas e a avaliação enviada não pode ser editada ou substituída. Eventos relevantes e indícios pertinentes de abuso são registrados/encaminhados para análise administrativa, sem bloqueio automático.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-21; RB-19, RB-20, RB-27, RB-37, RB-41; ENTREVISTA, AVALIACAO_POS_ENTREVISTA, CANDIDATURA, EMPRESA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Consultar elegibilidade:** verifica se o candidato autenticado possui candidatura vinculada à entrevista cadastrada e concluída e se a submissão ocorre em até 60 dias corridos após a conclusão da entrevista.
- **Apresentar formulário:** disponibiliza os critérios separados de acessibilidade e postura inclusiva, cada um com escala de 1 a 5 estrelas, duas notas obrigatórias e comentário opcional.
- **Validar submissão:** verifica que as duas notas obrigatórias estão presentes e dentro da escala de 1 a 5 estrelas, valida o comentário se informado, confirma o vínculo com a candidatura/entrevista correspondente e verifica se o mesmo candidato já avaliou aquela entrevista.
- **Registrar avaliação:** persiste avaliação válida com controles de integridade e confidencialidade; recusa submissão duplicada e não permite edição ou substituição após o registro.
- **Registrar e encaminhar indícios de abuso:** registra eventos relevantes e encaminha indícios pertinentes para análise administrativa, sem bloqueio automático nem alteração automática da avaliação ou da distribuição pública.
- **Disponibilizar dados válidos:** entrega à SPEC-021 somente os dados necessários à distribuição agregada por quantidade de estrelas, sem publicar identidade, identificadores ou comentários individuais. O acesso aos registros individuais é restrito a pessoas autorizadas para finalidades legítimas da plataforma.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Apenas candidato elegível registra avaliação associada ao processo correspondente.
- [ ] As notas de acessibilidade e postura inclusiva são campos separados e obrigatórios, cada uma de 1 a 5 estrelas.
- [ ] O comentário pode ficar vazio; quando informado, é validado.
- [ ] Após o envio, o candidato não consegue editar nem substituir a avaliação; uma segunda avaliação do mesmo candidato para a mesma entrevista é recusada.
- [ ] Eventos relevantes são registrados e indícios pertinentes de abuso podem ser encaminhados para análise administrativa, sem bloqueio automático nem alteração automática da avaliação/distribuição pública.
- [ ] A apresentação pública mostra somente distribuição agregada por quantidade de estrelas e não expõe identidade, identificadores ou comentários individuais; avaliação inválida não alimenta a nota pública (RNF-08/RNF-09).
- [ ] Registros individuais e comentários opcionais têm acesso restrito e são excluídos ou irreversivelmente anonimizados após 1 ano do envio, respeitando obrigações aplicáveis de preservação.
- [ ] A distribuição agregada só é mantida por prazo indeterminado se não permitir reconstruir avaliações individuais nem identificar candidatos.

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-018-01 | Candidato elegível envia avaliação completa | Avaliação é registrada e disponibilizada para agregação |
| T-018-02 | Candidato não elegível tenta avaliar | Submissão é recusada |
| T-018-07 | Candidato elegível envia avaliação até 60 dias corridos após a conclusão da entrevista | Submissão pode prosseguir, sujeita às demais validações aprovadas |
| T-018-08 | Candidato tenta enviar avaliação após 60 dias corridos da conclusão da entrevista | Nova submissão para essa entrevista é recusada |
| T-018-03 | Avaliação não está vinculada ao processo correspondente | Submissão é recusada |
| T-018-04 | Uma ou ambas as notas obrigatórias estão ausentes | Sistema indica validação e não registra avaliação inválida |
| T-018-05 | Uma das notas está fora da escala de 1 a 5 estrelas | Sistema recusa a submissão e informa a validação |
| T-018-06 | Comentário não foi informado | Submissão pode prosseguir se os demais campos e regras forem válidos |
| T-018-09 | Candidato tenta editar ou reenviar uma avaliação já registrada | Sistema não permite alterar a avaliação enviada |
| T-018-10 | Avaliação é consultada em contexto público | Somente a distribuição agregada por quantidade de estrelas é exposta; identidade, identificadores e comentários individuais não são publicados |
| T-018-13 | Registro individual completa 1 ano desde o envio | Registro individual e comentário opcional são excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação |
| T-018-14 | Distribuição agregada não permite reconstruir registros individuais nem identificar candidatos | Distribuição pode ser mantida por prazo indeterminado |
| T-018-11 | Candidato tenta registrar segunda avaliação para a mesma entrevista | Submissão duplicada é recusada sem substituir a avaliação existente |
| T-018-12 | Há indício relevante de abuso relacionado à avaliação | Evento é registrado e encaminhado para análise administrativa, sem bloqueio automático ou alteração automática da avaliação/distribuição pública |

## 13. Questões em aberto
OPEN-070 foi resolvida: elegibilidade restrita a candidato autenticado vinculado à candidatura/entrevista concluída, com prazo de 60 dias corridos após a conclusão. OPEN-071 foi resolvida: duas notas obrigatórias e separadas (acessibilidade e postura inclusiva), cada uma de 1 a 5 estrelas, comentário opcional e impossibilidade de edição após envio. OPEN-072 foi resolvida: uma avaliação por candidato por entrevista concluída, sem edição/substituição, com rejeição de duplicatas e registro/encaminhamento administrativo de indícios relevantes de abuso, sem bloqueio automático. OPEN-073 foi resolvida: publicação apenas da distribuição agregada por quantidade de estrelas, sem comentários individuais, acesso restrito aos registros individuais e retenção por 1 ano após o envio; agregados só podem ser mantidos indefinidamente se não permitirem reconstrução ou identificação.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-019 — Denunciar incompatibilidade ou falsa inclusão

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-019 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Denunciar incompatibilidade ou falsa inclusão |

## 2. Rastreabilidade
- **Baseline:** RF-14; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-001, 018, 020.
- **Caso de uso:** UC-11 — Denunciar Vaga Incompatível.
- **Questões abertas:** OPEN-075 a OPEN-077. OPEN-074 resolvida: elegibilidade e circunstâncias de denúncia definidas.

## 3. Escopo
Candidato autenticado com acesso à vaga pode registrar denúncia sobre possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga. O sistema valida e encaminha para moderação, confirmando o registro sem antecipar conclusão.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Formulário de denúncia | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Confirmação de registro | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Consulta de andamento, se prevista | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 018, 020. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Candidato autenticado com acesso à vaga seleciona a vaga e registra denúncia sobre possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga.
2. Sistema valida autenticação, referência válida à vaga e controles antiabuso existentes. Campos/evidências adicionais e limites de frequência permanecem nas OPEN-075 e OPEN-076.
3. Denúncia é registrada e encaminhada à moderação.
4. Sistema confirma o registro sem antecipar a decisão.
5. O registro da denúncia não bloqueia vaga nem altera nota automaticamente.
6. Estado e informações são expostos apenas conforme política de confidencialidade aprovada.

## 6. Regras e invariantes
- Somente candidato autenticado com acesso à vaga pode registrar denúncia.
- As situações elegíveis são possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga.
- Denúncia não comprova irregularidade, não bloqueia vaga nem altera nota automaticamente; Administrador analisa antes de qualquer consequência; aplicam-se os controles antiabuso existentes.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-14; RB-24, RB-25, RB-27, RB-37, RB-44, RB-45; DENUNCIA_FALSA_INCLUSAO, AVALIACAO_POS_ENTREVISTA, EMPRESA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Registrar denúncia:** recebe vaga referenciada, motivo e descrição permitidos pela baseline.
- **Validar solicitação:** verifica autenticação do candidato, referência válida à vaga acessível ao candidato e controles antiabuso existentes, sem inventar limites numéricos.
- **Persistir e encaminhar:** registra a denúncia e disponibiliza-a à fila de moderação.
- **Confirmar recebimento:** informa que a denúncia foi registrada, sem antecipar o resultado da análise.
- **Restringir consulta:** expõe andamento e conteúdo somente conforme a política de confidencialidade que o grupo aprovar.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Denúncia é acessível apenas a atores autorizados e o registro não publica identidade ou conteúdo privado indevidamente (RNF-07/RNF-08).
- [ ] Registrar denúncia não bloqueia automaticamente vaga nem altera a nota antes da análise administrativa.

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-019-01 | Candidato autenticado com acesso à vaga denuncia possível incompatibilidade de acessibilidade ou possível falsa inclusão | Denúncia é registrada e encaminhada à moderação |
| T-019-02 | Usuário não autenticado tenta denunciar | Operação recusada |\n| T-019-07 | Candidato autenticado tenta denunciar vaga à qual não tem acesso | Operação recusada ou referência não aceita; nenhuma denúncia é associada incorretamente |
| T-019-03 | Referência à vaga é inválida ou não acessível | Denúncia não é associada incorretamente |
| T-019-04 | Denúncia é registrada | Confirmação não promete decisão nem sanção |
| T-019-05 | Denúncia está pendente | Vaga e nota não são alteradas automaticamente |
| T-019-06 | Usuário sem permissão consulta conteúdo restrito | Conteúdo e identidade protegidos não são expostos |

## 13. Questões em aberto
OPEN-074 foi resolvida: somente candidato autenticado com acesso à vaga pode denunciar possível incompatibilidade relacionada à acessibilidade ou possível falsa inclusão associada à vaga. Consultar OPEN-075 a OPEN-077 em `docs/OPEN.md`; essas questões permanecem abertas até decisão explícita do grupo.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-020 — Moderar denúncias de incompatibilidade

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-020 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Moderar denúncias de incompatibilidade |

## 2. Rastreabilidade
- **Baseline:** RF-22; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-001, 019, 021.
- **Caso de uso:** UC-11 — Denunciar Vaga Incompatível (fluxo de análise administrativa).
- **Questões abertas:** OPEN-078 a OPEN-081.

## 3. Escopo
Administrador da plataforma consulta fila e contexto autorizado, analisa e registra decisão/fundamento; efeitos autorizados são encaminhados às capacidades correspondentes.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Fila de moderação | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Detalhe da denúncia | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Registro de decisão | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Histórico de moderação | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-001, 019, 021. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Administrador autenticado da plataforma acessa fila de denúncias.
2. Sistema verifica o papel de Administrador da plataforma; Recrutadores não recebem essa permissão por vínculo com Empresa.
3. Administrador consulta denúncia e contexto autorizado, analisa e registra decisão.
4. Sistema persiste decisão e responsável, mantendo histórico.
5. Efeito sobre vaga ou nota só ocorre quando explicitamente autorizado pela decisão e pelas regras aplicáveis.
6. Denúncia sem decisão não altera nota nem bloqueia vaga.

## 6. Regras e invariantes
- Só Administrador da plataforma modera; denúncia sem decisão não gera sanção; nota/status só mudam após decisão autorizadora e registro.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-22; RB-24, RB-25, RB-27, RB-37, RB-41, RB-44, RB-45; ADMINISTRADOR, DENUNCIA_FALSA_INCLUSAO, AVALIACAO_POS_ENTREVISTA, EMPRESA. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Listar fila de moderação:** permite consulta somente ao Administrador autenticado da plataforma.
- **Consultar denúncia e contexto:** retorna somente dados pertinentes e autorizados para análise.
- **Registrar decisão:** guarda decisão e fundamento nos limites do catálogo que o grupo aprovar; o catálogo continua em OPEN-079.
- **Aplicar efeito autorizado:** encaminha alterações somente quando a decisão registrada e as regras aplicáveis permitirem.
- **Consultar histórico de moderação:** permite auditoria das decisões e efeitos, com acesso controlado.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Operações de moderação são recusadas para Recrutador ou Empresa sem papel de Administrador da plataforma.
- [ ] Decisão e alterações decorrentes são rastreáveis; denúncia não analisada não provoca bloqueio nem alteração automática da nota (RNF-07/RNF-09/RNF-14).

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-020-01 | Administrador da plataforma consulta fila | Fila disponível conforme autorização |
| T-020-02 | Recrutador ou Empresa tenta moderar | Operação recusada |
| T-020-03 | Administrador analisa denúncia e registra decisão | Decisão, responsável e histórico são persistidos |
| T-020-04 | Denúncia não possui decisão registrada | Não há bloqueio nem alteração automática da nota |
| T-020-05 | Decisão não autoriza determinado efeito | Efeito não é aplicado |
| T-020-06 | Efeito autorizado é aplicado | Alteração e relação com a decisão são rastreáveis |
| T-020-07 | Usuário sem permissão consulta dados da moderação | Acesso negado ou conteúdo restrito conforme política aprovada |

## 13. Questões em aberto
Consultar OPEN-078 a OPEN-081 em `docs/OPEN.md`. As questões permanecem abertas até decisão explícita do grupo.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


# SPEC-021 — Gerenciar nota pública de acessibilidade

## 1. Identificação
| Campo | Valor |
|---|---|
| ID | SPEC-021 |
| Estado do texto | especificada |
| Estado do layout | pendente |
| Capacidade | Gerenciar nota pública de acessibilidade |

## 2. Rastreabilidade
- **Baseline:** RF-13; requisitos e regras correlatos conforme mapa de Specs.
- **Dependências:** SPEC-004, 018, 020.
- **Caso de uso:** Capacidade de nota pública; dependências em SPEC-004, SPEC-018 e SPEC-020.
- **Questões abertas:** OPEN-082 a OPEN-085.

## 3. Escopo
Exibir somente a distribuição agregada da frequência das avaliações válidas por quantidade de estrelas, sem identidade, identificadores ou comentários individuais; quando não houver avaliações válidas, não exibir nota e informar dados insuficientes; refletir decisão de moderação somente após decisão registrada e conforme efeito autorizado. Os registros individuais e comentários opcionais ficam restritos a pessoas autorizadas para finalidades legítimas da plataforma e são retidos por 1 ano após o envio. A distribuição agregada pode ser mantida por prazo indeterminado apenas se não permitir reconstruir avaliações individuais nem identificar candidatos.

## 3.1. Telas e evidência de layout
| Área/tela | Finalidade | Layout |
|---|---|---|
| Nota pública da Empresa | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Explicação/fatores da nota, se definidos | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |
| Estado sem dados suficientes | Apoiar a ação indicada pela área/tela, com estados, validações e retorno do fluxo descritos nesta Spec | Pendente ou não se aplica conforme a área |

O layout funcional é uma evidência visual/protótipo, não código. Deve ser aprovado separadamente quando houver interface própria.

## 4. Dependências
SPEC-004, 018, 020. As dependências fornecem dados e capacidades; esta Spec não duplica regras pertencentes a outras Specs.

## 5. Comportamento esperado
1. Sistema recupera somente dados registrados e válidos para cálculo.
2. Apresenta a frequência de avaliações válidas por quantidade de estrelas, sem calcular média ou pesos não aprovados.
3. Sistema preserva o anonimato público e apresenta somente a distribuição agregada por quantidade de estrelas; não publica comentários individuais, identidade ou identificadores dos candidatos. Registros individuais e comentários opcionais têm acesso restrito a pessoas autorizadas para finalidades legítimas da plataforma.
4. Uma avaliação válida é suficiente para apresentar a distribuição; sem avaliações válidas, não exibe nota e informa dados insuficientes.
5. A administração da plataforma atua sobre denúncias; não edita avaliações nem altera diretamente a distribuição pública de estrelas.
6. Cálculos e alterações de avaliações válidas são rastreáveis.

## 6. Regras e invariantes
- A nota/distribuição é baseada nas avaliações válidas; administradores não editam avaliações nem alteram diretamente a distribuição; dados ausentes não são afirmação positiva/negativa; cálculo e alterações rastreáveis.
- Não presumir campos, estados, canais, fórmulas ou políticas não definidos na baseline; lacunas permanecem em OPEN.md.
- Operações protegidas são validadas no backend.
- Dados pessoais e de acessibilidade são disponibilizados somente a usuários autorizados e para a finalidade necessária.
- Alterações relevantes devem ser rastreáveis conforme RB/RNF aplicáveis.

## 7. Modelo de domínio
RF-13; RB-08, RB-19, RB-20, RB-25, RB-27, RB-37, RB-45; EMPRESA, INFRAESTRUTURA_EMPRESA, AVALIACAO_POS_ENTREVISTA, DENUNCIA_FALSA_INCLUSAO. A estrutura e atributos não explicitamente descritos no modelo conceitual não são criados por suposição.

## 8. Impacto arquitetural
A capacidade mantém separação entre interface, regras de domínio e persistência. A autorização e as validações críticas são feitas no backend. Integrações com outras Specs ocorrem por contratos conceituais, sem impor endpoints, frameworks, banco ou provedores não decididos.

## 9. Contratos necessários
- **Consultar avaliações válidas:** recupera avaliações registradas e elegíveis para construir a distribuição agregada, sem expor autores, identificadores ou comentários individuais no contexto público. O acesso aos registros individuais é restrito a pessoas autorizadas para finalidades legítimas da plataforma.
- **Construir distribuição de estrelas:** apresenta a frequência de avaliações válidas em cada quantidade de estrelas; não inventa média, pesos ou fórmula adicional.
- **Verificar suficiência:** uma avaliação válida é suficiente para exibir a distribuição; quando não houver dados válidos, não exibe nota e informa que os dados são insuficientes.
- **Encaminhar resultado da moderação:** mantém a decisão administrativa vinculada à denúncia; não edita avaliações nem altera diretamente a distribuição pública de estrelas.
- **Registrar atualização:** mantém rastreabilidade da distribuição publicada e das alterações autorizadas.

Contratos conceituais; não definem endpoints HTTP.

## 10. RNFs aplicáveis
RNFs relacionados na rastreabilidade, em especial segurança, privacidade, integridade, acessibilidade e auditoria conforme a interface e a operação. Os critérios quantitativos não são inventados quando ausentes da baseline.

## 11. Critérios de aceitação

- [ ] Nota pública usa apenas dados válidos e apresenta somente distribuição agregada por quantidade de estrelas, sem revelar identidade, identificadores ou comentários individuais (RNF-08/RNF-09).
- [ ] Registros individuais e comentários opcionais têm acesso restrito e são excluídos ou irreversivelmente anonimizados após 1 ano do envio, respeitando obrigações aplicáveis de preservação.
- [ ] A distribuição agregada só é mantida por prazo indeterminado se não permitir reconstruir avaliações individuais nem identificar candidatos.
- [ ] Denúncia pendente não altera automaticamente a nota; ausência de dados suficientes não é apresentada como nota calculada.

- [ ] Acesso limitado ao ator autorizado.
- [ ] Pré-condições e regras são validadas no backend.
- [ ] Operações inválidas são recusadas sem alteração indevida.
- [ ] Operação válida produz o estado esperado.
- [ ] Dados pessoais e de acessibilidade respeitam autorização.
- [ ] Alterações relevantes ficam rastreáveis.
- [ ] A capacidade não executa responsabilidades atribuídas a outras Specs.
- [ ] Lacunas permanecem explicitadas em OPEN.md.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-021-01 | Não há avaliações válidas | Não exibe nota/distribuição e informa dados insuficientes |
| T-021-02 | Existe uma avaliação válida | Exibe a frequência correspondente à quantidade de estrelas recebida |
| T-021-03 | Existem avaliações válidas em diferentes quantidades de estrelas | Exibe a frequência de cada quantidade de estrelas sem revelar autores |
| T-021-04 | Há avaliação inválida ou não elegível | Avaliação não integra a distribuição |
| T-021-05 | Denúncia ainda não tem decisão registrada | Distribuição permanece baseada nas avaliações válidas, sem efeito automático da denúncia |
| T-021-06 | Administrador registra decisão sobre denúncia | Decisão fica vinculada à denúncia; avaliações e distribuição pública de estrelas não são editadas pelo administrador |
| T-021-07 | Usuário tenta inferir identidade de avaliador pela tela pública | Tela não expõe identidade, identificadores nem comentários individuais; exibe somente distribuição agregada por quantidade de estrelas |
| T-021-08 | Registro individual completa 1 ano desde o envio | Registro individual e comentário opcional são excluídos ou irreversivelmente anonimizados, respeitando obrigações aplicáveis de preservação |
| T-021-09 | Distribuição agregada pode permitir reconstrução de avaliação individual ou identificação | Distribuição não é mantida/publicada nesse formato; apresentação deve evitar reconstrução ou identificação |

## 13. Questões em aberto
As decisões de apresentação por estrelas, mínimo de uma avaliação válida e estado sem dados suficientes estão registradas. A OPEN-085 foi resolvida: administradores tratam denúncias, mas não alteram diretamente avaliações nem a distribuição pública de estrelas.

## 14. Definition of Done
- [ ] Texto revisado e aprovado.
- [ ] Rastreabilidade conferida com requisitos, regras, RNFs, casos de uso e modelo.
- [ ] Questões decididas ou mantidas explicitamente em aberto.
- [ ] Layout funcional anexado e aprovado quando aplicável.
- [ ] Critérios de aceitação e testes revisados.
- [ ] Nenhuma implementação antes das aprovações exigidas.

---


## Registro consolidado de revisão

| Specs | Estado dos textos | Estado dos layouts |
|---|---|---|
| SPEC-001 a SPEC-003 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |
| SPEC-004 a SPEC-006 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |
| SPEC-007 a SPEC-010 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |
| SPEC-011 a SPEC-013 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |
| SPEC-016 a SPEC-017 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |
| SPEC-018 a SPEC-021 | especificadas; revisão humana pendente | pendentes conforme aplicabilidade |

A revisão cruzada dos artefatos está registrada em [revisao-consistencia-specs.md](revisao-consistencia-specs.md). A inclusão no registro não significa aprovação. Implementação permanece bloqueada até aprovação do texto e dos layouts aplicáveis.
