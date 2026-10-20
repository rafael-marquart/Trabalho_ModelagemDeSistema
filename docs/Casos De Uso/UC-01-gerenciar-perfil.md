# UC-01 — Gerenciar Perfil

## Objetivo

Cadastrar e atualizar as categorias aprovadas do perfil do candidato — dados pessoais básicos da conta, formação/escolaridade, competências, idiomas, necessidades funcionais de acessibilidade, recursos indispensáveis, experiências profissionais, cursos, certificações e links profissionais — que alimentam a análise de compatibilidade.

## Ator principal

- Candidato PcD.

## Fluxo Principal

1. O candidato acessa seu perfil.
2. O candidato informa necessidades funcionais e recursos indispensáveis.
3. O candidato pode registrar necessidades por autodeclaração.
4. O sistema reutiliza nome e e-mail mantidos na conta, sem exigir preenchimento duplicado no perfil; o cadastro da conta segue as regras da SPEC-001. CPF não é obrigatório para salvar o perfil.
5. O candidato pode cadastrar e atualizar formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais, todas categorias incluídas no escopo pela OPEN-007; podem ser preenchidas progressivamente e não bloqueiam o salvamento por categoria.
6. O sistema permite declarar necessidades funcionais e recursos indispensáveis sem obrigação universal de declaração. As necessidades podem ser autodeclaradas, sem exigir laudo para preencher o perfil; exigências documentais específicas de outros procedimentos não são substituídas por esta regra. A interface distingue “não informado” de “declarado que não possui necessidade”.
7. A categoria profissional inteira pode ficar vazia. Ao cadastrar um registro, o sistema exige apenas os campos que a baseline definir como obrigatórios para ele.
8. O sistema remove espaços desnecessários no início e no fim dos campos de texto e rejeita campos obrigatórios preenchidos apenas com espaços.
9. Quando houver datas de início e término, o término não pode ser anterior ao início; registros em andamento podem ficar sem data de término.
10. Links profissionais são opcionais e, quando informados, devem ter formato válido de URL. Não há limite funcional máximo fixo para a quantidade de experiências, cursos, certificações ou links.
11. Se houver erro, o sistema indica o campo a corrigir, preserva os dados preenchidos e impede o salvamento inválido.
12. O sistema indica dados insuficientes quando faltarem informações necessárias à análise de uma vaga, sem presumir compatibilidade conforme RB-16.
13. O sistema atualiza o perfil.
14. O sistema registra alterações relevantes para rastreabilidade.

## Exceções e Fluxos Alternativos

- EX01: Nome e e-mail são reutilizados da conta, sem preenchimento duplicado no perfil; CPF e as demais categorias profissionais não bloqueiam o salvamento por categoria.
- EX02: Se faltarem dados necessários à análise de uma vaga, o sistema indica insuficiência de informação sem presumir compatibilidade, conforme RB-16; isso não impede automaticamente o salvamento do perfil.
- EX03: A ausência de declaração de necessidade funcional é apresentada como “não informado”, não como declaração de inexistência de necessidade.
- EX04: Se houver erro de validação, o sistema indica o campo a corrigir, preserva os valores informados e não salva o registro inválido.

## Pós-condições

- Perfil atualizado e persistido.
- Alteração relevante registrada.

## Regras de negócio relacionadas

- RB-06 — Necessidades obrigatórias.
- RB-07 — Perfil técnico.
- RB-26 — Confidencialidade das informações de acessibilidade.
- RB-27 — Histórico de alterações.
- RB-28 — Autodeclaração das necessidades.
- RB-29 — Informações mínimas do perfil.

## Requisitos relacionados

- RF-04 — Cadastro de candidato.
- RF-19 — Gestão do perfil e necessidades de acessibilidade.
- RF-38 — Auditoria de operações.

## Critérios de aceitação

- Necessidades podem ser registradas por autodeclaração.
- O sistema não exige nem armazena laudo médico.
- Alterações relevantes ficam registradas.
- O perfil atualizado participa das análises posteriores.
- Nome e e-mail são reutilizados da conta, sem preenchimento duplicado no perfil; CPF não é obrigatório para salvar.
- Formação/escolaridade, competências, idiomas, experiências profissionais, cursos, certificações e links profissionais integram o escopo aprovado pela OPEN-007 e não bloqueiam o salvamento por categoria.
- Necessidades funcionais e recursos indispensáveis não exigem declaração universal; “não informado” é distinguido de “declarado que não possui necessidade”, e a autodeclaração não exige nem armazena laudo.
- O salvamento não exige categorias inteiras apenas por existirem no modelo; a ausência de dados necessários à compatibilidade é indicada sem presumir compatibilidade, conforme RB-16.
- Campos obrigatórios são definidos pela baseline para cada registro; categorias inteiras continuam opcionais.
- Espaços nas extremidades de campos de texto são removidos e campos obrigatórios preenchidos apenas com espaços são rejeitados.
- Datas de término anteriores às datas de início são rejeitadas; registros em andamento podem omitir o término.
- Links são opcionais, mas URLs informadas devem ter formato válido.
- Erros indicam o campo a corrigir, preservam os dados preenchidos e impedem o salvamento inválido.
