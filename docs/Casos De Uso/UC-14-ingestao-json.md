# UC-14 — Coletar e Ingerir Vagas Externas

## Objetivo
Coletar automaticamente vagas de fontes externas autorizadas, inicialmente pela API do Adzuna, e processá-las com validação, eventual enriquecimento por LLM, normalização, deduplicação e rastreabilidade.

## Ator principal
- Sistema (processo automatizado agendado).

## Atores secundários
- Provedor externo de vagas (inicialmente Adzuna).
- Provedor de LLM, quando necessário e disponível.
- Administrador da plataforma, somente para configuração ou acompanhamento caso exista interface para essas operações; não inicia cada execução diária.

## Pré-condições
- A fonte está autorizada e sua configuração de acesso está disponível de forma protegida; para o Adzuna, o acesso, a cobertura e as condições de uso devem ser confirmados conforme OPEN-086.
- A capacidade operacional da coleta diária, considerando frases configuradas, paginação, volume e cotas efetivas da API, deve ser verificada conforme OPEN-087.
- Existe uma lista configurável de frases de busca.
- O uso da fonte respeita os limites e as condições de uso aplicáveis.

## Fluxo Principal
1. A tarefa agendada inicia a coleta diária automaticamente e identifica a execução de ingestão.
2. O sistema consulta individualmente a API para cada frase configurada, usando `what_phrase`.
3. O sistema valida a estrutura das respostas e registra, associados à execução, a fonte, a frase consultada e o resultado de cada consulta.
4. O sistema identifica registros inválidos, incompletos ou potencialmente duplicados.
5. Para dados incompletos ou que precisem de extração/normalização, o sistema tenta complementar os dados do anúncio com LLM.
6. Se houver falha recuperável ou resposta inválida, o sistema poderá realizar tentativas adicionais limitadas, conforme a política operacional definida; cada resposta é validada antes do uso.
7. O sistema distingue dados originais, dados extraídos e informações não informadas; a LLM não pode inventar empresa ou localidade nem converter suposições em fatos.
8. Se os dados originais já atenderem aos requisitos aplicáveis, o processamento poderá continuar sem depender da LLM. Se as tentativas se esgotarem e algum dado mínimo obrigatório continuar ausente ou inválido, o registro não será disponibilizado como vaga válida e a falha será registrada.
9. O sistema verifica se cada registro possui título significativo, descrição útil, empresa contratante identificável, localidade utilizável e origem rastreável, além dos demais dados obrigatórios aplicáveis da baseline. Campos presentes, mas vazios, genéricos sem utilidade ou inconsistentes não satisfazem a validação.
10. O sistema normaliza os registros válidos e aplica a deduplicação externa em camadas: identificador igual na mesma fonte; URL original equivalente após normalização; e, se necessário, comparação conservadora de empresa contratante, título e localidade normalizados, usando outros atributos apenas quando confiáveis e úteis. Só classifica como duplicado quando houver evidência suficiente; em caso de dúvida, mantém os registros separados e não exclui, funde ou sobrescreve vaga válida existente.
11. O sistema associa cada registro recebido à execução correspondente e registra o resultado individual: processado, rejeitado, duplicado ou falha de processamento. Para rejeições e falhas, registra os motivos relevantes disponíveis.
12. O sistema consolida o resultado da execução, incluindo origem, consultas realizadas, quantitativos coerentes com os resultados individuais e falhas relevantes. A rastreabilidade permite investigar cada registro sem exigir o histórico detalhado de toda etapa interna.
13. O sistema persiste e disponibiliza apenas vagas que cumpram os critérios de validação e exibição, sem comprometer registros válidos existentes. Uma execução futura poderá reavaliar o anúncio, sem garantia de recuperação.
14. O sistema persiste cada registro de forma consistente; se a persistência falhar, não deixa alterações parciais ou estado inválido e não registra a operação como processada com sucesso.
15. O processamento de um registro com falha não interrompe o tratamento dos demais registros independentes quando for seguro continuar. Uma falha geral que impeça a continuação segura pode interromper a execução.
16. Somente falhas recuperáveis provocam tentativas adicionais, limitadas e sujeitas às validações aplicáveis. Erros permanentes, dados inválidos e violações de regra não são repetidos indefinidamente; limites e intervalos são definidos no detalhamento operacional.
17. Se uma execução for interrompida ou parcialmente malsucedida, uma nova execução verifica o estado existente e aplica a deduplicação aprovada, sem criar representações equivalentes adicionais. A mera existência de uma vaga não comprova que a operação anterior terminou com sucesso.
18. Se a recuperação não for possível, o sistema registra falha e motivos relevantes. O resultado agregado distingue sucesso integral, sucesso parcial e execução malsucedida conforme os resultados individuais; novas execuções não apagam a rastreabilidade anterior nem autorizam excluir, fundir ou sobrescrever vagas válidas sem fundamento suficiente.


## Regras de negócio relacionadas
- RB-10
- RB-11
- RB-17
- RB-18
- RB-31
- RB-32
- RB-33
- RB-37
- RB-41

## Requisitos relacionados
- RF-05
- RF-36
- RF-37
- RF-38
- RF-39
- RF-40

## Critérios de aceitação
- As consultas diárias são executadas automaticamente, sem início manual por Administrador, depois de confirmadas a autorização da fonte (OPEN-086) e a viabilidade operacional da coleta (OPEN-087).
- Cada frase configurada gera uma consulta rastreável por meio de `what_phrase`.
- As respostas da API são validadas conforme o formato suportado.
- Toda vaga disponibilizada possui título significativo, descrição útil, empresa contratante identificável, localidade utilizável e origem rastreável, além dos demais dados obrigatórios aplicáveis da baseline.
- Campo vazio, genérico sem utilidade ou inconsistente não satisfaz a obrigatoriedade.
- A complementação por LLM usa tentativas adicionais limitadas quando aplicável, e cada resposta passa por validação antes do uso.
- Quando os dados originais já são suficientes, o processamento pode continuar sem LLM.
- Se as tentativas se esgotarem e faltar dado mínimo obrigatório, o registro não é disponibilizado como vaga válida e a falha é registrada; dados inválidos não são aceitos como fatos.
- Uma execução futura pode reavaliar o anúncio, e falhas em um registro não comprometem os demais registros válidos.
- Registros inválidos não comprometem registros válidos.
- A deduplicação aplica-se somente a vagas externas e verifica, nesta ordem, identificador igual na mesma fonte, URL original equivalente após normalização e comparação conservadora de atributos normalizados quando os identificadores não forem suficientes.
- A comparação por atributos exige evidência suficiente de equivalência; semelhança superficial não basta e, em caso de dúvida, os registros permanecem separados.
- Registros classificados como duplicados não criam representações equivalentes múltiplas; o resultado individual e o motivo relevante disponível são rastreáveis.
- A deduplicação não classifica automaticamente vagas próprias como duplicadas nem exclui, funde ou sobrescreve vagas válidas por semelhança incerta.
- Dados de LLM somente são usados após validação.
- Cada execução possui identificação própria e resultado agregado rastreável, distinguindo sucesso integral, sucesso parcial e execução malsucedida.
- A origem, as frases de busca, os resultados das consultas e as falhas relevantes ficam registrados na execução correspondente.
- Cada registro recebido fica associado à execução e possui resultado individual distinguível entre processado, rejeitado, duplicado e falha de processamento.
- Motivos relevantes de rejeição/falha ficam registrados; os quantitativos consolidados são coerentes com os resultados individuais.
- A rastreabilidade permite investigar o resultado de cada registro sem exigir o registro detalhado de todas as etapas internas.
- A persistência de cada registro é consistente e não deixa alterações parciais ou estado inválido quando ocorre falha.
- Falhas individuais não interrompem outros registros independentes quando for seguro continuar.
- Somente falhas recuperáveis provocam tentativas adicionais limitadas; erros permanentes e dados inválidos não são repetidos indefinidamente.
- Reexecução após interrupção ou sucesso parcial verifica o estado existente e não cria representações equivalentes adicionais.
- Uma nova execução não apaga a rastreabilidade anterior, e vagas válidas existentes são preservadas.
- Dados extraídos por LLM só são usados após validação; ausência de informação sobre acessibilidade permanece como “não informado” quando aplicável.
- A integração valida as respostas da fonte autorizada conforme o contrato e o formato suportado.
- Os campos de origem utilizados são mapeados conforme regras documentadas para o modelo comum de VAGA, incluindo conversões aplicáveis.
- Registros normalizados são compatíveis com o modelo comum e preservam o significado dos dados de origem; o sistema não inventa informações.
- Estruturas ou valores que não possam ser interpretados com segurança são rejeitados ou tratados como falha, com motivo rastreável, sem conversão silenciosa em fatos incorretos.
- Cada fonte autorizada possui testes de mapeamento dos campos utilizados, conversões aplicáveis e dados ausentes ou inválidos.
