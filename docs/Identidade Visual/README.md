# Identidade Visual — AcessaVagas

Esta pasta reúne os materiais de identidade visual e as referências de interface do AcessaVagas, incluindo arquivos vetoriais, marca e documentação dos protótipos.

## Estado e aprovação

Em 20/10/2026, o usuário aprovou os materiais visuais e rascunhos apresentados até então nesta etapa do trabalho. Essa aprovação registra a aceitação visual dos materiais existentes e dos rascunhos correspondentes; não substitui aprovação formal dos textos das Specs, não autoriza implementação por si só e não transforma telas não exportadas em arquivos disponíveis nesta pasta.

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

**Ajuste visual ainda pendente:** o SVG de resultado do cancelamento foi incluído como exportado, mas a tela ainda precisa remover/ocultar o controle de cancelamento e aplicar cinza ao status “Cancelada”. A edição no Figma não foi aplicada por limite de uso da ferramenta; portanto, esse arquivo não deve ser tratado como versão corrigida desse ajuste.

## Direção visual

- **Estilo:** profissional, acolhedor e minimalista, sem aparência hospitalar.
- **Marca:** símbolo de acessibilidade integrado à identidade do produto.
- **Slogan:** “Acesso que transforma.”
- **Cores de referência:** roxo e lilás, com fundos claros e contrastes legíveis.
- **Princípios:** interface acessível, navegação clara, cartões simples, indicadores de compatibilidade e apresentação explícita dos estados.

## Limites dos arquivos

- SVGs e imagens são protótipos/referências visuais estáticas; não implementam autenticação, validações, envio de e-mail, persistência ou regras de negócio.
- Dados presentes nos protótipos são ilustrativos.
- Aprovação de uma tela não significa aprovação automática de todas as telas ainda não revisadas separadamente.
- A aprovação visual não modifica o estado das Specs nem resolve pendências funcionais documentadas em `docs/OPEN.md`.
- A OPEN-088 está resolvida: HERE Routing API no plano gratuito aprovado, duração padrão sem ajuste por horário/trânsito em tempo real e falhas/ausência de rota tratadas conforme OPEN-033. A resolução libera implementação de SPEC-007, SPEC-008 e SPEC-010 quanto a esse bloqueio; a aprovação visual dos protótipos continua separada
