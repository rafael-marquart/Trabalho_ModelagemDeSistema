# Revisão de consistência das Specs — AcessaVagas

## 1. Objetivo e escopo da revisão

Esta revisão compara `docs/Specs.md`, `docs/mapa-specs.md`, `docs/OPEN.md` e a baseline disponível de RF, RB, RNF, casos de uso, modelo conceitual, drivers, ADRs e estados do funil.

A revisão **não aprova os textos**, não aprova layouts e não autoriza implementação. Quando a baseline não permite resolver uma questão, o relatório registra a lacuna em vez de escolher uma regra por inferência.

## 2. Resultado executivo

**Status atual:** REV-009 é a revisão ativa neste relatório, por envolver regras centrais de compatibilidade e descoberta de vagas. Isso não significa que o projeto esteja sem questões funcionais em aberto: os estados das OPEN são mantidos em `docs/OPEN.md` e resumidos na seção 4 deste relatório. REV-002 foi encerrada após aprovação humana do detalhamento aplicado. REV-008 foi encerrada após a decisão de que a administração da plataforma atua sobre denúncias, sem alterar diretamente as avaliações ou a distribuição pública de estrelas.

- O mapa e o documento de detalhamento cobrem as Specs ativas do escopo: SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021. SPEC-014 e SPEC-015 foram removidas e não devem ser contadas como Specs vigentes; os IDs posteriores foram preservados.
- A conferência do cadastro atual de `OPEN.md` identificou 81 linhas de questões com IDs únicos. Há lacunas históricas na sequência, portanto não se deve afirmar que a numeração é contínua. O estado das pendências é consolidado na seção 4.
- Todas as RBs identificadas na baseline aparecem referenciadas em algum ponto de `Specs.md`; isso não garante, por si só, que cada regra esteja associada à Spec correta.
- RF-34 e RF-35 estão associados, respectivamente, à SPEC-012 e à SPEC-013.
- O detalhamento de contratos e testes das SPEC-011 a SPEC-013 e SPEC-016 a SPEC-021 foi ampliado e aprovado pelo grupo (REV-002 encerrada).
- Nesta rodada, foram corrigidos o texto do mapa que sugeria ausência de pendências, a orientação para tratar referências às Specs removidas e as afirmações de escopo/contagem neste relatório. As correções são documentais e não alteram decisões funcionais..

## 3. Achados prioritários

### REV-009 — Definir com precisão o cálculo de compatibilidade entre candidato e vaga

**Prioridade:** alta  
**Artefatos:** SPEC-007 a SPEC-010, RF-07 a RF-10, RF-24/RF-25, RB-02 a RB-07, RB-15/RB-16/RB-30.

**Por que esta revisão é importante:** o resultado de compatibilidade influencia o que o candidato vê na busca, como interpreta uma vaga e se pode prosseguir para a candidatura. Uma regra ambígua pode apresentar um resultado enganoso ou permitir que uma incompatibilidade crítica seja escondida por uma pontuação alta. Por isso, essa decisão afeta diretamente o funcionamento central do site e não deve ser preenchida por suposição.

**Princípios já estabelecidos e que devem ser preservados:**
- A trava crítica de acessibilidade prevalece sobre qualquer score numérico.
- Dados de acessibilidade ausentes não significam compatibilidade; ausência de informação não pode ser tratada como confirmação positiva nem, sem evidência, como incompatibilidade comprovada.
- O cálculo deve ter uma única fonte de verdade na SPEC-007. A SPEC-008 usa o resultado para busca/filtros e a SPEC-010 apresenta o resultado ao candidato; nenhuma delas deve criar uma fórmula paralela.

**Decisões já consolidadas:** OPEN-031 a OPEN-046 estão resolvidas e devem ser refletidas de forma consistente nas Specs. A regra atual de D usa distância em quilômetros nas vagas presenciais/híbridas e exclui distância para vagas totalmente remotas; não calcula tempo de deslocamento. **Pendência funcional remanescente:** OPEN-088, que define o método/provedor para determinar a distância em quilômetros. Não escolher provedor ou método por inferência.

**Status: REV-009 permanece aberta** para validação final do cálculo e da descoberta de vagas. As decisões consolidadas nas OPEN-031 a OPEN-046 devem ser refletidas nos artefatos; OPEN-046 já está resolvida e não deve ser tratada como pendência. Não inventar regras adicionais nem iniciar implementação de comportamentos ainda indefinidos.

## 4. Estado atual das pendências OPEN

Conforme o cadastro vigente em `docs/OPEN.md`, as questões ainda não totalmente resolvidas são:

- **Abertas:** OPEN-075, OPEN-076, OPEN-077, OPEN-078, OPEN-079, OPEN-080, OPEN-081 e OPEN-088.
- **Parcialmente resolvidas:** OPEN-086 e OPEN-087.
- **Parcialmente definidas:** OPEN-082, OPEN-083 e OPEN-084.
- **Resolvida:** OPEN-085.

OPEN-086 e OPEN-087 dependem de confirmação documentada das condições de acesso/licença do Adzuna e da viabilidade operacional da coleta diária. OPEN-088 continua sem método/provedor aprovado para determinar distância em quilômetros; não calcular tempo de deslocamento nem reintroduzir o provedor de rotas anteriormente considerado.

A revisão de consistência documental, por si só, não altera esses estados funcionais. Não marcar questões como resolvidas sem decisão explícita e atualização dos artefatos correspondentes.

## 5. Verificações que passaram

- As Specs ativas listadas no escopo (SPEC-001 a SPEC-013 e SPEC-016 a SPEC-021) aparecem no mapa e no documento de detalhamento; SPEC-014 e SPEC-015 estão excluídas do escopo.
- Os títulos das Specs no mapa correspondem aos títulos do documento de detalhamento.
- As 81 linhas de cadastro de questões em `OPEN.md` têm IDs únicos; a sequência inclui OPEN-086 a OPEN-088 e preserva lacunas históricas.
- O `OPEN.md` contém seções organizadas por área funcional.
- As decisões consolidadas sobre conta Empresa, perfil Recrutador, Administrador da plataforma, não armazenamento de laudos, análise de denúncia e deduplicação de vagas externas estão registradas no `OPEN.md`.
- O fluxo consolidado de estados do funil está documentado em `docs/Fluxos e Estados/estados-trilha.md`.

## 5. Plano recomendado de correção

1. Resolver a pendência funcional remanescente de REV-009, OPEN-088 (método/provedor para determinar distância em quilômetros), sem reabrir OPEN-031 a OPEN-046, já decididas.
2. Manter as demais questões OPEN pertinentes explicitamente abertas até decisão do grupo.
3. Manter a aprovação textual separada da aprovação dos layouts. Implementação somente após as aprovações aplicáveis.

## 6. Limite desta revisão

Esta é uma auditoria de consistência documental. Ela identifica cobertura e problemas verificáveis por comparação dos artefatos, mas não substitui a leitura e validação funcional do grupo. Questões de produto que a baseline não resolve continuam abertas.

---

**Nota de rodapé — decisões já tomadas:** os achados REV-001, REV-002, REV-003, REV-004, REV-006, REV-007, REV-008 e REV-010 foram encerrados após correções ou decisões aprovadas pelo grupo. REV-001, REV-003, REV-004, REV-006, REV-007 e REV-010 foram removidos do corpo principal; REV-002 e REV-008 permanecem descritos acima apenas como registro de encerramento. Os registros históricos também podem ser consultados no histórico do Git.
