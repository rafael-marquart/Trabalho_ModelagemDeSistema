# Roteiro de validação manual — SPEC-017 (notificações)

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `.env` apontando para o Mailpit, `docker compose up -d mailpit`, `npm.cmd run dev`. Abra o Mailpit em http://localhost:8025. Use uma vaga publicada e uma conta de candidato.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato se candidata a uma vaga | Em poucos segundos, e-mail "Candidatura registrada: …" para o candidato, com o botão "Acompanhar candidatura" levando ao detalhe da candidatura |
| 2 | Empresa move a candidatura para Triagem | E-mail "Sua candidatura mudou: Em triagem" para o candidato; não mostra a observação interna do recrutador |
| 3 | Empresa recusa outra candidatura | E-mail "Sua candidatura mudou: Recusada" com o texto de encerramento da participação |
| 4 | Candidato cancela uma candidatura | E-mail "Candidatura cancelada pelo candidato" para quem criou a vaga (conta da empresa ou recrutador), com link para a candidatura no funil |
| 5 | Empresa encerra uma vaga com candidaturas ativas | Um e-mail "Vaga encerrada" para cada candidato ativo; candidatos já recusados ou cancelados não recebem |
| 6 | Conferir os destinatários de todos os e-mails | Cada e-mail vai só para a pessoa do evento; nenhum menciona outros candidatos |
| 7 | `npm.cmd run mailpit:chaos -- destinatario 451 100`, mover uma candidatura | A mudança de etapa acontece normalmente na tela; nenhum e-mail chega; o terminal mostra a falha |
| 8 | `npm.cmd run mailpit:chaos -- off` e esperar cerca de 1 minuto | O e-mail do passo 7 chega sozinho (nova tentativa automática) |
| 9 | `docker compose stop mailpit`, candidatar-se a outra vaga, `docker compose start mailpit` | A candidatura é registrada normalmente; o e-mail chega depois que o Mailpit volta (até alguns minutos, conforme as esperas de 1 min e 5 min) |
| 10 | `npm.cmd run mailpit:chaos -- destinatario 550 100`, mover uma candidatura, depois `off` | Recusa definitiva: não há nova tentativa; o evento `NOTIFICATION_DELIVERY_FAILED` aparece na auditoria (`npm.cmd run db:studio`, tabela AuditEvent) e a etapa continua alterada |
| 11 | `npm.cmd run notifications:retention` | Simulação: mostra quantos registros com mais de 1 ano seriam apagados (provavelmente 0) |
| 12 | (Opcional) Repetir os passos 1 e 2 com o `.env` do Brevo e endereços seus com `+` | E-mails chegam na caixa de entrada real |

Registre abaixo os números com problema antes de encerrar a SPEC-017.
