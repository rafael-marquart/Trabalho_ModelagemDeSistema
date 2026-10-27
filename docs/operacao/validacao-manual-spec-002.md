# Roteiro de validação manual — SPEC-002

Objetivo: conferir no navegador o perfil do candidato, o catálogo de acessibilidade, os anexos e a área do administrador. Tempo estimado: 20 a 25 minutos. Marque cada item como OK ou anote o problema.

## Preparação

Veja os comandos de subida do ambiente no README (seção de execução local). Crie o administrador com `npm run admin:create` e uma conta de candidato pela tela de cadastro.

## 1. Perfil do candidato (`/candidato/perfil`)

| # | Passo | Resultado esperado |
|---|---|---|
| 1.1 | Entrar como candidato e abrir o perfil | Nome e e-mail da conta aparecem, sem campos duplicados |
| 1.2 | Salvar sem preencher nada | Salva; nenhuma categoria bloqueia o salvamento |
| 1.3 | Formação: escolher nível, digitar curso e instituição, escolher situação, "Adicionar formação" | Item aparece como "nível · curso · instituição · situação" |
| 1.4 | Adicionar a mesma formação de novo | Mensagem de erro de duplicidade |
| 1.5 | Adicionar formação sem instituição | Mensagem pedindo curso e instituição |
| 1.6 | Idiomas: adicionar Inglês/Avançado; depois "Outro" com idioma digitado | Itens listados; duplicado é recusado |
| 1.7 | Experiências: preencher cargo, empresa e período e "Adicionar experiência"; tentar sem empresa | Item aparece como "cargo · empresa · período"; sem cargo ou empresa mostra erro; não existe campo Competências |
| 1.8 | Cursos e certificações: adicionar só pelo nome | Adiciona sem exigir arquivo |
| 1.8b | Preferências de trabalho: marcar Híbrido e Remoto, preencher cidade, estado, endereço e transporte; salvar e recarregar | Valores persistem; tudo é opcional; estado/endereço sem cidade dá erro |
| 1.9 | Link profissional inválido (`abc`) e válido (`https://exemplo.com`) | Inválido recusado com mensagem; válido aceito |
| 1.10 | Recarregar a página | Tudo o que foi salvo volta, com formação e idiomas legíveis |

## 2. Necessidades de acessibilidade

| # | Passo | Resultado esperado |
|---|---|---|
| 2.1 | Declaração inicial | "Não informado" selecionado; catálogo oculto |
| 2.2 | Escolher "Possuo necessidades" | Catálogo aparece em 3 grupos (arquitetônico, comunicação, tecnológico), 16 opções |
| 2.3 | Salvar sem marcar opção nem descrição | Erro pedindo ao menos uma opção ou descrição |
| 2.4 | Marcar 2 opções e descrever uma necessidade livre | Salva; a descrição não vira opção do catálogo |
| 2.5 | Preencher "Recursos de acessibilidade indispensáveis" | Campo separado das necessidades; salva |
| 2.6 | Mudar para "Não possuo necessidades" com opções marcadas | Pede confirmação; ao confirmar, as seleções são limpas |
| 2.7 | Confirmar que não há pedido de laudo em nenhum ponto | Nenhum campo ou aviso exige laudo |

## 3. Anexos opcionais

| # | Passo | Resultado esperado |
|---|---|---|
| 3.1 | Enviar um PDF pequeno como comprovante de curso | Aparece na lista com nome e tamanho |
| 3.2 | Enviar um arquivo `.txt` ou um `.pdf` renomeado de outro formato | Recusado com mensagem |
| 3.3 | Baixar o anexo | Arquivo baixado abre normalmente |
| 3.4 | Remover o anexo | Some da lista; novo download dá "não encontrado" |

## 4. Teclado e leitor de tela (NVDA, VoiceOver ou Narrador)

| # | Passo | Resultado esperado |
|---|---|---|
| 4.1 | Percorrer o formulário só com Tab / Shift+Tab / Enter / Espaço | Todos os controles são alcançáveis; o foco é visível |
| 4.2 | Ouvir cada campo | Cada campo é anunciado com seu rótulo |
| 4.3 | Botões "Remover" | Anunciam o item ("Remover curso: Excel avançado") |
| 4.4 | Provocar um erro (1.5 ou 2.3) | O leitor anuncia a mensagem sem precisar procurá-la |
| 4.5 | Aumentar o zoom para 200% e reduzir a janela à largura de celular | Sem perda de conteúdo nem rolagem horizontal |

## 5. Administrador (`/admin/login`)

| # | Passo | Resultado esperado |
|---|---|---|
| 5.1 | Entrar com a conta de administrador | Abre o catálogo de acessibilidade |
| 5.2 | Criar uma opção, editar, marcar como obrigatória e desativar | Alterações salvas; nada é excluído |
| 5.3 | Como candidato, tentar abrir `/admin/catalogo-acessibilidade` | Redireciona para o login do administrador |
| 5.4 | Candidato que já tinha a opção desativada | Ela continua associada, mas não pode ser escolhida de novo |

## 6. Isolamento

Com o candidato A logado, copie a URL de download de um anexo e abra-a logado como candidato B (outra janela anônima): deve retornar "não encontrado" ou "não autorizado".

## Resultado

Registre abaixo os itens com problema (número, o que ocorreu) para correção antes de encerrar a SPEC-002.
