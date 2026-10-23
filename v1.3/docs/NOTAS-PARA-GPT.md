# Notas do Claude para o GPT (Alpha v1.3, branch `claude/v1.3`)

O que mudou nas áreas do Claude e o que precisa de ajuste nas áreas do GPT
(missões, didática, Arcade, torneio, recordes, persistência). Nada abaixo
foi mexido pelo Claude além do mínimo listado em "Já ajustado".

## 1. Pontuação `pontuacao-v3` (0 a 1000)

- `ResultadoPontuacao.total` vai de **0 a 1000** (inteiro); cada categoria
  vai até `peso × 10` (`categoria.maximo` já traz o valor certo). Use
  `ESCALA_PONTUACAO` (`src/pontuacao/regras.ts`) em vez de 100 fixo.
- Nomes novos das categorias (`NOME_CATEGORIA`; os ids não mudaram):
  integridade → "Fusão prevista (integridade)", desenho → "Geometria do
  cordão", regularidade → "Regularidade da largura", deformacao →
  "Controle térmico", eficiencia → "Execução".
- Notas graduadas: os `detalhes` do desenho agora são **notas** (Largura,
  Reforço, Alinhamento) e não "fração dentro da faixa". Execução traz
  "Arco sobre a junta", "Reinícios de arco" e "Metal no trecho".
- `EntradaPontuacao.aberturasDeArco` (opcional) entra na Execução;
  `pontuarRegistro` já calcula a partir dos eventos.
- `medidas` ganhou `notaFusao`, `reiniciosArco` e `aproveitamentoMetal`.
- Detalhes e justificativas: `docs/PONTUACAO.md`.

**Precisa de ajuste (GPT):**
1. Textos que falam em "nota de 0 a 100", "pontos de 100" ou nos nomes
   antigos das categorias (telas de História, Arcade, Torneio, Recordes e
   textos didáticos).
2. Mostrar o total como inteiro (hoje várias telas usam `n1`, que mostra
   "846,0").
3. Arcade: `pontos = total × multiplicador` agora vai até 2000 por desafio;
   conferir textos e recordes da partida (`VERSAO_ARCADE` talvez deva subir).
4. Recordes antigos (`pontuacao-v1`/`v2`, 0–100) continuam guardados e
   separados por versão; decidir se a tela de Recordes mostra a escala de
   cada versão.

## 2. Modelo: a fresta da junta de topo enche primeiro (H18 revista)

No topo reto com abertura, o metal enche a fresta (abertura × espessura)
antes de virar reforço. Com o mesmo metal, largura e reforço ficam um pouco
menores. O contexto padrão `CONTEXTO_PADRAO` passou a ter abertura 0 (cordão
sobre chapa, o modelo das etapas 1–4), então os testes daquelas etapas não
mudaram.

**Precisa de ajuste (GPT), em `src/didatica/`:**
- `explicacao.ts` (largura prevista por `larguraPelaArea(area, razao)`) e
  `comparacao.ts` (`decomporLargura` com `√(taxa)`, `√(velocidade)`,
  `√(razão)`) supõem largura ∝ √área. Com fresta isso vira aproximação. O
  certo é usar a área de **reforço**: `areaParaLargura(junta, dimensões,
  largura, razão)` em `src/modelo/juntas.ts` faz a conta inversa, e
  `SecaoLocal.areaReforcoMm2` traz a área acima da face.
- O estado de fusão `enchimento` agora também aparece no topo reto (metal
  abaixo da face) e se chama "junta não preenchida".

## 3. Outras mudanças do modelo que a didática pode usar

- DBCP (10/15/20 mm) no preparo (`Preparo.dbcpMm`), corrente pela relação
  de fusão do arame (H28 revista, H48), ângulo de avanço em
  `INFO_TECNICA[t].anguloAvancoGraus`.
- Relatório técnico estruturado: `relatorioDoRegistro(...)` em
  `src/pontuacao/oficial.ts` (observação × fatores × limitações por trecho);
  campos em `docs/PONTUACAO.md`.

## Já ajustado pelo Claude (mínimo necessário)

- `src/dados/recordes.ts`: validação do total aceita até `ESCALA_PONTUACAO`.
- `src/dados/torneio.ts`: nota do professor (0–10) convertida para a escala
  de 1000 na média ponderada.
- `src/ui/componentes/pontuacao.ts`: conceito S–D por fração da escala e
  placar "/ 1000".
- `src/ui/telas/historia.ts`: recorde buscado na versão atual da pontuação.
- Testes: `tests/torneio.test.ts` (média ponderada na escala nova),
  `tests/dados.test.ts` (nota inválida agora é 5000).
