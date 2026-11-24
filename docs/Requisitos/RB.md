# Regras de Negócio

As regras seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas assim:

- `SHALL`: comportamento ou restrição obrigatória.
- `SHALL NOT`: comportamento proibido.
- `WHEN`: evento que dispara a regra.
- `WHILE`: estado durante o qual a regra se aplica.
- `IF`: condição (ou situação indesejada) para aplicação da regra.
- `WHERE`: funcionalidade ou contexto opcional de aplicação.

A numeração é mantida para não quebrar as referências nas Specs, nos casos de uso e no código. Regras removidas ou incorporadas a outra continuam listadas, com o motivo.

## Candidatura e elegibilidade

### RB-01 Elegibilidade para candidatura

**Tipo EARS:** Unwanted behavior

**IF** a vaga não estiver aberta, estiver fora do prazo de inscrição ou não for uma vaga publicada por empresa na plataforma, o sistema **SHALL** recusar a candidatura sem criar registro.

### RB-02 Trava de acessibilidade

**Tipo EARS:** Unwanted behavior

**IF** a vaga declarar a ausência de um recurso que corresponde a uma necessidade marcada pelo candidato como obrigatória, o sistema **SHALL** classificar a vaga como incompatível para esse candidato, qualquer que seja o score.

### RB-03 Peso da acessibilidade

**Tipo EARS:** Ubíquo

A dimensão de acessibilidade **SHALL** representar **50%** do score de compatibilidade.

### RB-04 Peso do perfil técnico

**Tipo EARS:** Ubíquo

A dimensão de perfil técnico **SHALL** representar **30%** do score de compatibilidade.

### RB-05 Peso de modalidade e deslocamento

**Tipo EARS:** Ubíquo

A dimensão de modalidade e deslocamento **SHALL** representar **20%** do score de compatibilidade.

### RB-06 Necessidades obrigatórias

**Tipo EARS:** Ubíquo

As necessidades funcionais que o candidato marcar como obrigatórias **SHALL** participar da análise de acessibilidade e da trava da RB-02.

### RB-07 Perfil técnico

**Tipo EARS:** Ubíquo

A dimensão de perfil técnico **SHALL** comparar escolaridade, formação, competências e idiomas do candidato com os critérios definidos pela empresa na vaga. **IF** a vaga não tiver critérios técnicos, a dimensão **SHALL** ficar fora do cálculo e os pesos restantes **SHALL** ser redistribuídos proporcionalmente.

### RB-08 Divergências recorrentes

**Tipo EARS:** Optional feature

**WHERE** o tratamento de divergências recorrentes estiver disponível, divergências repetidas entre a acessibilidade declarada pela empresa e a relatada pelos candidatos **SHALL** gerar uma análise administrativa, e só a decisão registrada dessa análise **SHALL** poder alterar a informação da empresa.

Não implementada nesta versão: a seção 5.5 da SPEC-004 foi adiada.

### RB-09 (removida)

Número não usado na baseline aprovada.

## Vagas externas (SPEC-006, decisão de escopo pendente)

### RB-10 Vagas externas

**Tipo EARS:** Optional feature

**WHERE** a importação de vagas externas estiver habilitada, cada vaga recebida **SHALL** ser identificada, validada e convertida para o modelo comum de vaga antes de aparecer para os candidatos.

### RB-11 Validação da extração por LLM

**Tipo EARS:** Unwanted behavior

**IF** um dado da vaga externa vier de extração por LLM, o sistema **SHALL** usá-lo apenas depois de conferir que o valor está escrito no anúncio original.

### RB-17 Validação de vaga externa

Incorporada à RB-10: uma vaga externa só participa da busca e da compatibilidade depois da validação e da normalização.

### RB-18 Resultado da LLM não é fonte de verdade

**Tipo EARS:** Unwanted behavior

**IF** a validação da RB-11 falhar, o sistema **SHALL** descartar o dado extraído e **SHALL NOT** completá-lo por suposição; a vaga segue só com os dados da fonte ou é rejeitada com o motivo registrado.

### RB-31 Deduplicação de dados externos

**Tipo EARS:** Event-driven

**WHEN** um registro externo tiver o mesmo identificador na mesma fonte, o mesmo link original ou a mesma empresa, título, cidade e estado de uma vaga externa já importada, o sistema **SHALL** registrá-lo como duplicado e **SHALL NOT** criar outra vaga. Na dúvida, os registros **SHALL** ficar separados.

### RB-32 Integridade da importação

**Tipo EARS:** Unwanted behavior

**IF** a importação de um registro falhar, o sistema **SHALL** manter inalteradas as vagas já existentes e continuar com os demais registros.

### RB-33 Registro da origem da vaga

**Tipo EARS:** Ubíquo

Toda vaga externa **SHALL** manter a fonte, o identificador e o link do anúncio original, mostrados ao candidato.

## Acesso, sessão e transparência

### RB-12 Controle de acesso

**Tipo EARS:** Unwanted behavior

**IF** uma pessoa solicitar uma funcionalidade de outro perfil (Candidato, Empresa, Recrutador ou Administrador) ou dados de outra empresa, o sistema **SHALL** recusar a solicitação.

### RB-13 Transparência antes da candidatura

**Tipo EARS:** Event-driven

**WHEN** o candidato abrir o detalhe de uma vaga, o sistema **SHALL** mostrar, antes do botão de candidatura, os recursos de acessibilidade declarados, a infraestrutura informada pela empresa e o resultado da compatibilidade.

### RB-16 Dados de acessibilidade não informados

**Tipo EARS:** Unwanted behavior

**IF** um dado necessário de acessibilidade não tiver sido informado, o sistema **SHALL** mostrá-lo como "Não informado" e **SHALL NOT** presumir compatibilidade nem incompatibilidade.

### RB-21 Segurança de autenticação

**Tipo EARS:** Unwanted behavior

**IF** as credenciais estiverem incorretas ou a conta estiver bloqueada, inativa ou pendente de ativação, o sistema **SHALL** recusar o acesso com uma mensagem que não revele qual dado está errado. Os limites de tentativas estão no RNF-07.

### RB-22 Controle de sessão

**Tipo EARS:** State-driven

**WHILE** a sessão não estiver válida (expirada, encerrada ou revogada), o sistema **SHALL** recusar as funcionalidades protegidas e levar a pessoa à página de entrada.

### RB-23 Transparência de status

**Tipo EARS:** Event-driven

**WHEN** a etapa de uma candidatura mudar, uma entrevista for agendada, alterada ou cancelada, ou a vaga for encerrada, o sistema **SHALL** informar o candidato na plataforma e, se ele não tiver desligado essa opção, por e-mail.

## Denúncias e avaliações

### RB-19 Anonimato das avaliações públicas

**Tipo EARS:** Ubíquo

A nota pública **SHALL** mostrar apenas contagens por número de estrelas e **SHALL NOT** mostrar nome, identificador, data ou comentário de quem avaliou.

### RB-20 Nota de acessibilidade baseada em dados registrados

**Tipo EARS:** Ubíquo

A nota pública de uma empresa **SHALL** ser calculada apenas com avaliações pós-entrevista válidas, de entrevistas concluídas, enviadas em até **60 dias**, uma por entrevista.

### RB-24 Proteção contra abuso

**Tipo EARS:** Unwanted behavior

**IF** um candidato já tiver registrado **3 denúncias nas últimas 24 horas**, o sistema **SHALL** recusar uma nova até o fim desse período. **IF** já houver candidatura ativa na mesma vaga, o sistema **SHALL** recusar outra (RB-14).

### RB-25 Apuração de denúncias

**Tipo EARS:** Event-driven

**WHEN** uma denúncia for registrada, o sistema **SHALL** encaminhá-la para análise do Administrador, com prazo de referência de **5 dias úteis**.

### RB-44 Análise administrativa de denúncias

**Tipo EARS:** Unwanted behavior

**IF** uma denúncia ainda não tiver decisão registrada pelo Administrador, o sistema **SHALL NOT** alterar a nota pública nem pausar, encerrar ou ocultar a vaga por causa dela.

### RB-45 Decisão sobre denúncia

**Tipo EARS:** Event-driven

**WHEN** o Administrador concluir a análise, o sistema **SHALL** registrar a decisão, o fundamento e as medidas definidas, e avisar quem denunciou e a empresa. A decisão **SHALL NOT** editar avaliações nem a nota pública (OPEN-085).

## Perfil do candidato e privacidade

### RB-26 Confidencialidade das informações de acessibilidade

**Tipo EARS:** Unwanted behavior

**IF** uma Empresa ou um Recrutador consultar dados de acessibilidade de um candidato, o sistema **SHALL** mostrar apenas os dados necessários à candidatura em vaga sob sua responsabilidade, e somente enquanto houver consentimento válido (RB-47).

O sistema **SHALL NOT** dar acesso a candidatos ou candidaturas de outras empresas nem a laudos médicos. Avançar, encerrar ou mudar de etapa **SHALL NOT** ampliar essas permissões.

### RB-28 Autodeclaração das necessidades

**Tipo EARS:** Ubíquo

O candidato **SHALL** informar suas necessidades por autodeclaração. O sistema **SHALL NOT** exigir nem armazenar laudo médico.

### RB-29 Informações mínimas do perfil

**Tipo EARS:** Unwanted behavior

**IF** faltar ao perfil um dado necessário para alguma dimensão da compatibilidade, o sistema **SHALL** calcular só o que for possível e indicar ao candidato o que completar.

### RB-30 Transparência do resultado

**Tipo EARS:** Event-driven

**WHEN** a compatibilidade for exibida, o sistema **SHALL** mostrar o score de cada dimensão, os fatores que pesaram e o que faltou informar, separando o que depende do candidato do que depende da empresa.

### RB-47 Consentimento para dados de acessibilidade

**Tipo EARS:** Complex

**WHEN** o candidato informar dados de acessibilidade, o sistema **SHALL** exigir antes o consentimento específico para esse tratamento. **IF** o consentimento for retirado, o sistema **SHALL** apagar esses dados do perfil e deixar de mostrá-los às empresas (OPEN-100, RNF-18).

### RB-48 Visibilidade da foto de perfil

**Tipo EARS:** Ubíquo

A foto de perfil do candidato **SHALL** ser visível apenas para ele e para as empresas e recrutadores das vagas em que ele se candidatou. A foto do recrutador **SHALL** aparecer apenas na área do próprio recrutador (OPEN-101).

## Funil e histórico

### RB-14 Uma candidatura ativa por vaga

**Tipo EARS:** Unwanted behavior

**IF** o candidato já tiver candidatura ativa na vaga, o sistema **SHALL** recusar uma nova candidatura nessa mesma vaga.

### RB-15 Barreira crítica prevalece sobre a pontuação

Incorporada à RB-02: a trava de acessibilidade vale qualquer que seja o score e impede candidatura e recomendação.

### RB-27 Histórico de alterações

**Tipo EARS:** Event-driven

**WHEN** a etapa de uma candidatura mudar, o sistema **SHALL** registrar a etapa anterior e a nova, a data e hora, quem fez a mudança, o tipo de movimentação e a justificativa quando o fluxo a exigir.

Eventos anteriores **SHALL NOT** ser apagados ou alterados. Uma reversão **SHALL** ser aceita apenas quando corresponder a uma transição prevista na RB-39.

### RB-34 Candidatura somente em vaga elegível

Incorporada às RB-01, RB-02 e RB-14.

### RB-35 (removida)

Removida por duplicidade com a RB-14.

### RB-36 Cancelamento de candidatura

**Tipo EARS:** Complex

**WHILE** a candidatura estiver ativa, o candidato **SHALL** poder cancelá-la, após confirmação. **IF** a vaga estiver encerrada, o cancelamento **SHALL** ser aceito apenas até a etapa Entrevista (Inscrito, Triagem ou Entrevista). O registro e o histórico **SHALL** ser preservados e ficar visíveis ao candidato por **60 dias**.

### RB-37 Registro das decisões

Incorporada às RB-27 e RB-41.

### RB-38 Estados do funil

**Tipo EARS:** Ubíquo

Toda candidatura **SHALL** estar em uma destas etapas: Inscrito, Triagem, Entrevista, Finalista, Contratado, Recusada ou Cancelada.

### RB-39 Transições válidas do funil

**Tipo EARS:** Unwanted behavior

**IF** a mudança de etapa solicitada não estiver entre as transições previstas em `docs/Fluxos e Estados/estados-trilha.md`, o sistema **SHALL** recusá-la sem alterar a etapa.

### RB-40 (removida)

Número não usado na baseline aprovada.

### RB-41 Auditoria das alterações

**Tipo EARS:** Event-driven

**WHEN** ocorrer mudança de etapa, decisão sobre denúncia, cancelamento, mudança de status da vaga ou alteração de consentimento, o sistema **SHALL** gravar um evento de auditoria, conforme o RNF-14.

### RB-42 Vaga encerrada

**Tipo EARS:** Event-driven

**WHEN** uma vaga for encerrada, o sistema **SHALL** recusar novas candidaturas nela e avisar os candidatos com candidatura ativa.

### RB-43 Validação para avanço no processo

**Tipo EARS:** Unwanted behavior

**IF** quem pede a mudança de etapa não estiver autenticado e autorizado a gerenciar a vaga, a transição não estiver prevista na RB-39 ou houver pendência impeditiva conhecida, o sistema **SHALL** recusar a mudança sem alterar a etapa. Nesse caso o Recrutador **SHALL** poder pedir a complementação das informações necessárias (UC-09).

Uma transição válida **SHALL** atualizar a etapa e ser registrada conforme RB-27 e RB-41. O sistema **SHALL NOT** presumir critérios adicionais por etapa, notas mínimas ou documentos obrigatórios sem decisão explícita do projeto.

## Empresas e recrutadores

### RB-46 Cadastro de recrutador pela empresa

**Tipo EARS:** Unwanted behavior

**IF** quem tentar cadastrar ou vincular um Recrutador não for a conta da Empresa, autenticada, o sistema **SHALL** recusar a operação. O Recrutador **SHALL** permanecer vinculado apenas à empresa que o convidou.
