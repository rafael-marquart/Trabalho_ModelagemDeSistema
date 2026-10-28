# Roteiro de validação manual — SPEC-003 (sem navegação por voz)

Tempo estimado: 20 a 30 minutos. Antes: `git pull`, `npm install`, `npm run db:generate` e `npx prisma migrate deploy` (migração nova).

Ambientes sugeridos para esta rodada (proposta inicial, ainda não é a matriz da OPEN-015): Chrome e Firefox no computador; um leitor de tela se tiver (NVDA com Firefox/Chrome); janela estreita (celular) pelas ferramentas do navegador.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir `/candidato/login`, apertar Tab uma vez | Aparece "Pular para o conteúdo principal"; Enter leva o foco ao conteúdo |
| 2 | Continuar com Tab pela tela de login e entrar só com teclado | Todos os controles são alcançados em ordem lógica, com o foco visível |
| 3 | Clicar em "Alto contraste" (qualquer tela de entrada) | Cores mudam para preto/branco de alto contraste, bordas grossas, links sublinhados; nada some |
| 4 | Recarregar a página | Alto contraste continua ligado |
| 5 | Alternar entre tema claro e escuro com alto contraste ligado | Os dois temas continuam legíveis e distinguíveis |
| 6 | Entrar com uma conta, ligar o alto contraste, sair, abrir outro navegador (ou janela anônima) e entrar com a mesma conta | O alto contraste já vem ligado, sem precisar ligar de novo |
| 7 | Com o alto contraste desligado (clique para desligar), nas ferramentas do navegador emular "prefers-contrast: more" (Chrome: DevTools → ⋮ → Mais ferramentas → Renderização) | Sem escolha explícita, a plataforma segue o sistema; a escolha explícita pelo botão prevalece |
| 8 | Percorrer o perfil do candidato e o editor de vagas só com teclado, inclusive as opções "Presente/Ausente/Não informado" | Tab para em cada opção; Espaço/Enter escolhe; setas também trocam |
| 9 | Enviar um formulário com erro (ex.: publicar vaga incompleta) | O erro aparece ao lado do campo e é anunciado pelo leitor de tela |
| 10 | Conferir se algum estado depende só de cor (situação da vaga, erros, opção marcada) | Sempre há texto, ícone ou forma junto da cor |
| 11 | Aumentar o zoom para 200% e estreitar a janela | Conteúdo continua utilizável, sem rolagem horizontal da página inteira |
| 12 | Leitor de tela (se possível): percorrer login e editor de vagas | Campos, grupos, botões e mensagens são anunciados com nome e estado |
| 13 | Ativar "reduzir movimento" no sistema | Transições e animações praticamente desaparecem |

Registre abaixo os números com problema antes de encerrar a SPEC-003. A navegação por voz está fora deste roteiro (em aberto para implementar depois).
