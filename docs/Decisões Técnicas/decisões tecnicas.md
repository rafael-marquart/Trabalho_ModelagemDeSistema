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

## Decisões ainda não definidas

A baseline não fixa, neste momento:

- SGBD ou banco específico;
- provedor/modelo específico de LLM;
- mecanismo específico de processamento assíncrono;
- framework ou biblioteca de interface;
- mecanismo específico de sessão;
- armazenamento de laudos médicos.

Essas escolhas somente devem ser registradas quando houver Driver, ADR ou decisão explícita que as sustente.
