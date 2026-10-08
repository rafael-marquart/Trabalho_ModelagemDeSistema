# UC-07 — Cadastrar Infraestrutura da Empresa

## Objetivo

Permitir à empresa manter suas informações de acessibilidade e administrar os recrutadores vinculados à sua conta.

## Ator principal

- Empresa.

## Pré-condições

- A empresa deve estar autenticada e possuir uma conta corporativa cadastrada.

## Fluxo Principal

1. A empresa acessa "Configurações da Empresa".
2. A empresa pode acessar o "Mapeamento de Infraestrutura" e preencher o questionário estruturado sobre a presença de rampas, elevadores, banheiros adaptados, leitores de tela, sinalização e políticas inclusivas.
3. A empresa pode acessar a seção "Recrutadores" para cadastrar um novo recrutador.
4. A empresa informa os dados necessários do recrutador e o sistema cria ou associa uma conta de usuário com perfil de Recrutador à empresa.
5. O sistema valida as informações e registra o vínculo do recrutador com a empresa.

## Exceções e Fluxos Alternativos

- EX01 (Alerta de Campos Obrigatórios Pendentes): O sistema impede o salvamento caso os itens de infraestrutura básica não sejam respondidos.

## Pós-condições

- Vetor de infraestrutura da empresa persistido e disponível para uso pelo motor de compatibilidade e para exibição nas vagas.

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
- A empresa consegue cadastrar recrutadores pela área de configurações.
- O recrutador cadastrado fica vinculado à empresa responsável.
- Itens obrigatórios bloqueiam o salvamento quando pendentes.
