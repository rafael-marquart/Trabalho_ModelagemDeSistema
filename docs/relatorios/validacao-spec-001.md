# Matriz de validação — SPEC-001

**Revisão:** 25/10/2026  
**Branch:** `feat/initial-app-foundation`  
**Pull request:** #36 — permanece Draft  
**Objetivo:** separar implementação existente, evidência automatizada disponível e validações ainda necessárias. Esta matriz não substitui os critérios de aceite da `docs/Specs.md` nem declara a SPEC-001 concluída.

## Estado de CI observado

- CI dos commits `09a5c594` passou em ambos os eventos (push e pull request), incluindo validação/geração Prisma, migrações PostgreSQL, restrições de integridade e concorrência, TypeScript, lint, testes unitários e build de produção.
- Commit `070e66b3` passou em ambas as execuções (push e pull request), incluindo todos os passos da pipeline.\n- Revisão adicional de segurança identificou que o endpoint de recuperação devolvia HTTP 429 com mensagem específica ao atingir o limite; como o limite por conta pode revelar se um identificador existe, a resposta foi alterada para manter o mesmo HTTP 200 e a mesma mensagem genérica. O bloqueio persistente continua ativo no backend. Os testes e o CI dos commits seguintes ainda precisam confirmar essa correção.
- CI é uma verificação automatizada de código e banco de teste; não comprova configuração real de SMTP, proxy, domínio público, agendador de retenção nem experiência de acessibilidade em navegadores/dispositivos.

## Matriz dos critérios de aceitação

| Critério da SPEC-001 | Implementação/evidência disponível | Estado de validação | Pendência |
|---|---|---|---|
| Entrada apresenta login por e-mail e senha | `src/app/page.tsx`, telas de login de candidato e empresa | Implementado; inspeção visual manual ainda necessária | Conferir fluxos e teclado/leitor de tela |
| Cadastro oferece Usuário ou Empresa, sem cadastro independente de Recrutador | Página inicial e páginas de cadastro; rotas de cadastro de candidato/empresa | Implementado; teste automatizado da rota de candidato/empresa | Confirmar navegação ponta a ponta |
| Credenciais válidas autenticam e encaminham conforme perfil | `src/app/api/auth/login/route.ts`; `route.test.ts` de login | Coberto por testes unitários; CI do commit mais recente pendente | Validar com PostgreSQL e cookie em teste de integração |
| Credenciais inválidas não autenticam | Testes de login cobrem senha incorreta, conta bloqueada e perfil | Coberto por testes unitários | Incluir cenários adicionais de integração, se necessários |
| Recuperação permite redefinição quando válida | Rotas `password/forgot` e `password/reset` e respectivos testes | Cobertura unitária existente | Testar entrega real de e-mail e percurso completo com banco |
| Operações protegidas verificam autorização no backend | Verificações de papel/sessão em páginas e rotas de recrutadores | Cobertura parcial por testes de rotas | Auditar todas as operações protegidas contra a matriz de permissões da baseline |
| Sessão expirada ou invalidada não executa operações protegidas | `src/lib/auth/session.ts`, testes de sessão e redefinição de senha | Cobertura unitária existente; teste de logout novo aguarda CI | Testar cookies, expiração, logout e revogação em execução integrada |
| Empresa autorizada cadastra/associa Recrutador por convite com aceite explícito | Rotas de convite, resposta, cancelamento e testes correspondentes | Cobertura unitária existente; constraints PostgreSQL verificadas no CI anterior | Teste de ponta a ponta com envio de e-mail e duas identidades |
| Um Recrutador não mantém mais de um vínculo empresarial ativo | Restrição única no banco e scripts SQL de integridade/concorrência | Validado no CI do commit `09a5c594` | Confirmar novamente no CI mais recente |
| Empresa encerra seu próprio vínculo sem apagar conta nem histórico | `src/app/api/company/recruiter-links/end/route.ts` e testes | Cobertura unitária existente | Executar teste integrado de isolamento entre duas empresas |
| Recrutador permanece vinculado à Empresa responsável enquanto ativo | Consulta de vínculos e modelo de dados | Implementado; cobertura automatizada parcial | Conferir transições e permissões após encerramento |
| Empresa não consegue administrar vínculo de outra Empresa | Escopo por `companyId` nas rotas e testes de autorização | Cobertura unitária existente | Adicionar/confirmar cenário integrado multiempresa |
| Alterações relevantes são rastreáveis | Eventos de auditoria transacionais em autenticação, convite e encerramento; rotina de retenção | Implementação e testes da rotina disponíveis | Verificar cobertura evento por evento; agendamento/alertas de produção ainda não configurados |
| Mensagens não expõem credenciais ou dados pessoais desnecessários | Mensagens genéricas de login/recuperação e protótipo de mensagens aprovado; throttling de recuperação agora mantém status e texto genéricos | Cobertura parcial por testes unitários e inspeção de código | Confirmar no CI atual e revisar manualmente todas as mensagens e acessibilidade dos anúncios de erro/sucesso |

## Validações transversais ainda necessárias

1. **CI do HEAD atual:** aguardar conclusão das execuções de push e pull request para `e29bc849`; corrigir falhas, se houver.
2. **Integração/E2E:** executar percursos completos de cadastro, confirmação de e-mail, login, recuperação, convite de recrutador, aceite/recusa, cancelamento e encerramento de vínculo contra PostgreSQL e provedor de e-mail de teste.
3. **Autorização:** verificar sistematicamente candidato, empresa, recrutador e usuário anônimo em todas as rotas protegidas, inclusive tentativa de acessar identificadores de outra organização.
4. **Segurança:** revisar limites de tentativas, concorrência de tokens de uso único, sessões, origem de requisição, mensagens anti-enumeração, cookies e logs de auditoria.
5. **Acessibilidade/usabilidade:** revisar foco, labels, mensagens `role="alert"`/`role="status"`, contraste, teclado e leitor de tela; a aprovação do SVG não comprova conformidade da implementação.
6. **Configuração operacional:** definir e testar `APP_BASE_URL`, SMTP e configuração do proxy confiável; configurar e monitorar a execução diária da retenção de auditoria.
7. **Figma:** sincronizar `Gestao-Recrutadores.svg` e `Mensagens-Autenticacao.svg` na fonte editável e verificar visualmente. A fonte ainda não foi atualizada.
8. **Fechamento:** revisar os 14 critérios acima com evidências, confirmar os critérios de aceite da SPEC-001 e obter aprovação explícita antes de retirar Draft ou iniciar outra Spec.

## Decisão atual

**SPEC-001 permanece em implementação/validação.** Existem evidências de implementação, testes unitários, migrações e restrições de banco, mas não há evidência suficiente para afirmar que todos os critérios de aceitação passaram por validação ponta a ponta ou operacional. Nenhum merge para `main` ou publicação em produção está autorizado por este relatório.
