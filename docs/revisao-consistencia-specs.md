# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

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

**Ajuste recomendado:**
- incluir RF-34 na rastreabilidade da SPEC-012;
- incluir RF-35 na rastreabilidade da SPEC-013;
- confirmar se seus critérios e fluxos estão completamente representados nessas Specs.

Não é necessário criar Specs novas apenas por existirem esses RFs: as capacidades correspondentes já estão mapeadas.

### REV-002 — SPEC-011 a SPEC-021 precisam de detalhamento específico maior

**Prioridade:** alta  
**Artefato:** `docs/Specs.md`.

Essas Specs têm seções de comportamento, regras, contratos e testes, mas boa parte do comportamento esperado usa passos genéricos como “o ator autorizado acessa a capacidade” e “o sistema valida pré-condições”. Isso reduz a capacidade de derivar implementação e testes diretamente do texto.

**Ajuste recomendado:** revisar cada uma para descrever fluxos próprios, exceções, pré/pós-condições, dados de entrada/saída e critérios verificáveis com referências explícitas à baseline. A revisão deve começar pelas SPEC-011 a SPEC-017, que definem o fluxo operacional de candidatura, funil e acomodação.

### REV-003 — Rastreabilidade de casos de uso está incompleta ou imprecisa em algumas Specs

**Prioridade:** alta  
**Artefatos:** `docs/Specs.md`, `docs/Casos De Uso/UC-geral.md`.

A baseline lista os seguintes casos de uso:
- UC-03 — Candidatar-se a Vaga;
- UC-04 — Solicitar Acomodação no Processo Seletivo;
- UC-05 — Acompanhar Funil de Candidaturas;
- UC-06 — Avaliar Pós-Entrevista;
- UC-09 — Gerenciar Funil de Seleção;
- UC-10 — Validar Requisitos da Seleção;
- UC-11 — Denunciar Vaga Incompatível;
- UC-12 — Status da Vaga;
- UC-13 — Calcular Match Determinístico;
- UC-14 — Ingerir Dados em JSON.

No detalhamento atual, SPEC-011 indica que o caso de uso específico precisa ser confirmado, embora UC-03 esteja listado na visão geral; SPEC-013 menciona a necessidade de confirmar o caso do Recrutador, embora UC-09 exista; SPEC-014 não explicita UC-04; SPEC-018 não explicita UC-06; SPEC-019 não explicita UC-11; SPEC-006 deve ser conferida com UC-14. Também é preciso distinguir UC-05 (acompanhamento pelo candidato) de UC-09 (gestão do funil pelo Recrutador).

**Ajuste recomendado:** substituir referências provisórias pelas referências exatas após ler cada arquivo individual de caso de uso e verificar seus fluxos e exceções. Não atribuir conteúdo a um UC apenas pelo título.

### REV-004 — Seção 3.1 mistura finalidade de layout e questões em aberto

**Prioridade:** média  
**Artefato:** `docs/Specs.md`, especialmente SPEC-011 a SPEC-021.

Em algumas Specs, a seção “Telas e evidência de layout” contém texto de questões em aberto em vez de listar áreas/telas ou declarar que layout não se aplica. Exemplo encontrado em SPEC-011: “Elegibilidade; duplicidade; estado inicial; caso de uso específico precisa ser confirmado.” Essa frase aparece com pontuação duplicada ao ser seguida pelo texto padrão de layout.

**Ajuste recomendado:** separar claramente:
- as telas/áreas e o que cada uma precisa demonstrar;
- o estado do layout (pendente/aprovado/não se aplica);
- as questões, referenciadas apenas pelos IDs OPEN.

### REV-005 — Dependências e rastreabilidade das capacidades de acomodação

**Prioridade:** média  
**Artefatos:** SPEC-014, SPEC-015 e SPEC-016.

SPEC-014 descreve solicitação de acomodação; SPEC-015 descreve análise/decisão; SPEC-016 acompanha o resultado. O encadeamento geral faz sentido, mas é necessário verificar cada UC individual e os atributos do modelo conceitual para confirmar estados, dados obrigatórios, edição e histórico. Não tratar “estado inicial”, “justificativa” ou transições como definidos se só estiverem descritos genericamente.

**Ajuste recomendado:** validar UC-04, UC-05, RF-29, RF-32, RF-33 e as entidades SOLICITACAO_ACOMODACAO/CANDIDATURA. Manter os detalhes não definidos como OPEN.

### REV-006 — Requisitos transversais precisam ser associados às operações pertinentes, não apenas listados

**Prioridade:** média  
**Artefatos:** SPEC-003, SPEC-008 a SPEC-021 e RNF.

Os RNFs de acessibilidade, privacidade, segurança, integridade, desempenho e auditoria são transversais. A presença de uma referência geral em uma Spec não demonstra como ela será verificada no comportamento específico.

**Ajuste recomendado:** nos critérios de aceitação, associar os RNFs relevantes a verificações observáveis — por exemplo, navegação por teclado nas telas, autorização no acesso a dados, integridade após falha e rastreabilidade de mudança. Não inventar métricas numéricas onde a baseline não define limites.

### REV-007 — Separação entre Administrador da plataforma e Empresa

**Prioridade:** alta, como invariante de domínio  
**Artefatos:** SPEC-001, SPEC-020, `docs/OPEN.md`, modelo conceitual.

A decisão consolidada estabelece que Administrador é papel da plataforma, utilizado para moderação; não existe Administrador associado à Empresa. A SPEC-020 já explicita isso. É necessário verificar que as demais Specs não usem “administrador da empresa” nem sugiram que a Empresa recebe o papel ADMINISTRADOR. A gestão dos próprios Recrutadores permanece com a conta Empresa conforme RF-17/RB-46/UC-07.

**Ajuste recomendado:** manter essa regra como invariante e procurar ocorrências em todos os artefatos antes da aprovação.

### REV-008 — Fórmula e semântica da nota pública continuam em aberto

**Prioridade:** alta para aprovação funcional, sem bloquear o restante da revisão  
**Artefatos:** SPEC-018 a SPEC-021, RF-13, RB-19, RB-20, RB-25 e RB-45.

A baseline sustenta que a nota deve usar dados válidos registrados, preservar anonimato público e não mudar automaticamente por uma denúncia não analisada. Ela não sustenta uma fórmula detalhada ou a quantidade mínima de avaliações.

**Ajuste recomendado:** manter OPEN-082 a OPEN-085 abertas até decisão do grupo; não definir pesos, limites ou efeitos por inferência.

### REV-009 — Cálculo de compatibilidade: consistência entre score, trava e dados ausentes

**Prioridade:** alta  
**Artefatos:** SPEC-007 a SPEC-010, RF-07 a RF-10, RF-24/RF-25, RB-02 a RB-07, RB-15/RB-16/RB-30.

O princípio está consistente: a trava crítica precede o score; dados de acessibilidade ausentes não significam compatibilidade; a SPEC-008 consome a SPEC-007 e a SPEC-010 apresenta o resultado. Permanecem pendentes a fórmula detalhada, os dados mínimos e a apresentação de resultados com perfil incompleto.

**Ajuste recomendado:** preservar essa separação de responsabilidades e resolver OPEN-031 a OPEN-046 com o grupo, sem duplicar o cálculo na busca ou na tela de detalhe.

### REV-010 — Cabeçalho e registro de revisão precisam refletir o documento completo

**Prioridade:** baixa  
**Artefato:** `docs/Specs.md`.

O cabeçalho ainda descreve o documento como detalhamento do “Bloco 1 — Acesso e perfis”, embora o escopo listado no controle já seja SPEC-001 a SPEC-021.

**Ajuste recomendado:** atualizar a descrição inicial para “documento de detalhamento das Specs do AcessaVagas, organizado nos Blocos 1 a 6” e incluir uma tabela consolidada com estado de texto e layout para todas as 21 Specs.

## 4. Verificações que passaram

- Os IDs SPEC-001 a SPEC-021 aparecem tanto no mapa quanto no documento de detalhamento.
- Os títulos das Specs no mapa correspondem aos títulos do documento de detalhamento.
- Os IDs OPEN-001 a OPEN-085 não apresentam duplicidade detectada.
- O `OPEN.md` contém seções para os seis blocos.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 5. Plano recomendado de correção

1. Corrigir a rastreabilidade de RF-34/RF-35 e a descrição inicial do documento.
2. Conferir os casos de uso UC-03, UC-04, UC-05, UC-06, UC-09, UC-11 e UC-14 diretamente nos arquivos individuais.
3. Tornar as SPEC-011 a SPEC-021 específicas e testáveis, eliminando texto genérico e corrigindo as seções de layout.
4. Conferir cada regra de negócio e RNF por operação, incluindo permissões, privacidade, falhas e auditoria.
5. Revisar dependências cruzadas e estados após as correções.
6. Levar OPENs à revisão coletiva, sem marcar como resolvidas antes de uma decisão explícita.
7. Solicitar aprovação humana do texto; depois tratar os layouts como gate separado. Implementação somente após as aprovações aplicáveis.

## 6. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.
