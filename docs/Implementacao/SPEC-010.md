# SPEC-010 — Implementação do detalhe da vaga e do resultado de compatibilidade

## Escopo implementado

- Página `/candidato/vagas/[id]` na área do candidato, aberta pelo título da vaga na lista, nos destaques do Início e pelo botão "Ver detalhes da vaga" no diálogo do score.
- **Campos (OPEN-043):** título, empresa, status, descrição, requisitos, critérios técnicos publicados, modalidade, local de trabalho, faixa salarial, prazo de inscrição, área profissional e origem.
- **Dados ausentes (OPEN-045):** aparecem como "Não informado(a)"; faixa salarial ausente não vira "sem remuneração" e local ausente não vira "remoto". Há uma única fonte (vaga própria); divergência entre fontes só se aplicará com a SPEC-006.
- **Acessibilidade (RB-13):** "Declarado para esta vaga" (os seis itens com Presente/Ausente/Não informado) separado de "Informações gerais da empresa" (infraestrutura da SPEC-004, com o aviso de que não garante o recurso no local da vaga).
- **Compatibilidade (OPEN-044/046):** mostra o resultado da SPEC-007 sem recalcular (reutiliza o último quando nada mudou): score só com análise completa; A, T e D com nota, peso e critérios expansíveis; tempo até o trabalho; o que falta e link para completar o perfil. Trava crítica aparece como "não elegível" com o recurso indispensável envolvido. Quando a vaga não informou um recurso indispensável para o candidato, a tela diz que a elegibilidade não foi concluída (o motor da SPEC-007 passou a informar essas verificações pendentes, sem mudar o cálculo).
- **Status e continuidade:** Aberta, Indisponível (pausada ou prazo vencido) e Encerrada, conforme o catálogo da SPEC-009. A caixa de continuidade diz se o candidato pode seguir; vagas indisponíveis, encerradas, incompatíveis ou com elegibilidade não concluída ficam bloqueadas. O envio da candidatura pertence à SPEC-011 e ainda não existe, o que a tela informa.
- Rascunhos e vagas de outras origens respondem "não encontrada". A tela não mostra identificadores internos, contatos ou dados de outros candidatos.
- Resultado e diálogo usam o mesmo componente (`compatibility-details.tsx`).

## Ajustes do teste manual (31/10/2026)

- "O que falta" separado por responsável: **Falta no seu perfil** (com o botão "Completar meu perfil"), **A empresa não informou** (sem botão, com aviso de que não depende do candidato) e **Não foi possível calcular agora** (falha do serviço de rotas). O motor passou a marcar quem pode completar cada dado; versão de regras `SPEC-007/2` (resultados antigos são recalculados uma vez, sem nova chamada à HERE para trajetos salvos).
- Celular: as tabelas de vagas e de recrutadores viram um cartão por linha, com Editar, Pausar, Reabrir e Encerrar sempre visíveis; o menu lateral quebra em linhas e não alarga mais a página; a barra do topo foi reorganizada.

## Arquivos principais

- `src/lib/jobs/{detail,detail-service}.ts`, `src/app/candidato/vagas/[id]/page.tsx`
- `src/components/candidate/{compatibility-details,score-dialog,job-card}.tsx`
- `src/lib/compatibility/{engine,types}.ts` (verificações críticas pendentes)

## Verificações

- Vitest: regras de status, continuidade, salário e local; serviço (só vagas publicadas, sem identificadores internos, sem análise para vagas fechadas); página (separação das acessibilidades, resultado completo, incompatibilidade, elegibilidade não concluída, vaga encerrada, não encontrada, axe-core); motor (pendências críticas).
- E2E: detalhe aberto pelo candidato, status, seções de acessibilidade, ausência de identificadores internos, acesso anônimo bloqueado, rascunho não encontrado, vaga encerrada com bloqueio.
- Teste manual: `docs/operacao/validacao-manual-spec-010.md`.
- Teste manual executado pelo responsável em 31/10/2026; layout aprovado na mesma data. SPEC-010 encerrada; a consulta própria de status (SPEC-009) e o envio da candidatura (SPEC-011) permanecem nas suas Specs.
