# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

**Status atual:** somente REV-009 permanece aberta neste relatório, por envolver regras centrais de compatibilidade e descoberta de vagas. REV-002 foi encerrada após aprovação humana do detalhamento aplicado. REV-008 foi encerrada após a decisão de que a administração da plataforma atua sobre denúncias, sem alterar diretamente as avaliações ou a distribuição pública de estrelas.

- O mapa e o documento de detalhamento preservam os IDs SPEC-001 a SPEC-021; SPEC-014 e SPEC-015 foram removidas do escopo, sem renumerar as posteriores.
- O `OPEN.md` contém questões numeradas de OPEN-001 a OPEN-085 sem IDs duplicados detectados.
- Todas as RBs identificadas na baseline aparecem referenciadas em algum ponto de `Specs.md`; isso não garante, por si só, que cada regra esteja associada à Spec correta.
- RF-34 e RF-35 estão associados, respectivamente, à SPEC-012 e à SPEC-013.
- O detalhamento de contratos e testes das SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021 foi ampliado e aprovado pelo grupo (REV-002 encerrada).
- Foram encontrados pontos em que uma dependência, referência de caso de uso ou conteúdo de seção precisa ser corrigido ou confirmado.

## 3. Achados prioritários

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
- O `OPEN.md` contém seções organizadas por área funcional.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 5. Plano recomendado de correção

1. Decidir as questões funcionais de compatibilidade e descoberta listadas em OPEN-031 a OPEN-046 (REV-009).
2. Manter as demais questões OPEN pertinentes explicitamente abertas até decisão do grupo.
3. Manter a aprovação textual separada da aprovação dos layouts. Implementação somente após as aprovações aplicáveis.

## 6. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.

---

**Nota de rodapé — decisões já tomadas:** os achados REV-001, REV-002, REV-003, REV-004, REV-006, REV-007, REV-008 e REV-010 foram encerrados após correções ou decisões aprovadas pelo grupo. REV-001, REV-003, REV-004, REV-006, REV-007 e REV-010 foram removidos do corpo principal; REV-002 e REV-008 permanecem descritos acima apenas como registro de encerramento. Os registros históricos também podem ser consultados no histórico do Git.
