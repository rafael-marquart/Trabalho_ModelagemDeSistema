# SPEC-016 — Implementação do acompanhamento da candidatura

Implementada junto com a SPEC-012, nas mesmas telas (Minhas candidaturas e detalhe); ver `docs/Implementacao/SPEC-012.md`.

## Escopo implementado

- **Painel de acompanhamento:** Minhas candidaturas mostra a etapa atual de cada candidatura própria e a vaga correspondente; candidaturas de vagas encerradas são sinalizadas ("Vaga encerrada").
- **Linha do tempo (OPEN-051):** gerada a partir dos eventos persistidos do funil (SPEC-013), sem criar eventos. Tipos exibidos: "Candidatura realizada", "Status: …" e "Candidatura cancelada"; cada evento mostra data (sem horário), descrição curta e "Etapa resultante". Ordem: do mais recente para o mais antigo. Não são exibidos quem moveu a candidatura nem as observações internas do recrutador. Sem eventos, a tela informa que não há histórico.
- **Nomes das etapas para o candidato:** Inscrita, Em triagem, Em entrevista, Finalista, Aprovada (Contratado), Recusada e Cancelada — os mesmos estados oficiais, escritos sobre "a candidatura".
- **Estado atual × histórico:** a situação atual fica no quadro do topo; o encerramento da vaga aparece ali ("A vaga foi encerrada pela empresa em …") sem reescrever eventos anteriores. Vaga pausada também é informada.
- **60 dias (OPEN-065):** após o cancelamento ou o encerramento da vaga (o que ocorrer primeiro), a tela informa até quando o histórico fica disponível; depois disso a candidatura deixa de aparecer na lista e o detalhe responde como inexistente. Os registros e a auditoria não são apagados.
- O fluxo é só de consulta: nenhuma operação desta Spec altera etapa ou decisão.

## Verificações

- As mesmas da SPEC-012 (testes de lista, detalhe, linha do tempo, regra dos 60 dias e E2E).
- Teste manual: `docs/operacao/validacao-manual-spec-012-016.md`.
- Teste manual executado pelo responsável em 01/11/2026 sem problemas; layout aprovado na mesma data. SPEC-016 encerrada.
