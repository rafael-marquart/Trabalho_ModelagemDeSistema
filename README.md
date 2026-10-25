# Trabalho_ModelagemDeSistema
Repositório para o trabalho de modelagem de sistemas - GRUPO: Gabriella Mansur (10735556), Julia Muniz (10737947) e Rafael Fontes (10737568).

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
* **Funil Seletivo Transparente:** Painéis exclusivos para acompanhamento de etapas em tempo real com indicação clara do formato da entrevista (presencial ou online).


## Aplicação web — início da implementação

A aplicação está sendo construída incrementalmente na raiz deste repositório, mantendo os documentos de requisitos em `docs/`.

**Stack inicial:** Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Argon2id, Zod e Vitest.

### Executar localmente

1. Instale Node.js 20.9+ e PostgreSQL 15+.
2. Execute `npm install`.
3. Copie `.env.example` para `.env` e configure `DATABASE_URL`.
4. Execute `npm run db:generate` e `npm run db:migrate`.
5. Execute `npm run dev` e abra http://localhost:3000.

### Estado da implementação

A branch de implementação contém a entrada/login, autenticação por credenciais, sessões revogáveis, cadastro inicial de candidato e empresa, recuperação/redefinição de senha, confirmação de e-mail corporativo por link de uso único válido por 24 horas e fluxo inicial de convites de recrutadores (envio, reenvio, cancelamento, aceite e recusa). A confirmação do e-mail não ativa a conta organizacional: a validação do identificador oficial também é necessária. A implementação inclui migração PostgreSQL, restrição de unicidade para vínculo ativo, testes SQL de concorrência, CI com validação de Prisma, TypeScript, lint, testes unitários e build. A rotina de retenção de auditoria oferece simulação por padrão e descarte explícito de eventos com mais de um ano-calendário, preservando eventos marcados com `retentionHold`; veja `docs/operacao/retencao-auditoria.md`.

Permanecem pendentes, entre outros: definição do procedimento para validar o identificador oficial e ativar a empresa, aprovação dos layouts ainda pendentes, testes de integração/E2E e revisão de segurança operacional. Os reenvios de convite são serializados por empresa/conta e a falha de entrega verifica o token atual para não cancelar um reenvio mais recente. A configuração de proxy confiável, origem pública canônica (`APP_BASE_URL`), SMTP e agendamento da rotina de retenção devem ser validados/configurados no ambiente. A aplicação não deve ser publicada em produção até que a SPEC-001 e os critérios de segurança sejam validados.
