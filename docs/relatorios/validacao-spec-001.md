# Matriz de validação — SPEC-001

**Revisão histórica:** 25/10/2026 — conteúdo anterior preservado abaixo para rastreabilidade  
**Branch:** `feat/initial-app-foundation`  
**HEAD de código/testes registrado na revisão histórica:** `4a98eb6bba42ba7e46144d9f2db85b8276c9002b`.  
**CI histórico do HEAD de código/testes `62e4af93442b443590e103cdda6e845be5373ebf`:** push [40243954634](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40243954634) e Pull Request [40243959357](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40243959357), ambos aprovados.  
**CI do HEAD atual de código/testes:** execução [40246387590](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246387590) concluída com sucesso; todas as etapas do workflow `validate`, incluindo testes unitários, build de produção e E2E com PostgreSQL/SMTP local, passaram.  
**Pull request:** [#36](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/pull/36) — permanece Draft  
**Objetivo:** separar implementação existente, evidência automatizada disponível e validações ainda necessárias. Esta matriz não substitui os critérios de aceite da `docs/Specs.md` nem declara a SPEC-001 concluída.

## Estado atual da validação — 26/10/2026

**HEAD de código/testes validado:** `ed74230dfc674350a9ceddaad9088fd2a24e285f`; CI de push [40253143930 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253143930) e Pull Request [40253150227 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253150227).  
**HEAD documental anterior validado:** `21c9c5c6c6768bd60651c85b684c0f183c0ddb85`; CI de push [40253412059 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253412059) e Pull Request [40253416472 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253416472). O job `validate` concluiu as etapas de Prisma, migrações PostgreSQL, restrição concorrente de vínculo, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP local.  
**Revisão documental registrada nesta versão:** `d38ffe94f59ce9f6497210138d09d94ef2e24807`; no momento da atualização, o CI do commit estava em execução: [push 40253780391](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253780391) e [PR 40253785808](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253785808).  
**PR #36:** [aberta e em Draft](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/pull/36), sem merge ou deploy. A SPEC-002 não foi iniciada.

### Ajuste recente e limite de privacidade

- A rota de convite de recrutador deixou de retornar uma mensagem que descrevia explicitamente o vínculo do destinatário com outra empresa; o teste e o E2E conferem a mensagem genérica e a ausência de transação/envio nesse conflito.
- **Limite residual identificado na revisão:** a mensagem genérica, sozinha, não elimina todos os sinais de elegibilidade do e-mail. O endpoint ainda usa status HTTP diferentes entre certos resultados (por exemplo, conflito versus criação/reenvio) e a listagem da empresa reflete se um convite foi efetivamente criado. Isso merece uma decisão de produto/privacidade antes de afirmar proteção completa contra enumeração; não é contabilizado como resolvido por esta correção.
- Permanecem pendentes a entrega real de SMTP em homologação/produção, configuração efetiva do proxy confiável, agendamento/monitoramento das rotinas de retenção em produção, verificações manuais de acessibilidade e dispositivos, homologação externa e teste de invasão independente.

**Esta atualização registra evidências automatizadas; não declara a SPEC-001 concluída.**

## Atualização de validação — 26/10/2026

**HEAD de código/testes validado:** `ac2d746bb4f35a3cf934ddea8fa6323909302759`.  
**CI de push:** [40247620336 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40247620336).  
**CI da PR:** [40247624328 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40247624328).  
**Estado da PR #36:** aberta, Draft, sem merge.  
**Escopo:** esta atualização registra evidência automatizada; não declara a SPEC-001 concluída.

## Cobertura adicionada no HEAD atual

- As rotas `GET/POST /api/company/recruiter-invitations`, cancelamento de convite, listagem de vínculos e encerramento de vínculo agora têm cenários tabulares para sessões anônimas e papéis incorretos (CANDIDATE, RECRUITER e ADMIN quando aplicável).
- Os testes verificam não apenas a resposta de negação, mas também a ausência de consultas/mutações relevantes, transações, envio de e-mail e eventos de auditoria em operações não autorizadas.
- A rota de resposta a convites inclui cenários para sessões com papéis incorretos (CANDIDATE, COMPANY e ADMIN) e para sessão de recrutador inativa. Os asserts confirmam rejeição antes de consultar/reivindicar o convite, criar vínculo, mutar dados ou registrar auditoria.
- O workflow `validate` passou para o HEAD acima, tanto no evento `push` quanto em `pull_request`. Isso valida a pipeline automatizada configurada no repositório, não substitui homologação externa ou verificações manuais.

## Limites que permanecem

- A cobertura de autorização foi ampliada especificamente nas rotas de convites e vínculos descritas acima; **não** deve ser interpretada como uma matriz exaustiva de todas as rotas protegidas do sistema.
- Permanecem pendentes a configuração e entrega real de SMTP em homologação/produção, a configuração efetiva do proxy confiável, o agendamento de rotinas de retenção em produção, verificações manuais de acessibilidade/navegadores/dispositivos, homologação externa e teste de invasão independente.
- A SPEC-001 permanece em implementação/validação incremental. Não houve merge, deploy nem início da SPEC-002.

## Revisão complementar de CI e autorização — 25/10/2026

- O commit documental `7893af35f67239a517ac90ed90b66bfbcda02af8` passou tanto no CI de push [40246888186](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246888186) quanto no CI da PR [40246892779](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246892779). Em ambos, o job `validate` concluiu com sucesso. A PR #36 foi conferida após as execuções e permanece aberta, em Draft, sem merge.
- A inspeção dos testes por rota confirmou cobertura pontual de autorização: as rotas de cancelamento de convite e encerramento de vínculo rejeitam usuário candidato, verificam origem e escopo da empresa; a listagem de vínculos verifica papel/conta empresarial e filtra por `companyId`; a resposta ao convite cobre recrutador autenticado e ativação de primeiro acesso. Isso é evidência por cenário, não uma matriz completa.
- **Lacuna mantida:** não há evidência de uma matriz automatizada uniforme cruzando todos os papéis (anônimo, CANDIDATE, COMPANY, RECRUITER e ADMIN quando aplicável) com cada rota protegida, incluindo estado inativo e ausência de efeitos colaterais. Não considerar essa lacuna resolvida apenas porque os dois workflows passaram. O próximo incremento deve ser uma matriz de regressão focada nas combinações relevantes, com asserções de que operações negadas não alteram dados nem geram auditoria.

## Estado de CI observado

- O HEAD integrado anterior `62e4af93442b443590e103cdda6e845be5373ebf` passou no CI de push [40243954634](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40243954634) e no CI da PR [40243959357](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40243959357). O HEAD atual de código/testes `4a98eb6bba42ba7e46144d9f2db85b8276c9002b` também passou no CI da PR [40246387590](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246387590); foram adicionados cenários E2E para mutações anônimas de criar/cancelar convites e encerrar vínculos, incluindo verificação de ausência de criação de conta. O Vitest aprovou **26 arquivos e 172 testes**; TypeScript, lint, build de produção, migrações PostgreSQL e E2E com SMTP local passaram. A cobertura inclui autenticação/recuperação de candidato e revogação de sessão, confirmação empresarial, convites/reenvio/aceite/recusa/cancelamento/expiração, isolamento multiempresa, concorrência de cancelamento e aceite concorrente do mesmo convite (uma aceitação, um vínculo ativo e um evento de auditoria). Também inclui uma migração que guarda nome/e-mail informados pela empresa no próprio convite, sem consultar o perfil atual para montar a listagem; um E2E usa nome de convite diferente do nome real da conta e confirma que o nome do perfil não é exposto. Convites históricos recebem um rótulo neutro na migração. A recuperação de senha exercita a extração do token MIME após a correção do parser `quoted-printable`; SMTP local de captura não comprova entrega real em homologação.
- A cobertura E2E de auditoria agora verifica exatamente um evento para envio, reenvio, ativação/aceite de conta de recrutador, recusa e encerramento de vínculo. Para expiração, a listagem apresenta `EXPIRED` sem mutar o banco; uma tentativa explícita de responder ao convite expirado persiste o estado e gera exatamente um evento `RECRUITER_INVITATION_EXPIRED`. As verificações existentes continuam cobrindo ausência de efeitos de auditoria após tentativas não autorizadas, isolamento de convites entre empresas e limpeza dos eventos de auditoria dos dados de teste. A interface de recrutadores mostra destinatário, validade, estado e ações de reenviar/cancelar, com nome/e-mail limitado ao escopo da empresa autenticada.
- Histórico de CI: o commit de interface `67d1b89f6de6732e5a8e7b25dcb334b8d03d5169` falhou por `ReferenceError: React is not defined`, corrigido no commit `5622395c10bfef2ac4ea0ee55362ce58c9f6f2a3`. Mais recentemente, o commit de implementação `9505388e7e54958bf48874c48b18c828bb9997c0` falhou em push [40242192279](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40242192279) e PR [40242195648](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40242195648): o teste de layout consultava o DOM do teste anterior porque esse arquivo não registrava limpeza entre renders. O commit de teste `df405e49c47a54f0d86c76c3d0f488edaffe2afb` adicionou `afterEach(cleanup)`; os dois CIs agora passam, com 172 testes unitários e E2E completo.
- A etapa `validate` passou no HEAD `df405e49c47a54f0d86c76c3d0f488edaffe2afb` nas duas execuções: push [40242539561](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40242539561) e Pull Request [40242542495](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40242542495). A pipeline cobre validação/geração Prisma, migrações e restrições PostgreSQL, TypeScript, lint, testes unitários, build de produção e E2E.
- O HEAD mantém a serialização por bloqueio de linha no reset de senha, teste para usuário que deixa de estar elegível antes da transação e proteção contra corrida na ativação de empresa durante a confirmação de e-mail. A ordem das operações foi ajustada para não consumir tokens secundários se a ativação não for confirmada.
- A contagem de falhas por conta agora acompanha `lastFailedLoginAt` e reinicia o contador quando a falha anterior está fora da janela móvel de 15 minutos; o sucesso e a redefinição de senha limpam ambos os campos. O teste de regressão cobre contador antigo com nove falhas registradas há mais de 15 minutos.
- A recuperação de senha mantém resposta HTTP 200 e mensagem genérica quando há throttling, para reduzir risco de enumeração de contas.
- A listagem `GET /api/company/recruiter-invitations` é somente leitura: convites pendentes cujo prazo já passou são apresentados como `EXPIRED` na resposta, sem atualizar o banco nem gravar auditoria durante a consulta. O status persistido pode permanecer `PENDING` até um fluxo explícito de escrita tratar o convite.
- A listagem `GET /api/company/recruiter-invitations` retorna nome/e-mail armazenados como snapshot dos valores informados pela empresa no convite; não lê nome/e-mail atuais do perfil do destinatário. O E2E confirma essa separação para uma conta existente com nome de perfil diferente. A consulta continua filtrada por `companyId` da sessão autenticada. A tela oferece reenvio para convites pendentes, preserva a validade e apresenta tabela responsiva de vínculos/convites; testes de componente cobrem reenvio e testes estáticos verificam tokens de cor e contraste do foco.
- A rota de logout usa a origem canônica `APP_BASE_URL`, em vez de derivar o destino do host da requisição, e retorna `503` em produção se a configuração estiver ausente. Testes cobrem host não confiável, ausência de configuração e rejeição de origem cruzada.
- O CI não comprova configuração real de SMTP, proxy, domínio público, agendador de retenção nem acessibilidade em navegadores/dispositivos. Os scripts de retenção/limpeza e os testes de throttling/cooldown permanecem no repositório; o HEAD atual passou por CI, mas nenhum agendador de produção foi provisionado ou verificado. O cabeçalho `X-Forwarded-For` só é confiável se o proxy de produção o sobrescrever.

## Matriz dos critérios de aceitação

| Critério da SPEC-001 | Implementação/evidência disponível | Estado de validação | Pendência |
|---|---|---|---|
| Entrada apresenta login por e-mail e senha | `src/app/page.tsx`, telas de login de candidato e empresa | Implementado; inspeção visual manual ainda necessária | Conferir fluxos e teclado/leitor de tela |
| Cadastro oferece Usuário ou Empresa, sem cadastro independente de Recrutador | Página inicial e páginas de cadastro; rotas de cadastro de candidato/empresa | Implementado; testes automatizados de rotas | Confirmar navegação ponta a ponta |
| Credenciais válidas autenticam e encaminham conforme perfil | `src/app/api/auth/login/route.ts`; E2E valida login de candidato e empresa com PostgreSQL, cookie e redirecionamento por perfil | E2E e CI passaram | Ampliar cenários de expiração e acesso por papel; logout/revogação já possui verificação E2E |
| Credenciais inválidas não autenticam | Testes de login cobrem senha incorreta, conta bloqueada e perfil | Coberto por testes unitários; CI do HEAD passou | Incluir cenários adicionais de integração, se necessários |
| Recuperação permite redefinição quando válida | Rotas `password/forgot` e `password/reset`; E2E com PostgreSQL e SMTP local verifica token, redefinição de uso único, revogação de sessão e novo login | E2E e CI passaram | Validar entrega e falhas no provedor SMTP de homologação |
| Operações protegidas verificam autorização no backend | Verificações de papel/sessão em páginas e rotas de recrutadores | E2E cobre acesso anônimo, candidato e recrutador às APIs de vínculos/convites; tentativas indevidas não alteram estado nem geram auditoria de cancelamento/encerramento; segunda empresa não vê convite alheio nem consegue convidar recrutador já vinculado ativamente em outra empresa (HTTP 409 sem registro/evento de envio) | Ampliar a matriz integrada para todos os papéis e todas as rotas protegidas da baseline |
| Sessão expirada ou invalidada não executa operações protegidas | `src/lib/auth/session.ts`, testes de sessão, redefinição de senha e E2E de logout/expiração | CI do HEAD passou; E2E confirma remoção da sessão após logout e após expiração, HTTP 401 em API protegida com cookie revogado e redirecionamento da página protegida para login com sessão expirada | Testar expiração real de cookie/sessão em ambiente integrado de homologação |
| Empresa autorizada cadastra/associa Recrutador por convite com aceite explícito | E2E cobre convite, reenvio, invalidação do link anterior, aceite/ativação, recusa e cancelamento; interface lista destinatário, validade e ações para convites pendentes | E2E e CI passaram; listagem é limitada à empresa autenticada | Validar entrega/falhas em SMTP de homologação e ampliar cenários concorrentes |
| Um Recrutador não mantém mais de um vínculo empresarial ativo | Restrição única no banco, scripts SQL de integridade/concorrência e E2E que rejeita convite por segunda empresa enquanto o vínculo atual permanece ativo | Validado em CI; tentativa rejeitada não cria convite nem evento `RECRUITER_INVITATION_SENT`, e aceite concorrente deixa exatamente um vínculo ativo | Avaliar em homologação uma corrida combinada entre aceite e encerramento de vínculo |
| Empresa encerra seu próprio vínculo sem apagar conta nem histórico | E2E valida encerramento pela empresa proprietária, rejeição de encerramento pela segunda empresa e preservação da conta do recrutador | E2E e CI passaram | Ampliar a matriz de autorização para outras mutações e identificadores |
| Recrutador permanece vinculado à Empresa responsável enquanto ativo | Consulta de vínculos e modelo de dados | Implementado; cobertura automatizada parcial | Conferir transições e permissões após encerramento |
| Empresa não consegue administrar vínculo de outra Empresa | E2E com duas empresas confirma HTTP 409 ao tentar encerrar vínculo pertencente à outra empresa e confirma que o vínculo permanece ativo | E2E e CI passaram | Cobrir listagem e demais operações multiempresa de forma integrada |
| Alterações relevantes são rastreáveis | Eventos transacionais de autenticação, convites e vínculos; E2E verifica exatamente um evento para envio, reenvio, aceite/ativação, recusa, expiração, cancelamento concorrente e encerramento de vínculo, além de ausência de eventos indevidos em tentativas não autorizadas | Eventos críticos de convite/vínculo e efeitos colaterais de autorização cobertos por E2E e CI; retenção tem testes próprios | Completar a conferência de todos os tipos de evento da baseline; agendamento/alertas de produção ainda não configurados |
| Mensagens não expõem credenciais ou dados pessoais desnecessários | Mensagens genéricas de login/recuperação e protótipo de mensagens aprovado; throttling de recuperação mantém status e texto genéricos | Cobertura parcial por testes unitários e inspeção de código; CI passou | Revisar manualmente mensagens e acessibilidade dos anúncios de erro/sucesso |

## Auditoria de autorização e isolamento

Revisão estática das rotas de autenticação, convite e vínculo no commit de aplicação `9505388e7e54958bf48874c48b18c828bb9997c0`; a validação automatizada, os asserts de auditoria e o cenário de aceite concorrente passaram no HEAD de teste `5b205311c7b8a9863113b90aed9b95afd7cfe02d`:

- As rotas de convite e vínculo exigem sessão com papel `COMPANY`, verificam conta ativa e obtêm a empresa pelo `accountUserId` da sessão; listagens e mutações são limitadas ao `companyId` autenticado.
- Cancelamento de convite e encerramento de vínculo usam mutações condicionais que incluem o identificador do recurso, a empresa proprietária e o estado esperado; os testes verificam que identificadores pertencentes a outra empresa não são alterados nem auditados.
- A resposta ao convite verifica o destinatário autenticado, reivindica o token apenas se ainda estiver pendente e válido, confirma que a empresa está ativa e impede criar vínculo quando o recrutador já tem vínculo ativo. Há testes de corrida, destinatário incorreto, empresa inativa e falhas de auditoria.
- A confirmação de e-mail e a redefinição de senha reivindicam tokens de uso único dentro de transações e falham de forma controlada se a conta/estado mudou. A redefinição invalida sessões existentes.
- Esta foi uma revisão estática apoiada nos testes E2E existentes, não um teste de penetração. A matriz integrada cobre acesso anônimo, candidato e recrutador às APIs de convites/vínculos, isolamento de listagem entre duas empresas, preservação de estado e ausência de auditoria indevida. A listagem de convites usa snapshots dos dados informados pela empresa e o E2E confirma que não revela o nome atual do perfil do destinatário. Nenhuma vulnerabilidade de autorização evidente foi identificada nos fluxos inspecionados; permanece necessária a ampliação sistemática para todas as rotas protegidas da baseline.

## Revisão complementar de autorização por rota — HEAD de código/testes

O HEAD de aplicação/testes foi avançado para `4a98eb6bba42ba7e46144d9f2db85b8276c9002b`; o CI da PR [40246387590](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246387590) passou. A inspeção abaixo deve ser lida junto com os novos asserts E2E de rejeição de mutações anônimas nos endpoints de convite/cancelamento/encerramento.

| Rota | Controle observado na implementação | Evidência automatizada localizada | Situação |
|---|---|---|---|
| `POST /api/auth/login` | Endpoint público; valida perfil escolhido, estado ativo, senha, contador de falhas e throttling | Testes unitários e E2E de autenticação | Parcialmente comprovado; testes integrados de todas as combinações de papel continuam necessários |
| `POST /api/auth/logout` | Validação de origem e revogação da sessão atual; destino canônico usa `APP_BASE_URL` | Testes unitários de origem/redirect e E2E de logout/revogação | Código e cenários cobertos; configuração de produção pendente |
| `POST /api/auth/password/forgot` | Resposta pública genérica, limites por conta/IP, token de uso único e auditoria | Testes unitários e E2E com SMTP local de captura | Parcialmente comprovado; provedor SMTP real não validado |
| `POST /api/auth/password/reset` | Token com hash, validade/uso único, atualização transacional e revogação de sessões | Testes unitários e E2E de redefinição | Parcialmente comprovado; homologação externa pendente |
| `POST /api/auth/register/candidate` | Cadastro público, validação, proteção de origem e auditoria transacional | Testes unitários cobrem normalização, CPF inválido, falhas transacionais, JSON malformado e origem cruzada com ausência de hash/escrita nos casos rejeitados | CI do HEAD mais recente ainda pendente; matriz de abuso/integração externa não completa |
| `POST /api/auth/register/company` | Cadastro público, conta inativa até confirmação, token com hash, proteção de origem e auditoria | Testes unitários e E2E de confirmação empresarial | Parcialmente comprovado; SMTP real pendente |
| `POST /api/auth/company/verify-email` | Token válido e não utilizado, ativação condicional e auditoria na mesma transação | Testes unitários e E2E de confirmação | Coberto em cenários principais; validação de ambiente real pendente |
| `POST /api/auth/company/resend-verification` | Resposta genérica, limites por conta/IP, substituição transacional de token e proteção de origem | Testes unitários e E2E de reenvio | Parcialmente comprovado; SMTP real e proxy confiável pendentes |
| `GET /api/company/recruiter-invitations` | Exige sessão de Empresa ativa e filtra pelo `companyId` autenticado; consulta não muta estado | Testes unitários e E2E de isolamento entre empresas | Cenários principais cobertos; matriz completa de papéis/tenants pendente |
| `POST /api/company/recruiter-invitations` | Exige Empresa ativa, valida origem e entrada, restringe dados à empresa e audita envio/reenvio | Testes unitários e E2E de convite, isolamento, auditoria e concorrência | Cenários principais cobertos; matriz completa de papéis/tenants pendente |
| `POST /api/company/recruiter-invitations/cancel` | Exige Empresa ativa; transição condicionada à propriedade, estado pendente e prazo; auditoria transacional | Testes unitários e E2E de não autorização, isolamento e ausência de efeitos colaterais | Cenários principais cobertos; matriz completa de papéis/tenants pendente |
| `GET /api/company/recruiter-links` | Exige Empresa ativa e lista apenas vínculos ativos da empresa autenticada | Testes unitários e E2E de acesso restrito | Cobertura parcial; expansão E2E para todos os papéis/tenants pendente |
| `POST /api/company/recruiter-links/end` | Exige Empresa ativa; transição condicionada ao vínculo ativo da empresa proprietária; auditoria transacional | Testes unitários e E2E de tentativas cruzadas e efeitos colaterais | Cenários principais cobertos; matriz completa de papéis/tenants pendente |
| `POST /api/recruiter/invitations/respond` | Valida origem, token e destinatário; trata configuração inicial de senha; revalida empresa e reivindica convite em transação serializável | Testes unitários e E2E de aceite/recusa, expiração e concorrência | Cenários principais cobertos; corrida combinada aceite/encerramento e matriz integrada completa pendentes |

Esta inspeção por rota não equivale a executar uma matriz E2E completa de todos os papéis contra todos os endpoints. A evidência existente é forte nos fluxos de convites/vínculos, isolamento entre empresas, transições de auditoria e sessões; ainda não comprova exaustivamente todas as combinações de usuário anônimo, CANDIDATE, COMPANY, RECRUITER, conta inativa, sessão expirada e identificador de outro tenant em cada rota aplicável. Não foi realizado pentest independente.

## Validações transversais ainda necessárias

1. **Integração/E2E:** o CI executa cadastro/login/recuperação de candidato, confirmação/reenvio de duas empresas, convite/reenvio/aceite/recusa/cancelamento de recrutador e isolamento multiempresa com PostgreSQL e SMTP local de captura. O E2E também confirma parser `quoted-printable`, revogação de sessão, concorrência de cancelamento e rejeição de convite a recrutador já vinculado a outra empresa. Ainda falta validar entrega e falhas com provedor SMTP de homologação e ampliar transições concorrentes de token.
2. **Autorização:** revisão estática das 12 rotas mutáveis `POST` confirmou verificações de origem e escopo empresarial. E2E cobre acesso anônimo, candidato e recrutador às APIs de convites/vínculos, listagem isolada por empresa, bloqueio de recrutador nas operações empresariais, tentativa de convite de recrutador ativo já vinculado (HTTP 409) e ausência de efeitos colaterais indevidos. Ainda falta executar a matriz sistemática de todos os papéis em todas as rotas protegidas da baseline.
3. **Segurança:** o E2E do HEAD confirma revogação da sessão no logout, rejeição de acesso a API protegida com o cookie revogado (HTTP 401), redirecionamento para login após expiração da sessão e bloqueio por conta após 10 falhas consecutivas, inclusive rejeitando a senha correta enquanto o bloqueio está vigente. Ainda revisar concorrência de tokens de uso único, origem de requisição, mensagens anti-enumeração, cookies e logs de auditoria. O login aplica bloqueio por conta após 10 falhas consecutivas em 15 minutos e throttling gradual por IP: a tentativa seguinte é bloqueada quando já há 30 falhas no intervalo móvel de 15 minutos, com cooldown de 60 segundos; 50 falhas acionam 5 minutos; 80, 15 minutos; e 120 ou mais, 60 minutos. Os parâmetros estão documentados em `docs/operacao/seguranca-login.md`. Testar operação atrás do proxy confiável e monitorar impactos em redes compartilhadas.
4. **Acessibilidade/usabilidade e temas:** tema claro/escuro, preferência do sistema e persistência local têm testes automatizados. Os tokens principais do tema claro agora correspondem aos SVGs versionados; teste estático verifica foco de pelo menos 3:1 em fundos/superfícies dos dois temas. A tela de recrutadores agora usa cabeçalho, menu lateral, formulário e tabela responsiva com ações acessíveis. Ainda é necessária inspeção visual em navegador, revisão manual de teclado, zoom/reflow e leitor de tela; a aprovação dos SVGs não comprova conformidade WCAG 2.2 AA.
5. **Configuração operacional:** definir e testar `APP_BASE_URL`, SMTP e configuração do proxy confiável; configurar e monitorar a execução diária da retenção de auditoria e da limpeza de registros de segurança de login (`npm run login-security:retention`). Ambas as rotinas existem no repositório, mas nenhum agendador de produção foi provisionado ou verificado.
6. **Referências visuais/Figma:** por solicitação do responsável, os SVGs versionados `docs/Identidade Visual/Gestao-Recrutadores.svg` e `docs/Identidade Visual/Mensagens-Autenticacao.svg` são a referência visual a usar enquanto a conta Figma estiver sem cota. Não é necessário bloquear a implementação à espera da sincronização; a fonte editável continua sem atualização e a verificação final deve ser feita contra os SVGs do repositório.
7. **Fechamento:** revisar os 14 critérios acima com evidências, confirmar os critérios de aceite da SPEC-001 e obter aprovação explícita antes de retirar Draft ou iniciar outra Spec.

## Situação verificada após a revisão complementar

O HEAD documental `7893af35f67239a517ac90ed90b66bfbcda02af8` teve CI de push e CI da PR aprovados (execuções [40246888186](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246888186) e [40246892779](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246892779)). A PR #36 foi confirmada aberta, em Draft e não mesclada. A revisão pontual dos testes de autorização reforça que existem controles e testes por rota, mas não substitui a matriz sistemática de papéis × rotas descrita nas pendências. Este resultado não altera a decisão de manter a SPEC-001 em validação.

## Decisão atual

**SPEC-001 permanece em implementação/validação e não está pronta para encerramento.** O HEAD de código/testes atual é `4a98eb6bba42ba7e46144d9f2db85b8276c9002b`; o CI da PR [40246387590](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246387590) passou. Esse commit adiciona cobertura E2E para mutações anônimas de criação/cancelamento de convites e encerramento de vínculos, incluindo assert de que não se cria conta de recrutador em tentativa anônima. A atualização documental seguinte, commit `f75ba56c8deafdb1f1959d732de80df71529d18d`, também passou na CI da PR [40246635968](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40246635968). O workflow atual inclui validação Prisma, migrações PostgreSQL, restrição de vínculo único e concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP local.

A revisão por rota identifica verificações de papel, estado ativo, escopo empresarial e proteção de origem nos fluxos relevantes, mas não substitui a matriz E2E completa de todos os papéis em todas as rotas protegidas. Permanecem pendentes: essa matriz sistemática e regressões direcionadas onde faltar evidência; validação de SMTP real e falhas de provedor; verificação de `APP_BASE_URL` e `X-Forwarded-For` na topologia de proxy real; agendamento/monitoramento das duas rotinas de retenção; inspeção manual de teclado, foco, leitor de tela, contraste, zoom/reflow e temas claro/escuro; e sincronização editável com Figma (não bloqueante conforme o estado documentado). Não houve pentest independente.

O PR #36 permanece aberto e em Draft. Não fazer merge, não publicar em produção, não retirar Draft e não iniciar a SPEC-002 antes de fechar as pendências bloqueantes e obter aprovação explícita do responsável pelo projeto.


## Estado atual — 26/10/2026

- HEAD de código/testes `3a2a5e99e5c19af7251da86d22b93d0e4a1a2303`: CI de push [40249487955](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40249487955) e CI da PR [40249492788](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40249492788) concluíram com sucesso. Incluem os testes essenciais de JSON malformado e origem cruzada no cadastro de candidato e empresa.
- HEAD documental `d34f4c66044d6967b7d47367d987aae7caaef9eb`: CI de push [40249570022](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40249570022) e CI da PR [40249573807](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40249573807) concluíram com sucesso. Prisma/migrações PostgreSQL, integridade/concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP local passaram.
- Durante a implementação, serão executados apenas testes essenciais para confirmar funcionalidades e evitar regressões. A bateria ampliada ficará para o final do projeto; isso não invalida a suíte já existente nem significa que as verificações manuais/externas foram realizadas.
- Dependências externas/manuais ainda não verificadas: SMTP real em homologação/produção; `APP_BASE_URL` e `X-Forwarded-For` na topologia de proxy real; agendamento/monitoramento de retenção em produção; acessibilidade manual e testes em navegadores/dispositivos; homologação externa e pentest independente. A sincronização editável do Figma é não bloqueante enquanto os SVGs versionados forem a referência visual.
- **Estado funcional:** a implementação principal da SPEC-001 está integrada à branch e a CI está verde. A conclusão formal depende de confirmar o aceite do responsável e decidir quais verificações externas/manuais serão feitas na etapa final de validação. PR #36 continua aberta em Draft; sem merge, deploy ou início da SPEC-002.


## Atualização de validação — 26/10/2026, HEAD `63f83cbf28c0a7d36a6d04943338a982262629cf`

- CI de push: [execução 40251081535](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251081535) — **sucesso**.
- CI do PR: [execução 40251086099](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251086099) — **sucesso**.
- Etapas verificadas na execução da PR: validação e geração do Prisma Client, migrações PostgreSQL, restrição de vínculo ativo único e concorrência, TypeScript, lint, testes unitários, build de produção e E2E de autenticação com PostgreSQL e SMTP local — todas concluídas com sucesso.
- A falha do HEAD anterior `251e0927d7e5987a6da797a20563edd0210519e9` era `ReferenceError: React is not defined` nos testes da página de confirmação empresarial. O import explícito de React foi incluído no commit atual; as duas execuções de CI confirmam a correção.
- A página de confirmação exige ação explícita da pessoa antes de consumir o token, e permite nova tentativa após falha temporária. Há testes de UI para estes comportamentos.
- Este resultado valida o HEAD citado no pipeline automatizado; não representa homologação SMTP externa, configuração real de proxy, acessibilidade manual, pentest ou aprovação formal de conclusão. Essas pendências operacionais permanecem abertas.
- O PR #36 permanece aberto em Draft. Nenhum merge, deploy ou início da SPEC-002 foi realizado.

## Atualização de status e estimativa — 26/10/2026

**HEAD de referência:** `b626afdaa5bbdd467af4c06b95de19fc7493cf82`.

- CI de push: [40251342990 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251342990).
- CI do PR: [40251346333 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251346333).
- As verificações automatizadas do workflow atual passaram: validação/geração Prisma, migrações PostgreSQL, integridade e concorrência de vínculo ativo, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL e SMTP local.
- **Progresso estimado:** implementação funcional principal substancialmente concluída; a SPEC permanece em fase de fechamento de evidências e homologação, não formalmente concluída. Como estimativa de planejamento (não métrica automatizada), cerca de 80–90% da implementação e 65–75% do fechamento/validação.
- **Trabalho de código ainda previsto:** completar a matriz sistemática de autorização por papel/rota/tenant e revisar transições concorrentes de tokens e auditoria onde ainda não houver evidência suficiente.
- **Validações externas/manuais pendentes:** SMTP real; `APP_BASE_URL` e `X-Forwarded-For` na topologia de proxy real; agendadores/monitoramento das rotinas de retenção; testes manuais de teclado, foco, leitor de tela, zoom/reflow e temas claro/escuro. Não houve pentest independente.
- **Estimativa de calendário:** aproximadamente 1–3 dias úteis de trabalho focado se o ambiente de homologação, SMTP e configuração operacional estiverem acessíveis e as verificações manuais não encontrarem bloqueadores. Se dependências externas ou aprovações demorarem, o prazo total passa a depender delas. A estimativa não é garantia.
- **Estado de controle:** PR #36 permanece aberta em Draft. Sem merge, deploy, remoção de Draft ou início da SPEC-002. Encerramento depende de evidência suficiente para os critérios de aceite e aprovação explícita do responsável.

## Ajuste de plano: fechamento limitado a 4–8 horas — 26/10/2026

O plano de fechamento foi reduzido ao esforço técnico combinado de **4–8 horas**, focando a conclusão funcional da SPEC-001. Não ampliar indefinidamente o escopo de validação.

- No HEAD `5c53b4025dbd08224c5c2b5891dfa25abb950f5a`, CI de push [40251558528 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251558528) e CI da PR [40251561375 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40251561375).
- Plano: (1) mapear os 14 critérios de aceite às evidências já existentes; (2) fechar as lacunas essenciais de autorização por papel/tenant, concorrência e auditoria; (3) corrigir falhas concretas e executar CI; (4) registrar cada critério como comprovado, falhou ou dependente de validação externa; (5) apresentar decisão objetiva de conclusão funcional.
- SMTP real, proxy real, rotinas de produção, acessibilidade manual e pentest permanecem explicitamente não executados até haver ambiente/acesso. Não afirmar aprovação dessas verificações, mas também não transformar dependências externas em trabalho técnico interno sem fim; só impedem a conclusão funcional quando estiverem vinculadas a critério obrigatório ou risco conhecido que exija bloqueio.
- Estimativa de calendário anterior de 1–3 dias úteis substituída pelo objetivo de **4–8 horas técnicas**, conforme solicitação do responsável. Essa é uma meta de esforço, não garantia sobre tempo de espera de CI ou dependências externas.
- PR #36 permanece aberta em Draft, sem merge/deploy/início da SPEC-002.

## Matriz objetiva dos 14 critérios de aceite — rodada de fechamento

Classificação baseada nos testes e evidências registrados no repositório; "comprovado nos cenários centrais" não significa cobertura exaustiva de toda combinação possível.

| # | Critério | Evidência existente | Estado nesta revisão |
|---:|---|---|---|
| 1 | Entrada/login por e-mail e senha | Testes de rota de login e E2E de candidato, empresa e recrutador | Comprovado nos fluxos centrais |
| 2 | Cadastro Usuário/Empresa; sem cadastro independente de Recrutador | Testes de cadastro e E2E de convite/ativação de recrutador pela Empresa | Comprovado nos fluxos centrais |
| 3 | Credenciais válidas autenticam e encaminham por perfil | E2E verifica redirecionamentos de candidato, empresa e recrutador | Comprovado |
| 4 | Credenciais inválidas não autenticam | Testes de login, senha antiga após reset e bloqueio | Comprovado |
| 5 | Recuperação redefine senha com solicitação válida | E2E recebe token pelo SMTP de captura, confere hash armazenado, redefine senha e rejeita reutilização | Comprovado no ambiente de teste |
| 6 | Backend autoriza operações protegidas | E2E cobre chamadas anônimas, candidato e recrutador nas rotas empresariais e confirma ausência de efeitos colaterais; testes por rota | Comprovado nos cenários cobertos; sem matriz exaustiva de toda rota/papel |
| 7 | Sessão expirada/revogada não executa operação protegida | E2E verifica revogação após redefinição/logout e expiração persistida | Comprovado nos cenários centrais |
| 8 | Empresa convida recrutador com aceite explícito | E2E cobre convite, definição de senha, aceite e ativação | Comprovado |
| 9 | Recrutador não tem mais de um vínculo ativo | Restrição PostgreSQL e teste de concorrência; E2E verifica exatamente um vínculo ativo após aceite concorrente | Comprovado |
| 10 | Empresa encerra vínculo próprio sem apagar conta/histórico | E2E verifica vínculo inativo e conta do recrutador preservada | Comprovado |
| 11 | Recrutador permanece ligado à Empresa responsável enquanto ativo | E2E consulta vínculo após aceite e após nova associação | Comprovado nos fluxos centrais |
| 12 | Empresa não administra vínculo de outra Empresa | E2E de isolamento de listagem e cancelamento cruzado; testes de mutações fora do escopo | Comprovado nos cenários centrais |
| 13 | Alterações relevantes ficam auditáveis | E2E verifica eventos de envio, reenvio, aceite, cancelamento, recusa, expiração e encerramento, incluindo contagem em concorrência | Comprovado para os eventos exercitados |
| 14 | Mensagens não expõem credenciais/dados pessoais desnecessários | Tokens armazenados como hash, respostas genéricas em alguns fluxos, snapshot do convite sem perfil atual e testes de rota | Parcial: a enumeração de e-mail não está totalmente mitigada; revisão de logs/provedor real não executada |

### Decisão desta rodada

A evidência existente cobre substancialmente os 14 critérios funcionais no CI e em E2E. A principal ressalva automatizada é a cobertura não exaustiva da autorização por todas as combinações de papel e rota; não há evidência de falha funcional conhecida nesses cenários, mas eles não devem ser declarados testados se não foram executados.

Validações externas — SMTP de homologação, proxy real, agendamento de retenção e revisão manual de acessibilidade — permanecem **não executadas**. Esta tabela não as converte em testes aprovados nem as inclui automaticamente como horas de código. A decisão de conclusão funcional deve considerar os critérios obrigatórios, evidência disponível e qualquer risco concreto encontrado nesta rodada.

**Meta de esforço vigente:** 4–8 horas técnicas para a rodada de fechamento. Não reiniciar a revisão completa sem falha concreta ou novo requisito.

## Atualização de evidências — HEAD `8073d24543df803f96ebdc68b2f66778d5127115` — 26/10/2026

- CI de push: [40252366637 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40252366637).
- CI do PR: [40252371339 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40252371339).
- A execução do PR confirmou sucesso em todas as etapas: validação e geração do Prisma Client, migrações PostgreSQL, restrição de vínculo ativo único, teste de concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP de captura.
- Cobertura de autorização foi revisada nos 13 arquivos de testes de rotas de API. Há verificações específicas de perfil inadequado, origem cruzada, empresa inativa/ausente, convite/vínculo pertencente a outra empresa, convite dirigido a outro recrutador, sessão/redefinição e falhas sem efeitos colaterais. A cobertura não é uma matriz exaustiva de cada combinação papel × rota; manter essa limitação explícita.
- Adicionados testes específicos para encerramento de vínculo e cancelamento de convite quando a conta da empresa está inativa. Ambos esperam resposta 403 e confirmam ausência de transação, mutação e auditoria indevida.
- A revisão de requisitos confirmou que RF-04 a RF-40 cobrem funcionalidades mais amplas do produto. Não as declarar implementadas pela SPEC-001 apenas porque a fundação de autenticação e autorização passou; manter a decisão de escopo vinculada aos critérios específicos da SPEC-001.
- **Estado:** evidência automatizada atualizada e verde. As validações externas/manuais listadas acima continuam pendentes; a CI não as substitui. PR #36 continua aberta em Draft, sem merge, deploy ou início da SPEC-002.


## Atualização de evidências — HEAD `ed74230dfc674350a9ceddaad9088fd2a24e285f` — 26/10/2026

- CI de push: [40253143930 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253143930).
- CI da PR: [40253150227 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40253150227).
- A correção remove a divulgação explícita do vínculo na mensagem de conflito e retorna texto genérico; ela não elimina todos os sinais de enumeração, como diferenças de status HTTP e a listagem de convites (limite residual detalhado nas atualizações posteriores).
- A cobertura foi reforçada no teste da rota e no E2E para verificar a mensagem genérica, rejeição HTTP 409 e ausência de criação de convite/envio de e-mail na tentativa rejeitada.
- As verificações automatizadas do workflow passaram para este HEAD: validação/geração Prisma, migrações PostgreSQL, integridade e concorrência de vínculo ativo, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL e SMTP de captura.
- A evidência confirma apenas os cenários automatizados exercitados. SMTP real, proxy de homologação/produção, agendamento/monitoramento de retenção, revisão manual completa de acessibilidade e pentest independente continuam não executados.
- PR #36 permanece aberta em Draft. Sem merge, deploy ou início da SPEC-002.

## Atualização de evidências — HEAD de código/testes `6a17319185e470db41be5421343baa6d16349280` — 26/10/2026

- CI de push: [40254168363 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40254168363).
- CI do PR: [40254172277 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40254172277).
- Ambos os fluxos concluíram as verificações de Prisma/migrações e integridade PostgreSQL, TypeScript, lint, testes unitários, build de produção e E2E de autenticação com PostgreSQL e SMTP de captura.
- Testes de regressão adicionados na rota de envio de convite: JSON malformado, e-mail inválido e nome do destinatário ausente. Eles verificam HTTP 400 e ausência de consulta ao destinatário, busca de vínculo, transação, auditoria e envio de e-mail.
- Teste de regressão adicionado na rota de cancelamento para JSON malformado, verificando HTTP 400 e ausência de transação, mutação e auditoria.
- **Risco residual:** a proteção contra enumeração de e-mail não é completa. Apesar da mensagem genérica no conflito de vínculo ativo, diferenças de status HTTP e a listagem de convites ainda podem revelar elegibilidade. Resolver isso de forma consistente exige uma decisão de produto/arquitetura; não registrar a mensagem genérica como mitigação total.
- As validações externas/manuais já listadas neste relatório permanecem não executadas: SMTP real, proxy real, agendamento/monitoramento de retenção em produção, revisão manual completa de acessibilidade e pentest independente.
- PR #36 permanece aberta em Draft, sem merge, deploy ou início da SPEC-002.


## Atualização de evidências — HEAD `80e041083c6c954a2cac59da154530af9b672652` — 26/10/2026

- CI de push: [40254871915 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40254871915).
- CI da PR: [40254875392 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40254875392).
- Ambas as execuções concluíram com sucesso as etapas de Prisma/migrações PostgreSQL, restrições de integridade e concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL e SMTP de captura.
- Foi acrescentado teste para JSON malformado na resposta a convite de recrutador: espera HTTP 400 e confirma que não se resolve sessão, não se consulta convite/usuário e não se inicia transação.
- Os testes de regressão de JSON malformado também cobrem recuperação de senha, confirmação de e-mail empresarial, envio de convite e cancelamento de convite; estes verificam rejeição controlada e ausência dos efeitos colaterais pertinentes à rota.
- A execução verde comprova apenas a pipeline automatizada configurada. A enumeração de e-mail permanece parcialmente mitigada, e continuam não executadas as validações externas/manuais de SMTP real, proxy real, agendamento/monitoramento de retenção em produção, acessibilidade manual e pentest independente.
- PR #36 permanece aberta em Draft, sem merge ou deploy. A SPEC-002 não foi iniciada.

## Atualização de evidências — HEAD de código/testes `bced0e5a2bba07c344ecc65674e1108c3f7b5416` — 26/10/2026

- CI de push: [40255438113 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40255438113).
- CI da PR: [40255441446 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40255441446).
- Foi adicionado teste de regressão para JSON malformado no login: a rota retorna HTTP 400 e o teste confirma que não consulta a conta, não inicia transação, não verifica senha e não cria sessão.
- O conjunto de regressões para JSON malformado cobre agora cadastro, login, recuperação/redefinição de senha, reenvio/confirmação de e-mail empresarial, criação/cancelamento de convite, resposta ao convite e encerramento de vínculo, com asserts de ausência dos efeitos colaterais relevantes por rota.
- Os dois eventos de CI concluíram com sucesso para o HEAD citado. Isso confirma a pipeline automatizada configurada (Prisma/migrações e integridade PostgreSQL, TypeScript, lint, testes, build e E2E); não substitui homologação externa ou validações manuais.
- Permanecem os limites já registrados: enumeração de e-mail não totalmente mitigada; autorização sem matriz exaustiva de cada papel × rota; SMTP real, proxy real, rotinas de retenção em produção, revisão manual de acessibilidade e pentest independente não executados.
- PR #36 permanece aberta em Draft, sem merge, deploy ou início da SPEC-002.

## Atualização de evidências — HEAD de código/testes `6962dee146ca15341a4d87d3bca5fcad9906eb4d` — 26/10/2026

- CI da PR para o HEAD: [40256334808 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40256334808).
- CI de push para o mesmo HEAD: [40256330678 — em execução na hora desta atualização](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40256330678); não registrar como aprovado até concluir.
- Foram acrescentados testes de regressão de origem cruzada nos fluxos de recuperação de senha, redefinição de senha e confirmação de e-mail empresarial. Cada teste espera HTTP 403 e confirma que a rota não consulta nem consome token, não inicia transação e, no fluxo de recuperação, não envia e-mail.
- A PR CI verde executou a pipeline configurada: Prisma/migrações PostgreSQL, integridade/concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP de captura.
- O teste de origem cruzada complementa os testes já existentes de JSON malformado, sessão/papel incorreto, concorrência e ausência de efeitos colaterais. Ele não substitui a validação real da configuração de origem no ambiente de produção.
- Permanecem pendentes: mitigação completa de enumeração de e-mail (decisão de produto/arquitetura), matriz exaustiva papel × rota, SMTP real, configuração real de proxy, agendamento/monitoramento de retenção em produção, revisão manual de acessibilidade e pentest independente.
- PR #36 permanece aberta em Draft, sem merge, deploy ou início da SPEC-002.


## Atualização de evidências — mitigação de enumeração de convites — HEAD `ea6d1bb13aaf5d2924a68f45fdccd05f97762624` — 26/10/2026

- CI da PR: [40259780023 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40259780023). Passaram validação/geração do Prisma Client, migrações PostgreSQL, integridade/concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL/SMTP de captura.
- A criação, o reenvio, os resultados inelegíveis e as falhas de entrega em solicitações válidas retornam HTTP 202 e a mesma mensagem genérica. Erros de autenticação, origem e entrada inválida continuam sendo rejeitados normalmente, antes de qualquer operação protegida.
- Para e-mails inelegíveis, a API registra uma linha neutra com `recipientUserId = null`, token aleatório não enviado e o mesmo formato de listagem. A linha não informa papel ou vínculo de outra empresa, não pode ser aceita pelo endpoint de resposta e pode ser convertida em convite real se o destinatário se tornar elegível.
- Solicitações neutras e convites reais usam o mesmo bloqueio transacional por empresa/e-mail para evitar duplicidade em concorrência. Ao converter um placeholder, a auditoria registra envio inicial, não reenvio.
- Falha de SMTP invalida o token tentado e preserva o estado público pendente, evitando revelar elegibilidade pelo status de cancelamento. A interface passou a usar “Solicitação pendente”, sem afirmar que todo registro gerou um e-mail.
- Regressões unitárias cobrem destinatário de outro papel, recrutador vinculado a outra empresa, falha de entrega, rejeição de placeholder no aceite e conversão de placeholder em convite elegível. O E2E confirma que a segunda empresa vê a linha neutra sem obter o vínculo real.
- **Resultado técnico:** a lacuna anterior de enumeração por status HTTP e ausência de linha na listagem foi mitigada no fluxo da aplicação e passou no CI acima. Isso não elimina inferências externas baseadas no recebimento real de e-mail nem substitui a validação de privacidade no ambiente operacional.
- Permanecem pendentes as verificações que exigem ambiente/acesso: SMTP real e links HTTPS canônicos, proxy confiável/`X-Forwarded-For`, agendamento/alertas das rotinas de retenção e revisão manual de acessibilidade nos temas claro/escuro. A cobertura de autorização é por cenários de risco, não uma matriz exaustiva de todo papel × rota.
- PR #36 permanece aberta em Draft. Sem merge, deploy ou início da SPEC-002.

## Verificação final da correção de privacidade — CI 40259994239

- **Commit validado:** `9810e1f38a06f73bb3cf9ab2ea5adc0cdabfc52e` (HEAD de `feat/initial-app-foundation` no momento desta execução).
- **CI:** [run 40259994239 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40259994239). O job `validate` concluiu com sucesso: validação/geração Prisma, migrações PostgreSQL, restrições de integridade e concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL e SMTP local de captura.
- **Correção de privacidade validada no HEAD funcional anterior:** solicitações de convite retornam resposta genérica HTTP 202; registros neutros não vinculam a conta do destinatário nem enviam e-mail; tokens neutros são recusados; falhas de SMTP invalidam o token tentado; e placeholders são convertidos em convite real quando a conta se torna elegível.
- **Estado da entrega:** a PR #36 permanece aberta em Draft, sem merge ou deploy. A SPEC-001 não é declarada formalmente concluída.
- **Pendências externas ao CI:** entrega de e-mail por SMTP real e links HTTPS canônicos, validação do proxy confiável e de `X-Forwarded-For`, agendamento/monitoramento das rotinas de retenção, aceite manual de acessibilidade/temas e homologação de segurança independente. Essas etapas exigem infraestrutura e evidência operacional; não podem ser consideradas concluídas apenas com CI verde.


## Evidência confirmada — 26/10/2026 (HEAD documental `9810e1f`)

Esta seção registra apenas execuções concluídas e associadas aos SHAs indicados.

- **HEAD de código/testes:** `2c9fce50275c5531df0587e14f5f58da050f6271`.
- **CI de push do HEAD de código/testes:** [40261466174 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40261466174).
- **CI da PR do HEAD de código/testes:** [40259780023 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40259780023).
- **HEAD documental validado antes desta atualização:** `9810e1f38a06f73bb3cf9ab2ea5adc0cdabfc52e`.
- **CI de push desse HEAD documental:** [40259989977 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40259989977).
- **CI da PR desse HEAD documental:** [40259994239 — sucesso](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40259994239).

### Etapas e evidências inspecionadas

Na execução [40261466174](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40261466174), o job `validate` terminou com sucesso em todas as etapas: validação/geração do Prisma, migrações PostgreSQL, verificações da restrição de vínculo ativo e concorrência, TypeScript, lint, testes unitários, build de produção e E2E com PostgreSQL e SMTP local de captura. O lint reportou 14 avisos e zero erros. A suíte registrou **27 arquivos de teste e 222 testes aprovados**. O E2E confirma agora também login de candidato por CPF formatado e recuperação de senha de empresa, incluindo envio ao SMTP de teste, redefinição, rejeição de reutilização do link e login com a nova senha.

A implementação de solicitações neutras de convite mantém a resposta pública genérica HTTP 202; registros sem destinatário elegível não ficam associados a um `recipientUserId`, não geram envio de e-mail nem evento de convite enviado. A transição de placeholder para convite elegível é coberta por teste, assim como a rejeição de convites sem destinatário associado. Os logs do PostgreSQL incluem violações de unicidade e conflitos de serialização esperados pelos testes de concorrência; o job concluiu com sucesso.

### Limitações operacionais mantidas

As execuções confirmam apenas a automação configurada no repositório. Não foram realizadas nesta revisão: homologação com SMTP real, validação do proxy confiável real e de `X-Forwarded-For`, configuração/agendamento de retenção em produção, testes manuais de acessibilidade/dispositivos, homologação externa ou pentest independente. A SPEC-001 permanece em validação e não é declarada formalmente concluída.

Esta atualização do relatório é documental. A execução de CI disparada pelo novo commit documental deve ser verificada separadamente; esta seção não antecipa seu resultado.

## Fechamento funcional — resultado desta execução
**Ambiente:** sem checkout local e sem acesso de rede para clonar o repositório. Os comandos abaixo foram confirmados no CI remoto; o Compose e o app não foram iniciados localmente.
- `npx prisma migrate deploy` — **PASSOU no CI** (PostgreSQL 15).
- `npm run db:generate` — **PASSOU no CI**.
- `npm run typecheck` — **PASSOU no CI**.
- `npm run lint` — **PASSOU no CI**.
- `npm test` — **PASSOU no CI**.
- `npm run build` — **PASSOU no CI**.
- `node scripts/auth-e2e.mjs` — **PASSOU no CI**, com SMTP de captura.
- `docker compose up -d postgres mailpit` e teste manual do app — **NÃO EXECUTADOS** neste ambiente.

| Fluxo | Resultado verificado |
|---|---|
| Cadastro candidato e login por e-mail | **OK no E2E**; API coberta, interface não testada. |
| Login de candidato por CPF válido | **OK no E2E** com CPF formatado; interface não testada. |
| Cadastro de empresa, confirmação por e-mail e login | **OK no E2E**; interface não testada. |
| Recuperação de senha de candidato, uso único e nova senha | **OK no E2E**. |
| Recuperação de senha de empresa | **OK no E2E**: e-mail de teste, redefinição, link de uso único e login com nova senha; interface não testada. |
| Convite novo, definir senha e aceitar | **OK no E2E**; interface não testada. |
| Reenvio, cancelamento, recusa e encerramento de vínculo | **OK no E2E**. |
| Logout e sessão expirada/invalidada | **OK no E2E** para revogação/bloqueio de acesso. |

**Divergências visuais** (comparação de textos/estrutura, sem screenshot): (1) entrada atual escolhe perfil e encaminha para páginas separadas, enquanto o SVG combina escolha e formulário; (2) cadastro de candidato não pede data de nascimento; (3) cadastro de empresa não tem campo separado para responsável e inclui nome fantasia; (4) menu de recrutadores é reduzido; (5) recuperação reúne seleção de perfil e redefinição além do formulário no SVG. Não alteradas: campos ausentes exigem mudanças de modelo/escopo; comparação pixel a pixel exige navegador.
**Arquivos alterados:** `compose.yaml`, `.env.example`, `README.md`, `docs/Specs.md` e este relatório. Mailpit: `http://localhost:8025`; SMTP `127.0.0.1:1025`; `APP_BASE_URL=http://localhost:3000`.
**Pendência restante:** iniciar Compose/app localmente e testar manualmente as telas, links no Mailpit e diferenças visuais. Login por CPF e recuperação de senha de empresa agora passaram no E2E automatizado. A SPEC-001 tem validação automatizada substancial, mas a interface ainda não foi verificada manualmente. PR #36 continua Draft; sem merge, deploy ou início da SPEC-002.
