# SPEC-002 — Implementação controlada do perfil do candidato

## Escopo entregue na branch

- Perfil persistido associado 1:1 à conta de usuário com papel CANDIDATE.
- Categorias: formação/escolaridade, competências, idiomas, experiência profissional, cursos, certificações, links profissionais, declaração de acessibilidade, necessidades funcionais e recursos indispensáveis.
- Nome e e-mail são apresentados a partir da conta, sem duplicação no perfil.
- Salvamento progressivo: listas vazias são válidas e nenhuma categoria profissional exige preenchimento universal.
- A declaração distingue NOT_INFORMED, NO_NEEDS_DECLARED e NEEDS_DECLARED.
- Necessidades e recursos são autodeclarados; não há upload nem campo para laudo médico.
- API restrita ao candidato autenticado e proteção contra requisições cross-origin nas alterações.
- Auditoria registra criação/atualização e categorias afetadas, sem copiar valores profissionais ou de acessibilidade para metadados.
- O catálogo oficial ainda não está implementado. A decisão aprovada para OPEN-008 define três grupos (arquitetônico, comunicação e tecnológico), opções com identificador estável e propriedade explícita de obrigatoriedade, controles administrativos rastreáveis e possibilidade de autodeclarar necessidades não contempladas. A lista inicial e as regras operacionais detalhadas continuam pendentes.

## Limites preservados

- Não implementa algoritmo de compatibilidade nem afirma que o perfil é suficiente para uma vaga.
- Não disponibiliza consulta de perfis para recrutadores: a matriz de campos autorizados e o contexto de candidatura da OPEN-011 precisam de definição.
- A estrutura do catálogo da OPEN-008 foi aprovada, mas sua implementação continua pendente até a definição da lista inicial de opções, critérios de obrigatoriedade, controles administrativos e fluxo para necessidades não contempladas.
- Campos internos, limites por categoria, formatos e critérios de consistência da OPEN-007.2 não foram inventados.
- O perfil é criado sob demanda no primeiro acesso à tela/API. Não há operação de exclusão.
- A aprovação formal do layout permanece separada.

## Verificações

Por solicitação explícita, nenhum teste, lint, typecheck, build, geração Prisma, migração ou validação automatizada foi executado. Os testes automatizados serão adicionados, mas permanecem sem execução.
