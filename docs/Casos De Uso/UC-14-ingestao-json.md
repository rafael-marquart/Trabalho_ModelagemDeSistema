# UC-14 — Ingerir Dados em JSON

## Objetivo

Importar dados estruturados em formato JSON para alimentar o sistema com informações de vagas, perfis, regras ou integrações externas, permitindo processamento automatizado e atualização contínua do catálogo.

## Ator principal

- Administrador do sistema.

## Pré-condições

- O usuário deve estar autenticado com permissão de administração ou integração.
- O arquivo JSON deve estar no formato esperado pela aplicação.
- O sistema deve ter acesso ao endpoint, diretório ou origem do arquivo para leitura.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Inclusão (<<include>>): UC-13 (Calcular Match Determinístico).

## Fluxo Principal

1. O administrador acessa a funcionalidade de importação de dados em JSON.
2. O sistema solicita a seleção do arquivo ou a definição da origem do payload.
3. O administrador informa a origem, validação e categoria dos dados a serem ingeridos.
4. O sistema lê o conteúdo em JSON e valida a estrutura dos campos obrigatórios.
5. O sistema normaliza os dados, converte valores conforme as regras internas e registra a importação.
6. O sistema atualiza o catálogo ou as entidades relacionadas (vagas, perfis, regras, integrações).
7. O sistema exibe o resumo da importação com número de registros processados, válidos e rejeitados.

## Exceções e Fluxos Alternativos

- EX01 (JSON inválido): Se o arquivo não estiver em formato JSON válido, o sistema bloqueia a operação e informa o erro de parsing.
- EX02 (Campos obrigatórios ausentes): Se o payload não contiver campos essenciais, o sistema rejeita os registros afetados e registra a falha na auditoria.
- EX03 (Dados duplicados): Se o conteúdo importar registros já existentes, o sistema aplica a regra de deduplicação e reporta as entradas ignoradas.
- EX04 (Falha de integração externa): Se a origem externa estiver indisponível, o sistema registra a falha e informa ao administrador que a ingestão não foi concluída.

## Pós-condições

- Os dados importados ficam disponíveis para uso no sistema.
- Registros válidos são persistidos e integrados ao catálogo ou ao fluxo de negócio.
- Registros inválidos são rejeitados e registrados em log para rastreio.
- O administrador pode consultar o resultado final da importação.

## Regras de negócio relacionadas

- RB-10: Vagas externas — vagas importadas devem ser normalizadas antes da análise.
- RB-11: Validação da IA — dados extraídos por IA de vagas externas devem ser validados antes do uso.
- RB-12: Auditoria de importação — operações de ingestão devem manter registro do responsável, data e resultado.
- RB-13: Deduplicação — registros repetidos não devem gerar múltiplos cadastros redundantes.
- RB-14: Tratamento de erro — falhas na ingestão não devem comprometer dados válidos previamente cadastrados.

## Requisitos relacionados

- RF-36 — Importação em JSON (leitura, validação e persistência de dados estruturados).
- RF-37 — Normalização de dados externos.
- RF-38 — Registro de logs e auditoria para operação de ingestão.
- RF-39 — Tratamento de erros e relatórios de inconsistências.
- RF-40 — Controle de acesso para importação de dados.

## Critérios de aceitação

- O sistema aceita arquivos JSON com estrutura válida e persiste os dados corretamente.
- Registros com campos obrigatórios ausentes são rejeitados com identificação clara do problema.
- Registros duplicados não geram duplicidade no sistema final.
- O administrador visualiza um resumo do resultado da importação, incluindo falhas e itens processados.

---
