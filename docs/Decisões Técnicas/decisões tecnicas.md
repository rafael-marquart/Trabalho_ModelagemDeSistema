# Decisões Técnicas

Este documento registra somente decisões técnicas sustentadas pelos Drivers Arquiteturais e pelas ADRs.

| ID | Driver / ADR | Decisão |
|---|---|---|
| DT-01 | DA-01 | Componentes de interface acessíveis e semanticamente estruturados desde a construção. |
| DT-02 | DA-02 | Autenticação centralizada e autorização por perfis com validação no backend. |
| DT-03 | DA-03 | Trava de barreira crítica executada antes do cálculo ponderado. |
| DT-04 | DA-04 | Serviço específico para cálculo determinístico de compatibilidade. |
| DT-05 | DA-05 | Camada de integração para extração, validação e normalização de dados de LLM, sem dependência direta do domínio de provedor específico. Aplicada na SPEC-006: adaptador em `src/lib/external-jobs/llm.ts`, desligado por padrão (ver ADR-003). |
| DT-06 | DA-06 | Modelo comum para vagas internas e externas. A tabela `Job` registra a origem da vaga (`OWN` ou `EXTERNAL`) e, nas externas, a fonte, o identificador e o link original (SPEC-006). |
| DT-07 | DA-07 | Separação entre dados de auditoria e informações apresentadas publicamente, preservando anonimato. |
| DT-08 | ADR-004 | Arquitetura em camadas: apresentação, aplicação, domínio e infraestrutura. |

## Como as diretrizes foram aplicadas

Esta seção substitui a diretriz escrita em 25/10/2026, antes de existir código. A stack escolhida está na ADR-005; as escolhas trocáveis estão na seção 2 das ADRs.

| Tema | Como está no código |
|---|---|
| Estilo de implantação | Monólito modular: uma aplicação Next.js (páginas e API no mesmo projeto), sem microsserviços. |
| Camadas | Páginas e componentes React → rotas da API (`src/app/api`) → serviços e regras em `src/lib` → Prisma/PostgreSQL e adaptadores externos. Desvios em `docs/Implementacao/desvios.md`. |
| Persistência | PostgreSQL com Prisma. Migrações versionadas em `prisma/migrations`. Restrições no banco: índice único parcial para uma candidatura ativa por vaga e um vínculo ativo por recrutador; gatilhos que impedem alterar o histórico do funil, da moderação, dos consentimentos e as notas das avaliações. |
| Sessões | Sessão no banco (tabela `Session`) com token opaco em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção; só o hash do token é guardado. Expira após 60 minutos sem uso; com "lembrar de mim", o cookie sobrevive ao fechamento do navegador por no máximo 30 dias (a regra dos 60 minutos continua valendo). Logout e troca de senha revogam as sessões. |
| Senhas | Hash Argon2id; política de 10 caracteres com maiúscula, minúscula e número; bloqueio de 15 minutos após 10 falhas consecutivas. |
| Recuperação e convites | Tokens aleatórios guardados só como hash, de uso único: recuperação válida por 30 minutos, convite de recrutador por 7 dias. |
| E-mail | Adaptador SMTP (Nodemailer) configurado por variáveis de ambiente: Mailpit no local, Ethereal no ambiente de testes, Brevo em produção. |
| Avisos | Tabela de notificações no banco, exibida no site e enviada por e-mail; até 5 tentativas de envio, reprocessadas por rotas agendadas. |
| Autorização | Cada rota confere sessão, perfil, vínculo ativo do recrutador e empresa da vaga no servidor; requisições que alteram dados vindas de outra origem são recusadas. |
| Auditoria | Tabela `AuditEvent` com tipo, autor, objeto e metadados sem segredos; retenção de 1 ano por rotina agendada. Lista de eventos em `docs/logging.md`. |
| Testes | Vitest (unitários e de componentes, com axe-core), teste de ponta a ponta em `scripts/auth-e2e.mjs` com banco real e serviços simulados; tudo roda no GitHub Actions a cada pull request. |
| Segredos e ambientes | Variáveis de ambiente (`.env` local, painel da Vercel em produção e testes); `.env.example` sem segredos reais, só com valores de exemplo para o ambiente local. Produção e testes usam bancos separados. |
| Laudos médicos | Não são armazenados (RB-28). Comprovantes opcionais ficam no banco, com até 4 MB e tipo conferido pelo conteúdo. |

## Decisões ainda não definidas

- Autorização de uso contínuo do Adzuna e da coleta diária (OPEN-086/087).
- Mecanismo assíncrono dedicado (fila): não usado; as rotinas periódicas rodam por agendamento.
