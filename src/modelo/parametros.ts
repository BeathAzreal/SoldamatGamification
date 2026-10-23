/**
 * Parâmetros do MODELO QUALITATIVO SIMPLIFICADO.
 *
 * Atenção: nenhum número deste arquivo vem de norma, catálogo de fabricante
 * ou medição. Eles foram escolhidos para o jogo ficar jogável e para as
 * TENDÊNCIAS ficarem visíveis. As hipóteses estão numeradas (H1, H2, ...)
 * e explicadas em docs/HIPOTESES.md.
 */

/** Geometria da peça virtual, em "mm do jogo". Junta de topo ao longo de x, em y = 0. */
export const PECA = {
  comprimentoMm: 150,
  larguraChapaMm: 50,
} as const

/**
 * Tensão e alimentação são POSIÇÕES DE BOTÃO de 1 a 10, não volts nem m/min.
 * O valor de referência (5 / 5,5) reproduz exatamente o modelo da etapa 1.
 */
export const AJUSTES = {
  minimo: 1,
  maximo: 10,
  passo: 0.5,
  alimentacaoReferencia: 5,
  tensaoReferencia: 5.5,
} as const

export const MODELO = {
  /** Volume depositado por segundo com a alimentação de referência (mm³/s do jogo) (H1). */
  taxaDeposicaoMm3s: 140,
  /** Altura do cordão dividida pela largura, na tensão de referência (H3). */
  razaoAlturaLargura: 0.35,
  /** Razão altura/largura nos extremos do botão de tensão: 1 → 10 (H9). */
  razaoTensaoMinima: 0.48,
  razaoTensaoMaxima: 0.22,
  /** Resolução da discretização ao longo da junta (mm). */
  passoMm: 0.5,
  /** Espalhamento numérico do depósito ao longo da junta, em mm (H4). */
  sigmaPocaMm: 2,
  /** Distância máxima entre pontos de depósito ao subdividir um trecho (mm). */
  subdivisaoMaxMm: 0.25,
} as const

/** Movimento da tocha / tecimento (H39). Números do jogo. */
export const MOVIMENTO = {
  /** Meia amplitude da oscilação lateral escolhida na bancada (mm). */
  amplitudeMm: 2,
  /** Expoente do espalhamento do calor: F × (w₀ ÷ w)^expoente. */
  expoenteFusao: 0.5,
  /** Oscilações por segundo no desenho da tocha (só visual). */
  frequenciaVisualHz: 2.5,
} as const

export const TRAJETORIA = {
  /** Tempo máximo que a tocha leva entre duas leituras do mouse (H5). */
  duracaoMaxDeslocamentoMs: 50,
} as const

export const VELOCIDADE = {
  /** Janela de tempo usada para medir a velocidade (H6). */
  janelaMs: 200,
  /**
   * Faixa-alvo DESTE JOGO (arbitrária) com a alimentação de referência.
   * Ela cresce junto com a alimentação (H11).
   */
  alvoMinMms: 8,
  alvoMaxMms: 16,
} as const

/** Critérios da avaliação ao fim da tentativa (H14–H16). Todos são escolhas do jogo. */
export const AVALIACAO = {
  /** Abaixo desta largura não consideramos que há cordão (H14). */
  larguraMinimaMm: 1,
  /** Descontado em cada ponta do cordão antes de medir (H14). */
  aparaPontasMm: 5,
  /** Região avaliada menor que isso → nada a avaliar. */
  comprimentoMinimoMm: 10,
  /** Coeficiente de variação da largura: limites das faixas (H15). */
  cvMuitoRegular: 0.05,
  cvRegular: 0.12,
  /** Desvio médio do centro em relação à junta: limites das faixas (H16). */
  desvioCentradoMm: 1,
  desvioLeveMm: 2.5,
} as const

/** Explicação e comparação (H20, H22, H24). Todos são escolhas do jogo. */
export const EXPLICACAO = {
  /** Tamanho do trecho para medir a velocidade efetiva (H20). */
  trechoMm: 5,
  /**
   * Pausa: trecho com velocidade efetiva abaixo desta fração da mediana dos
   * trechos da própria tentativa (H22). Relativo porque a velocidade "normal"
   * muda muito com a alimentação.
   */
  pausaFracaoMediana: 0.4,
  /** Variação de velocidade a partir da qual vale comentar (H22). */
  variacaoRelevante: 0.1,
  /** Diferenças menores que estas contam como "igual" na comparação (H24). */
  toleranciaFracao: 0.02,
  toleranciaMm: 0.3,
  /** Um fator da decomposição de largura só é citado se mudar mais que isso (H25). */
  fatorRelevante: 0.03,
} as const

/** Índice de fusão sintético (H33, H34). Números do jogo. */
export const FUSAO = {
  /** Aporte necessário por mm de espessura (unidades relativas: potência × s ÷ mm). */
  necessidadePorMm: 0.01677,
  /** Seção a partir da qual o metal acumulado amortece a fusão (mm²). */
  areaAmortecimentoMm2: 25,
  minimoAdequado: 1,
  maximoAdequado: 2,
  /** Acima disso: perfuração prevista. */
  perfuracao: 2.6,
  /** Margem para considerar uma borda coberta (mm). */
  margemBordaMm: 0.5,
  /** Fator quando o óxido do alumínio não foi removido (H35). */
  fatorSemLimpeza: 0.6,
  /** Normalização do índice de deformação (H36). */
  normalizacaoDeformacao: 2.07,
} as const

/** Equilíbrio tensão × alimentação do jogo (H10). Reta e tolerância inventadas. */
export const EQUILIBRIO = {
  /** tensão de equilíbrio = base + inclinação × alimentação */
  base: 1.5,
  inclinacao: 0.8,
  /** Diferença (em pontos de botão) ainda considerada equilibrada. */
  tolerancia: 1,
} as const
