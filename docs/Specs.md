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

**Próxima etapa:** detalhar o Bloco 3. A revisão coletiva das questões em aberto pode ocorrer depois que todas as Specs estiverem detalhadas.


# Bloco 2 — Empresa, vagas próprias e ingestão externa

Este bloco detalha SPEC-004, SPEC-005 e SPEC-006. As questões pendentes são referenciadas em `docs/OPEN.md`; nenhuma delas é considerada decidida por estar descrita aqui.

---

# SPEC-004 — Gerenciar infraestrutura de acessibilidade da empresa

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-004 |
| Bloco | 2 — Empresa e vagas |
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
- **Questões relacionadas:** OPEN-017 a OPEN-019.

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
- A lista completa de campos e obrigatoriedades depende da confirmação da baseline (OPEN-017).

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

## 6. Regras e invariantes

1. A infraestrutura pertence à Empresa à qual está associada.
2. Somente uma Empresa autenticada e autorizada pode alterar seu próprio mapeamento.
3. Itens obrigatórios definidos na baseline bloqueiam o salvamento quando pendentes (UC-07).
4. O sistema não deve converter informação ausente em afirmação de acessibilidade ou inacessibilidade.
5. Alterações relevantes devem ser rastreáveis (RB-27, RB-37, RF-38, RNF-14).
6. A persistência deve manter a integridade do vínculo Empresa–infraestrutura (RNF-09).
7. Divergências recorrentes podem ter consequências conforme RB-08, mas qualquer processo de apuração/alteração deve respeitar a regra de negócio aplicável; esta Spec não cria uma decisão automática.
8. A nota pública de acessibilidade não é calculada nesta capacidade (RB-20).
9. Campos, escalas e itens obrigatórios não podem ser ampliados por suposição.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| EMPRESA | Conta organizacional proprietária dos dados |
| INFRAESTRUTURA_EMPRESA | Informações estruturadas de acessibilidade associadas à Empresa |
| USUARIO/RECRUTADOR | Identidade autorizada que atua em nome da Empresa, conforme regras de acesso |

A baseline citada não especifica todos os atributos, tipos, escalas, cardinalidades ou versionamento de INFRAESTRUTURA_EMPRESA. Esses detalhes permanecem pendentes (OPEN-017 e OPEN-018).

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

- **OPEN-017:** lista definitiva de campos, categorias e itens obrigatórios do questionário.
- **OPEN-018:** tipos, escalas, versionamento e estrutura de persistência do mapeamento.
- **OPEN-019:** regras e evidências para tratar divergências recorrentes nas informações declaradas.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Campos e obrigatoriedades conferidos com a baseline.
- [ ] Questões em aberto decididas ou mantidas explicitamente.
- [ ] Layout funcional anexado em `docs/layout/` e aprovado separadamente.
- [ ] Critérios e testes revisados.
- [ ] Integridade, autorização e rastreabilidade verificáveis.
- [ ] Nenhuma implementação iniciada antes das aprovações exigidas.

---

# SPEC-005 — Cadastrar e gerenciar vagas próprias

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-005 |
| Bloco | 2 — Empresa e vagas |
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
2. O sistema apresenta campos previstos na baseline, incluindo cargo, descrição, requisitos, modalidade, localização, critérios de acessibilidade e prazo de inscrição conforme UC-08.
3. Recrutador preenche os dados.
4. O sistema valida campos obrigatórios e consistência.
5. Se houver dados incompletos ou inconsistentes, o sistema indica os problemas e não permite publicar.
6. Se válido, o Recrutador pode salvar como rascunho ou optar pela publicação imediata, conforme UC-08.

### 5.3 Publicar vaga
1. Recrutador solicita publicação.
2. O sistema valida novamente os dados mínimos e a consistência das regras da vaga.
3. O sistema rejeita publicação com prazo de encerramento inválido ou anterior à data atual, conforme EX03 de UC-08.
4. Se válida, a vaga passa a ficar disponível no catálogo para candidatos elegíveis.
5. O sistema registra a publicação e o responsável para auditoria.

### 5.4 Editar e gerenciar vaga
1. Recrutador seleciona uma vaga sob sua autorização.
2. O sistema apresenta os dados atuais.
3. Recrutador altera os campos permitidos.
4. O sistema valida as alterações.
5. Se válidas, salva a atualização e registra o evento relevante.
6. Restrições específicas para edição após publicação, encerramento ou existência de candidaturas dependem da baseline e estão em aberto (OPEN-022).

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
- [ ] Vaga pode ser cadastrada com os campos previstos na baseline.
- [ ] Dados incompletos ou inconsistentes impedem publicação e são apontados.
- [ ] Vaga válida pode ser salva como rascunho.
- [ ] Vaga válida pode ser publicada.
- [ ] Prazo de encerramento inválido impede publicação.
- [ ] Vaga publicada fica disponível para candidatos elegíveis no catálogo.
- [ ] Informações de acessibilidade são mantidas sem presumir valores ausentes.
- [ ] Publicação e alterações relevantes são rastreáveis.
- [ ] Compatibilidade e funil não são implementados nesta capacidade.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-005-01 | Recrutador autorizado abre painel | Vagas autorizadas listadas |
| T-005-02 | Recrutador tenta acessar vaga de outra Empresa | Acesso recusado |
| T-005-03 | Criar vaga com dados completos | Vaga criada |
| T-005-04 | Publicar vaga com campos obrigatórios ausentes | Publicação bloqueada e campos indicados |
| T-005-05 | Publicar vaga inconsistente | Publicação bloqueada |
| T-005-06 | Publicar com prazo anterior à data atual | Publicação recusada |
| T-005-07 | Salvar vaga válida como rascunho | Rascunho persistido sem ficar publicado |
| T-005-08 | Publicar vaga válida | Vaga visível para candidatos elegíveis |
| T-005-09 | Alterar vaga própria | Dados atualizados e evento rastreável |
| T-005-10 | Consultar vaga com acessibilidade não informada | Ausência permanece explicitamente não informada |

## 13. Questões em aberto

As questões estão centralizadas em [OPEN.md](OPEN.md).

- **OPEN-020:** lista completa de campos e obrigatoriedade de vaga própria.
- **OPEN-021:** definição de consistência e validações de cada campo da vaga.
- **OPEN-022:** permissões e limites para edição/encerramento após publicação e após candidaturas.
- **OPEN-023:** origem e representação dos critérios de acessibilidade e relação com INFRAESTRUTURA_EMPRESA e TRAVA_CRITICA_VAGA.

## 14. Definition of Done

- [ ] Texto revisado e aprovado.
- [ ] Campos e regras conferidos com RF-18, RF-25, UC-08, RB e modelo.
- [ ] Questões em aberto decididas ou mantidas explicitamente.
- [ ] Layouts anexados em `docs/layout/` e aprovados separadamente.
- [ ] Critérios e testes revisados.
- [ ] Autorização organizacional, validação e auditoria verificáveis.
- [ ] Nenhuma implementação iniciada antes das aprovações exigidas.

---

# SPEC-006 — Importar, ingerir e normalizar vagas externas

## 1. Identificação

| Campo | Valor |
|---|---|
| ID | SPEC-006 |
| Bloco | 2 — Empresa e vagas |
| Estado do texto | especificada |
| Estado do layout | não se aplica ao núcleo de ingestão; eventual interface administrativa permanece pendente |
| Capacidade | Receber dados externos estruturados, validar, normalizar, deduplicar e registrar o resultado da ingestão |

## 2. Rastreabilidade

- **RF:** RF-05 — Importação de vagas externas; RF-36 — Importação de dados estruturados; RF-37 — Normalização de dados externos; RF-38 — Auditoria de operações; RF-39 — Tratamento de erros e inconsistências; RF-40 — Controle de acesso às operações administrativas.
- **RB:** RB-10 — Vagas externas; RB-11 — Validação da IA; RB-17 — Validação de vaga externa; RB-18 — Resultado da LLM não é fonte de verdade; RB-31 — Deduplicação de dados externos; RB-32 — Integridade da importação; RB-33 — Registro da origem da vaga; RB-37 — Registro das decisões; RB-41 — Auditoria das alterações.
- **RNF:** RNF-05 — Desempenho; RNF-07 — Segurança; RNF-09 — Integridade; RNF-14 — Rastreabilidade e auditoria; RNF-16 — Compatibilidade/normalização de dados externos, conforme mapa.
- **Caso de uso:** UC-14 — Ingerir Dados em JSON.
- **Modelo conceitual:** VAGA.
- **Drivers:** DA-02, DA-05, DA-06, DA-07, DA-08.
- **ADRs:** ADR-002, ADR-003, ADR-004.
- **Dependência:** SPEC-001 para autenticação/autorização da operação administrativa.
- **Questões relacionadas:** OPEN-024 a OPEN-029.

## 3. Escopo

### Incluído
- Permitir que ator administrativo autorizado inicie ingestão de dados estruturados de fontes autorizadas, conforme UC-14.
- Receber e validar a estrutura JSON.
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
| Disparo da ingestão administrativa | Iniciar processo de importação autorizado | Pendente, se houver interface |
| Resumo da execução | Exibir resultado agregado da ingestão | Pendente, se houver interface |
| Detalhe de falhas/validação | Consultar registros rejeitados ou inconsistentes | Pendente, se houver interface |

UC-14 descreve um fluxo administrativo, mas não determina se a operação será iniciada por tela, tarefa automatizada ou outro mecanismo. A interface não é presumida como obrigatória. Por isso, o layout do núcleo de ingestão é **não se aplica**; se houver interface administrativa, seu layout precisará ser especificado e aprovado.

## 4. Dependências

- **SPEC-001:** identidade, sessão e autorização para iniciar a operação administrativa.
- **SPEC-005:** compartilha o modelo conceitual de VAGA, mas mantém o fluxo de cadastro próprio separado.
- **SPEC-007/SPEC-008:** dependem de vagas externas validadas e normalizadas.
- **ADR-003:** integração LLM no backend por adaptador, com validação antes do domínio.
- Contrato de origem, esquema JSON suportado e campos obrigatórios precisam ser confirmados (OPEN-024/OPEN-025).

## 5. Comportamento esperado

### 5.1 Iniciar ingestão
1. O ator administrativo autorizado inicia a ingestão de dados de uma fonte autorizada.
2. O sistema identifica a origem e recebe o conteúdo estruturado.
3. O sistema registra o início/execução de forma rastreável, conforme os contratos definidos.

### 5.2 Validar estrutura e registros
1. O sistema verifica se o conteúdo recebido é JSON válido e compatível com o formato suportado.
2. Se a estrutura não puder ser processada, a execução registra a falha e não altera registros válidos existentes.
3. Para cada registro, o sistema verifica os campos e a consistência exigidos pela baseline.
4. Registros inválidos ou incompletos são identificados e não seguem para o domínio como vagas válidas.
5. O resultado da validação é mantido para compor o resultado da execução.

### 5.3 Extrair e validar dados com LLM
1. Quando o fluxo utilizar LLM para extrair ou interpretar conteúdo externo, a chamada ocorre no backend por adaptador.
2. A resposta é tratada como resultado não confiável.
3. O sistema valida os campos extraídos e sua conformidade com o modelo suportado.
4. Somente dados validados podem avançar para normalização e persistência.
5. Se a LLM estiver indisponível ou retornar dados inválidos, o sistema não deve inserir a resposta inválida como vaga válida; o tratamento alternativo depende da política a definir (OPEN-026).

### 5.4 Normalizar e deduplicar
1. O sistema converte os dados válidos para a estrutura comum de VAGA.
2. Mantém a identificação da fonte externa.
3. Verifica duplicidade entre registros externos conforme critérios aprovados.
4. Registros externos duplicados não criam múltiplas representações equivalentes.
5. A deduplicação não deve eliminar ou alterar indevidamente registros válidos existentes.

### 5.5 Persistir e registrar resultado
1. O sistema persiste os registros validados e normalizados.
2. Falhas parciais não comprometem registros válidos existentes nem devem produzir duplicação indevida.
3. O sistema registra origem, resultado e erros relevantes da execução.
4. O resultado permite distinguir registros processados, rejeitados e duplicados, conforme detalhamento pendente.
5. Os registros válidos tornam-se disponíveis às capacidades consumidoras após o processamento bem-sucedido.

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
11. A deduplicação desta Spec se aplica somente a dados externos.
12. O sistema não deve afirmar que uma vaga é válida se seus dados obrigatórios não passaram pelas validações estabelecidas.
13. Estratégia de repetição, transação e recuperação não é inventada por esta Spec e deve ser definida onde a baseline não for suficiente.

## 7. Modelo de domínio envolvido

| Elemento | Responsabilidade |
|---|---|
| VAGA | Modelo comum de vaga após validação e normalização |
| Origem externa | Identifica a fonte da qual o registro foi obtido; representação exata precisa ser confirmada |

O modelo conceitual mapeado indica VAGA, mas a estrutura completa para fonte, identificador externo, estado de validação e histórico de ingestão não está detalhada nesta Spec. Não são criadas entidades de lote/importação por suposição; conferir OPEN-027.

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
- **Iniciar ingestão autorizada:** recebe referência/conteúdo de origem conforme o contrato que vier a ser definido e registra a execução.
- **Validar estrutura JSON:** verifica sintaxe e formato suportado.
- **Validar registro de vaga:** verifica os campos e restrições obrigatórios.
- **Extrair dados via adaptador LLM:** quando habilitado, retorna dados candidatos à validação, nunca diretamente confiáveis.
- **Normalizar vaga externa:** transforma dados válidos para o modelo comum.
- **Identificar duplicidade externa:** compara registros externos conforme critério aprovado.
- **Persistir registros válidos:** grava os registros sem comprometer dados válidos existentes.
- **Registrar resultado de ingestão:** registra origem, quantidades/estados e falhas conforme esquema aprovado.

## 10. RNFs aplicáveis

- **RNF-05:** desempenho da operação e tratamento de trabalho potencialmente demorado.
- **RNF-07:** proteger o acesso e a integração externa.
- **RNF-09:** manter integridade dos registros e da persistência.
- **RNF-14:** manter rastreabilidade da execução e das alterações.
- **RNF-16:** compatibilidade/normalização dos dados externos conforme descrição do mapa; confirmar formulação exata na baseline antes de fechar os testes.

## 11. Critérios de aceitação

- [ ] Somente ator administrativo autorizado inicia a operação protegida.
- [ ] JSON válido no formato suportado é processado.
- [ ] Estrutura inválida é rejeitada e registrada sem comprometer dados válidos existentes.
- [ ] Registros inválidos/incompletos não são disponibilizados como vagas válidas.
- [ ] Dados extraídos por LLM passam por validação antes de uso.
- [ ] Indisponibilidade ou resposta inválida da LLM não resulta em vaga inválida persistida.
- [ ] Vagas externas válidas são normalizadas para o modelo comum.
- [ ] Origem externa é preservada.
- [ ] Duplicados externos não geram registros equivalentes múltiplos.
- [ ] Falhas não comprometem registros válidos existentes.
- [ ] Origem, resultado e falhas relevantes ficam rastreáveis.
- [ ] A operação não depende de um fornecedor LLM específico.
- [ ] A deduplicação não é aplicada a vagas próprias por esta Spec.

## 12. Casos de teste derivados

| ID | Cenário | Resultado esperado |
|---|---|---|
| T-006-01 | Iniciar ingestão com autorização válida | Execução iniciada e registrada |
| T-006-02 | Usuário não autorizado tenta iniciar ingestão | Operação recusada |
| T-006-03 | JSON sintaticamente inválido | Falha registrada; dados existentes preservados |
| T-006-04 | Registro sem campo obrigatório | Registro rejeitado ou isolado conforme política aprovada |
| T-006-05 | LLM retorna campos inválidos | Dados não entram no domínio como vaga válida |
| T-006-06 | LLM indisponível | Nenhum resultado não validado é persistido |
| T-006-07 | Registro externo válido | Normalizado e persistido |
| T-006-08 | Registro externo duplicado | Não cria registro equivalente adicional |
| T-006-09 | Lote contém válidos e inválidos | Válidos são preservados/processados sem contaminação pelos inválidos |
| T-006-10 | Reexecutar ingestão do mesmo registro externo | Deduplicação conforme critério aprovado |
| T-006-11 | Finalizar execução com falhas | Origem, resultado e falhas ficam rastreáveis |
| T-006-12 | Verificar registro de vaga própria | Deduplicação externa não o trata como duplicado automaticamente |

## 13. Questões em aberto

As questões estão centralizadas em [OPEN.md](OPEN.md).

- **OPEN-024:** fontes autorizadas, forma de entrada e esquema JSON suportado.
- **OPEN-025:** campos obrigatórios e validações para considerar um registro externo uma vaga válida.
- **OPEN-026:** comportamento de contingência quando LLM estiver indisponível ou produzir dados inválidos.
- **OPEN-027:** estrutura para rastrear execução/lote, estado por registro e resultado de ingestão.
- **OPEN-028:** critério de equivalência para deduplicação de registros externos.
- **OPEN-029:** política de transação, repetição, recuperação e tratamento de falhas parciais.
- **OPEN-030:** confirmação da formulação e medida verificável de RNF-16 aplicada à ingestão.

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
| Bloco | 3 — Compatibilidade e descoberta |
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
2. Verificar se os dados mínimos estão disponíveis; caso contrário, indicar que não é possível concluir a análise sem presumir valores.
3. Comparar necessidades funcionais obrigatórias com barreiras e recursos eliminatórios registrados para a vaga.
4. Se houver barreira incompatível com necessidade obrigatória, classificar a vaga como incompatível, independentemente de qualquer score.
5. Se não houver trava crítica, calcular o score determinístico com os pesos definidos na baseline.
6. Produzir resultado e fatores considerados, preservando transparência.
7. Ao analisar várias vagas, permitir que a capacidade consumidora ordene os resultados por score.

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
10. A fórmula detalhada das subpontuações e do arredondamento não é definida quando a baseline não a especifica.

## 7. Modelo de domínio
- **CANDIDATO:** dados profissionais.
- **VETOR_ACESSIBILIDADE_CANDIDATO:** necessidades funcionais e indicação de obrigatoriedade.
- **VAGA:** requisitos, modalidade, localização e dados de acessibilidade.
- **TRAVA_CRITICA_VAGA:** recursos eliminatórios e barreiras impeditivas.
- **Resultado de compatibilidade:** resultado lógico, score e fatores produzidos pelo cálculo; atributos persistidos adicionais não são presumidos.

## 8. Impacto arquitetural
A lógica fica concentrada em serviço de domínio independente da interface e da persistência. A trava ocorre antes do score. Dados externos precisam ter passado pela SPEC-006. Não se escolhe linguagem, biblioteca ou algoritmo auxiliar.

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
- [ ] Não é inventada fórmula detalhada ausente da baseline.

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
- **OPEN-031:** fórmula detalhada das subpontuações, normalização e arredondamento.
- **OPEN-032:** dados mínimos necessários para cada dimensão do cálculo.
- **OPEN-033:** representação de falta de dados versus incompatibilidade comprovada.
- **OPEN-034:** medição de distância/modalidade quando faltam localização ou preferências.
- **OPEN-035:** parâmetros e resultados que devem ser armazenados para rastreabilidade.

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
| Bloco | 3 — Compatibilidade e descoberta |
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
| Bloco | 3 — Compatibilidade e descoberta |
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
| Bloco | 3 — Compatibilidade e descoberta |
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
