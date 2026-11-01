# SPEC-019 — Implementação de denúncias de incompatibilidade ou falsa inclusão

Implementada junto com a SPEC-020 (moderação); ver `docs/Implementacao/SPEC-020.md`.

## Escopo implementado

- **Quem denuncia (OPEN-074, revisada em 01/11/2026):** candidato autenticado que teve uma **entrevista concluída** (SPEC-018) numa candidatura àquela vaga — ou seja, participou do processo. Sem isso, o servidor recusa e a tela explica que a denúncia é liberada após a entrevista. Rascunho ou vaga inexistente: "Vaga não encontrada".
- **Onde:** "Denunciar esta vaga" aparece no detalhe da vaga e na seção Entrevista da candidatura, só para quem já tem entrevista concluída; abre `/candidato/vagas/[id]/denunciar`.
- **Campos (OPEN-075):** tipo da situação (possível incompatibilidade de acessibilidade ou possível falsa inclusão), descrição obrigatória (20 a 3000 caracteres), evidências opcionais em texto (links ou descrição; até 2000 caracteres) com aviso para **não** enviar laudo médico ou documento pessoal, e a marcação opcional "há risco à segurança ou à acessibilidade agora" (entra com prioridade alta na fila). Se o candidato avaliou uma entrevista desta vaga (SPEC-018), pode indicar que a denúncia é sobre ela; o servidor confere que a avaliação é dele e desta vaga.
- **Vínculos:** a denúncia fica ligada à vaga e, por ela, à Empresa responsável; o candidato não escolhe empresa (campo extra é recusado).
- **Antiabuso (OPEN-076):** até 3 denúncias por candidato em 24 horas (a quarta é recusada com mensagem clara e auditada) e no máximo uma denúncia em andamento por candidato e vaga (índice único no banco). Denúncias sobre outras vagas continuam permitidas dentro do limite.
- **Confirmação:** "Denúncia registrada", sem prometer decisão nem sanção; informa a meta de 5 dias úteis e que a empresa não recebe o nome do denunciante.
- **Minhas denúncias** (novo item do menu do candidato): lista e detalhe com o andamento em estados simples — Recebida, Em análise, Aguardando informações (com aviso de que pode demorar mais), Concluída — o resultado e a justificativa resumida, além do que o próprio candidato enviou. Nada da análise interna, do pedido à empresa ou da resposta dela (OPEN-077).
- **Sem efeito automático (RB-44):** registrar a denúncia não altera a vaga, avaliações nem nota.
- Auditoria: `REPORT_SUBMITTED` e `REPORT_REFUSED` (limite diário).

## Pontos em aberto

- **OPEN-097:** evidências só em texto (sem envio de arquivos).

## Arquivos principais

- `prisma/migrations/20261101210000_spec_019_020_reports/migration.sql`
- `src/lib/reports/{reporter-service,labels,business-days,http}.ts`
- `src/app/api/candidato/denuncias/...`, páginas `src/app/candidato/denuncias/...` e `src/app/candidato/vagas/[id]/denunciar/page.tsx`, `src/components/reports/report-form.tsx`

## Verificações

- Vitest: campos obrigatórios e opcionais, campo extra recusado, vínculo com vaga/empresa e com a própria avaliação, limite diário, uma denúncia em andamento por vaga, vaga invisível recusada, visão do denunciante sem dados internos; formulário (validação, confirmação, limite, axe-core).
- E2E: vaga sem entrevista concluída recusada, anônimo e empresa recusados, categoria obrigatória, empresa no corpo recusada, rascunho recusado, avaliação de outra pessoa recusada, registro com avaliação, segunda denúncia da mesma vaga recusada, vaga inalterada, quarta denúncia em 24 h recusada com mensagem, páginas.
- Teste manual: `docs/operacao/validacao-manual-spec-019-020.md`.
