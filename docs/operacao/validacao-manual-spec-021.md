# Roteiro de validação manual — SPEC-021 (nota pública de acessibilidade)

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `npm.cmd run dev`.

Você precisa de uma empresa com uma vaga publicada e de um candidato que tenha feito entrevista concluída nela (fluxo da SPEC-018).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato abre uma vaga de empresa que **ainda não** recebeu avaliações | Seção "Avaliações de candidatos" com "Ainda não há dados suficientes" e a explicação de que isso não indica acessibilidade boa ou ruim; nenhuma estrela ou número |
| 2 | Empresa abre a página inicial | A mesma mensagem de dados insuficientes, com o texto de que é assim que os candidatos veem a nota |
| 3 | Candidato avalia a entrevista concluída (Minhas candidaturas → candidatura → Avaliar), por exemplo 4 em acessibilidade e 5 em postura inclusiva, com comentário | Avaliação registrada |
| 4 | Candidato abre de novo o detalhe da vaga | "1 avaliação de candidatos que fizeram entrevista com …"; em Acessibilidade, 1 avaliação em 4 estrelas e 0 nas demais; em Postura inclusiva, 1 em 5 estrelas; sem média, sem nome e sem o comentário |
| 5 | Abrir outra vaga publicada da mesma empresa | A mesma distribuição (a nota é da empresa) |
| 6 | Empresa abre a página inicial | A mesma distribuição |
| 7 | Com outro candidato e outra entrevista, avaliar com notas diferentes | Contagens somam (2 avaliações), cada estrela com a sua quantidade |
| 8 | Registrar uma denúncia sobre a vaga e, como administrador, concluir a moderação | A distribuição não muda em nenhum momento |
| 9 | Teclado e leitor de tela na seção | Título "Avaliações de candidatos"; cada linha é lida como "5 estrelas: N avaliações" |
| 10 | Celular, tema escuro e alto contraste | Barras legíveis e com contraste; nada corta |
| 11 | (Opcional) `npm.cmd run evaluations:retention` | Simulação: mostra quantos registros têm mais de 1 ano (normalmente 0) e não altera nada |
