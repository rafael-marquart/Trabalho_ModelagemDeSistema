# Identidade Visual — AcessaVagas

Esta pasta reúne os materiais de identidade visual e as referências de interface do AcessaVagas, incluindo arquivos vetoriais, marca e documentação dos protótipos.

## Estado e aprovação

Em 20/10/2026, o usuário aprovou os materiais visuais e rascunhos apresentados até então nesta etapa do trabalho. Em 25/10/2026, aprovou explicitamente os protótipos existentes de **Entrada/login e seleção de perfil**, **Login de Candidato**, **Login de Empresa**, **Cadastro de Candidato**, **Cadastro de Empresa** e **Recuperação de senha**. Em seguida, aprovou explicitamente os protótipos de **Gestão de recrutadores** e **Mensagens de autenticação**, criados como SVGs estáticos seguindo a identidade visual aprovada. Todos os protótipos catalogados nesta etapa estão aprovados visualmente; os SVGs são referências estáticas e não substituem a fonte editável do Figma. A aprovação visual não substitui aprovação dos textos das Specs nem autoriza integração ou publicação.

**Importante:** o arquivo editável de referência está no [Figma do AcessaVagas](https://www.figma.com/design/VngDm0L22cFu2wQBZDVy95). Os arquivos locais desta pasta são referências estáticas; não são a fonte editável original nem código funcional.

## Conteúdo

### Identidade visual
- [IdentidadeVisual.svg](IdentidadeVisual.svg) — prancha de referência com logotipo, paleta, tipografia e princípios visuais.
- [Logo principal](logo/AcessaVagas.svg) — logotipo vetorial em roxo e lilás.
- [Logo monocromático](logo/AcessaVagas-monocromatico.svg) — variante para aplicações de uma única cor.

### Protótipos em SVG
- [Login — escolha de perfil](Login-Escolha-de-Perfil.svg)
- [Login — Candidato](Login-Candidato.svg)
- [Login — Empresa](Login-Empresa.svg)
- [Cadastro — Candidato](Cadastro-Candidato.svg)
- [Cadastro — Empresa](Cadastro-Empresa.svg)
- [Recuperação de senha](Recuperacao-de-Senha.svg)
- [Gestão de recrutadores](Gestao-Recrutadores.svg) — referência estática aprovada em 25/10/2026.
- [Mensagens de autenticação](Mensagens-Autenticacao.svg) — referência estática aprovada em 25/10/2026.
- [Página inicial — Candidato](Pagina-Inicial-Candidato.svg)
- [Página inicial — Empresa](Pagina-Inicial-Empresa.svg)

O catálogo e os detalhes de cada SVG estão em [Prototipos.md](Prototipos.md).

## Telas adicionais exportadas

Os seguintes protótipos foram adicionados como SVGs nesta pasta:

- [Busca de vagas](Busca-de-Vagas.svg)
- [Detalhe da vaga](Detalhe-da-Vaga.svg)
- [Resultado de candidatura](Resultado-Candidatura.svg)
- [Minhas candidaturas](Minhas-Candidaturas.svg)
- [Detalhe e histórico de candidatura](Detalhe-Historico-Candidatura.svg)
- [Confirmação de cancelamento](Confirmacao-Cancelamento.svg)
- [Resultado do cancelamento](Resultado-Cancelamento.svg)

**Ajuste visual ainda pendente:** o SVG de resultado do cancelamento foi incluído como exportado, mas a tela ainda precisa remover/ocultar o controle de cancelamento e aplicar cinza ao status “Cancelada”. A edição no Figma não foi aplicada; portanto, esse arquivo não deve ser tratado como versão corrigida desse ajuste.

Os novos protótipos de Gestão de recrutadores e Mensagens de autenticação foram criados como SVGs estáticos de referência. A fonte editável Figma ainda precisa ser atualizada para incorporar essas duas telas.

## Direção visual

- **Estilo:** profissional, acolhedor e minimalista, sem aparência hospitalar.
- **Marca:** símbolo de acessibilidade integrado à identidade do produto.
- **Slogan:** “Acesso que transforma.”
- **Cores de referência:** roxo e lilás, com fundos claros e contrastes legíveis.
- **Princípios:** interface acessível, navegação clara, cartões simples, indicadores de compatibilidade e apresentação explícita dos estados.

## Comparação estática com a implementação

Revisão estática do código da branch em 25/10/2026; não representa homologação visual em navegador.

- **Login de Candidato e de Empresa:** as páginas agora compartilham um layout responsivo de duas colunas, painel de marca/slogan, alternância de perfil com `aria-current`, formulário e links de recuperação/cadastro, seguindo a estrutura principal dos SVGs aprovados. A comparação visual final em navegador ainda está pendente.
- **Recuperação de senha:** o SVG aprovado usa painel de marca à esquerda e cartão à direita; a página atual usa cartão centralizado.
- **Gestão de recrutadores:** a implementação agora reproduz os elementos estruturais principais do SVG aprovado: cabeçalho, menu lateral, formulário amplo e tabela responsiva com nome, e-mail, status e ações de reenviar/cancelar convite ou encerrar vínculo. O GET empresarial fornece nome e e-mail do destinatário somente no escopo da empresa autenticada. A comparação final em navegador ainda está pendente.
- **Mensagens de autenticação:** o SVG mostra cartões de referência para sucesso, informação e erro; a aplicação apresenta mensagens contextuais inline com `role="alert"` ou `role="status"`. A semântica acessível é positiva, mas a composição visual não replica o protótipo.
- **Paleta e temas:** os tokens principais do tema claro agora correspondem à paleta dos SVGs aprovados (`#1F1440`, `#6B6380`, `#6B29BF`, `#4A148C`, `#F5F0FC`, `#E0D9EB` e `#FBFAFE`). O foco visível usa `#6B29BF` no tema claro e `#C5A9FF` no escuro; testes estáticos calculam contraste superior a 3:1 contra fundos e superfícies dos dois temas. Os SVGs continuam sendo referência apenas para o tema claro.

Pontos positivos identificados estaticamente: campos principais têm rótulos associados; erros e estados têm anúncios semânticos; o controle de tema expõe nome acessível e `aria-pressed`; há foco visível e regra para movimento reduzido. Testes automatizados mantêm os tokens claros sincronizados com os SVGs versionados e verificam contraste estático de pelo menos 3:1 para o contorno de foco nos dois temas. Isso não substitui testes manuais de zoom, reflow, teclado e leitor de tela.

**Pendências concretas:** a recuperação de senha permanece em cartão centralizado e precisa de comparação visual específica com o SVG aprovado; comparar login e gestão de recrutadores em navegador nos tamanhos desktop e móvel; revisar teclado, zoom/reflow, leitor de tela, estados de foco e tema escuro manualmente. Esta alteração foi revisada estaticamente e por CI; não foi executada homologação manual.

## Limites dos arquivos

- SVGs e imagens são protótipos/referências visuais estáticas; não implementam autenticação, validações, envio de e-mail, persistência ou regras de negócio.
- Dados presentes nos protótipos são ilustrativos.
- Aprovação de uma tela não significa aprovação automática de todas as telas ainda não revisadas separadamente.
- A aprovação visual não modifica o estado das Specs nem resolve pendências funcionais documentadas em `docs/OPEN.md`.
- A OPEN-088 está resolvida: HERE Routing API no plano gratuito aprovado, duração padrão sem ajuste por horário/trânsito em tempo real e falhas/ausência de rota tratadas conforme OPEN-033. A resolução libera implementação de SPEC-007, SPEC-008 e SPEC-010 quanto a esse bloqueio; a aprovação visual dos protótipos continua separada
