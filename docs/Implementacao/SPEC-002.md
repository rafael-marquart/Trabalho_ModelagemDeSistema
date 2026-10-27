# SPEC-002 — Implementação controlada do perfil do candidato

## Escopo implementado na branch

- Perfil persistido associado 1:1 à conta de usuário com papel CANDIDATE.
- Categorias profissionais: formação/escolaridade, competências, idiomas, experiências, cursos, certificações e links profissionais.
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

- Competências e experiências profissionais voltaram à tela (haviam sido removidas por engano); cursos e certificações podem ser registrados só com o nome, e o anexo é opcional.
- Entradas de formação e idiomas não aceitam o separador " — " dentro dos campos, para que o texto armazenado possa ser separado sem ambiguidade (o nível "Ensino superior (graduação)" deixou de conter o separador).
- Rótulos sem controle associado foram corrigidos; botões de remover e baixar identificam o item; a troca da declaração de necessidades pede confirmação quando há seleções.
- Envio e remoção de anexos geram auditoria (`CANDIDATE_PROFILE_DOCUMENT_ADDED` / `_REMOVED`), registrando só a categoria.
- Testes de anexos executam em ambiente `node` (o `jsdom` travava o envio de formulário).
- Acesso de administrador: `npm run admin:create` (variáveis `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`) cria a conta, e `/admin/login` autentica o perfil `admin`. A página não é ligada à entrada pública, pois os protótipos aprovados não oferecem login público de administrador.

## Pendências de decisão

- **RB-06 (necessidades obrigatórias):** hoje só o administrador marca uma opção do catálogo como obrigatória, e todas começaram não obrigatórias; o candidato não indica quais necessidades são indispensáveis, a não ser pelo campo de recursos indispensáveis (texto). Definir antes da SPEC-007 quem classifica a obrigatoriedade.
- **Formação estruturada:** formação e idiomas continuam armazenados como texto "campo — campo". Se a SPEC-007 precisar comparar escolaridade, migrar para objetos estruturados.
- **Anexos:** a SPEC-002 não prevê anexos de cursos/certificações; a funcionalidade foi mantida como opcional. Confirmar ou remover do escopo, lembrando que o sistema não armazena laudos.

## Verificações

Testes unitários, lint e os testes de componente executados em 27/10/2026 (ver commit). Typecheck, build, migrações e E2E dependem do Prisma Client e do PostgreSQL e devem ser conferidos na CI ou localmente. Teste manual das telas ainda pendente.
