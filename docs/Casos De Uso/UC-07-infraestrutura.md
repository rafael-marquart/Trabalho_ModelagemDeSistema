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

- RB-08
- RB-20
- RB-27
- RB-37

## Requisitos relacionados

- RF-17
- RF-18
- RF-38

## Critérios de aceitação

- Recrutador consegue preencher e salvar o mapeamento por unidade.
- Itens obrigatórios bloqueiam o salvamento quando pendentes.
- Evidências anexadas são armazenadas com metadados e vinculadas ao mapeamento.
- Mapeamentos podem ser importados entre filiais e recebem registro de autoria.

---

## Observação

Posso criar este arquivo em `docs/casos-de-uso/UC-05-07-funil-infra.md` no repositório e abrir um pull request caso deseje revisão antes do merge.