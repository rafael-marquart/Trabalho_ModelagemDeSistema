# Operação — retenção de eventos de auditoria

## Política

Os eventos de auditoria são elegíveis para descarte após um ano-calendário contado de `AuditEvent.createdAt`, conforme OPEN-006. Eventos com `retentionHold = true` são preservados para obrigações legais ou operacionais aplicáveis.

A rotina não registra senhas, tokens brutos ou credenciais no evento de auditoria de descarte. Ela registra um evento `AUDIT_RETENTION_PURGE` com o total removido e o limite temporal usado.

## Uso

A variável `DATABASE_URL` deve apontar para a base correta.

- Simulação (padrão, não apaga dados): `npm run audit:retention`
- Executar descarte: `npm run audit:retention -- --execute`
- Ajuda: `npm run audit:retention -- --help`

A rotina deve ser executada primeiro em simulação e revisada por pessoa autorizada. A exclusão só ocorre com o argumento explícito `--execute`. Argumentos desconhecidos são recusados.

## Preservação excepcional

Antes de executar o descarte em ambiente real, a equipe responsável deve verificar obrigações de preservação. Um operador de banco de dados autorizado pode marcar eventos que precisam ser preservados com `retentionHold = true`. O campo não é exposto por endpoints da aplicação.

Exemplo operacional (substitua o identificador pelo evento revisado e mantenha acesso restrito ao banco):

```sql
UPDATE "AuditEvent"
SET "retentionHold" = true
WHERE "id" = '<ID_DO_EVENTO>';
```

A alteração desse campo deve ficar restrita a operadores autorizados. A conta usada para a rotina deve ter apenas as permissões necessárias para consultar, excluir eventos elegíveis e registrar o evento de execução.

## Agendamento e validação

O repositório fornece a rotina e testes automatizados, mas não provisiona um agendador de produção. Configure a execução diária no agendador da infraestrutura escolhida, com alertas de falha, acesso restrito e revisão inicial em modo de simulação. O job não deve ser considerado operacionalmente ativo até que esse agendamento seja configurado e verificado.

A rotina não substitui política de backup, obrigações legais de retenção, nem controles de acesso ao banco de dados.
