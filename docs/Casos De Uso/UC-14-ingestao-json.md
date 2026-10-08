# UC-14 — Ingerir Dados em JSON

## Objetivo
Importar dados estruturados de fontes autorizadas, especialmente vagas externas, com validação, normalização, deduplicação e rastreabilidade.

## Ator principal
- Administrador do sistema.

## Fluxo Principal
1. Administrador inicia a importação.
2. Sistema recebe e valida o JSON.
3. Sistema identifica registros inválidos, incompletos ou duplicados.
4. Sistema normaliza registros válidos.
5. Dados extraídos por LLM passam pela validação antes do uso.
6. Sistema registra origem e resultado da importação.
7. Sistema persiste registros válidos sem comprometer dados válidos existentes.


## Regras de negócio relacionadas
- RB-10
- RB-11
- RB-17
- RB-18
- RB-31
- RB-32
- RB-33
- RB-37
- RB-41

## Requisitos relacionados
- RF-05
- RF-36
- RF-37
- RF-38
- RF-39
- RF-40

## Critérios de aceitação
- JSON válido é processado conforme modelo suportado.
- Registros inválidos não comprometem registros válidos.
- Duplicados não geram duplicidade.
- Dados de LLM somente são usados após validação.
- Origem e resultado ficam registrados.
