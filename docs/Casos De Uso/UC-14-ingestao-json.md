# UC-14 — Coletar e Ingerir Vagas Externas

## Objetivo
Coletar automaticamente vagas de fontes externas autorizadas, inicialmente pela API do Adzuna, e processá-las com validação, eventual enriquecimento por LLM, normalização, deduplicação e rastreabilidade.

## Ator principal
- Sistema (processo automatizado agendado).

## Atores secundários
- Provedor externo de vagas (inicialmente Adzuna).
- Provedor de LLM, quando necessário e disponível.
- Administrador da plataforma, somente para configuração ou acompanhamento caso exista interface para essas operações; não inicia cada execução diária.

## Pré-condições
- A fonte está autorizada e sua configuração de acesso está disponível de forma protegida.
- Existe uma lista configurável de frases de busca.
- O uso da fonte respeita os limites e as condições de uso aplicáveis.

## Fluxo Principal
1. A tarefa agendada inicia a coleta diária automaticamente.
2. O sistema consulta individualmente a API para cada frase configurada, usando `what_phrase`.
3. O sistema valida a estrutura das respostas e registra a fonte, a frase consultada e o resultado da consulta.
4. O sistema identifica registros inválidos, incompletos ou potencialmente duplicados.
5. Para dados incompletos ou que precisem de extração/normalização, o sistema tenta complementar os dados do anúncio com LLM.
6. O sistema valida os dados extraídos antes de utilizá-los e distingue dados originais, dados extraídos e informações não informadas.
7. O sistema normaliza os registros que cumprirem os critérios definidos e aplica a deduplicação conforme a política aprovada.
8. O sistema registra a origem e o resultado do processamento.
9. O sistema persiste e disponibiliza apenas vagas que cumpram os critérios de validação e exibição, sem comprometer registros válidos existentes.


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
- As consultas diárias são executadas automaticamente, sem início manual por Administrador.
- Cada frase configurada gera uma consulta rastreável por meio de `what_phrase`.
- As respostas da API são validadas conforme o formato suportado.
- Registros inválidos não comprometem registros válidos.
- Duplicados não geram duplicidade.
- Dados de LLM somente são usados após validação.
- A origem, a frase de busca e o resultado ficam registrados.
- Dados extraídos por LLM só são usados após validação; ausência de informação sobre acessibilidade permanece como “não informado” quando aplicável.
