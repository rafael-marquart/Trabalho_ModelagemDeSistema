# UC-12 — Status da Vaga

## Objetivo

Permitir que o candidato veja, de forma clara e acessível, se uma vaga está aberta, indisponível ou encerrada, e o que isso significa para a candidatura.

## Ator principal

- Candidato PcD.

## Pré-condições

- Candidato autenticado.
- A vaga foi publicada por uma empresa na plataforma (rascunhos nunca aparecem ao candidato).

## Pontos de Inclusão e Extensão

- Incluído por UC-02 (Buscar Vagas), no detalhe da vaga, e por UC-05 (Acompanhar candidaturas).

## Fluxo Principal

1. O candidato abre o detalhe de uma vaga ou uma candidatura.
2. O sistema lê o estado registrado da vaga no momento da consulta e mostra um dos três rótulos:
   - **Aberta**: a vaga está aberta e no prazo; mostra a data final de inscrição, se houver.
   - **Indisponível**: a Empresa pausou a vaga ou o prazo de inscrição terminou; o motivo é informado.
   - **Encerrada**: a Empresa encerrou a vaga.
3. Se a vaga estiver aberta e sem barreira crítica, o candidato pode seguir para a candidatura (UC-03).
4. Se estiver indisponível, a candidatura fica bloqueada enquanto durar a condição; uma vaga pausada pode voltar a Aberta pela Empresa (UC-08).
5. Se estiver encerrada, novas candidaturas ficam bloqueadas de vez; uma nova oportunidade exige nova publicação.

## Exceções e Fluxos Alternativos

- EX01 (Estado mudou depois da busca): o sistema mostra o estado atual e aplica a regra correspondente; a candidatura confere o estado de novo no momento do registro (UC-03).
- EX02 (Estado não confirmado): se não for possível ler o estado da vaga, o sistema mostra "Não confirmada", não presume disponibilidade e bloqueia a candidatura até nova tentativa.
- EX03 (Já candidatado): se o candidato já tem candidatura na vaga, o sistema mostra a data e a etapa atual em vez do botão de candidatura.

## Pós-condições

- O candidato vê o estado atual da vaga e o motivo de qualquer bloqueio.
- As mudanças de estado ficam registradas para auditoria (UC-08).

## Regras de negócio relacionadas

- RB-01 — Elegibilidade para candidatura.
- RB-13 — Transparência antes da candidatura.
- RB-23 — Transparência de status.
- RB-42 — Vaga encerrada.

## Requisitos relacionados

- RF-10 — Visualização da vaga.
- RF-12 — Notificações.
- RF-27 — Notificações do processo seletivo.

## Critérios de aceitação

- O rótulo mostrado corresponde ao estado registrado no momento da consulta.
- Vaga pausada ou com prazo vencido aparece como "Indisponível", com o motivo, e não aceita candidatura.
- Vaga encerrada não aceita novas candidaturas.
- Falha ao ler o estado não libera a candidatura.
