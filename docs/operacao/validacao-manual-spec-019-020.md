# Roteiro de validação manual — SPEC-019 e SPEC-020 (denúncias e moderação)

Antes: `git pull`, `npm.cmd install`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração nova), `npm.cmd run dev`. Para a moderação você precisa de um administrador; se ainda não tem, crie com:

```
$env:ADMIN_EMAIL="admin@teste.local"; $env:ADMIN_PASSWORD="Admin12345"; npm.cmd run admin:create
```

e entre por http://localhost:3000/admin/login.

## Denúncia (candidato)

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Candidato abre uma vaga em que **não** teve entrevista concluída | Não aparece "Denunciar esta vaga"; abrindo o endereço `/candidato/vagas/<id>/denunciar`, a tela explica que a denúncia é liberada após a entrevista |
| 1b | Vaga com entrevista concluída (SPEC-018) | "Denunciar esta vaga" aparece no detalhe da vaga e na seção Entrevista da candidatura |
| 2 | Abrir e clicar em "Registrar denúncia" sem preencher | Pede o tipo e a descrição; nada é enviado |
| 3 | Escolher o tipo, descrever, colocar um link em Evidências, marcar o risco e registrar | "Denúncia registrada", sem prometer decisão; informa a meta de 5 dias úteis e que a empresa não recebe o seu nome |
| 4 | Menu "Minhas denúncias" | A denúncia aparece como Recebida; o detalhe mostra o andamento e o que você enviou |
| 5 | Abrir de novo "Denunciar esta vaga" na mesma vaga | Aviso de que já existe uma denúncia em andamento |
| 6 | Registrar denúncias em outras vagas (com entrevista concluída) até passar de 3 em 24 horas | A quarta é recusada com explicação |
| 7 | Vaga com entrevista que você avaliou (SPEC-018) | O formulário pergunta se a denúncia é sobre essa entrevista |
| 8 | Conferir a vaga denunciada | Nada mudou (continua aberta) |

## Moderação (administrador)

| # | Passo | Resultado esperado |
|---|---|---|
| 9 | Administrador → "Denúncias" | Fila com prioridade alta primeiro e depois as mais antigas; meta de cada uma |
| 10 | Abrir a denúncia | Descrição, evidências, risco indicado, vaga com a acessibilidade declarada, histórico; sem nome ou e-mail do denunciante |
| 11 | "Assumir análise" | Em análise; o candidato recebe aviso em Notificações |
| 12 | "Pedir informações à empresa" com os pontos e o motivo | Aguardando informações; a empresa recebe aviso; o candidato vê "pode levar mais tempo" |
| 13 | Empresa → menu "Denúncias" | Vê os pontos da moderação e o formulário de resposta; não vê quem denunciou, a descrição nem as evidências |
| 14 | Empresa responde | A denúncia volta para Em análise; o administrador vê a resposta |
| 15 | "Registrar decisão" → Procedente sem medidas | Pede as medidas |
| 16 | Improcedente ou Inconclusiva | O campo de medidas some (encerra sem penalidade) |
| 17 | Registrar uma decisão completa | Concluída; aparece em "Histórico (concluídas)"; candidato vê o resultado e a justificativa resumida; empresa vê a justificativa e as medidas |
| 18 | Conferir a vaga e as avaliações | Nada mudou automaticamente |
| 19 | Entrar como empresa ou recrutador e abrir `/admin/denuncias` | Não tem acesso |
| 20 | Teclado, leitor de tela, celular e tema escuro | Formulários, abas e botões alcançáveis; mensagens anunciadas; tabela vira cartões no celular |

Registre abaixo os números com problema antes de encerrar as SPEC-019 e SPEC-020.
