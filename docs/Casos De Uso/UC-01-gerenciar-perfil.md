# UC-01 — Gerenciar Perfil

## Objetivo

Permitir que o candidato cadastre e atualize o perfil profissional, as preferências de trabalho e as informações de acessibilidade usadas na análise de compatibilidade (UC-13), além da foto de perfil e dos comprovantes de cursos e certificações.

## Atores

- Candidato PcD (principal).
- Administrador (mantém o catálogo de necessidades de acessibilidade usado no perfil).

## Pré-condições

- Candidato autenticado. Nome, e-mail e CPF já foram informados na criação da conta (UC-00, RF-04) e não são pedidos de novo no perfil.

## Fluxo Principal

1. O candidato acessa "Meu perfil".
2. O sistema apresenta as seções do perfil: escolaridade e formação, competências, idiomas, experiências profissionais, cursos, certificações, links profissionais, preferências de trabalho (modalidade e localização) e acessibilidade.
3. O candidato preenche ou altera as seções que quiser. As categorias podem ser preenchidas aos poucos e nenhuma delas é obrigatória para salvar.
4. Antes de informar necessidades funcionais ou recursos indispensáveis, o sistema pede o consentimento específico para o tratamento desses dados sensíveis, separado do aceite dos Termos de Uso (RF-43, RB-47).
5. Com o consentimento dado, o candidato declara suas necessidades funcionais e recursos indispensáveis por autodeclaração, sem laudo, escolhendo opções do catálogo e/ou descrevendo em texto uma necessidade não contemplada. A interface distingue "não informado" de "não tenho necessidades".
6. O candidato pode anexar comprovantes de cursos e certificações (PDF, JPG, PNG, DOC ou DOCX, até 4 MB cada) e escolher, trocar ou remover a foto de perfil (JPG, PNG ou WebP, até 1 MB após o corte quadrado).
7. O candidato salva. O sistema valida os dados no servidor, grava o perfil e registra a alteração para auditoria.
8. Se faltar algum dado necessário para uma dimensão da compatibilidade, o sistema indica o que completar, sem presumir compatibilidade (RB-16, RB-29).

## Fluxo Alternativo — Catálogo de necessidades (Administrador)

1. O Administrador acessa "Catálogo de acessibilidade" em `/admin`.
2. Ele cadastra, edita ou desativa opções do catálogo (grupos arquitetônico, de comunicação e tecnológico; 16 códigos iniciais aprovados na OPEN-008) e marca quais são obrigatórias (RB-06).
3. Opções desativadas não aparecem para novas declarações, mas as já escolhidas são preservadas. Nada é apagado e toda alteração fica registrada.

## Exceções e Fluxos Alternativos

- EX01 (Dado inválido): o sistema indica o campo recusado e o que corrigir; nada é gravado.
- EX02 (Sem consentimento): se o candidato tentar salvar dados de acessibilidade sem ter dado o consentimento específico, o sistema recusa o salvamento e pede o consentimento. Sem dados de acessibilidade, o perfil é salvo sem esse pedido.
- EX03 (Retirada do consentimento): o candidato pode retirar o consentimento a qualquer momento. O sistema apaga as informações de acessibilidade do perfil, registra a retirada e deixa de usá-las na compatibilidade e de mostrá-las às empresas. O candidato pode declará-las de novo depois, com novo consentimento.
- EX04 (Arquivo recusado): comprovante acima de 4 MB, foto acima de 1 MB ou arquivo cujo conteúdo não corresponda a um formato aceito é recusado com a explicação.
- EX05 (Sair sem salvar): se o candidato tentar sair com alterações não salvas, o sistema pergunta se deseja salvar e sair, sair sem salvar ou continuar na página (RF-44).

## Pós-condições

- Perfil atualizado e usado nas análises de compatibilidade seguintes.
- Consentimento, retirada, envio e remoção de foto e de comprovantes registrados para auditoria.
- A foto fica visível só para o próprio candidato e para as empresas e recrutadores das vagas em que ele se candidatou (RB-48).

## Regras de negócio relacionadas

- RB-06 — Necessidades obrigatórias.
- RB-07 — Perfil técnico.
- RB-16 — Dados de acessibilidade não informados.
- RB-26 — Confidencialidade das informações de acessibilidade.
- RB-27 — Histórico de alterações.
- RB-28 — Autodeclaração das necessidades.
- RB-29 — Informações mínimas do perfil.
- RB-47 — Consentimento para dados de acessibilidade.
- RB-48 — Visibilidade da foto de perfil.

## Requisitos relacionados

- RF-04 — Cadastro de candidato.
- RF-19 — Gestão do perfil e das necessidades de acessibilidade.
- RF-41 — Foto de perfil.
- RF-43 — Consentimento para dados de acessibilidade.
- RF-44 — Aviso de alterações não salvas.
- RF-38 — Auditoria de operações.

## Critérios de aceitação

- O perfil pode ser salvo com qualquer combinação de categorias preenchidas.
- Dados de acessibilidade só são gravados depois do consentimento específico.
- Retirar o consentimento apaga os dados de acessibilidade do perfil e fica registrado.
- O sistema não pede nem armazena laudo médico.
- "Não informado" é diferente de "não tenho necessidades".
- Comprovantes acima de 4 MB e fotos acima de 1 MB são recusados.
- Alterações relevantes ficam registradas para auditoria.

## Diagrama

![Diagrama de caso de uso](../Diagramas%20Caso%20De%20Uso/UC-01-gerenciar-perfil.png)

Fonte editável: `docs/Diagramas Caso De Uso/fonte/UC-01-gerenciar-perfil.puml` (PlantUML).
