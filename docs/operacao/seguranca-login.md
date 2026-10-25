# Controle gradual de tentativas de login por IP

## Objetivo e escopo

Além do bloqueio existente por conta (10 falhas consecutivas em 15 minutos), o endpoint de login aplica um limite progressivo por endereço IP. O controle ajuda a reduzir tentativas automatizadas contra várias contas sem substituir os limites por conta.

## Política implementada

O endpoint considera as falhas registradas nos últimos 15 minutos para o IP. A contagem inclui identificadores existentes e inexistentes; os identificadores e IPs persistidos são hashes SHA-256, não os valores brutos.

| Falhas anteriores registradas no intervalo móvel de 15 minutos | Resposta à tentativa seguinte | Retry-After |
|---:|---|---:|
| 0–29 | Sem bloqueio por IP | — |
| 30–49 | HTTP 429 | 60 segundos |
| 50–79 | HTTP 429 | 300 segundos |
| 80–119 | HTTP 429 | 900 segundos |
| 120 ou mais | HTTP 429 | 3600 segundos |

A aplicação avalia o total de falhas anteriores antes de processar a tentativa seguinte. Ao atingir uma faixa, o cooldown completo começa naquele momento e é persistido por IP em `LoginBlock`, separado do histórico de contagem móvel de 15 minutos. Assim, um bloqueio de 15 ou 60 minutos não desaparece quando as falhas mais antigas saem da janela de contagem nem começa com parte do prazo já consumido. Novas tentativas bloqueadas também são registradas como falhas e reiniciam o cooldown; se a contagem recente subir para uma faixa superior, o cooldown é elevado para essa faixa. O cabeçalho Retry-After informa o tempo de espera aplicado. A mensagem de erro não revela se a conta existe.

## Concorrência e armazenamento

A verificação, a contagem, a persistência do bloqueio e o registro da tentativa são serializados em uma transação PostgreSQL com advisory lock por IP, para evitar que várias requisições concorrentes ultrapassem o limite antes de serem contabilizadas. O histórico usa a tabela LoginAttempt; o bloqueio ativo fica em LoginBlock e tem duração explícita. Índices em ipKey e createdAt apoiam a consulta do histórico. A retenção/limpeza de LoginAttempt deve ser definida e monitorada separadamente caso o volume cresça.

## Requisitos de implantação

- O proxy de produção deve sobrescrever X-Forwarded-For; a aplicação usa o primeiro IP desse cabeçalho e não pode confiar em valores fornecidos diretamente pelo cliente.
- Se a infraestrutura estiver atrás de proxy ou NAT compartilhado, várias pessoas podem contribuir para a mesma contagem. Os limites foram definidos para permitir uma margem inicial de falhas e aplicar cooldowns graduais, mas devem ser monitorados após a implantação.
- O controle depende do PostgreSQL compartilhado entre instâncias da aplicação. Não substitua por contadores em memória local.
- Respostas de throttling usam HTTP 429 e mensagem genérica; não registrar senhas, tokens ou identificadores brutos em logs.

## Verificação automatizada

Os testes de src/app/api/auth/login/route.test.ts verificam o primeiro cooldown, as faixas graduais de 5, 15 e 60 minutos, a ausência de consulta de conta/senha quando bloqueado e a não criação de sessão. O CI valida também o schema Prisma, migrações PostgreSQL, TypeScript, lint, testes e build.
