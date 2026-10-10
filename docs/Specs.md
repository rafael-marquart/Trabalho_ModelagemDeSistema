# Specs — AcessaVagas

Documento de detalhamento das Specs do **Bloco 1 — Acesso e perfis**, baseado na baseline do projeto e na estrutura do documento de referência do processo SDD.

## Controle do documento

- Escopo: SPEC-001, SPEC-002 e SPEC-003.
- Estado dos textos: especificada, aguardando revisão e aprovação humana.
- Estado dos layouts: pendente.
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
| Bloco | 1 — Acesso e perfis |
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
- Registrar alterações relevantes conforme RB-27 e RNF-14.

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
8. A sessão é mantida, expirada ou invalidada conforme RB-22 e a política de segurança aplicável.

### 5.2 Recuperação de senha
1. O usuário seleciona recuperação de senha.
2. O sistema conduz o fluxo previsto em RF-02.
3. O sistema valida a solicitação e permite redefinição quando válida.
4. As novas credenciais podem ser usadas no acesso.

A baseline não determina canal de entrega, formato de token, validade do link ou texto exato das mensagens; esses detalhes permanecem em aberto.

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
2. Operações protegidas devem verificar perfil e permissão no backend (RB-12, RF-40, DA-02).
3. Sessão expirada ou invalidada não pode autorizar operação protegida (RB-22).
4. Candidato, Recrutador e Administrador possuem permissões compatíveis com seus papéis (RF-03).
5. O cadastro inicial oferece Usuário ou Empresa; Recrutador é cadastrado/associado pela Empresa.
6. O Recrutador permanece vinculado à Empresa responsável (RB-46).
7. Uma Empresa só pode administrar vínculos sob sua própria responsabilidade.
8. Não se introduz o papel de Gestor de Seleção.
9. Cadastro, perfil e vínculo organizacional devem permanecer íntegros (RNF-09).
10. Alterações relevantes devem ser rastreáveis conforme RB-27 e RNF-14, respeitando RNF-08.
11. ADR-002 centraliza a autorização no backend, mas não determina JWT, sessão/cookie ou mecanismo específico.

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

- **OPEN-001:** recuperação de senha — verificação, validade e canal de envio.
- **OPEN-002:** política de sessão — expiração e eventos de invalidação.
- **OPEN-003:** política de senha e bloqueio.
- **OPEN-004:** campos obrigatórios e validação do cadastro de Empresa.
- **OPEN-005:** associação de Recrutador cujo e-mail já pertence a uma conta e consentimento.
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
| Bloco | 1 — Acesso e perfis |
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
- Cadastrar e atualizar dados profissionais contemplados em RF-04/RF-19.
- Permitir autodeclaração e atualização de necessidades funcionais de acessibilidade.
- Organizar necessidades nas categorias do vetor conceitual.
- Validar campos obrigatórios e informações mínimas definidas na baseline.
- Proteger as informações de acessibilidade e registrar alterações relevantes.
- Disponibilizar os dados para capacidades posteriores somente conforme autorização e finalidade.

### Fora do escopo
- Cálculo de compatibilidade, pertencente à SPEC-007.
- Busca e filtros de vagas.
- Armazenamento de laudos médicos: o sistema não armazena laudos; necessidades podem ser autodeclaradas.
- Solicitações de acomodação vinculadas a uma candidatura, tratadas na SPEC-014.
- Campos adicionais não respaldados por RF-04, RF-19 ou pelo modelo conceitual.

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
3. Sistema valida campos obrigatórios e informações mínimas.
4. Dados válidos são persistidos.
5. Erros são indicados para correção, sem descarte silencioso das informações preenchidas.

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
5. O salvamento respeita informações mínimas de RB-29; campos obrigatórios não são inventados.
6. A distinção de necessidades obrigatórias deve ser preservada quando suportada pela baseline, pois RB-06 determina que sejam consideradas na compatibilidade.
7. Alterações relevantes são rastreáveis conforme RB-27 e RNF-14.
8. O sistema registra necessidades funcionais declaradas; não infere diagnóstico nem exige documento não previsto.
9. Persistir o perfil não substitui as regras de compatibilidade da SPEC-007.

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
- [ ] Candidato cadastra e atualiza dados profissionais previstos na baseline.
- [ ] Candidato declara necessidades por autodeclaração.
- [ ] Necessidades são organizadas nas categorias conceituais do vetor.
- [ ] Campos obrigatórios definidos na baseline são validados.
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

## 13. Questões em aberto

As questões abaixo estão centralizadas em [OPEN.md](OPEN.md). Não são decisões tomadas nesta Spec.

- **OPEN-007:** campos profissionais, obrigatoriedade e validação do perfil.
- **OPEN-008:** catálogo de necessidades por categoria e representação de necessidades obrigatórias.
- **OPEN-009:** dados/versionamento do histórico e prazo de retenção.
- **OPEN-010:** associação entre USUARIO e CANDIDATO no modelo.
- **OPEN-011:** matriz de visibilidade de perfil e necessidades para Recrutadores.

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
| Bloco | 1 — Acesso e perfis |
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

- **OPEN-012:** mecanismo de alto contraste — controle da aplicação ou configuração do sistema/navegador.
- **OPEN-013:** persistência das preferências de acessibilidade entre sessões.
- **OPEN-014:** comandos, fluxos, idiomas e tecnologia para interação por voz.
- **OPEN-015:** ambientes de referência para validação (navegadores, leitores de tela e dispositivos).
- **OPEN-016:** processo e evidências para avaliar conformidade com WCAG 2.1 AA.

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

**Próxima etapa:** revisão humana deste bloco. Corrigir o texto conforme o feedback e registrar a aprovação de cada Spec. O Bloco 2 será detalhado após a revisão do Bloco 1.
