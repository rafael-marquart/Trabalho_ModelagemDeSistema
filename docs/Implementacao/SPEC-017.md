# SPEC-017 — Implementação das notificações do processo seletivo

## Escopo implementado

- **Eventos e destinatários (OPEN-066):**
  | Evento | Quem recebe | Origem |
  |---|---|---|
  | Candidatura registrada | o candidato | SPEC-011 |
  | Mudança de etapa (avanço, recusa, aprovação) | o candidato | SPEC-013 |
  | Cancelamento pelo candidato | o "recrutador responsável" (ver OPEN-093) | SPEC-012 |
  | Encerramento da vaga | cada candidato ainda ativo (Inscrito a Finalista), um e-mail por pessoa (RB-42, OPEN-042) | SPEC-009 |
  | Entrevista agendada/alterada/cancelada | — | **não se aplica ainda:** a plataforma não tem operação de entrevista; o envio será ligado quando houver |
- **Canal (OPEN-067):** e-mail, obrigatório, sem opção de desativar; usa o SMTP configurado (Mailpit ou provedor real, `docs/operacao/email-smtp.md`).
- **Registro junto com o evento:** cada notificação é gravada na tabela `Notification` na mesma transação do evento de origem. Um evento confirmado sempre deixa a notificação pendente; uma falha de envio nunca desfaz o evento (seção 5.8).
- **Envio e novas tentativas (OPEN-068):** o envio é pedido logo após o evento, sem fazer a tela esperar o servidor de e-mail. Uma rodada periódica dentro do servidor (a cada 60 s, `src/instrumentation.ts`) reenvia o que ficou pendente. Até 5 tentativas, com esperas de 1 min, 5 min, 30 min e 2 h. Falhas de conexão, tempo esgotado, autenticação, configuração e respostas 4xx são temporárias; recusa definitiva (5xx) encerra na hora. A falha final fica com estado `FAILED` e gera o evento de auditoria `NOTIFICATION_DELIVERY_FAILED` (tipo, tentativas e motivo; sem endereço nem conteúdo).
- **Sem falsa confirmação:** `SENT` significa "aceito pelo servidor SMTP", não "lido" nem "entregue na caixa de entrada". Nenhuma tela afirma que o e-mail foi entregue.
- **Conteúdo mínimo:** vaga, empresa e nova etapa; para o recrutador, o nome do candidato que cancelou (dado que ele já pode ver no funil, OPEN-055). Nada de outros candidatos, nem de acessibilidade. Todo e-mail termina com o link para a situação oficial na plataforma (T-017-06) e diz que o e-mail é só um aviso.
- **Sem central de notificações (OPEN-069):** o candidato acompanha pela linha do tempo da candidatura (SPEC-016).
- **Retenção:** `npm run notifications:retention` (simulação) e `-- --execute` apagam registros enviados ou com falha final com mais de 1 ano (OPEN-006); pendentes nunca são apagados.
- Duas rodadas ao mesmo tempo não enviam o mesmo e-mail: cada registro é "reservado" com atualização condicional antes do envio; um registro preso em envio (servidor reiniciado no meio) volta a pendente após 10 min.

## Pontos em aberto

- **OPEN-093:** quem é o "recrutador responsável". Provisório: quem criou a vaga, se ainda puder agir pela empresa; senão, a conta da Empresa.
- **Entrevistas:** item 3 da OPEN-066 depende de uma capacidade de agendamento que não existe nas Specs atuais.
- Em hospedagem sem processo contínuo (serverless), a rodada periódica não roda sozinha; seria preciso um agendador externo chamando o envio. Para o ambiente do projeto (servidor Node), basta o `npm run start`/`dev`.

## Arquivos principais

- `prisma/migrations/20261101120000_spec_017_notifications/migration.sql`
- `src/lib/notifications/{service,messages}.ts`, `src/instrumentation.ts`
- Pontos de origem: `src/lib/applications/{service,company-service,candidate-service}.ts`, `src/app/api/vagas/[id]/acao/route.ts`
- `scripts/{notification-retention,purge-notifications}.mjs`

## Verificações

- Vitest: destinatário responsável, um aviso por candidato ativo no encerramento, reserva antes do envio, envio aceito, novas tentativas com intervalos crescentes, falha final auditada sem endereço, recusa definitiva sem nova tentativa, conteúdo (link oficial, nada de terceiros), cada evento de origem grava a notificação na mesma transação e nada é gravado quando o evento é recusado; retenção.
- E2E: no fluxo completo (candidatar, mover, cancelar, candidatar de novo, encerrar, mover, cancelar) são gravadas e enviadas 2 confirmações, 3 mudanças de etapa, 2 cancelamentos para a empresa e 1 aviso de encerramento, cada uma só para a pessoa autorizada; os textos chegam ao SMTP com os links certos.
- Teste manual: `docs/operacao/validacao-manual-spec-017.md`.
