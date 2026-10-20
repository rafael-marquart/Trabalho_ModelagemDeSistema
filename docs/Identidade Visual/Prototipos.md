# Protótipos de interface — AcessaVagas

Este documento cataloga os arquivos SVG existentes nesta pasta e registra telas adicionais trabalhadas no Figma.

## Fonte editável
A referência editável original está no [Figma do AcessaVagas](https://www.figma.com/design/VngDm0L22cFu2wQBZDVy95). Os arquivos SVG aqui são referências estáticas vetoriais, legíveis em navegadores e editores de imagem vetorial; não substituem o Figma nem representam código funcional.

## Arquivos SVG disponíveis

- [Login — escolha de perfil](Login-Escolha-de-Perfil.svg): seleção de Candidato ou Empresa; não oferece login público de administrador.
- [Login — Candidato](Login-Candidato.svg): acesso com e-mail/CPF e senha, recuperação de senha e cadastro.
- [Login — Empresa](Login-Empresa.svg): acesso corporativo, recuperação de senha e cadastro.
- [Cadastro — Candidato](Cadastro-Candidato.svg): nome, e-mail, CPF, data de nascimento e senha.
- [Cadastro — Empresa](Cadastro-Empresa.svg): empresa, CNPJ, e-mail corporativo, responsável e senha.
- [Recuperação de senha](Recuperacao-de-Senha.svg): formulário de recuperação.
- [Página inicial — Candidato](Pagina-Inicial-Candidato.svg): painel com navegação lateral, banner, vagas em destaque e status de candidaturas.
- [Página inicial — Empresa](Pagina-Inicial-Empresa.svg): painel de gestão de vagas e candidaturas.

## Telas adicionais trabalhadas no Figma

As telas abaixo foram elaboradas como rascunhos no Figma, mas ainda não foram exportadas como SVG/PNG adicionais para esta pasta nesta atualização:

- Busca de vagas.
- Detalhe da vaga.
- Resultado de candidatura.
- Minhas candidaturas.
- Detalhe e histórico de candidatura.
- Confirmação de cancelamento da candidatura.
- Resultado do cancelamento da candidatura.

A aprovação visual global comunicada pelo usuário em 20/10/2026 é registrada no README desta pasta. Essa aprovação não significa que os arquivos acima já tenham sido exportados nem substitui a aprovação formal do texto das Specs ou autorização de implementação.

### Ajuste pendente no rascunho de resultado do cancelamento

O usuário solicitou que o botão de cancelar candidatura não apareça nessa tela e que a cor do estado “Cancelada” seja alterada de verde para cinza. A tentativa de editar o Figma não foi concluída por limite de uso da ferramenta; portanto, as alterações visuais continuam pendentes e não devem ser consideradas aplicadas.

## Direção visual

- Slogan: “Acesso que transforma.”
- Paleta aproximada: roxo `#4A148C`, violeta `#6B2DBD`, lilás `#C6A7F2` e fundos claros.
- Acessibilidade: contraste legível, rótulos explícitos e navegação clara.
- Os detalhes visuais podem variar entre rascunhos e não devem ser interpretados como decisão funcional sem respaldo nas Specs.

## Limites

Estes arquivos são representações estáticas. Autenticação, validação de CPF/CNPJ, envio de e-mail, persistência e regras de negócio não são implementados pelas imagens. Os dados exibidos são ilustrativos. A aprovação visual não altera o estado das Specs nem resolve pendências funcionais. A OPEN-088 permanece em aberto sobre o método/provedor para determinar distância em quilômetros; não há provedor de cálculo de tempo de rota aprovado.
