## Tabela de Decisões Técnicas

| ID | Driver | Decisão técnica |
|---|---|---|
| **DT-01** | **DA-01 — Acessibilidade nativa da interface** | Utilizar componentes de interface acessíveis e semanticamente estruturados, mantendo os recursos de acessibilidade incorporados desde a construção da interface. |
| **DT-02** | **DA-02 — Isolamento de dados e controle de acesso** | Adotar autenticação centralizada e autorização baseada em perfis, com validação das permissões no backend. |
| **DT-03** | **DA-03 — Trava de compatibilidade por barreira crítica** | Implementar a verificação de barreiras críticas como regra de domínio executada antes do cálculo ponderado de compatibilidade. |
| **DT-04** | **DA-04 — Cálculo determinístico de compatibilidade** | Criar um serviço específico para o cálculo de compatibilidade, isolando os critérios e pesos das demais funcionalidades. |
| **DT-05** | **DA-05 — Validação dos dados extraídos pela LLM** | Utilizar uma camada de integração com a LLM responsável pela extração, validação e normalização dos dados antes de enviá-los ao domínio. |
| **DT-06** | **DA-06 — Padronização de vagas de múltiplas fontes** | Utilizar um modelo comum de vaga para representar informações provenientes de fontes internas e externas. |
| **DT-07** | **DA-07 — Rastreabilidade e anonimato das avaliações** | Separar os dados utilizados para auditoria interna das informações apresentadas publicamente, mantendo a identidade do candidato protegida. |
| **DT-08** | **DA-08 — Processamento assíncrono de operações pesadas** | Utilizar processamento assíncrono para tarefas potencialmente demoradas, como ingestão de vagas externas e processamento por LLM. |
| **DT-09** | **Arquitetura geral** | Adotar arquitetura em camadas, separando apresentação, aplicação, domínio e infraestrutura. |

---

## DT-01 — Componentes de Interface Acessíveis

### Driver relacionado

**DA-01 — Acessibilidade nativa da interface**

### Decisão técnica

Utilizar componentes de interface acessíveis e semanticamente estruturados, incorporando os requisitos de acessibilidade desde a construção da interface.

A camada de apresentação deverá considerar navegação por teclado, leitores de tela, alto contraste, comandos de voz e feedbacks semânticos.

A acessibilidade será tratada como parte da construção dos componentes, e não como uma funcionalidade independente adicionada posteriormente.

### Justificativa

Essa decisão permite que os fluxos principais do AcessaVagas sejam acessíveis desde sua implementação e reduz o risco de criar componentes que posteriormente precisem ser reconstruídos para atender aos requisitos de acessibilidade.

---

## DT-02 — Autenticação e Autorização Baseada em Perfis

### Driver relacionado

**DA-02 — Isolamento de dados e controle de acesso**

### Decisão técnica

Adotar autenticação centralizada e autorização baseada nos perfis de usuário, com validação das permissões realizada no backend.

Os principais perfis considerados são:

- Candidato;
- Recrutador;
- Administrador.

Cada operação deverá verificar se o usuário possui permissão para executá-la.

### Justificativa

A validação das permissões no backend evita que o controle de acesso dependa exclusivamente da interface e permite centralizar as regras de autorização.

Essa decisão também facilita a manutenção caso novos perfis ou permissões sejam adicionados posteriormente.

---

## DT-03 — Trava Crítica como Regra de Domínio

### Driver relacionado

**DA-03 — Trava de compatibilidade por barreira crítica**

### Decisão técnica

Implementar a verificação de barreiras críticas como uma regra de domínio, executada antes do cálculo ponderado de compatibilidade.

A regra deverá verificar inicialmente se existe alguma barreira de acessibilidade incompatível com uma necessidade obrigatória do candidato. Caso exista, a vaga deverá ser considerada incompatível.

### Justificativa

A regra de acessibilidade é uma regra central do negócio e não deve ficar dependente de uma tela específica ou de um Controller.

Mantê-la no domínio permite que qualquer solicitação de análise de compatibilidade passe pela mesma regra, garantindo consistência nos resultados.

---

## DT-04 — Serviço Independente de Compatibilidade

### Driver relacionado

**DA-04 — Cálculo determinístico de compatibilidade**

### Decisão técnica

Criar um serviço específico para realizar o cálculo de compatibilidade entre candidato e vaga.

Esse serviço será responsável por considerar:

- Acessibilidade;
- Perfil técnico;
- Distância;
- Modalidade;
- Pesos definidos pelas regras de business.

O cálculo deverá ser executado de forma determinística, produzindo resultados consistentes quando os mesmos dados de entrada forem utilizados.

### Justificativa

A separação do cálculo permite centralizar as regras de compatibilidade, facilitar a realização de testes e possibilitar alterações nos critérios ou pesos sem modificar diretamente outras funcionalidades do sistema.

---

## DT-05 — Camada de Integração e Validação da LLM

### Driver relacionado

**DA-05 — Validação dos dados extraídos pela LLM**

### Decisão técnica

A integração com o modelo de linguagem será realizada por uma camada específica de integração.

Essa camada será responsável por solicitar a extração das informações da vaga, receber os dados estruturados, realizar sua validação e normalização e, somente depois, disponibilizá-los para utilização pelo domínio.

O domínio não deverá possuir dependência direta de um provedor específico de LLM.

### Justificativa

Essa decisão permite substituir o modelo ou provedor utilizado sem alterar as regras centrais do AcessaVagas.

Além disso, a validação antes da entrada no domínio reduz o risco de informações incorretas produzidas pela LLM serem utilizadas diretamente no cálculo de compatibilidade.

---

## DT-06 — Modelo Comum para Vagas

### Driver relacionado

**DA-06 — Padronização de vagas de múltiplas fontes**

### Decisão técnica

Utilizar uma representação comum para as vagas, independentemente de sua origem.

Vagas cadastradas diretamente por recrutadores e vagas obtidas de fontes externas deverão ser convertidas para uma estrutura comum antes de serem utilizadas pelas funcionalidades da plataforma.

### Justificativa

Essa decisão evita que as funcionalidades de busca, visualização e compatibilidade precisem conhecer as características específicas de cada fonte.

Também facilita a inclusão de novas fontes de vagas no futuro, pois cada nova integração precisará apenas realizar a conversão para o modelo comum utilizado pelo sistema.

---

## DT-07 — Separação entre Auditoria e Visão Pública

### Driver relacionado

**DA-07 — Rastreabilidade e anonimato das avaliações**

### Decisão técnica

Separar as informações necessárias para auditoria administrativa das informações disponibilizadas publicamente.

O sistema deverá manter internamente os dados necessários para rastreabilidade, análise e moderação das avaliações. Na apresentação pública, a identidade do candidato deverá permanecer protegida.

### Justificativa

Essa decisão permite conciliar duas necessidades do sistema: rastreabilidade para fins administrativos e proteção da identidade do candidato.

A separação também facilita a aplicação das regras relacionadas à reputação, avaliações e denúncias.

---

## DT-08 — Processamento Assíncrono

### Driver relacionado

**DA-08 — Processamento assíncrono de operações pesadas**

### Decisão técnica

Utilizar processamento assíncrono para operações que possam demandar maior tempo de execução, especialmente:

- Ingestão de vagas externas;
- Processamento por LLM;
- Processamento de grandes volumes de dados.

Essas operações deverão poder ser executadas em segundo plano quando não houver necessidade de resposta imediata ao usuário.

### Justificativa

A decisão evita que operações demoradas bloqueiem as interações principais do usuário.

Também permite que o sistema processe tarefas em segundo plano e facilita sua evolução conforme o volume de dados e usuários aumente.

---

## DT-09 — Arquitetura em Camadas

### Driver relacionado

**DA-01, DA-02, DA-03, DA-04, DA-05 e DA-08**

### Decisão técnica

Adotar uma arquitetura em camadas, separando as responsabilidades do sistema em diferentes níveis:

- Apresentação;
- Aplicação;
- Domínio;
- Infraestrutura.

A camada de apresentação será responsável pela interação com o usuário. A camada de aplicação coordenará os casos de uso. A camada de domínio concentrará as regras de negócio e os principais serviços do AcessaVagas. A camada de infraestrutura será responsável pelas integrações externas, persistência e demais recursos técnicos.

### Justificativa

A arquitetura em camadas permite separar as regras centrais do AcessaVagas das tecnologias utilizadas para interface, persistência e integrações externas.

Essa separação é especialmente importante para o projeto devido à existência de regras de negócio relevantes, como a trava de acessibilidade e o cálculo de compatibilidade, além da integração com LLM e fontes externas.

A decisão também facilita a manutenção, os testes e a evolução do sistema, reduzindo o acoplamento entre as diferentes partes da aplicação.
