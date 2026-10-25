# UC-07 — Cadastrar Infraestrutura da Empresa

## Objetivo

Permitir à empresa manter suas informações de acessibilidade e administrar os recrutadores vinculados à sua conta.

## Ator principal

- Empresa.

## Pré-condições

- A empresa deve estar autenticada e possuir uma conta corporativa cadastrada.

## Fluxo Principal

1. A empresa acessa "Configurações da Empresa".
2. A empresa pode acessar o "Mapeamento de Infraestrutura" e preencher o questionário estruturado sobre rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas, respeitando as categorias aprovadas na OPEN-017. As respostas são adequadas à natureza de cada item e, quando aplicável, distinguem presença declarada, ausência declarada e informação não informada; não se presume acessibilidade ou inacessibilidade a partir de dado ausente.
3. A empresa pode acessar a seção "Recrutadores" para cadastrar um novo recrutador.
4. A empresa informa nome e e-mail do recrutador.
5. Se o e-mail corresponder a uma conta elegível de Recrutador, o sistema envia convite de uso único ao titular, que deve aceitar explicitamente o vínculo.
6. Se o e-mail ainda não corresponder a uma conta, o sistema cria uma conta RECRUITER inativa com credencial aleatória não divulgada e envia link de uso único. A pessoa define sua senha e aceita explicitamente o vínculo pelo link.
7. O sistema só ativa a conta recém-criada e efetiva o vínculo após o aceite; a conta e o vínculo são atualizados atomicamente. Convites expiram em 7 dias e podem ser reenviados ou cancelados enquanto pendentes.

## Exceções e Fluxos Alternativos

- EX01 (Alerta de Campos Obrigatórios Pendentes): O sistema impede o salvamento quando itens definidos como obrigatórios estiverem pendentes e identifica os itens a completar. A lista individual de obrigatórios permanece pendente de definição; nem todos os campos são automaticamente obrigatórios.
- EX02 (Conta de recrutador inelegível): Se a conta existente não tiver perfil RECRUITER, estiver desativada ou já possuir vínculo ativo com outra empresa, o sistema não cria o vínculo e informa que não foi possível processar a solicitação.

## Relação entre infraestrutura geral e critérios da vaga — decisão OPEN-023

- O mapeamento representa informações gerais de acessibilidade da Empresa; não garante que todos os recursos sejam aplicáveis ou estejam disponíveis em toda oportunidade.
- Quando a aplicabilidade de um recurso depender das condições da oportunidade, a vaga mantém sua própria declaração do estado das informações relevantes.
- Dados gerais são disponibilizados a consumidores autorizados, mas não preenchem automaticamente critérios da vaga nem TRAVA_CRITICA_VAGA.
- Informação ausente permanece não informada, sem inferir presença, ausência ou compatibilidade.
- Alterações relevantes da infraestrutura continuam rastreáveis.

## Pós-condições

- Mapeamento estruturado de infraestrutura persistido e associado à empresa correta, disponível para consumidores autorizados conforme a finalidade e as regras aplicáveis. O estado atual é mantido e alterações relevantes são rastreáveis, sem exigir cópia integral a cada modificação.

## Regras de negócio relacionadas

- RB-08
- RB-46
- RB-20
- RB-27
- RB-37

## Requisitos relacionados

- RF-17
- RF-18
- RF-38

## Critérios de aceitação

- A empresa consegue preencher e salvar o mapeamento de infraestrutura.
- Informações gerais da Empresa não são tratadas automaticamente como critérios específicos de toda vaga.
- Dados de infraestrutura não preenchem automaticamente TRAVA_CRITICA_VAGA nem presumem compatibilidade.
- A empresa consegue cadastrar recrutadores pela área de configurações.
- O recrutador cadastrado fica vinculado à empresa responsável.
- Itens obrigatórios bloqueiam o salvamento quando pendentes.
