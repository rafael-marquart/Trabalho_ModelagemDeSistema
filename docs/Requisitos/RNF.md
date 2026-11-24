# Requisitos Não Funcionais

Os requisitos seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas assim:

- `SHALL`: comportamento obrigatório do sistema.
- `SHALL NOT`: comportamento proibido.
- `SHOULD`: comportamento recomendado, mas não obrigatório.
- `WHEN`: evento que dispara o comportamento.
- `WHILE`: estado durante o qual o comportamento deve ocorrer.
- `IF`: condição (ou situação indesejada) para aplicação do comportamento.
- `WHERE`: funcionalidade ou contexto opcional de aplicação.

Os valores numéricos abaixo são os mesmos usados no código e nas Specs; quando um deles mudar, este arquivo muda junto.

## RNF-01 Acessibilidade

**Tipo EARS:** Ubíquo

O sistema **SHALL** atender às diretrizes da **WCAG 2.2, nível AA**, em todas as páginas de todos os perfis.

Toda tela nova ou alterada **SHALL** passar sem violações na verificação automática do axe-core (regras `wcag2a`, `wcag2aa`, `wcag21aa` e `wcag22aa`) e **SHALL** ser conferida manualmente com teclado e leitor de tela antes da aprovação do layout.

## RNF-02 Compatibilidade com leitores de tela

**Tipo EARS:** Ubíquo

Todo controle interativo **SHALL** ter nome acessível, função e estado expostos à tecnologia assistiva. Mensagens de sucesso, erro e andamento **SHALL** ser anunciadas sem que a pessoa precise procurá-las (regiões `status` ou `alert`). Imagens apenas decorativas **SHALL NOT** ser lidas.

O funcionamento **SHALL** ser conferido com NVDA (Windows) e com o leitor do celular (TalkBack ou VoiceOver), conforme os roteiros em `docs/operacao/`.

## RNF-03 Responsividade

**Tipo EARS:** Ubíquo

A interface **SHALL** funcionar de **320 px** de largura (celular) até telas de computador, sem rolagem horizontal da página e sem perda de conteúdo ou função, inclusive com **zoom de 200%** (WCAG 1.4.4 e 1.4.10).

## RNF-04 Usabilidade

**Tipo EARS:** Complex

A interface **SHALL** usar linguagem simples, navegação consistente dentro de cada perfil e alvos de toque de pelo menos **24 × 24 px** (WCAG 2.5.8).

**WHEN** um dado informado for recusado, o sistema **SHALL** indicar o campo e o que fazer para corrigir.

**WHEN** a pessoa tentar sair de uma página com alterações não salvas, o sistema **SHALL** perguntar antes se deseja salvar, sair sem salvar ou continuar na página (OPEN-101).

## RNF-05 Desempenho

**Tipo EARS:** Complex

**WHEN** uma pessoa executar uma ação principal (entrar, buscar vagas, abrir o detalhe de uma vaga, candidatar-se, mudar a etapa de uma candidatura ou salvar um cadastro), **IF** a operação não depender de serviço externo (cálculo de trajeto, fonte de vagas externas, LLM ou envio de e-mail), o sistema **SHALL** responder em menos de **2 segundos** em 95% das requisições, com até **500 vagas abertas**.

Chamadas a serviços externos **SHALL** ter tempo limite (cálculo de trajeto: 8 s) e **SHALL NOT** bloquear a ação principal: quando o tempo estoura, o sistema segue sem aquele dado e informa que ele não pôde ser obtido.

## RNF-06 Disponibilidade

**Tipo EARS:** Unwanted behavior

O sistema **SHOULD** permanecer disponível de forma contínua, exceto em manutenções programadas da hospedagem.

**IF** um serviço externo (cálculo de trajeto, envio de e-mail ou fonte de vagas externas) estiver indisponível, o sistema **SHALL** continuar funcionando sem a parte que depende dele. Os avisos por e-mail que falharem **SHALL** ser tentados de novo até **5 vezes**, com intervalos crescentes (1 min, 5 min, 30 min e 2 h).

## RNF-07 Segurança de acesso e sessão

**Tipo EARS:** Unwanted behavior

**IF** uma funcionalidade manipular dados pessoais, de empresa, de vaga, de candidatura ou de administração, o sistema **SHALL** exigir sessão válida e perfil autorizado antes de executá-la (RB-12, RB-22).

O sistema **SHALL**:

- guardar senhas apenas como hash **Argon2id**;
- exigir senha com pelo menos **10 caracteres**, com letra maiúscula, letra minúscula e número;
- bloquear a conta por **15 minutos** após **10 tentativas incorretas consecutivas** de login;
- encerrar a sessão após **60 minutos sem uso** ou, com "lembrar de mim", em até **30 dias**;
- usar cookie de sessão `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- recusar requisições que alteram dados quando vierem de outra origem;
- usar links de recuperação de senha válidos por **30 minutos** e de uso único, com no máximo **3 pedidos** por conta e por IP a cada 15 minutos.

O sistema **SHALL NOT** guardar chaves de serviços externos no repositório nem enviá-las ao navegador.

## RNF-08 Privacidade (LGPD)

**Tipo EARS:** Ubíquo

O sistema **SHALL** tratar dados pessoais conforme a LGPD e coletar apenas o necessário para a finalidade de cada funcionalidade.

O sistema **SHALL NOT** armazenar laudo médico (RB-28). Comprovantes enviados pelo candidato **SHALL** ter até **4 MB**, em PDF, JPG, PNG, DOC ou DOCX conferidos pelo conteúdo do arquivo; a foto de perfil **SHALL** ter até **1 MB**, em JPG, PNG ou WebP.

Registros de auditoria, de segurança de login, de compatibilidade e notificações **SHALL** ser apagados após **1 ano**; avaliações pós-entrevista **SHALL** ser anonimizadas após **1 ano**, mantendo só as notas, a empresa e o ano.

## RNF-09 Integridade dos dados

**Tipo EARS:** Ubíquo

Operações que alteram mais de um registro (candidatura, mudança de etapa, decisão de denúncia, consentimento) **SHALL** ser gravadas numa única transação: ou tudo é gravado, ou nada é.

O histórico do funil, o histórico da moderação, os registros de consentimento e as notas de avaliação **SHALL NOT** ser alterados nem apagados fora das rotinas de retenção; o próprio banco recusa essas alterações. O banco **SHALL** impedir mais de uma candidatura ativa do mesmo candidato na mesma vaga (RB-14).

## RNF-10 Confiabilidade do cálculo de compatibilidade

**Tipo EARS:** Event-driven

**WHEN** a compatibilidade for calculada duas vezes com os mesmos dados do candidato e da vaga, o sistema **SHALL** produzir o mesmo resultado.

O cálculo **SHALL** usar os pesos 50% (acessibilidade), 30% (perfil técnico) e 20% (modalidade e deslocamento) (RB-03 a RB-05) e **SHALL NOT** usar LLM nem presumir dado não informado (RB-16).

## RNF-11 Escalabilidade

**Tipo EARS:** Ubíquo

O sistema **SHOULD** atender ao RNF-05 com pelo menos **500 vagas abertas** e **5.000 candidaturas** sem mudança de arquitetura. Acima disso, a busca de vagas **SHOULD** passar a filtrar e paginar no banco de dados.

## RNF-12 Manutenibilidade

**Tipo EARS:** Ubíquo

As regras de negócio **SHALL** ficar em módulos de domínio (`src/lib`), separadas das telas e das rotas (ADR-004). O código **SHALL** passar na checagem de tipos (TypeScript) e no lint sem erros antes de ser integrado.

## RNF-13 Compatibilidade de navegadores

**Tipo EARS:** Ubíquo

O sistema **SHALL** funcionar nas duas versões mais recentes do Chrome, Edge, Firefox e Safari, em computador, Android e iOS.

## RNF-14 Rastreabilidade e auditoria

**Tipo EARS:** Event-driven

**WHEN** ocorrer uma operação relevante (login, recuperação de senha, cadastro e alteração de vaga, mudança de etapa, decisão sobre denúncia, consentimento, envio ou remoção de foto e de comprovante, importação de vagas), o sistema **SHALL** registrar o evento com data e hora, autor, tipo de operação e objeto afetado (RB-27, RB-37, RB-41).

O registro **SHALL NOT** conter senha, hash de senha, token de sessão, link de recuperação nem chave de serviço externo.

## RNF-15 Testabilidade

**Tipo EARS:** Event-driven

As regras de negócio críticas (compatibilidade, funil, permissões, denúncias, avaliações) **SHALL** poder ser testadas isoladamente, sem banco nem serviço externo.

**WHEN** um pull request for aberto, a integração contínua **SHALL** executar checagem de tipos, lint, testes automatizados, build e o teste de ponta a ponta; o pull request **SHALL NOT** ser integrado com alguma dessas etapas falhando.

## RNF-16 Interoperabilidade

**Tipo EARS:** Optional feature

**WHERE** a importação de vagas externas estiver habilitada (SPEC-006, decisão de escopo pendente), o sistema **SHALL** normalizar as vagas recebidas para o modelo comum de vaga, manter a identificação da origem (RB-33) e respeitar o limite de chamadas configurado para a fonte. As credenciais da fonte **SHALL** ficar apenas no servidor.

## RNF-17 Registro de operação (log)

**Tipo EARS:** Unwanted behavior

**IF** uma falha ocorrer ao chamar um serviço externo, enviar um aviso ou executar uma rotina agendada, o sistema **SHALL** registrá-la na saída do servidor com data e hora, rotina e desfecho.

Esse registro **SHALL NOT** conter dados pessoais, senhas, tokens nem chaves de serviço externo.

## RNF-18 Consentimento para dados de acessibilidade

**Tipo EARS:** Complex

**WHEN** o candidato informar necessidades ou recursos de acessibilidade (dado sensível, LGPD art. 11), o sistema **SHALL** exigir antes um consentimento específico e destacado, separado do aceite dos Termos de Uso (OPEN-100).

**IF** o candidato retirar o consentimento, o sistema **SHALL** apagar os dados de acessibilidade do perfil e deixar de mostrá-los às empresas. Cada concessão e retirada **SHALL** ficar registrada, sem possibilidade de edição.

## RNF-19 Identidade visual e temas

**Tipo EARS:** Ubíquo

O sistema **SHALL** aplicar o logotipo e a paleta definidos em `docs/Identidade Visual/` em todas as áreas e **SHALL** oferecer os temas claro, escuro e de alto contraste, mantendo o contraste mínimo da WCAG 2.2 AA em todos eles.
