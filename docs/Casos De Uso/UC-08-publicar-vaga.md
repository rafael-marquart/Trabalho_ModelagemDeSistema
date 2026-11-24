# UC-08 — Publicar Vaga

## Objetivo

Permitir que a Empresa ou um Recrutador vinculado cadastre uma vaga, salve como rascunho, publique quando os dados estiverem completos e edite dentro das regras, para que candidatos possam encontrá-la (UC-02) e se candidatar (UC-03).

## Atores principais

- Empresa (gerencia as vagas da própria conta).
- Recrutador com vínculo ativo com a Empresa (gerencia as vagas dessa Empresa).

## Pré-condições

- Ator autenticado e com conta ativa. A Empresa é sempre a do próprio ator (a da conta, ou a do vínculo ativo do Recrutador); ela nunca vem do formulário.

## Pontos de Inclusão e Extensão

- Extensão (<<extend>>): UC-09 (Gerenciar funil de seleção) — depois que houver candidaturas.
- O estado definido aqui é o que o candidato vê no UC-12 (Status da vaga).

## Fluxo Principal

1. O ator acessa "Vagas" e escolhe criar uma nova vaga.
2. O ator preenche os campos da tabela abaixo. A vaga pode ser salva como rascunho a qualquer momento, mesmo incompleta.
3. O ator aciona "Publicar".
4. O sistema aplica as validações de publicação no servidor.
5. Sem pendências, a vaga passa de Rascunho para Aberta, recebe a data de publicação e aparece na busca dos candidatos.
6. O sistema registra a publicação, com autor e data, para auditoria.

## Campos da vaga

| Campo | Obrigatório para publicar? | Validação |
|---|---|---|
| Cargo/título | Sim | Não pode ser vazio nem só espaços. |
| Descrição | Sim | Não pode ser vazia nem só espaços. |
| Requisitos | Sim | Não pode ser vazio nem só espaços. |
| Modalidade | Sim | Presencial, híbrido ou remoto. |
| Cidade e estado | Sim, se presencial ou híbrido | Remoto não exige local. Endereço é opcional. |
| Área profissional | Não | Lista fixa de áreas; usada no filtro da busca. |
| Prazo de inscrição | Sim | Data válida, não anterior a hoje. |
| Faixa salarial | Não | Se houver mínimo e máximo, o mínimo não pode ser maior. |
| Acessibilidade da vaga | Sim, para os seis itens | Cada item (rampas, elevadores, banheiros adaptados, sinalização, leitores de tela, políticas inclusivas) precisa ser declarado como Presente, Ausente ou Não informado. |
| Critérios técnicos | Não | Competências, experiências, escolaridade mínima e idiomas; só os preenchidos entram na compatibilidade (UC-13). |

Identificador, empresa, estado, origem e datas são controlados pelo sistema. As mesmas validações valem para qualquer interface, porque ficam no servidor.

A infraestrutura geral da Empresa (UC-07) não preenche automaticamente a acessibilidade da vaga: cada vaga declara o seu próprio estado. "Não informado" não é tratado como presença nem como ausência (RB-16).

## Edição

1. Rascunhos podem ser editados e salvos livremente.
2. Vagas abertas ou pausadas podem ser editadas enquanto não houver candidaturas, desde que o resultado continue válido para publicação.
3. Depois da primeira candidatura, o sistema recusa mudanças nas condições da vaga (campos da tabela) e informa quais campos estão travados.
4. Vagas encerradas não podem ser editadas.
5. Toda alteração aceita fica registrada com os nomes dos campos alterados.

## Pausar, reabrir e encerrar

A vaga tem quatro estados: Rascunho, Aberta, Pausada e Encerrada. As ações permitidas são:

| Ação | De | Para |
|---|---|---|
| Publicar | Rascunho | Aberta |
| Pausar | Aberta | Pausada |
| Reabrir | Pausada | Aberta (com as validações de publicação) |
| Encerrar | Aberta ou Pausada | Encerrada (final) |

Ao encerrar, o sistema grava a data de encerramento, recusa novas candidaturas e avisa os candidatos com candidatura ativa (RB-42). As candidaturas e o histórico são preservados e não mudam de etapa automaticamente; a Empresa pode continuar conduzindo o funil (UC-09). Cada mudança de estado fica registrada com autor, estado anterior e novo.

## Exceções e Fluxos Alternativos

- EX01 (Dados incompletos ou inconsistentes): o sistema não publica, aponta cada campo com problema e preserva o que foi preenchido.
- EX02 (Prazo inválido): prazo vencido ou data inválida impede a publicação.
- EX03 (Vaga com candidaturas): a edição das condições é recusada e os campos travados são indicados.
- EX04 (Mudança simultânea): se o estado da vaga mudar durante a operação, o sistema recusa e pede para atualizar a página.
- EX05 (Sem vínculo): Recrutador sem vínculo ativo não acessa as vagas.

## Pós-condições

- Vaga publicada visível na busca e aberta a candidaturas até o prazo.
- Publicação e alterações registradas para auditoria.

## Regras de negócio relacionadas

- RB-01 — Elegibilidade para candidatura.
- RB-12 — Controle de acesso.
- RB-13 — Transparência antes da candidatura.
- RB-16 — Dados de acessibilidade não informados.
- RB-27 — Histórico de alterações.
- RB-41 — Auditoria das alterações.

## Requisitos relacionados

- RF-18 — Gestão de vagas.
- RF-25 — Transparência da compatibilidade da vaga.
- RF-38 — Auditoria de operações.
- RF-44 — Aviso de alterações não salvas.

## Critérios de aceitação

- Rascunho incompleto pode ser salvo.
- A publicação é recusada com campo obrigatório vazio, local ausente em vaga presencial ou híbrida, prazo vencido, faixa salarial invertida ou item de acessibilidade não declarado, indicando cada problema.
- Vaga publicada aparece na busca dos candidatos.
- Depois da primeira candidatura, as condições da vaga não podem ser alteradas.
- Vaga encerrada não pode ser editada.
- Empresa e Recrutador só veem e alteram vagas da própria Empresa.
- Publicação e alterações ficam registradas com o autor.
