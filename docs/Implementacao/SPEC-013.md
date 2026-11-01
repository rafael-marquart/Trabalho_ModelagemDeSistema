# SPEC-013 — Implementação do processo seletivo e do funil

## Escopo implementado

- **Quem opera:** a conta da Empresa e os Recrutadores com vínculo ativo, sempre sobre as vagas da própria empresa (a empresa vem da sessão, nunca da requisição). Candidatos e outras empresas são recusados. Mantida a decisão da SPEC-005 de 27/10/2026 de incluir a conta da Empresa.
- **Painel de candidaturas** (`/empresa/vagas/[id]/candidaturas` e `/recrutador/vagas/[id]/candidaturas`): contagem por etapa, filtro por etapa e lista com candidato, data, compatibilidade registrada na inscrição e etapa. A lista de vagas mostra "Candidaturas (n)" em cada vaga publicada.
- **Detalhe da candidatura (OPEN-055):** nome e e-mail para contato, perfil profissional (formação, experiência, idiomas, cursos, certificações, links), compatibilidade registrada na inscrição (score e A/T/D) e, para preparar o processo, as necessidades de acessibilidade do catálogo e os recursos indispensáveis. Não são enviados CPF, documentos anexados, a descrição livre de necessidades nem qualquer dado de saúde.
- **Mudança de etapa (RB-39, OPEN-054):** somente Inscrito→Triagem, Triagem→Entrevista/Recusada, Entrevista→Finalista/Recusada e Finalista→Contratado/Recusada. A tela mostra só os movimentos permitidos e pede confirmação, com observação opcional; o servidor valida tudo de novo. Movimento fora do fluxo, de outra empresa ou com a etapa alterada por outra pessoa no meio tempo é recusado sem alterar nada. Cancelar é ação do candidato (SPEC-012).
- **Histórico (OPEN-056):** tabela `ApplicationStageEvent` com etapa anterior e resultante, data e hora, ator, tipo (registro, avanço, recusa, contratação) e observação. Um gatilho no banco impede editar ou apagar eventos. A candidatura passa a registrar também o evento inicial (Inscrito); candidaturas anteriores recebem esse evento na migração.
- Etapa, evento de histórico e auditoria (`APPLICATION_STAGE_CHANGED`) são gravados na mesma transação.

## Ponto em aberto (OPEN-092)

- "Pendências impeditivas conhecidas" (OPEN-054): a baseline não define nenhum tipo de pendência. Existe um único ponto no código (`knownBlockingIssues` em `src/lib/applications/funnel.ts`) que hoje não aponta pendência; a solicitação de complementação ao candidato depende dessa definição e das Specs do candidato.
- Justificativa obrigatória: nenhuma regra a exige; a observação é opcional em todos os movimentos.

## Arquivos principais

- `prisma/migrations/20261031230000_spec_013_funnel/migration.sql`
- `src/lib/applications/{funnel,company-service}.ts`
- `src/app/api/vagas/[id]/candidaturas/route.ts`, `src/app/api/candidaturas/[id]/route.ts`, `src/app/api/candidaturas/[id]/etapa/route.ts`
- `src/components/applications/{funnel-board,application-detail}.tsx` e páginas em `src/app/{empresa,recrutador}/vagas/[id]/candidaturas`

## Verificações

- Vitest: transições permitidas e recusadas, listagem restrita à empresa, dados do detalhe sem descrição livre, movimento com histórico e auditoria, recusas sem escrita, API (sessão, corpo estrito), telas (filtro, confirmação, etapa final, axe-core).
- E2E: listagem pela empresa, recusa a outra empresa e ao candidato, CPF não exposto, pular etapa recusado, movimento para Triagem com observação, histórico com dois eventos, histórico imutável (atualizar e apagar recusados), páginas do funil; o encerramento continua identificando o candidato ativo.
- Teste manual: `docs/operacao/validacao-manual-spec-013.md`.
