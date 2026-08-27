REQUISITOS FUNCIONAIS

RF-01 AUTENTICAÇÃO.
WHEN o usuário submete dados de cadastro válidos, o sistema SHALL criar a conta.
WHEN o usuário submete credenciais corretas, o sistema SHALL iniciar a sessão.
IF as credenciais forem inválidas, THEN o sistema SHALL recusar o acesso e exibir uma mensagem de erro.


RF-02 RECUPERAÇÃO DE SENHA.
WHEN o usuário solicita a recuperação de senha, o sistema SHALL enviar um link de redefinição para o e-mail cadastrado.


RF-03 PERFIS DE ACESSO.
IF um usuário tentar acessar uma funcionalidade não autorizada para seu perfil, THEN o sistema SHALL negar o acesso.


RF-04 CADASTRO DE CANDIDATO.
WHEN o candidato realiza seu cadastro, o sistema SHALL permitir o registro de informações pessoais, formação, competências, idiomas e necessidades funcionais de acessibilidade.


RF-05 IMPORTAÇÃO DE VAGAS EXTERNAS.
WHEN uma vaga externa for identificada, o sistema SHALL permitir sua visualização e processamento.


RF-06 BUSCA E FILTRO.
WHEN o candidato realizar uma busca ou aplicar filtros, o sistema SHALL exibir somente as vagas correspondentes aos critérios selecionados.


RF-07 ANÁLISE DE COMPATIBILIDADE.
WHEN o candidato consultar uma vaga, o sistema SHALL calcular a compatibilidade entre seu perfil e os requisitos da vaga.


RF-08 IDENTIFICAÇÃO DE BARREIRAS.
WHEN o sistema realizar a análise de compatibilidade, o sistema SHALL verificar a existência de barreiras de acessibilidade incompatíveis com as necessidades funcionais do candidato.


RF-09 RESTRIÇÃO DE VAGA INCOMPATÍVEL.
IF uma vaga apresentar uma barreira de acessibilidade incompatível com uma necessidade obrigatória do candidato, THEN o sistema SHALL impedir sua recomendação ou candidatura.


RF-10 VISUALIZAÇÃO DA VAGA.
WHEN o candidato acessar uma vaga, o sistema SHALL exibir informações sobre requisitos técnicos, acessibilidade, modalidade e localização.


RF-11 MINHAS CANDIDATURAS.
WHEN o candidato acessar suas candidaturas, o sistema SHALL exibir as vagas às quais ele se candidatou.


RF-12 NOTIFICAÇÕES.
WHEN ocorrer uma alteração relevante em uma vaga ou candidatura, o sistema SHALL informar o candidato.


RF-13 NOTA DE ACESSIBILIDADE.
WHEN uma empresa possuir feedbacks válidos de candidatos, o sistema SHALL calcular e exibir sua avaliação pública de acessibilidade.


RF-14 DENÚNCIA DE INCOMPATIBILIDADE.
WHEN o candidato identificar divergência entre a acessibilidade informada pela empresa e a encontrada durante o processo seletivo, o sistema SHALL permitir o registro de uma denúncia.


RF-15 GESTÃO DE SELOS.
WHEN o administrador conceder, atualizar ou remover um selo de acessibilidade, o sistema SHALL atualizar a informação correspondente da empresa.


RF-16 RECURSOS DE ACESSIBILIDADE.
WHILE o usuário estiver utilizando a plataforma, o sistema SHALL disponibilizar suporte a leitores de tela, navegação por teclado, alto contraste e comandos de voz.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

REQUISITOS NÃO FUNCIONAIS

RNF-01 ACESSIBILIDADE.
The system SHALL seguir as diretrizes da WCAG 2.1 nível AA, garantindo autonomia aos usuários.

RNF-02 COMPATIBILIDADE COM LEITORES DE TELA.
WHEN o usuário utilizar um leitor de tela compatível, o sistema SHALL permitir a utilização das funcionalidades da plataforma.

RNF-03 RESPONSIVIDADE.
WHEN o sistema for acessado em diferentes tamanhos de tela ou dispositivos, o sistema SHALL adaptar sua interface ao dispositivo utilizado.

RNF-04 USABILIDADE.
The system SHALL apresentar uma interface simples, intuitiva e organizada, facilitando a autonomia dos usuários.

RNF-05 DESEMPENHO.
WHEN o usuário realizar operações de busca, candidatura ou consulta, o sistema SHALL apresentar tempo de resposta adequado.

RNF-06 DISPONIBILIDADE.
WHILE a plataforma estiver em operação, o sistema SHALL permanecer disponível, exceto durante períodos programados de manutenção.

RNF-07 SEGURANÇA.
The system SHALL proteger os dados dos usuários contra acesso, alteração ou utilização não autorizada.

RNF-08 PRIVACIDADE.
The system SHALL tratar os dados pessoais de acordo com a legislação vigente, especialmente a LGPD.

RNF-09 INTEGRIDADE DOS DADOS.
WHEN dados de candidatos, empresas, vagas ou avaliações forem armazenados ou modificados, o sistema SHALL garantir sua consistência e integridade.

RNF-10 CONFIABILIDADE.
WHEN o sistema realizar o cálculo de compatibilidade, o sistema SHALL produzir resultados consistentes conforme os critérios definidos.

RNF-11 ESCALABILIDADE.
WHEN houver aumento no número de usuários, empresas, vagas ou candidaturas, o sistema SHALL manter seu funcionamento sem perda significativa de desempenho.

RNF-12 MANUTENIBILIDADE.
The system SHALL possuir uma estrutura que facilite correções, manutenção e evolução das funcionalidades.

RNF-13 COMPATIBILIDADE.
WHEN o usuário acessar a plataforma por meio dos principais navegadores ou dispositivos suportados, o sistema SHALL disponibilizar suas funcionalidades de forma adequada.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

REGRAS DE NEGÓCIOS 

RB-01 LIMITE DE CANDIDATURAS.
IF uma vaga estiver indisponível ou bloqueada, THEN o sistema SHALL impedir que o candidato realize uma candidatura.


RB-02 TRAVA DE ACESSIBILIDADE.
IF uma vaga apresentar uma barreira incompatível com uma necessidade obrigatória do candidato, THEN o sistema SHALL considerar a vaga incompatível.


RB-03 PESO DA ACESSIBILIDADE.
WHEN o sistema calcular a compatibilidade entre candidato e vaga, a dimensão de acessibilidade SHALL representar 50% do resultado.


RB-04 PESO DO PERFIL TÉCNICO.
WHEN o sistema calcular a compatibilidade entre candidato e vaga, o perfil técnico SHALL representar 30% do resultado.


RB-05 PESO DE DISTÂNCIA E MODALIDADE.
WHEN o sistema calcular a compatibilidade entre candidato e vaga, distância e modalidade SHALL representar 20% do resultado.


RB-06 NECESSIDADES OBRIGATÓRIAS.
WHEN o sistema realizar a análise de compatibilidade, as necessidades funcionais classificadas como obrigatórias pelo candidato SHALL ser consideradas.


RB-07 PERFIL TÉCNICO.
WHEN o sistema realizar o cálculo do perfil técnico, o sistema SHALL considerar escolaridade, formação, competências e idiomas exigidos pela vaga.


RB-08 DIVERGÊNCIAS RECORRENTES.
IF forem identificadas divergências recorrentes entre a acessibilidade declarada e a experiência dos candidatos, THEN o sistema SHALL permitir a alteração da acessibilidade associada à empresa.


RB-09 SELOS DE ACESSIBILIDADE.
IF a empresa atender aos critérios definidos pela plataforma, THEN o administrador SHALL poder conceder o selo de acessibilidade.


RB-10 VAGAS EXTERNAS.
WHEN uma vaga for proveniente de uma fonte externa, o sistema SHALL identificá-la como externa e estruturar suas informações antes de utilizá-la.


RB-11 VALIDAÇÃO DA IA.
WHEN informações forem extraídas por LLM, o sistema SHALL submetê-las às regras de validação antes de utilizá-las no cálculo de compatibilidade.


RB-12 CONTROLE DE ACESSO.
IF um usuário tentar acessar uma funcionalidade não correspondente ao seu perfil de candidato ou administrador, THEN o sistema SHALL negar o acesso.


RB-13 TRANSPARÊNCIA.
WHEN o candidato consultar uma vaga, o sistema SHALL disponibilizar as informações relevantes de acessibilidade antes da realização da candidatura.
