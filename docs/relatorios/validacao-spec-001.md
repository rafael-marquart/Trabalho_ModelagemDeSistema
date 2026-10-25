# Matriz de validação — SPEC-001

**Revisão:** 25/10/2026 — atualização após nova rodada de alterações  
**Branch:** `feat/initial-app-foundation`  
**HEAD da implementação revisada:** `778b24fa3ae2190be27e2f1a9be97f236907277f`  
**Último HEAD de implementação validado pelo CI:** `778b24fa3ae2190be27e2f1a9be97f236907277f` (push e Pull Request aprovados).  
**Pull request:** [#36](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/pull/36) — permanece Draft  
**Objetivo:** separar implementação existente, evidência automatizada disponível e validações ainda necessárias. Esta matriz não substitui os critérios de aceite da `docs/Specs.md` nem declara a SPEC-001 concluída.

## Estado de CI observado

- O CI de push (run [40217360713](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40217360713)) e o CI de pull request (run [40217364487](https://github.com/rafael-marquart/Trabalho_ModelagemDeSistema/actions/runs/40217364487)) concluíram com sucesso para o HEAD `778b24fa3ae2190be27e2f1a9be97f236907277f`. As execuções incluem validação/geração Prisma, migrações PostgreSQL, restrições de integridade/concorrência, TypeScript, lint, testes unitários e build de produção.
- Durante esta rodada, os primeiros CI de tema identificaram três classes de problema e foram corrigidos antes da aprovação final: `React is not defined` nos componentes JSX testados, falta de limpeza entre renderizações no Vitest e posição incorreta da diretiva `\"use client\"` no build Next.js. O HEAD aprovado contém as correções. As falhas de execuções anteriores permanecem no histórico; a evidência de conclusão é a dupla execução bem-sucedida no HEAD `778b24f`.
- A etapa `validate` passou nas duas execuções. A pipeline cobre validação/geração Prisma, migrações PostgreSQL, restrições de integridade e concorrência, TypeScript, lint, testes unitários e build de produção.
- O HEAD mantém a serialização por bloqueio de linha no reset de senha, teste para usuário que deixa de estar elegível antes da transação e proteção contra corrida na ativação de empresa durante a confirmação de e-mail. A ordem das operações foi ajustada para não consumir tokens secundários se a ativação não for confirmada.
- A contagem de falhas por conta agora acompanha `lastFailedLoginAt` e reinicia o contador quando a falha anterior está fora da janela móvel de 15 minutos; o sucesso e a redefinição de senha limpam ambos os campos. O teste de regressão cobre contador antigo com nove falhas registradas há mais de 15 minutos.
- A recuperação de senha mantém resposta HTTP 200 e mensagem genérica quando há throttling, para reduzir risco de enumeração de contas.
- A listagem `GET /api/company/recruiter-invitations` é somente leitura: convites pendentes cujo prazo já passou são apresentados como `EXPIRED` na resposta, sem atualizar o banco nem gravar auditoria durante a consulta. O status persistido pode permanecer `PENDING` até um fluxo explícito de escrita tratar o convite.
- A rota de logout usa a origem canônica `APP_BASE_URL`, em vez de derivar o destino do host da requisição, e retorna `503` em produção se a configuração estiver ausente. Testes cobrem host não confiável, ausência de configuração e rejeição de origem cruzada.
- O CI não comprova configuração real de SMTP, proxy, domínio público, agendador de retenção nem acessibilidade em navegadores/dispositivos. O throttling gradual por IP e seus testes foram adicionados e passaram na revisão atual. O cabeçalho `X-Forwarded-For` só é confiável se o proxy de produção o sobrescrever.

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

## Auditoria de autorização e isolamento

Revisão estática das rotas de autenticação, convite e vínculo na revisão `36991af` e conferência dos testes correspondentes:

- As rotas de convite e vínculo exigem sessão com papel `COMPANY`, verificam conta ativa e obtêm a empresa pelo `accountUserId` da sessão; listagens e mutações são limitadas ao `companyId` autenticado.
- Cancelamento de convite e encerramento de vínculo usam mutações condicionais que incluem o identificador do recurso, a empresa proprietária e o estado esperado; os testes verificam que identificadores pertencentes a outra empresa não são alterados nem auditados.
- A resposta ao convite verifica o destinatário autenticado, reivindica o token apenas se ainda estiver pendente e válido, confirma que a empresa está ativa e impede criar vínculo quando o recrutador já tem vínculo ativo. Há testes de corrida, destinatário incorreto, empresa inativa e falhas de auditoria.
- A confirmação de e-mail e a redefinição de senha reivindicam tokens de uso único dentro de transações e falham de forma controlada se a conta/estado mudou. A redefinição invalida sessões existentes.
- Esta foi uma revisão estática apoiada nos testes existentes, não um teste de penetração nem validação integrada multiempresa. Nenhuma vulnerabilidade de autorização evidente foi identificada nos fluxos inspecionados; permanecem necessárias verificações E2E e operacionais.

## Validações transversais ainda necessárias

1. **Integração/E2E:** executar percursos completos de cadastro, confirmação de e-mail, login, recuperação, convite de recrutador, aceite/recusa, cancelamento e encerramento de vínculo contra PostgreSQL e provedor de e-mail de teste.
2. **Autorização:** uma revisão estática das 12 rotas de API atuais confirmou que todas as rotas mutáveis `POST` verificam origem e que as operações de convites/vínculos de empresa são limitadas à empresa autenticada. Ainda falta executar sistematicamente cenários integrados para candidato, empresa, recrutador e usuário anônimo em todas as rotas protegidas, inclusive acesso a identificadores de outra organização.
3. **Segurança:** revisar concorrência de tokens de uso único, sessões, origem de requisição, mensagens anti-enumeração, cookies e logs de auditoria. O login aplica bloqueio por conta após 10 falhas consecutivas em 15 minutos e throttling gradual por IP: 31 falhas no intervalo móvel de 15 minutos acionam cooldown de 60 segundos; 51, 5 minutos; 81, 15 minutos; e 121 ou mais, 60 minutos. Os parâmetros estão documentados em `docs/operacao/seguranca-login.md`. Testar operação atrás do proxy confiável e monitorar impactos em redes compartilhadas.
4. **Acessibilidade/usabilidade e temas:** o tema claro/escuro já foi implementado com controle acessível, preferência do sistema e persistência local; os testes de componente passaram no CI do HEAD `778b24f`. Ainda é necessária inspeção visual da implementação nos dois temas, revisão de contraste/estados/foco, navegação por teclado e leitor de tela. A aprovação dos SVGs não comprova, por si só, conformidade WCAG 2.2 AA.
5. **Configuração operacional:** definir e testar `APP_BASE_URL`, SMTP e configuração do proxy confiável; configurar e monitorar a execução diária da retenção de auditoria.
6. **Referências visuais/Figma:** por solicitação do responsável, os SVGs versionados `docs/Identidade Visual/Gestao-Recrutadores.svg` e `docs/Identidade Visual/Mensagens-Autenticacao.svg` são a referência visual a usar enquanto a conta Figma estiver sem cota. Não é necessário bloquear a implementação à espera da sincronização; a fonte editável continua sem atualização e a verificação final deve ser feita contra os SVGs do repositório.
7. **Fechamento:** revisar os 14 critérios acima com evidências, confirmar os critérios de aceite da SPEC-001 e obter aprovação explícita antes de retirar Draft ou iniciar outra Spec.

## Decisão atual

**SPEC-001 permanece em implementação/validação.** O CI de push e Pull Request passou para o HEAD `778b24fa3ae2190be27e2f1a9be97f236907277f`, incluindo a correção da janela de falhas por conta, a implementação inicial de tema claro/escuro e seus testes, migrações/restrições PostgreSQL, TypeScript, lint e build de produção. Ainda não há evidências suficientes para afirmar que todos os critérios passaram por validação ponta a ponta ou operacional. Nenhum merge para `main`, publicação em produção ou início da SPEC-002 está autorizado por este relatório. A revisão estática de autorização/isolamento não identificou vulnerabilidade evidente nos fluxos inspecionados, mas ainda não há evidência suficiente para afirmar que todos os critérios passaram por validação ponta a ponta ou operacional. Nenhum merge para `main`, publicação em produção ou início da SPEC-002 está autorizado por este relatório.
