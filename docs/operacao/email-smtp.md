# Envio de e-mail (SMTP) — configuração e testes

Os e-mails da SPEC-001 (confirmação do e-mail corporativo, novo link de confirmação, recuperação de senha e convite de recrutador) saem pelo mesmo código em qualquer ambiente; só as variáveis do `.env` mudam. Nunca coloque usuário, senha ou chave de SMTP no repositório — apenas no `.env` local ou no cofre de segredos da hospedagem.

## O que o código faz

- **Mensagem em duas versões:** texto simples e HTML acessível (idioma `pt-BR`, sem imagens nem recursos externos, um único botão de ação e o endereço completo escrito por extenso). O conteúdo das duas versões é o mesmo.
- **Cabeçalhos de mensagem automática** (`Auto-Submitted: auto-generated`) para reduzir respostas automáticas de férias.
- **Segurança da conexão:** porta 465 usa TLS direto; nas demais, servidores remotos exigem STARTTLS (`SMTP_REQUIRE_TLS`, ligado por padrão). Em produção, SMTP remoto sem TLS é recusado. O Mailpit (host local) funciona sem TLS.
- **Tempo limite:** 10 s para conectar e para a saudação do servidor, 20 s sem resposta durante o envio (ajustáveis por `SMTP_CONNECTION_TIMEOUT_MS`, `SMTP_GREETING_TIMEOUT_MS`, `SMTP_SOCKET_TIMEOUT_MS`).
- **Falhas:** classificadas em configuração, autenticação, conexão, tempo esgotado, TLS, recusa do servidor ou desconhecida. O terminal mostra só a categoria e o código de resposta — nunca o destinatário, o link ou o token. A auditoria do evento de falha guarda a mesma categoria (`metadata.reason`). Para quem usa o site, a resposta continua genérica (não revela se a conta existe), e cada fluxo mantém o tratamento da SPEC-001: o novo link de confirmação e o convite que falharam são invalidados.

## Variáveis

| Variável | Uso |
|---|---|
| `SMTP_HOST`, `SMTP_PORT` | Servidor e porta (padrão 587) |
| `SMTP_SECURE` | `"true"` para TLS direto (porta 465); vazio = automático pela porta |
| `SMTP_REQUIRE_TLS` | Vazio = exige STARTTLS em servidor remoto; `"false"` só para servidores de teste |
| `SMTP_USER`, `SMTP_PASSWORD` | Credenciais, quando o provedor exige |
| `SMTP_FROM` | Remetente, por exemplo `Acessa Vagas <nao-responda@seu-dominio>`; o provedor precisa aceitar esse endereço |
| `APP_BASE_URL` | Origem usada nos links dos e-mails |
| `SMTP_TEST_TO` | Destinatário padrão do `npm.cmd run email:test` |

## 1. Mailpit (desenvolvimento)

```
docker compose up -d mailpit
```

`.env`: `SMTP_HOST="127.0.0.1"`, `SMTP_PORT="1025"`, `SMTP_SECURE="false"`, usuário e senha vazios. As mensagens aparecem em http://localhost:8025 e não são entregues a ninguém. A aba **HTML Check** do Mailpit mostra a compatibilidade do HTML com os principais clientes de e-mail, e **Link Check** confere os links.

Teste rápido da configuração, sem passar pelo site:

```
npm.cmd run email:test -- teste@exemplo.com
```

### Simular falhas de envio

O `compose.yaml` liga o modo de falhas simuladas do Mailpit (desligadas até serem ativadas). Depois de atualizar a branch, recrie o contêiner uma vez:

```
docker compose up -d --force-recreate mailpit
```

| Comando | Efeito |
|---|---|
| `npm.cmd run mailpit:chaos -- status` | Mostra o que está ligado |
| `npm.cmd run mailpit:chaos -- destinatario 451 100` | Recusa o destinatário em 100% dos envios (erro temporário 451) |
| `npm.cmd run mailpit:chaos -- destinatario 550 100` | Recusa permanente do destinatário |
| `npm.cmd run mailpit:chaos -- remetente 451 100` | Recusa o remetente |
| `npm.cmd run mailpit:chaos -- off` | Desliga todas as falhas |

A falha de autenticação (`autenticacao`) só acontece se `SMTP_USER` estiver preenchido (o Mailpit aceita qualquer usuário). Para testar servidor fora do ar, pare o Mailpit (`docker compose stop mailpit`) e depois `docker compose start mailpit`.

## 2. Provedor real (homologação / produção)

Qualquer provedor SMTP serve; abaixo, dois exemplos gratuitos comuns. Confira os valores no painel do provedor, porque podem mudar.

**Gmail (conta pessoal, poucos envios):** ative a verificação em duas etapas na conta Google e crie uma *senha de app*.
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="sua-conta@gmail.com"
SMTP_PASSWORD="senha de app de 16 letras"
SMTP_FROM="Acessa Vagas <sua-conta@gmail.com>"
```
O Gmail troca o remetente pelo endereço da conta se `SMTP_FROM` usar outro endereço.

**Brevo (serviço de envio transacional):** crie a conta, valide o remetente (ou o domínio) e gere uma chave SMTP em *SMTP & API*.
```
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="login SMTP mostrado no painel"
SMTP_PASSWORD="chave SMTP"
SMTP_FROM="Acessa Vagas <remetente-validado@seu-dominio>"
```

Depois de configurar: `npm.cmd run email:test -- seu-email-pessoal@exemplo.com` e confira a caixa de entrada e o spam. Para chegar bem às caixas de entrada em produção, o domínio do remetente precisa de SPF, DKIM e DMARC configurados conforme o provedor.

Para voltar ao Mailpit, restaure os valores da seção 1. Se a senha de app ou a chave SMTP aparecer em algum print ou mensagem, revogue-a e gere outra.
