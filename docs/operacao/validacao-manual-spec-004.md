# Roteiro de validação manual — SPEC-004

Tempo estimado: 10 a 15 minutos. Antes, rode `npm run db:generate` e `npx prisma migrate deploy` para aplicar a migração nova. Cadastre uma empresa, confirme o e-mail pelo Mailpit (http://localhost:8025) e entre em `/empresa/login`.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Na área da empresa, clicar em "Infraestrutura de acessibilidade" | Abre a página com 5 categorias e 6 itens, sem nada marcado |
| 2 | Clicar em "Salvar infraestrutura" sem responder | Nenhum dado é salvo; cada item pendente mostra a mensagem logo abaixo dele ("Informe se há ou não há: ...") e há um aviso no fim |
| 3 | Responder 5 itens e salvar | Os itens ainda pendentes continuam indicados |
| 4 | Responder todos (Presente ou Ausente), preencher uma observação e salvar | Mensagem "Infraestrutura salva"; mostra a data da última atualização |
| 5 | Recarregar a página | Respostas e observação continuam |
| 6 | Mudar uma resposta e salvar de novo | Salva e atualiza a data |
| 7 | Teclado: percorrer a página só com Tab, Espaço e Enter | Tab para em cada opção (Presente e Ausente), Espaço ou Enter escolhe; as setas também trocam a opção; o foco é visível |
| 8 | Leitor de tela (se possível) | Cada item é anunciado com o nome e a descrição; o erro de um item pendente é anunciado |
| 9 | Sair e tentar abrir `/empresa/infraestrutura` sem login | Redireciona para o login da empresa |
| 10 | Logado como candidato, abrir `/empresa/infraestrutura` | Redireciona para o login da empresa |

Registre abaixo os números com problema para correção antes de encerrar a SPEC-004.
