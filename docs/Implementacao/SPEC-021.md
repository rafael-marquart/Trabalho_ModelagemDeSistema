# SPEC-021 — Implementação da nota pública de acessibilidade

## Escopo implementado

- **Distribuição por estrelas, sem média (OPEN-082):** para cada critério da avaliação pós-entrevista (Acessibilidade e Postura inclusiva), a tela mostra quantas avaliações deram 5, 4, 3, 2 e 1 estrela, com barras proporcionais e o número escrito ("2 avaliações"). Não há média, peso nem nota única.
- **Por empresa:** a distribuição soma todas as avaliações válidas da empresa, em qualquer vaga. Aparece no detalhe de cada vaga para o candidato (seção "Avaliações de candidatos") e na página inicial da empresa, que vê a própria nota exatamente como os candidatos.
- **Suficiência (OPEN-083/084):** uma avaliação válida já mostra a distribuição. Sem nenhuma, a tela diz "Ainda não há dados suficientes" e explica que isso não indica acessibilidade boa nem ruim.
- **Anonimato (RNF-08/09):** a tela pública mostra apenas contagens; nunca nome, identificadores, datas ou comentários. Avaliação inválida (fora do prazo, duplicada, de entrevista não concluída ou de outra pessoa) nunca é gravada (SPEC-018), então não entra na distribuição.
- **Sem alteração administrativa (OPEN-085):** não existe operação para editar avaliações ou a distribuição; denúncias pendentes ou decididas não mudam a nota (SPEC-019/020). O banco recusa qualquer edição das notas (gatilho da SPEC-018).
- **Rastreabilidade:** cada nova avaliação grava, na mesma transação, o evento de auditoria `PUBLIC_RATING_UPDATED` com o total e as contagens por estrela da empresa (só números).
- **Retenção de 1 ano (T-021-08):** a rotina `npm run evaluations:retention -- --execute` agora também reduz a data de envio ao ano (1º de janeiro), além de apagar comentário e vínculos com candidato, candidatura e entrevista. O gatilho do banco só aceita essa mudança de data dentro da anonimização. A linha anonimizada (empresa, notas, ano) continua contando na distribuição.

## Pontos em aberto

- **OPEN-098 (nova):** com uma única avaliação válida (OPEN-083), a distribuição mostra exatamente as estrelas dadas, e quem sabe quem fez entrevista com a empresa pode deduzir a avaliação. A implementação reduz o risco (soma por empresa, sem datas nem comentários, ano apenas após 1 ano), mas a tensão com T-021-09 precisa de decisão do responsável.

## Arquivos principais

- `src/lib/public-rating/service.ts`, `src/components/public-rating.tsx`
- `src/lib/jobs/detail-service.ts`, `src/app/candidato/vagas/[id]/page.tsx`, `src/app/empresa/page.tsx`
- `src/lib/evaluations/service.ts` (auditoria `PUBLIC_RATING_UPDATED`)
- `scripts/evaluation-retention.mjs`, migração `20261101230000_spec_021_evaluation_anonymization`

## Verificações

- Vitest: sem avaliações → dados insuficientes; uma avaliação → distribuição; componente acessível (listas com rótulos, sem média nem nomes); detalhe da vaga com e sem dados; auditoria com contagens e sem o comentário; anonimização com data reduzida ao ano.
- E2E: depois da avaliação da SPEC-018 e da decisão de moderação da SPEC-020, o detalhe da vaga mostra "1 avaliação" sem identificadores; a empresa vê a mesma nota; auditoria `PUBLIC_RATING_UPDATED` com as contagens; o banco recusa mudar a data fora da anonimização; após anonimizar, a avaliação continua contando.
- Teste manual: `docs/operacao/validacao-manual-spec-021.md`.
