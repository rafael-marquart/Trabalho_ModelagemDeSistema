# Bateria de testes — 01/11/2026 (antes da SPEC-006)

Executada sobre `desenvolvimento-do-projeto` + SPEC-021 (PR #58), em ambiente limpo.

## Resultado

| Camada | O que foi feito | Resultado |
|---|---|---|
| Estática | `tsc --noEmit`, ESLint, `prisma validate` | Sem erros (12 avisos de lint antigos, sem impacto) |
| Unitários e componentes | Vitest (80 arquivos), com cobertura | 562 testes passando; cobertura 73% das linhas e 78% dos ramos |
| Banco de dados | As 29 migrações aplicadas em PostgreSQL 16 vazio; comparação migrações × `schema.prisma`; testes de restrição de vínculo de recrutador (inclusive concorrência) | Sem divergência; restrições funcionando |
| Integração (E2E) | `scripts/auth-e2e.mjs` contra build de produção, PostgreSQL real, SMTP e HERE falsos, rodado duas vezes seguidas no mesmo banco | Passou nas duas execuções |
| Navegador | Chromium visitando 51 telas (anônimo, candidato, empresa, recrutador, administrador) com axe-core (WCAG 2.0/2.1/2.2 A e AA + boas práticas) nos temas claro, escuro e alto contraste; erros de JavaScript; rolagem horizontal em 390 px | Após as correções: 0 violações, 0 erros de JavaScript, sem rolagem horizontal |
| Cabeçalhos HTTP | Conferência dos cabeçalhos de segurança | Ausentes antes; adicionados (ver abaixo) |
| Dependências | `npm audit` das dependências de produção | 6 alertas (1 moderado, 5 altos), todos com correção só em versão maior (ver abaixo) |

## Problemas encontrados e corrigidos

- **Contraste do texto secundário (WCAG 1.4.3):** `--muted` (#6D647A) tinha 4,16:1 sobre o fundo da página e 3,98:1 sobre o lilás claro; passou a #5C5369 (≥ 5,2:1). Texto de status neutro: #6B6380 (3,85:1) → #554D6A (5,4:1). Teste de regressão em `src/components/visual-tokens.test.ts`.
- **Aba ativa no tema escuro:** texto branco sobre lilás claro (1,6:1 a 2:1) → texto escuro (8:1).
- **"Pular para o conteúdo principal":** o link apontava para `#conteudo`, que só existia em 1 tela; agora todas as telas têm o destino.
- **Botão de tema (WCAG 2.5.3, rótulo no nome):** o nome lido ("Alternar tema claro e escuro") não continha o texto visível. Agora segue o padrão do botão "Alto contraste": texto fixo "Tema escuro", marcado quando ativo.
- **Círculo de compatibilidade:** o nome lido passou a começar pelo texto visível ("92% Match: …").
- **Links em texto corrido nas telas de entrada:** sublinhados (antes só a cor os distinguia, WCAG 1.4.1).
- **Nota pública (SPEC-021):** títulos de critério pulavam um nível (h2 → h4).
- **Menu lateral:** recebeu nome próprio, para não se confundir com outras regiões complementares da página.
- **Página 404:** criada (com título e região principal); antes era a padrão do Next.js, sem estrutura acessível.
- **Detalhe da candidatura com erro:** passou a ter título de página também quando não carrega.
- **Cabeçalhos de segurança:** `X-Frame-Options: DENY` e `frame-ancestors 'none'` (impede embutir o site em outra página), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `base-uri`, `form-action` e `object-src`.
- **E2E repetível:** a limpeza não apagava o cache de tempo de deslocamento; uma segunda execução no mesmo banco falhava. Agora remove o que a própria execução criou.

## Pendências registradas (não corrigidas nesta bateria)

- **Dependências:** `next` 15 (via PostCSS, usado só na compilação), `nodemailer` 7 e a CLI do Prisma 6 têm alertas cuja correção exige versão maior (Next 16, Nodemailer 10, Prisma 7). Fazer em branch própria, com o E2E como rede de segurança.
- **Sem `package-lock.json`:** cada instalação pode trazer versões diferentes. Recomendado versionar o lockfile.
- **Telas anônimas** consultam `/api/conta/preferencias` e recebem 401 (esperado, mas aparece no console do navegador).
- **Cobertura mais baixa:** `src/lib/notifications/access.ts`, `src/lib/reports/http.ts` e `src/lib/auth/password.ts` têm pouca ou nenhuma cobertura direta (são exercitados pelo E2E).
