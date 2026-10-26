# Roteiro de validação manual — SPEC-001

Este roteiro complementa a CI e os testes E2E. Use somente dados fictícios: Mailpit captura e-mails localmente, mas os dados do banco permanecem no seu computador. Não use senhas reais.

## 1. Pré-requisitos

- Git, Node.js 20.9+ e npm.
- Docker Desktop (ou Docker Engine) iniciado.
- Acesso ao repositório e à branch `feat/recruiter-dashboard-brand-polish`.

Na pasta do repositório, abra um terminal e execute:

```bash
git switch feat/initial-app-foundation
git pull
npm install
docker compose up -d postgres mailpit
docker compose ps
```

Confirme que `postgres` e `mailpit` estão em execução. Copie o arquivo de ambiente de exemplo:

**macOS/Linux/Git Bash**
```bash
cp .env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Se já existir um `.env`, não o sobrescreva sem conferir seu conteúdo. Para o app rodando diretamente no computador, os valores de SMTP devem apontar para `127.0.0.1:1025`, e `APP_BASE_URL` para `http://localhost:3000`.

Prepare banco e Prisma:

```bash
npm run db:generate
npx prisma migrate deploy
```

Em seguida, inicie a aplicação:

```bash
npm run dev
```

Deixe esse terminal aberto. Acesse:
- Aplicação: http://localhost:3000
- Caixa de entrada de e-mail local: http://localhost:8025

Se algum comando falhar, copie a mensagem de erro completa e pare nesse ponto; não tente corrigir migrações manualmente nem apague o volume do banco sem antes revisar o erro.

## 2. Conferência de entrada e tema

- [ ] A página inicial carrega sem erro e o logotipo Acessa Vagas aparece.
- [ ] Os links levam às páginas corretas de candidato, empresa e recrutador.
- [ ] Alternar tema claro/escuro não quebra o layout nem oculta controles.
- [ ] É possível percorrer os controles principais com Tab e Shift+Tab; o foco é visível.
- [ ] Em telas estreitas, o conteúdo não exige rolagem horizontal indevida.

## 3. Cadastro e autenticação de candidato

Use dados fictícios inéditos para evitar conflito com contas já existentes.

- [ ] Abra `/candidato/cadastro`, preencha nome, e-mail de teste, CPF de teste e senha conforme as regras exibidas.
- [ ] Confirme que senhas divergentes mostram erro acessível e não enviam o formulário.
- [ ] Cadastre a conta e confirme o redirecionamento para login com mensagem de sucesso.
- [ ] Entre em `/candidato/login` com e-mail e senha; confirme que chega à área de candidato.
- [ ] Saia e entre novamente usando o CPF formatado da mesma conta.
- [ ] Tente senha incorreta e confirme que o acesso é negado sem revelar se o e-mail/CPF existe.

## 4. Cadastro, confirmação e login de empresa

- [ ] Abra `/empresa/cadastro` e preencha os campos com dados fictícios. Confirme que o CNPJ está rotulado como opcional, que o texto auxiliar antigo não aparece e que o cadastro pode ser enviado deixando o CNPJ vazio. Faça também um teste com CNPJ informado em formato aceito.
- [ ] Envie o cadastro sem CNPJ e confirme uma mensagem neutra de orientação.
- [ ] Confirme que um CNPJ inválido, quando preenchido, é rejeitado com mensagem clara; o campo vazio deve ser aceito.
- [ ] Abra o Mailpit e encontre a mensagem de confirmação de e-mail.
- [ ] Abra o link de confirmação e confirme o resultado esperado na aplicação.
- [ ] Entre em `/empresa/login` com o e-mail corporativo de teste e a senha.
- [ ] Tente acessar a conta antes da confirmação, se ainda não a confirmou: ela não deve autenticar.

## 5. Recuperação de senha e e-mail

Faça um teste para candidato e outro para empresa, sem usar dados reais.

- [ ] Em `/recuperar-senha`, solicite recuperação de conta de candidato por e-mail.
- [ ] Repita para candidato usando CPF.
- [ ] Selecione Empresa e solicite recuperação pelo e-mail corporativo.
- [ ] Confira no Mailpit a mensagem recebida e abra o link.
- [ ] Defina uma nova senha e confirme que o login funciona com ela.
- [ ] Tente reutilizar o mesmo link: a aplicação deve recusá-lo.
- [ ] Solicite recuperação para um identificador inexistente e compare a mensagem; ela não deve confirmar a existência da conta.
- [ ] Confira se mensagens de erro não exibem token, senha ou dados desnecessários.

## 6. Convites de recrutador

Este fluxo requer uma conta de empresa autenticada e a tela/funcionalidade de gestão de recrutadores disponível no build atual.

- [ ] Envie convite para um endereço fictício que você controla apenas no ambiente de teste.
- [ ] Confira o e-mail no Mailpit e abra o link de convite.
- [ ] Teste aceite e recusa com convites separados.
- [ ] Se a tela permitir, teste reenvio e cancelamento do convite.
- [ ] Confira que mensagens de erro não revelam se um endereço tem conta preexistente.
- [ ] Confirme que um recrutador não consegue administrar vínculos de outra empresa.

Se algum controle não estiver disponível na interface, anote a URL e o que falta; não considere o fluxo manualmente aprovado só porque os testes E2E passaram.

## 7. Comparação visual e acessibilidade

Compare cada tela com os SVGs correspondentes em `docs/Identidade Visual/`, especialmente:
- `Login-Escolha-de-Perfil.svg`, `Login-Candidato.svg` e `Login-Empresa.svg`
- `Cadastro-Candidato.svg` e `Cadastro-Empresa.svg`
- `Recuperacao-de-Senha.svg`, `Mensagens-Autenticacao.svg` e `Gestao-Recrutadores.svg`

- [ ] Anote diferenças de estrutura, campos, texto, cores, espaçamento e comportamento responsivo.
- [ ] Teste formulários usando somente teclado.
- [ ] Confirme que erros são anunciados por leitores de tela (por exemplo, com VoiceOver ou NVDA, se disponíveis).
- [ ] Confira contraste e estados tanto no tema claro quanto no escuro.

Não altere regras de negócio nem adicione campos ausentes por conta própria. Registre as divergências para análise antes de implementar mudanças de escopo.

## 8. Ao terminar

Envie no chat:
1. Quais itens foram marcados e quais falharam.
2. Mensagens de erro completas (remova tokens, senhas, e-mails pessoais e outros dados privados).
3. Capturas de tela das divergências visuais, se possível.
4. Se o problema apareceu ao iniciar Docker, aplicar migrações, iniciar Next.js ou usar uma tela.

Não envie `.env`, senhas, links de recuperação/convite com tokens, nem dumps do banco.

Para encerrar localmente, pare o servidor com Ctrl+C e execute:

```bash
docker compose down
```

Isso mantém os dados locais. Só use `docker compose down -v` se quiser apagar permanentemente o volume do banco de desenvolvimento e tiver certeza de que não precisa dos dados.
