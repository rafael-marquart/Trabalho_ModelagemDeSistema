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

## Telas adicionais exportadas para SVG

- [Busca de vagas](Busca-de-Vagas.svg)
- [Detalhe da vaga](Detalhe-da-Vaga.svg)
- [Resultado de candidatura](Resultado-Candidatura.svg)
- [Minhas candidaturas](Minhas-Candidaturas.svg)
- [Detalhe e histórico de candidatura](Detalhe-Historico-Candidatura.svg)
- [Confirmação de cancelamento](Confirmacao-Cancelamento.svg)
- [Resultado do cancelamento](Resultado-Cancelamento.svg)

Os SVGs foram adicionados ao repositório em 20/10/2026. A aprovação visual global comunicada pelo usuário não substitui aprovação formal do texto das Specs nem autorização de implementação.

### Fluxo de cancelamento de candidatura — ajuste funcional aprovado

- O candidato acessa **Minhas candidaturas**, seleciona uma candidatura e abre a tela de detalhe/análise.
- A ação **Cancelar candidatura** fica na tela de detalhe/análise, quando o estado e as condições da vaga permitem o cancelamento.
- Ao acionar a ação, o sistema solicita confirmação. Confirmado o cancelamento, a candidatura passa ao estado final **Cancelada** e aparece como cancelada em Minhas candidaturas.
- A tela de resultado do cancelamento é apenas informativa e **não exibe botão para cancelar candidatura**.
- Direção visual já solicitada: **Cancelada** em cinza e **Recusada** em vermelho. A edição correspondente no Figma ainda não foi concluída; não considerar as cores aplicadas até atualização e conferência do arquivo editável.

## Direção visual

- Slogan: “Acesso que transforma.”
- Paleta aproximada: roxo `#4A148C`, violeta `#6B2DBD`, lilás `#C6A7F2` e fundos claros.
- Acessibilidade: contraste legível, rótulos explícitos e navegação clara.
- Os detalhes visuais podem variar entre rascunhos e não devem ser interpretados como decisão funcional sem respaldo nas Specs.

## Limites

Estes arquivos são representações estáticas. Autenticação, validação de CPF/CNPJ, envio de e-mail, persistência e regras de negócio não são implementados pelas imagens. Os dados exibidos são ilustrativos. A aprovação visual não altera o estado das Specs nem resolve pendências funcionais. A OPEN-088 está resolvida: HERE Routing API no plano gratuito aprovado, duração padrão sem ajuste por horário/trânsito em tempo real e falhas/ausência de rota tratadas conforme OPEN-033. A resolução libera implementação de SPEC-007, SPEC-008 e SPEC-010 quanto a esse bloqueio; a aprovação visual dos protótipos continua separada
