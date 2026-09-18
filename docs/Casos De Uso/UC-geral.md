# Visão Geral dos Casos de Uso

## Objetivo do sistema

O sistema tem como objetivo conectar candidatos com oportunidades adequadas, considerando acessibilidade, compatibilidade funcional e regras de inclusão. A plataforma busca facilitar a busca por vagas, o gerenciamento de perfil, a candidatura, a validação do processo seletivo e a comunicação entre candidatos e recrutadores.

## Atores principais

- Candidato PcD
- Recrutador
- Administrador do sistema
- Gestor de seleção

## Visão geral dos casos de uso

### Autenticação e acesso
- UC-00 — Login

### Perfil e configuração inicial
- UC-01 — Gerenciar Perfil

### Busca e compatibilidade
- UC-02 — Buscar Vagas
- UC-13 — Calcular Match Determinístico
- UC-12 — Status da Vaga
- UC-11 — Denunciar Vaga Incompatível

### Processo de candidatura e seleção
- UC-03 — Candidatar-se a Vaga
- UC-04 — Solicitar Acomodação no Processo Seletivo
- UC-05 — Acompanhar Funil de Candidaturas
- UC-06 — Avaliar Candidatura
- UC-09 — Gerenciar Funil de Seleção
- UC-10 — Validar Documentação e Requisitos da Seleção

### Gestão de vagas e infraestrutura
- UC-07 — Infraestrutura e Apoio aos Processos de Seleção
- UC-08 — Publicar Vaga
- UC-14 — Ingerir Dados em JSON

## Fluxo principal do sistema

1. O candidato acessa o sistema por meio do login.
2. O candidato gerencia seu perfil e informações relevantes para busca.
3. O sistema realiza a busca de vagas e calcula a compatibilidade.
4. O candidato visualiza as oportunidades de forma acessível e clara.
5. O candidato pode se candidatar e solicitar acomodações quando necessário.
6. O recrutador publica vagas, valida documentação e acompanha o funil.
7. O sistema notifica participantes sobre mudanças de status e decisões relevantes.
8. O processo é concluído com a avaliação, aprovação ou recusa conforme a regra de negócio.

## Relações entre casos de uso

- UC-00 inclui acesso ao sistema e validação de autenticação.
- UC-01 fornece dados essenciais para UC-02 e UC-13.
- UC-02 e UC-13 alimentam a exibição das vagas e a decisão de candidatura.
- UC-03 e UC-04 expandem o processo de inscrição e adequação.
- UC-05, UC-09 e UC-10 fazem a gestão do funil e da validação das etapas.
- UC-11 e UC-12 reforçam a transparência, a comunicação e a visibilidade do estado da vaga para o candidato.
- O fluxo de aprovação e decisão fica contemplado dentro dos casos de uso de candidatura, funil e validação, sem necessidade de UC separado.

## Observações

Este documento funciona como visão geral da modelagem de casos de uso da plataforma. Os casos específicos devem ser lidos em conjunto com os arquivos individuais de cada UC para compreender regras, fluxo principal, exceções e critérios de aceitação.

---
