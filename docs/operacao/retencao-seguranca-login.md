# Operação — retenção de registros de segurança de login

## Política

- Tentativas de login (LoginAttempt) são mantidas por 24 horas. A política de bloqueio usa uma janela móvel de 15 minutos; as 24 horas preservam uma janela de diagnóstico limitada sem afetar a contagem funcional.
- Registros LoginBlock só são removidos depois de blockedUntil; bloqueios ainda ativos nunca são elegíveis para limpeza.
- A rotina não registra IPs, identificadores, senhas ou tokens brutos.

## Uso

A variável DATABASE_URL deve apontar para a base correta.

- Simulação (padrão, não apaga dados): npm run login-security:retention
- Executar limpeza: npm run login-security:retention -- --execute
- Ajuda: npm run login-security:retention -- --help

Execute primeiro em simulação e revise as contagens. A exclusão só ocorre com --execute; argumentos desconhecidos são recusados.

## Agendamento

Configure a rotina em agendador operacional diário com alertas de falha e acesso restrito ao banco. O repositório fornece script e testes, mas não provisiona nem confirma a execução do agendador de produção.
