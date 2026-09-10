# UC-05 — Acompanhar Funil de Candidaturas

## Objetivo

Monitorar em tempo real a evolução de suas candidaturas, visualizar confirmações de acomodações solicitadas e acessar detalhes de agendamentos.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado com pelo menos uma candidatura ativa.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): FA01 (Cancelar Candidatura), FA02 (Visualizar Agendamento), EX01 (Alerta de Vaga Encerrada).

## Fluxo Principal

1. O candidato acessa a área "Minhas Candidaturas".
2. O sistema exibe o painel consolidado com a lista de vagas e a etapa atual de cada processo (Inscrito, Triagem, Entrevista Agendada, Finalizado).
3. O candidato seleciona um item para visualizar a linha do tempo detalhada e o status do aceite da sua solicitação de acomodação (UC04).

## Exceções e Fluxos Alternativos

- FA01 (Cancelar Candidatura): O candidato opta por desistir do processo seletivo, alterando o status da inscrição e liberando sua participação.
- FA02 (Visualizar Detalhes do Agendamento): Quando o status for Entrevista Agendada, o candidato acessa local, horário e recursos confirmados (UC10).
- EX01 (Vaga Cancelada pela Empresa): O sistema sinaliza quando uma oportunidade foi encerrada precocemente pela empresa.

## Pós-condições

- Status das candidaturas atualizado no painel do candidato.
- Notificações geradas para o candidato sobre alterações críticas (cancelamento, reagendamento, resposta à solicitação de acomodação).

## Regras de negócio relacionadas

- RB-37: Registro de resposta — recrutador deve registrar aceite, negativa ou contraproposta; resposta gera notificação ao candidato (aplicável também ao UC05).
- RB-40: Cancelamento de candidatura — candidato pode cancelar sua candidatura até um prazo definido antes de etapas críticas (por exemplo, 24 horas antes da entrevista), dependendo das regras da vaga.
- RB-41: Estados do funil — o sistema deve padronizar os estados do funil (Inscrito, Triagem, Selecionado para Entrevista, Entrevista Agendada, Finalizado, Rejeitado) e impedir transições inválidas.
- RB-42: Visibilidade de acomodações — confirmação/recusa de solicitações de acomodação deve ser claramente exibida no funil.
- RB-43: Auditoria de alterações — mudanças de status e cancelamentos devem ser versionadas e registradas com usuário e timestamp.
- RB-44: Notificação de vaga encerrada — quando a vaga é encerrada, candidatos em fase ativa recebem aviso e a vaga é removida do painel ativo.

## Requisitos relacionados

- RF-27 — Notificações ao recrutador e candidato (e-mail/SMS/alerta interno).
- RF-26 — Registro de candidatura (persistência e associação com o funil de seleção).
- RF-30 — Visibilidade para recrutadores (painel com gestão de solicitações e emissão de respostas).
- RF-31 — Notificações e rastreamento (notificar candidato sobre decisão e registrar timestamps).
- RF-12 — Gestão de sessão e tokens (garantir que apenas usuário autenticado veja o funil).
- RF-35 — Cancelamento de candidatura (função para alterar status por iniciativa do candidato, com regras de bloqueio temporal).

## Critérios de aceitação

- O candidato visualiza sua lista de candidaturas com o estado correto atualizado.
- O candidato recebe notificação quando uma acomodação é aceita/recusada pelo recrutador.
- Candidaturas canceladas pelo candidato são registradas e removidas/arquivadas do funil ativo conforme regras.

---

# UC-06 — Avaliar Pós-Entrevista

## Objetivo

Avaliar a experiência da entrevista quanto ao cumprimento dos recursos de acessibilidade e postura inclusiva da equipe, gerando nota de reputação.

## Ator principal

- Candidato PcD.

## Pré-condições

- Entrevista cadastrada no sistema e concluída.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC11 (Moderar Denúncias e Falsa Inclusão), FA01 (Avaliação Anônima).

## Fluxo Principal

1. Após a data do evento seletivo, o candidato recebe notificação e clica em "Avaliar Entrevista".
2. O candidato responde ao checklist sobre cumprimento dos recursos solicitados (UC04) e atitude dos entrevistadores.
3. O sistema grava os dados e atualiza a média de pontuação de acessibilidade da empresa.

## Exceções e Fluxos Alternativos

- FA01 (Optar por Anonymity): O candidato marca a opção de enviar a avaliação de forma 100% anônima.
- UC11 (Denúncia de Falsa Inclusão): Em caso de conduta preconceituosa ou ausência grave de acessibilidade combinada, o candidato marca a opção de denúncia formal, estendendo para a moderação administrativa.
- EX01 (Prazo Expirado): Se passarem mais de 30 dias do evento sem avaliação, o formulário é desativado.

## Pós-condições

- Avaliação persistida e média de pontuação da empresa atualizada.
- Denúncias encaminhadas ao fluxo de moderação quando aplicável.

## Regras de negócio relacionadas

- RB-45: Avaliação anônima opcional — permitir avaliações anônimas mantendo integridade dos dados para prevenção de abuso.
- RB-46: Prazo de avaliação — avaliações só podem ser submetidas até 30 dias após a entrevista.
- RB-47: Impacto na reputação — pontuação agregada de acessibilidade influencia métricas públicas/privadas da empresa (conforme política de transparência).
- RB-48: Triagem de denúncias — denúncias abertas por avaliações devem seguir um fluxo de moderação com evidências antes de ações punitivas.
- RB-49: Confidencialidade — conteúdo da avaliação só é visível ao nível adequado (anônimo à empresa quando necessário, detalhado para moderadores internos).

## Requisitos relacionados

- RF-36 — Formulário de avaliação pós-entrevista (questões padronizadas e escala de avaliação).
- RF-37 — Anonimização de respostas (opção para enviar sem identificar o candidato ao recrutador).
- RF-11 — Autenticação em Dois Fatores (para verificações em casos de disputas/denúncias críticas).
- RF-38 — Fluxo de moderação (ferramentas para analisar denúncias e tomar ações).
- RF-39 — Métricas e dashboard (visualização agregada das avaliações por empresa/unidade).

## Critérios de aceitação

- Avaliações submetidas dentro do prazo são gravadas e contabilizadas na média da empresa.
- Avaliação anônima preserva anonimato enquanto permite a triagem de conteúdo pela equipe de moderação.
- Denúncias acionam o fluxo de moderação com evidências suficientes para investigação.

---

# UC-07 — Cadastrar Infraestrutura da Empresa

## Objetivo

Mapear e declarar os recursos físicos, digitais, tecnológicos e organizacionais de acessibilidade presentes na empresa.

## Ator principal

- Recrutador / RH.

## Pré-condições

- Recrutador autenticado e vinculado a um perfil corporativo cadastrado.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): FA01 (Importar por Filial), FA02 (Anexar Evidências/Fotos).

## Fluxo Principal

1. O recrutador acessa "Perfil da Empresa" -> "Mapeamento de Infraestrutura".
2. O recrutador preenche o questionário estruturado sobre a presença de rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas.
3. O sistema valida as informações e grava o vetor de infraestrutura da empresa no banco de dados.

## Exceções e Fluxos Alternativos

- FA01 (Importar Mapeamento por Filial): O recrutador clona as configurações de acessibilidade de uma unidade existente para cadastrar uma nova sede.
- FA02 (Anexar Evidências/Fotos): O recrutador anexa fotos/evidências que serão validadas internamente.
- EX01 (Alerta de Campos Obrigatórios Pendentes): O sistema impede o salvamento caso os itens de infraestrutura básica não sejam respondidos.

## Pós-condições

- Vetor de infraestrutura da empresa persistido e disponível para uso pelo motor de compatibilidade e para exibição nas vagas.
- Evidências anexadas vinculadas ao perfil da filial/unidade.

## Regras de negócio relacionadas

- RB-50: Evidência obrigatória — determinados itens (por ex., existência de acessos físicos básicos) podem exigir evidências quando marcados como presentes.
- RB-51: Importação por filial — permitir reutilização de mapeamentos entre filiais com registro de autoria e data.
- RB-52: Validação por auditoria — dados de infraestrutura podem ser auditados por equipe interna ou parceiros terceiros para garantir veracidade.
- RB-53: Publicação de informações — informações básicas de acessibilidade devem ser exibidas nas páginas de vaga; detalhes sensíveis ficam restritos.
- RB-54: Atualização periódica — empresas são solicitadas a revisar mapeamentos a cada período (ex.: 12 meses).

## Requisitos relacionados

- RF-40 — Formulário de mapeamento de infraestrutura (campos padronizados por categoria e unidade).
- RF-41 — Upload de evidências (armazenamento seguro de imagens/documentos com metadados).
- RF-42 — Gestão de filiais/unidades (associação de mapeamentos a localidades específicas).
- RF-43 — Auditoria e verificação (ferramentas para marcar verificado/pendente por equipe de auditoria).
- RF-44 — Exposição pública (campos que aparecem na visualização da vaga e no perfil da empresa).
- RF-45 — Histórico de mudanças (registro de alterações com usuário e timestamp).

## Critérios de aceitação

- Recrutador consegue preencher e salvar o mapeamento por unidade.
- Itens obrigatórios bloqueiam o salvamento quando pendentes.
- Evidências anexadas são armazenadas com metadados e vinculadas ao mapeamento.
- Mapeamentos podem ser importados entre filiais e recebem registro de autoria.

---

## Observação

Posso criar este arquivo em `docs/casos-de-uso/UC-05-07-funil-infra.md` no repositório e abrir um pull request caso deseje revisão antes do merge.