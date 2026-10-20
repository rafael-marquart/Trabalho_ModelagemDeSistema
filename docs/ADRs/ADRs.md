# ADRs — AcessaVagas

Uma ADR (Architecture Decision Record) registra uma decisão técnica que possui impacto estrutural e cujo desfazimento possui custo significativo.

Ela registra:

- o que foi decidido;
- por que a decisão foi tomada;
- quais alternativas foram consideradas;
- quais consequências passam a valer.

## Critério de reversibilidade

Só entra neste arquivo a decisão que realmente amarra o projeto.

Teste utilizado:

- se desfazer custa apenas uma troca local, não há ADR;
- se desfazer exige reescrever a arquitetura, contrato, modelo persistido ou fronteira de confiança, há ADR.

Os Drivers Arquiteturais explicam **o que a arquitetura precisa satisfazer**.

As ADRs registram **o que foi escolhido** quando a escolha é estrutural e difícil de reverter.

---

## 1. Mapa de ADRs

| ID | Decisão | Por que é cara |
|---|---|---|
| ADR-001 | Interface web acessível como requisito arquitetural | Alterar posteriormente toda a estratégia de apresentação e acessibilidade exigiria revisar componentes e fluxos da interface |
| ADR-002 | Autenticação e autorização centralizadas no backend | Mover posteriormente a fronteira de confiança exigiria alterar todas as operações protegidas |
| ADR-003 | LLM somente no backend, atrás de adaptador | Acoplar o domínio ou frontend ao fornecedor dificultaria substituição, testes e controle de segurança |
| ADR-004 | Arquitetura em camadas | Alterar posteriormente a organização estrutural exigiria redistribuir responsabilidades e dependências do sistema |

---

## 2. O que deliberadamente não tem ADR

Estas escolhas são reversíveis ou ainda não foram tomadas.

| Tema | Por que não é ADR agora |
|---|---|
| Biblioteca específica de componentes de UI | Pode ser substituída sem alterar o domínio |
| Biblioteca CSS | Não altera o contrato do backend |
| Framework HTTP específico | Pode ser trocado mantendo a API e as camadas |
| Banco de dados específico | Ainda não existe driver que obrigue uma tecnologia específica |
| JWT versus sessão/cookie | É um mecanismo de autenticação; a decisão estrutural é manter autorização no backend |
| Provedor LLM específico | O adaptador permite substituir o fornecedor |
| Fila assíncrona | Pode ser introduzida posteriormente caso o desempenho ou algum cenário exija |
| Cache | Não é exigido pelos drivers atuais |
| Microserviços | Os drivers não exigem distribuição; introduzir essa complexidade agora seria uma decisão estrutural adicional |
| Biblioteca específica de leitor de tela | A arquitetura deve ser acessível, mas não depende de um fornecedor específico |
| Serviço específico de hospedagem | Ainda não há driver que obrigue um provedor |

---

# ADR-001 — Interface web com acessibilidade incorporada à arquitetura

## Status

Proposta.

## Decisão

O AcessaVagas será desenvolvido como uma aplicação web cuja camada de apresentação incorpora acessibilidade desde a construção dos componentes e fluxos de interação.

A acessibilidade será tratada como responsabilidade arquitetural da camada de apresentação, e não como uma adaptação posterior.

A interface deverá considerar:

- navegação por teclado;
- leitores de tela;
- contraste adequado;
- estrutura semântica;
- componentes acessíveis;
- adaptação a diferentes dispositivos;
- recursos de acessibilidade previstos pelo sistema.

A implementação específica de biblioteca de componentes ou CSS permanece aberta.

## Por que foi tomada

- DA-01 define acessibilidade como driver arquitetural.
- RNF-01 estabelece conformidade com WCAG 2.1 nível AA.
- RNF-02 exige compatibilidade com leitores de tela.
- RNF-04 exige usabilidade e autonomia.
- RF-16 exige recursos de acessibilidade.
- Corrigir a acessibilidade apenas depois da construção da interface exigiria revisar componentes, fluxos e interações já implementados.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Tratar acessibilidade apenas por CSS | Não cobre semântica, teclado, foco e tecnologias assistivas |
| Implementar acessibilidade somente após a interface pronta | Tornaria correções estruturais mais caras |
| Depender de uma biblioteca específica para garantir acessibilidade | Criaria dependência desnecessária de tecnologia |
| Criar versões separadas da aplicação para diferentes necessidades | Duplicaria fluxos e aumentaria o custo de manutenção |

## Consequências

- A acessibilidade passa a ser considerada durante o desenho dos componentes.
- Testes de interface devem verificar navegação por teclado e tecnologias assistivas.
- A biblioteca visual específica permanece uma decisão reversível.
- Alterações futuras de biblioteca não devem remover os requisitos de acessibilidade.

**Drivers:** DA-01, RNF-01, RNF-02, RNF-04, RF-16.

---

# ADR-002 — Autenticação e autorização centralizadas no backend

## Status

Proposta.

## Decisão

Autenticação, autorização por perfil e validação das operações protegidas serão realizadas no backend.

A aplicação terá perfis distintos, como:

- candidato;
- recrutador/empresa;
- administrador.

O frontend poderá ocultar funcionalidades que o usuário não possui permissão para executar, mas a API será a fronteira de confiança e deverá validar todas as operações protegidas.

A autorização será aplicada antes da execução das operações de escrita e das operações que envolvam dados protegidos.

## Por que foi tomada

- DA-02 define autenticação e autorização como driver arquitetural.
- RF-03 define perfis de acesso distintos.
- RNF-07 exige segurança.
- RNF-08 exige proteção de dados pessoais.
- RB-12 define controle de acesso.
- Uma autorização baseada somente na interface poderia ser contornada por requisições HTTP diretas.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Controle de acesso somente no frontend | Pode ser contornado por requisições diretas à API |
| Regras duplicadas em cada tela | Aumentaria inconsistências e dificultaria manutenção |
| Gateway externo como única proteção | As regras de negócio e autorização continuam pertencendo ao sistema |
| Confiar no perfil enviado pelo cliente | Não oferece garantia de integridade da autorização |

## Consequências

- A API passa a ser a fronteira de confiança.
- Toda operação protegida precisa passar por autenticação e autorização.
- O mecanismo de sessão pode ser alterado futuramente sem alterar esta ADR.
- Testes de segurança devem verificar acesso por perfil diretamente na API.
- O frontend não é considerado fonte de verdade para autorização.

**Drivers:** DA-02, RNF-07, RNF-08, RB-12.

---

# ADR-003 — LLM somente no backend, atrás de adaptador

## Status

Proposta.

## Decisão

Toda integração com modelo de linguagem será realizada exclusivamente pelo backend.

A integração será realizada por meio de uma porta/adaptador com contrato independente do fornecedor.

Fluxo:

1. aplicação envia dados ao backend;
2. backend encaminha a solicitação ao adaptador;
3. adaptador comunica-se com o provedor LLM;
4. resposta retorna ao backend;
5. sistema valida e normaliza os dados;
6. somente dados válidos chegam ao domínio.

Nenhuma chave ou credencial do provedor deverá ficar no frontend.

A LLM poderá ser desabilitada sem comprometer as funcionalidades que não dependem diretamente dela.

## Por que foi tomada

- DA-05 determina que a LLM seja opcional, validada e substituível.
- DA-06 exige normalização das vagas externas.
- RB-11 exige validação das informações extraídas por LLM.
- RB-17 exige validação de vagas externas antes da análise.
- RB-18 estabelece que o resultado da LLM não é fonte de verdade.
- A integração direta do frontend com um provedor exporia credenciais e misturaria a camada de apresentação com a integração externa.
- Acoplar o domínio a um SDK específico tornaria a substituição do fornecedor mais cara.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Chamar a LLM diretamente pelo frontend | Exporia credenciais e acoplaria a interface ao fornecedor |
| Acoplar o domínio ao SDK da LLM | Tornaria a troca de fornecedor mais cara |
| Criar um microsserviço exclusivo para LLM | Os drivers atuais não exigem distribuição adicional |
| Tornar a LLM obrigatória | A plataforma deve continuar funcionando quando a integração estiver indisponível |

## Consequências

- O domínio não conhece o SDK do fornecedor.
- O adaptador pode ser substituído.
- A resposta da LLM passa por validação antes de entrar no domínio.
- Testes podem utilizar um adaptador falso.
- O provedor específico permanece uma decisão reversível.
- Uma fila assíncrona pode ser adicionada futuramente se houver necessidade comprovada.

**Drivers:** DA-05, DA-06, DA-08, RNF-05, RNF-16, RB-11, RB-17, RB-18.

---

# ADR-004 — Arquitetura em camadas

## Status

Proposta.

## Decisão

O AcessaVagas será organizado em camadas com responsabilidades separadas:

    Apresentação
          ↓
      Aplicação
          ↓
       Domínio
          ↓
    Infraestrutura

A camada de domínio será responsável pelas regras de negócio centrais, incluindo:

- compatibilidade;
- barreiras críticas;
- necessidades obrigatórias;
- regras de candidatura;
- avaliação e critérios de acessibilidade.

A infraestrutura será responsável por integrações externas e mecanismos técnicos, incluindo persistência e comunicação com serviços externos.

A camada de aplicação coordenará os casos de uso sem concentrar as regras de negócio que pertencem ao domínio.

## Por que foi tomada

- DA-02 exige uma fronteira clara para autenticação e autorização.
- DA-03 e DA-04 exigem concentração das regras de compatibilidade no domínio.
- DA-05 e DA-06 exigem isolamento das integrações externas.
- DA-08 exige separação entre operações locais e integrações potencialmente lentas.
- A separação reduz o acoplamento entre regras de negócio, interface e infraestrutura.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Concentrar regras nos controllers | Espalharia regras de negócio e dificultaria testes e manutenção |
| Concentrar regras no frontend | Não garantiria a aplicação das regras para todas as entradas |
| Não estabelecer separação de responsabilidades | Aumentaria o acoplamento entre domínio e tecnologia |
| Utilizar microserviços desde o início | Os drivers atuais não exigem distribuição adicional |

## Consequências

- As regras de negócio ficam independentes da interface e da infraestrutura.
- Integrações externas podem ser substituídas com menor impacto no domínio.
- O projeto exige disciplina na separação de responsabilidades.
- A arquitetura não implica adoção de microserviços.

**Drivers:** DA-02, DA-03, DA-04, DA-05, DA-06, DA-08.

---

## 3. Rastreabilidade entre ADRs, Drivers e baseline

| ADR | Drivers | RF | RNF | RB | Casos de Uso | Decisão Técnica |
|---|---|---|---|---|---|---|
| ADR-001 | DA-01 | RF-16 | RNF-01, RNF-02, RNF-04 | — | UC-01, UC-02, UC-03 | DT-01 |
| ADR-002 | DA-02 | RF-01, RF-02, RF-03, RF-40 | RNF-07, RNF-08 | RB-12, RB-21, RB-22 | UC-00, UC-09, UC-10, UC-14 | DT-02 |
| ADR-003 | DA-05, DA-06, DA-08 | RF-05, RF-36, RF-37, RF-39 | RNF-05, RNF-16 | RB-10, RB-11, RB-17, RB-18, RB-31, RB-32, RB-33 | UC-08, UC-14 | DT-05, DT-06 |
| ADR-004 | DA-02, DA-03, DA-04, DA-05, DA-06, DA-08 | RF-01, RF-03, RF-05, RF-07, RF-08, RF-09, RF-18, RF-36, RF-37, RF-38, RF-39, RF-40 | RNF-05, RNF-07, RNF-08, RNF-10, RNF-11, RNF-15, RNF-16 | RB-02, RB-03, RB-04, RB-05, RB-06, RB-07, RB-10, RB-11, RB-12, RB-15, RB-17, RB-18, RB-32, RB-39, RB-41 | UC-00, UC-02, UC-03, UC-09, UC-10, UC-14 | DT-08 |

### Critério de leitura

- Os **Drivers** representam as pressões arquiteturais originadas da baseline.
- As **ADRs** registram decisões estruturais tomadas para responder a essas pressões.
- As **Decisões Técnicas** registram escolhas técnicas diretamente sustentadas pelos Drivers/ADRs.
- Os **Casos de Uso** mostram onde essas decisões e restrições aparecem no comportamento do sistema.
- Uma mesma baseline pode aparecer em mais de uma ADR quando diferentes decisões estruturais são necessárias para atendê-la.

### Decisões em aberto por ADR

| ADR | Decisão em aberto |
|---|---|
| ADR-001 | Biblioteca específica de componentes e CSS. |
| ADR-002 | Mecanismo específico de sessão/autenticação. |
| ADR-003 | Provedor LLM específico e eventual mecanismo assíncrono. |
| ADR-004 | Tecnologias específicas de cada camada. |


---

## 4. Síntese

A relação entre os artefatos segue a seguinte lógica:

**RF/RNF/RB → Drivers Arquiteturais → ADRs → Arquitetura**

Os requisitos definem o comportamento e as qualidades esperadas.

Os Drivers Arquiteturais identificam quais desses elementos realmente pressionam a estrutura da solução.

As ADRs registram as decisões estruturais que foram tomadas para atender aos drivers.

As escolhas ainda reversíveis ou sem evidência suficiente permanecem abertas e não são transformadas em ADRs.
