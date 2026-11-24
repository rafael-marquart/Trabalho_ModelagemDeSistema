# SPEC-006 — Implementação da importação de vagas externas (Adzuna)

## Escopo implementado

- **Modelo comum de vaga (DT-06, RB-33):** a vaga externa é uma `Job` com origem `EXTERNAL`, sem conta de empresa nem criador. Guarda a fonte (`ADZUNA`), o identificador e o link do anúncio original, o nome da empresa contratante e a origem de cada dado mínimo (fonte ou LLM). Duas restrições do banco garantem que vaga própria sempre tem empresa e vaga externa sempre tem origem rastreável.
- **Coleta (OPEN-024, OPEN-086, OPEN-087):** uma chamada por frase de busca (`what_phrase`), página 1, até 20 resultados. Orçamento total de **25 chamadas** (somado entre todas as execuções) e até 5 por execução, os dois configuráveis. Falha recuperável (rede, tempo limite, 429, 5xx) tem **uma** nova tentativa, que também conta. Erro permanente (401/403, JSON inválido, formato inesperado) não é repetido.
- **Validação dos dados mínimos (OPEN-025):** título significativo (não genérico como "Vaga"), descrição útil (≥ 60 caracteres e 8 palavras), empresa contratante identificável (o portal "Adzuna", "confidencial" e equivalentes não contam), localidade com cidade e UF, identificador e link `http(s)` do anúncio. O motivo de cada rejeição fica registrado.
- **LLM atrás de porta (ADR-003, OPEN-026, RB-11, RB-18):** só é consultado quando faltam empresa ou localidade. A resposta só vale se o valor estiver **escrito no anúncio**; o que não aparece no texto é descartado, então a LLM não inventa empresa nem cidade. Até 3 tentativas, só para falhas recuperáveis ou respostas inválidas. O adaptador Gemini existe, mas fica **desligado por padrão** (`EXTERNAL_JOBS_LLM=off`); desligado, a vaga segue só com os dados da fonte ou é rejeitada.
- **Deduplicação conservadora (OPEN-028)**, só entre vagas externas e nesta ordem: mesmo identificador na mesma fonte (também garantido por índice único); mesmo link original sem parâmetros de rastreio; mesma empresa, título, cidade e UF normalizados. Fora disso, as vagas ficam separadas. Nada é apagado, fundido ou sobrescrito.
- **Execução e rastreabilidade (OPEN-027, OPEN-029):** `ExternalImportRun` guarda a origem, quem iniciou, as consultas (frase, tentativas, resultado, sem as credenciais), os totais e a situação (concluída, concluída com falhas, malsucedida). `ExternalImportRecord` guarda o resultado de cada registro (publicada, rejeitada, duplicada, falha) com o motivo. Cada registro é gravado numa transação própria; falha de um não afeta os outros. Só uma execução por vez (índice único parcial); uma execução presa por mais de 15 minutos é encerrada como malsucedida. Auditoria `EXTERNAL_IMPORT_FINISHED` com os totais.
- **Administração:** página **Vagas externas** (`/admin/vagas-externas`), com chamadas usadas e restantes, frases, situação das credenciais, da LLM e da coleta diária, botão "Executar lote de teste" e o histórico das execuções com os registros.
- **Coleta diária (T-006-01):** rota `/api/cron/vagas-externas`, protegida pelo `CRON_SECRET`, que fica **desligada** (`EXTERNAL_IMPORT_SCHEDULE=off`) até a autorização de uso contínuo da fonte. Não foi incluída no `vercel.json`.
- **Para o candidato:** vagas externas entram na busca (selo "Vaga externa · Adzuna"), na compatibilidade (SPEC-007) e no detalhe (SPEC-010). Acessibilidade aparece como "Não informado" (RB-16). Não há candidatura nem denúncia dentro da plataforma; o detalhe leva ao anúncio original, com atribuição ao Adzuna.

## Mapeamento do Adzuna para o modelo comum de vaga

Implementado em `src/lib/external-jobs/record.ts` (`fromAdzuna`). Os textos passam por limpeza de HTML e espaços antes do uso.

| Campo do Adzuna | Campo da vaga (`Job`) | Conversão |
|---|---|---|
| `id` | `externalId` | Texto; com `externalSource = "ADZUNA"` forma a chave única |
| `redirect_url` | `externalUrl` e `externalUrlKey` | Link original; a chave tira parâmetros de rastreio, `www.` e barra final |
| `title` | `title` | Até 200 caracteres; títulos genéricos ("Vaga", "Emprego"…) são rejeitados |
| `description` | `description` | Até 8000 caracteres; exige pelo menos 60 caracteres e 8 palavras |
| `company.display_name` | `externalCompanyName` | Até 200 caracteres; "Adzuna", "confidencial" e equivalentes são rejeitados |
| `location.area` (ou `location.display_name`) | `city` e `state` | UF pelo segundo nível da área (ou pelo final do nome); cidade pelo terceiro nível |
| `created` | `publishedAt` | Data; ignorada se inválida |
| `salary_min` / `salary_max` | `salaryMin` / `salaryMax` | Só quando o salário não é estimado pelo Adzuna (`salary_is_predicted` diferente de 1) |
| — | `origin`, `status` | `EXTERNAL` e `OPEN` |
| `title` | `professionalArea` | Inferida pelo título com regras de palavras-chave (`src/lib/jobs/area.ts`); sem correspondência, "Outra" |
| — | acessibilidade, modalidade, critérios técnicos | Vazios ("não informado"): o Adzuna não traz esses dados |
| — | `externalFieldOrigins` | Registra se empresa, cidade e UF vieram da fonte (`SOURCE`) ou da LLM |

## Desvios e limites

- O texto da SPEC-006 não fixa a forma física da execução; foram criadas as tabelas `ExternalImportRun` e `ExternalImportRecord`.
- `companyId` e `createdByUserId` da vaga passaram a aceitar vazio, só para vagas externas (restrição `Job_own_has_company`).
- A busca do endereço de trabalho por LLM/internet (OPEN-089) não foi implementada: vagas externas não têm endereço confirmado, então o deslocamento fica como "não informado".
- Modalidade, área profissional e critérios técnicos não vêm estruturados do Adzuna e ficam vazios; a compatibilidade os trata como dados insuficientes.
- Vagas externas não são encerradas automaticamente quando somem da fonte.

## Arquivos principais

- `prisma/migrations/20261118120000_spec_006_external_jobs/migration.sql`
- `src/lib/external-jobs/{config,adzuna,record,llm,text,service,labels}.ts`
- `src/app/api/admin/vagas-externas/**`, `src/app/api/cron/vagas-externas/route.ts`, `src/app/admin/vagas-externas/page.tsx`, `src/components/external-imports.tsx`
- Consumidores: `src/lib/jobs/{search-service,detail-service,availability,company-name}.ts`, `src/lib/compatibility/service.ts`, `src/app/candidato/vagas/[id]/page.tsx`

## Verificações

- Vitest: mapeamento do Adzuna, dados mínimos, chaves de deduplicação, chamada à fonte (sem vazar credenciais), configuração, validação e tentativas da LLM, tela do administrador com axe-core, detalhe da vaga externa.
- E2E (`scripts/auth-e2e.mjs`) com Adzuna simulado: retry após 503, erros permanentes, 8 registros com as três camadas de deduplicação, orçamento esgotado (409), coleta diária desligada, busca, detalhe com link original e candidatura interna recusada; repetível no mesmo banco.
- Navegador: página do administrador e detalhe da vaga externa sem violações do axe-core.
- Teste manual: `docs/operacao/validacao-manual-spec-006.md`.
