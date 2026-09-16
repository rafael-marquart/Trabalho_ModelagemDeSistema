Documentação para contexto do projeto 
-
Nome do Projeto: AcessaVagas
-
1) Questão problematizadora que desencadeou o surgimento da ideia:
   -
"Como garantir que um profissional PCD não invista tempo e energia em processos seletivos para vagas cuja infraestrutura física e/ou 
digital é incompatível com suas necessidades funcionais reais?

3) Visão do Projeto:
   -
Ser uma plataforma de recrutamento capaz de conectar pessoas com deficiência a empresas verdadeiramente acessíveis, garantindo, a partir
da análise do perfil do candidato, um ecossistema de trabalho, de fato, inclusivo e que proporcione, aos futuros colaboradores, boa
instrutura, autonomia e real acessibilidade.

4) Proposta do Projeto:
   -
Eliminar a questão de "falsa inclusão" e desenvolver uma plataforma que ofereça funcionalidades importantes para assegurar a manutenção
da acessibilidade ao longo do processo de recrutamento.

5) O que a plataforma entrega na prática:
   -
- Sistema de checagem para analisar se existe compatibilidade entre o candidato e a empresa --> Métricas levadas em consideração: Atendimento
as necessidades obrigatórias de conforto do candidato; Avaliação técnica (nível de escolaridade, formação, competências e idiomas); Modalidade
da vaga (presencial, híbrido ou remoto); e Avaliação do deslocamento até empresa (tempo/distância);
- Cadastro direto de vagas, facilitando a busca de profissionais deficientes;
- Visualização de vagas publicadas fora da plataforma; 
- Uso sem barreiras da plataforma, já que ela foi pensada e desenhada para que qualquer pessoa navegue com autonomia, usando leitores de tela,
comando de voz, teclado e/ou alto contraste;
- Sistema de Reputação e Avaliação: Validação real feita pelos candidatos após entrevista, transformando experiência individual em um
indicador coletivo de confiabilidade, autenticando a infraestrutura prometida pela empresa.

6) Público-alvo:
   -
- Candidato PCD: Profissionais com deficiências físicas, auditivas, visuais ou neurodivergências que buscam confiança, inclusão e
acessibilidade em processos de recrutamento;
- Recrutador/Empresa: Equipes de RH que almejam encontrar novos talentos, garantindo a manutenção da inclusão;
- Administrador: Responsáveis por moderar denúncias de incompatibilidade, gerenciar selos de acessibilidade e manter a integridade
dos dados na plataforma.

7) Escopo:
   -
- Mapeamento de necessidades e perfis: Cadastro estruturado dos candidatos (necessidades funcionais e perfil técnico), das empresas (infraestruturas
e acessibilidades oferecidas) e administrador;
- Gestão e Ingestão de vagas (nativas e externas):
  1) Publicação nativa: Painel para recrutadores cadastrados criarem e gerenciarem vagas diretamente na plataforma;
  2) Agregador Inteligente: Captura automatizada de vagas externas da web com padronização de dados de acessibilidade via IA (LLM) em formato JSON.
- Motor de extração JSON via LLM: Módulo que funcionaria como leitor e organizador automático das vagas publicadas, auxiliando o futuro
cálculo de compatibilidade;
- Algoritmo determinístico de correspondência: Cálculo de compatibilidade em três dimensões (1) 50% - Acessibilidade geral, caso haja alguma
barreira incompatível de forma absoluta, o sistema barra a visualização da vaga pelo candidato; 2) 30% - Perfil técnico, cruzando conhecimentos
e habilidades com as exigências da vaga; 3) 20% - Distância (avaliando tempo de deslocamento) e Modalidade da vaga);
- Gestão do processo seletivo (Visão do Recrutador): Painel para mover candidatos entre as etapas (Inscrito --> Triagem --> Entrevista Agendada
--> Aprovado/Encerrado), com registro do formato da entrevista (presencial ou online);
- Gestão do processo seletivo (Visão do Candidato): Painel "Minhas Candidaturas" com status de cada processo seletivo;
- Interface Acessível por Design (Norma WCAG 2.1 AA): Garantia de autonomia total em conformidade com a Lei Brasileira de Inclusão
(LBI nº 13.146/2015), integrando suporte a leitores de tela, navegação por teclado, alto contraste, comandos de voz e feedbacks
semânticos nos fluxos de busca, candidatura e acompanhamento;
- Módulo de feedback pós-entrevista: Validação colaborativa e anônima da acessibilidade real da empresa, acionada automaticamente após a
entrevista por meio de formulários adaptativos, alimentando a Nota Pública de Acessibilidade da organização e disparando o bloqueio preventivo
de vagas para moderação em caso de divergências recorrentes.

8) Tabela de Benchmarking Comparativo:
   -
   
| Critério de Avaliação | Portais Tradicionais (ex: LinkedIn, Gupy) | Portais PcD Legados (ex: PCD Online) | **AcessaVagas** (Solução Proposta) |
| :--- | :--- | :--- | :--- |
| **Mapeamento de Acessibilidade** | Checkbox genérico ("Vaga para PcD") sem especificação de infraestrutura. | Formulários estáticos e preenchimento manual restrito a laudos médicos. | **Mapeamento Detalhado e Dinâmico** de barreiras físicas e recursos digitais. |
| **Algoritmo de Compatibilidade** | Baseado apenas em palavras-chave e competências técnicas. | Inexistente (Busca manual por lista de vagas ou envio de currículos por e-mail). | **Algoritmo Determinístico com Trava Crítica** (Zera a compatibilidade automaticamente em caso de barreiras eliminatórias). |
| **Auditoria & Reputação** | Inexistente (Suscetível a anúncios com falsa acessibilidade). | Baixa ou manual (Baseada exclusivamente na autodeclaração inicial da empresa). | **Auditoria Colaborativa Anônima** pós-entrevista, gerando nivelamento de acessibilidade real e bloqueio preventivo de vagas. |
| **Cadastro de Vagas (RH)** | Preenchimento manual extenso. | Preenchimento manual campo a campo em formulários legados. | **Extração Automática via IA (LLM)** que converte texto livre do anúncio das vagas em JSON estruturado. |
| **Acessibilidade da Interface** | Parcial e inconsistente (Barreiras de navegação para leitores de tela). | Defasada (Interface antiga, baixo contraste e navegação rígida). | **Nativa WCAG 2.1 AA** (Suporte a leitores de tela, navegação por teclado, comandos de voz e alto contraste). |
| **Gestão do Funil Seletivo** | Linha do tempo padrão com foco nas necessidades do recrutador. | Baixa visibilidade de status e etapas para o candidato. | **Funil Transparente e Acessível** com indicação clara de status e formato das entrevistas. |
