# Roteiro de validação manual — SPEC-011

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `npm.cmd run dev`. Dados fictícios.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato com perfil completo abre uma vaga compatível (score calculado) | Caixa "Você pode se candidatar" com o botão "Candidatar-se" |
| 2 | Clicar em "Candidatar-se" | Confirmação com nome da vaga, empresa, score e etapa Inscrito; nada foi registrado ainda |
| 3 | "Voltar" | Volta ao botão, sem registrar |
| 4 | "Confirmar candidatura" | "Candidatura registrada" com data, etapa Inscrito e score |
| 5 | Recarregar a página | "Você já se candidatou", com data e etapa |
| 6 | Vaga com "Dados insuficientes" por falta no perfil | Botão disponível; a mensagem explica que falta completar o perfil; a confirmação diz que será registrada sem score |
| 7 | Vaga com "Dados insuficientes" por falta da empresa | Botão disponível; a mensagem explica que a empresa não informou todos os dados; registro sem score |
| 8 | Vaga incompatível (recurso indispensável ausente) | Sem botão; motivo da incompatibilidade |
| 9 | Empresa tenta editar título/descrição da vaga que já tem candidatura | Não salva; aviso de que a vaga já recebeu candidaturas |
| 10 | Empresa pausa a vaga com o detalhe aberto no candidato (sem ter se candidatado, use outra vaga) e o candidato confirma a candidatura | Recusa: a vaga não está aberta; nada é registrado |
| 11 | Empresa encerra a vaga com candidatura | A vaga encerra; o candidato continua vendo "Você já se candidatou" e a compatibilidade registrada na candidatura, com a data |
| 12 | Teclado e leitor de tela | Botões alcançáveis; confirmação e resultado anunciados; foco vai para o resultado |
| 13 | Celular | Botões e mensagens legíveis |

Registre abaixo os números com problema antes de encerrar a SPEC-011.
