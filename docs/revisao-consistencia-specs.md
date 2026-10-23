# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

**Status atual:** REV-009, REV-011 e REV-013 permanecem encerradas. OPEN-088 foi resolvida: HERE Routing API no plano gratuito aprovado, duração padrão da rota sem ajuste por horário/trânsito em tempo real e tratamento de falhas/dados ausentes conforme OPEN-033. OPEN-089, OPEN-086 e OPEN-087 também estão resolvidas conforme `docs/OPEN.md`. REV-002 foi encerrada após aprovação humana do detalhamento aplicado. REV-008 foi encerrada após a decisão de que a administração da plataforma atua sobre denúncias, sem alterar diretamente as avaliações ou a distribuição pública de estrelas. A REV-014 registra a revisão de consistência atual, correções documentais e lacunas de cobertura que não foram resolvidas por inferência.

- O mapa e o documento de detalhamento cobrem as Specs ativas do escopo: SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021. SPEC-014 e SPEC-015 foram removidas e não devem ser contadas como Specs vigentes; os IDs posteriores foram preservados.
- A conferência atual de `OPEN.md` identificou 84 entradas de questões com IDs únicos, todas resolvidas. Há lacunas históricas na sequência, portanto não se deve afirmar que a numeração é contínua. O estado está consolidado na seção 4.
- Todas as RBs identificadas na baseline aparecem referenciadas em algum ponto de `Specs.md`; isso não garante, por si só, que cada regra esteja associada à Spec correta.
- RF-34 e RF-35 estão associados, respectivamente, à SPEC-012 e à SPEC-013.
- O detalhamento de contratos e testes das SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021 foi ampliado e aprovado pelo grupo (REV-002 encerrada).
- Nesta rodada, foram corrigidos o texto do mapa que sugeria ausência de pendências, a orientação para tratar referências às Specs removidas e as afirmações de escopo/contagem neste relatório. As correções são documentais e não alteram decisões funcionais.

## REV-011 — Encerrada: validação de localização externa e consistência estrutural

**Escopo:** OPEN-089, SPEC-007, SPEC-008, SPEC-016, mapa de Specs e cadastro de OPENs.

**Decisão registrada:** OPEN-089 foi encerrada. O local de trabalho de vaga externa só pode ser confirmado por anúncio oficial da vaga ou página oficial que identifique inequivocamente a unidade/local. Adzuna permanece fonte de origem do anúncio; não foi escolhido provedor/API adicional de pesquisa ou geocodificação. Divergência, falta de evidência ou indisponibilidade de fonte oficial impedem consulta de rota e seguem OPEN-033 quando a localização for necessária.

**Correções documentais aplicadas em `docs/Specs.md`:**
- corrigida a numeração duplicada dos itens de comportamento na SPEC-008 e SPEC-016;
- corrigida a dependência da SPEC-016, removendo a referência operacional a SPEC-014/015, substituídas por SPEC-011 a SPEC-013;
- refletida a resolução da OPEN-089 na SPEC-007 e removido seu bloqueio de implementação. A SPEC-007 não tem mais bloqueio por OPEN-088.

**Verificações:** 19 Specs ativas correspondem aos 19 IDs do mapa; 84 entradas OPEN têm IDs únicos; não foram encontradas referências a OPENs inexistentes em `Specs.md`. A OPEN-088 foi resolvida nesta atualização; não há questões parcialmente resolvidas no cadastro. A auditoria estrutural não substitui aprovação funcional geral, revisão de cada requisito contra a baseline nem aprovação dos layouts.

---

## 3. Achados prioritários

### REV-009 — Encerrada: cálculo de compatibilidade entre candidato e vaga

**Prioridade:** alta  
**Artefatos:** SPEC-007 a SPEC-010, RF-07 a RF-10, RF-24/RF-25, RB-02 a RB-07, RB-15/RB-16/RB-30.

**Por que esta revisão é importante:** o resultado de compatibilidade influencia o que o candidato vê na busca, como interpreta uma vaga e se pode prosseguir para a candidatura. Uma regra ambígua pode apresentar um resultado enganoso ou permitir que uma incompatibilidade crítica seja escondida por uma pontuação alta. Por isso, essa decisão afeta diretamente o funcionamento central do site e não deve ser preenchida por suposição.

**Princípios já estabelecidos e que devem ser preservados:**
- A trava crítica de acessibilidade prevalece sobre qualquer score numérico.
- Dados de acessibilidade ausentes não significam compatibilidade; ausência de informação não pode ser tratada como confirmação positiva nem, sem evidência, como incompatibilidade comprovada.
- O cálculo deve ter uma única fonte de verdade na SPEC-007. A SPEC-008 usa o resultado para busca/filtros e a SPEC-010 apresenta o resultado ao candidato; nenhuma delas deve criar uma fórmula paralela.

**Decisões já consolidadas:** OPEN-031 a OPEN-046 estão resolvidas e devem ser refletidas de forma consistente nas Specs. A regra posterior aprovada na OPEN-088 substitui a distância em quilômetros por tempo estimado de deslocamento para vagas presenciais/híbridas e exclui o deslocamento para vagas totalmente remotas. **Pendência funcional remanescente:** OPEN-088, que ainda precisa definir método/provedor/endpoints e tratamento de falhas/dados ausentes e de horário/trânsito. Não escolher provedor ou método por inferência

**Encerramento:** as decisões consolidadas nas OPEN-031 a OPEN-046 foram consideradas refletidas nas Specs, incluindo a trava crítica, tratamento de dados ausentes e fonte única do cálculo na SPEC-007. A regra posterior aprovada na OPEN-088 substitui distância em quilômetros por tempo estimado de deslocamento, com pesos, faixas e meios de transporte já definidos; SPEC-008/SPEC-010 consomem esse resultado. OPEN-088 permanece parcialmente resolvida quanto ao método/provedor/endpoints e às regras para falhas/dados ausentes e horário/trânsito. A revisão documental REV-009 está encerrada; isso não equivale à aprovação geral das Specs nem autoriza implementação.

## 4. Estado atual das pendências OPEN

Conforme o cadastro atualizado de `docs/OPEN.md`:

- **Abertas:** nenhuma.
- **Parcialmente resolvidas:** nenhuma.
- **Resolvidas:** 84 entradas, incluindo OPEN-086, OPEN-087, OPEN-088 e OPEN-089.

OPEN-088 foi encerrada com HERE Routing API no plano gratuito aprovado, duração padrão sem ajuste por horário/trânsito em tempo real e falhas/ausência de rota tratadas como dados insuficientes conforme OPEN-033. A implementação de SPEC-007, SPEC-008 e SPEC-010 não está mais bloqueada por OPEN-088.

As decisões das OPEN-075 a OPEN-085 foram refletidas nas Specs correspondentes, incluindo denúncia, moderação e nota pública (SPEC-019 a SPEC-021). A revisão de consistência documental, por si só, não altera estados funcionais. Não marcar questões como resolvidas sem decisão explícita e atualização dos artefatos correspondentes.

## 5. Verificações que passaram

- As Specs ativas listadas no escopo (SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021) aparecem no mapa e no documento de detalhamento; SPEC-014 e SPEC-015 estão excluídas do escopo.
- Os títulos das Specs no mapa correspondem aos títulos do documento de detalhamento.
- As 84 entradas de cadastro de questões em `OPEN.md` têm IDs únicos; a sequência inclui OPEN-086 a OPEN-089 e preserva lacunas históricas.
- O `OPEN.md` contém seções organizadas por área funcional.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 6. Plano recomendado de correção

1. Registrar OPEN-088 como resolvida e remover o bloqueio de implementação por essa questão; preservar as decisões de OPEN-031 a OPEN-046 e OPEN-089.
2. Preservar a aprovação textual separada da aprovação dos layouts. Implementação somente após as aprovações aplicáveis.

## 7. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.

---

**Nota de rodapé — decisões já tomadas:** os achados REV-001, REV-002, REV-003, REV-004, REV-006, REV-007, REV-008 e REV-010 foram encerrados após correções ou decisões aprovadas pelo grupo. REV-001, REV-003, REV-004, REV-006, REV-007 e REV-010 foram removidos do corpo principal; REV-002 e REV-008 permanecem descritos acima apenas como registro de encerramento. REV-011 foi encerrada nesta revisão e está descrita acima. Os registros históricos também podem ser consultados no histórico do Git.


## REV-012 — Encerrada: resolução da OPEN-088 e liberação de implementação

**Decisão registrada:** OPEN-088 foi marcada como resolvida. A estimativa de deslocamento usa HERE Routing API no escopo do plano gratuito aprovado, com duração padrão da rota e sem ajuste por horário de partida ou trânsito em tempo real. Falha, limite do plano, meio não suportado ou ausência de rota não gera fallback por distância ou destino presumido; quando o deslocamento for necessário, aplicar OPEN-033 e sinalizar dados insuficientes, sem score final completo.

**Efeito:** removido o bloqueio de implementação por OPEN-088 para SPEC-007, SPEC-008 e SPEC-010. Permanecem válidos os limites do plano gratuito, a exigência de revisar termos/limites antes de uso real ou produção e a aprovação visual separada dos layouts. Endpoint/versão e mapeamento técnico dos meios ficam como detalhes de implementação a confirmar na documentação vigente do HERE


## REV-013 — Encerrada: atualização da validação de endereço de vagas externas (OPEN-089)

**Aprovação:** o grupo aprovou a revisão da OPEN-089 para permitir uma busca alternativa de endereço quando o anúncio do Adzuna não trouxer endereço concreto.

**Regra consolidada refletida em `docs/OPEN.md` e `docs/Specs.md` (SPEC-007, seção 6.3):**
- Primeiro analisar campos e descrição do Adzuna para identificar endereço concreto e validar sua correspondência com a empresa e a cidade/local anunciados.
- Se não houver endereço concreto, executar verificação assistida por LLM com pesquisa na internet pelo nome da empresa e cidade da vaga. O LLM auxilia a localizar e avaliar evidências; sua resposta isolada não confirma endereço.
- Usar no cálculo somente endereço `CONFIRMADO` com evidência suficiente de correspondência. Sede ou filial genérica não comprova automaticamente o local da vaga; divergência ou falta de evidência impede consulta de rota e segue OPEN-033.
- Para vagas totalmente remotas, não buscar endereço nem calcular deslocamento.

**Rastreabilidade:** esta atualização substitui a restrição anterior registrada na REV-011 de exigir apenas endereço específico publicado em fonte oficial e de não adotar pesquisa adicional. A decisão não altera pesos ou fórmulas da OPEN-088, nem cria fallback para destino presumido. A OPEN-089 permanece resolvida com o fluxo atualizado; SPEC-008 e SPEC-010 consomem o resultado da SPEC-007, sem duplicar a validação.

## REV-014 — Revisão transversal de consistência das Specs

**Escopo:** `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md`, requisitos RF/RB/RNF, modelo conceitual, estados do funil e decisões relacionadas. A revisão foi realizada após as decisões de OPEN-088 e OPEN-089.

### Verificações estruturais
- As 19 Specs vigentes (SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021) aparecem tanto em `Specs.md` quanto em `mapa-specs.md`, com títulos correspondentes. SPEC-014 e SPEC-015 permanecem removidas do escopo.
- Os RFs e RBs citados em `Specs.md` existem na baseline. RF-23 e RB-35 são exceções intencionais: foram removidos por duplicidade e não devem ser restaurados.
- As 84 entradas de OPEN no cadastro estão marcadas como resolvidas. Há lacunas históricas de numeração; isso não significa pendências abertas.

### Correções documentais aplicadas
1. SPEC-007, SPEC-008 e SPEC-010 tinham metadados de implementação ainda bloqueados por OPEN-088, apesar da decisão consolidada e do quadro final de liberação. Os estados foram alinhados para “aprovada; pronta para implementação”, mantendo a aprovação de layout separada.
2. A seção 6.3 e o resumo de questões da SPEC-007 continham versões antigas da OPEN-089 (exigência exclusiva de fonte oficial e ausência de pesquisa alternativa) e da OPEN-088 (método ainda pendente). Foram alinhados ao fluxo aprovado: Adzuna primeiro; busca assistida por LLM/internet se faltar endereço; só endereço confirmado para vagas presenciais/híbridas; vagas remotas dispensam endereço/rota; HERE Routing API e regras de falha conforme OPEN-088.
3. A SPEC-006 descrevia coleta diária como execução ativa, em tensão com OPEN-086, que limita a etapa atual a testes. O texto agora distingue capacidade-alvo futura de coleta diária autorizada do lote atual de até 25 chamadas, sem ativar produção/armazenamento contínuo antes de autorização documentada.

### Lacunas identificadas — não resolvidas por inferência
- **Cobertura de RNFs:** RNF-06 (disponibilidade), RNF-11 (escalabilidade) e RNF-12 (manutenibilidade) existem na baseline, mas não aparecem nas referências de RNF de `Specs.md` nem no mapa. É necessário decidir e registrar sua cobertura transversal (por exemplo, em quais Specs/artefatos e critérios verificáveis), sem criar requisitos numéricos não aprovados.
- **Nomenclatura do estado inicial da candidatura:** `OPEN-049`, `SPEC-011`, `SPEC-012`, `UC-03` e o modelo conceitual usam `Inscrita`; `estados-trilha.md` e `SPEC-013` usam `Inscrito` para o mesmo início do funil. A decisão deve definir um nome canônico para o estado de domínio e, se necessário, separar explicitamente o valor interno da legenda de interface.
- **Cancelamento e protótipo:** o cancelamento da candidatura permanece previsto em RF-28/RF-34, OPEN-050 e SPEC-012/UC-05. A anotação em `Identidade Visual/Prototipos.md` diz que o botão de cancelar não deve aparecer naquela tela e que o ajuste visual de “Cancelada” para cinza/“Recusada” para vermelho ainda está pendente no Figma. Isso é uma decisão de apresentação localizada, não uma remoção automática da capacidade de cancelar; o protótipo precisa ser atualizado/aprovado separadamente e a legenda “Recusada” deve ser distinguida do estado de domínio `Recusado`, se essa for a intenção.

**Resultado:** corrigidas as contradições documentais claras sobre OPEN-088/089 e o escopo atual de ingestão. As três lacunas acima permanecem registradas para decisão/aprovação; nenhuma fórmula, regra funcional ou layout foi inventado nesta revisão