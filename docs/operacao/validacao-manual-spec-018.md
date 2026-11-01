# Roteiro de validação manual — SPEC-018 (entrevistas e avaliação)

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `docker compose up -d mailpit`, `npm.cmd run dev`. Tenha uma candidatura que a empresa possa mover.

## Entrevista (empresa)

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Empresa abre uma candidatura em Inscrito ou Triagem | Seção "Entrevista" diz que o agendamento fica disponível na etapa Entrevista (ou não aparece) |
| 2 | Mover até Entrevista e clicar em "Agendar entrevista" | Formulário com data e hora, modalidade, endereço/link e recursos; mostra os recursos indispensáveis do candidato, se houver |
| 3 | Escolher On-line e escrever um texto sem `https://` | Mensagem pedindo o link; nada é salvo |
| 4 | Data no passado | Mensagem "Escolha uma data e hora futuras." |
| 5 | Dados válidos → "Agendar e avisar o candidato" | Entrevista agendada com os dados; aviso no Mailpit e na aba Notificações do candidato |
| 6 | "Alterar" e salvar outro horário | Dados atualizados; aviso "Entrevista alterada" ao candidato |
| 7 | "Marcar como concluída" antes do horário | Botão desabilitado, com a explicação |
| 8 | Agendar para daqui a 2 minutos (ou alterar para isso), esperar passar e "Marcar como concluída" → Confirmar | Entrevista concluída; aparece em "Entrevistas anteriores" |
| 9 | Agendar outra e "Cancelar entrevista" → Confirmar | Cancelada; aviso "Entrevista cancelada" ao candidato |
| 10 | Candidato abre a candidatura antes da conclusão | Vê data/hora, modalidade, link clicável (on-line) ou endereço e recursos previstos |

## Avaliação (candidato)

| # | Passo | Resultado esperado |
|---|---|---|
| 11 | Depois da conclusão, candidato abre a candidatura | Seção "Avalie o processo seletivo" com o prazo (60 dias) |
| 12 | "Revisar avaliação" sem escolher estrelas | Mensagens pedindo as duas notas |
| 13 | Escolher as notas pelo teclado (Tab até o grupo, setas para mudar) e deixar o comentário vazio | As estrelas acompanham a escolha; leitor de tela anuncia "4 estrelas" etc. |
| 14 | "Revisar avaliação" | Resumo das notas e do comentário; "Voltar e corrigir" volta ao formulário com os dados |
| 15 | "Enviar avaliação" | "Avaliação enviada"; a seção passa a mostrar "Sua avaliação", só para leitura |
| 16 | Tentar avaliar de novo (outra aba aberta antes do envio) | Recusa: já avaliou; a avaliação original não muda |
| 17 | Empresa abre a mesma candidatura | Não vê notas nem comentário do candidato |
| 18 | Entrevista cancelada | Não oferece avaliação |
| 19 | `npm.cmd run evaluations:retention` | Simulação: mostra quantas avaliações com mais de 1 ano seriam anonimizadas (provavelmente 0) |
| 20 | Celular e tema escuro | Formulários legíveis, botões de estrela sem sair da tela |

Registre abaixo os números com problema antes de encerrar a SPEC-018.
