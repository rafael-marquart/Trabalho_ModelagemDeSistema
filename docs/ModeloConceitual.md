# Modelo Conceitual

## Entidades e Atributos

### EMPRESA

- `id_empresa` (PK)
- `cnpj`
- `razao_social`
- `nome_fantasia`
- `nota_reputacao_acessibilidade`

### INFRAESTRUTURA_EMPRESA

- `id_infraestrutura` (PK)
- `id_empresa` (FK)
- `recursos_fisicos`
- `recursos_digitais`
- `recursos_atitudinais`

### CANDIDATO

- `id_candidato` (PK)
- `nome`
- `email`
- `cpf`
- `dados_profissionais`

### VETOR_ACESSIBILIDADE_CANDIDATO

- `id_vetor` (PK)
- `id_candidato` (FK)
- `necessidades_arquitetonicas`
- `necessidades_comunicacao`
- `necessidades_tecnologicas`

### VAGA

- `id_vaga` (PK)
- `id_empresa` (FK)
- `titulo`
- `descricao`
- `modalidade`
- `faixa_salarial`
- `status_vaga`
- `origem_ingestao`

### TRAVA_CRITICA_VAGA

- `id_trava` (PK)
- `id_vaga` (FK)
- `recursos_eliminatorios`
- `barreiras_impeditivas`

### ADMINISTRADOR

- `id_admin` (PK)
- `nome`
- `email`

### CANDIDATURA

- `id_candidatura` (PK)
- `id_candidato` (FK)
- `id_vaga` (FK)
- `data_inscricao`
- `etapa_funil`
- `score_match_deterministico`

### SOLICITACAO_ACOMODACAO

- `id_solicitacao` (PK)
- `id_candidatura` (FK)
- `recursos_solicitados`
- `detalhes_tecnicos`
- `status_confirmacao`

### ENTREVISTA

- `id_entrevista` (PK)
- `id_candidatura` (FK)
- `data_hora`
- `modalidade`
- `link_ou_local`
- `recursos_alocados`

### AVALIACAO_POS_ENTREVISTA

- `id_avaliacao` (PK)
- `id_entrevista` (FK)
- `nota_acessibilidade`
- `nota_postura_rh`
- `is_anonima`

### DENUNCIA_FALSA_INCLUSAO

- `id_denuncia` (PK)
- `id_avaliacao` (FK)
- `id_empresa` (FK)
- `descricao_infracao`
- `status_moderacao`
- `data_registro`

## Relações entre Entidades

| Entidade Origem | Relação | Entidade Destino |
| --- | --- | --- |
| EMPRESA | possui | INFRAESTRUTURA_EMPRESA |
| EMPRESA | publica | VAGA |
| EMPRESA | recebe | DENUNCIA_FALSA_INCLUSAO |
| CANDIDATO | possui | VETOR_ACESSIBILIDADE_CANDIDATO |
| CANDIDATO | realiza | CANDIDATURA |
| VAGA | recebe | CANDIDATURA |
| VAGA | define | TRAVA_CRITICA_VAGA |
| ADMINISTRADOR | gerencia status | VAGA |
| ADMINISTRADOR | modera | DENUNCIA_FALSA_INCLUSAO |
| CANDIDATURA | requer | SOLICITACAO_ACOMODACAO |
| CANDIDATURA | agenda | ENTREVISTA |
| ENTREVISTA | gera | AVALIACAO_POS_ENTREVISTA |
| AVALIACAO_POS_ENTREVISTA | pode originar | DENUNCIA_FALSA_INCLUSAO |

## Diagrama Visual

[Visualizar o diagrama do modelo conceitual](ModeloConceitual.png)
