# UC-08 — Publicar Vaga

## Objetivo

Permitir que a empresa ou recrutador cadastre e publique uma vaga em um catálogo acessível, com informações detalhadas sobre o cargo, requisitos, modalidade e condições de participação, para que candidatos elegíveis possam se candidatar.

## Ator principal

- Recrutador.

## Pré-condições

- O recrutador deve estar autenticado no sistema.
- O recrutador deve possuir autorização para publicar vagas na empresa ou organização vinculada.
- Os dados básicos da vaga, como cargo, descrição e critérios de seleção, devem estar definidos.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-09 (Gerenciar Funil de Seleção).

## Fluxo Principal

1. O recrutador acessa o painel de vagas da empresa.
2. O sistema exibe a opção de criação e publicação de nova vaga.
3. O recrutador informa os dados da oportunidade: cargo, descrição, requisitos, modalidade, localização, critérios de acessibilidade e prazo de inscrição.
4. O sistema valida os campos obrigatórios e a consistência das regras da vaga.
5. O sistema salva a vaga como rascunho ou publica imediatamente, conforme a opção escolhida.
6. O sistema torna a vaga visível para candidatos elegíveis no catálogo de vagas.
7. O sistema registra a publicação e possibilita acompanhamento do funil de candidaturas posteriormente.

## Exceções e Fluxos Alternativos

- EX01 (Dados incompletos): Se a vaga estiver sem informações mínimas obrigatórias, o sistema bloqueia a publicação e aponta os campos pendentes.
- EX02 (Vaga duplicada): Se a empresa tentar publicar uma vaga com dados equivalentes a outra já existente, o sistema sugere revisão ou bloqueia a criação.
- EX03 (Publicação fora do prazo): Se a vaga for publicada com data de encerramento inválida ou anterior à data atual, o sistema rejeita a ação.

## Pós-condições

- A vaga fica disponível para busca e candidatura.
- O processo seletivo passa a ser rastreado no funil de seleção.
- A empresa pode acompanhar candidaturas e decisões subsequentemente.
- O registro da publicação fica armazenado para auditoria e histórico.

## Regras de negócio relacionadas

- RB-01
- RB-09
- RB-13
- RB-16
- RB-27
- RB-33

## Requisitos relacionados

- RF-17
- RF-18
- RF-25
- RF-38

## Critérios de aceitação

- O recrutador consegue criar uma vaga com dados completos e publicar em catálogo.
- A vaga só é exibida para candidatos quando os dados obrigatórios estão consistentes.
- A publicação é registrada com histórico e responsável.
- A empresa consegue acompanhar candidaturas após a publicação da vaga.

---
