# Requisitos EARS

## Requisitos Funcionais

### **RF-01 Autenticação**
WHEN o usuário submete dados de cadastro válidos, o sistema SHALL criar a conta.
WHEN o usuário submete credenciais corretas, o sistema SHALL iniciar a sessão.
IF as credenciais forem inválidas, THEN o sistema SHALL recusar o acesso e exibir uma mensagem de erro.


### **RF-02 Recuperação de senha**
WHEN o usuário solicita a recuperação de senha, o sistema SHALL enviar um link de redefinição para o e-mail cadastrado.


### **RF-03 Perfis de acesso**
IF um usuário tentar acessar uma funcionalidade não autorizada para seu perfil, THEN o sistema SHALL negar o acesso.


### **RF-04 Cadastro de candidato**
WHEN o candidato realiza seu cadastro, o sistema SHALL permitir o registro de informações pessoais, formação, competências, idiomas e necessidades funcionais de acessibilidade.


### **RF-05 Importação de vagas externas**
WHEN uma vaga externa for identificada, o sistema SHALL permitir sua visualização e processamento.


### **RF-06 Busca e filtro**
WHEN o candidato realizar uma busca ou aplicar filtros, o sistema SHALL exibir somente as vagas correspondentes aos critérios selecionados.


### **RF-07 Análise de compatibilidade**
WHEN o candidato consultar uma vaga, o sistema SHALL calcular a compatibilidade entre seu perfil e os requisitos da vaga.


### **RF-08 Identificação de barreiras**
WHEN o sistema realizar a análise de compatibilidade, o sistema SHALL verificar a existência de barreiras de acessibilidade incompatíveis com as necessidades funcionais do candidato.


### **RF-09 Restrição de vaga incompatível**
IF uma vaga apresentar uma barreira de acessibilidade incompatível com uma necessidade obrigatória do candidato, THEN o sistema SHALL impedir sua recomendação ou candidatura.


### **RF-10 Visualização da vaga**
WHEN o candidato acessar uma vaga, o sistema SHALL exibir informações sobre requisitos técnicos, acessibilidade, modalidade e localização.


### **RF-11 Minhas candidaturas**
WHEN o candidato acessar suas candidaturas, o sistema SHALL exibir as vagas às quais ele se candidatou.


### **RF-12 Notificações**
WHEN ocorrer uma alteração relevante em uma vaga ou candidatura, o sistema SHALL informar o candidato.


### **RF-13 Nota de acessibilidade**
WHEN uma empresa possuir feedbacks válidos de candidatos, o sistema SHALL calcular e exibir sua avaliação pública de acessibilidade.


### **RF-14 Denúncia de incompatibilidade**
WHEN o candidato identificar divergência entre a acessibilidade informada pela empresa e a encontrada durante o processo seletivo, o sistema SHALL permitir o registro de uma denúncia.


### **RF-15 Gestão de selos**
WHEN o administrador conceder, atualizar ou remover um selo de acessibilidade, o sistema SHALL atualizar a informação correspondente da empresa.


### **RF-16 Recursos de acessibilidade**
WHILE o usuário estiver utilizando a plataforma, o sistema SHALL disponibilizar suporte a leitores de tela, navegação por teclado, alto contraste e comandos de voz.


### **RF-17 Cadastro de empresa**
WHEN a empresa realizar seu cadastro, o sistema SHALL permitir o registro de seus dados institucionais e informações necessárias para sua identificação e avaliação de acessibilidade.


### **RF-18 Gestão de vagas**
WHEN a empresa estiver autenticada, o sistema SHALL permitir o cadastro, edição, publicação e gerenciamento de suas vagas na plataforma.


### **RF-19 Gestão do perfil e necessidades de acessibilidade**
WHEN o candidato acessar seu perfil, o sistema SHALL permitir consultar e atualizar seus dados pessoais, formação, competências, idiomas e necessidades funcionais de acessibilidade.


### **RF-20 Gestão de candidaturas pela empresa**
WHEN a empresa acessar suas vagas, o sistema SHALL permitir visualizar e gerenciar as candidaturas recebidas, conforme as permissões de seu perfil.


### **RF-21 Avaliação do processo seletivo**
WHEN o candidato participar ou finalizar um processo seletivo, o sistema SHALL permitir o registro de uma avaliação sobre a acessibilidade encontrada durante o processo seletivo.


### **RF-22 Moderação e gestão de denúncias**
WHEN o administrador acessar denúncias e avaliações relacionadas à acessibilidade, o sistema SHALL permitir consultar, analisar e gerenciar esses registros.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Requisitos Não Funcionais

### **RNF-01 Acessibilidade**
The system SHALL seguir as diretrizes da WCAG 2.1 nível AA, garantindo autonomia aos usuários.


### **RNF-02 Compatibilidade com leitores de tela**
WHEN o usuário utilizar um leitor de tela compatível, o sistema SHALL permitir a utilização das funcionalidades da plataforma.


### **RNF-03 Responsividade**
WHEN o sistema for acessado em diferentes tamanhos de tela ou dispositivos, o sistema SHALL adaptar sua interface ao dispositivo utilizado.


### **RNF-04 Usabilidade**
The system SHALL apresentar uma interface simples, intuitiva e organizada, facilitando a autonomia dos usuários.


### **RNF-05 Desempenho**
WHEN o usuário realizar operações de busca, candidatura ou consulta, o sistema SHALL apresentar tempo de resposta adequado.


### **RNF-06 Disponibilidade**
WHILE a plataforma estiver em operação, o sistema SHALL permanecer disponível, exceto durante períodos programados de manutenção.


### **RNF-07 Segurança**
The system SHALL proteger os dados dos usuários contra acesso, alteração ou utilização não autorizada.


### **RNF-08 Privacidade**
The system SHALL tratar os dados pessoais de acordo com a legislação vigente, especialmente a LGPD.


### **RNF-09 Integridade dos dados**
WHEN dados de candidatos, empresas, vagas ou avaliações forem armazenados ou modificados, o sistema SHALL garantir sua consistência e integridade.


### **RNF-10 Confiabilidade**
WHEN o sistema realizar o cálculo de compatibilidade, o sistema SHALL produzir resultados consistentes conforme os critérios definidos.


### **RNF-11 Escalabilidade**
WHEN houver aumento no número de usuários, empresas, vagas ou candidaturas, o sistema SHALL manter seu funcionamento sem perda significativa de desempenho.


### **RNF-12 Manutenibilidade**
The system SHALL possuir uma estrutura que facilite correções, manutenção e evolução das funcionalidades.


### **RNF-13 Compatibilidade**
WHEN o usuário acessar a plataforma por meio dos principais navegadores ou dispositivos suportados, o sistema SHALL disponibilizar suas funcionalidades de forma adequada.


### **RNF-14 Rastreabilidade e auditoria**
WHEN ocorrer uma operação relevante de administração, avaliação, denúncia ou alteração de dados, o sistema SHALL manter informações suficientes para permitir sua rastreabilidade.


### **RNF-15 Testabilidade**
The system SHALL possuir uma estrutura que permita testar isoladamente as funcionalidades e regras de negócio críticas.


### **RNF-16 Interoperabilidade**
WHEN o sistema receber informações provenientes de fontes externas, o sistema SHALL permitir sua integração e normalização para o modelo utilizado pela plataforma.


----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Regras de Negócios

### **RB-01 Limite de candidaturas**
IF uma vaga estiver indisponível ou bloqueada, THEN o sistema SHALL impedir que o candidato realize uma candidatura.


### **RB-02 Trava de acessibilidade**
IF uma vaga apresentar uma barreira incompatível com uma necessidade obrigatória do candidato, THEN o sistema SHALL considerar a vaga incompatível.


### **RB-03 Peso da acessibilidade**
WHEN o sistema calcular a compatibilidade entre candidato e vaga, a dimensão de acessibilidade SHALL representar 50% do resultado.


### **RB-04 Peso do perfil técnico**
WHEN o sistema calcular a compatibilidade entre candidato e vaga, o perfil técnico SHALL representar 30% do resultado.


### **RB-05 Peso de distância e modalidade**
WHEN o sistema calcular a compatibilidade entre candidato e vaga, distância e modalidade SHALL representar 20% do resultado.


### **RB-06 Necessidades obrigatórias**
WHEN o sistema realizar a análise de compatibilidade, as necessidades funcionais classificadas como obrigatórias pelo candidato SHALL ser consideradas.


### **RB-07 Perfil técnico**
WHEN o sistema realizar o cálculo do perfil técnico, o sistema SHALL considerar escolaridade, formação, competências e idiomas exigidos pela vaga.


### **RB-08 Divergências recorrentes**
IF forem identificadas divergências recorrentes entre a acessibilidade declarada e a experiência dos candidatos, THEN o sistema SHALL permitir a alteração da acessibilidade associada à empresa.


### **RB-09 Selos de acessibilidade**
IF a empresa atender aos critérios definidos pela plataforma, THEN o administrador SHALL poder conceder o selo de acessibilidade.


### **RB-10 Vagas externas**
WHEN uma vaga for proveniente de uma fonte externa, o sistema SHALL identificá-la como externa e estruturar suas informações antes de utilizá-la.


### **RB-11 Validação da IA**
WHEN informações forem extraídas por LLM, o sistema SHALL submetê-las às regras de validação antes de utilizá-las no cálculo de compatibilidade.


### **RB-12 Controle de acesso**
IF um usuário tentar acessar uma funcionalidade não correspondente ao seu perfil de candidato, recrutador ou administrador, THEN o sistema SHALL negar o acesso.


### **RB-13 Transparência**
WHEN o candidato consultar uma vaga, o sistema SHALL disponibilizar as informações relevantes de acessibilidade antes da realização da candidatura.


### **RB-14 Uma candidatura ativa por vaga**
IF o candidato possuir uma candidatura ativa para uma vaga, THEN o sistema SHALL impedir o registro de uma segunda candidatura ativa para a mesma vaga.


### **RB-15 Barreira crítica prevalece sobre a pontuação**
IF uma barreira de acessibilidade for incompatível com uma necessidade obrigatória do candidato, THEN o sistema SHALL considerar a vaga incompatível independentemente da pontuação obtida nas demais dimensões.


### **RB-16 Dados de acessibilidade não informados**
IF uma informação necessária para verificar a compatibilidade de acessibilidade não estiver disponível, THEN o sistema SHALL classificá-la como não informada e SHALL NOT considerá-la automaticamente compatível.


### **RB-17 Validação de vaga externa**
IF uma vaga for proveniente de fonte externa, THEN o sistema SHALL estruturá-la e validá-la conforme o modelo da plataforma antes de utilizá-la na análise de compatibilidade.


### **RB-18 Resultado da LLM não é fonte de verdade**
IF informações de uma vaga forem obtidas por LLM, THEN o sistema SHALL submetê-las ao processo de validação definido pela plataforma antes de utilizá-las.


### **RB-19 Anonimato das avaliações públicas**
WHEN uma avaliação de acessibilidade for apresentada publicamente, o sistema SHALL preservar a identidade do candidato responsável pelo registro.


### **RB-20 Nota de acessibilidade baseada em dados registrados**
WHEN o sistema calcular a nota pública de acessibilidade de uma empresa, o sistema SHALL utilizar somente avaliações e informações válidas registradas na plataforma, conforme os critérios definidos pela plataforma.
