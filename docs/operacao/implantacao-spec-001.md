# Checklist operacional de implantação — SPEC-001

Este documento separa os controles presentes no código e validados no CI das verificações que dependem do ambiente real. **Marcar um item como implementado no repositório não significa que ele foi configurado ou homologado em produção.**

## 1. Origem pública canônica — `APP_BASE_URL`

- [ ] Definir `APP_BASE_URL` com a origem pública canônica, por exemplo `https://acessavagas.example` (substituir pelo domínio real). Em produção, usar HTTPS; não informar credenciais na URL.
- [ ] Confirmar que os links enviados por e-mail usam essa origem, independentemente do cabeçalho `Host` da requisição.
- [ ] Testar no ambiente de homologação os links de confirmação de e-mail corporativo, recuperação de senha e convite de recrutador.
- [ ] Confirmar que configuração ausente, inválida ou HTTP em produção falha de forma segura. O código retorna erro de configuração em rotas protegidas/origem canônica; os testes automatizados não substituem o teste do domínio implantado.

O código de `getPublicBaseUrl` exige `APP_BASE_URL` em produção e só aceita HTTPS nesse ambiente. A configuração de desenvolvimento em `.env.example` é local e não deve ser copiada sem revisão para produção.

## 2. Transporte de e-mail — SMTP

- [ ] Configurar `SMTP_HOST` e `SMTP_FROM`; ambos são obrigatórios para `sendEmail`.
- [ ] Definir `SMTP_PORT` conforme o provedor (o padrão no código é `587`) e `SMTP_SECURE` conforme o modo TLS oferecido pelo provedor.
- [ ] Configurar `SMTP_USER` e `SMTP_PASSWORD` quando a autenticação for exigida. Guardar credenciais em mecanismo de segredos da infraestrutura, nunca no repositório ou em logs.
- [ ] Enviar e receber mensagens reais de confirmação empresarial, recuperação de senha e convite/reenvio de recrutador em homologação. *(01/11/2026: testado pelo responsável no ambiente local com provedor real (Brevo), com entrega a caixa de entrada real, e com o Mailpit, incluindo falhas simuladas; falta o ambiente de homologação/produção e um domínio próprio autenticado — SPF/DKIM/DMARC)*
- [ ] Verificar entrega, rejeições, timeouts, remetente e comportamento de falha. Confirmar que uma falha de entrega não expõe token bruto em logs nem deixa convites em estado inconsistente.

No código (01/11/2026): mensagens em texto e HTML acessível, TLS obrigatório para SMTP remoto (recusa SMTP remoto sem TLS em produção), tempos limite, classificação das falhas sem expor destinatário, link ou token, e categoria da falha gravada na auditoria. Configuração de provedores, comando de teste (`npm run email:test`) e falhas simuladas com Mailpit (`npm run mailpit:chaos`): `docs/operacao/email-smtp.md`; roteiro: `docs/operacao/validacao-manual-email.md`.

O CI usa um servidor SMTP local de captura. Isso valida a geração e a leitura das mensagens de teste, mas **não comprova entrega externa, reputação do remetente ou configuração do provedor SMTP de homologação/produção**.

## 3. Proxy confiável e endereço IP

- [ ] Configurar o proxy de borda para **sobrescrever** `X-Forwarded-For` com o endereço do cliente observado pelo proxy; não confiar em valores fornecidos diretamente pelo cliente nem simplesmente anexá-los a uma cadeia não confiável.
- [ ] Documentar a topologia de proxies e confirmar qual endereço chega à aplicação.
- [ ] Em homologação, testar login e limites graduais por IP atrás da topologia real, incluindo tráfego com cabeçalhos forjados e redes/NAT compartilhados.
- [ ] Confirmar que logs operacionais não registram senhas, tokens ou identificadores brutos.

O controle de login usa o primeiro endereço de `X-Forwarded-For` quando disponível e persiste chaves derivadas por hash. A segurança desse dado depende de o proxy confiável sobrescrever o cabeçalho. O CI valida a lógica, não a topologia de rede real.

## 4. Rotinas de retenção

### Eventos de auditoria

- [ ] Executar primeiro a simulação: `npm run audit:retention`.
- [ ] Revisar a contagem elegível e confirmar as necessidades de preservação (`retentionHold`) antes de autorizar descarte.
- [ ] Configurar um agendador operacional diário para `npm run audit:retention -- --execute`, com credenciais de banco de dados de privilégio mínimo, logs e alerta de falha.
- [ ] Confirmar no ambiente alvo o resultado, a trilha de auditoria do descarte e o tratamento de falhas.

### Registros de segurança de login

- [ ] Executar primeiro a simulação: `npm run login-security:retention`.
- [ ] Configurar um agendador operacional diário para `npm run login-security:retention -- --execute`, com logs e alerta de falha.
- [ ] Confirmar que a rotina remove apenas tentativas com mais de 24 horas e bloqueios já expirados, conforme a implementação.

As duas rotinas operam em simulação por padrão. O repositório contém comandos e testes automatizados, mas não provisiona nem verifica um agendador na infraestrutura.

## 5. Acessibilidade, temas e referência visual

- [ ] Comparar as telas implantadas com os SVGs aprovados em `docs/Identidade Visual/` nos tamanhos desktop e móvel.
- [ ] Verificar navegação por teclado, ordem e visibilidade do foco, rótulos de campos, anúncios de erro/sucesso, contraste, zoom/redimensionamento e leitor de tela.
- [ ] Testar tema claro/escuro com preferência salva e preferência do sistema operacional.
- [ ] Registrar navegador, dispositivo, tema, data e evidência de cada teste manual.

Os testes automatizados cobrem o estado do controle de tema e, no CI, os componentes/build. Não há evidência neste documento de homologação manual em navegador/dispositivo. Os SVGs aprovados são referências estáticas em tema claro; eles não comprovam conformidade WCAG nem definem por si só a aparência do tema escuro.

## 6. Evidência de liberação

| Área | Evidência automatizada disponível no repositório | Evidência operacional necessária |
|---|---|---|
| `APP_BASE_URL` | Testes de origem/redirect e CI | Domínio HTTPS real, links e falha segura verificados em homologação |
| SMTP | E2E com SMTP local de captura | Entrega e falhas verificadas com provedor real |
| Proxy / IP | Testes unitários de origem e throttling | Cabeçalhos e limites verificados atrás do proxy real |
| Retenção de auditoria | Testes da política, dry-run e descarte explícito | Agendador, privilégios, alertas e execução verificados |
| Retenção de login | Testes da rotina e política de simulação | Agendador, privilégios, alertas e execução verificados |
| Acessibilidade / temas | Testes de componentes e controles acessíveis | Revisão manual documentada nos dois temas e contra os SVGs |

Não marcar a SPEC-001 como concluída enquanto as pendências aplicáveis não tiverem evidência real e aprovação do responsável. Não registrar segredos, tokens, endereços pessoais ou dados reais de usuários neste checklist.
