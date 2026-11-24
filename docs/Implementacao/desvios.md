# Desvios entre o planejado e o implementado

Este arquivo registra onde o código da `main` se afasta do que as ADRs, os requisitos ou o processo previam, e por quê. Um desvio registrado aqui não é um erro escondido: é uma diferença conhecida, com o motivo e o que seria preciso para eliminá-la.

Situação em 23/11/2026.

## D-01 — Rotas da API acessam o banco diretamente

- **Previsto (ADR-004):** as rotas (camada de entrada) chamam serviços de domínio em `src/lib`, e só eles acessam o banco.
- **Implementado:** 29 das 54 rotas usam o Prisma diretamente, principalmente as mais simples ou as primeiras a serem feitas: autenticação (`auth/*`), perfil e documentos do candidato, preferências e foto, infraestrutura e recrutadores da Empresa, vagas (`vagas`, `vagas/[id]`, `vagas/[id]/acao`), notificações e convites. As regras de negócio dessas rotas estão em funções puras em `src/lib` (por exemplo, `src/lib/jobs/schema.ts` e `src/lib/company-infrastructure/schema.ts`), testadas isoladamente; só a leitura e a gravação ficam na rota.
- **Motivo:** as primeiras Specs (001, 002, 004 e 005) foram feitas antes de os serviços de domínio se consolidarem; as seguintes (007 em diante) já seguem a ADR-004.
- **Para eliminar:** mover a parte de banco dessas rotas para serviços em `src/lib`, sem mudar o comportamento.

## D-02 — Migração da candidatura editada depois de aplicada

- **Previsto (processo):** uma migração aplicada não se altera; mudanças entram em migração nova.
- **Implementado:** a migração `20261031210000_spec_011_applications` foi editada para tornar `score` opcional quando a regra mudou (31/10/2026). Para corrigir os bancos que já tinham aplicado a versão anterior, foi criada a migração `20261101070000_application_score_nullable`, que não faz nada onde a coluna já é opcional.
- **Efeito:** nenhum nos bancos atuais; o histórico de migrações fica com uma edição que deve ser evitada.

## D-03 — Score da candidatura pode ser vazio

- **Previsto (texto original da SPEC-011, OPEN-048/049):** sem score calculado, a candidatura era recusada.
- **Implementado:** decisão do responsável em 31/10/2026: só a trava crítica impede a candidatura; com dados insuficientes, o score fica vazio. A SPEC-011, o UC-03, o RF-26 e o modelo conceitual já foram atualizados.

## D-04 — Denúncia ligada à vaga, não à avaliação

- **Previsto (modelo conceitual inicial):** DENUNCIA_FALSA_INCLUSAO ligada obrigatoriamente a uma AVALIACAO_POS_ENTREVISTA.
- **Implementado (OPEN-074/075):** a denúncia é ligada à vaga (e, por ela, à Empresa); a avaliação é opcional. Desde 01/11/2026, só pode denunciar quem teve entrevista concluída na vaga. O modelo conceitual foi atualizado.

## D-05 — Janela de 15 minutos no bloqueio de login

- **Previsto (OPEN-003, RB-21):** bloqueio de 15 minutos após 10 tentativas incorretas consecutivas.
- **Implementado:** as 10 falhas só contam se cada uma ocorrer até 15 minutos depois da anterior; falhas espalhadas por mais tempo zeram a contagem. Além do bloqueio da conta, há limites por IP (30, 50, 80 e 120 falhas, com esperas crescentes).
- **Motivo:** evitar que falhas antigas, de dias atrás, bloqueiem a conta.

## D-06 — Agendador de avisos por e-mail

- **Previsto:** envio dos avisos com novas tentativas em 1 min, 5 min, 30 min e 2 h (RNF-06).
- **Implementado:** o envio é disparado logo após cada operação. As novas tentativas dependem da rota `/api/cron/notificacoes`, que o plano gratuito da Vercel só chama uma vez por dia. Para cobrir a diferença, o agendador do GitHub (`.github/workflows/agendador.yml`) foi configurado para cada 15 minutos, mas o GitHub não garante esse intervalo: nas execuções observadas, rodou cerca de 3 vezes por dia (e ele só funciona com os segredos `APP_URL` e `CRON_SECRET` cadastrados no repositório). Os intervalos de nova tentativa, portanto, podem ser bem maiores que os previstos.
- **Para eliminar:** um agendador externo confiável ou um plano da Vercel com agendamentos mais frequentes.

## D-07 — Falhas do cálculo de trajeto não vão para o log

- **Previsto (RNF-17):** falhas de serviço externo registradas na saída do servidor.
- **Implementado:** quando o HERE falha, demora mais de 8 s ou a cota chega a 60%, o sistema segue sem o tempo de deslocamento e marca o resultado como "dados insuficientes", mas não escreve nada no log. E-mail, notificações e retenção registram suas falhas (ver `docs/logging.md`).
- **Para eliminar:** registrar no log a causa da falha do trajeto, sem endereços.

## D-08 — Comprovantes no banco, até 4 MB

- **Previsto (SPEC-002 original):** até 10 MB, em diretório privado no disco do servidor.
- **Implementado (OPEN-099):** até 4 MB, guardados no banco, porque a Vercel não tem disco persistente e recusa requisições acima de 4,5 MB.
- **Para eliminar:** envio direto a um serviço de arquivos (por exemplo, Vercel Blob) com links privados.

## D-09 — Ordem entre implementação e aprovação de layout

- **Previsto (DoD das Specs):** nenhuma implementação antes da aprovação do texto e do layout.
- **Implementado:** a implementação foi autorizada pela aprovação dos textos (REV-018). Com exceção da SPEC-001, cujos protótipos foram aprovados antes, os layouts foram aprovados depois, sobre as telas implementadas. As SPEC-019 e SPEC-020 ainda aguardam essa aprovação.

## D-10 — Funcionalidades previstas não implementadas

| Item | Onde estava previsto | Situação |
|---|---|---|
| Vagas externas e uso de LLM | SPEC-006, ADR-003, UC-14 | Em revisão no PR #68 |
| Comandos de voz próprios | SPEC-003 seção 5.4, RF-16 | Não implementado; roteiro no PR #67 |
| Divergências recorrentes de acessibilidade | SPEC-004 seção 5.5, RB-08 | Adiado |
| Validar requisitos da seleção | UC-10 | Fora do escopo; depende da OPEN-092 |

## D-11 — Pedidos de recuperação de senha sem limpeza

- **Previsto (RNF-08):** coletar e guardar apenas o necessário, pelo tempo necessário.
- **Implementado:** as tentativas de login são apagadas após 24 horas, mas os registros de pedidos de recuperação de senha (`RecoveryAttempt` e `RecoveryBlock`) não têm rotina de limpeza e ficam no banco indefinidamente. Eles guardam só chaves derivadas (sem e-mail, CPF ou IP em texto).
- **Para eliminar:** incluir essas tabelas na rotina `scripts/login-security-retention.mjs`.
