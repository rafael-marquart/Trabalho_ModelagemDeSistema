# UC-09 — Gerenciar Funil de Seleção

## Objetivo

Permitir que a Empresa ou um Recrutador vinculado acompanhe as candidaturas de uma vaga, mova cada uma pelas etapas do funil, registre entrevistas e mantenha o processo auditável.

## Atores principais

- Empresa (vagas da própria conta).
- Recrutador com vínculo ativo com a Empresa.

## Pré-condições

- Ator autenticado, com conta ativa, gerenciando uma vaga da própria Empresa.
- A vaga tem ao menos uma candidatura. A vaga pode estar aberta, pausada ou encerrada: encerrar a vaga não impede continuar o processo com quem já se candidatou.

## Relação com outros casos de uso

- UC-05 é o lado do candidato: ele vê as etapas que este caso de uso altera.
- UC-06 e UC-11 dependem de uma entrevista marcada aqui como concluída.

## Fluxo Principal

1. O ator abre a vaga e acessa "Candidaturas".
2. O sistema lista as candidaturas agrupadas por etapa: Inscrito, Triagem, Entrevista, Finalista, Contratado, Recusada e Cancelada.
3. O ator abre uma candidatura. O sistema mostra apenas o necessário para o processo (OPEN-055): nome, e-mail, foto (se houver), perfil profissional, resumo da compatibilidade, necessidades funcionais e recursos indispensáveis declarados, e o histórico do funil. Nunca mostra comprovantes, CPF, descrições livres de acessibilidade nem informação médica (RB-26).
4. O ator escolhe a próxima etapa e, se quiser, escreve uma observação interna.
5. O sistema confere que a mudança está prevista (RB-39), que a etapa ainda é a mesma que o ator viu e que não há pendência impeditiva conhecida.
6. O sistema grava a nova etapa, o evento no histórico (etapa anterior e nova, data e hora, autor, tipo de decisão e observação) e o registro de auditoria, numa única operação, e avisa o candidato (UC-12).

## Transições permitidas (RB-39)

| De | Para |
|---|---|
| Inscrito | Triagem |
| Triagem | Entrevista ou Recusada |
| Entrevista | Finalista ou Recusada |
| Finalista | Contratado ou Recusada |
| Contratado, Recusada, Cancelada | nenhuma (estados finais) |

Não há volta de etapa. O cancelamento é feito só pelo candidato (UC-05).

## Fluxo Alternativo — Entrevistas

1. Com a candidatura na etapa Entrevista, o ator agenda uma entrevista: data e hora futuras, modalidade (presencial ou on-line), local ou link (`https://` no on-line) e os recursos de acessibilidade que serão oferecidos.
2. Só pode haver uma entrevista agendada por vez. Enquanto agendada, ela pode ser alterada ou cancelada; o candidato é avisado de cada mudança.
3. Depois do horário, o ator marca a entrevista como concluída. Isso libera a avaliação (UC-06) e a denúncia (UC-11) para o candidato.

## Exceções e Fluxos Alternativos

- EX01 (Transição não prevista): o sistema recusa, explica de qual etapa para qual não é possível mover e nada muda.
- EX02 (Mudança simultânea): se outra pessoa mudou a etapa antes, o sistema recusa e pede para atualizar a página.
- EX03 (Pendência impeditiva): a regra existe, mas nenhuma pendência foi definida até agora (OPEN-092); quando houver, a mudança será recusada sem alterar a etapa.
- EX04 (Candidatura de outra empresa): é tratada como inexistente.
- EX05 (Entrevista inválida): agendar fora da etapa Entrevista, em data passada, com outra já agendada, ou concluir antes do horário é recusado com o motivo.

## Pós-condições

- Etapa atualizada, com histórico e auditoria preservados (o banco não permite alterar nem apagar o histórico).
- Candidato avisado na plataforma e, se não tiver desligado, por e-mail.

## Regras de negócio relacionadas

- RB-12 — Controle de acesso.
- RB-23 — Transparência de status.
- RB-26 — Confidencialidade das informações de acessibilidade.
- RB-27 — Histórico de alterações.
- RB-37 — Registro das decisões.
- RB-38 — Estados do funil.
- RB-39 — Transições válidas do funil.
- RB-41 — Auditoria das alterações.
- RB-42 — Vaga encerrada.
- RB-43 — Validação para avanço no processo.

## Requisitos relacionados

- RF-20 — Gestão de candidaturas pela empresa.
- RF-30 — Gestão de candidatos no processo seletivo.
- RF-35 — Gestão do funil de seleção.
- RF-27 — Notificações do processo seletivo.
- RF-38 — Auditoria de operações.
- RF-40 — Controle de acesso às operações administrativas.

## Critérios de aceitação

- O ator vê só as candidaturas das vagas da própria Empresa.
- Só as transições da tabela são aceitas; qualquer outra é recusada sem mudar a etapa.
- Cada mudança fica no histórico com etapa anterior e nova, data, autor e tipo de decisão.
- O candidato é avisado de cada mudança de etapa e de cada agendamento, alteração ou cancelamento de entrevista.
- A Empresa não vê comprovantes, CPF nem informação médica do candidato.
- Entrevista só é marcada como concluída depois do horário marcado.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-09-gerenciar-funil.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-09-gerenciar-funil.puml` (PlantUML).
