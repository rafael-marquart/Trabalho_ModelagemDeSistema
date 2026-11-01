# Roteiro de validação manual — SPEC-013

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `npm.cmd run dev`. Tenha uma vaga publicada com pelo menos uma candidatura (SPEC-011).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Empresa → Vagas | Cada vaga publicada mostra "Candidaturas (n)" |
| 2 | Clicar em "Candidaturas" | Painel com contagem por etapa e a lista (candidato, inscrição, compatibilidade, etapa) |
| 3 | Filtrar por uma etapa | Só as candidaturas daquela etapa |
| 4 | "Abrir" uma candidatura | Nome, e-mail, perfil profissional, acessibilidade para o processo, compatibilidade na inscrição e histórico; sem CPF nem descrição livre |
| 5 | Em Inscrito | Só aparece "Mover para Triagem" |
| 6 | Mover para Triagem com observação | Confirmação; depois "Etapa alterada para Triagem" e o histórico com a observação e o seu nome |
| 7 | Em Triagem | Aparecem "Mover para Entrevista" e "Recusar candidatura" |
| 8 | Seguir até Finalista e "Registrar contratação" | Etapa final; nenhum botão de movimento |
| 9 | Em outra candidatura, "Recusar candidatura" | Confirmação de decisão final; etapa Recusada |
| 10 | Recrutador vinculado | Vê e move as candidaturas das vagas da mesma empresa |
| 11 | Outra empresa abre o endereço de uma candidatura desta | Candidatura não encontrada |
| 12 | Candidato | Não acessa as telas do funil |
| 13 | Teclado e leitor de tela | Filtros, botões e confirmação alcançáveis; mensagem de sucesso anunciada |
| 14 | Celular | Lista em cartões; botões visíveis |

Registre abaixo os números com problema antes de encerrar a SPEC-013.
