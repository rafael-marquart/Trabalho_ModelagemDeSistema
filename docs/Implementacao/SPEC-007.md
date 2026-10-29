# SPEC-007 — Implementação do cálculo de compatibilidade

## Escopo implementado

- Motor determinístico puro (`src/lib/compatibility/engine.ts`), testável sem banco nem rede (RNF-15). Mesmas entradas e mesma versão de regras (`SPEC-007/1`) produzem o mesmo resultado (RNF-10).
- Ordem do cálculo: (1) trava crítica; (2) dados mínimos; (3) score S = 0,50·A + 0,30·T + 0,20·D; arredondamento somente no score final, meio ponto para cima.
- **Trava crítica (RB-02/RB-15, RB-06):** o candidato marca no perfil quais necessidades do catálogo são "indispensáveis para mim" (decisão de 29/10/2026); também vale a marcação "obrigatória" do catálogo feita pelo ADMIN (SPEC-002). Necessidade indispensável cujo item correspondente da vaga está "Ausente" torna a vaga incompatível, sem score e sem consulta de rota.
- **Dados insuficientes (RB-16):** ausência de dado nunca vira zero nem compatibilidade; a análise informa dimensões avaliadas e dados faltantes e não apresenta score completo.
- **A (acessibilidade):** mapa fixo entre necessidades do catálogo e os seis itens da vaga: A01→rampas, A02→elevadores, A04→banheiros adaptados, A06→sinalização, T01→leitores de tela. Presente = 100; Ausente (não obrigatória) = 0; Não informado = dado insuficiente. Demais necessidades não têm item correspondente na vaga e aparecem como "não avaliáveis".
- **T (perfil técnico):** critérios definidos pelo recrutador no editor da vaga (competências, experiência, escolaridade mínima, idiomas com nível). Pesos internos 40/30/20/10 normalizados entre os critérios aplicáveis. Formação em andamento vale 0.
- **D (deslocamento e modalidade):** 60% modalidade (atende = 100, parcial = 50, não atende = 0) e 40% faixa de tempo de viagem (≤30 min = 100, ≤60 = 75, ≤90 = 50, >90 = 25); vaga remota ignora deslocamento. Meio de transporte do perfil, com sobrescrita por análise.
- **Rotas (HERE, plano gratuito, OPEN-088):** `src/lib/compatibility/travel.ts` isola a integração atrás de uma porta (`TravelEstimator`): geocodificação + Routing v8 (a pé, bicicleta, carro) e Transit v8 (ônibus, metrô/trem). Duração padrão, sem plano alternativo; falha, cota (429) ou ausência de chave resultam em dados insuficientes. A chave nunca aparece em respostas, histórico ou logs.
- **Limite de segurança da HERE (decisão de 29/10/2026):** cada requisição é contada por mês (UTC) e serviço na tabela `HereUsage`. Ao atingir 60% da cota gratuita (geocodificação 30.000; rotas 5.000; transporte público 5.000 — valores da página de preços da conta), o serviço fica bloqueado até o mês seguinte e o deslocamento aparece como dados insuficientes. Ajustável por `HERE_QUOTA_PERCENT` e `HERE_LIMIT_<SERVIÇO>`; `npm run here:usage` mostra o uso. Conta apenas as chamadas desta instalação.
- Endereço localizado só pela cidade é recusado (dados insuficientes, indicando se é do candidato ou da vaga).
- **Histórico:** tabela `CompatibilityResult`, imutável (gatilho do banco recusa UPDATE), com retenção de 1 ano (`npm run compatibility:retention`, simulação por padrão; `-- --execute` apaga). O instantâneo guarda dados mínimos, sem endereços.
- Critérios técnicos na vaga: coluna `Job.technicalCriteria`, editor da vaga (seção "Critérios técnicos (opcional)"). Não são exigidos para publicar.
- API: `GET/POST /api/candidato/compatibilidade` (somente candidato, origem verificada, corpo estrito); `GET /api/candidato/vagas` provisório (a SPEC-008 substitui). Apenas vagas publicadas e dentro do prazo.
- Tela provisória de validação: `/candidato/compatibilidade`. A apresentação definitiva é da SPEC-010.

## Decisões desta implementação (aprovadas em 29/10/2026 — OPEN-090)

1. Dimensão sem nenhum critério aplicável (candidato declarou "sem necessidades" para A; vaga sem critérios técnicos para T) é excluída e os pesos restantes são normalizados proporcionalmente; isso aparece nos fatores.
2. Candidato com declaração "não informada" torna A insuficiente.
3. Mapa fixo entre necessidades e itens da vaga (acima); as demais ficam "não avaliáveis".
4. Validação de localização de vaga externa (item 6 do comportamento, LLM) e SPEC-006 ficam para depois; a integração com LLM não é usada.
5. Endpoints e modos de transporte HERE seguem a documentação conhecida e devem ser conferidos na documentação vigente.

## Arquivos principais

- `prisma/schema.prisma`, `prisma/migrations/20261028120000_spec_007_compatibility/migration.sql`
- `src/lib/compatibility/{constants,types,text,engine,travel,service}.ts`
- `src/lib/jobs/criteria.ts`, `src/app/api/candidato/{compatibilidade,vagas}`, `src/app/candidato/compatibilidade`
- `scripts/{compatibility-retention,purge-compatibility-results}.mjs`

## Verificações

- Vitest: motor (trava, insuficiência, pesos, arredondamento, bandas), adaptador HERE (falhas, chave oculta), serviço, API, critérios, retenção. ESLint e `tsc --noEmit` limpos.
- E2E (`scripts/auth-e2e.mjs`) usa um HERE simulado local: score completo, sobrescrita de transporte, imutabilidade, falha do provedor, trava crítica sem chamada de rota.
- Teste manual: `docs/operacao/validacao-manual-spec-007.md`.
- Teste manual executado pelo responsável em 29/10/2026 com a HERE real; ajustes aplicados durante o teste. Layout da tela provisória e da opção "Indispensável para mim" aprovado na mesma data.
- SPEC-007 encerrada em 29/10/2026, exceto os critérios de vaga externa (SPEC-006 e validação de localização), que permanecem abertos.
