# UC-07 — Cadastrar Infraestrutura da Empresa

## Objetivo

Mapear e declarar os recursos físicos, digitais, tecnológicos e organizacionais de acessibilidade presentes na empresa.

## Ator principal

- Recrutador / RH.

## Pré-condições

- Recrutador autenticado e vinculado a um perfil corporativo cadastrado.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): FA01 (Importar por Filial), FA02 (Anexar Evidências/Fotos).

## Fluxo Principal

1. O recrutador acessa "Perfil da Empresa" -> "Mapeamento de Infraestrutura".
2. O recrutador preenche o questionário estruturado sobre a presença de rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas.
3. O sistema valida as informações e grava o vetor de infraestrutura da empresa no banco de dados.

## Exceções e Fluxos Alternativos

- FA01 (Importar Mapeamento por Filial): O recrutador clona as configurações de acessibilidade de uma unidade existente para cadastrar uma nova sede.
- FA02 (Anexar Evidências/Fotos): O recrutador anexa fotos/evidências que serão validadas internamente.
- EX01 (Alerta de Campos Obrigatórios Pendentes): O sistema impede o salvamento caso os itens de infraestrutura básica não sejam respondidos.

## Pós-condições

- Vetor de infraestrutura da empresa persistido e disponível para uso pelo motor de compatibilidade e para exibição nas vagas.
- Evidências anexadas vinculadas ao perfil da filial/unidade.

## Regras de negócio relacionadas

- RB-50: Evidência obrigatória — determinados itens (por ex., existência de acessos físicos básicos) podem exigir evidências quando marcados como presentes.
- RB-51: Importação por filial — permitir reutilização de mapeamentos entre filiais com registro de autoria e data.
- RB-52: Validação por auditoria — dados de infraestrutura podem ser auditados por equipe interna ou parceiros terceiros para garantir veracidade.
- RB-53: Publicação de informações — informações básicas de acessibilidade devem ser exibidas nas páginas de vaga; detalhes sensíveis ficam restritos.
- RB-54: Atualização periódica — empresas são solicitadas a revisar mapeamentos a cada período (ex.: 12 meses).

## Requisitos relacionados

- RF-40 — Formulário de mapeamento de infraestrutura (campos padronizados por categoria e unidade).
- RF-41 — Upload de evidências (armazenamento seguro de imagens/documentos com metadados).
- RF-42 — Gestão de filiais/unidades (associação de mapeamentos a localidades específicas).
- RF-43 — Auditoria e verificação (ferramentas para marcar verificado/pendente por equipe de auditoria).
- RF-44 — Exposição pública (campos que aparecem na visualização da vaga e no perfil da empresa).
- RF-45 — Histórico de mudanças (registro de alterações com usuário e timestamp).

## Critérios de aceitação

- Recrutador consegue preencher e salvar o mapeamento por unidade.
- Itens obrigatórios bloqueiam o salvamento quando pendentes.
- Evidências anexadas são armazenadas com metadados e vinculadas ao mapeamento.
- Mapeamentos podem ser importados entre filiais e recebem registro de autoria.

---

## Observação

Posso criar este arquivo em `docs/casos-de-uso/UC-05-07-funil-infra.md` no repositório e abrir um pull request caso deseje revisão antes do merge.