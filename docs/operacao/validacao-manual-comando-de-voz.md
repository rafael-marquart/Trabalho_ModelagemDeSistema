# Roteiro de validação manual — uso do site por comando de voz

Objetivo: conferir se uma pessoa que não usa mouse nem teclado (deficiência motora nos membros superiores, LER grave, tetraplegia) consegue usar o AcessaVagas só com a voz, usando a ferramenta do próprio sistema. O site não tem comando de voz próprio: ele precisa ter botões, links e campos reais e com nome, para que as ferramentas do sistema os encontrem (WCAG 2.1.1 Teclado, 2.5.3 Rótulo no nome, 4.1.2 Nome, função, valor).

Ferramentas:

- **Acesso por Voz do Windows 11** (controle do computador). **Ainda não entende português**: só inglês, espanhol, francês e alemão. Por isso os comandos deste roteiro estão em inglês. Os nomes em português dos botões ("Vagas", "Salvar") nem sempre são reconhecidos pelo reconhecedor em inglês, e por isso o caminho principal é o dos **números** ("Show numbers").
- **Digitação por voz do Windows** (Win+H): entende português e serve para ditar o texto dos campos.

Registre o resultado de cada passo (OK / falhou / observação) e, se falhar, o número do passo e a página.

## Preparação

1. Windows 11 atualizado, com microfone (o de fone de ouvido funciona melhor que o do notebook).
2. Configurações → Acessibilidade → Fala → ligar **Acesso por voz**. Na primeira vez, ele baixa o modelo de fala; se pedir idioma, escolha **English (United States)**.
3. Faça o tutorial que o Windows oferece na primeira vez (uns 5 minutos); ele ensina a pronúncia que o reconhecedor espera.
4. Atalhos: **Alt+Shift+C** liga e desliga o microfone; **Alt+Shift+B** alterna entre "em espera" e "ouvindo". Por voz: "**Voice access wake up**" e "**Voice access sleep**".
5. Abra o Chrome ou o Edge em tela cheia em acessa-vagas-dev.vercel.app.
6. Tenha uma conta de candidato e uma de empresa de teste no ambiente de testes.

## Comandos usados no roteiro

| Diga | O que acontece |
|---|---|
| "Show numbers" | Coloca um número em cada botão, link e campo da tela |
| "Click 12" (ou só "12") | Clica no item 12 |
| "Click Vagas" | Clica no item com esse nome (pode não reconhecer palavras em português) |
| "Scroll down" / "Scroll up" | Rola a página |
| "Press tab" / "Press enter" / "Press escape" | Aperta a tecla |
| "Show grid" | Grade numerada para clicar em qualquer ponto (último recurso) |
| "Delete that" / "Select all" | Apaga ou seleciona o texto do campo |
| "What can I say" | Lista de comandos |
| Win+H (ou "Press windows h") | Liga a digitação por voz em português para ditar no campo selecionado |

## A. Navegação geral (sem login)

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Na página inicial, dizer "Show numbers" | Todos os links, botões e campos visíveis recebem número; nada clicável fica sem número |
| 2 | Clicar pelo número no link "Entrar" e depois nas abas "Candidato" / "Empresa" | Abre a página certa e troca de aba |
| 3 | Dizer "Click Candidato" ou "Click Empresa" | Se reconhecer, clica; se não, registrar como limitação do idioma (não é falha do site) |
| 4 | "Scroll down" até o rodapé e clicar em "Termos de Uso" pelo número | Abre a página de Termos |
| 5 | Clicar nos botões "Tema escuro" e "Alto contraste" pelo número | O tema muda; o botão continua com número depois da troca |

## B. Cadastro e login (candidato)

| # | Passo | Resultado esperado |
|---|---|---|
| 6 | Em "Criar conta", "Show numbers" e clicar no campo "Nome completo" | O cursor vai para o campo |
| 7 | Win+H e ditar o nome em português | O nome aparece no campo; "Delete that" apaga se errar |
| 8 | Ir aos campos E-mail, CPF e Senha pelo número e ditar | O texto entra em cada campo (no e-mail e no CPF, conferir se o ditado não colocou espaços) |
| 9 | Clicar no **olho** da senha pelo número | A senha aparece e some; o olho tem número próprio (ele não tem texto visível, então "Click Mostrar senha" pode não funcionar: registrar) |
| 10 | Marcar a caixa "Li e concordo…" pelo número | A caixa fica marcada; os links "Termos de Uso" e "Política de Privacidade" têm números separados dela |
| 11 | Clicar em "Criar conta" sem preencher algo | A mensagem de erro aparece na tela, perto do campo |
| 12 | Fazer login só por voz (campos por número, ditado, "Press enter") | Entra na área do candidato |

## C. Uso da área do candidato

| # | Passo | Resultado esperado |
|---|---|---|
| 13 | "Show numbers" no topo e abrir os itens do menu (Vagas, Minhas candidaturas, Meu perfil) | Cada item tem número e abre a página |
| 14 | Em Vagas, clicar na busca, ditar "desenvolvedor" e "Press enter" | A lista é filtrada |
| 15 | Usar os filtros (caixas de seleção, listas) pelo número | Cada opção tem número; listas suspensas abrem e uma opção pode ser escolhida pelo número |
| 16 | Abrir uma vaga e clicar em "Candidatar-se" | A candidatura é feita; a confirmação aparece |
| 17 | Em Meu perfil, mudar a cidade e clicar em "Vagas" no menu | Aparece "Deseja salvar as alterações antes de sair?"; os três botões têm número |
| 18 | Dizer "Press escape" | O aviso fecha e continua no perfil |
| 19 | Repetir 17 e clicar em "Salvar e sair" pelo número | Salva e vai para Vagas |
| 20 | Em Foto de perfil, clicar em "Escolher foto" | Abre a janela de arquivos do Windows; escolher a foto e o botão "Abrir" com "Show numbers" e o número |
| 21 | Enviar um comprovante de deficiência (upload) | Mesmo comportamento do passo 20 |
| 22 | Clicar em "Sair da conta" | Sai (ou pergunta antes, se houver alteração não salva) |

## D. Área da empresa

| # | Passo | Resultado esperado |
|---|---|---|
| 23 | Login de empresa e criar uma vaga ditando título e descrição | Os campos aceitam o ditado; textos longos entram sem perder trechos |
| 24 | Marcar recursos de acessibilidade e itens da infraestrutura pelo número | Cada caixa e cada opção tem número |
| 25 | Abrir as candidaturas de uma vaga e mudar a etapa de um candidato | Os botões e listas da tela de candidaturas têm número |
| 26 | Abrir o detalhe de uma candidatura e voltar | Funciona sem precisar de "Show grid" |

## E. Conferência final

| # | Pergunta | Esperado |
|---|---|---|
| 27 | Em algum passo foi preciso usar "Show grid"? | Não. Se foi, registrar onde: é sinal de algo clicável que não é botão ou link de verdade |
| 28 | Algum item clicável ficou sem número? | Não |
| 29 | Algum texto visível de botão era diferente do nome que o Acesso por Voz aceitou? | Não (WCAG 2.5.3) |
| 30 | Alguma ação exigiu arrastar, passar o mouse por cima ou clicar com o botão direito? | Não |

## Limitações conhecidas (não são falhas do site)

- O Acesso por Voz do Windows ainda não entende português; comandos com nomes em português podem falhar. O caminho por números funciona em qualquer idioma.
- No celular, as ferramentas equivalentes são o Controle por Voz (iPhone) e o Acesso por Voz (Android); confira nas configurações do aparelho se o português está disponível antes de testar.

Fontes: [Perguntas frequentes sobre o acesso por voz](https://support.microsoft.com/pt-BR/Accessibility/windows/voice-access/voice-access-frequently-asked-questions-faqs), [Lista de comandos do acesso por voz](https://support.microsoft.com/en-US/Accessibility/windows/voice-access/voice-access-command-list), [Introdução ao acesso por voz](https://support.microsoft.com/pt-br/Accessibility/windows/voice-access/get-started-with-voice-access).
