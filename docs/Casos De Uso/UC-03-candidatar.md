# UC-03 — Candidatar-se a Vaga

## Objetivo

Registrar a candidatura do candidato em uma vaga aberta que não tenha barreira crítica para ele.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- Vaga publicada por empresa na plataforma, aberta e dentro do prazo de inscrição.

## Fluxo Principal

1. O candidato abre o detalhe de uma vaga (UC-02) e vê a compatibilidade antes de decidir (RB-13).
2. O candidato aciona "Candidatar-me".
3. O sistema verifica, nesta ordem: se a vaga continua aberta e no prazo; se o candidato não tem candidatura ativa na mesma vaga (RB-14); e se a análise de compatibilidade (UC-13) não aponta barreira crítica (RB-02).
4. Com todas as verificações aprovadas, o sistema registra a candidatura na etapa `Inscrito` (mostrada ao candidato como "Inscrita"), com a data gerada pelo sistema e o resultado da compatibilidade daquele momento. Se o score não pôde ser calculado por falta de dados, a candidatura é registrada com o score vazio, sem presumir valor (RB-16).
5. Na mesma operação, o sistema grava o primeiro evento do histórico, o registro de auditoria e o aviso de confirmação ao candidato (UC-12).
6. O sistema confirma a candidatura ao candidato.

## Exceções

- EX01 (Candidatura ativa existente): o sistema recusa e informa a etapa da candidatura que já existe. Pedidos simultâneos são barrados também pelo banco de dados.
- EX02 (Vaga indisponível): vaga encerrada, fora do prazo ou que deixou de estar aberta durante o pedido é recusada com o motivo.
- EX03 (Barreira crítica): se a vaga declara não ter um recurso que o candidato marcou como indispensável, a candidatura é recusada, qualquer que seja o score.
- Em todas as recusas nada é gravado.

## Pós-condições

- Candidatura registrada na etapa `Inscrito`, com data, resultado de compatibilidade e score (ou score vazio).
- Histórico do funil iniciado e evento de auditoria registrado.
- Aviso de confirmação enviado ao candidato, na plataforma e por e-mail se ele não tiver desligado essa opção.

## Regras de negócio relacionadas

- RB-01 — Elegibilidade para candidatura.
- RB-02 — Trava de acessibilidade.
- RB-13 — Transparência antes da candidatura.
- RB-14 — Uma candidatura ativa por vaga.
- RB-16 — Dados de acessibilidade não informados.
- RB-36 — Cancelamento de candidatura.

## Requisitos relacionados

- RF-26 — Registro de candidatura.
- RF-28 — Gestão da candidatura pelo candidato.
- RF-27 — Notificações do processo seletivo.

## Critérios de aceitação

- A candidatura só é registrada em vaga aberta, no prazo e sem barreira crítica.
- Uma segunda candidatura ativa na mesma vaga é recusada.
- Falta de dados no perfil não impede a candidatura; o score fica vazio.
- Toda recusa explica o motivo e não grava nada.
- Vagas externas não aceitam candidatura pela plataforma.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-03-candidatar.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-03-candidatar.puml` (PlantUML).
