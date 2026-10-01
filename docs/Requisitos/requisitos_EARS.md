# Requisitos EARS

## Requisitos Funcionais

Os requisitos funcionais abaixo mantêm a mesma numeração e escopo definidos em RF.md.

### **RF-

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

## Regras de Negócio

Os requisitos de negócio abaixo mantêm a mesma numeração e conteúdo definido em RB.md. As regras devem ser interpretadas como condições EARS equivalentes aos respectivos comportamentos do sistema.

### **RB-01 Elegibilidade para candidatura**
O sistema deve permitir que o candidato se candidate somente a vagas disponíveis e não bloqueadas.

### **RB-02 Trava de acessibilidade**
Caso exista uma barreira de acessibilidade incompatível com uma necessidade obrigatória do candidato, a vaga deve ser considerada incompatível.

### **RB-03 Peso da acessibilidade**
A acessibilidade deve representar 50% do cálculo de compatibilidade entre candidato e vaga.

### **RB-04 Peso do perfil técnico**
O perfil técnico deve representar 30% do cálculo de compatibilidade.

### **RB-05 Peso de distância e modalidade**
A distância e a modalidade da vaga devem representar 20% do cálculo de compatibilidade.

### **RB-06 Necessidades obrigatórias**
As necessidades funcionais classificadas como obrigatórias pelo candidato devem ser consideradas na análise de compatibilidade.

### **RB-07 Perfil técnico**
O cálculo técnico deve considerar escolaridade, formação, competências e idiomas exigidos pela vaga.

### **RB-08 Divergências recorrentes**
A ocorrência recorrente de divergências entre a acessibilidade declarada e a experiência dos candidatos deve permitir a alteração da acessibilidade associada à empresa, conforme as regras de análise administrativa.

### **RB-09 Selos de acessibilidade**
Os selos de acessibilidade devem ser concedidos somente quando a empresa atender aos critérios definidos pela plataforma.

### **RB-10 Vagas externas**
Vagas provenientes de fontes externas devem ser identificadas como externas e ter suas informações estruturadas antes de serem utilizadas pelo sistema.

### **RB-11 Validação da IA**
Informações extraídas por LLM devem passar pelas regras de validação definidas pelo sistema antes de serem utilizadas no cálculo de compatibilidade.

### **RB-12 Controle de acesso**
Cada usuário deve acessar somente as funcionalidades correspondentes ao seu perfil de candidato, recrutador ou administrador.

### **RB-13 Transparência**
O candidato deve ter acesso às informações relevantes de acessibilidade da vaga antes de realizar sua candidatura.

### **RB-14 Uma candidatura ativa por vaga**
O candidato não pode possuir mais de uma candidatura ativa para a mesma vaga.

### **RB-15 Barreira crítica prevalece sobre a pontuação**
Uma barreira de acessibilidade classificada como incompatível com uma necessidade obrigatória impede a candidatura ou recomendação da vaga, independentemente da pontuação obtida nas demais dimensões.

### **RB-16 Dados de acessibilidade não informados**
Quando uma informação de acessibilidade necessária para verificar a compatibilidade não estiver disponível, o sistema deve classificá-la como não informada, não assumindo automaticamente sua existência ou compatibilidade.

### **RB-17 Validação de vaga externa**
Vagas provenientes de fontes externas somente podem participar da análise de compatibilidade após serem estruturadas e validadas conforme o modelo de dados da plataforma.

### **RB-18 Resultado da LLM não é fonte de verdade**
As informações extraídas por LLM não podem ser consideradas válidas sem passar pelo processo de validação definido pelo sistema.

### **RB-19 Anonimato das avaliações públicas**
As avaliações apresentadas publicamente devem preservar a identidade do candidato responsável pelo registro.

### **RB-20 Nota de acessibilidade baseada em dados registrados**
A nota pública de acessibilidade da empresa deve ser calculada a partir das avaliações e informações válidas registradas no sistema, conforme os critérios definidos pela plataforma.

### **RB-21 Segurança de autenticação**
As operações de autenticação devem seguir os mecanismos de segurança definidos pelo sistema e impedir acesso mediante credenciais inválidas.

### **RB-22 Controle de sessão**
As funcionalidades protegidas devem estar disponíveis somente durante uma sessão válida e autorizada.

### **RB-23 Transparência de status**
O candidato deve receber informações claras sobre o status de sua candidatura e, quando aplicável, sobre alterações relevantes da vaga.

### **RB-24 Proteção contra abuso**
O sistema deve registrar e aplicar controles para impedir uso abusivo de funcionalidades como denúncias e candidaturas.

### **RB-25 Apuração de denúncias**
Denúncias de incompatibilidade ou acessibilidade devem ser encaminhadas para análise de um Administrador antes de qualquer bloqueio ou alteração da nota de acessibilidade.

### **RB-26 Confidencialidade das informações de acessibilidade**
Informações de acessibilidade do candidato devem ser disponibilizadas somente aos usuários autorizados e necessárias ao processo de compatibilidade ou seleção.

### **RB-27 Histórico de alterações**
Alterações relevantes em informações de perfil, candidaturas, acomodações, vagas e processos seletivos devem manter registro para rastreabilidade.

### **RB-28 Autodeclaração das necessidades**
O candidato pode informar suas necessidades de acessibilidade por autodeclaração, sem necessidade de armazenamento de laudo médico na plataforma.

### **RB-29 Informações mínimas do perfil**
O candidato deve possuir as informações mínimas necessárias para que o sistema realize a análise de compatibilidade.

### **RB-30 Transparência do resultado**
O resultado de compatibilidade deve apresentar ao candidato os principais fatores considerados no cálculo.

### **RB-31 Deduplicação de dados externos**
Registros externos duplicados não devem gerar múltiplos registros equivalentes no sistema.

### **RB-32 Integridade da importação**
Falhas durante uma importação não devem comprometer registros válidos previamente existentes.

### **RB-33 Registro da origem da vaga**
Vagas provenientes de fontes externas devem manter a identificação de sua origem.

### **RB-34 Candidatura somente em vaga elegível**
O candidato somente poderá registrar candidatura quando a vaga estiver disponível, não bloqueada e compatível com suas necessidades obrigatórias.

### **RB-35 Uma candidatura ativa por vaga**
O sistema deve impedir uma segunda candidatura ativa do mesmo candidato para a mesma vaga.

### **RB-36 Cancelamento de candidatura**
O cancelamento de uma candidatura deve respeitar as regras e os estados do processo seletivo.

### **RB-37 Registro das decisões**
Decisões relevantes de recrutadores e administradores devem ser registradas para rastreabilidade.

### **RB-38 Estados do funil**
O sistema deve padronizar os estados do funil de seleção definidos pelo processo.

### **RB-39 Transições válidas do funil**
O sistema deve impedir transições inválidas entre os estados do funil.

### **RB-40 Visibilidade das acomodações**
As solicitações de acomodação e suas decisões devem ser apresentadas de forma clara aos usuários autorizados envolvidos no processo seletivo.

### **RB-41 Auditoria das alterações**
Alterações de status, decisões, cancelamentos e demais operações relevantes devem ser registradas com informações suficientes para auditoria.

### **RB-42 Vaga encerrada**
Quando uma vaga for encerrada, novas candidaturas devem ser impedidas e candidatos em processo ativo devem receber informação sobre o encerramento.

### **RB-43 Validação para avanço no processo**
O avanço de uma candidatura para determinada etapa deve respeitar as condições e regras definidas para o processo seletivo.

### **RB-44 Análise administrativa de denúncias**
Uma denúncia não deve alterar automaticamente a nota de acessibilidade nem bloquear uma vaga. A ocorrência deve ser analisada por um Administrador antes da decisão.

### **RB-45 Decisão sobre denúncia**
Após a análise administrativa, uma denúncia poderá resultar, conforme a decisão registrada e as regras da plataforma, em alteração das informações de acessibilidade, da nota ou do status da vaga.
