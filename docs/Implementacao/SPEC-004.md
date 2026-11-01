# SPEC-004 — Implementação da infraestrutura de acessibilidade da empresa

## Escopo implementado

- Questionário estruturado e extensível definido em `src/lib/company-infrastructure/items.ts`: cinco categorias (OPEN-017) e seis itens do UC-07, todos obrigatórios. Para estender, basta acrescentar um item com código estável; as respostas ficam em JSON por código, sem migração.
- Resposta por item: `PRESENT`, `ABSENT` ou `NOT_INFORMED` (apenas nos itens não obrigatórios), mais observação opcional de até 300 caracteres. Não há escala universal.
- Persistência em `CompanyInfrastructure` (1:1 com `Company`, migração `20261027200000_spec_004_company_infrastructure`). A empresa é sempre a da sessão; o corpo da requisição não escolhe a empresa.
- API `GET/PUT /api/company/infraestrutura`, restrita à conta de Empresa ativa, com verificação de origem nas gravações. Itens obrigatórios pendentes bloqueiam o salvamento e são devolvidos por código de item.
- Tela `/empresa/infraestrutura` (link na área da empresa): uma seção por categoria, erro ao lado de cada item e aviso de que a informação geral não substitui os critérios da vaga.
- Auditoria (`COMPANY_INFRASTRUCTURE_CREATED/UPDATED`) com ator, empresa e lista de alterações por código de item e tipo (`ADDED`, `CHANGED`, `REMOVED`), sem valores nem observações. Salvar sem mudanças não gera evento. Não há cópia integral do mapeamento (OPEN-018).
- Contrato de leitura para consumidores autorizados: `getCompanyInfrastructure(companyId)` em `src/lib/company-infrastructure/service.ts`. Itens sem resposta voltam como `NOT_INFORMED`; nada é inferido.
- A capacidade não calcula compatibilidade nem nota pública e não preenche trava crítica.

## Fora desta entrega

- **Divergências recorrentes (seção 5.5, OPEN-019):** registro, análise administrativa e decisão ficam para etapa própria; os quatro critérios correspondentes seguem abertos. Evidências mínimas, limiar de recorrência, prazos, contestação e catálogo de decisões não estão definidos na Spec.
- Edição por recrutadores vinculados: não prevista.
- Valores anteriores ou versões completas: não preservados (decisão específica pendente na OPEN-018).
- A aprovação do layout permanece separada.

## Arquivos principais

- `prisma/schema.prisma`, `prisma/migrations/20261027200000_spec_004_company_infrastructure/migration.sql`
- `src/lib/company-infrastructure/{items,schema,service}.ts`
- `src/app/api/company/infraestrutura/route.ts`
- `src/app/empresa/infraestrutura/{page,infrastructure-editor}.tsx`

## Verificações

- Vitest, ESLint e `tsc --noEmit` executados em 27/10/2026.
- O E2E cobre: acesso anônimo recusado, leitura vazia como "não informado", bloqueio por item obrigatório pendente, origem cruzada, empresa não escolhida pelo corpo, persistência, atualização e auditoria sem valores. Roda na CI com PostgreSQL.
- Teste manual: ver `docs/operacao/validacao-manual-spec-004.md`.
- Teste manual executado pelo responsável em 27/10/2026; ajustes aplicados (Tab passa por cada opção via `ChoiceGroup`, observações mais afastadas). Layout aprovado na mesma data.
- SPEC-004 encerrada em 27/10/2026, exceto o tratamento de divergências recorrentes (seção 5.5), adiado para etapa própria.
