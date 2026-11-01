# Roteiro de validação manual — envio de e-mail (SPEC-001)

Antes: `git pull`, `npm.cmd install`, `docker compose up -d --force-recreate mailpit`, `npm.cmd run dev`. Guia completo: `docs/operacao/email-smtp.md`. Use só dados fictícios.

## Mailpit

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | `npm.cmd run email:test -- teste@exemplo.com` | "Conexão e autenticação: OK" e a mensagem de teste no Mailpit (http://localhost:8025) |
| 2 | Cadastrar uma empresa | E-mail "Confirme o e-mail corporativo" com versão HTML (botão "Confirmar e-mail") e versão texto (aba Text), o mesmo link nas duas |
| 3 | Clicar no botão do e-mail | Confirma a conta, como antes |
| 4 | "Reenviar confirmação" para outra empresa pendente | E-mail "Novo link de confirmação"; o link anterior deixa de valer |
| 5 | "Esqueci minha senha" | E-mail "Recuperação de senha" com o link de 30 minutos; redefinir funciona |
| 6 | Empresa convida um recrutador | E-mail "Convite para se vincular a uma empresa" com o nome da empresa; o link abre o convite |
| 7 | No Mailpit, abas **HTML Check** e **Link Check** de uma das mensagens | Sem problemas graves; links válidos |
| 8 | Ver um e-mail no celular (Mailpit pelo IP da máquina, ou a visualização móvel do Mailpit) | Texto legível, botão e endereço sem cortar a tela |

## Falhas simuladas

| # | Passo | Resultado esperado |
|---|---|---|
| 9 | `npm.cmd run mailpit:chaos -- destinatario 451 100` e pedir recuperação de senha | A tela mostra a mensagem genérica de sempre; o terminal mostra "[e-mail] envio falhou: o servidor SMTP recusou … (resposta 451)" sem endereço nem token; nada chega ao Mailpit |
| 10 | Com a falha ligada, a empresa convida um recrutador | Mensagem genérica; o convite não fica com link válido (convidar de novo depois que a falha for desligada funciona) |
| 11 | `npm.cmd run mailpit:chaos -- off` e repetir o passo 9 | O e-mail chega normalmente |
| 12 | `docker compose stop mailpit`, pedir recuperação de senha, `docker compose start mailpit` | Mensagem genérica; terminal: "não foi possível conectar ao servidor SMTP"; o site não trava |

## Provedor real (opcional, quando houver conta)

| # | Passo | Resultado esperado |
|---|---|---|
| 13 | Configurar Gmail ou Brevo no `.env` (guia, seção 2) e `npm.cmd run email:test -- seu-email@exemplo.com` | Mensagem recebida na caixa de entrada (conferir o spam) |
| 14 | Repetir os passos 2, 5 e 6 com endereços seus | E-mails chegam, links levam ao `APP_BASE_URL` configurado |
| 15 | Senha errada no `.env` e `npm.cmd run email:test` | "o servidor recusou o usuário ou a senha" |
| 16 | Voltar o `.env` para o Mailpit | Envio volta a cair no Mailpit |

Registre abaixo os números com problema. Não cole senhas, chaves ou endereços reais neste arquivo.
