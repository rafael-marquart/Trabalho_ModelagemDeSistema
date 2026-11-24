# UC-00 — Login

## Objetivo

Permitir que cada perfil acesse a plataforma de forma segura, com credenciais validadas no servidor, e chegue à área correspondente ao seu papel. A página inicial pergunta como a pessoa quer continuar (candidato ou empresa) e oferece a criação de conta de candidato, o cadastro de empresa e a entrada do recrutador.

## Atores principais

- Candidato PcD.
- Empresa (conta organizacional).
- Recrutador (convidado pela Empresa).
- Administrador (entrada própria, em `/admin/login`).

## Pré-condições

- A pessoa possui conta ativa ou escolhe criar uma conta de candidato ou de empresa. Contas de recrutador são criadas apenas por convite da Empresa (UC-07).
- A conta de Empresa só entra depois de confirmar o e-mail corporativo.

## Fluxo Principal

1. A pessoa acessa a página inicial e escolhe "Sou candidato", "Sou empresa" ou "Entrar como recrutador".
2. O sistema apresenta o formulário do perfil escolhido: candidato entra com **e-mail ou CPF** e senha; Empresa e Recrutador, com e-mail e senha. Há a opção "Lembrar de mim".
3. Se a pessoa escolher criar conta, o sistema leva ao cadastro correspondente, que exige o aceite dos Termos de Uso e da Política de Privacidade vigentes (RF-42).
4. A pessoa informa as credenciais e confirma.
5. O sistema valida as credenciais no servidor.
6. Se forem válidas, o sistema cria a sessão e leva a pessoa à área do seu perfil.
7. A sessão termina após 60 minutos sem uso. Com "Lembrar de mim", ela continua válida ao reabrir o navegador, por no máximo 30 dias, desde que não fique 60 minutos sem uso (RNF-07).

## Exceções e Fluxos Alternativos

- EX01 (Credenciais inválidas): o sistema informa que não foi possível entrar, sem revelar qual dado está errado, e não inicia a sessão.
- EX02 (Conta bloqueada): após 10 tentativas incorretas consecutivas, a conta fica bloqueada por 15 minutos; o sistema informa e orienta a recuperação de senha.
- EX03 (Recuperação de senha): candidato (por e-mail ou CPF), Empresa e Recrutador (por e-mail) podem pedir um link de redefinição, válido por 30 minutos e de uso único; o sistema não revela se a conta existe (RF-02).
- EX04 (Empresa aguardando validação): a conta empresarial fica indisponível até a confirmação do e-mail corporativo. O cadastro aceita apenas empresas brasileiras com CNPJ de 14 dígitos, sem verificar dígitos verificadores nem fonte oficial.
- EX05 (Perfil diferente): uma conta que tentar entrar pelo formulário de outro perfil não é aceita naquele formulário.

## Pós-condições

- A pessoa fica autenticada, com sessão guardada no servidor e permissões do seu perfil.
- O login e as falhas ficam registrados para auditoria (RNF-14).

## Regras de negócio relacionadas

- RB-12: Controle de acesso.
- RB-21: Segurança de autenticação.
- RB-22: Controle de sessão.
- RB-46: Cadastro de recrutador pela empresa.

## Requisitos relacionados

- RF-01 — Autenticação.
- RF-02 — Recuperação de senha.
- RF-03 — Perfis de acesso.
- RF-17 — Cadastro de empresa e de recrutadores.
- RF-42 — Aceite dos Termos de Uso e da Política de Privacidade.
- RF-45 — Mostrar e ocultar a senha.

## Critérios de aceitação

- Cada perfil entra pelo seu formulário com credenciais válidas; o candidato também pode usar o CPF.
- Credenciais inválidas não iniciam sessão nem revelam qual dado está errado.
- A conta é bloqueada por 15 minutos após 10 falhas consecutivas.
- Sessão expirada leva de volta à entrada.
- Não é possível criar conta sem aceitar os Termos de Uso e a Política de Privacidade.
