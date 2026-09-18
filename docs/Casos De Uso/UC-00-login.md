# UC-00 — Login

## Objetivo

Permitir que o usuário acesse o sistema de forma segura e autenticada, validando suas credenciais e garantindo o acesso às funcionalidades compatíveis com seu perfil e papel dentro da plataforma.

## Ator principal

- Candidato PcD.
- Recrutador.
- Administrador.

## Pré-condições

- O usuário deve possuir cadastro no sistema.
- O usuário deve ter acesso à plataforma por meio de credenciais válidas.
- O sistema deve estar disponível e operacional.

## Pontos de Inclusão e Extensão

- Inclusão (<<include>>): UC-01 (Gerenciar Perfil).
- Inclusão (<<include>>): UC-02 (Buscar Vagas).
- Extensão (<<extend>>): UC-03 (Candidatar-se a Vaga).

## Fluxo Principal

1. O usuário acessa a página inicial da plataforma.
2. O sistema apresenta o formulário de login com campos para e-mail e senha.
3. O usuário informa suas credenciais e confirma a autenticação.
4. O sistema valida os dados informados.
5. Se as credenciais forem válidas, o sistema autentica o usuário e redireciona para a área correspondente ao seu perfil.
6. O sistema mantém a sessão ativa conforme a política de segurança definida.

## Exceções e Fluxos Alternativos

- EX01 (Credenciais inválidas): Se o e-mail ou a senha estiverem incorretos, o sistema informa o erro e impede o acesso.
- EX02 (Usuário bloqueado): Se o perfil estiver bloqueado por segurança, o sistema informa a impossibilidade de acesso e orienta a recuperação.
- EX03 (Recuperação de senha): Se o usuário não lembrar a senha, ele pode usar a opção de recuperação para redefinir as credenciais.

## Pós-condições

- O usuário fica autenticado no sistema.
- A sessão é iniciada com permissões compatíveis com o papel do usuário.
- O usuário pode acessar as funcionalidades disponíveis conforme seu perfil.

## Regras de negócio relacionadas

- RB-19: Segurança de autenticação — credenciais devem ser validadas antes de autorizar acesso.
- RB-20: Bloqueio por tentativas — múltiplas tentativas inválidas podem resultar em bloqueio temporário ou permanente.
- RB-21: Sessão segura — a sessão deve expirar ou invalidar quando houver inatividade ou logout.
- RB-22: Transparência de status — o sistema deve informar corretamente quando o acesso foi negado.

## Requisitos relacionados

- RF-01 — Login e autenticação.
- RF-02 — Recuperação de senha.
- RF-03 — Proteção contra brute force.
- RF-04 — Sessão e controle de acesso.
- RF-05 — Interface acessível.

## Critérios de aceitação

- O usuário consegue acessar a plataforma com credenciais válidas.
- O sistema bloqueia acesso quando credenciais são inválidas.
- Usuários bloqueados ou com sessão expirada são redirecionados para a autenticação correta.
- O acesso considera o perfil e o papel do usuário dentro da plataforma.

---
