# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

**Atualização de status:** REV-001, REV-003, REV-004, REV-006, REV-007 e REV-010 foram corrigidas e encerradas após aprovação do grupo. REV-005 foi retirada dos achados ativos porque a remoção das capacidades de acomodação já foi aprovada e aplicada. Permanecem ativos os pontos que exigem detalhamento adicional ou decisões funcionais, especialmente REV-002, REV-008 e REV-009.

- O mapa e o documento de detalhamento contêm **21 Specs**, com IDs e títulos correspondentes.
- O `OPEN.md` contém questões numeradas de OPEN-001 a OPEN-085 sem IDs duplicados detectados.
- Todas as RBs identificadas na baseline aparecem referenciadas em algum ponto de `Specs.md`; isso não garante, por si só, que cada regra esteja associada à Spec correta.
- **RF-34 e RF-35 não aparecem no detalhamento atual**, embora existam na baseline e sejam relevantes para SPEC-012 e SPEC-013.
- As SPEC-011 a SPEC-021 foram montadas com um padrão de comportamento relativamente genérico. Têm estrutura de 14 seções, mas precisam de revisão de profundidade e rastreabilidade antes de serem consideradas equivalentes às Specs mais detalhadas dos blocos anteriores.
- Foram encontrados pontos em que uma dependência, referência de caso de uso ou conteúdo de seção precisa ser corrigido ou confirmado.

## 3. Achados prioritários

### REV-001 — RF-34 e RF-35 ausentes do detalhamento

**Prioridade:** alta  
**Artefatos:** `docs/Requisitos/RF.md`, `docs/Specs.md`, SPEC-012 e SPEC-013.

RF-34 trata de cancelamento de candidatura e RF-35 de gestão do funil de seleção. Os dois requisitos não são citados no detalhamento atual.

**Correção aplicada:** RF-34 está associado à SPEC-012 e RF-35 à SPEC-013. A referência indevida a RF-34 na SPEC-011 foi removida, mantendo nessa Spec o RF-26 de registro de candidatura.

**Status: encerrado.** A rastreabilidade foi corrigida no detalhamento e a correção foi aprovada pelo grupo. Não é necessário criar Specs novas apenas por existirem esses RFs: as capacidades correspondentes já estão mapeadas.

### REV-002 — Detalhamento específico das Specs dos Blocos 4 a 6

**Prioridade:** alta  
**Artefato:** `docs/Specs.md`.

Essas Specs têm seções de comportamento, regras, contratos e testes, mas boa parte do comportamento esperado usa passos genéricos como “o ator autorizado acessa a capacidade” e “o sistema valida pré-condições”. Isso reduz a capacidade de derivar implementação e testes diretamente do texto.

**Correção parcial aplicada:** foram detalhados contratos conceituais e casos de teste específicos nas SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021. Foram explicitados cenários de candidatura duplicada e inelegível, cancelamento, transições do funil, consulta de histórico, falhas de notificação, elegibilidade/anonimato de avaliações, registro e moderação de denúncias e distribuição pública de estrelas. A SPEC-014 e a SPEC-015 permanecem fora de escopo.

**Status: em revisão.** A primeira rodada de detalhamento foi aplicada sem criar endpoints, fórmulas ou políticas não aprovadas. Para encerrar REV-002 ainda é necessária uma leitura humana dos fluxos, critérios, exceções e rastreabilidade em cada Spec do escopo, além da aprovação textual formal.

### REV-003 — Rastreabilidade de casos de uso está incompleta ou imprecisa em algumas Specs

**Prioridade:** alta  
**Artefatos:** `docs/Specs.md`, `docs/Casos De Uso/UC-geral.md`.

A baseline lista os seguintes casos de uso:
- UC-03 — Candidatar-se a Vaga;
- UC-05 — Acompanhar Funil de Candidaturas;
- UC-06 — Avaliar Pós-Entrevista;
- UC-09 — Gerenciar Funil de Seleção;
- UC-10 — Validar Requisitos da Seleção;
- UC-11 — Denunciar Vaga Incompatível;
- UC-12 — Status da Vaga;
- UC-13 — Calcular Match Determinístico;
- UC-14 — Ingerir Dados em JSON.

No detalhamento atual, SPEC-011 indica que o caso de uso específico precisa ser confirmado, embora UC-03 esteja listado na visão geral; SPEC-013 menciona a necessidade de confirmar o caso do Recrutador, embora UC-09 exista; SPEC-018 não explicita UC-06; SPEC-019 não explicita UC-11; SPEC-006 deve ser conferida com UC-14. Também é preciso distinguir UC-05 (acompanhamento pelo candidato) de UC-09 (gestão do funil pelo Recrutador).

**Correção aplicada:** o detalhamento aponta UC-03 na SPEC-011, UC-05 na SPEC-012, UC-09 na SPEC-013, UC-06 na SPEC-018, UC-11 na SPEC-019 e UC-14 na SPEC-006. A SPEC-020 distingue a análise administrativa como fluxo de moderação, sem criar ator de empresa-administradora.

**Status: encerrado.** Os vínculos de rastreabilidade foram corrigidos e aprovados pelo grupo. O encerramento se refere à correção documental registrada neste achado; novas divergências encontradas em revisões futuras podem ser registradas separadamente.

### REV-004 — Seção 3.1 mistura finalidade de layout e questões em aberto

**Prioridade:** média  
**Artefato:** `docs/Specs.md`, especialmente SPEC-011 a SPEC-021.

Em algumas Specs, a seção “Telas e evidência de layout” contém texto de questões em aberto em vez de listar áreas/telas ou declarar que layout não se aplica. Exemplo encontrado em SPEC-011: “Elegibilidade; duplicidade; estado inicial; caso de uso específico precisa ser confirmado.” Essa frase aparece com pontuação duplicada ao ser seguida pelo texto padrão de layout.

**Correção aplicada:** as áreas/telas estão separadas em tabela com finalidade e estado de layout; as questões em aberto permanecem em seção própria, referenciadas por IDs OPEN. As finalidades das áreas das SPEC-011 a SPEC-021 foram ajustadas para indicar o papel da área no fluxo.

**Status: encerrado.** A separação entre finalidade das áreas, questões em aberto e estado de layout foi aplicada e aprovada pelo grupo. A aprovação visual dos protótipos continua sendo um gate separado da aprovação textual das Specs.

### REV-006 — Requisitos transversais precisam ser associados às operações pertinentes, não apenas listados

**Prioridade:** média  
**Artefatos:** SPEC-003, SPEC-008 a SPEC-021 e RNF.

Os RNFs de acessibilidade, privacidade, segurança, integridade, desempenho e auditoria são transversais. A presença de uma referência geral em uma Spec não demonstra como ela será verificada no comportamento específico.

**Correção aplicada:** foram acrescentadas verificações observáveis nos critérios de aceitação das Specs operacionais selecionadas, incluindo autorização por perfil, privacidade, integridade, rastreabilidade, navegação por teclado e tratamento de falhas, conforme aplicabilidade.

**Status: encerrado.** Os critérios observáveis aplicáveis foram acrescentados e aprovados pelo grupo, sem inventar métricas numéricas. Procedimentos ou métricas que não existam na baseline continuam sujeitos a decisão própria, caso sejam necessários.

### REV-007 — Separação entre Administrador da plataforma e Empresa

**Prioridade:** alta, como invariante de domínio  
**Artefatos:** SPEC-001, SPEC-020, `docs/OPEN.md`, modelo conceitual.

A decisão consolidada estabelece que Administrador é papel da plataforma, utilizado para moderação; não existe Administrador associado à Empresa. A SPEC-020 já explicita isso. É necessário verificar que as demais Specs não usem “administrador da empresa” nem sugiram que a Empresa recebe o papel ADMINISTRADOR. A gestão dos próprios Recrutadores permanece com a conta Empresa conforme RF-17/RB-46/UC-07.

**Correção aplicada:** a SPEC-001 explicita que Administrador é perfil da plataforma e que Empresa não pode administrar vínculos de outra organização; a SPEC-020 limita a moderação ao Administrador da plataforma. Uma busca no detalhamento atual não encontrou a expressão “administrador da empresa”.

**Status: encerrado.** A distinção entre Administrador da plataforma e Empresa foi explicitada nas Specs e aprovada pelo grupo. O achado não permanece aberto; qualquer ocorrência divergente encontrada em outro artefato pode ser registrada como novo achado específico.

### REV-008 — Fórmula e semântica da nota pública continuam em aberto

**Prioridade:** alta para aprovação funcional, sem bloquear o restante da revisão  
**Artefatos:** SPEC-018 a SPEC-021, RF-13, RB-19, RB-20, RB-25 e RB-45.

Decisões recebidas do grupo: a apresentação pública usa estrelas e exibe a frequência de cada quantidade de estrelas; uma avaliação válida é suficiente para exibir a distribuição; sem avaliações válidas, não exibe nota e informa dados insuficientes; nenhuma alteração ocorre antes de decisão de moderação registrada.

**Atualização aplicada:** SPEC-021 e OPEN-082 a OPEN-084 foram ajustadas para refletir as decisões de apresentação. OPEN-085 permanece aberta porque ainda falta definir quais efeitos uma decisão de moderação pode autorizar. Assim, REV-008 fica parcialmente resolvida e permanece aberta somente quanto aos efeitos da moderação e eventuais detalhes de validade ainda não definidos.

### REV-009 — Cálculo de compatibilidade: consistência entre score, trava e dados ausentes

**Prioridade:** alta  
**Artefatos:** SPEC-007 a SPEC-010, RF-07 a RF-10, RF-24/RF-25, RB-02 a RB-07, RB-15/RB-16/RB-30.

O princípio está consistente: a trava crítica precede o score; dados de acessibilidade ausentes não significam compatibilidade; a SPEC-008 consome a SPEC-007 e a SPEC-010 apresenta o resultado. Permanecem pendentes a fórmula detalhada, os dados mínimos e a apresentação de resultados com perfil incompleto.

**Status: mantido em aberto por decisão do grupo.** Não foram alteradas as regras de compatibilidade nem as OPEN-031 a OPEN-046. A próxima revisão deve decidir esses pontos sem duplicar o cálculo na busca ou na tela de detalhe.

### REV-010 — Cabeçalho e registro de revisão precisam refletir o documento completo

**Prioridade:** baixa  
**Artefato:** `docs/Specs.md`.

O cabeçalho ainda descreve o documento como detalhamento do “Bloco 1 — Acesso e perfis”, embora o escopo listado no controle já seja SPEC-001 a SPEC-021.

**Correção aplicada:** o cabeçalho de Specs.md já descreve o documento como detalhamento dos Blocos 1 a 6 e o controle do documento inclui estado de texto e layout por bloco para SPEC-001 a SPEC-021.

**Status: encerrado.** O cabeçalho e o controle do documento foram atualizados e aprovados pelo grupo.

## 4. Verificações que passaram

- Os IDs SPEC-001 a SPEC-021 aparecem tanto no mapa quanto no documento de detalhamento.
- Os títulos das Specs no mapa correspondem aos títulos do documento de detalhamento.
- Os IDs OPEN-001 a OPEN-085 não apresentam duplicidade detectada.
- O `OPEN.md` contém seções para os seis blocos.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 5. Plano recomendado de correção

1. Revisar o detalhamento das SPEC-011 a SPEC-021 para eliminar comportamentos genéricos e garantir critérios específicos e testáveis (REV-002).
2. Decidir a semântica da nota pública de acessibilidade e responder às OPEN-082 a OPEN-085 (REV-008).
3. Decidir a fórmula, os dados mínimos e o tratamento de perfis incompletos no cálculo de compatibilidade, respondendo às OPEN-031 a OPEN-046 (REV-009).
4. Revisar coletivamente as demais questões OPEN ainda pertinentes, sem marcá-las como resolvidas antes de uma decisão explícita.
5. Manter a aprovação textual separada da aprovação dos layouts. Implementação somente após as aprovações aplicáveis.

## 6. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.
