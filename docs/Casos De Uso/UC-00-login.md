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

- RB-21: Segurança de autenticação — credenciais devem ser validadas antes de autorizar acesso.
- RB-22: Controle de sessão — a sessão deve expirar ou invalidar conforme as condições definidas pelo sistema.
- RB-12: Controle de acesso — operações protegidas devem respeitar o perfil autorizado.

## Requisitos relacionados

- RF-01 — Autenticação.
- RF-02 — Recuperação de senha.
- RF-03 — Perfis de acesso.

## Critérios de aceitação

- O usuário consegue acessar a plataforma com credenciais válidas.
- O sistema bloqueia acesso quando credenciais são inválidas.
- Usuários bloqueados ou com sessão expirada são redirecionados para a autenticação correta.
- O acesso considera o perfil e o papel do usuário dentro da plataforma.

---
