# UC-01 — Gerenciar Perfil e Necessidades Funcionais

## Objetivo

Cadastrar e atualizar dados pessoais, laudos/documentações e o vetor de necessidades funcionais (arquitetônicas, comunicacionais, tecnológicas e sensoriais) que alimentará o motor de match.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado na plataforma.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): Validar Estrutura do Vetor de Acessibilidade.

## Fluxo Principal

1. O candidato acessa a seção "Meu Perfil" e seleciona "Necessidades de Acessibilidade".
2. O candidato marca os recursos indispensáveis para sua rotina de trabalho (ex.: presença de rampa, elevador falado, leitor de tela, intérprete de LIBRAS, flexibilidade de horário).
3. O candidato faz o upload opcional de laudo ou autodeclaração.
4. O candidato confirma o salvamento dos dados.
5. O sistema valida os campos, estrutura o vetor funcional e atualiza a base do candidato.

## Exceções e Fluxos Alternativos

- EX01 (Campos Obrigatórios Incompletos): Caso o candidato tente salvar o perfil sem selecionar os requisitos de acessibilidade essenciais, o sistema impede o salvamento e destaca as pendências.
- FA01 (Atualização Dinâmica de Laudo): O candidato pode anexar ou substituir laudos médicos a qualquer momento sem alterar seu vetor funcional básico.

## Pós-condições

- Vetor funcional do candidato atualizado e persistido.
- Laudos/documentações armazenados com controle de acesso e vínculo ao perfil.
- Versão do vetor e data de última atualização gravadas para auditoria.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — apenas vagas compatíveis com necessidades essenciais são apresentadas no motor de busca (aplicado em UC02).
- RB-06: Necessidades obrigatórias — determinados itens do vetor podem ser marcados como obrigatórios pelo candidato (ex.: intérprete de LIBRAS), tornando-os eliminatórios no cálculo de compatibilidade.
- RB-07: Perfil técnico — o vetor de necessidades deve ser combinado com o perfil técnico ao calcular match.
- RB-26: Validação de documentos — laudos aceitos têm formato, tamanho e validade definidos; documentos inválidos ou expirados devem ser sinalizados.
- RB-27: Confidencialidade de documentação — laudos e documentos sensíveis só são visíveis para usuários autorizados (recrutador com permissão) e dentro do contexto de candidatura.
- RB-28: Histórico de alterações — alterações no vetor funcional devem ser versionadas com carimbo de tempo para rastreabilidade.
- RB-29: Autodeclaração — o candidato pode optar por autodeclarar necessidades quando não possuir laudo; nesse caso, o sistema deve indicar a natureza da informação (autodeclarada vs. comprovada).
- RB-30: Entrada mínima — para que o candidato seja elegível ao UC02, um vetor funcional básico (conjunto mínimo de campos) deve estar preenchido.

## Requisitos relacionados

- RF-01 — Cadastro de usuário (manutenção de dados pessoais).
- RF-05 — Interface acessível (telas de edição e upload compatíveis com leitores de tela e navegação por teclado).
- RF-08 — Identificação de barreiras (modelagem do vetor e campos obrigatórios).
- RF-19 — Upload seguro de documentos (controle de tipos, tamanho, armazenamento seguro e expiração).
- RF-20 — Versionamento de perfil (registro de alterações e data/hora).
- RF-21 — Formulários dinâmicos (validadores e ajuda contextual para preenchimento de necessidades).
- RF-22 — Preferências de privacidade (controle sobre quem pode ver documentos/necessidades).
- RF-23 — Notificações (confirmar atualização de perfil por e-mail/SMS se configurado).

## Critérios de aceitação

- O candidato consegue salvar o vetor funcional quando os campos obrigatórios estão preenchidos.
- Laudos/documentos aceitos são armazenados e vinculados ao perfil; tipos inválidos são rejeitados com mensagem clara.
- Alterações ao vetor geram nova versão com timestamp.
- Perfil atualizado é considerado pelo motor de match (UC13) nas buscas subsequentes.

---

# UC-02 — Buscar Vagas (Trava Crítica / Match)

## Objetivo

Filtrar e visualizar exclusivamente vagas compatíveis com o perfil, ocultando automaticamente oportunidades impeditivas por meio da trava crítica de acessibilidade.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado com vetor funcional cadastrado (UC01).

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC13 (Calcular Match Determinístico).

## Fluxo Principal

1. O candidato acessa o painel de busca de vagas e insere termos de interesse ou filtros de localização/cargo.
2. O sistema dispara internamente a execução do UC13 para cruzar o vetor do candidato com o banco de vagas ativas.
3. O sistema aplica a trava crítica eliminatória (filtro booleano).
4. O sistema exibe o catálogo de vagas elegíveis ordenadas pelo percentual de compatibilidade.

## Exceções e Fluxos Alternativos

- EX01 (Nenhuma Vaga Compatível Encontrada): Se o motor de match descartar todas as vagas por incompatibilidade na trava crítica, o sistema exibe mensagem informativa e sugere ajuste nos filtros de localização/cargo.
- FA01 (Filtro Manual por Categoria de Acessibilidade): O candidato aplica filtros adicionais refinando os resultados apenas por tipo de regime (remoto, híbrido, presencial).

## Pós-condições

- Lista de vagas compatíveis retornada e ordenada por compatibilidade.
- Logs de pesquisa e parâmetros armazenados para análise e melhoria do motor.

## Regras de negócio relacionadas

- RB-02: Trava de acessibilidade — barreiras incompatíveis tornam a vaga não elegível.
- RB-03: Peso da acessibilidade — acessibilidade compõe parte relevante do cálculo de compatibilidade (ex.: 50% do score, conforme UC-01-gerar-trilha).
- RB-04: Peso do perfil técnico — perfil técnico é considerado no cálculo do match.
- RB-05: Peso de distância e modalidade — distância e modalidade contribuem para o score de compatibilidade.
- RB-10: Vagas externas — vagas importadas devem ser normalizadas antes da análise.
- RB-11: Validação da IA — dados extraídos por IA de vagas externas devem ser validados antes do uso.
- RB-31: Transparência do resultado — o sistema deve expor ao candidato os principais fatores que influenciaram a compatibilidade (quais requisitos foram decisivos).
- RB-32: Cache de resultados — para performance, resultados de busca podem ser cacheados por conjunto de parâmetros por período curto.

## Requisitos relacionados

- RF-06 — Busca e filtro (filtros por localização, cargo, modalidade, categoria de acessibilidade).
- RF-07 — Análise de compatibilidade (integração com UC13 e aplicação da trava crítica).
- RF-10 — Visualização da vaga (detalhes de acessibilidade visíveis antes da candidatura).
- RF-05 — Interface acessível (resultados e filtros acessíveis).
- RF-24 — Paginação e performance (retorno rápido em grandes volumes de vagas).
- RF-25 — Transparência de pontuação (exibir breakdown do score para cada vaga).

## Critérios de aceitação

- Busca retorna apenas vagas que passaram pela trava crítica.
- Resultados são ordenados pelo percentual de compatibilidade calculado.
- Quando nenhuma vaga compatível for encontrada, o sistema sugere ações ao candidato (ajustar filtros, salvar alerta por e-mail).

---

# UC-03 — Candidatar-se a Vaga

## Objetivo

Registrar formalmente a candidatura em uma vaga elegível e disponibilizar o perfil profissional ao recrutador.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado e vaga com status "Ativa" aprovada na trava crítica (UC02).

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC04 (Solicitar Acomodação no Processo Seletivo).

## Fluxo Principal

1. O candidato seleciona uma vaga detalhada no catálogo de buscas (UC02).
2. O candidato clica no botão "Candidatar-se".
3. O sistema confirma a elegibilidade do candidato e vincula seu perfil ao funil de seleção da vaga.
4. O sistema exibe mensagem de confirmação da candidatura enviada.

## Exceções e Fluxos Alternativos

- EX01 (Candidatura Duplicada): Se o candidato tentar se inscrever em uma vaga para a qual já enviou candidatura, o sistema bloqueia a ação e exibe o status atual do processo.
- EX02 (Vaga Encerrada Durante o Processo): Se a vaga for desativada ou encerrada no momento do clique, o sistema cancela a operação e atualiza a interface.

## Pós-condições

- Registro de candidatura associado ao candidato e à vaga.
- Notificação ao recrutador sobre nova candidatura (conforme preferências de notificação).
- Histórico de candidaturas atualizado no perfil do candidato.

## Regras de negócio relacionadas

- RB-01: Limite de candidaturas — política de limite (por dia ou por vaga) quando aplicável.
- RB-09: Restrição de vaga incompatível — vagas incompatíveis não permitem candidatura através da trilha.
- RB-26: Validação de documentos na candidatura — anexos exigidos na candidatura devem ser validados.
- RB-33: Confirmação explícita — candidatura só é enviada após confirmação explícita do candidato.
- RB-34: Privacidade de perfil — informações sensíveis do candidato só são enviadas ao recrutador mediante consentimento e conforme necessidade.

## Requisitos relacionados

- RF-03 — Recuperação de senha (apenas se necessário no fluxo de candidatura enviado por usuário não logado — cenário raro).
- RF-10 — Visualização da vaga (botões de candidatura e indicação de elegibilidade).
- RF-26 — Registro de candidatura (persistência e associação com o funil de seleção).
- RF-19 — Upload seguro de documentos (quando anexos são solicitados na candidatura).
- RF-27 — Notificações ao recrutador e candidato (e-mail/SMS/alerta interno).
- RF-28 — Prevenção de candidaturas duplicadas (verificação prévia).

## Critérios de aceitação

- Ao candidatar-se, o sistema registra a candidatura e notifica o recrutador.
- Ação de candidatura bloqueada se o candidato já estiver inscrito; mensagem clara sobre status.
- Candidatura não é aceita para vagas encerradas ou desativadas no momento da tentativa.

---

# UC-04 — Solicitar Acomodação no Processo Seletivo

## Objetivo

Especificar adaptações ou recursos de acessibilidade necessários para a realização de etapas seletivas específicas (entrevistas, testes práticos).

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar em fluxo de candidatura (UC03) ou com processo seletivo ativo (UC05).

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): Estende o UC03 (Candidatar-se a Vaga) e o UC05 (Acompanhar Funil).

## Fluxo Principal

1. Durante a candidatura ou antes de uma etapa, o candidato ativa a opção "Solicitar Acomodação para a Seleção".
2. O candidato seleciona as necessidades específicas do evento (ex.: intérprete de LIBRAS na chamada, tempo adicional para teste escrito, software de leitura de tela configurado).
3. O candidato inclui observações técnicas adicionais, se necessário.
4. O sistema salva a solicitação e a vincula ao registro da candidatura para análise do recrutador (UC09).

## Exceções e Fluxos Alternativos

- EX01 (Solicitação Fora do Prazo Mínimo): Se o pedido for realizado com menos de 24 horas de antecedência da etapa agendada, o sistema emite um alerta informando que a viabilização dependerá da aprovação direta do recrutador.

## Pós-condições

- Solicitação registrada e visível ao recrutador no painel do processo seletivo.
- Histórico de solicitações e respostas armazenado para auditoria.

## Regras de negócio relacionadas

- RB-35: Prazo mínimo para atendimento — solicitar acomodação com menos de 24 horas pode ser aceito, mas depende de aprovação do recrutador.
- RB-36: Priorização de solicitações — solicitações presentes e comprovadas podem ter prioridade na organização da etapa (dependente do recrutador).
- RB-37: Registro de resposta — recrutador deve registrar aceite, negativa ou contraproposta; resposta gera notificação ao candidato.
- RB-38: Documentação obrigatória — para determinados recursos (por exemplo, auxílio de deslocamento), pode ser exigida documentação adicional.
- RB-39: Confidencialidade das solicitações — detalhes sensíveis sobre acomodação só são compartilhados com pessoas do processo seletivo diretamente envolvidas.

## Requisitos relacionados

- RF-29 — Formulário de solicitação de acomodação (campos padronizados e opcionais).
- RF-30 — Visibilidade para recrutadores (painel com gestão de solicitações e emissão de respostas).
- RF-31 — Notificações e rastreamento (notificar candidato sobre decisão e registrar timestamps).
- RF-32 — SLA interno (registro de tempo de resposta esperado do recrutador).
- RF-33 — Upload e anexos (quando for necessário comprovar a solicitação).
- RF-34 — Controle de acesso (quem pode ver e responder à solicitação dentro da organização recrutadora).

## Critérios de aceitação

- O candidato consegue enviar uma solicitação de acomodação vinculada à candidatura.
- Recrutador visualiza a solicitação e pode registrar decisão (aceitar/recusar/contrapropor).
- Solicitações fora do prazo mínimo são sinalizadas e ainda podem ser enviadas, com indicação de que dependem de aprovação manual.

---

## Observação

Posso abrir um pull request com este arquivo em `docs/casos-de-uso/UC-01-gerenciar-perfil-e-acomodacao.md` ou alterar um arquivo existente conforme preferir.