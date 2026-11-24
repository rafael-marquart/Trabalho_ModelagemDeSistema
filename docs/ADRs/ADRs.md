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
| ADR-005 | Aplicação web única em Next.js (TypeScript) com PostgreSQL via Prisma | Trocar framework, linguagem ou banco exigiria reescrever telas, rotas, modelo persistido e migrações |

Status de todas: **aceita**. As ADR-001, 002, 004 e 005 estão aplicadas no código desde a primeira implementação (SPEC-001, outubro de 2026); a ADR-004 com desvios registrados. A ADR-003 está aplicada na SPEC-006 (vagas externas), única funcionalidade que usa LLM, que vem desligada por padrão.

Cada ADR tem **Status**, **Contexto (por que foi tomada)**, **Decisão**, **Alternativas consideradas** e **Consequências**.

---

## 2. O que deliberadamente não tem ADR

Estas escolhas foram tomadas, mas podem ser trocadas sem reescrever a arquitetura; por isso ficam fora das ADRs.

| Tema | Escolha desta versão | Por que não é ADR |
|---|---|---|
| Biblioteca de componentes de UI | Nenhuma: componentes próprios em React, com CSS próprio (`src/app/globals.css`) | Pode ser trocada sem alterar regras de negócio nem dados |
| Mecanismo de sessão | Sessão guardada no banco; o navegador recebe só um token opaco em cookie `HttpOnly`, cujo hash fica na tabela `Session` | A decisão estrutural é a ADR-002 (autorização no servidor); o formato da sessão pode mudar sem tocar nas regras |
| Hash de senha | Argon2id (biblioteca `argon2`) | Trocável com rehash no próximo login |
| Validação de dados | Zod nas rotas e serviços | Trocável sem alterar o modelo persistido |
| Hospedagem | Vercel (aplicação) e Neon (PostgreSQL), região São Paulo; ambiente de testes separado | O código não depende de recurso exclusivo do provedor além das rotas agendadas |
| Envio de e-mail | SMTP via Nodemailer (Brevo em produção, Ethereal no ambiente de testes, Mailpit no local) | Trocar de provedor é configuração |
| Cálculo de trajeto | API da HERE, com o tempo de trajeto guardado no banco (`TravelTimeCache`), coordenadas em cache de memória por 24 h e limite de uso configurável (60% da cota gratuita) | Isolado num adaptador da compatibilidade; sem a chave, o deslocamento fica sem valor e o resultado vira "dados insuficientes" |
| Avisos e reenvios | Fila de notificações em tabela do banco, processada por rotas agendadas (Vercel Cron diário e GitHub Actions a cada 15 min) | Pode virar uma fila dedicada sem mudar as regras de aviso |
| Arquivos enviados | Comprovantes e fotos guardados no próprio banco | Pode migrar para armazenamento de objetos sem mudar as telas |
| Provedor de LLM | Gemini, opcional e desligado por padrão (`EXTERNAL_JOBS_LLM="off"`), usado só na SPEC-006 | A ADR-003 define a porta; o provedor é escolha de configuração |
| Cache de aplicação, fila assíncrona dedicada, microsserviços | Não usados | Os drivers atuais não exigem |
| Testes | Vitest com Testing Library e axe-core; teste de ponta a ponta em `scripts/auth-e2e.mjs`; integração contínua no GitHub Actions | Ferramentas trocáveis; a exigência está no RNF-15 |

---

# ADR-001 — Interface web com acessibilidade incorporada à arquitetura

## Status

Aceita. Aplicada: componentes e telas têm testes automatizados com axe-core; a bateria de 01/11/2026 verificou 51 telas com axe-core (WCAG 2.2 AA) nos três temas; as telas são conferidas com teclado e leitor de tela antes da aprovação do layout.

## Decisão

O AcessaVagas é uma aplicação web cuja camada de apresentação incorpora acessibilidade desde a construção dos componentes e fluxos de interação.

A acessibilidade é tratada como responsabilidade arquitetural da camada de apresentação, e não como uma adaptação posterior.

A interface considera:

- navegação por teclado;
- leitores de tela;
- contraste adequado;
- estrutura semântica;
- componentes acessíveis;
- adaptação a diferentes dispositivos;
- recursos de acessibilidade previstos pelo sistema.

Nesta versão não se usa biblioteca de componentes: os componentes são próprios, com HTML semântico, foco visível, temas claro, escuro e de alto contraste e textos para leitores de tela.

## Contexto (por que foi tomada)

- DA-01 define acessibilidade como driver arquitetural.
- RNF-01 estabelece conformidade com a WCAG 2.2 nível AA.
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

Aceita. Aplicada: cada rota da API e cada página protegida confere a sessão e o perfil no servidor.

## Decisão

Autenticação, autorização por perfil e validação das operações protegidas são realizadas no backend.

A aplicação tem quatro perfis:

- candidato;
- empresa (conta organizacional);
- recrutador (convidado pela empresa e vinculado a ela);
- administrador.

O frontend poderá ocultar funcionalidades que o usuário não possui permissão para executar, mas a API é a fronteira de confiança e valida todas as operações protegidas.

A autorização é aplicada antes da execução das operações de escrita e das operações que envolvam dados protegidos.

## Contexto (por que foi tomada)

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

Aceita. **Aplicada na SPEC-006:** a LLM só é usada para complementar empresa ou localidade de vagas externas, fica atrás de uma porta no servidor (`src/lib/external-jobs/llm.ts`), vem desligada por padrão e só aceita valores escritos no anúncio original (RB-11, RB-18).

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

## Contexto (por que foi tomada)

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

Aceita. Aplicada com desvios registrados em `docs/Implementacao/desvios.md`: parte das rotas da API acessa o banco diretamente, sem passar por um serviço de domínio.

## Decisão

O AcessaVagas é organizado em camadas com responsabilidades separadas:

    Apresentação
          ↓
      Aplicação
          ↓
       Domínio
          ↓
    Infraestrutura

A camada de domínio é responsável pelas regras de negócio centrais, incluindo:

- compatibilidade;
- barreiras críticas;
- necessidades obrigatórias;
- regras de candidatura;
- avaliação e critérios de acessibilidade.

A infraestrutura é responsável por integrações externas e mecanismos técnicos, incluindo persistência e comunicação com serviços externos.

A camada de aplicação coordena os casos de uso sem concentrar as regras de negócio que pertencem ao domínio.

Como isso aparece no código (ADR-005):

| Camada | Onde fica |
|---|---|
| Apresentação | Páginas e componentes React em `src/app/**/page.tsx` e `src/components/` |
| Aplicação (entrada) | Rotas da API em `src/app/api/**/route.ts`: conferem sessão, perfil, origem e dados de entrada |
| Domínio e serviços | Módulos em `src/lib/` (compatibilidade, funil, candidaturas, denúncias, avaliações, notificações); o cálculo de compatibilidade (`src/lib/compatibility/engine.ts`) não depende de banco nem de serviço externo |
| Infraestrutura | Prisma e PostgreSQL (`src/lib/prisma.ts`, `prisma/`), envio de e-mail (`src/lib/email.ts`), API da HERE (`src/lib/compatibility/travel.ts`) |

## Contexto (por que foi tomada)

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

# ADR-005 — Aplicação web única em Next.js (TypeScript) com PostgreSQL via Prisma

## Status

Aceita. Aplicada desde a SPEC-001.

## Contexto (por que foi tomada)

- O projeto precisa de interface web acessível (ADR-001) e de uma API que seja a fronteira de confiança (ADR-002), com equipe pequena e prazo de um semestre.
- As regras dependem de integridade transacional: uma candidatura ativa por vaga, histórico imutável do funil e da moderação, vínculo único do recrutador (RNF-09).
- A hospedagem precisa ser gratuita ou barata, com HTTPS e banco gerenciado.

## Decisão

- Uma única aplicação **Next.js 15** (App Router) com **React 19** e **TypeScript**: as páginas e a API (Route Handlers em `src/app/api`) são o mesmo projeto e o mesmo deploy.
- Banco **PostgreSQL**, acessado pelo **Prisma**; o esquema e as migrações ficam em `prisma/`. Regras que o banco consegue garantir (índices únicos parciais, gatilhos que impedem alterar históricos, restrições de checagem) ficam no banco.
- Toda autorização é feita no servidor (rotas e páginas de servidor); o navegador nunca recebe chaves de serviços externos.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Front em React (Vite) e API separada em Node/Express ou NestJS | Dois projetos, dois deploys e um contrato a manter, sem requisito que justifique para o tamanho do projeto |
| Banco de documentos (MongoDB) | Não oferece as restrições relacionais e transações de que as regras dependem |
| Banco embutido (SQLite) | Não atende à hospedagem serverless com várias instâncias |
| Aplicativo nativo | Nenhum driver exige; a web responsiva atende celular e computador (RNF-03) |

## Consequências

- Telas e API compartilham tipos e validações (Zod), o que reduz divergência entre o que a tela envia e o que a API aceita.
- A separação em camadas (ADR-004) depende de disciplina, porque o framework permite acessar o banco direto de uma rota; os casos em que isso ocorre estão em `docs/Implementacao/desvios.md`.
- A hospedagem (Vercel + Neon) não precisa de servidor próprio, mas as rotinas periódicas precisam de agendador externo (Vercel Cron e GitHub Actions).
- Trocar o framework ou o banco exigiria reescrever telas, rotas e migrações.

**Drivers:** DA-01, DA-02, DA-03, DA-04, RNF-03, RNF-07, RNF-09, RNF-12.

---

## 3. Rastreabilidade entre ADRs, Drivers e baseline

| ADR | Drivers | RF | RNF | RB | Casos de Uso | Decisão Técnica |
|---|---|---|---|---|---|---|
| ADR-001 | DA-01 | RF-16 | RNF-01, RNF-02, RNF-04 | — | UC-01, UC-02, UC-03 | DT-01 |
| ADR-002 | DA-02 | RF-01, RF-02, RF-03, RF-40 | RNF-07, RNF-08 | RB-12, RB-21, RB-22 | UC-00, UC-09, UC-10, UC-14 | DT-02 |
| ADR-003 | DA-05, DA-06, DA-08 | RF-05, RF-36, RF-37, RF-39 | RNF-05, RNF-16 | RB-10, RB-11, RB-17, RB-18, RB-31, RB-32, RB-33 | UC-08, UC-14 | DT-05, DT-06 |
| ADR-005 | DA-01, DA-02, DA-03, DA-04 | — | RNF-03, RNF-07, RNF-09, RNF-12 | RB-14, RB-27 | Todos | DT-08 |
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
| ADR-001 | Nenhuma. |
| ADR-002 | Nenhuma. |
| ADR-003 | Se a LLM entra nesta versão (decisão sobre a SPEC-006) e qual provedor usar. |
| ADR-004 | Levar para serviços de domínio as rotas que ainda acessam o banco direto (ver desvios). |
| ADR-005 | Nenhuma. |


---

## 4. Síntese

A relação entre os artefatos segue a seguinte lógica:

**RF/RNF/RB → Drivers Arquiteturais → ADRs → Arquitetura**

Os requisitos definem o comportamento e as qualidades esperadas.

Os Drivers Arquiteturais identificam quais desses elementos realmente pressionam a estrutura da solução.

As ADRs registram as decisões estruturais que foram tomadas para atender aos drivers.

As escolhas reversíveis ficam na tabela da seção 2, com o que foi escolhido nesta versão.
