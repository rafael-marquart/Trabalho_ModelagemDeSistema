# SPEC-008 — Implementação da busca de vagas e da área do candidato

## Escopo implementado

- **Área do candidato** com o menu lateral compartilhado (`CompanyShell`, papel `CANDIDATE`): Início, Vagas e Meu perfil. Candidaturas, Notificações, banner e "% do perfil" ficam fora até suas Specs (D-02, 29/10/2026).
- **Início** (`/candidato`): saudação e "Vagas em destaque" (as três primeiras da busca padrão).
- **Vagas** (`/candidato/vagas`): busca textual, filtros, ordenação e paginação; o estado fica no endereço (`?q=…&modalidade=…&ordem=…&pagina=…`).
- **Busca textual (OPEN-037):** título/cargo, descrição e nome da Empresa; ignora maiúsculas e acentos; aceita trechos; todos os termos devem aparecer, podendo estar em campos diferentes; sem sinônimos nem correção.
- **Filtros (OPEN-036):** cargo, área profissional, modalidade, localização (cidade/UF) e acessibilidade declarada pela vaga (itens da OPEN-023 marcados como presentes). Categorias diferentes por AND; valores da mesma categoria por OR. As opções vêm das vagas abertas.
- **Elegibilidade:** apenas vagas próprias publicadas e dentro do prazo (vagas externas dependem da SPEC-006). Cada vaga é analisada pela SPEC-007; vagas com trava crítica não aparecem e a lista informa quantas foram ocultadas, sem detalhes.
- **Ordenação (OPEN-038):** maior compatibilidade (padrão), mais recentes, mais antigas (data de publicação); empates pelo identificador interno, não exibido. Análises com dados insuficientes vêm depois das que têm score.
- **Paginação:** 20 por página, até 100 vagas; numerada com anterior/próxima; mudar busca ou filtro volta à página 1.
- **Círculo do score:** botão acessível que abre um diálogo com A, T e D (nota e peso), o tempo até o trabalho no meio de transporte do perfil e o que falta completar. Sem análise completa, o círculo não mostra número ("Faltam dados").
- **Acessibilidade da vaga antes da candidatura (RB-13):** cada cartão mostra os recursos declarados e, ao expandir, o estado dos seis itens.
- **Histórico (D-01):** cada análise guarda uma impressão digital das entradas (`inputHash`, inclui endereços sem armazená-los). Se nada mudou, o último resultado é reutilizado sem chamar a HERE nem gravar linha nova; falhas transitórias da HERE (cota, indisponibilidade) são recalculadas na próxima vez, mas só geram linha nova se o resultado mudar.
- **Economia da cota HERE:** geocodificações bem-sucedidas ficam em memória por 24 h (o endereço do candidato é consultado uma vez para várias vagas).
- **Área profissional da vaga:** campo opcional com lista fixa no editor da vaga (necessário para o filtro).
- A tela de simulação da SPEC-007 (`/candidato/compatibilidade`) continua disponível dentro da área do candidato para testar outro meio de transporte.

## Decisões a confirmar (OPEN-091)

1. Lista de áreas profissionais: Administração, Atendimento ao cliente, Comercial e vendas, Comunicação e marketing, Educação, Engenharia, Finanças e contabilidade, Jurídico, Logística e operações, Recursos humanos, Saúde, Tecnologia da informação, Outra.
2. Vagas com dados insuficientes aparecem na lista, depois das que têm score, sem número no círculo.
3. O filtro "Cargo" usa os títulos das vagas abertas.

## Arquivos principais

- `prisma/migrations/20261029200000_spec_008_job_search/migration.sql`
- `src/lib/jobs/{search,search-service}.ts`, `src/lib/compatibility/{service,fingerprint,travel}.ts`
- `src/app/api/candidato/vagas/route.ts`, `src/app/api/candidato/compatibilidade/vagas/route.ts`
- `src/components/candidate/{job-search,job-card,score-dialog,types}.tsx`, `src/components/company-shell.tsx`
- `src/app/candidato/{page,vagas/page,perfil/page,compatibilidade/page}.tsx`

## Verificações

- Vitest: busca textual, filtros AND/OR, opções, ordenações, paginação, parâmetros; serviço (elegibilidade, ocultação, ordem); API (autorização, filtros inválidos); reutilização do histórico (D-01); interface (filtros, endereço, paginação, estado vazio, diálogo, axe-core).
- E2E: busca autenticada, filtros, OR/AND, termo inexistente, reutilização sem chamar a HERE, ocultação por trava crítica, página da área do candidato, vaga encerrada sai da busca.
- Teste manual: `docs/operacao/validacao-manual-spec-008.md`.
