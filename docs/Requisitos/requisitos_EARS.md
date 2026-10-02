# Requisitos EARS

## Requisitos Funcionais
Os RFs abaixo mantêm o escopo definido em RF.md e são expressos em formato EARS.

### RF-01 Autenticação
WHEN um usuário solicitar acesso, THE SYSTEM SHALL validar suas credenciais e iniciar uma sessão autorizada.
### RF-02 Recuperação de senha
WHEN um usuário solicitar recuperação de senha, THE SYSTEM SHALL disponibilizar o fluxo de redefinição por e-mail.
### RF-03 Perfis de acesso
WHEN um usuário acessar uma funcionalidade protegida, THE SYSTEM SHALL aplicar as permissões correspondentes ao seu perfil.
### RF-04 Cadastro de candidato
WHEN um candidato cadastrar ou atualizar seu perfil, THE SYSTEM SHALL permitir o registro de dados pessoais, formação, competências, idiomas e necessidades funcionais de acessibilidade.
### RF-05 Importação de vagas externas
WHEN uma vaga externa for disponibilizada, THE SYSTEM SHALL permitir sua entrada e visualização após o tratamento definido para fontes externas.
### RF-06 Busca e filtro
WHEN um candidato realizar uma busca, THE SYSTEM SHALL permitir filtrar vagas pelos critérios disponíveis.
### RF-07 Análise de compatibilidade
WHEN houver dados suficientes de candidato e vaga, THE SYSTEM SHALL calcular a compatibilidade conforme os critérios definidos.
### RF-08 Identificação de barreiras
WHEN a compatibilidade for analisada, THE SYSTEM SHALL verificar barreiras de acessibilidade incompatíveis com as necessidades do candidato.
### RF-09 Restrição de vaga incompatível
WHEN uma vaga for classificada como incompatível, THE SYSTEM SHALL impedir sua recomendação ou candidatura.
### RF-10 Visualização da vaga
WHEN um candidato consultar uma vaga, THE SYSTEM SHALL apresentar requisitos técnicos, acessibilidade, modalidade e localização disponíveis.
### RF-11 Minhas candidaturas
WHEN um candidato consultar suas candidaturas, THE SYSTEM SHALL apresentar os registros correspondentes e seus estados.
### RF-12 Notificações
WHEN ocorrer alteração relevante em vaga, candidatura ou etapa, THE SYSTEM SHALL informar os usuários afetados.
### RF-13 Nota de acessibilidade
WHEN houver dados válidos para avaliação, THE SYSTEM SHALL calcular e exibir a nota pública de acessibilidade da empresa.
### RF-14 Denúncia de incompatibilidade
WHEN um candidato identificar divergência de acessibilidade, THE SYSTEM SHALL permitir o registro de denúncia vinculada à vaga ou empresa.
### RF-15 Gestão de selos
WHEN um administrador gerenciar selos, THE SYSTEM SHALL permitir conceder, atualizar ou remover selos conforme os critérios da plataforma.
### RF-16 Recursos de acessibilidade
WHILE o usuário utilizar a plataforma, THE SYSTEM SHALL disponibilizar os recursos de acessibilidade definidos.
### RF-17 Cadastro de empresa
WHEN uma empresa for cadastrada, THE SYSTEM SHALL permitir registrar sua entidade organizacional e associar usuários com perfil de recrutador.
### RF-18 Gestão de vagas
WHEN um recrutador autorizado gerenciar uma vaga, THE SYSTEM SHALL permitir cadastrar, editar, publicar e gerenciar a vaga vinculada à empresa.
### RF-19 Gestão do perfil e necessidades de acessibilidade
WHEN um candidato gerenciar seu perfil, THE SYSTEM SHALL permitir consultar e atualizar seus dados e necessidades funcionais.
### RF-20 Gestão de candidaturas pela empresa
WHEN um recrutador autorizado consultar uma vaga, THE SYSTEM SHALL permitir visualizar e gerenciar as candidaturas recebidas conforme suas permissões.
### RF-21 Avaliação do processo seletivo
WHEN um processo seletivo elegível para avaliação for concluído, THE SYSTEM SHALL permitir que o candidato registre uma avaliação.
### RF-22 Moderação e gestão de denúncias
WHEN houver denúncia ou avaliação sujeita à análise, THE SYSTEM SHALL permitir ao administrador consultar, analisar e registrar a decisão.
### RF-24 Transparência do resultado de compatibilidade
WHEN o sistema apresentar um resultado de compatibilidade, THE SYSTEM SHALL permitir ao candidato visualizar os principais fatores considerados.
### RF-25 Transparência da compatibilidade da vaga
WHEN o candidato consultar uma vaga analisada, THE SYSTEM SHALL apresentar as informações de acessibilidade e compatibilidade utilizadas.
### RF-26 Registro de candidatura
WHEN o candidato solicitar candidatura, THE SYSTEM SHALL registrar a candidatura somente se a vaga for elegível.
### RF-27 Notificações do processo seletivo
WHEN houver alteração relevante no status da candidatura, THE SYSTEM SHALL comunicar o candidato.
### RF-28 Gestão da candidatura pelo candidato
WHEN o candidato consultar sua candidatura, THE SYSTEM SHALL permitir as ações disponíveis conforme as regras do processo.
### RF-29 Solicitação de acomodação
WHEN o candidato necessitar de acomodação, THE SYSTEM SHALL permitir registrar a solicitação vinculada à candidatura.
### RF-30 Gestão de candidatos no processo seletivo
WHEN um recrutador autorizado gerenciar candidatos, THE SYSTEM SHALL permitir consultar e atualizar candidatos vinculados às suas vagas.
### RF-31 Acompanhamento do processo seletivo
WHEN o candidato consultar uma candidatura, THE SYSTEM SHALL apresentar suas etapas e status.
### RF-32 Gestão das solicitações de acomodação
WHEN houver uma solicitação de acomodação, THE SYSTEM SHALL permitir ao recrutador autorizado consultar e tratar a solicitação.
### RF-33 Histórico das acomodações
WHEN uma solicitação de acomodação for criada ou tratada, THE SYSTEM SHALL manter o histórico correspondente.
### RF-34 Cancelamento de candidatura
WHEN o candidato solicitar cancelamento, THE SYSTEM SHALL cancelar a candidatura somente quando as regras permitirem.
### RF-35 Gestão do funil de seleção
WHEN um recrutador autorizado gerenciar o processo seletivo, THE SYSTEM SHALL permitir administrar as etapas e o andamento dos candidatos.
### RF-36 Importação de dados estruturados
WHEN dados estruturados de fonte externa forem recebidos, THE SYSTEM SHALL permitir sua entrada conforme o formato suportado.
### RF-37 Normalização de dados externos
WHEN dados externos forem recebidos, THE SYSTEM SHALL normalizá-los para o modelo utilizado pelo AcessaVagas.
### RF-38 Auditoria de operações
WHEN ocorrer operação relevante, THE SYSTEM SHALL registrar informações suficientes para rastreabilidade.
### RF-39 Tratamento de erros e inconsistências
WHEN ocorrer erro ou inconsistência em operação relevante, THE SYSTEM SHALL identificar, tratar e registrar a ocorrência conforme aplicável.
### RF-40 Controle de acesso às operações administrativas
WHEN uma operação administrativa for solicitada, THE SYSTEM SHALL permitir sua execução somente a usuários autorizados.

## Requisitos Não Funcionais
Os RNFs mantêm a numeração e o conteúdo definidos em RNF.md.

## Regras de Negócio
As RBs mantêm a numeração e o conteúdo definidos em RB.md.