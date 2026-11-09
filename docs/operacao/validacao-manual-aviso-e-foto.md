# Roteiro de validação manual — aviso de alterações não salvas, foto de perfil (OPEN-101) e mostrar senha

Antes (local): `git pull`, `npm.cmd ci`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova `20261109090000_user_photo`), `npm.cmd run dev`. No ambiente de testes da Vercel, a migração é aplicada no deploy.

## Aviso de alterações não salvas

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato: abrir "Meu perfil" sem mudar nada e clicar em "Vagas" no menu | Navega direto, sem aviso |
| 2 | Mudar a cidade e clicar em "Vagas" | Aviso "Deseja salvar as alterações antes de sair?" com "Salvar e sair", "Sair sem salvar" e "Cancelar"; o foco vai para o aviso |
| 3 | Clicar em "Cancelar" (ou Esc) | Continua no perfil, com a alteração ainda no campo |
| 4 | Clicar em "Vagas" e depois "Sair sem salvar" | Vai para Vagas; voltando ao perfil, a cidade antiga continua |
| 5 | Mudar a cidade, clicar em "Minhas candidaturas" e "Salvar e sair" | Salva e vai para Minhas candidaturas; a cidade nova aparece no perfil |
| 6 | Deixar um campo obrigatório inválido e usar "Salvar e sair" | Não sai; o aviso fecha e o erro aparece no formulário |
| 7 | Mudar algo e clicar em "Sair da conta" | O aviso aparece antes de sair |
| 8 | Mudar algo e recarregar (F5) ou fechar a aba | O navegador mostra o aviso padrão dele |
| 9 | Empresa: editar uma vaga e a infraestrutura, mudar algo e clicar no menu | Mesmo aviso; "Salvar e sair" salva |
| 10 | Criar vaga nova, preencher o título e clicar no menu | Mesmo aviso |
| 11 | Começar uma denúncia ou uma avaliação de processo e clicar no menu | Aviso "Sair sem enviar?" com "Sair sem enviar" e "Continuar preenchendo" |
| 12 | Repetir 2 no celular e nos temas escuro e alto contraste | Aviso legível, botões inteiros na tela e com contraste |

Limitação conhecida: o botão Voltar do navegador não mostra o aviso.

## Foto de perfil

| # | Passo | Resultado esperado |
|---|---|---|
| 13 | Candidato: "Meu perfil" > "Foto de perfil" > "Escolher foto" com uma imagem JPG ou PNG (pode ser grande, até 15 MB) | "Foto atualizada."; a foto aparece cortada em quadrado no perfil e no círculo do topo |
| 14 | Escolher um PDF ou outro arquivo | "Use uma imagem JPG, PNG ou WebP." |
| 15 | Trocar a foto com algo não salvo no perfil e depois clicar no menu | A troca da foto não conta como alteração não salva; só os outros campos geram o aviso |
| 16 | Empresa: abrir as candidaturas de uma vaga em que esse candidato se candidatou | Foto na lista (funil) e no detalhe da candidatura |
| 17 | Empresa de outra vaga / sem candidatura dele | Não vê a foto (só iniciais) |
| 18 | Candidato: "Remover foto" e confirmar | "Foto removida."; voltam as iniciais no perfil, no topo e para a empresa |
| 19 | Recrutador: menu "Minha conta" | Nome, e-mail e "Foto de perfil"; a foto escolhida aparece no topo da área de recrutador |
| 20 | Conta de empresa e de administrador | Não há opção de foto; o topo mostra as iniciais |
| 21 | Política de Privacidade | Versão 2026-11-09, com a foto de perfil na lista de dados e quem a vê |

## Mostrar e esconder a senha

| # | Passo | Resultado esperado |
|---|---|---|
| 22 | Login de candidato, empresa, recrutador e administrador: digitar a senha e clicar no olho | A senha aparece; o olho fica riscado e destacado; clicar de novo esconde |
| 23 | Cadastro de candidato e de empresa, recuperação de senha e convite de recrutador | Cada campo de senha (inclusive "Confirmar senha") tem o seu olho |
| 24 | Mostrar a senha e enviar o formulário | A senha volta a ficar escondida |
| 25 | Leitor de tela (NVDA) no olho | Lê "Mostrar senha, botão de alternância, não pressionado/pressionado"; no campo de confirmação, "Mostrar confirmação da senha" |
| 26 | No Edge | Aparece só o nosso olho (o do Edge fica escondido) |
