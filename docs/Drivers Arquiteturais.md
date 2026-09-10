| ID        | Driver                      | Origem                       | Impacto                                       |
| --------- | --------------------------- | ---------------------------- | --------------------------------------------- |
| **DA-01** | Acessibilidade              | RF-16, RNF-01 a RNF-04       | Interface e componentes acessíveis            |
| **DA-02** | Segurança e Privacidade     | RF-01, RF-03, RNF-07, RNF-08 | Autenticação, autorização e proteção de dados |
| **DA-03** | Motor de Compatibilidade    | RF-07 a RF-09, RB-02 a RB-07 | Módulo independente de cálculo                |
| **DA-04** | Integração com LLM          | RF-05, RB-10, RB-11          | Serviço de IA + validação                     |
| **DA-05** | Auditoria e Reputação       | RF-13 a RF-15                | Histórico, avaliações e moderação             |
| **DA-06** | Integração de Vagas         | RF-05, RB-10                 | Mecanismo de ingestão e padronização          |
| **DA-07** | Desempenho e Escalabilidade | RNF-05, RNF-06, RNF-11       | Cache, filas e escalabilidade                 |





## DA-01 — Acessibilidade

A acessibilidade é o principal driver arquitetural do AcessaVagas, pois constitui um dos fundamentos da proposta da plataforma. O sistema deve garantir que candidatos com diferentes tipos de deficiência possam utilizar seus recursos com autonomia e segurança durante a busca, análise e candidatura às vagas.

A arquitetura deve permitir a construção de uma interface compatível com tecnologias assistivas, incluindo leitores de tela, navegação por teclado, alto contraste e comandos de voz. Além disso, os componentes da interface devem possuir estrutura semântica adequada, permitindo que as informações sejam corretamente interpretadas pelas tecnologias utilizadas pelos usuários.

Esse driver também influencia a forma como as funcionalidades serão desenvolvidas, pois a acessibilidade não deve ser adicionada posteriormente como uma característica complementar, mas considerada desde a concepção dos componentes e fluxos do sistema.

**Origem:** RF-16, RNF-01, RNF-02, RNF-03 e RNF-04.

---

## DA-02 — Segurança e Privacidade

O AcessaVagas armazenará informações relacionadas aos candidatos, empresas, vagas, candidaturas e necessidades funcionais de acessibilidade. Dessa forma, a segurança e a privacidade dos dados são fatores fundamentais para a arquitetura do sistema.

A arquitetura deve garantir que cada usuário tenha acesso somente às funcionalidades e informações correspondentes ao seu perfil. Para isso, devem ser considerados mecanismos de autenticação, autorização e controle de acesso.

Também devem ser adotadas medidas para proteger os dados contra acesso não autorizado, alterações indevidas e perda de informações. O tratamento dos dados deve considerar a legislação vigente, especialmente a **Lei Geral de Proteção de Dados (LGPD)**.

Esse driver também influencia o armazenamento e o fluxo das informações, principalmente nos casos envolvendo avaliações e denúncias, nos quais a identidade do candidato deve ser preservada na apresentação pública.

**Origem:** RF-01, RF-03, RNF-07, RNF-08, RNF-09 e RB-12.

---

## DA-03 — Motor de Compatibilidade

O motor de compatibilidade é um dos principais diferenciais do AcessaVagas, sendo responsável por determinar o nível de adequação entre um candidato e uma determinada vaga.

A arquitetura deve permitir que esse mecanismo analise diferentes dimensões do perfil, considerando principalmente a acessibilidade, o perfil técnico, a distância e a modalidade de trabalho. O sistema deverá aplicar os pesos definidos pelas regras de negócio e também verificar a existência de barreiras de acessibilidade consideradas eliminatórias.

Por possuir regras específicas e ser uma funcionalidade central da plataforma, o motor de compatibilidade deve ser desenvolvido de forma independente dos demais componentes. Essa separação facilita a realização de testes, manutenção e futuras alterações nos critérios ou pesos utilizados no cálculo.

Além disso, a arquitetura deve garantir que uma barreira crítica de acessibilidade tenha prioridade sobre uma alta compatibilidade técnica, evitando que uma vaga inadequada seja recomendada ao candidato.

**Origem:** RF-07, RF-08, RF-09, RB-02, RB-03, RB-04, RB-05, RB-06 e RB-07.

---

## DA-04 — Integração com LLM

O uso de modelos de linguagem (LLM) é um dos recursos tecnológicos utilizados pelo AcessaVagas para processar vagas provenientes de fontes externas.

A arquitetura deve possibilitar que informações apresentadas originalmente em texto livre sejam enviadas ao modelo de linguagem para identificação e organização dos dados relevantes da vaga. O resultado deverá ser estruturado em um formato padronizado, como JSON, permitindo que essas informações sejam posteriormente utilizadas pelo sistema.

Entretanto, os dados produzidos pela LLM não devem ser considerados automaticamente válidos. A arquitetura deve possuir uma etapa de validação responsável por verificar se as informações extraídas estão de acordo com a estrutura e as regras definidas pela plataforma antes que sejam utilizadas no cálculo de compatibilidade.

Essa separação entre **extração, validação e utilização dos dados** reduz os riscos relacionados a informações incorretas ou incompletas produzidas pelo modelo de linguagem.

**Origem:** RF-05, RB-10 e RB-11.

---

## DA-05 — Auditoria e Reputação

A auditoria e a reputação representam outro aspecto importante da arquitetura do AcessaVagas, pois a plataforma busca reduzir situações de falsa inclusão e permitir que a experiência dos candidatos contribua para a avaliação da acessibilidade das empresas.

A arquitetura deve permitir o registro das avaliações realizadas após as entrevistas, das denúncias de incompatibilidade e das ações realizadas pelos administradores. Essas informações devem possuir rastreabilidade suficiente para permitir a análise de possíveis divergências entre a acessibilidade declarada pela empresa e a experiência relatada pelos candidatos.

Ao mesmo tempo, a arquitetura deve preservar o anonimato do candidato na apresentação pública das avaliações. Dessa forma, o sistema deve separar as informações necessárias para auditoria interna daquelas que podem ser apresentadas publicamente.

Esse driver também contempla a possibilidade de utilização dos dados das avaliações para composição da nota pública de acessibilidade e para identificação de padrões de divergências que possam resultar em ações administrativas.

**Origem:** RF-13, RF-14, RF-15, RB-08, RB-09 e RB-13.

---

## DA-06 — Integração e Ingestão de Vagas

O AcessaVagas deverá trabalhar com vagas cadastradas diretamente por empresas e também com vagas provenientes de fontes externas. Essa característica exige uma arquitetura capaz de receber informações de diferentes origens e transformá-las em uma estrutura comum dentro da plataforma.

A arquitetura deve separar o processo de obtenção das vagas do seu processamento e utilização. Vagas externas devem ser identificadas como tal e passar pelo processo de estruturação e validação antes de serem disponibilizadas para os mecanismos de busca e compatibilidade.

Essa abordagem permite que diferentes fontes sejam incorporadas ao sistema sem que cada uma delas precise possuir uma estrutura completamente diferente. Dessa forma, a plataforma pode evoluir futuramente para trabalhar com novas fontes de vagas ou diferentes formas de integração.

Esse driver também está diretamente relacionado ao uso da LLM, uma vez que as vagas externas podem apresentar informações não estruturadas que precisam ser convertidas para o modelo de dados utilizado pelo AcessaVagas.

**Origem:** RF-05, RB-10 e RB-11.

---

## DA-07 — Desempenho e Escalabilidade

O AcessaVagas deve ser capaz de atender ao crescimento da quantidade de candidatos, empresas, vagas e candidaturas sem comprometer significativamente a experiência dos usuários.

A arquitetura deve, portanto, permitir que os componentes mais utilizados ou que demandem maior processamento possam ser ampliados conforme a necessidade. Entre as operações que podem exigir maior processamento estão a ingestão de vagas externas, a utilização de modelos de linguagem e o cálculo de compatibilidade.

Também deve ser considerada a execução de tarefas que não precisam ocorrer imediatamente na interação do usuário, permitindo que determinados processamentos sejam realizados de forma assíncrona. Isso evita que operações mais demoradas prejudiquem o tempo de resposta da plataforma.

Além disso, a arquitetura deve considerar mecanismos que contribuam para a disponibilidade e o desempenho do sistema, permitindo sua evolução conforme o número de usuários e o volume de informações aumentem.

**Origem:** RNF-05, RNF-06 e RNF-11.
