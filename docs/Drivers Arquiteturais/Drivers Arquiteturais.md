# Drivers Arquiteturais (DAs) — AcessaVagas

Drivers arquiteturais são os requisitos, restrições e cenários que mais impactam as decisões de arquitetura do AcessaVagas.

Não representam o inventário completo de RF, RNF e RB. São o subconjunto de requisitos que obriga a definir fronteiras, regras de domínio, integração com serviços externos, controle de acesso, processamento de dados e atributos de qualidade.

## 1. Critério de seleção

Um item entra neste documento quando atende a pelo menos um dos seguintes critérios:

1. **Obriga uma fronteira** entre componentes ou responsabilidades.
2. **Define um invariante de domínio** que precisa ser garantido pelo sistema.
3. **Impõe uma medida de qualidade** que influencia a estrutura da solução.
4. **Cria uma tensão arquitetural** entre objetivos diferentes.

Requisitos puramente relacionados à apresentação ou a detalhes de interface permanecem como requisitos de produto quando não provocam uma decisão arquitetural.

---

## 2. Mapa priorizado

| ID | Tipo | Driver | Impacto na arquitetura | Prioridade |
|---|---|---|---|---|
| DA-01 | Qualidade | Acessibilidade nativa da interface | Arquitetura de apresentação, componentes acessíveis e suporte a tecnologias assistivas | Alta |
| DA-02 | Restrição | Autenticação e autorização por perfil | Fronteira de segurança, controle de acesso e proteção das operações | Alta |
| DA-03 | Restrição | Trava de compatibilidade por barreira crítica | Regra de domínio executada antes do cálculo de compatibilidade | Alta |
| DA-04 | Requisito | Cálculo determinístico de compatibilidade | Serviço de domínio responsável pelo cálculo e aplicação dos pesos | Alta |
| DA-05 | Restrição | LLM opcional, validada e substituível | Fronteira de integração, validação e independência do domínio em relação ao provedor | Alta |
| DA-06 | Requisito | Padronização de vagas de múltiplas fontes | Modelo único de vaga e camada de normalização das diferentes origens | Alta |
| DA-07 | Qualidade | Rastreabilidade e anonimato das avaliações | Separação entre dados de auditoria e informações apresentadas publicamente | Alta |
| DA-08 | Qualidade | Desempenho das operações principais | Separação de operações locais de processos externos ou potencialmente demorados | Alta |

---

## 3. Requisitos arquiteturalmente significativos

### 3.1 DA-01 — Acessibilidade nativa da interface

O AcessaVagas deve permitir que candidatos PcD utilizem a plataforma independentemente de suas necessidades funcionais.

A acessibilidade não deve ser tratada apenas como característica visual. Ela influencia a arquitetura da camada de apresentação e a forma como os componentes são construídos.

A interface deve considerar:

- navegação por teclado;
- compatibilidade com leitores de tela;
- contraste adequado;
- textos e controles semanticamente identificáveis;
- suporte a diferentes dispositivos;
- recursos de acessibilidade previstos no sistema.

**Decisão que o driver força:** a camada de apresentação deve utilizar componentes e padrões que permitam acessibilidade desde a construção da interface, evitando uma adaptação posterior.

**Origem:** RF-16, RNF-01, RNF-02, RNF-04.

---

### 3.2 DA-02 — Autenticação e autorização por perfil

O sistema possui diferentes perfis de acesso:

- candidato;
- recrutador/empresa;
- administrador.

As permissões não podem depender apenas da interface. As operações devem ser protegidas no backend.

**Decisão que o driver força:** deve existir um mecanismo centralizado de autenticação e autorização por perfil, aplicado no backend nas operações protegidas.

A interface pode ocultar funcionalidades não permitidas, mas isso não substitui a validação no servidor.

**Origem:** RF-01, RF-02, RF-03, RNF-07, RNF-08, RB-12.

---

### 3.3 DA-03 — Trava de compatibilidade por barreira crítica

A compatibilidade entre candidato e vaga possui uma regra de bloqueio absoluto.

Quando uma vaga apresenta uma barreira incompatível com uma necessidade funcional marcada como obrigatória pelo candidato, a vaga deve ser considerada incompatível independentemente da pontuação obtida nos demais critérios.

**Decisão que o driver força:** a verificação de barreiras críticas deve ocorrer antes do cálculo ponderado de compatibilidade.

Fluxo arquitetural:

1. receber candidato e vaga;
2. verificar necessidades obrigatórias;
3. identificar barreiras incompatíveis;
4. bloquear a vaga quando houver incompatibilidade crítica;
5. somente então calcular a compatibilidade ponderada.

**Origem:** RF-07, RF-08, RF-09, RB-02, RB-06, RB-15.

---

### 3.4 DA-04 — Cálculo determinístico de compatibilidade

A análise de compatibilidade deve produzir resultados consistentes para os mesmos dados de entrada.

O cálculo utiliza os seguintes pesos:

| Critério | Peso |
|---|---:|
| Acessibilidade | 50% |
| Perfil técnico | 30% |
| Distância e modalidade | 20% |

A barreira crítica possui prioridade sobre a pontuação.

**Decisão que o driver força:** o cálculo deve estar concentrado em um serviço de domínio específico, independente da interface e da persistência.

Isso permite testar o algoritmo isoladamente e evita que regras de compatibilidade sejam espalhadas entre controllers, telas ou consultas ao banco.

**Origem:** RF-07, RF-08, RF-09, RNF-10, RB-03, RB-04, RB-05, RB-15.

---

### 3.5 DA-05 — LLM opcional, validada e substituível

O sistema pode utilizar uma LLM para auxiliar na importação e interpretação de vagas externas.

A resposta do modelo não deve ser considerada automaticamente como dado confiável.

Fluxo esperado:

1. receber conteúdo externo;
2. enviar para o adaptador da LLM;
3. receber a resposta;
4. converter para uma estrutura padronizada;
5. validar os campos;
6. normalizar os dados;
7. somente então encaminhar para o domínio.

A aplicação deve permanecer funcional mesmo quando a LLM estiver indisponível.

**Decisão que o driver força:** a integração com a LLM deve ficar atrás de uma porta/adaptador, mantendo o domínio independente do SDK ou fornecedor escolhido.

**Origem:** RF-05, RF-18, RB-10, RB-11, RB-17, RB-18, RNF-05, RNF-16.

---

### 3.6 DA-06 — Padronização de vagas de múltiplas fontes

O AcessaVagas trabalha com vagas cadastradas diretamente na plataforma e vagas obtidas de fontes externas.

Apesar das diferentes origens, a análise de compatibilidade precisa utilizar uma estrutura única de vaga.

| Origem | Tratamento |
|---|---|
| Vaga cadastrada na plataforma | Persistida diretamente no modelo de vaga |
| Vaga externa | Extraída, validada e normalizada antes de entrar no domínio |

**Decisão que o driver força:** o domínio deve trabalhar com um modelo comum de Vaga, independentemente de sua origem.

**Origem:** RF-05, RF-18, RB-10, RB-17, RB-18, RNF-16.

---

### 3.7 DA-07 — Rastreabilidade e anonimato das avaliações

O sistema permite avaliações e denúncias relacionadas à acessibilidade das empresas e vagas.

Essas informações precisam ser utilizadas para auditoria e moderação sem expor desnecessariamente a identidade do candidato.

O sistema deve diferenciar:

- dados internos de auditoria;
- informações utilizadas na moderação;
- informações apresentadas publicamente.

**Decisão que o driver força:** os dados de identidade e os dados públicos de avaliação devem possuir tratamento separado, permitindo anonimato na apresentação sem perder rastreabilidade administrativa.

**Origem:** RF-13, RF-14, RF-21, RF-22, RNF-08, RNF-09, RNF-14, RB-19, RB-20.

---

### 3.8 DA-08 — Desempenho das operações principais

As operações principais da plataforma devem apresentar resposta adequada ao usuário.

Operações locais, como autenticação, consulta de vagas, visualização de perfil e consulta de candidaturas, não devem ficar dependentes de processamento externo demorado.

Operações envolvendo fontes externas ou LLM podem possuir latência maior e devem ser tratadas separadamente.

**Decisão que o driver força:** o caminho local da aplicação deve ser separado das integrações externas potencialmente lentas.

O uso de processamento assíncrono, filas ou mecanismos de cache permanece como decisão posterior, caso algum cenário ou medição demonstre necessidade.

**Origem:** RNF-05, RNF-11 e integração com fontes externas.

---

## 4. Atributos de qualidade — cenários

### DA-QA01 — Acessibilidade

| Parte | Conteúdo |
|---|---|
| Fonte | Candidato PcD |
| Estímulo | Navegar, buscar vaga ou realizar candidatura |
| Artefato | Interface web |
| Ambiente | Desktop, tablet ou smartphone |
| Resposta | Sistema permite utilização por tecnologias assistivas e diferentes formas de interação |
| Medida | Conformidade com WCAG 2.1 nível AA |

---

### DA-QA02 — Segurança de acesso

| Parte | Conteúdo |
|---|---|
| Fonte | Usuário autenticado ou não autenticado |
| Estímulo | Solicitação de operação protegida |
| Artefato | API/backend |
| Ambiente | Operação normal ou tentativa indevida |
| Resposta | Sistema permite a operação somente quando o perfil possui autorização |
| Medida | Usuário não autorizado não consegue executar operação protegida mesmo ignorando a interface |

---

### DA-QA03 — Desempenho

| Parte | Conteúdo |
|---|---|
| Fonte | Usuário da plataforma |
| Estímulo | Consulta ou operação local |
| Artefato | Backend e frontend |
| Ambiente | Operação normal |
| Resposta | Resultado apresentado sem dependência de processamento externo desnecessário |
| Medida | Operações principais devem respeitar o tempo definido pelo RNF-05 |

---

### DA-QA04 — Manutenibilidade

| Parte | Conteúdo |
|---|---|
| Fonte | Equipe de desenvolvimento |
| Estímulo | Alteração de regra, integração ou funcionalidade |
| Artefato | Código do sistema |
| Ambiente | Evolução normal |
| Resposta | Alteração localizada no módulo responsável |
| Medida | Alterações no provedor LLM não exigem alteração no domínio de compatibilidade ou vagas |

---

## 5. Cenários arquiteturalmente significativos

### DA-CEN01 — Analisar compatibilidade de candidato e vaga

1. Candidato autenticado consulta uma vaga.
2. Sistema obtém os dados do candidato e da vaga.
3. Sistema verifica as necessidades obrigatórias.
4. Sistema identifica possíveis barreiras críticas.
5. Caso exista incompatibilidade crítica, a vaga é bloqueada.
6. Caso contrário, o sistema calcula a compatibilidade pelos pesos definidos.
7. Resultado é apresentado ao candidato.

**O que a arquitetura precisa ter:** serviço de domínio para compatibilidade, validação de barreiras críticas e separação entre regra de negócio e interface.

---

### DA-CEN02 — Importar vaga externa

1. Sistema recebe uma vaga de fonte externa.
2. Conteúdo é encaminhado para o mecanismo de extração.
3. A LLM retorna dados estruturados.
4. Sistema valida a resposta.
5. Dados são normalizados para o modelo comum de Vaga.
6. Vaga validada é disponibilizada para análise.

**Falha:** resposta inválida ou indisponibilidade da LLM não deve gerar uma vaga inconsistente.

**O que a arquitetura precisa ter:** adaptador de LLM, camada de validação e modelo comum de vaga.

---

### DA-CEN03 — Tentar acessar operação sem autorização

1. Usuário realiza uma requisição.
2. Backend identifica o usuário e seu perfil.
3. Sistema verifica a permissão para a operação.
4. Caso autorizado, executa a operação.
5. Caso não autorizado, rejeita a solicitação.

**O que a arquitetura precisa ter:** autenticação e autorização centralizadas na fronteira do backend.

---

### DA-CEN04 — Registrar avaliação de acessibilidade

1. Candidato registra uma avaliação ou denúncia.
2. Sistema associa o registro ao contexto da vaga ou empresa.
3. Identidade é armazenada para fins internos quando necessário.
4. Dados apresentados publicamente não expõem informações pessoais do candidato.
5. Administrador pode consultar informações necessárias para moderação.

**O que a arquitetura precisa ter:** separação entre dados internos de auditoria e dados públicos.

---

## 6. Tensões que a arquitetura precisa equilibrar

| Tensão | Polo A | Polo B | Direção indicada pelos drivers |
|---|---|---|---|
| Compatibilidade | Pontuação ponderada | Barreira crítica absoluta | Barreira crítica deve ser avaliada primeiro |
| LLM | Flexibilidade da IA | Confiabilidade dos dados | LLM atrás de adaptador + validação |
| Origem das vagas | Cadastro interno | Vagas externas | Modelo comum de Vaga |
| Acessibilidade | Recursos avançados | Simplicidade de uso | Acessibilidade incorporada à apresentação |
| Privacidade | Rastreabilidade administrativa | Anonimato público | Separação entre dados internos e públicos |
| Desempenho | Operações rápidas | Integrações externas | Isolamento do caminho externo |

---

## 7. O que os drivers não decidem ainda

Os DAs não determinam, neste momento:

- banco de dados específico;
- framework HTTP específico;
- biblioteca específica de componentes de interface;
- mecanismo específico de autenticação, como JWT ou sessão/cookie;
- provedor LLM definitivo;
- uso obrigatório de filas assíncronas;
- uso obrigatório de cache;
- arquitetura de microserviços;
- infraestrutura específica de hospedagem.

Essas escolhas podem ser realizadas posteriormente, desde que respeitem os drivers arquiteturais definidos.

---

## 8. Rastreabilidade

A rastreabilidade dos Drivers deve permitir seguir a cadeia:

**Requisito / Regra → Driver → Caso de Uso → ADR / Decisão Técnica**

| Driver | RF | RNF | RB | Casos de Uso | ADR | Decisão Técnica |
|---|---|---|---|---|---|---|
| DA-01 | RF-16 | RNF-01, RNF-02, RNF-04 | — | UC-01, UC-02, UC-03 | ADR-001 | DT-01 |
| DA-02 | RF-01, RF-02, RF-03, RF-40 | RNF-07, RNF-08 | RB-12, RB-21, RB-22 | UC-00, UC-09, UC-10, UC-14 | ADR-002, ADR-004 | DT-02, DT-08 |
| DA-03 | RF-07, RF-08, RF-09 | — | RB-02, RB-06, RB-15 | UC-02, UC-03, UC-13 | ADR-004 | DT-03, DT-08 |
| DA-04 | RF-07, RF-08, RF-09, RF-24, RF-25 | RNF-10, RNF-15 | RB-03, RB-04, RB-05, RB-07, RB-15, RB-16, RB-30 | UC-02, UC-13 | ADR-004 | DT-04, DT-08 |
| DA-05 | RF-05, RF-36, RF-37, RF-39 | RNF-05, RNF-16 | RB-10, RB-11, RB-17, RB-18, RB-32 | UC-14 | ADR-003, ADR-004 | DT-05, DT-08 |
| DA-06 | RF-05, RF-18, RF-36, RF-37, RF-39 | RNF-16 | RB-10, RB-17, RB-18, RB-31, RB-32, RB-33 | UC-08, UC-14 | ADR-003, ADR-004 | DT-06, DT-08 |
| DA-07 | RF-13, RF-14, RF-21, RF-22, RF-38 | RNF-08, RNF-09, RNF-14 | RB-19, RB-20, RB-24, RB-25, RB-27, RB-37, RB-44, RB-45 | UC-06, UC-11 | — | DT-07 |
| DA-08 | — | RNF-05, RNF-11 | — | UC-14 e operações locais da plataforma | ADR-003, ADR-004 | — |

### Observações de rastreabilidade

- **DA-01** conecta a acessibilidade da apresentação ao RF-16 e aos RNFs de acessibilidade e usabilidade. A implementação específica de biblioteca continua deliberadamente aberta pela ADR-001.
- **DA-02** conecta autenticação/autorização aos RFs de acesso, às regras de segurança e às operações administrativas. A fronteira de confiança está registrada na ADR-002 e a separação de camadas na ADR-004.
- **DA-03** e **DA-04** são drivers complementares: o primeiro define a precedência da barreira crítica; o segundo define o cálculo ponderado. Ambos convergem para o domínio e são sustentados por DT-03 e DT-04.
- **DA-05** e **DA-06** formam a cadeia de ingestão externa: extração → validação → normalização → modelo comum de vaga. A ADR-003 trata o isolamento da LLM; a ADR-004 trata a separação arquitetural.
- **DA-07** possui decisão técnica explícita em **DT-07**, mas **não possui ADR específica**. Isso é intencional neste momento: a baseline registra a separação entre dados internos e públicos como decisão técnica, mas não há uma ADR dedicada para essa decisão estrutural.
- **DA-08** influencia o isolamento das integrações externas, mas não fixa fila, cache ou outro mecanismo específico. Por isso, não há decisão técnica específica para uma tecnologia de desempenho.

### Lacunas identificadas

| Lacuna | Situação |
|---|---|
| DA-07 sem ADR específica | Decisão registrada em DT-07; nenhuma nova ADR é criada sem evidência de que a decisão seja estrutural e de difícil reversão. |
| DA-08 sem RF diretamente associado | O driver deriva de RNF-05/RNF-11 e da necessidade arquitetural de separar integrações externas; não foi criado RF artificial para preenchê-lo. |
| Tecnologias específicas | Permanecem abertas conforme seção 7 e conforme as ADRs existentes. |

## 9. Síntese para as próximas decisões

A arquitetura do AcessaVagas precisa, no mínimo:

1. Possuir uma **camada de apresentação acessível**.
2. Possuir **backend responsável por autenticação, autorização e regras de domínio**.
3. Concentrar a **trava de barreiras críticas** antes do cálculo de compatibilidade.
4. Isolar o **serviço determinístico de compatibilidade**.
5. Manter a **LLM atrás de uma porta/adaptador**, com validação da resposta.
6. Utilizar um **modelo comum de vaga** para diferentes fontes.
7. Separar **dados internos de auditoria** das informações apresentadas publicamente.
8. Separar operações locais das **integrações externas potencialmente lentas**.

Esse conjunto representa as principais restrições que o desenho arquitetural posterior deve satisfazer.
