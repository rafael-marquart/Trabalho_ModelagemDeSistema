# Registros (auditoria e log de operação)

O AcessaVagas mantém dois tipos de registro:

1. **Auditoria** (tabela `AuditEvent`): fica no banco, registra quem fez o quê e quando, e atende ao RNF-14 e às RB-27, RB-37 e RB-41.
2. **Log de operação** (saída do servidor, visível no painel da Vercel): registra falhas de serviços externos e de rotinas agendadas (RNF-17).

Além deles, há históricos próprios: `ApplicationStageEvent` (funil) e `ReportEvent` (moderação), que o banco não deixa alterar nem apagar, e `ConsentRecord` (aceites e consentimentos), que o banco não deixa alterar. As tentativas de login ficam 24 horas em `LoginAttempt`; os pedidos de recuperação de senha ficam em `RecoveryAttempt`.

## Formato do registro de auditoria

| Campo | Conteúdo |
|---|---|
| `createdAt` | Data e hora |
| `actorUserId` | Quem fez (vazio quando é o próprio sistema) |
| `eventType` | Tipo do evento (tabela abaixo) |
| `subjectType` e `subjectId` | Objeto afetado (por exemplo, `Job` e o id da vaga) |
| `metadata` | Detalhes sem dados sensíveis (por exemplo, etapa anterior e nova, nomes dos campos alterados) |
| `retentionHold` | Impede o apagamento automático quando há obrigação de guarda |

Nunca entram no registro: senha, hash de senha, token de sessão, link de recuperação, chave de serviço externo, CPF, conteúdo de comprovante ou descrição livre de acessibilidade (RNF-14).

## Catálogo de eventos por Spec

### SPEC-001 — Acesso, cadastro e recrutadores

| Evento | Quando |
|---|---|
| `AUTH_CANDIDATE_REGISTERED` | Conta de candidato criada |
| `AUTH_COMPANY_REGISTERED_PENDING_VALIDATION` | Conta de Empresa criada, aguardando confirmação do e-mail |
| `AUTH_COMPANY_EMAIL_CONFIRMED` | E-mail corporativo confirmado |
| `AUTH_COMPANY_EMAIL_VERIFICATION_RESEND_REQUESTED` | Pedido de reenvio da confirmação |
| `AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED` | Falha ao enviar o e-mail de confirmação |
| `AUTH_LOGIN_SUCCEEDED` | Login com sucesso (as falhas ficam em `LoginAttempt`) |
| `AUTH_LOGOUT` | Saída da conta |
| `AUTH_PASSWORD_RECOVERY_EMAIL_FAILED` | Falha ao enviar o link de recuperação |
| `AUTH_PASSWORD_RESET_SUCCEEDED` | Senha redefinida (as sessões são revogadas) |
| `ADMIN_ACCOUNT_CREATED` | Administrador criado pelo script `scripts/create-admin.mjs` |
| `RECRUITER_INVITATION_REQUEST_RECEIVED` | Pedido de convite recebido (resposta neutra) |
| `RECRUITER_ACCOUNT_CREATED_PENDING_ACTIVATION` | Conta de recrutador criada, aguardando aceite |
| `RECRUITER_INVITATION_SENT` / `RECRUITER_INVITATION_RESENT` | Convite enviado ou reenviado |
| `RECRUITER_INVITATION_DELIVERY_FAILED` | Falha ao enviar o convite |
| `RECRUITER_INVITATION_EXPIRED` | Convite expirado (7 dias) |
| `RECRUITER_INVITATION_CANCELLED` | Convite cancelado pela Empresa |
| `RECRUITER_INVITATION_ACCEPTED` / `RECRUITER_INVITATION_REFUSED` | Convite aceito ou recusado |
| `RECRUITER_ACCOUNT_ACTIVATED_AND_INVITATION_ACCEPTED` | Conta nova ativada junto com o aceite |
| `RECRUITER_LINK_ENDED` | Vínculo do recrutador encerrado |

### SPEC-002 — Perfil do candidato

| Evento | Quando |
|---|---|
| `CANDIDATE_PROFILE_CREATED` / `CANDIDATE_PROFILE_UPDATED` | Perfil criado ou alterado (só os nomes das seções alteradas) |
| `CANDIDATE_PROFILE_DOCUMENT_ADDED` / `CANDIDATE_PROFILE_DOCUMENT_REMOVED` | Comprovante enviado ou removido |
| `CANDIDATE_ACCESSIBILITY_CONSENT_GRANTED` / `CANDIDATE_ACCESSIBILITY_CONSENT_REVOKED` | Consentimento para dados de acessibilidade dado ou retirado |
| `PROFILE_PHOTO_UPDATED` / `PROFILE_PHOTO_REMOVED` | Foto de perfil trocada ou removida (também para recrutador) |
| `ACCESSIBILITY_CATALOG_OPTION_CREATED` / `ACCESSIBILITY_CATALOG_OPTION_UPDATED` | Administrador alterou o catálogo de necessidades |

### SPEC-003 — Recursos de acessibilidade da interface

| Evento | Quando |
|---|---|
| `ACCESSIBILITY_PREFERENCES_UPDATED` | Preferência de alto contraste ou de e-mail alterada |

### SPEC-004 — Infraestrutura da Empresa

| Evento | Quando |
|---|---|
| `COMPANY_INFRASTRUCTURE_CREATED` / `COMPANY_INFRASTRUCTURE_UPDATED` | Questionário salvo pela primeira vez ou alterado (itens alterados no `metadata`) |

### SPEC-005 e SPEC-009 — Vagas e status

| Evento | Quando |
|---|---|
| `JOB_CREATED` / `JOB_UPDATED` | Vaga criada ou editada (nomes dos campos alterados) |
| `JOB_PUBLISHED`, `JOB_PAUSED`, `JOB_REOPENED`, `JOB_CLOSED` | Mudança de estado (estado anterior e novo; no encerramento, quantos candidatos ativos serão avisados) |

### SPEC-011, SPEC-012 e SPEC-013 — Candidatura e funil

| Evento | Quando |
|---|---|
| `APPLICATION_SUBMITTED` | Candidatura registrada |
| `APPLICATION_CANCELLED` | Candidatura cancelada pelo candidato |
| `APPLICATION_HIDDEN_BY_CANDIDATE` | Candidatura recusada ou cancelada tirada da lista pelo candidato |
| `APPLICATION_STAGE_CHANGED` | Mudança de etapa pela Empresa ou Recrutador (etapa anterior e nova) |

### SPEC-017 — Notificações

| Evento | Quando |
|---|---|
| `NOTIFICATION_DELIVERY_FAILED` | Aviso por e-mail que falhou de vez: erro permanente ou erro temporário depois de 5 tentativas |

### SPEC-018 e SPEC-021 — Entrevistas, avaliações e nota pública

| Evento | Quando |
|---|---|
| `INTERVIEW_SCHEDULED`, `INTERVIEW_UPDATED`, `INTERVIEW_CANCELLED`, `INTERVIEW_COMPLETED` | Entrevista agendada, alterada, cancelada ou concluída |
| `EVALUATION_SUBMITTED` | Avaliação enviada |
| `EVALUATION_REFUSED` | Tentativa de avaliação recusada (motivo no `metadata`) |
| `EVALUATION_ABUSE_SUSPECTED` | 3 ou mais recusas da mesma pessoa em 24 h (OPEN-095) |
| `PUBLIC_RATING_UPDATED` | Nota pública da Empresa recalculada |

### SPEC-019 e SPEC-020 — Denúncias e moderação

| Evento | Quando |
|---|---|
| `REPORT_SUBMITTED` | Denúncia registrada |
| `REPORT_REFUSED` | Denúncia recusada (por exemplo, `DAILY_LIMIT`: limite de 3 em 24 h) |
| `REPORT_ANALYSIS_STARTED` | Administrador iniciou a análise |
| `REPORT_INFO_REQUESTED` | Pedido de informações à Empresa |
| `REPORT_COMPANY_RESPONDED` | Empresa respondeu |
| `REPORT_CONCLUDED` | Decisão registrada |
| `REPORT_PRIORITY_CHANGED` | Prioridade alterada |

### Rotinas de retenção

| Evento | Quando |
|---|---|
| `AUDIT_RETENTION_PURGE` | Rotina apagou registros de auditoria com mais de 1 ano |

## Retenção

| Registro | Prazo | Rotina |
|---|---|---|
| Auditoria (`AuditEvent`) | 1 ano (exceto com `retentionHold`) | `scripts/audit-retention.mjs` |
| Tentativas de login (`LoginAttempt`) | 24 horas; bloqueios (`LoginBlock`) apagados depois de expirarem | `scripts/login-security-retention.mjs` |
| Pedidos de recuperação de senha (`RecoveryAttempt`, `RecoveryBlock`) | sem rotina de limpeza (ver D-11 em `docs/Implementacao/desvios.md`) | — |
| Resultados de compatibilidade | 1 ano | `scripts/compatibility-retention.mjs` |
| Notificações | 1 ano | `scripts/notification-retention.mjs` |
| Avaliações | anonimizadas após 1 ano | `scripts/evaluation-retention.mjs` |

As rotinas rodam pela rota `/api/cron/retencao`, chamada uma vez por dia pelo agendador da Vercel (`vercel.json`, 6h UTC). Os avisos por e-mail têm a rota `/api/cron/notificacoes`, chamada pela Vercel uma vez por dia e pelo agendador do GitHub (`.github/workflows/agendador.yml`) a cada 15 minutos. Detalhes em `docs/operacao/retencao-auditoria.md` e `docs/operacao/retencao-seguranca-login.md`.

## Log de operação (saída do servidor)

| Prefixo | Origem | O que registra |
|---|---|---|
| `[e-mail]` | `src/lib/email.ts` | Falha de envio pelo SMTP, com a causa explicada (sem o conteúdo do e-mail) |
| `[notificações]` | `src/lib/notifications/service.ts` | Falha de uma rodada de envio dos avisos |
| `[retenção]` | `src/app/api/cron/retencao/route.ts` | Falha de uma das rotinas de retenção |
| `Falha ao registrar candidatura` | `src/app/api/candidato/candidaturas/route.ts` | Erro inesperado no registro da candidatura |

**Lacuna conhecida:** falhas do serviço de trajeto (HERE) não são registradas no log; o sistema segue sem o dado de deslocamento e marca o resultado como "dados insuficientes". Ver `docs/Implementacao/desvios.md`.
