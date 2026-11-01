# Roteiro de validação manual — SPEC-012 e SPEC-016

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração de correção do score opcional), `npm.cmd run dev`. Tenha um candidato com pelo menos uma candidatura (SPEC-011) e, se possível, uma segunda candidatura movida pela empresa (SPEC-013).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato → menu "Minhas candidaturas" | Lista só as suas candidaturas: empresa, cargo, data de envio, estado (ex.: Inscrita, Em triagem) e "Ver candidatura" |
| 2 | Buscar por parte do cargo ou da empresa; filtrar por status | A lista diminui na tela e informa "x de y candidaturas" |
| 3 | "Ver candidatura" | Detalhe com vaga, data de inscrição e situação atual no topo, e "Histórico da candidatura" abaixo |
| 4 | Conferir o histórico | Do mais recente para o mais antigo; data sem horário; "Candidatura realizada" e "Status: …" com "Etapa resultante"; sem nome do recrutador nem observação interna |
| 5 | Em uma candidatura Inscrita/Em triagem/Em entrevista/Finalista de vaga aberta | Aparece a seção "Cancelar candidatura" |
| 6 | Clicar em "Cancelar candidatura" e depois "Voltar" (ou Esc) | Nada muda |
| 7 | Cancelar de novo e "Confirmar cancelamento" | Aviso "Candidatura cancelada", estado Cancelada em cinza, sem botão de cancelar, evento "Candidatura cancelada" no topo do histórico e "O histórico … fica disponível até" (60 dias) |
| 8 | Voltar à lista | A candidatura aparece como Cancelada |
| 9 | Abrir a vaga cancelada | É possível candidatar-se de novo |
| 10 | Candidatura Recusada ou Aprovada | Sem a seção de cancelamento |
| 11 | Empresa encerra uma vaga com candidatura ativa; candidato abre o detalhe | "A vaga foi encerrada pela empresa em …", sem botão de cancelar, aviso dos 60 dias |
| 12 | Empresa abre a candidatura cancelada no funil | Histórico mostra "Cancelada pelo candidato"; etapa Cancelada |
| 13 | Copiar o endereço do detalhe e abrir com outra conta de candidato | "Página não encontrada" |
| 14 | Detalhe da vaga com candidatura ativa | Botão "Acompanhar minha candidatura" leva ao detalhe |
| 15 | Teclado e leitor de tela | Filtros, links e confirmação alcançáveis; foco vai para "Voltar" ao abrir a confirmação; aviso de resultado anunciado |
| 16 | Celular | Cartões em uma coluna, estado e "Ver candidatura" visíveis, sem rolagem lateral |

Registre abaixo os números com problema antes de encerrar as SPEC-012 e SPEC-016.
