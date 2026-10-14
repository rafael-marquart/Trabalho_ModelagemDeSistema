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
3. O recrutador informa os dados da oportunidade conforme a matriz de campos abaixo.
4. O sistema permite salvar a vaga como rascunho mesmo quando existirem campos obrigatórios pendentes.
5. Se o recrutador solicitar publicação, o sistema verifica o preenchimento dos campos obrigatórios e a consistência das informações.
6. Se houver pendências ou inconsistências, o sistema bloqueia a publicação e indica os campos/problemas.
7. Se os dados estiverem completos e consistentes, o sistema publica a vaga e a torna visível para candidatos elegíveis no catálogo.
8. O sistema registra a publicação e possibilita acompanhamento do funil de candidaturas posteriormente.

## Campos da vaga própria e obrigatoriedade

| Campo/grupo | Obrigatório para publicar? | Tratamento |
|---|---|---|
| Cargo/título | Sim | Identifica a oportunidade. |
| Descrição | Sim | Apresenta o trabalho e suas condições. |
| Requisitos | Sim | Informa os requisitos da oportunidade. |
| Modalidade | Sim | Informa a modalidade de trabalho. |
| Localização | Sim, compatível com a modalidade | Não pressupõe endereço físico quando não for pertinente; deve ser compatível com a modalidade quando regras definidas permitirem determinar a inconsistência. |
| Critérios de acessibilidade | Sim, quanto à declaração do estado das informações relevantes | Não exige que todos os critérios sejam atendidos; informação ausente não significa compatibilidade. Os critérios específicos permanecem na OPEN-023. |
| Prazo de inscrição | Sim | Deve ser uma data válida e não anterior à data atual no momento da publicação, conforme EX03. |
| Faixa salarial | Não | Campo opcional. |
| Identificador da vaga | Não é campo de formulário | Controlado pelo sistema. |
| Empresa responsável | Não é campo de formulário | Derivada do vínculo e da autorização do recrutador. |
| Estado da vaga | Não é campo livre | Controlado pelo fluxo de rascunho/publicação/gerenciamento. |
| Origem da vaga | Não é campo livre | Registrada pelo sistema conforme a origem. |

A obrigatoriedade indicada aplica-se à publicação, não ao salvamento de rascunho. As validações decididas para a OPEN-021 estão descritas na seção seguinte. Permanecem separadas as restrições de edição/encerramento (OPEN-022) e a relação detalhada dos critérios de acessibilidade por vaga (OPEN-023).


## Validações por campo e consistência

Antes de publicar, o sistema aplica as validações abaixo, independentemente da interface utilizada:

| Campo/regra | Validação para publicação |
|---|---|
| Cargo/título | Deve conter conteúdo efetivo; vazio ou composto apenas por espaços é inválido. |
| Descrição | Deve conter conteúdo efetivo; vazio ou composto apenas por espaços é inválido. |
| Requisitos | Deve haver informação efetiva; ausência ou conteúdo composto apenas por espaços não satisfaz a obrigatoriedade. |
| Modalidade | Deve estar preenchida com valor reconhecido conforme os valores definidos pela baseline/sistema. Não se cria novo catálogo. |
| Localização | Deve ser compatível com a modalidade quando houver regra definida que permita identificar a inconsistência; não se exige endereço físico quando não for pertinente. |
| Critérios de acessibilidade | O estado das informações relevantes deve ser declarado. Informação ausente não presume compatibilidade nem ausência de barreiras; critérios específicos permanecem na OPEN-023. |
| Prazo de inscrição | Deve ser uma data válida e não anterior à data atual no momento da publicação. |
| Faixa salarial | É opcional. Se informada como intervalo, o limite inferior não pode ser maior que o superior. Não se definem moeda, formato ou limites adicionais. |
| Consistência entre campos | Conflitos identificáveis conforme as regras definidas bloqueiam a publicação; não se inventam combinações, limites ou catálogos. |

Se houver pendências ou inconsistências, a publicação é bloqueada e o sistema identifica os campos e problemas, preservando os dados informados e apresentando mensagens compreensíveis e acessíveis. Rascunhos incompletos ou inconsistentes podem ser salvos; as validações são repetidas quando a publicação é solicitada. As regras são aplicadas no domínio/aplicação, não somente na interface.

## Exceções e Fluxos Alternativos

- EX01 (Dados incompletos): Se a vaga estiver sem informações mínimas obrigatórias, o sistema bloqueia a publicação e aponta os campos pendentes.
- EX02 (Inconsistência de dados): Se os dados da vaga apresentarem inconsistências, o sistema bloqueia a publicação até a correção.
- EX03 (Publicação fora do prazo): Se a vaga for publicada com data de encerramento inválida ou anterior à data atual, o sistema rejeita a ação.

## Pós-condições

- A vaga fica disponível para busca e candidatura.
- O processo seletivo passa a ser rastreado no funil de seleção.
- A empresa pode acompanhar candidaturas e decisões subsequentemente.
- O registro da publicação fica armazenado para auditoria e histórico.

## Regras de negócio relacionadas

- RB-01
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
- Campos obrigatórios de texto vazios ou compostos apenas por espaços bloqueiam publicação.
- Modalidade vazia ou não reconhecida bloqueia publicação.
- Localização incompatível bloqueia publicação quando a inconsistência puder ser determinada por regras definidas.
- Informação de acessibilidade ausente não é interpretada como compatibilidade.
- Prazo inválido ou anterior à data atual bloqueia publicação.
- Ausência de faixa salarial não bloqueia publicação; intervalo salarial invertido bloqueia publicação.
- Rascunhos incompletos ou inconsistentes podem ser salvos.
- Publicação bloqueada identifica campos/problemas e preserva os dados.
- As mesmas validações são aplicadas independentemente da interface.
- A vaga só é exibida para candidatos quando os dados obrigatórios estão consistentes.
- A publicação é registrada com histórico e responsável.
- A empresa consegue acompanhar candidaturas após a publicação da vaga.
