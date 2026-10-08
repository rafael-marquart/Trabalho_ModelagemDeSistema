# Visão Geral dos Casos de Uso

## Atores principais

- Candidato PcD.
- Usuário com perfil de Recrutador, vinculado a uma Empresa.
- Administrador do sistema.

## Visão geral

- UC-00 — Login.
- UC-01 — Gerenciar Perfil.
- UC-02 — Buscar Vagas.
- UC-03 — Candidatar-se a Vaga.
- UC-04 — Solicitar Acomodação no Processo Seletivo.
- UC-05 — Acompanhar Funil de Candidaturas.
- UC-06 — Avaliar Pós-Entrevista.
- UC-07 — Cadastrar Infraestrutura da Empresa.
- UC-08 — Publicar Vaga.
- UC-09 — Gerenciar Funil de Seleção.
- UC-10 — Validar Requisitos da Seleção.
- UC-11 — Denunciar Vaga Incompatível.
- UC-12 — Status da Vaga.
- UC-13 — Calcular Match Determinístico.
- UC-14 — Ingerir Dados em JSON.

## Fluxo principal do sistema

1. O candidato autentica-se e gerencia seu perfil.
2. O sistema busca vagas e calcula compatibilidade.
3. O candidato consulta oportunidades elegíveis e pode se candidatar.
4. O candidato pode solicitar acomodações durante o processo.
5. O recrutador, associado à empresa, publica vagas e gerencia o processo seletivo.
6. O sistema registra mudanças e comunica os participantes.
7. O candidato pode avaliar o processo e registrar denúncia quando aplicável.
8. O administrador analisa denúncias e registra decisões administrativas.
9. Dados externos podem ser ingeridos e normalizados conforme as regras.

## Observação

Não existe ator ou caso de uso separado para “Gestor de Seleção”. A gestão do processo seletivo é realizada pelo Recrutador autorizado da Empresa.
