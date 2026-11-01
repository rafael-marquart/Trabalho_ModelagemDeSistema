# Roteiro de validação manual — SPEC-008

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `npm.cmd run dev`. Dados fictícios. Tenha pelo menos 3 vagas publicadas (de preferência com modalidades, cidades e áreas diferentes) e um candidato com perfil preenchido.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Empresa: editar uma vaga e escolher "Área profissional" | Campo opcional com a lista de áreas; salva normalmente |
| 2 | Candidato: entrar | Área do candidato com menu lateral (Início, Vagas, Meu perfil) e "Vagas em destaque" |
| 3 | Menu → Vagas | Lista ordenada por maior compatibilidade, com o círculo do score em cada vaga |
| 4 | Clicar no círculo de uma vaga | Diálogo com Acessibilidade, Perfil técnico e Modalidade/deslocamento (nota e peso) e o tempo até o trabalho |
| 5 | Fechar com "Fechar" e com Esc | O diálogo fecha e o foco volta ao círculo |
| 6 | Vaga com dados insuficientes | Círculo sem número ("Faltam dados"); no diálogo, o que falta e o link "Completar meu perfil"; aparece depois das vagas com score |
| 7 | Buscar por um trecho do título sem acento/maiúscula (ex.: "analis") | A vaga aparece |
| 8 | Buscar dois termos, um do título e outro do nome da empresa | A vaga aparece; com um termo inexistente, nenhuma |
| 9 | Marcar duas modalidades | Vagas de qualquer uma das duas (OU) |
| 10 | Marcar modalidade + localização | Só vagas que atendem às duas (E) |
| 11 | Filtro de acessibilidade "Rampas de acesso" | Só vagas que declaram rampas presentes |
| 12 | Ordenar por "Mais recentes" / "Mais antigas" | Ordem pela data de publicação |
| 13 | Recarregar a página com filtros marcados | Busca, filtros e ordem continuam (estão no endereço) |
| 14 | Com mais de 20 vagas: ir para a página 2 e depois mudar um filtro | Paginação mantém os filtros; mudar filtro volta à página 1 |
| 15 | No perfil, marcar uma necessidade como "Indispensável" e, na vaga, declarar o recurso como Ausente | A vaga some da lista e aparece o aviso de vagas ocultadas |
| 16 | Busca sem resultado | Mensagem "Nenhuma vaga elegível encontrada" e botão para limpar |
| 17 | Abrir Vagas duas vezes sem mudar nada; rodar `npm.cmd run here:usage` | O uso da HERE não aumenta na segunda vez |
| 18 | Encerrar uma vaga e buscar de novo | A vaga não aparece mais |
| 19 | Teclado: Tab pelos filtros, ordenação, círculos e páginas | Tudo alcançável, foco visível, Espaço/Enter funcionam |
| 20 | Celular (tela estreita) | Filtros acima da lista; nada corta ou exige rolagem lateral |

Registre abaixo os números com problema antes de encerrar a SPEC-008.
