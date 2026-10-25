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

- **Login de Candidato e de Empresa:** os SVGs aprovados mostram composição em duas colunas, painel de marca/slogan e alternância visual de perfil. As páginas atuais usam cartão centralizado; os perfis são separados por rota e não há o painel lateral do protótipo.
- **Recuperação de senha:** o SVG aprovado usa painel de marca à esquerda e cartão à direita; a página atual usa cartão centralizado.
- **Gestão de recrutadores:** o SVG aprovado mostra cabeçalho, navegação lateral e tabela de pessoas vinculadas; a implementação atual usa um cartão centralizado com listas e ações.
- **Mensagens de autenticação:** o SVG mostra cartões de referência para sucesso, informação e erro; a aplicação apresenta mensagens contextuais inline com `role="alert"` ou `role="status"`. A semântica acessível é positiva, mas a composição visual não replica o protótipo.
- **Paleta e temas:** a implementação usa tokens CSS próprios (por exemplo, `--purple: #6d43c5` e `--background: #f8f7fb`), diferentes de algumas cores dos SVGs (por exemplo, `#6B29BF` e `#FBFAFE`). Os SVGs são referências claras; não há uma referência SVG aprovada para o tema escuro.

Pontos positivos identificados estaticamente: campos principais têm rótulos associados; erros usam anúncio de alerta em telas de autenticação; mensagens de estado usam `role="status"`; o controle de tema expõe nome acessível e `aria-pressed`; há foco visível e regra para movimento reduzido. Uma conta estática de contraste para alguns tokens da implementação dá aproximadamente 5,05:1 para texto `#716c80` sobre branco e 6,44:1 para `#6d43c5` sobre branco; o contorno de foco `#9d83e5` sobre branco fica em aproximadamente 3,08:1. Esses cálculos não substituem medição nos fundos reais nem testes de zoom, reflow, teclado e leitor de tela.

**Pendência concreta:** alinhar a composição e a paleta das telas aprovadas com os SVGs versionados e realizar a revisão manual de acessibilidade nos temas claro e escuro. Não foi executada homologação manual nesta revisão estática.

## Limites dos arquivos

- SVGs e imagens são protótipos/referências visuais estáticas; não implementam autenticação, validações, envio de e-mail, persistência ou regras de negócio.
- Dados presentes nos protótipos são ilustrativos.
- Aprovação de uma tela não significa aprovação automática de todas as telas ainda não revisadas separadamente.
- A aprovação visual não modifica o estado das Specs nem resolve pendências funcionais documentadas em `docs/OPEN.md`.
- A OPEN-088 está resolvida: HERE Routing API no plano gratuito aprovado, duração padrão sem ajuste por horário/trânsito em tempo real e falhas/ausência de rota tratadas conforme OPEN-033. A resolução libera implementação de SPEC-007, SPEC-008 e SPEC-010 quanto a esse bloqueio; a aprovação visual dos protótipos continua separada
