# SPEC-002 — Implementação controlada do perfil do candidato

## Escopo implementado na branch

- Perfil persistido associado 1:1 à conta de usuário com papel CANDIDATE.
- Categorias profissionais: formação/escolaridade, idiomas, experiências (cargo, empresa, período), cursos, certificações e links profissionais. Competências foram retiradas por decisão de 27/10/2026.
- Nome e e-mail são reutilizados da conta, sem duplicação no perfil.
- Salvamento progressivo: categorias profissionais podem permanecer vazias.
- Declaração distingue `NOT_INFORMED`, `NO_NEEDS_DECLARED` e `NEEDS_DECLARED`.
- Necessidades e recursos são autodeclarados; não há upload de laudos médicos nem campo para dados clínicos. Os anexos são restritos a cursos e certificações.
- Idiomas possuem opções de idioma e nível, incluindo opção de texto livre para idioma não listado.
- Cursos e certificações são registrados por nome (sem exigir arquivo); o comprovante é opcional e aceita PDF, DOC, DOCX, JPG ou PNG de até 10 MB, armazenados em diretório privado local fora da pasta pública; os arquivos podem ser listados, baixados e removidos apenas pela conta candidata proprietária.
- A declaração de acessibilidade é apresentada antes dos campos detalhados; as opções do catálogo e a descrição livre só aparecem quando a pessoa declara que precisa de adaptações.
- A API de documentos valida autenticação, origem das gravações, extensão e assinatura inicial do arquivo, gera nome de armazenamento aleatório e não expõe o caminho interno. O diretório `.private-uploads/` é ignorado pelo Git.
- API de perfil restrita ao candidato autenticado; alterações verificam origem da requisição.
- Auditoria de criação/atualização registra categorias alteradas sem copiar valores profissionais ou de acessibilidade para metadados.
- Catálogo estruturado persistido no banco, com os 16 códigos aprovados na OPEN-008, separados em grupos arquitetônico, comunicação e tecnológico.
- Cada opção possui identificador estável, nome, descrição, grupo, estado ativo/inativo e propriedade explícita de obrigatoriedade. As opções iniciais são ativas e não obrigatórias; isso não determina a classificação futura. A classificação pode ser alterada por administrador autenticado e é auditada.
- Tela do candidato lista as opções por grupo, permite seleção múltipla e descrição livre de necessidade não contemplada. A descrição livre não cria uma opção oficial.
- A API valida no servidor que `NEEDS_DECLARED` contenha ao menos uma opção selecionada ou descrição livre; rejeita declaração incompatível com ausência de dados e declaração de inexistência de necessidades combinada com necessidades informadas.
- Opções desativadas não podem ser selecionadas por novos perfis, mas uma opção já registrada pode continuar associada à declaração histórica até que o candidato a remova.
- Área administrativa em `/admin/catalogo-acessibilidade`, restrita ao papel ADMIN, permite cadastrar, editar, marcar obrigatoriedade e ativar/desativar opções. Não há exclusão física nem reutilização de identificadores.
- Auditoria administrativa registra criação/alteração do catálogo, ator, código e metadados não sensíveis.
- Links profissionais são validados como URLs HTTP/HTTPS.
- Foram adicionados casos automatizados para validação da declaração condicional e rejeição de links não HTTP/HTTPS. Os testes permanecem sem execução.

## Limites e pendências preservados

- Não implementa algoritmo de compatibilidade nem afirma que o perfil é suficiente para uma vaga; essa responsabilidade pertence à SPEC-007.
- Não implementa consulta do perfil por recrutadores. A OPEN-011 define o princípio de acesso após candidatura, mas a matriz de campos, os limites por etapa e os registros de acesso continuam pendentes. Além disso, o modelo de candidatura não está presente no schema atual da branch; não foi inventado um fluxo de candidatura dentro da SPEC-002.
- A OPEN-008 permanece parcialmente resolvida: faltam critérios de produto para atribuição/alteração da obrigatoriedade e eventual processo para incorporar declarações livres ao catálogo. Até decisão explícita, todas as opções iniciais permanecem não obrigatórias e o texto livre não é promovido automaticamente.
- A OPEN-007.2 mantém pendentes campos internos, limites, quantidade máxima de registros e critérios detalhados de consistência. Só foi aplicada validação técnica de URL para links profissionais, sem criar limites quantitativos arbitrários.
- O perfil continua sendo criado sob demanda; não há operação de exclusão do perfil.
- A aprovação formal do layout permanece separada.

## Arquivos principais

- `prisma/schema.prisma`
- `prisma/migrations/20261026140000_spec_002_accessibility_catalog/migration.sql`
- `src/lib/candidate-profile/schema.ts`
- `src/app/api/candidato/perfil/route.ts`
- `src/app/api/candidato/documentos/route.ts`
- `src/app/api/candidato/documentos/[id]/route.ts`
- `prisma/migrations/20261026180000_spec_002_candidate_documents/migration.sql`
- `src/app/api/candidato/catalogo-acessibilidade/route.ts`
- `src/app/api/admin/catalogo-acessibilidade/route.ts`
- `src/app/candidato/perfil/profile-editor.tsx`
- `src/app/admin/catalogo-acessibilidade/page.tsx`
- `src/app/admin/catalogo-acessibilidade/catalog-editor.tsx`

## Revisão de 27/10/2026

- Experiências profissionais voltaram à tela como entradas estruturadas (`role`, `company`, `period`); registros antigos em texto são lidos com o texto no cargo. O campo Competências foi retirado da tela, do contrato da API e da validação (a coluna `skills` permanece no banco, sem uso, para evitar migração). Impacto: a SPEC-007 usa competências no perfil técnico e precisará definir a fonte desses dados. Cursos e certificações podem ser registrados só com o nome, e o anexo é opcional.
- Formação e idiomas passaram a ser objetos estruturados (formação: `level`, `course`, `institution`, `status`; idioma: `language`, `level`), validados no servidor com listas fechadas de nível e situação. Registros antigos em texto "campo — campo" são lidos de forma compatível e convertidos no próximo salvamento; a detecção de mudança para auditoria compara JSON canônico (chaves ordenadas).
- Rótulos sem controle associado foram corrigidos; botões de remover e baixar identificam o item; a troca da declaração de necessidades pede confirmação quando há seleções.
- Envio e remoção de anexos geram auditoria (`CANDIDATE_PROFILE_DOCUMENT_ADDED` / `_REMOVED`), registrando só a categoria.
- Testes de anexos executam em ambiente `node` (o `jsdom` travava o envio de formulário).
- Acesso de administrador: `npm run admin:create` (variáveis `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`) cria a conta, e `/admin/login` autentica o perfil `admin`. A página não é ligada à entrada pública, pois os protótipos aprovados não oferecem login público de administrador.

## Pendências de decisão

- **RB-06 (necessidades obrigatórias):** adiada para a SPEC-007. Nesta Spec só o administrador marca uma opção do catálogo como obrigatória (todas começaram não obrigatórias); o candidato indica recursos indispensáveis apenas em texto. A SPEC-007 deve definir quem classifica a obrigatoriedade e como ela entra na compatibilidade.
- **Anexos:** decidido manter como opcionais e incluídos no escopo da SPEC-002 (Specs.md atualizado); o sistema continua sem armazenar laudos.
- **Formação e idiomas:** decidido estruturar agora; ver Revisão acima.

## Verificações

- Vitest, ESLint e `tsc --noEmit` executados localmente em 27/10/2026 (testes de rota, de componente e de esquema).
- O E2E (`scripts/auth-e2e.mjs`) cobre perfil, catálogo e anexos: acesso anônimo recusado, validação da declaração, rejeição de texto antigo e de código inexistente, origem cruzada, persistência estruturada de formação/idiomas, auditoria sem valores, envio/lista/download/remoção de anexo com conteúdo validado. Depende de PostgreSQL e roda na CI.
- Teste manual das telas, leitor de tela e aprovação formal do layout continuam pendentes e não foram marcados nos critérios de aceitação.
