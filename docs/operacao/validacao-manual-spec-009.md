# Roteiro de validação manual — SPEC-009

Antes: `git pull`, `npm.cmd run db:generate`, `npm.cmd run dev` (sem migração nova). Use duas janelas: uma com a empresa e outra (anônima ou outro navegador) com o candidato.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato abre o detalhe de uma vaga publicada | "Vaga aberta" e a data limite de inscrição |
| 2 | Empresa pausa a vaga; candidato volta para a aba do detalhe | Aviso "O status desta vaga mudou… agora ela está indisponível" e botão "Atualizar a página" |
| 3 | Clicar em "Atualizar a página" | "Vaga indisponível", sem compatibilidade, "Candidatura não disponível" |
| 4 | Candidato abre Vagas | A vaga pausada não aparece na busca |
| 5 | Empresa reabre a vaga | Volta a "Vaga aberta" no detalhe e aparece na busca |
| 6 | Empresa encerra a vaga | Candidato vê "Vaga encerrada" e bloqueio; a vaga sai da busca |
| 7 | Empresa tenta reabrir a vaga encerrada | Não há a opção; a vaga fica somente leitura |
| 8 | Vaga aberta com prazo vencido (editar o prazo antes, se preciso, ou usar uma antiga) | "Vaga indisponível" com a data em que o prazo terminou |
| 9 | Leitor de tela no detalhe ao mudar o status | O aviso de mudança é anunciado |
| 10 | Celular | Status e aviso legíveis |

Registre abaixo os números com problema antes de encerrar a SPEC-009.
