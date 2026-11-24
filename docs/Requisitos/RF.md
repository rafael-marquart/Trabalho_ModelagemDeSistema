# Requisitos Funcionais

Os requisitos seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas assim:

- `SHALL`: comportamento obrigatório do sistema.
- `SHALL NOT`: comportamento proibido.
- `WHEN`: evento que dispara o comportamento.
- `WHILE`: estado durante o qual o comportamento deve ocorrer.
- `IF`: condição (ou situação indesejada) para aplicação do comportamento.
- `WHERE`: funcionalidade ou contexto opcional de aplicação.

Os perfis são **Candidato**, **Empresa** (conta organizacional), **Recrutador** (convidado pela Empresa) e **Administrador**. A numeração é mantida para não quebrar as referências nas Specs; números sem requisito estão listados no fim, com o motivo. As regras citadas estão em [RB.md](RB.md) e os requisitos não funcionais em [RNF.md](RNF.md).

## Acesso e contas

### RF-01 Autenticação

**Tipo EARS:** Event-driven · **Specs:** SPEC-001

**WHEN** uma pessoa informar suas credenciais, o sistema **SHALL** validá-las e iniciar uma sessão do seu perfil: Candidato por e-mail ou CPF, Empresa e Recrutador por e-mail, e Administrador por e-mail na entrada própria da administração. Os limites de tentativas e de sessão estão no RNF-07.

### RF-02 Recuperação de senha

**Tipo EARS:** Event-driven · **Specs:** SPEC-001

**WHEN** um Candidato (por e-mail ou CPF), uma Empresa ou um Recrutador (por e-mail) pedir a recuperação de senha, o sistema **SHALL** enviar ao e-mail cadastrado um link de redefinição válido por 30 minutos e de uso único, sem revelar se a conta existe.

### RF-03 Perfis de acesso

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-001

**IF** uma pessoa acessar uma funcionalidade que não pertence ao seu perfil, o sistema **SHALL** recusar o acesso (RB-12).

### RF-17 Cadastro de empresa e de recrutadores

**Tipo EARS:** Event-driven · **Specs:** SPEC-001, SPEC-004

**WHEN** uma empresa se cadastrar e confirmar o e-mail, o sistema **SHALL** criar a conta organizacional. **WHEN** a Empresa convidar um Recrutador nas suas configurações, o sistema **SHALL** enviar o convite e, aceito, vinculá-lo apenas a essa empresa (RB-46).

### RF-42 Aceite dos Termos de Uso e da Política de Privacidade

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-001 (OPEN-100)

**IF** a pessoa não aceitar os Termos de Uso e a Política de Privacidade vigentes ao criar a conta, o sistema **SHALL NOT** concluir o cadastro. Cada aceite **SHALL** ficar registrado com a versão dos documentos.

### RF-40 Controle de acesso às operações administrativas

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-001, SPEC-006

**IF** uma operação administrativa (catálogo de acessibilidade, moderação de denúncias, importação de vagas externas) for pedida por quem não tem perfil de Administrador ativo, o sistema **SHALL** recusá-la.

## Perfil do candidato

### RF-04 Cadastro de candidato

**Tipo EARS:** Event-driven · **Specs:** SPEC-002

**WHEN** um candidato criar a conta, o sistema **SHALL** registrar nome, e-mail, CPF e senha, e permitir completar depois o perfil profissional e de acessibilidade (RF-19).

### RF-19 Gestão do perfil e das necessidades de acessibilidade

**Tipo EARS:** Event-driven · **Specs:** SPEC-002

**WHEN** o candidato editar o perfil, o sistema **SHALL** permitir consultar e atualizar escolaridade, formação, competências, idiomas, experiências, cursos, certificações, links profissionais, preferências de trabalho, necessidades funcionais de acessibilidade e recursos indispensáveis, além de enviar comprovantes.

As necessidades **SHALL** ser autodeclaradas, sem laudo (RB-28). A interface **SHALL** distinguir "não informado" de "não tenho necessidades", e dados ausentes **SHALL NOT** presumir compatibilidade (RB-16).

### RF-43 Consentimento para dados de acessibilidade

**Tipo EARS:** Complex · **Specs:** SPEC-002 (OPEN-100)

**WHEN** o candidato for informar dados de acessibilidade, o sistema **SHALL** pedir o consentimento específico antes de gravá-los. **IF** o candidato retirar o consentimento, o sistema **SHALL** apagar esses dados e deixar de mostrá-los às empresas (RB-47, RNF-18).

### RF-41 Foto de perfil

**Tipo EARS:** Optional feature · **Specs:** SPEC-002 (OPEN-101)

**WHERE** o Candidato ou o Recrutador quiser, o sistema **SHALL** permitir escolher, trocar e remover uma foto de perfil (JPG, PNG ou WebP, até 1 MB após o corte quadrado), visível conforme a RB-48.

## Interface e acessibilidade

### RF-16 Recursos de acessibilidade da interface

**Tipo EARS:** State-driven · **Specs:** SPEC-003

**WHILE** a pessoa usar a plataforma, o sistema **SHALL** oferecer navegação completa por teclado, compatibilidade com leitores de tela, alto contraste (automático, ligado ou desligado) e tema escuro, e **SHALL** lembrar a escolha na conta.

Comandos de voz próprios do sistema não fazem parte desta versão (seção 5.4 da SPEC-003, em aberto); a navegação por voz do sistema operacional funciona pelos nomes acessíveis dos controles.

### RF-44 Aviso de alterações não salvas

**Tipo EARS:** Event-driven · **Specs:** SPEC-003 (OPEN-101)

**WHEN** a pessoa tentar sair do perfil do candidato, do editor de vaga ou da infraestrutura da empresa com alterações não salvas, o sistema **SHALL** perguntar se deseja salvar e sair, sair sem salvar ou continuar na página. Nos formulários de denúncia e de avaliação, **SHALL** perguntar se deseja sair sem enviar.

### RF-45 Mostrar e ocultar a senha

**Tipo EARS:** Event-driven · **Specs:** SPEC-003

**WHEN** a pessoa acionar o botão do campo de senha, o sistema **SHALL** mostrar ou ocultar a senha digitada; ao enviar o formulário, a senha **SHALL** voltar a ficar oculta.

## Empresa e vagas

### RF-18 Gestão de vagas

**Tipo EARS:** Event-driven · **Specs:** SPEC-004, SPEC-005

**WHEN** a Empresa ou um Recrutador vinculado gerenciar vagas, o sistema **SHALL** permitir criar rascunhos, editar, publicar, pausar, reabrir e encerrar as vagas da própria empresa, com título, descrição, requisitos, modalidade, local, faixa salarial, prazo, critérios técnicos e recursos de acessibilidade da vaga. A Empresa **SHALL** poder declarar a infraestrutura de acessibilidade da empresa.

### RF-05 Importação de vagas externas

**Tipo EARS:** Optional feature · **Specs:** SPEC-006 (decisão de escopo pendente)

**WHERE** a importação de vagas externas estiver habilitada, o sistema **SHALL** mostrar ao candidato as vagas externas validadas, com a origem e o link do anúncio original (RB-10, RB-33).

### RF-36 Importação de dados estruturados

**Tipo EARS:** Optional feature · **Specs:** SPEC-006 (decisão de escopo pendente)

**WHERE** a importação de vagas externas estiver habilitada, o sistema **SHALL** receber as vagas no formato JSON da fonte autorizada, respeitando o limite de chamadas configurado, e **SHALL** registrar cada execução e o resultado de cada registro.

### RF-37 Normalização de dados externos

**Tipo EARS:** Optional feature · **Specs:** SPEC-006 (decisão de escopo pendente)

**WHERE** a importação de vagas externas estiver habilitada, o sistema **SHALL** converter cada registro válido para o modelo comum de vaga e descartar duplicados (RB-31), sem presumir dados de acessibilidade.

## Busca, vaga e compatibilidade

### RF-06 Busca e filtro

**Tipo EARS:** Event-driven · **Specs:** SPEC-008

**WHEN** o candidato buscar vagas, o sistema **SHALL** permitir pesquisar por texto e filtrar por cargo, área profissional, modalidade, localidade e recursos de acessibilidade, ordenando por compatibilidade, mais recentes ou mais antigas.

### RF-07 Análise de compatibilidade

**Tipo EARS:** Event-driven · **Specs:** SPEC-007

**WHEN** o candidato consultar uma vaga aberta, o sistema **SHALL** calcular o score de compatibilidade com os pesos das RB-03 a RB-05, usando apenas os dados informados.

### RF-08 Identificação de barreiras

**Tipo EARS:** Event-driven · **Specs:** SPEC-007

**WHEN** a compatibilidade for calculada, o sistema **SHALL** comparar cada necessidade do candidato com os recursos declarados na vaga e indicar as barreiras encontradas.

### RF-09 Restrição de vaga incompatível

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-007, SPEC-008

**IF** a vaga for classificada como incompatível pela trava de acessibilidade (RB-02), o sistema **SHALL NOT** listá-la como elegível na busca nem aceitar candidatura nela.

### RF-10 Visualização da vaga

**Tipo EARS:** Event-driven · **Specs:** SPEC-009, SPEC-010

**WHEN** o candidato abrir uma vaga, o sistema **SHALL** mostrar a disponibilidade atual, a descrição, os requisitos, a modalidade, o local, a faixa salarial, o prazo, os recursos de acessibilidade da vaga e a infraestrutura informada pela empresa, marcando como "Não informado" o que faltar.

### RF-24 Transparência do resultado de compatibilidade

**Tipo EARS:** Event-driven · **Specs:** SPEC-007, SPEC-008, SPEC-010

**WHEN** o sistema mostrar um score, o candidato **SHALL** poder ver o resultado de cada dimensão, os fatores considerados e o que falta informar (RB-30).

### RF-25 Transparência da compatibilidade da vaga

**Tipo EARS:** Event-driven · **Specs:** SPEC-005, SPEC-007, SPEC-008, SPEC-010

**WHEN** o candidato consultar uma vaga analisada, o sistema **SHALL** apresentar as informações de acessibilidade da vaga usadas na análise, separando o que falta da empresa do que falta do candidato.

## Candidatura e processo seletivo

### RF-26 Registro de candidatura

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-011

**IF** a vaga não for elegível (RB-01, RB-02) ou já houver candidatura ativa do candidato nela (RB-14), o sistema **SHALL** recusar a candidatura sem criar registro; caso contrário, **SHALL** registrá-la na etapa Inscrito e confirmar ao candidato.

### RF-11 Minhas candidaturas

**Tipo EARS:** Event-driven · **Specs:** SPEC-012, SPEC-016

**WHEN** o candidato abrir "Minhas candidaturas", o sistema **SHALL** listar suas candidaturas com a vaga, a empresa, a etapa atual e a data da candidatura.

### RF-28 Gestão da candidatura pelo candidato

**Tipo EARS:** Event-driven · **Specs:** SPEC-012

**WHEN** o candidato abrir uma candidatura, o sistema **SHALL** mostrar o status, as etapas e o histórico disponível, e oferecer o cancelamento quando permitido (RF-34). O candidato **SHALL NOT** poder editar a candidatura enviada, excluí-la ou mudar a etapa.

### RF-31 Acompanhamento do processo seletivo

**Tipo EARS:** Event-driven · **Specs:** SPEC-016

**WHEN** o candidato consultar uma candidatura, o sistema **SHALL** mostrar a etapa atual, as etapas já percorridas com data e as entrevistas agendadas, sem mostrar quem fez a mudança nem anotações internas da empresa.

### RF-34 Cancelamento de candidatura

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-012

**IF** o candidato pedir o cancelamento fora das condições da RB-36, o sistema **SHALL** recusá-lo e explicar o motivo; dentro delas, **SHALL** pedir confirmação, cancelar e preservar o histórico.

### RF-20 Gestão de candidaturas pela empresa

**Tipo EARS:** Event-driven · **Specs:** SPEC-013

**WHEN** a Empresa ou um Recrutador vinculado abrir as candidaturas de uma vaga da empresa, o sistema **SHALL** mostrar os candidatos, a etapa e a compatibilidade de cada um, e os dados de acessibilidade permitidos pela RB-26.

### RF-30 Gestão de candidatos no processo seletivo

**Tipo EARS:** Event-driven · **Specs:** SPEC-002, SPEC-013

**WHEN** a Empresa ou um Recrutador vinculado abrir uma candidatura, o sistema **SHALL** mostrar o nome e o e-mail de contato, o perfil profissional, o resumo da compatibilidade, as necessidades e os recursos indispensáveis de acessibilidade (com consentimento, RB-26) e a foto, se houver. Comprovantes, CPF, descrições livres de acessibilidade e informações médicas **SHALL NOT** ser mostrados (OPEN-055).

### RF-35 Gestão do funil de seleção

**Tipo EARS:** Event-driven · **Specs:** SPEC-013

**WHEN** a Empresa ou um Recrutador vinculado mudar a etapa de uma candidatura ou agendar, alterar ou cancelar uma entrevista, o sistema **SHALL** aplicar as RB-39 e RB-43 e registrar a mudança (RB-27).

## Avisos

### RF-12 Notificações

**Tipo EARS:** Event-driven · **Specs:** SPEC-009, SPEC-017

**WHEN** ocorrer uma das situações da RB-23 ou uma mudança no andamento de uma denúncia, o sistema **SHALL** avisar as pessoas afetadas na área de notificações do site e, se elas não tiverem desligado essa opção, também por e-mail.

### RF-27 Notificações do processo seletivo

**Tipo EARS:** Event-driven · **Specs:** SPEC-009, SPEC-016, SPEC-017

**WHEN** a candidatura for registrada ou mudar de etapa, o sistema **SHALL** avisar o candidato conforme o RF-12. **WHEN** o candidato cancelar a candidatura, o sistema **SHALL** avisar o responsável pela vaga (quem a criou, se ainda vinculado, ou a conta da Empresa; OPEN-093).

## Avaliações, denúncias e moderação

### RF-21 Avaliação do processo seletivo

**Tipo EARS:** Event-driven · **Specs:** SPEC-018

**WHEN** uma entrevista do candidato for concluída, o sistema **SHALL** permitir que ele registre, em até 60 dias, uma única avaliação com notas de acessibilidade e de postura inclusiva e um comentário opcional.

### RF-13 Nota de acessibilidade

**Tipo EARS:** Event-driven · **Specs:** SPEC-021

**WHEN** a vaga de uma empresa ou a página inicial da empresa for exibida, o sistema **SHALL** mostrar a nota pública da empresa como contagem de avaliações por número de estrelas, conforme as RB-19 e RB-20.

### RF-14 Denúncia de incompatibilidade

**Tipo EARS:** Event-driven · **Specs:** SPEC-019

**WHEN** um candidato que teve entrevista concluída numa candidatura à vaga encontrar divergência de acessibilidade ou falsa inclusão, o sistema **SHALL** permitir registrar uma denúncia vinculada à vaga, com categoria, descrição e evidência opcional (sem laudo ou documento pessoal), respeitando o limite da RB-24, e acompanhar o andamento. **IF** o candidato não teve entrevista concluída naquela vaga, o sistema **SHALL** recusar a denúncia (revisão da OPEN-074 em 01/11/2026).

### RF-22 Moderação e gestão de denúncias

**Tipo EARS:** Event-driven · **Specs:** SPEC-020

**WHEN** houver denúncia registrada, o sistema **SHALL** permitir ao Administrador iniciar a análise, ajustar a prioridade, pedir informações à empresa e concluir com decisão fundamentada (RB-44, RB-45).

## Rastreabilidade e erros

### RF-38 Auditoria de operações

**Tipo EARS:** Event-driven · **Specs:** SPEC-004, SPEC-005, SPEC-006

**WHEN** ocorrer uma operação relevante, o sistema **SHALL** registrar o evento conforme o RNF-14.

### RF-39 Tratamento de erros e inconsistências

**Tipo EARS:** Unwanted behavior · **Specs:** SPEC-006

**IF** uma operação falhar ou receber dados inconsistentes, o sistema **SHALL** recusá-la sem gravar alterações parciais (RNF-09), mostrar à pessoa uma mensagem que diga o que fazer e registrar a falha (RNF-17).

## Números sem requisito

- **RF-15, RF-29, RF-32 e RF-33:** não usados na baseline aprovada.
- **RF-23:** removido por duplicidade, como registrado na revisão de consistência das Specs.
