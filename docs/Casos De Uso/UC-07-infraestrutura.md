# UC-07 — Cadastrar Infraestrutura da Empresa

## Objetivo

Permitir à empresa manter suas informações de acessibilidade e administrar os recrutadores vinculados à sua conta.

## Ator principal

- Empresa.

## Pré-condições

- A empresa deve estar autenticada e possuir uma conta corporativa cadastrada.

## Fluxo Principal

1. A empresa acessa a sua área (painel, "Infraestrutura" ou "Recrutadores").
2. A empresa pode acessar "Infraestrutura" e preencher o questionário estruturado com seis itens em cinco categorias (acesso físico, instalações, comunicação, recursos tecnológicos e políticas inclusivas), conforme a OPEN-017. As respostas são adequadas à natureza de cada item e, quando aplicável, distinguem presença declarada, ausência declarada e informação não informada; não se presume acessibilidade ou inacessibilidade a partir de dado ausente.
3. A empresa pode acessar a seção "Recrutadores" para cadastrar um novo recrutador.
4. A empresa informa nome e e-mail do recrutador.
5. Se o e-mail corresponder a uma conta elegível de Recrutador, o sistema envia convite de uso único ao titular, que deve aceitar explicitamente o vínculo.
6. Se o e-mail ainda não corresponder a uma conta, o sistema cria uma conta RECRUITER inativa com credencial aleatória não divulgada e envia link de uso único. A pessoa define sua senha e aceita explicitamente o vínculo pelo link.
7. O sistema só ativa a conta recém-criada e efetiva o vínculo após o aceite; a conta e o vínculo são atualizados atomicamente. Convites expiram em 7 dias e podem ser reenviados ou cancelados enquanto pendentes.

## Exceções e Fluxos Alternativos

- EX01 (Itens obrigatórios pendentes): os seis itens do questionário (rampas de acesso, elevadores, banheiros adaptados, sinalização acessível, leitores de tela e políticas inclusivas) são obrigatórios e precisam ser respondidos como Presente ou Ausente; "Não informado" não basta. O sistema impede o salvamento e indica cada item pendente. Cada item aceita uma observação de até 300 caracteres.
- EX02 (Conta de recrutador inelegível): se a conta existente não for de Recrutador, estiver desativada ou já tiver vínculo ativo com outra empresa, o sistema não cria o vínculo e dá a mesma resposta neutra de um pedido aceito, sem revelar a situação da conta.
- EX03 (Encerrar vínculo): a Empresa pode encerrar o vínculo de um Recrutador; ele deixa de acessar as vagas da Empresa. O encerramento fica registrado.
- EX04 (Sair sem salvar): se a Empresa tentar sair do questionário com alterações não salvas, o sistema pergunta se deseja salvar e sair, sair sem salvar ou continuar (RF-44).

## Relação entre infraestrutura geral e critérios da vaga — decisão OPEN-023

- O mapeamento representa informações gerais de acessibilidade da Empresa; não garante que todos os recursos sejam aplicáveis ou estejam disponíveis em toda oportunidade.
- Quando a aplicabilidade de um recurso depender das condições da oportunidade, a vaga mantém sua própria declaração do estado das informações relevantes.
- Dados gerais são disponibilizados a consumidores autorizados, mas não preenchem automaticamente critérios da vaga nem TRAVA_CRITICA_VAGA.
- Informação ausente permanece não informada, sem inferir presença, ausência ou compatibilidade.
- Alterações relevantes da infraestrutura continuam rastreáveis.

## Pós-condições

- Mapeamento estruturado de infraestrutura persistido e associado à empresa correta, disponível para consumidores autorizados conforme a finalidade e as regras aplicáveis. O estado atual é mantido e alterações relevantes são rastreáveis, sem exigir cópia integral a cada modificação.

## Regras de negócio relacionadas

- RB-16 — Dados de acessibilidade não informados.
- RB-20 — Nota de acessibilidade baseada em dados registrados.
- RB-27 — Histórico de alterações.
- RB-41 — Auditoria das alterações.
- RB-46 — Cadastro de recrutador pela empresa.

## Requisitos relacionados

- RF-17 — Cadastro de empresa e de recrutadores.
- RF-18 — Gestão de vagas.
- RF-38 — Auditoria de operações.
- RF-44 — Aviso de alterações não salvas.

## Critérios de aceitação

- A empresa consegue preencher e salvar o mapeamento de infraestrutura.
- Informações gerais da Empresa não são tratadas automaticamente como critérios específicos de toda vaga.
- Dados de infraestrutura não preenchem automaticamente TRAVA_CRITICA_VAGA nem presumem compatibilidade.
- A empresa consegue convidar recrutadores pela área "Recrutadores".
- O recrutador cadastrado fica vinculado à empresa responsável.
- Os seis itens obrigatórios bloqueiam o salvamento enquanto não forem respondidos como Presente ou Ausente.
- Convites expiram em 7 dias e podem ser reenviados ou cancelados enquanto pendentes.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-07-infraestrutura.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-07-infraestrutura.puml` (PlantUML).
