## Regras de Negócio

### RB-01 Elegibilidade para candidatura
Candidatura somente em vaga disponível e não bloqueada.

### RB-02 Trava de acessibilidade
Barreira incompatível com necessidade obrigatória torna a vaga incompatível.

### RB-03 Peso da acessibilidade
Acessibilidade representa 50% do cálculo.

### RB-04 Peso do perfil técnico
Perfil técnico representa 30% do cálculo.

### RB-05 Peso de distância e modalidade
Distância e modalidade representam 20% do cálculo.

### RB-06 Necessidades obrigatórias
Necessidades funcionais marcadas como obrigatórias participam da análise.

### RB-07 Perfil técnico
O cálculo considera escolaridade, formação, competências e idiomas exigidos.

### RB-08 Divergências recorrentes
Divergências recorrentes entre acessibilidade declarada e experiência podem permitir alteração após análise administrativa.

### RB-10 Vagas externas
Vagas externas devem ser identificadas e estruturadas antes do uso.

### RB-11 Validação da IA
Dados extraídos por LLM devem ser validados antes do uso.

### RB-12 Controle de acesso
Cada usuário acessa somente funcionalidades correspondentes ao seu perfil.

### RB-13 Transparência
Informações relevantes de acessibilidade devem estar disponíveis antes da candidatura.

### RB-14 Uma candidatura ativa por vaga
O candidato não pode possuir mais de uma candidatura ativa para a mesma vaga.

### RB-15 Barreira crítica prevalece sobre a pontuação
Barreira incompatível com necessidade obrigatória impede candidatura ou recomendação independentemente do score.

### RB-16 Dados de acessibilidade não informados
Ausência de informação necessária deve ser tratada como não informada, sem assumir compatibilidade.

### RB-17 Validação de vaga externa
Vaga externa só participa da análise após estruturação e validação.

### RB-18 Resultado da LLM não é fonte de verdade
Resultado da LLM não é válido sem o processo de validação definido.

### RB-19 Anonimato das avaliações públicas
Avaliações públicas preservam a identidade do candidato.

### RB-20 Nota de acessibilidade baseada em dados registrados
A nota pública usa avaliações e informações válidas registradas.

### RB-21 Segurança de autenticação
Autenticação deve impedir acesso mediante credenciais inválidas.

### RB-22 Controle de sessão
Funcionalidades protegidas exigem sessão válida e autorizada.

### RB-23 Transparência de status
O candidato recebe informações claras sobre status da candidatura e alterações relevantes da vaga.

### RB-24 Proteção contra abuso
O sistema aplica controles contra uso abusivo de denúncias e candidaturas.

### RB-25 Apuração de denúncias
Denúncias são analisadas por Administrador antes de bloqueio ou alteração de nota.

### RB-26 Confidencialidade das informações de acessibilidade
Informações de acessibilidade são disponibilizadas somente a usuários autorizados e necessários ao processo. O acesso do Recrutador é orientado pela finalidade e limitado às informações necessárias à candidatura e à vaga sob sua responsabilidade durante todas as etapas. Informações de acessibilidade só podem ser consultadas na medida necessária para avaliar compatibilidade e viabilizar acessibilidade no processo. É vedado acesso a candidatos/candidaturas de outras Empresas e a laudos médicos. Avanço, encerramento ou mudança de etapa não ampliam automaticamente as permissões; preservam-se as regras existentes de histórico e retenção.

### RB-27 Histórico de alterações
Alterações relevantes mantêm registro para rastreabilidade. Para movimentações do funil, registrar etapa anterior e resultante, data e hora, ator responsável e tipo de movimentação/decisão, incluindo justificativa quando exigida pelo fluxo ou regra aplicável. Preservar eventos anteriores, sem exclusão silenciosa; reversões só são permitidas quando correspondem a transições previstas na RB-39. Mudanças futuras do fluxo dependem de aprovação explícita do projeto.

### RB-28 Autodeclaração das necessidades
O candidato pode informar necessidades por autodeclaração, sem armazenamento de laudo médico.

### RB-29 Informações mínimas do perfil
O perfil deve possuir dados mínimos para análise de compatibilidade.

### RB-30 Transparência do resultado
O resultado apresenta os principais fatores considerados.

### RB-31 Deduplicação de dados externos
Registros externos duplicados não geram registros equivalentes múltiplos.

### RB-32 Integridade da importação
Falhas de importação não comprometem registros válidos existentes.

### RB-33 Registro da origem da vaga
Vagas externas mantêm identificação da origem.

### RB-34 Candidatura somente em vaga elegível
Candidatura exige vaga disponível, não bloqueada e compatível com necessidades obrigatórias.

### RB-36 Cancelamento de candidatura
Cancelamento respeita regras e estados do processo seletivo.

### RB-37 Registro das decisões
Decisões relevantes são registradas para rastreabilidade.

### RB-38 Estados do funil
O sistema padroniza os estados do funil definidos pelo processo.

### RB-39 Transições válidas do funil
O sistema impede transições inválidas entre estados.

### RB-41 Auditoria das alterações
Alterações de status, decisões, cancelamentos e demais operações relevantes são registradas para auditoria.

### RB-42 Vaga encerrada
Vaga encerrada não aceita novas candidaturas e candidatos ativos são informados.

### RB-43 Validação para avanço no processo
Antes de alterar a etapa de uma candidatura, o sistema valida que o Recrutador está autenticado e autorizado a gerenciar a vaga, que a transição solicitada está prevista na RB-39 e que não existem pendências impeditivas conhecidas para o avanço. Se a transição não for autorizada, não estiver prevista ou houver pendência impeditiva, a mudança é recusada sem alterar a etapa. Havendo pendência impeditiva, o Recrutador pode solicitar complementação das informações necessárias conforme UC-09. Uma transição válida atualiza a etapa e mantém registro rastreável conforme RB-27, RB-37 e RB-41. Não se presumem critérios específicos adicionais por etapa, notas mínimas ou documentos obrigatórios sem decisão explícita do projeto.

### RB-44 Análise administrativa de denúncias
Denúncia não altera automaticamente nota nem bloqueia vaga; exige análise administrativa.

### RB-45 Decisão sobre denúncia
Após análise, a denúncia pode resultar em alteração conforme decisão registrada e regras da plataforma.

> RB-35 foi removida por duplicidade com RB-14.
### RB-46 Cadastro de recrutador pela empresa
Somente uma empresa autenticada pode cadastrar ou vincular um usuário ao perfil de Recrutador dentro das configurações da própria empresa. O recrutador deve permanecer vinculado à empresa que o cadastrou.
