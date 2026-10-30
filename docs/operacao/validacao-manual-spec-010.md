# Roteiro de validação manual — SPEC-010

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npm.cmd run dev` (sem migração nova). Dados fictícios.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Vagas → clicar no título de uma vaga | Abre o detalhe com empresa, título e "Vaga aberta" |
| 2 | Conferir o quadro de informações | Modalidade, local, faixa salarial, prazo, área e origem; o que faltar aparece como "Não informado(a)" |
| 3 | Vaga sem faixa salarial | "Não informada" (não "sem remuneração") |
| 4 | Seção Acessibilidade | "Declarado para esta vaga" separado de "Informações gerais da empresa", com o aviso de que a empresa não garante o recurso no local |
| 5 | Compatibilidade | Mesmo score da lista; A, T e D com "Ver critérios"; tempo até o trabalho |
| 6 | Diálogo da bolinha na lista → "Ver detalhes da vaga" | Abre o mesmo detalhe |
| 7 | Necessidade indispensável + vaga com o recurso "Ausente" (abrir pelo endereço da vaga) | "Incompatível", explicação do recurso e "Candidatura não disponível" |
| 8 | Necessidade indispensável + vaga com o recurso "Não informado" | "Elegibilidade não concluída" e continuidade bloqueada |
| 9 | Perfil sem endereço (vaga presencial) | Sem score; "Dados insuficientes" e "O que falta" com link para o perfil |
| 10 | Empresa pausa a vaga; recarregar o detalhe | "Vaga indisponível", sem compatibilidade, candidatura bloqueada |
| 11 | Empresa encerra a vaga; recarregar | "Vaga encerrada" e bloqueio |
| 12 | Abrir o endereço de um rascunho | Página não encontrada |
| 13 | Teclado e leitor de tela | Títulos em ordem, "Ver critérios" abre com Enter, foco visível |
| 14 | Celular | Compatibilidade e continuidade aparecem antes da descrição; sem rolagem lateral |
| 15 | Tema escuro | Textos e estados legíveis |

Registre abaixo os números com problema antes de encerrar a SPEC-010.
