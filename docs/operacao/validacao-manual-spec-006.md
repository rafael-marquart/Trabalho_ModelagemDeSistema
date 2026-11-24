# Roteiro de validação manual — SPEC-006 (vagas externas do Adzuna)

**Antes:** no `.env` local (nunca no repositório), preencha `ADZUNA_APP_ID` e `ADZUNA_APP_KEY`. Depois: `git pull`, `npm.cmd ci`, `npm.cmd run db:generate`, `npx.cmd prisma migrate deploy` (migração `20261118120000_spec_006_external_jobs`) e `npm.cmd run dev`. No ambiente de testes da Vercel, as duas variáveis vão em *Settings → Environment Variables* (Preview), como *Sensitive*.

**Atenção:** o lote de teste aprovado tem **25 chamadas no total**. Cada execução gasta até 5 (uma por frase). Rode com calma.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Entrar como administrador e abrir **Vagas externas** | Mostra "0 de 25 usadas", as frases, "Credenciais: Configuradas no servidor", LLM e coleta diária desligadas |
| 2 | Sem as variáveis do Adzuna, abrir a mesma página | "Não configuradas" e botão desabilitado |
| 3 | Clicar em **Executar lote de teste** | Mensagem com quantas vagas foram publicadas, rejeitadas, duplicadas e falhas; as chamadas usadas sobem |
| 4 | Clicar em **Ver registros** da execução | Cada anúncio com o resultado; os rejeitados dizem o motivo (ex.: "empresa contratante não identificável") |
| 5 | Executar de novo | Os mesmos anúncios aparecem como "Duplicada", sem criar vagas repetidas |
| 6 | Como candidato, abrir **Vagas** | Vagas importadas com o selo "Vaga externa · Adzuna" |
| 7 | Abrir uma vaga externa | Origem "Vaga externa, encontrada no Adzuna", acessibilidade "Não informado", botão "Ver anúncio no Adzuna" que abre o anúncio em nova aba; sem botão de candidatura nem de denúncia |
| 8 | Conferir a compatibilidade da vaga externa | Na busca, o cartão mostra "Sem cálculo de compatibilidade" no lugar do círculo; no detalhe, a seção explica que não há dados para comparar |
| 9 | Repetir 1 e 7 no celular e nos temas escuro e alto contraste | Tudo legível e sem corte |
| 10 | Depois de 25 chamadas | O botão fica desabilitado e a página mostra "restam 0" |
