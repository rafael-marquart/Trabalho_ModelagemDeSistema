# Requisitos

## Requisitos Funcionais

### **RF-01 Autenticação**
O sistema permite cadastro e login de candidatos e administradores.


### **RF-02 Recuperação de senha**
O sistema permite que o usuário redefina sua senha por meio de e-mail.


### **RF-03 Perfis de acesso**
O sistema aplica permissões distintas para candidato, recrutador e administrador.


### **RF-04 Cadastro de candidato**
O sistema permite cadastrar informações pessoais, formação, competências, idiomas e necessidades funcionais de acessibilidade.


### **RF-05 Importação de vagas externas**
O sistema permite visualizar e processar vagas publicadas fora da plataforma.


### **RF-06 Busca e filtro**
O sistema permite buscar e filtrar vagas conforme critérios como área, modalidade, localização e características de acessibilidade.


### **RF-07 Análise de compatibilidade**
O sistema calcula a compatibilidade entre o perfil do candidato e os requisitos da vaga.


### **RF-08 Identificação de barreiras**
O sistema verifica a existência de barreiras de acessibilidade incompatíveis com as necessidades funcionais do candidato.


### **RF-09 Restrição de vaga incompatível**
O sistema impede a recomendação ou candidatura a vagas que apresentem barreiras classificadas como incompatíveis.


### **RF-10 Visualização da vaga**
O sistema exibe ao candidato informações sobre requisitos técnicos, acessibilidade, modalidade e localização da vaga.


### **RF-11 Minhas candidaturas**
O sistema exibe ao candidato suas candidaturas.


### **RF-12 Notificações**
O sistema informa o candidato sobre alterações relevantes sobre vagas.


### **RF-13 Nota de acessibilidade**
O sistema calcula e exibe uma avaliação pública de acessibilidade da empresa com base nos feedbacks recebidos.


### **RF-14 Denúncia de incompatibilidade**
O sistema permite que candidatos denunciem divergências entre a acessibilidade informada pela empresa e a encontrada durante o processo seletivo.


### **RF-15 Gestão de selos**
O sistema permite ao administrador conceder, atualizar ou remover selos de acessibilidade das empresas.


### **RF-16 Recursos de acessibilidade**
O sistema oferece suporte a leitores de tela, navegação por teclado, alto contraste e comandos de voz.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Requisitos Não Funcionais

### **RNF-01 Acessibilidade**
O sistema deve seguir as diretrizes da WCAG 2.1 nível AA, garantindo autonomia aos usuários.


### **RNF-02 Compatibilidade com leitores de tela**
O sistema deve ser compatível com leitores de tela utilizados por pessoas com deficiência visual.


### **RNF-03 Responsividade**
O sistema deve adaptar sua interface a diferentes tamanhos de tela e dispositivos.


### **RNF-04 Usabilidade**
O sistema deve apresentar interface simples, intuitiva e organizada, facilitando a autonomia dos usuários.


### **RNF-05 Desempenho**
O sistema deve apresentar tempo de resposta adequado nas operações de busca, candidatura e consulta de informações.


### **RNF-06 Disponibilidade**
O sistema deve permanecer disponível continuamente, exceto durante períodos programados de manutenção.


### **RNF-07 Segurança**
O sistema deve proteger os dados dos usuários contra acesso, alteração ou utilização não autorizada.


### **RNF-08 Privacidade**
O sistema deve tratar os dados pessoais de acordo com a legislação vigente, especialmente a LGPD.


### **RNF-09 Integridade dos dados**
O sistema deve garantir a consistência e integridade dos dados de candidatos, empresas, vagas e avaliações.


### **RNF-10 Confiabilidade**
O sistema deve garantir resultados consistentes no cálculo de compatibilidade entre candidatos e vagas.


### **RNF-11 Escalabilidade**
O sistema deve permitir o crescimento do número de usuários, empresas, vagas e candidaturas sem perda significativa de desempenho.


### **RNF-12 Manutenibilidade**
O sistema deve possuir estrutura que facilite correções, manutenção e evolução das funcionalidades.


### **RNF-13 Compatibilidade**
O sistema deve funcionar nos principais navegadores e dispositivos utilizados pelos usuários.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
Cada usuário deve acessar somente as funcionalidades correspondentes ao seu perfil de candidato ou administrador.


### **RB-13 Transparência**
O candidato deve ter acesso às informações relevantes de acessibilidade da vaga antes de realizar sua candidatura.
