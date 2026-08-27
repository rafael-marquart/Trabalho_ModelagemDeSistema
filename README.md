# Trabalho_ModelagemDeSistema
Repositório para o trabalho de modelagem de sistemas - GRUPO: Gabriella Mansur (10735556), Julia Muniz (10737947) e Rafael Fontes (10737568)

# Visão Geral do Projeto
- O **AcessaVagas** é uma plataforma de recrutamento e seleção inclusiva projetada para conectar profissionais com deficiência (PCD) a ambientes de trabalho genuinamente acessíveis, combatendo diretamente o fenômeno da falsa inclusão

# Questão Problematizadora
- A maioria dos portais de emprego limita a acessibilidade a um *checkbox* genérico ("Vaga para PCD"), sem detalhar a infraestrutura do local de trabalho. Isso faz com que profissionais PCD invistam tempo, recursos e energia em processos seletivos para postos que possuem barreiras físicas ou digitais incompatíveis com suas necessidades funcionais reais.

# Solução
- Plataforma efetua um mapeamento detalhado do perfil do candidato e da estrutura real da empresa, aplicando um algoritmo de compatibilidade funcional determinística, assegurando transparência ao candidato antes da candidatura e validação contínua da infraestrutura após a entrevista.

# Diferenciais 
* **Algoritmo de Correspondência com Trava Crítica:** Avalia a compatibilidade entre o candidato, a vaga e a infraestrutura disponível pela empresa em três camadas:
  * **50% Acessibilidade:** Se houver qualquer barreira física ou digital eliminatória, o sistema aciona a trava crítica e zera o *match*, ocultando a vaga.
  * **30% Perfil Técnico:** Cruzamento de competências, escolaridade e experiências.
  * **20% Geolocalização/Modalidade:** Avaliação de tempo de deslocamento e formato da vaga (presencial, híbrido ou remoto).
* **Auditoria Colaborativa Pós-Entrevista:** Pesquisa anônima e adaptativa enviada ao candidato após a entrevista para avaliar a estrutura real encontrada. Alimenta a Nota Pública de Acessibilidade da empresa e dispara o bloqueio preventivo de vagas para moderação em caso de denúncias de falsa acessibilidade.
* **Modelo Duplo de Entrada de Vagas:** 
  * **Publicação Nativa:** Painel para empresas parceiras cadastrarem e gerenciarem processos seletivos.
  * **Publicação de Vagas Externas:** Extração e estruturação automática de anúncios públicos (via URL ou texto colado) utilizando IA (LLM) para conversão em formato JSON padronizado.
* **Acessibilidade por Design (WCAG 2.1 AA):** Desenvolvida em conformidade com Lei Brasileira de Inclusão (LBI nº 13.146/2015), garantindo autonomia total com leitores de tela, navegação por teclado, comandos de voz e modo de alto contraste.
* **Funil Seletivo Transparente:** Painéis exclusivos para acompanhamento de etapas em tempo real com indicação clara do formato da entrevista (presencial ou online) e das acomodações necessárias.
