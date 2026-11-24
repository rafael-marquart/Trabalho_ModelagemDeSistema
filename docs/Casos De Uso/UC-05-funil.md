# UC-05 — Acompanhar Candidaturas

## Objetivo

Permitir que o candidato consulte as próprias candidaturas, acompanhe a etapa e o histórico de cada uma, veja as entrevistas marcadas e cancele uma candidatura dentro das regras.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- Existe ao menos uma candidatura do próprio candidato.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-12 (Status da vaga).
- Extensão (<<extend>>): UC-06 (Avaliar pós-entrevista), quando houver entrevista concluída.
- Extensão (<<extend>>): UC-11 (Denunciar incompatibilidade), quando houver entrevista concluída.

## Fluxo Principal

1. O candidato acessa "Minhas candidaturas".
2. O sistema lista as candidaturas com a vaga, a empresa, a data e a etapa atual, com os rótulos do candidato: Inscrita, Em triagem, Em entrevista, Finalista, Aprovada, Recusada ou Cancelada.
3. O candidato abre uma candidatura.
4. O sistema mostra o status da vaga (UC-12), o resultado de compatibilidade registrado na candidatura, as entrevistas marcadas (data, modalidade, local ou link e recursos de acessibilidade) e a linha do tempo.
5. A linha do tempo mostra, do mais recente para o mais antigo, os eventos "Candidatura realizada", "Status: <etapa>" e "Candidatura cancelada", com data, descrição curta e etapa resultante. Não mostra quem moveu a candidatura nem observações internas da Empresa.

## Fluxo Alternativo — Cancelar candidatura

1. O candidato aciona "Cancelar candidatura" e confirma.
2. O sistema verifica se a candidatura está ativa (Inscrita, Em triagem, Em entrevista ou Finalista). Se a vaga estiver encerrada, o cancelamento só é aceito até Em entrevista.
3. O sistema grava o cancelamento e o evento no histórico na mesma operação e avisa o responsável pela vaga (o Recrutador que a criou, se ainda vinculado, ou a conta da Empresa).

## Exceções e Fluxos Alternativos

- EX01 (Cancelamento recusado): candidatura Aprovada, Recusada ou já cancelada, ou Finalista em vaga encerrada, não pode ser cancelada; o sistema explica o motivo e nada muda.
- EX02 (Prazo de exibição): candidatura cancelada ou de vaga encerrada continua visível por 60 dias a partir do cancelamento ou do encerramento (o que vier primeiro); depois sai da lista. Os registros de auditoria seguem a retenção própria (RNF-08).
- EX03 (Ocultar da lista): o candidato pode tirar da lista uma candidatura Recusada ou Cancelada. Nada é apagado.
- EX04 (Candidatura de outra pessoa): pedir uma candidatura que não é do candidato tem a mesma resposta de uma que não existe.

## Pós-condições

- O candidato vê a etapa atual e o histórico das suas candidaturas.
- Um cancelamento aceito fica registrado no histórico, que é preservado.

## Regras de negócio relacionadas

- RB-23 — Transparência de status.
- RB-27 — Histórico de alterações.
- RB-36 — Cancelamento de candidatura.
- RB-38 — Estados do funil.
- RB-39 — Transições válidas do funil.
- RB-41 — Auditoria das alterações.
- RB-42 — Vaga encerrada.

## Requisitos relacionados

- RF-11 — Minhas candidaturas.
- RF-28 — Gestão da candidatura pelo candidato.
- RF-27 — Notificações do processo seletivo.
- RF-31 — Acompanhamento do processo seletivo.
- RF-34 — Cancelamento de candidatura.

## Escopo

O candidato consulta, acompanha, cancela e oculta as próprias candidaturas. Editar uma candidatura enviada, apagá-la ou mudar a etapa não faz parte deste caso de uso (a etapa é mudada pela Empresa no UC-09).

## Critérios de aceitação

- O candidato vê apenas as próprias candidaturas, com a etapa atual.
- A linha do tempo segue a ordem do mais recente para o mais antigo e não expõe dados internos.
- Candidatura ativa pode ser cancelada após confirmação; em vaga encerrada, só até Em entrevista.
- Cancelamento recusado não altera a candidatura.
- Cancelamento aceito preserva o histórico e avisa o responsável pela vaga.
- Candidaturas canceladas ou de vagas encerradas somem da lista após 60 dias.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-05-funil.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-05-funil.puml` (PlantUML).
