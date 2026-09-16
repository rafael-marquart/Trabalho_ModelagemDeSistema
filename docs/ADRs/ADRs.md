# ADRs — AcessaVagas

Os Architecture Decision Records (ADRs) registram as principais decisões arquiteturais tomadas durante o desenvolvimento do AcessaVagas, apresentando o contexto da decisão, as alternativas consideradas e suas consequências.

Nem toda decisão técnica necessita de um ADR. Neste projeto, foram selecionadas as decisões que possuem maior impacto estrutural e cujo processo de alteração posterior poderia exigir mudanças significativas na arquitetura ou reescrita de partes do sistema.

---

# ADR-01 — Adoção de acessibilidade nativa na interface

## Status

Proposto

## Contexto

O AcessaVagas possui como característica fundamental a oferta de uma plataforma acessível para pessoas com diferentes necessidades funcionais. Os requisitos estabelecem suporte a leitores de tela, navegação por teclado, alto contraste, comandos de voz e demais recursos necessários para garantir autonomia aos usuários.

A acessibilidade influencia diretamente a camada de apresentação e a forma como os componentes da interface são desenvolvidos. Caso esses requisitos sejam considerados somente após a implementação da interface, poderão ser necessárias alterações significativas nos componentes e nos fluxos de interação.

## Decisão

Adotar componentes de interface acessíveis e semanticamente estruturados, considerando os requisitos de acessibilidade desde a construção da camada de apresentação.

A interface deverá ser desenvolvida considerando as diretrizes da WCAG 2.1 nível AA e a compatibilidade com tecnologias assistivas.

## Alternativas consideradas

### 1. Adicionar acessibilidade posteriormente

A interface seria desenvolvida inicialmente sem considerar os requisitos de acessibilidade, realizando adaptações após sua implementação.

**Motivo da não escolha:** essa abordagem aumenta o risco de retrabalho e pode exigir alterações estruturais nos componentes e fluxos já implementados.

### 2. Utilizar componentes acessíveis desde o início

Os requisitos de acessibilidade são considerados na construção dos componentes e fluxos da interface.

**Motivo da escolha:** reduz retrabalho e permite que a acessibilidade faça parte da estrutura da aplicação desde o início.

## Consequências

### Positivas

- Maior compatibilidade com tecnologias assistivas;
- Redução de retrabalho durante o desenvolvimento;
- Maior autonomia dos usuários;
- Atendimento aos requisitos de acessibilidade definidos para o sistema;
- Padronização dos componentes acessíveis.

### Negativas

- Os componentes deverão seguir critérios adicionais de desenvolvimento;
- Testes de acessibilidade deverão fazer parte do processo de desenvolvimento;
- Alguns componentes podem exigir maior esforço de implementação.

---

# ADR-02 — Autenticação e autorização baseada em perfis

## Status

Proposto

## Contexto

O AcessaVagas possui diferentes perfis de usuários, como candidato, recrutador e administrador. Cada perfil possui diferentes responsabilidades e permissões dentro da plataforma.

O sistema também trabalha com informações que precisam ser protegidas contra acesso ou alteração não autorizada.

O controle de acesso não pode depender exclusivamente da interface, pois um usuário poderia tentar acessar diretamente uma funcionalidade ou recurso por outros meios.

## Decisão

Adotar autenticação centralizada e autorização baseada em perfis, com validação das permissões no backend.

As permissões deverão ser verificadas antes da execução de operações que exijam autorização específica.

## Alternativas consideradas

### 1. Controle de acesso somente no frontend

A interface esconderia funcionalidades não permitidas para determinado usuário.

**Motivo da não escolha:** esconder uma funcionalidade na interface não impede que uma requisição seja realizada diretamente ao backend.

### 2. Controle de permissões distribuído entre as funcionalidades

Cada funcionalidade seria responsável por implementar suas próprias verificações de acesso.

**Motivo da não escolha:** aumenta a duplicação de regras e o risco de comportamentos inconsistentes.

### 3. Autorização centralizada baseada em perfis

As permissões são definidas de acordo com o perfil do usuário e verificadas no backend.

**Motivo da escolha:** permite centralizar as regras de autorização e manter um controle consistente dos acessos.

## Consequências

### Positivas

- Maior controle sobre o acesso às funcionalidades;
- Centralização das regras de autorização;
- Redução do risco de acesso indevido;
- Facilidade para adicionar ou modificar perfis;
- Maior proteção dos dados dos usuários.

### Negativas

- Necessidade de manter corretamente os perfis e permissões;
- A implementação exige mecanismos adicionais de autenticação e autorização;
- Alterações nos perfis podem exigir atualização das regras de acesso.

---

# ADR-03 — Integração com LLM por camada de adaptação e validação

## Status

Proposto

## Contexto

O AcessaVagas utiliza modelos de linguagem (LLM) para extrair e estruturar informações de vagas provenientes de fontes externas.

A saída produzida pela LLM não deve ser considerada automaticamente válida, pois pode apresentar informações incompletas, incorretas ou diferentes do formato esperado pelo sistema.

Além disso, o domínio da aplicação não deve depender diretamente de um provedor específico de modelo de linguagem, pois isso dificultaria uma futura substituição da tecnologia utilizada.

## Decisão

Criar uma camada específica de integração com a LLM, responsável por realizar a comunicação com o modelo, receber os dados estruturados, validar as informações e realizar sua normalização antes que os dados sejam disponibilizados ao domínio.

As regras de negócio do AcessaVagas não deverão depender diretamente do provedor ou da implementação específica da LLM.

## Alternativas consideradas

### 1. Integrar a LLM diretamente ao domínio

As regras de negócio realizariam diretamente as chamadas ao modelo de linguagem.

**Motivo da não escolha:** criaria forte acoplamento entre o domínio e uma tecnologia externa.

### 2. Integrar a LLM diretamente nos Controllers

Os Controllers seriam responsáveis por realizar as chamadas e tratar os resultados.

**Motivo da não escolha:** concentraria responsabilidades diferentes na camada de entrada e dificultaria testes e manutenção.

### 3. Utilizar uma camada de adaptação e validação

Uma camada específica seria responsável pela comunicação com a LLM, validação e normalização dos dados.

**Motivo da escolha:** reduz o acoplamento e mantém as regras de negócio independentes da tecnologia de IA utilizada.

## Consequências

### Positivas

- Redução do acoplamento entre o domínio e a LLM;
- Possibilidade de substituir o provedor ou modelo utilizado;
- Centralização da validação dos dados extraídos;
- Maior facilidade para realização de testes;
- Maior controle sobre informações provenientes de fontes externas.

### Negativas

- Necessidade de implementar uma camada adicional;
- A integração passa a possuir mais etapas de processamento;
- Será necessário tratar falhas ou respostas inválidas da LLM.

---

# ADR-04 — Adoção de arquitetura em camadas

## Status

Proposto

## Contexto

O AcessaVagas possui diferentes responsabilidades, incluindo interface do usuário, execução dos casos de uso, regras de negócio, persistência de dados e integrações externas.

Entre as regras centrais estão o cálculo de compatibilidade, a identificação de barreiras de acessibilidade e a validação das informações provenientes de vagas externas.

Essas regras não devem depender diretamente da interface, do banco de dados ou de serviços externos.

## Decisão

Adotar uma arquitetura em camadas, separando as responsabilidades do sistema em:

- Apresentação;
- Aplicação;
- Domínio;
- Infraestrutura.

A camada de domínio deverá concentrar as principais regras de negócio e permanecer independente das tecnologias utilizadas nas demais camadas.

A camada de infraestrutura será responsável por recursos externos, como persistência de dados, integração com LLM e fontes externas de vagas.

## Alternativas consideradas

### 1. Arquitetura sem separação clara de responsabilidades

As funcionalidades seriam implementadas de forma centralizada, permitindo que diferentes partes do sistema acessassem diretamente banco de dados e serviços externos.

**Motivo da não escolha:** aumenta o acoplamento e dificulta manutenção, testes e evolução do sistema.

### 2. Arquitetura MVC tradicional

A aplicação seria organizada principalmente nas estruturas Model, View e Controller.

**Motivo da não escolha:** embora organize a aplicação, não proporciona, isoladamente, uma separação suficientemente clara entre as regras de negócio, os casos de uso e as integrações externas necessárias ao AcessaVagas.

### 3. Arquitetura em camadas

As responsabilidades são divididas entre apresentação, aplicação, domínio e infraestrutura.

**Motivo da escolha:** permite separar as regras centrais do sistema das tecnologias utilizadas para interface, persistência e integrações.

## Consequências

### Positivas

- Separação clara de responsabilidades;
- Redução do acoplamento entre as partes do sistema;
- Maior facilidade para testar as regras de negócio;
- Possibilidade de alterar tecnologias externas sem modificar diretamente o domínio;
- Maior facilidade de manutenção e evolução;
- Organização mais clara dos componentes do sistema.

### Negativas

- Maior quantidade de classes e interfaces;
- Maior complexidade inicial em comparação com uma estrutura sem separação de camadas;
- Necessidade de definir corretamente as responsabilidades de cada camada.

---

# Relação entre ADRs, Drivers e Decisões Técnicas

| ADR | Driver relacionado | Decisão técnica |
|---|---|---|
| **ADR-01** | DA-01 — Acessibilidade nativa da interface | DT-01 — Componentes de interface acessíveis |
| **ADR-02** | DA-02 — Isolamento de dados e controle de acesso | DT-02 — Autenticação e autorização baseada em perfis |
| **ADR-03** | DA-05 — Validação dos dados extraídos pela LLM | DT-05 — Camada de integração e validação da LLM |
| **ADR-04** | DA-01, DA-02, DA-03, DA-04, DA-05 e DA-08 | DT-09 — Arquitetura em camadas |
