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
infraestrutura, autonomia e real acessibilidade.

4) Proposta do Projeto:
   -
Eliminar a questão de "falsa inclusão" e desenvolver uma plataforma que ofereça informações e verificações de acessibilidade para apoiar decisões durante o processo de recrutamento.

5) O que a plataforma entrega na prática:
   -
- Sistema de checagem da compatibilidade entre candidato e vaga, com três dimensões: atendimento às necessidades de acessibilidade do candidato (com trava para barreiras críticas); avaliação técnica (escolaridade, competências, experiência e idiomas); e modalidade da vaga com o tempo de deslocamento até o local de trabalho;
- Cadastro direto de vagas pelas empresas e seus recrutadores, com a acessibilidade de cada vaga declarada item a item;
- Uso sem barreiras da plataforma, pensada para que qualquer pessoa navegue com autonomia usando leitor de tela, teclado, alto contraste ou tema escuro (comandos de voz próprios não fazem parte desta versão; a navegação por voz do sistema operacional funciona pelos nomes acessíveis dos controles);
- Sistema de reputação: avaliação feita pelo candidato após a entrevista, que forma a nota pública de acessibilidade da empresa (distribuição de estrelas);
- Canal de denúncia de incompatibilidade ou falsa inclusão, analisado pela administração;
- Visualização de vagas publicadas fora da plataforma: prevista (SPEC-006), ainda não disponível nesta versão.

6) Público-alvo:
   -
- Candidato PcD: profissionais com deficiências físicas, auditivas, visuais ou neurodivergências que buscam confiança, inclusão e acessibilidade em processos de recrutamento;
- Empresa: conta organizacional (CNPJ e e-mail corporativo) que declara sua infraestrutura, publica vagas e convida recrutadores;
- Recrutador: pessoa da equipe de RH convidada pela empresa para publicar vagas e conduzir os processos seletivos;
- Administrador: equipe da plataforma que modera denúncias e mantém o catálogo de necessidades de acessibilidade.

7) Escopo:
   -
- Mapeamento de necessidades e perfis: cadastro estruturado dos candidatos (necessidades funcionais, com consentimento específico, e perfil técnico), das empresas (infraestrutura e acessibilidade oferecidas) e dos recrutadores vinculados;
- Gestão de vagas:
  1) Publicação nativa: painel para a empresa e seus recrutadores criarem, publicarem, pausarem, reabrirem e encerrarem vagas;
  2) Agregador de vagas externas (SPEC-006): captura automatizada de vagas de fontes autorizadas, com extração opcional por LLM e validação antes do uso. Em revisão no PR #68; fora da versão atual.
- Algoritmo determinístico de correspondência: compatibilidade em três dimensões: (1) 50% acessibilidade, com trava que oculta a vaga quando há barreira incompatível; (2) 30% perfil técnico; (3) 20% modalidade e tempo de deslocamento. O cálculo não usa IA; quando faltam dados, o resultado é "dados insuficientes", sem presumir compatibilidade;
- Gestão do processo seletivo (visão da empresa e do recrutador): painel para mover candidaturas entre as etapas Inscrito → Triagem → Entrevista → Finalista → Contratado (ou Recusada), com agendamento de entrevistas presenciais ou on-line e os recursos de acessibilidade oferecidos;
- Gestão do processo seletivo (visão do candidato): "Minhas candidaturas", com etapa, histórico, entrevistas e cancelamento;
- Avisos na plataforma e por e-mail a cada mudança relevante, com opção de desligar o e-mail;
- Interface acessível por design (WCAG 2.2 AA), em conformidade com a Lei Brasileira de Inclusão (LBI nº 13.146/2015), com suporte a leitores de tela, navegação por teclado, alto contraste e tema escuro;
- Módulo de avaliação pós-entrevista: o candidato avalia acessibilidade e postura inclusiva (1 a 5 estrelas) até 60 dias após a entrevista concluída; a nota pública mostra só a distribuição agregada, sem identificar ninguém;
- Moderação de denúncias: o candidato que participou de entrevista na vaga pode denunciar; o administrador analisa em até 5 dias úteis, pode pedir informações à empresa e registra a decisão. A denúncia, sozinha, não bloqueia vagas nem altera a nota.

8) Tabela de Benchmarking Comparativo:
   -
   
| Critério de Avaliação | Portais Tradicionais (ex: LinkedIn, Gupy) | Portais PcD Legados (ex: PCD Online) | **AcessaVagas** (Solução Proposta) |
| :--- | :--- | :--- | :--- |
| **Mapeamento de Acessibilidade** | Checkbox genérico ("Vaga para PcD") sem especificação de infraestrutura. | Formulários estáticos e preenchimento manual restrito a laudos médicos. | **Mapeamento Detalhado e Dinâmico** de barreiras físicas e recursos digitais. |
| **Algoritmo de Compatibilidade** | Baseado apenas em palavras-chave e competências técnicas. | Inexistente (Busca manual por lista de vagas ou envio de currículos por e-mail). | **Algoritmo Determinístico com Trava Crítica** (oculta a vaga automaticamente em caso de barreira eliminatória). |
| **Auditoria & Reputação** | Inexistente (Suscetível a anúncios com falsa acessibilidade). | Baixa ou manual (Baseada exclusivamente na autodeclaração inicial da empresa). | **Avaliação pós-entrevista** com nota pública agregada e sem identificação, mais **denúncia moderada** pela administração. |
| **Cadastro de Vagas (RH)** | Preenchimento manual extenso. | Preenchimento manual campo a campo em formulários legados. | **Formulário estruturado** com acessibilidade declarada item a item e validação antes da publicação (extração por LLM prevista só para vagas externas, SPEC-006). |
| **Acessibilidade da Interface** | Parcial e inconsistente (Barreiras de navegação para leitores de tela). | Defasada (Interface antiga, baixo contraste e navegação rígida). | **Nativa WCAG 2.2 AA** (suporte a leitores de tela, navegação por teclado, alto contraste e tema escuro). |
| **Gestão do Funil Seletivo** | Linha do tempo padrão com foco nas necessidades do recrutador. | Baixa visibilidade de status e etapas para o candidato. | **Funil Transparente e Acessível** com etapa, histórico, entrevistas e avisos a cada mudança. |
