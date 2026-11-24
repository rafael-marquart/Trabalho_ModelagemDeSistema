# UC-11 — Denunciar Vaga Incompatível

## Objetivo

Permitir que o candidato que participou do processo seletivo de uma vaga denuncie uma possível incompatibilidade de acessibilidade ou uma possível falsa inclusão, e que o Administrador analise e decida a denúncia, com a participação da Empresa quando necessário.

## Atores

- Candidato PcD (autor da denúncia).
- Administrador (analisa e decide).
- Empresa e Recrutador vinculado (respondem a pedidos de informação e veem a decisão).

## Pré-condições

- Candidato autenticado com uma **entrevista concluída** numa candidatura dele para a vaga (decisão de 01/11/2026, revisando a OPEN-074).
- Não existe denúncia em aberto do mesmo candidato para a mesma vaga.

## Pontos de Inclusão e Extensão

- Estende UC-05 (Acompanhar candidaturas) e o detalhe da vaga (UC-02): a opção "Denunciar" aparece quando a pré-condição é atendida.
- Relação com UC-06: a denúncia pode apontar uma avaliação do próprio candidato para essa vaga.

## Fluxo Principal

1. O candidato aciona "Denunciar" na vaga.
2. O candidato escolhe a categoria: "Possível incompatibilidade de acessibilidade" ou "Possível falsa inclusão".
3. O candidato descreve a situação (de 20 a 3000 caracteres) e, se quiser, informa evidências em texto (links ou descrição, até 2000 caracteres), aponta uma avaliação sua dessa vaga e marca que há risco para ele. O sistema não pede laudo nem documento pessoal.
4. O sistema confere a pré-condição, o limite de 3 denúncias em 24 horas e a avaliação apontada (precisa ser do próprio candidato e desta vaga).
5. O sistema registra a denúncia como "Recebida", vinculada à vaga e, por meio dela, à Empresa, com prazo de referência de 5 dias úteis, e confirma ao candidato.
6. O Administrador vê a fila de denúncias abertas (as de alta prioridade primeiro), abre uma e muda o status para "Em análise".
7. Se precisar, o Administrador pede informações à Empresa (status "Aguardando informações"). A Empresa ou o Recrutador responde na própria área, sem nunca ver a identidade do candidato.
8. O Administrador registra a decisão: Procedente, Parcialmente procedente, Improcedente ou Inconclusiva, com um resumo para o candidato, a justificativa completa e as medidas para a Empresa. A denúncia passa a "Concluída".
9. Candidato e Empresa são avisados de cada mudança relevante.

## Exceções e Fluxos Alternativos

- EX01 (Sem entrevista concluída): a opção não é oferecida e o pedido direto é recusado.
- EX02 (Dados inválidos): descrição curta demais, texto longo demais ou categoria ausente é recusado com o motivo.
- EX03 (Limite): a partir da 3ª denúncia em 24 horas, novas são recusadas até o fim do período.
- EX04 (Denúncia em aberto): se já houver denúncia em aberto do candidato para a vaga, o sistema recusa e mostra o status da existente.
- EX05 (Prorrogação): o Administrador pode prorrogar o prazo de 5 dias úteis registrando o motivo.
- EX06 (Prioridade): o Administrador pode subir ou baixar a prioridade; a mudança fica no histórico.

## Pós-condições

- Denúncia registrada com histórico completo, sem possibilidade de alteração do histórico.
- A denúncia, sozinha, não altera a vaga nem a nota pública da Empresa (UC-06); as medidas da decisão são aplicadas pelas regras próprias.

## Regras de negócio relacionadas

- RB-12 — Controle de acesso.
- RB-24 — Proteção contra abuso.
- RB-25 — Apuração de denúncias.
- RB-37 — Registro das decisões.
- RB-44 — Análise administrativa de denúncias.
- RB-45 — Decisão sobre denúncia.

## Requisitos relacionados

- RF-14 — Denúncia de incompatibilidade.
- RF-22 — Moderação e gestão de denúncias.
- RF-38 — Auditoria de operações.
- RF-39 — Tratamento de erros e inconsistências.

## Critérios de aceitação

- Só candidato com entrevista concluída na vaga consegue denunciar.
- Categoria e descrição são obrigatórias; evidência e avaliação vinculada são opcionais.
- O limite de 3 denúncias em 24 horas e de uma denúncia aberta por vaga é respeitado.
- O candidato acompanha o status: Recebida, Em análise, Aguardando informações e Concluída.
- A Empresa nunca vê nome, e-mail ou identificação de quem denunciou.
- A decisão fica registrada com autor, data, justificativa e medidas.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-11-denuncia.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-11-denuncia.puml` (PlantUML).
