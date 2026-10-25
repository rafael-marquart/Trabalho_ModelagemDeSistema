# Decisões Técnicas

Este documento registra somente decisões técnicas sustentadas pelos Drivers Arquiteturais e pelas ADRs.

| ID | Driver / ADR | Decisão |
|---|---|---|
| DT-01 | DA-01 | Componentes de interface acessíveis e semanticamente estruturados desde a construção. |
| DT-02 | DA-02 | Autenticação centralizada e autorização por perfis com validação no backend. |
| DT-03 | DA-03 | Trava de barreira crítica executada antes do cálculo ponderado. |
| DT-04 | DA-04 | Serviço específico para cálculo determinístico de compatibilidade. |
| DT-05 | DA-05 | Camada de integração para extração, validação e normalização de dados de LLM, sem dependência direta do domínio de provedor específico. |
| DT-06 | DA-06 | Modelo comum para vagas internas e externas. |
| DT-07 | DA-07 | Separação entre dados de auditoria e informações apresentadas publicamente, preservando anonimato. |
| DT-08 | ADR-004 | Arquitetura em camadas: apresentação, aplicação, domínio e infraestrutura. |

## Diretriz técnica para a primeira implementação (SPEC-001)

A inspeção realizada em 25/10/2026 não localizou código executável, manifesto de dependências ou configuração de build/teste neste repositório de modelagem, nem identificou com evidência um repositório separado da aplicação. Portanto, esta diretriz define a arquitetura e os controles da primeira implementação, mas **não declara uma linguagem, framework, SGBD ou provedor já existente**.

| Tema | Diretriz recomendada | Justificativa / limite |
|---|---|---|
| Estilo de implantação | Monólito modular em camadas, sem microserviços nesta fase | Menor complexidade operacional; atende ADR-004 e permite separar módulos sem distribuição prematura. |
| Camadas | Apresentação → aplicação/casos de uso → domínio → infraestrutura; dependências apontam para dentro e o domínio não importa frameworks nem SDKs externos | Preserva testabilidade e independência das regras de negócio. |
| Persistência | Banco relacional com transações e restrições de integridade; selecionar o SGBD somente após localizar o ambiente real | Vínculos únicos, integridade de contas/empresas e auditoria exigem consistência transacional; não há evidência para escolher um produto específico. |
| Sessões | Sessão gerenciada no servidor, identificador opaco em cookie `HttpOnly`, `Secure` e `SameSite` adequado; proteção CSRF quando aplicável; suporte à invalidação de todas as sessões | Facilita logout, bloqueio, redefinição de senha e revogação imediata. Preferir este padrão a tokens autossuficientes de longa duração, pois RB-22 exige invalidação. A duração funcional segue OPEN-002: 60 minutos de inatividade e opção de recuperação por até 30 dias. |
| Senhas | Armazenar somente hash com algoritmo adaptativo apropriado (preferência inicial: Argon2id, se suportado pela stack); nunca registrar senha ou token em logs | Reduz impacto de exposição do banco e respeita RNF-07/08. A biblioteca e seus parâmetros devem ser verificados na stack escolhida. |
| Recuperação e convites | Tokens aleatórios criptograficamente seguros, armazenados no banco apenas em forma protegida/hash quando possível, uso único, validade e invalidação verificadas no backend | Atende às regras de recuperação e convite; não colocar credenciais/tokens em logs. |
| E-mail | Porta/adaptador de envio de e-mail, com provedor configurável fora do domínio | Permite trocar o provedor e testar fluxos sem envio real. A escolha do provedor e credenciais de ambiente continuam pendentes. |
| Autorização | Validar no backend perfil, vínculo ativo e escopo da Empresa em cada operação protegida; não confiar em perfil/empresa enviados pelo cliente | Impede acesso cruzado entre empresas e revoga acesso após encerramento do vínculo. |
| Auditoria | Serviço central de auditoria para eventos de negócio/segurança, com acesso restrito, minimização de dados e retenção funcional de 1 ano conforme OPEN-006 | Evita auditoria espalhada e preserva rastreabilidade sem registrar segredos. |
| Testes | Testes unitários para domínio, testes de integração para persistência/autorização/sessões e testes de ponta a ponta para login, recuperação e convite; incluir testes negativos de acesso cruzado | Verifica regras de segurança e invariantes no backend, não apenas o comportamento visual. |
| Segredos e ambientes | Segredos em variáveis/secret manager do ambiente; nunca no repositório ou frontend; separar configuração de desenvolvimento e produção | Reduz risco de vazamento e permite deploy controlado. |

### Portão obrigatório antes de codificar

1. Localizar o repositório executável e identificar linguagem, frameworks, banco, comandos de execução, migrações e testes existentes.
2. Adaptar as diretrizes acima à stack encontrada, sem substituir tecnologias existentes apenas por preferência.
3. Confirmar que a stack permite sessões revogáveis, transações, hash seguro de senhas, envio de e-mail via adaptador e testes automatizados.
4. Implementar em branch de trabalho, com testes; nunca fazer commits diretamente na `main`.
5. Não publicar em produção nem mesclar PR sem aprovação explícita.

## Decisões ainda não definidas

A baseline não fixa, neste momento:

- SGBD ou banco específico;
- provedor/modelo específico de LLM;
- mecanismo específico de processamento assíncrono;
- framework ou biblioteca de interface;
- mecanismo específico de sessão;
- armazenamento de laudos médicos.

Essas escolhas somente devem ser registradas quando houver Driver, ADR ou decisão explícita que as sustente.
