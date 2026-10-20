# Identidade Visual — AcessaVagas

Esta pasta reúne os materiais de identidade visual e as referências de interface do AcessaVagas, incluindo arquivos vetoriais, marca e documentação dos protótipos.

## Estado e aprovação

Em 20/10/2026, o usuário aprovou os materiais visuais e rascunhos apresentados até então nesta etapa do trabalho. Essa aprovação registra a aceitação visual dos materiais existentes e dos rascunhos correspondentes; não substitui aprovação formal dos textos das Specs, não autoriza implementação por si só e não transforma telas não exportadas em arquivos disponíveis nesta pasta.

**Importante:** o arquivo editável de referência está no [Figma do AcessaVagas](https://www.figma.com/design/VngDm0L22cFu2wQBZDVy95). Os arquivos locais desta pasta são referências estáticas; não são a fonte editável original nem código funcional.

## Conteúdo

### Identidade visual
- [IdentidadeVisual.png](IdentidadeVisual.png) — imagem de referência visual.
- A pasta [logo/](logo/) contém variantes do logotipo para diferentes usos, incluindo versão para tema escuro.

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

## Telas adicionais trabalhadas no Figma

Além dos SVGs listados acima, foram trabalhados no Figma rascunhos das seguintes áreas:

- Busca de vagas.
- Detalhe da vaga.
- Resultado de candidatura.
- Minhas candidaturas.
- Detalhe e histórico de candidatura.
- Confirmação de cancelamento da candidatura.
- Resultado do cancelamento da candidatura.

Esses rascunhos devem ser exportados do Figma para esta pasta quando os arquivos finais estiverem disponíveis. Não são apresentados aqui como arquivos exportados, pois a exportação não foi realizada nesta atualização. O rascunho de resultado do cancelamento ainda tem um ajuste visual pendente no Figma: remover/ocultar o controle de cancelamento e aplicar cinza ao status “Cancelada”. A tentativa de edição do Figma foi impedida pelo limite de uso da ferramenta, portanto essa alteração **não foi aplicada**.

## Direção visual

- **Estilo:** profissional, acolhedor e minimalista, sem aparência hospitalar.
- **Marca:** símbolo de acessibilidade integrado à letra “A”.
- **Slogan:** “Acesso que transforma.”
- **Cores de referência:** roxo e lilás, com fundos claros e contrastes legíveis.
- **Princípios:** interface acessível, navegação clara, cartões simples, indicadores de compatibilidade e apresentação explícita dos estados.

## Limites dos arquivos

- SVGs e imagens são protótipos/referências visuais estáticas; não implementam autenticação, validações, envio de e-mail, persistência ou regras de negócio.
- Dados presentes nos protótipos são ilustrativos.
- Aprovação de uma tela não significa aprovação automática de todas as telas ainda não revisadas separadamente.
- A aprovação visual não modifica o estado das Specs nem resolve pendências funcionais documentadas em `docs/OPEN.md`.
- A OPEN-088 permanece em aberto quanto ao método/provedor para determinar distância em quilômetros. Não há provedor de cálculo de tempo de rota aprovado.
