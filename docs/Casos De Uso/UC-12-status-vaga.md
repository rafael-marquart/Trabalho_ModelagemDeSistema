# UC-12 — Status da Vaga

## Objetivo

Permitir que o candidato e a empresa visualizem o estado atual de uma vaga, identificando se ela está aberta, encerrada ou indisponível, de forma clara e acessível.

## Ator principal

- Candidato PcD.

## Pré-condições

- O candidato deve estar autenticado no sistema.
- A vaga deve estar registrada no catálogo ou no histórico de ofertas.
- O sistema deve disponibilizar a informação do status atual da vaga ao usuário.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-05 (Acompanhar Funil de Candidaturas).

## Fluxo Principal

1. O candidato acessa a lista de vagas ou o detalhe de uma oportunidade.
2. O sistema consulta o status atual da vaga no catálogo e na regra de negócios aplicáveis.
3. O sistema exibe o estado da vaga, como “Aberta”, “Em análise” ou “Encerrada”.
4. Se a vaga estiver aberta, o candidato pode consultar o detalhamento e, caso seja elegível, seguir para a candidatura.
5. Se a vaga estiver encerrada ou indisponível, o sistema informa a condição e bloqueia ações incompatíveis.

## Exceções e Fluxos Alternativos

- EX01 (Vaga encerrada): Se a vaga foi encerrada após a busca, o sistema mostra mensagem informativa e não permite candidatura.
- EX03 (Status em atualização): Se a vaga estiver em processamento ou com alteração recente de dados, o sistema comunica que o status pode mudar em breve.

## Pós-condições

- O status da vaga fica visível para o candidato e para a organização.
- Ações futuras (candidatura, busca ou acompanhamento) respeitam o estado informado.
- O registro do status é mantido para auditoria e rastreio de oportunidades.

## Regras de negócio relacionadas

- RB-01
- RB-13
- RB-23
- RB-42

## Requisitos relacionados

- RF-10
- RF-12
- RF-27

## Critérios de aceitação

- O sistema informa corretamente o estado atual da vaga.
- Vagas encerradas ou indisponíveis bloqueiam ações de candidatura.
- O status é atualizado de forma consistente com o estado real da vaga.

---
