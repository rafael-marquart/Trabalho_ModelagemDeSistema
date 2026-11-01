# SPEC-018 — Implementação da avaliação do processo seletivo (com cadastro de entrevistas)

## Entrevistas no funil (OPEN-094, decisão de 01/11/2026)

A avaliação depende de uma "entrevista cadastrada e concluída" (OPEN-070), que a plataforma não tinha. Por decisão do responsável, a entrevista passou a ser cadastrada no funil da empresa (entidade ENTREVISTA do modelo conceitual):

- **Quem:** a conta da Empresa ou um Recrutador com vínculo ativo, só nas vagas da própria empresa (a empresa vem da sessão).
- **Agendar:** com a candidatura na etapa Entrevista. Campos: data e hora (horário de Brasília, sempre futura), modalidade (presencial ou on-line; on-line exige link `https://`), endereço ou link e recursos de acessibilidade previstos (opcional). O formulário mostra os recursos que o candidato marcou como indispensáveis. No máximo uma entrevista agendada por vez para cada candidatura (índice único no banco).
- **Alterar** e **cancelar** a entrevista agendada; **marcar como concluída** só depois do horário. Entrevista concluída ou cancelada não muda mais.
- **Avisos (SPEC-017, item 3 da OPEN-066):** agendamento, alteração e cancelamento avisam o candidato no site e, se ele quiser, por e-mail, com data/hora, modalidade, link ou local e recursos previstos.
- **Candidato:** vê a entrevista no detalhe da candidatura (com o link clicável quando on-line). Se ele cancelar a candidatura, a entrevista agendada é cancelada junto.
- Auditoria: `INTERVIEW_SCHEDULED`, `INTERVIEW_UPDATED`, `INTERVIEW_CANCELLED`, `INTERVIEW_COMPLETED`.

## Avaliação pelo candidato

- **Elegibilidade (OPEN-070):** só o próprio candidato, para entrevista **concluída** da sua candidatura, até **60 dias corridos** depois da conclusão; independe de contratação ou recusa. Tudo é conferido de novo no servidor.
- **Formulário (OPEN-071):** dois critérios separados e obrigatórios — **Acessibilidade** e **Postura inclusiva** — de 1 a 5 estrelas (botões de opção acessíveis, com o número de estrelas escrito), e comentário opcional de até 1000 caracteres. Antes do envio, o candidato **revisa** o que preencheu ("Revisar avaliação" → "Enviar avaliação" ou "Voltar e corrigir").
- **Confirmação** e **consulta da própria avaliação:** após o envio, a tela confirma e passa a mostrar a avaliação enviada, só para leitura. Prazo vencido sem avaliação: a tela informa a data em que terminou.
- **Uma por entrevista, sem edição (OPEN-072):** a segunda tentativa é recusada; um gatilho no banco impede alterar notas, comentário ou vínculos de uma avaliação enviada (só a anonimização de 1 ano pode apagar vínculos e comentário).
- **Eventos e indícios de abuso:** envio auditado (`EVALUATION_SUBMITTED`, sem notas nem comentário na auditoria); tentativas recusadas auditadas (`EVALUATION_REFUSED`); três ou mais recusas em 24 h geram `EVALUATION_ABUSE_SUSPECTED` para análise administrativa, sem bloqueio (provisório, OPEN-095).
- **Privacidade (OPEN-073):** a empresa não vê avaliações individuais nem comentários. Para a nota pública (SPEC-021) existe só a contagem por número de estrelas de cada critério (`ratingDistribution`), sem identidade, identificadores ou comentários. Nada é publicado ainda: a apresentação pública é da SPEC-021.
- **Retenção:** `npm run evaluations:retention` (simulação) e `-- --execute` anonimizam, 1 ano após o envio, cada avaliação: removem os vínculos com entrevista, candidatura e candidato, e o comentário; ficam só a empresa e as duas notas, para a distribuição agregada.

## Arquivos principais

- `prisma/migrations/20261101190000_spec_018_interviews_evaluations/migration.sql`
- `src/lib/interviews/{service,format}.ts`, `src/lib/evaluations/service.ts`
- APIs: `src/app/api/candidaturas/[id]/entrevistas/...` (empresa), `src/app/api/candidato/entrevistas/[interviewId]/avaliacao/route.ts` (candidato)
- Telas: `src/components/applications/interview-panel.tsx` (funil), `src/components/candidate/interview-evaluation.tsx` e seção "Entrevista" em `src/app/candidato/candidaturas/[id]/page.tsx`
- `scripts/{evaluation-retention,anonymize-evaluations}.mjs`

## Verificações

- Vitest: data em horário de Brasília, validação do formulário de entrevista, agendamento só na etapa Entrevista e para a própria empresa, uma agendada por vez, alteração/cancelamento/conclusão (conclusão só após o horário) com auditoria e avisos; avaliação com as duas notas obrigatórias de 1 a 5, comentário opcional, vínculo com a própria entrevista, prazo de 60 dias, duplicata recusada, indício de abuso registrado sem bloqueio, auditoria sem conteúdo, distribuição só com contagens; anonimização; telas (formulário de entrevista com erros do servidor, conclusão desabilitada antes do horário, cancelamento confirmado, avaliação com revisão e envio único, axe-core).
- E2E: entrevista exige etapa Entrevista, data passada e link inválido recusados, outra empresa e candidato recusados, agendar/alterar/concluir/cancelar, avaliação recusada antes da conclusão, notas inválidas recusadas, empresa não avalia, avaliação sem comentário aceita, segunda recusada, edição bloqueada no banco, empresa não vê a avaliação, avisos ao candidato, auditoria, página do candidato com a avaliação só para leitura.
- Teste manual: `docs/operacao/validacao-manual-spec-018.md`.

## Encerramento

Teste manual executado pelo responsável em 01/11/2026 sem problemas; layouts aprovados na mesma data. SPEC-018 encerrada, com a OPEN-095 em aberto e a apresentação pública da distribuição a cargo da SPEC-021.
