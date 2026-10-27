# Roteiro de validação manual — SPEC-005

Tempo estimado: 15 a 20 minutos. Antes, `git pull`, `npm run db:generate` e `npx prisma migrate deploy` (migração nova). Entre em `/empresa/login` com uma conta de empresa verificada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir a área da empresa | Menu lateral com Início, Vagas e Configurações; cartões na página inicial |
| 2 | Em Configurações | Cartão de Infraestrutura de acessibilidade; "Recrutadores" é um item próprio do menu lateral |
| 3 | Vagas → "+ Nova vaga" → Salvar rascunho sem preencher nada | Rascunho criado; a página passa para a edição da vaga |
| 4 | Clicar em "Publicar vaga" com o formulário incompleto | Nada é publicado; cada campo pendente mostra a mensagem ao lado (inclui os 6 itens de acessibilidade) |
| 5 | Modalidade Presencial sem cidade/estado; prazo no passado | Mensagens de cidade, estado e prazo |
| 6 | Salário mínimo maior que o máximo | Mensagem de faixa salarial |
| 7 | Preencher tudo, escolher uma opção nos 6 itens (inclusive "Não informado") e publicar | "Vaga publicada"; situação Publicada |
| 8 | Voltar ao painel | Aba Publicadas com a vaga e contagem atualizada |
| 9 | Pausar, reabrir | Aba e situação mudam; contagens acompanham |
| 10 | Editar a vaga publicada e apagar a descrição | Não salva; mensagem ao lado do campo |
| 11 | Encerrar (confirmar) | Vaga vai para Encerradas, somente leitura, sem ações |
| 12 | Teclado: Tab em cada opção de modalidade e acessibilidade | Tab para em cada opção; Espaço/Enter escolhe; foco visível |
| 13 | Entrar como recrutador vinculado e abrir Vagas | Vê as vagas da mesma empresa e consegue criar/pausar |
| 14 | Com outra empresa, tentar abrir o endereço da vaga | Vaga não encontrada |
| 15 | Sem login, abrir `/empresa/vagas` | Redireciona para o login |

Registre abaixo os números com problema antes de encerrar a SPEC-005.
