# Requisitos de Negócios

## Requisitos de Negócios

### **RB-01 Limite de candidaturas**
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
A ocorrência recorrente de divergências entre a acessibilidade declarada e a experiência dos candidatos deve permitir a alteração da acessibilidade associada à empresa.


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
