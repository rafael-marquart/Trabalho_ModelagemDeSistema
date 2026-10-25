# Matriz de validação — SPEC-001

**Revisão:** 25/10/2026  
**Branch:** `feat/initial-app-foundation`  
**HEAD verificado:** `d9c5738047e0d0037e37491ec4a6f9a481be3495`  
**Pull request:** [#36](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/pull/36) — permanece Draft  
**Objetivo:** separar implementação existente, evidência automatizada disponível e validações ainda necessárias. Esta matriz não substitui os critérios de aceite da `docs/Specs.md` nem declara a SPEC-001 concluída.

## Estado de CI observado

- O CI de push (run [40212263297](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40212263297)) e o CI de pull request (run [40212267482](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40212267482)) concluíram com sucesso para o HEAD `d9c5738047e0d0037e37491ec4a6f9a481be3495`.
- A etapa `validate` passou nas duas execuções. A pipeline cobre validação/geração Prisma, migrações PostgreSQL, restrições de integridade e concorrência, TypeScript, lint, testes unitários e build de produção.
- O HEAD mantém a serialização por bloqueio de linha no reset de senha, teste para usuário que deixa de estar elegível antes da transação e proteção contra corrida na ativação de empresa durante a confirmação de e-mail. A ordem das operações foi ajustada para não consumir tokens secundários se a ativação não for confirmada.
- A recuperação de senha mantém resposta HTTP 200 e mensagem genérica quando há throttling, para reduzir risco de enumeração de contas.
- A listagem `GET /api/company/recruiter-invitations` é somente leitura: convites pendentes cujo prazo já passou são apresentados como `EXPIRED` na resposta, sem atualizar o banco nem gravar auditoria durante a consulta. O status persistido pode permanecer `PENDING` até um fluxo explícito de escrita tratar o convite.
- A rota de logout não deriva mais o destino do redirecionamento do host da requisição: usa a origem canônica `APP_BASE_URL`, e retorna `503` em produção se ela estiver ausente. Testes cobrem host não confiável, ausência de configuração e rejeição de origem cruzada.
- CI não comprova configuração real de SMTP, proxy, domínio público, agendador de retenção nem experiência de acessibilidade em navegadores/dispositivos. Os dois workflows de CI para o HEAD atual passaram. O bloqueio de login é por conta; a proteção por IP no fluxo de login permanece uma decisão/pendência de segurança, diferente do throttling por conta/IP já implementado na recuperação de senha.

## Matriz dos critérios de aceitação

| Critério da SPEC-001 | Implementação/evidência disponível | Estado de validação | Pendência |
|---|---|---|---|
| Entrada apresenta login por e-mail e senha | `src/app/page.tsx`, telas de login de candidato e empresa | Implementado; inspeção visual manual ainda necessária | Conferir fluxos e teclado/leitor de tela |
| Cadastro oferece Usuário ou Empresa, sem cadastro independente de Recrutador | Página inicial e páginas de cadastro; rotas de cadastro de candidato/empresa | Implementado; testes automatizados de rotas | Confirmar navegação ponta a ponta |
| Credenciais válidas autenticam e encaminham conforme perfil | `src/app/api/auth/login/route.ts` e testes de login | Coberto por testes unitários; CI do HEAD passou | Validar com PostgreSQL e cookie em teste de integração |
| Credenciais inválidas não autenticam | Testes de login cobrem senha incorreta, conta bloqueada e perfil | Coberto por testes unitários; CI do HEAD passou | Incluir cenários adicionais de integração, se necessários |
| Recuperação permite redefinição quando válida | Rotas `password/forgot` e `password/reset` e respectivos testes | Cobertura unitária; CI do HEAD passou | Testar entrega real de e-mail e percurso completo com banco |
| Operações protegidas verificam autorização no backend | Verificações de papel/sessão em páginas e rotas de recrutadores | Cobertura parcial por testes de rotas e revisão de código | Auditar todas as operações protegidas contra a matriz de permissões da baseline |
| Sessão expirada ou invalidada não executa operações protegidas | `src/lib/auth/session.ts`, testes de sessão e redefinição de senha | Cobertura unitária; CI do HEAD passou | Testar cookies, expiração, logout e revogação em execução integrada |
| Empresa autorizada cadastra/associa Recrutador por convite com aceite explícito | Rotas de convite, resposta, cancelamento e testes correspondentes | Cobertura unitária; constraints PostgreSQL verificadas no CI | Teste de ponta a ponta com envio de e-mail e duas identidades |
| Um Recrutador não mantém mais de um vínculo empresarial ativo | Restrição única no banco e scripts SQL de integridade/concorrência | Validado na pipeline CI do HEAD | Complementar com cenário integrado usando duas empresas |
| Empresa encerra seu próprio vínculo sem apagar conta nem histórico | `src/app/api/company/recruiter-links/end/route.ts` e testes | Cobertura unitária e revisão de escopo | Executar teste integrado de isolamento entre duas empresas |
| Recrutador permanece vinculado à Empresa responsável enquanto ativo | Consulta de vínculos e modelo de dados | Implementado; cobertura automatizada parcial | Conferir transições e permissões após encerramento |
| Empresa não consegue administrar vínculo de outra Empresa | Escopo por `companyId` nas rotas e testes de autorização | Cobertura unitária e revisão de código | Confirmar cenário integrado multiempresa |
| Alterações relevantes são rastreáveis | Eventos de auditoria transacionais em autenticação, convite e encerramento; rotina de retenção | Implementação e testes da rotina disponíveis | Verificar cobertura evento por evento; agendamento/alertas de produção ainda não configurados |
| Mensagens não expõem credenciais ou dados pessoais desnecessários | Mensagens genéricas de login/recuperação e protótipo de mensagens aprovado; throttling de recuperação mantém status e texto genéricos | Cobertura parcial por testes unitários e inspeção de código; CI passou | Revisar manualmente mensagens e acessibilidade dos anúncios de erro/sucesso |

## Validações transversais ainda necessárias

1. **Integração/E2E:** executar percursos completos de cadastro, confirmação de e-mail, login, recuperação, convite de recrutador, aceite/recusa, cancelamento e encerramento de vínculo contra PostgreSQL e provedor de e-mail de teste.
2. **Autorização:** verificar sistematicamente candidato, empresa, recrutador e usuário anônimo em todas as rotas protegidas, inclusive tentativa de acessar identificadores de outra organização.
3. **Segurança:** revisar concorrência de tokens de uso único, sessões, origem de requisição, mensagens anti-enumeração, cookies e logs de auditoria. O login atualmente aplica bloqueio por conta após 10 falhas consecutivas em 15 minutos e registra IP/identificador com hash, mas não implementa limite global de tentativas por IP para login; avaliar e definir esse controle antes da publicação. O cabeçalho `X-Forwarded-For` só é confiável se o proxy de produção o sobrescrever.
4. **Acessibilidade/usabilidade:** revisar foco, labels, mensagens `role="alert"`/`role="status"`, contraste, teclado e leitor de tela; a aprovação do SVG não comprova conformidade da implementação.
5. **Configuração operacional:** definir e testar `APP_BASE_URL`, SMTP e configuração do proxy confiável; configurar e monitorar a execução diária da retenção de auditoria.
6. **Figma:** sincronizar `Gestao-Recrutadores.svg` e `Mensagens-Autenticacao.svg` na fonte editável e verificar visualmente. A fonte ainda não foi atualizada.
7. **Fechamento:** revisar os 14 critérios acima com evidências, confirmar os critérios de aceite da SPEC-001 e obter aprovação explícita antes de retirar Draft ou iniciar outra Spec.

## Decisão atual

**SPEC-001 permanece em implementação/validação.** O CI de push e pull request passou no HEAD `d9c5738047e0d0037e37491ec4a6f9a481be3495`, com testes unitários, migrações/restrições de banco e build de produção. Ainda não há evidência suficiente para afirmar que todos os critérios passaram por validação ponta a ponta ou operacional. Nenhum merge para `main`, publicação em produção ou início da SPEC-002 está autorizado por este relatório.
