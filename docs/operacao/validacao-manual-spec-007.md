# Roteiro de validação manual — SPEC-007

Antes: `git pull`, `npm install`, `npm run db:generate`, `npx prisma migrate deploy` (migração nova), `npm run dev`. Use somente dados fictícios.

## Como obter e usar a chave HERE (plano gratuito)

1. Crie uma conta em https://platform.here.com (plano **Freemium/gratuito**; não contrate plano pago).
2. Em *Projects*, crie um projeto e gere uma **API key** (REST). Confirme que o projeto permite Geocoding & Search, Routing e Public Transit.
3. No arquivo `.env` local (nunca no `.env.example`, nunca em commit, chat ou print), adicione: `HERE_API_KEY="sua-chave"`.
4. Reinicie `npm run dev`.
5. Sem a chave, tudo funciona, mas vagas presenciais/híbridas retornam "dados insuficientes" para o deslocamento.
6. Transporte público só tem cobertura de teste em São Paulo; use endereços públicos fictícios (ex.: praças, estações). Se a cota acabar (429), o sistema informa dados insuficientes e não gera score.

## Preparação

- Candidato verificado com: endereço (cidade, estado, bairro/logradouro) e meio de transporte no perfil; escolaridade, experiências; modalidades aceitas; necessidades de acessibilidade (ex.: A01, marcada como obrigatória em um segundo teste).
- Empresa publica uma vaga presencial em São Paulo com os seis itens de acessibilidade e, em "Critérios técnicos", competências, experiência, escolaridade mínima e idioma.

## Passos

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Editor da vaga: ver "Critérios técnicos (opcional)" | Campos de competências, experiência, escolaridade mínima e idiomas; é possível publicar sem preencher |
| 2 | Repetir uma competência | Mensagem de duplicidade; não salva |
| 3 | Candidato → Compatibilidade → escolher a vaga → Calcular | Score inteiro com fatores por dimensão (A, T, D) e tempo de viagem |
| 4 | Trocar o meio de transporte na análise | Tempo e D mudam; o perfil não muda |
| 5 | Calcular de novo | Novo registro; o anterior permanece (histórico) |
| 6 | Vaga com item "Não informado" para uma necessidade do candidato | "Dados insuficientes" com o que falta; sem score |
| 7 | Necessidade obrigatória A01 e vaga com rampas "Ausente" | "Incompatível" sem score e sem consulta de rota |
| 8 | Vaga remota | D ignora deslocamento |
| 9 | Remover `HERE_API_KEY`, reiniciar, calcular vaga presencial | Dados insuficientes no deslocamento; nenhuma chave exibida |
| 10 | Vaga pausada/encerrada | Não encontrada |
| 11 | Teclado e leitor de tela na tela de compatibilidade | Foco visível; resultado anunciado |
| 12 | `npm run compatibility:retention` | Simulação, nada apagado |

Registre abaixo os números com problema antes de encerrar a SPEC-007.
