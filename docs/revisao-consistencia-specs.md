# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

**Status atual:** permanecem neste relatório apenas os pontos que ainda exigem revisão ou decisão: REV-002, REV-008 e REV-009. Os achados encerrados foram removidos do corpo principal; suas decisões ficam registradas em nota de rodapé documental ao final do relatório.

- O mapa e o documento de detalhamento preservam os IDs SPEC-001 a SPEC-021; SPEC-014 e SPEC-015 foram removidas do escopo, sem renumerar as posteriores.
- O `OPEN.md` contém questões numeradas de OPEN-001 a OPEN-085 sem IDs duplicados detectados.
- Todas as RBs identificadas na baseline aparecem referenciadas em algum ponto de `Specs.md`; isso não garante, por si só, que cada regra esteja associada à Spec correta.
- RF-34 e RF-35 estão associados, respectivamente, à SPEC-012 e à SPEC-013.
- O detalhamento de contratos e testes das SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021 foi ampliado; REV-002 aguarda revisão humana final dos fluxos, exceções, rastreabilidade e critérios.
- Foram encontrados pontos em que uma dependência, referência de caso de uso ou conteúdo de seção precisa ser corrigido ou confirmado.

## 3. Achados prioritários

### REV-002 — Detalhamento específico das Specs dos Blocos 4 a 6

**Prioridade:** alta  
**Artefato:** `docs/Specs.md`.

Essas Specs têm seções de comportamento, regras, contratos e testes, mas boa parte do comportamento esperado usa passos genéricos como “o ator autorizado acessa a capacidade” e “o sistema valida pré-condições”. Isso reduz a capacidade de derivar implementação e testes diretamente do texto.

**Correção parcial aplicada:** foram detalhados contratos conceituais e casos de teste específicos nas SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021. Foram explicitados cenários de candidatura duplicada e inelegível, cancelamento, transições do funil, consulta de histórico, falhas de notificação, elegibilidade/anonimato de avaliações, registro e moderação de denúncias e distribuição pública de estrelas. A SPEC-014 e a SPEC-015 permanecem fora de escopo.

**Status: em revisão.** A primeira rodada de detalhamento foi aplicada sem criar endpoints, fórmulas ou políticas não aprovadas. Para encerrar REV-002 ainda é necessária uma leitura humana dos fluxos, critérios, exceções e rastreabilidade em cada Spec do escopo, além da aprovação textual formal.

### REV-008 — Efeitos de moderação sobre a nota pública ainda precisam de definição

**Prioridade:** alta para aprovação funcional, sem bloquear o restante da revisão  
**Artefatos:** SPEC-018 a SPEC-021, RF-13, RB-19, RB-20, RB-25 e RB-45.

Decisões recebidas do grupo: a apresentação pública usa estrelas e exibe a frequência de cada quantidade de estrelas; uma avaliação válida é suficiente para exibir a distribuição; sem avaliações válidas, não exibe nota e informa dados insuficientes; nenhuma alteração ocorre antes de decisão de moderação registrada.

**Atualização aplicada:** SPEC-021 e OPEN-082 a OPEN-084 foram ajustadas para refletir as decisões de apresentação. **Único ponto pendente:** OPEN-085 — definir quais efeitos uma decisão de moderação registrada pode autorizar sobre a nota e os dados publicados. Até essa decisão, não se deve presumir remoção de avaliações, recálculo, suspensão ou qualquer outra consequência.

### REV-009 — Definir com precisão o cálculo de compatibilidade entre candidato e vaga

**Prioridade:** alta  
**Artefatos:** SPEC-007 a SPEC-010, RF-07 a RF-10, RF-24/RF-25, RB-02 a RB-07, RB-15/RB-16/RB-30.

**Por que esta revisão é importante:** o resultado de compatibilidade influencia o que o candidato vê na busca, como interpreta uma vaga e se pode prosseguir para a candidatura. Uma regra ambígua pode apresentar um resultado enganoso ou permitir que uma incompatibilidade crítica seja escondida por uma pontuação alta. Por isso, essa decisão afeta diretamente o funcionamento central do site e não deve ser preenchida por suposição.

**Princípios já estabelecidos e que devem ser preservados:**
- A trava crítica de acessibilidade prevalece sobre qualquer score numérico.
- Dados de acessibilidade ausentes não significam compatibilidade; ausência de informação não pode ser tratada como confirmação positiva nem, sem evidência, como incompatibilidade comprovada.
- O cálculo deve ter uma única fonte de verdade na SPEC-007. A SPEC-008 usa o resultado para busca/filtros e a SPEC-010 apresenta o resultado ao candidato; nenhuma delas deve criar uma fórmula paralela.

**O que ainda falta decidir (OPEN-031 a OPEN-046):**
1. **Como calcular o score:** subpontuações, normalização e arredondamento.
2. **Quais dados são obrigatórios:** campos mínimos por dimensão e o que fazer quando faltarem localização, modalidade ou informações de acessibilidade.
3. **Como representar resultados incompletos:** se o score final deve ser omitido ou se pode existir um resultado parcial claramente identificado; como explicar ao candidato o que falta.
4. **Como explicar a compatibilidade:** quais critérios/fatores serão apresentados, sem expor dados privados.
5. **Como tornar o resultado reproduzível:** quais parâmetros e versão da regra devem ser registrados, respeitando privacidade e retenção.
6. **Questões associadas à experiência de descoberta:** OPEN-036 a OPEN-039 tratam de filtros, busca textual, paginação/ordenação e alertas/buscas salvas; OPEN-040 a OPEN-042 tratam de status/transições e comunicação de encerramento da vaga; OPEN-043 e OPEN-045 tratam dos campos do detalhe e da apresentação de dados ausentes.

**Status: mantido em aberto por decisão do grupo.** Não foram alteradas as regras de compatibilidade nem as OPEN-031 a OPEN-046. Para fechar esta revisão, o grupo precisa aprovar as regras acima ou apontar decisões já existentes na baseline que respondam a cada questão. Até lá, manter os princípios estabelecidos, não inventar pesos, limiares ou políticas e não iniciar implementação de comportamentos ainda indefinidos.

## 4. Verificações que passaram

- Os IDs SPEC-001 a SPEC-021 aparecem tanto no mapa quanto no documento de detalhamento.
- Os títulos das Specs no mapa correspondem aos títulos do documento de detalhamento.
- Os IDs OPEN-001 a OPEN-085 não apresentam duplicidade detectada.
- O `OPEN.md` contém seções para os seis blocos.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 5. Plano recomendado de correção

1. Concluir a leitura humana e a aprovação textual do detalhamento ampliado das Specs dos Blocos 4 a 6 (REV-002).
2. Decidir os efeitos autorizados de uma decisão de moderação sobre a nota pública (OPEN-085 / REV-008).
3. Decidir as questões funcionais de compatibilidade e descoberta listadas em OPEN-031 a OPEN-046 (REV-009).
4. Manter as demais questões OPEN pertinentes explicitamente abertas até decisão do grupo.
5. Manter a aprovação textual separada da aprovação dos layouts. Implementação somente após as aprovações aplicáveis.

## 6. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.

---

**Nota de rodapé — decisões já tomadas:** os achados REV-001, REV-003, REV-004, REV-006, REV-007 e REV-010 foram retirados do corpo principal por estarem encerrados. As correções e decisões correspondentes foram aplicadas aos artefatos do projeto e aprovadas pelo grupo; seus registros históricos podem ser recuperados no histórico do Git.
