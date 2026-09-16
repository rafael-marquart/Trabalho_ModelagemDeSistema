Os **Drivers Arquiteturais** representam os requisitos, regras e cenários que possuem maior influência sobre as decisões arquiteturais do AcessaVagas. Eles são derivados dos requisitos funcionais, requisitos não funcionais, regras de business, casos de uso e modelo conceitual de domínio, destacando os aspectos que mais impactam a estrutura e o funcionamento do sistema.

Conforme apresentado na disciplina, os drivers não criam novos requisitos, mas **selecionam aquilo que mais pesa na definição da arquitetura**. 

## Tabela de Drivers Arquiteturais

| ID        | Driver                                            | Origem                                    | Impacto arquitetural                                                         |
| --------- | ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| **DA-01** | **Acessibilidade nativa da interface**            | RF-16, RNF-01 a RNF-04                    | Componentes de interface acessíveis e compatíveis com tecnologias assistivas |
| **DA-02** | **Isolamento de dados e controle de acesso**      | RF-01, RF-03, RNF-07 a RNF-09, RB-12      | Autenticação, autorização e proteção dos dados conforme o perfil do usuário  |
| **DA-03** | **Trava de compatibilidade por barreira crítica** | RF-08, RF-09, RB-02 e RB-06               | Regra de domínio executada antes do cálculo de compatibilidade               |
| **DA-04** | **Cálculo determinístico de compatibilidade**     | RF-07, RB-03 a RB-07                      | Serviço independente para cálculo e aplicação dos pesos definidos            |
| **DA-05** | **Validação dos dados extraídos pela LLM**        | RF-05, RB-10 e RB-11                      | Camada de integração, validação e normalização dos dados                     |
| **DA-06** | **Padronização de vagas de múltiplas fontes**     | RF-05, RB-10 e RB-11                      | Modelo comum para vagas internas e externas                                  |
| **DA-07** | **Rastreabilidade e anonimato das avaliações**    | RF-13, RF-14, RF-15, RB-08, RB-09 e RB-13 | Separação entre dados de auditoria e informações apresentadas publicamente   |
| **DA-08** | **Processamento assíncrono de operações pesadas** | RNF-05, RNF-06 e RNF-11                   | Uso de processamento em segundo plano para operações de maior custo          |

---

# DA-01 — Acessibilidade nativa da interface

A acessibilidade é um dos principais drivers arquiteturais do AcessaVagas, pois está diretamente relacionada à proposta central da plataforma. O sistema deve permitir que candidatos com diferentes necessidades funcionais utilizem seus principais fluxos com autonomia, incluindo busca de vagas, visualização de informações e realização de candidaturas.

A arquitetura deve considerar a acessibilidade desde a construção dos componentes da interface, e não como uma funcionalidade adicionada posteriormente. Os elementos devem possuir estrutura semântica adequada e permitir utilização por leitores de tela, teclado, alto contraste e comandos de voz.

Esse driver influencia diretamente a organização da camada de apresentação, a construção dos componentes e os mecanismos de interação com o usuário.

**Origem:** RF-16, RNF-01, RNF-02, RNF-03 e RNF-04.

---

# DA-02 — Isolamento de dados e controle de acesso

O AcessaVagas trabalha com diferentes perfis de usuários e informações que precisam ser protegidas. Candidatos, recrutadores e administradores possuem responsabilidades diferentes e, consequentemente, diferentes níveis de acesso às funcionalidades e aos dados da plataforma.

A arquitetura deve garantir que as permissões sejam verificadas antes da execução das operações, evitando que um usuário consiga acessar ou alterar informações que não pertencem ao seu perfil.

Além do controle de acesso, os dados armazenados devem ser protegidos contra acesso não autorizado, alteração indevida e perda. A arquitetura também deve considerar os requisitos de privacidade e proteção de dados estabelecidos para a plataforma.

Esse driver influencia diretamente os mecanismos de autenticação, autorização, persistência e comunicação entre as camadas do sistema.

**Origem:** RF-01, RF-03, RNF-07, RNF-08, RNF-09 e RB-12.

---

# DA-03 — Trava de compatibilidade por barreira crítica

O AcessaVagas possui uma regra de negócio que diferencia seu mecanismo de compatibilidade de uma simples comparação de palavras-chave. Uma barreira de acessibilidade considerada incompatível com uma necessidade obrigatória do candidato deve impedir que a vaga seja considerada adequada, independentemente dos demais critérios.

Dessa forma, o sistema precisa verificar primeiro as condições de acessibilidade que podem eliminar uma vaga antes de aplicar o cálculo ponderado de compatibilidade.

Esse driver influencia a organização das regras de domínio e exige que a validação das barreiras críticas seja realizada de maneira centralizada e consistente, evitando que diferentes partes do sistema produzam resultados diferentes.

**Origem:** RF-08, RF-09, RB-02 e RB-06.

---

# DA-04 — Cálculo determinístico de compatibilidade

O cálculo de compatibilidade é uma funcionalidade central do AcessaVagas. O sistema deve analisar diferentes características do candidato e da vaga, considerando acessibilidade, perfil técnico, distância e modalidade de trabalho.

As regras de business estabelecem os pesos utilizados no cálculo:

* **50% — Acessibilidade;**
* **30% — Perfil técnico;**
* **20% — Distância e modalidade.**

O resultado deve ser consistente quando os mesmos dados de entrada forem utilizados. Por isso, o cálculo deve ser isolado das demais funcionalidades do sistema, permitindo que suas regras sejam testadas e modificadas sem afetar outras partes da aplicação.

Esse driver influencia diretamente a criação de um componente ou serviço responsável pelo cálculo da compatibilidade.

**Origem:** RF-07, RB-03, RB-04, RB-05, RB-06 e RB-07.

---

# DA-05 — Validação dos dados extraídos pela LLM

O AcessaVagas prevê a utilização de modelos de linguagem para transformar informações não estruturadas de vagas externas em dados estruturados. Entretanto, as informações produzidas pela LLM não devem ser utilizadas diretamente pelo restante do sistema sem validação.

A arquitetura deve separar o processo de extração realizado pela LLM do processo de validação e normalização das informações. Dessa forma, os dados obtidos devem ser analisados antes de serem incorporados ao modelo utilizado pelo AcessaVagas.

Essa separação também permite reduzir o acoplamento entre o domínio do sistema e o provedor ou modelo de linguagem utilizado, facilitando futuras alterações na tecnologia de IA.

**Origem:** RF-05, RB-10 e RB-11.

---

# DA-06 — Padronização de vagas de múltiplas fontes

O AcessaVagas deverá trabalhar com vagas cadastradas diretamente na plataforma e também com vagas provenientes de fontes externas. Essas fontes podem apresentar informações em formatos diferentes, tornando necessário um mecanismo de padronização.

A arquitetura deve permitir que, independentemente da origem, as vagas sejam convertidas para uma estrutura comum antes de serem utilizadas pelas funcionalidades de busca, visualização e compatibilidade.

Essa separação permite que os demais componentes do sistema trabalhem com uma representação única de vaga, sem precisar conhecer detalhes específicos de cada fonte externa.

**Origem:** RF-05, RB-10 e RB-11.

---

# DA-07 — Rastreabilidade e anonimato das avaliações

O sistema possui um mecanismo de feedback e avaliação da acessibilidade das empresas. Essas informações podem ser utilizadas para gerar a nota pública de acessibilidade, identificar divergências e auxiliar na moderação administrativa.

Ao mesmo tempo, a identidade do candidato deve ser preservada na apresentação pública das avaliações.

Portanto, a arquitetura precisa conciliar duas necessidades: **rastreabilidade para fins administrativos** e **anonimato na apresentação pública**. O sistema deve manter as informações necessárias para auditoria e, ao mesmo tempo, disponibilizar publicamente somente os dados permitidos.

Esse driver influencia a forma de armazenamento das avaliações, o controle de acesso e a maneira como os dados são apresentados para diferentes perfis de usuário.

**Origem:** RF-13, RF-14, RF-15, RB-08, RB-09 e RB-13.

---

# DA-08 — Processamento assíncrono de operações pesadas

Algumas operações do AcessaVagas podem exigir maior processamento, principalmente a ingestão de vagas externas, o processamento por LLM e determinadas operações envolvendo grande quantidade de dados.

A arquitetura deve evitar que essas operações bloqueiem desnecessariamente as interações principais do usuário. Para isso, determinadas tarefas podem ser executadas em segundo plano, permitindo que o sistema processe a solicitação sem manter o usuário aguardando durante toda a execução.

Esse driver influencia a forma de comunicação entre os componentes e pode exigir mecanismos de filas, processamento em segundo plano e controle do estado das tarefas.

**Origem:** RNF-05, RNF-06 e RNF-11.

