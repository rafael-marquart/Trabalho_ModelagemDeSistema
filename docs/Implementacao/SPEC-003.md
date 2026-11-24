# SPEC-003 — Implementação dos recursos de acessibilidade da interface

## Escopo implementado

- **Alto contraste (OPEN-012):** abordagem combinada. A plataforma segue a preferência do sistema/navegador (`prefers-contrast: more`) quando o usuário não escolheu nada (`AUTO`) e oferece o botão "Alto contraste" (`aria-pressed`) ao lado do botão de tema, em todas as telas que já tinham o controle de tema. A escolha explícita (`ON`/`OFF`) prevalece sobre o sistema. A paleta de alto contraste existe nos temas claro e escuro (texto, links, erros e estados com 7:1 ou mais; foco com 3:1 ou mais; bordas de 2 px; links sublinhados; estados com texto e borda, nunca só cor).
- **Preferências na conta (OPEN-013):** tabela `UserPreference` (migração `20261027230000_spec_003_user_preferences`) com JSON por código; catálogo extensível em `src/lib/accessibility-preferences/catalog.ts` (hoje só `HIGH_CONTRAST`). API `GET/PUT /api/conta/preferencias` para qualquer usuário autenticado, sempre sobre a conta da sessão, com verificação de origem e auditoria (`ACCESSIBILITY_PREFERENCES_UPDATED`) que registra apenas o nome da preferência alterada. A preferência da conta é reaplicada em outras sessões e dispositivos.
- **Visitantes sem conta:** a escolha fica só no navegador (localStorage). Ao entrar, se a conta nunca definiu a preferência, a escolha feita antes do login é enviada à conta; se a conta já tem uma, ela prevalece. A leitura da conta é refeita a cada mudança de página, inclusive logo após o login (navegação sem recarregar). Um valor vindo de outra conta no mesmo navegador não é repassado a uma conta nova.
- **Teclado e foco:** link "Pular para o conteúdo principal" como primeiro item de tabulação em todas as páginas; indicador de foco de 3 px (4 px em alto contraste) em links, botões, campos, listas, áreas de texto e opções de escolha; opções de escolha já alcançáveis uma a uma por Tab (`ChoiceGroup`); redução de animações para quem pede (`prefers-reduced-motion`).
- **Leitor de tela:** rótulos, grupos (`fieldset`/`legend`, `radiogroup`), mensagens de erro (`role="alert"`) e estados (`aria-pressed`, `aria-checked`, `aria-current`) revisados com verificação automatizada (axe-core) nas telas de login, painel e editor de vagas e no menu da empresa.
- **Responsividade:** sem mudança de layout nesta Spec; a verificação é manual (ver roteiro).

## Fora desta entrega

- **Navegação por voz (seção 5.4, OPEN-014):** não implementada nesta versão; há um roteiro de implementação proposto no PR #67. Vocabulário, tratamento de falhas e tecnologia dependem de decisão do responsável.
- Matriz de ambientes de referência (OPEN-015) e plano formal de avaliação WCAG 2.2 AA (OPEN-016; o projeto passou da 2.1 para a 2.2 na REV-019): permanecem pendentes de nomes/versões, cobertura mínima e formato das evidências. O roteiro manual propõe uma combinação inicial de ambientes, sem fixá-la como decisão. Testes automatizados não comprovam conformidade integral.
- Persistência do tema claro/escuro na conta e outras preferências: não fazem parte do catálogo atual.

## Arquivos principais

- `prisma/schema.prisma`, `prisma/migrations/20261027230000_spec_003_user_preferences/migration.sql`
- `src/lib/accessibility-preferences/catalog.ts`, `src/app/api/conta/preferencias/route.ts`
- `src/components/{contrast-provider,contrast-toggle,skip-link,theme-toggle}.tsx`, `src/app/layout.tsx`
- `src/app/globals.css` (blocos "SPEC-003")

## Verificações

- Vitest: catálogo, API (autorização, conta da sessão, valores inválidos, origem, auditoria sem alteração desnecessária), provider/controle, razões de contraste da paleta de alto contraste e axe-core em componentes e páginas; ESLint e `tsc --noEmit`.
- O E2E (CI com PostgreSQL) cobre: preferências negadas a anônimos, padrão `AUTO`, valores inválidos, usuário não escolhido pelo corpo, origem cruzada, persistência, isolamento entre contas, auditoria e presença do link para pular ao conteúdo.
- O axe-core em jsdom não mede contraste de cores (sem layout); isso é coberto pelos testes de tokens e pela avaliação manual.
- Teste manual e aprovação de layout: `docs/operacao/validacao-manual-spec-003.md` (pendentes do responsável).
- Teste manual executado pelo responsável em 28/10/2026; ajuste aplicado no passo 6 (a preferência da conta passou a ser reaplicada logo após o login, sem precisar recarregar). Layout aprovado na mesma data.
- SPEC-003 encerrada em 28/10/2026, exceto: navegação por voz (em aberto para implementar depois), matriz de ambientes e plano formal de avaliação WCAG (OPEN-015/OPEN-016, pendentes de decisão) e a evidência de conformidade integral, que os testes realizados não comprovam.

## Complementos posteriores

- **Tema escuro** (além do claro e do alto contraste), com a escolha guardada na conta (RF-16, RNF-19).
- **Aviso de alterações não salvas** no perfil, no editor de vaga e na infraestrutura, e "Sair sem enviar?" nos formulários de denúncia e de avaliação (OPEN-101, RF-44).
- **Mostrar e ocultar a senha** nos formulários de entrada, cadastro e redefinição (RF-45).

