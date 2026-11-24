# UC-10 — Validar Requisitos da Seleção

> **Situação nesta versão:** fora do escopo. Nenhuma Spec detalha este caso de uso e ele não está implementado. A parte que existe no código está no UC-09: a mudança de etapa passa por uma verificação de "pendências impeditivas conhecidas" (RB-43), mas nenhum tipo de pendência foi definido até agora (OPEN-092), então hoje nenhuma mudança é barrada por esse motivo. O texto abaixo registra a intenção original, para uma versão futura.

## Objetivo

Permitir que a Empresa ou o Recrutador confira, antes de avançar uma candidatura, se os requisitos exigidos para a etapa foram atendidos, e peça complementação ao candidato quando faltar algo.

## Atores principais

- Empresa e Recrutador vinculado.

## Pré-condições

- Ator autenticado, gerenciando uma vaga da própria Empresa.
- A candidatura está em andamento.

## Pontos de Inclusão e Extensão

- Seria incluído por UC-09 (Gerenciar funil de seleção) no momento de mudar a etapa.

## Fluxo Principal (previsto)

1. O ator abre a candidatura e vê os requisitos definidos para a etapa.
2. O sistema indica pendências ou inconsistências conhecidas.
3. O ator avança, pede complementação ou recusa a candidatura.
4. O sistema registra a decisão e avisa o candidato.

## Exceções e Fluxos Alternativos (previstos)

- EX01 (Requisitos incompletos): o sistema pede a complementação e mantém a etapa.
- EX02 (Informação inválida): o sistema identifica o problema e informa o que corrigir.

## O que falta para implementar

- Definir os tipos de pendência por etapa (OPEN-092).
- Definir como o candidato recebe e responde um pedido de complementação.
- Escrever a Spec correspondente.

## Regras de negócio relacionadas

- RB-27 — Histórico de alterações.
- RB-39 — Transições válidas do funil.
- RB-41 — Auditoria das alterações.
- RB-43 — Validação para avanço no processo.

## Requisitos relacionados

- RF-30 — Gestão de candidatos no processo seletivo.
- RF-35 — Gestão do funil de seleção.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-10-validacao.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-10-validacao.puml` (PlantUML).
