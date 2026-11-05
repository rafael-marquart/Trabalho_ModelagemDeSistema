# Roteiro de validação manual — recuperação de senha do recrutador, Termos de Uso, Privacidade e consentimento (OPEN-001, OPEN-100)

Antes (local): `git pull`, `npm.cmd ci`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova `20261105090000_consent_records`), `npm.cmd run dev`. No ambiente de testes da Vercel, a migração é aplicada no deploy.

## Recuperação de senha do recrutador

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir `/recrutador/login` | Link "Esqueci minha senha" abaixo da senha |
| 2 | Clicar no link | Tela de recuperação com "Recrutador" já escolhido e campo "E-mail" |
| 3 | Informar o e-mail de um recrutador ativo e enviar | Mensagem genérica; o e-mail chega (Mailpit/Ethereal) com link válido por 30 minutos |
| 4 | Abrir o link, definir nova senha e entrar como recrutador | Entra com a senha nova; o mesmo link não funciona de novo |
| 5 | Pedir recuperação com o e-mail do recrutador escolhendo "Empresa" | Mesma mensagem genérica, nenhum e-mail é enviado |
| 6 | "Esqueci minha senha" no login de candidato e de empresa | A tela abre com o tipo de conta certo já escolhido |

## Termos de Uso e Política de Privacidade

| # | Passo | Resultado esperado |
|---|---|---|
| 7 | Página inicial | Links "Termos de Uso" e "Política de Privacidade" no rodapé (sem o antigo "Ao continuar, você concorda…") |
| 8 | Abrir as duas páginas | Versão 2026-11-05; texto legível no celular e nos temas escuro e alto contraste |
| 9 | Cadastro de candidato sem marcar "Li e concordo" | Mensagem pedindo o aceite; a conta não é criada |
| 10 | Marcar e criar a conta | Conta criada; os links da caixa abrem em nova aba sem perder o formulário |
| 11 | Repetir 9–10 no cadastro de empresa | Mesmo comportamento |
| 12 | Convite de recrutador (primeiro acesso): digitar a senha | Aparece "Li e concordo"; sem marcar, o convite não é aceito |

## Consentimento dos dados de acessibilidade (candidato)

| # | Passo | Resultado esperado |
|---|---|---|
| 13 | Perfil: "Preciso de adaptações", marcar uma necessidade e salvar sem autorizar | Seção "Autorização para usar as informações de acessibilidade" com o erro pedindo a autorização; nada é salvo |
| 14 | Marcar a autorização e salvar | Perfil salvo; a seção mostra "Você autorizou em dd/mm/aaaa" |
| 15 | Candidatar-se a uma vaga; empresa abre a candidatura | A empresa vê as necessidades do catálogo e os recursos indispensáveis |
| 16 | Candidato: "Retirar autorização e apagar estas informações" → confirmar | Mensagem de retirada; necessidades e recursos somem do perfil |
| 17 | Empresa reabre a candidatura | Acessibilidade "não informada", sem necessidades nem recursos |
| 18 | Declarar uma necessidade de novo | Pede a autorização outra vez |
| 19 | "Não preciso de adaptações" | Salva sem pedir autorização |
