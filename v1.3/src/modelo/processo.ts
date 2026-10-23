import type { FormatoJunta } from './junta'
import type { PosicaoPeca, TipoJunta } from './juntas'
import { GASES, type GasId, type MaterialId } from './material'
import { AJUSTES, EQUILIBRIO, MODELO, MOVIMENTO, VELOCIDADE } from './parametros'

/**
 * Relações entre os ajustes da máquina e o modelo do cordão.
 * Funções puras: mesmos ajustes → mesmo resultado. Veja H1, H9, H10 e H11
 * em docs/HIPOTESES.md.
 */

/** Posições dos botões da máquina (1 a 10, unidades do jogo). */
export interface Ajustes {
  readonly alimentacao: number
  readonly tensao: number
}

export const AJUSTES_PADRAO: Ajustes = {
  alimentacao: AJUSTES.alimentacaoReferencia,
  tensao: AJUSTES.tensaoReferencia,
}

/**
 * O que a missão e a preparação definem além dos botões (H27, H35).
 * Fica fixo durante uma tentativa.
 */
export interface ContextoProcesso {
  readonly material: MaterialId
  readonly espessuraMm: number
  /** Abertura entre as bordas da junta de topo. */
  readonly aberturaMm: number
  readonly diametroArameMm: number
  readonly gas: GasId
  /** Óxido removido antes de soldar (só faz diferença no alumínio). */
  readonly oxidoRemovido: boolean
  /** Técnica de deslocamento (H38). Ausente = neutra (dados antigos). */
  readonly tecnica?: Tecnica
  /** Movimento da tocha (H39). Ausente = linha reta (dados antigos). */
  readonly movimento?: Movimento
  /** Formato da junta vista de cima (H41). Só dados antigos: a junta agora é sempre reta. */
  readonly formato?: FormatoJunta
  /** Tipo de junta (H46). Ausente = topo reto (dados antigos). */
  readonly junta?: TipoJunta
  /** Como a peça chega para soldar (H47). Ausente = plana. */
  readonly posicaoInicial?: PosicaoPeca
  /** A peça está presa na estrutura e não pode ser girada nem tombada (H47). */
  readonly posicaoFixa?: boolean
}

/** H38: inclinação da tocha no sentido do deslocamento. */
export type Tecnica = 'empurrando' | 'neutra' | 'puxando'
export const TECNICAS: Tecnica[] = ['empurrando', 'neutra', 'puxando']

export const INFO_TECNICA: Record<Tecnica, { nome: string; resumo: string; forma: number; fusao: number }> = {
  empurrando: { nome: 'Empurrando', resumo: 'Tocha inclinada para a frente: cordão mais largo e baixo, menos fusão.', forma: 0.88, fusao: 0.9 },
  neutra: { nome: 'Neutra', resumo: 'Tocha a prumo: comportamento de referência.', forma: 1, fusao: 1 },
  puxando: { nome: 'Puxando', resumo: 'Tocha inclinada para trás: cordão mais alto e estreito, mais fusão.', forma: 1.12, fusao: 1.12 },
}

export function tecnicaDe(ctx: ContextoProcesso): Tecnica {
  return ctx.tecnica ?? 'neutra'
}

/** H39: oscilação lateral da tocha sobre a junta (tecimento). */
export type Movimento = 'reto' | 'zigue-zague' | 'meia-lua' | 'circulos'
export const MOVIMENTOS: Movimento[] = ['reto', 'zigue-zague', 'meia-lua', 'circulos']

/** k: espalhamento lateral σ = amplitude × k (H39). */
export const INFO_MOVIMENTO: Record<Movimento, { nome: string; resumo: string; k: number }> = {
  reto: { nome: 'Linha reta', resumo: 'A tocha segue a junta sem oscilar: cordão estreito, calor concentrado no centro.', k: 0 },
  'zigue-zague': { nome: 'Zigue-zague', resumo: 'Vaivém lateral contínuo: cordão mais largo e baixo, calor mais espalhado. Avance mais devagar.', k: 0.58 },
  'meia-lua': { nome: 'Meia-lua', resumo: 'Arcos com pausa nas pontas: o mais largo, cobre melhor as bordas, funde menos no centro.', k: 0.8 },
  circulos: { nome: 'Círculos', resumo: 'Pequenos círculos sobre a junta: largura intermediária entre zigue-zague e meia-lua.', k: 0.71 },
}

export function movimentoDe(ctx: ContextoProcesso): Movimento {
  return ctx.movimento ?? 'reto'
}

/** σ lateral que o movimento escolhido acrescenta a cada depósito (mm, H39). */
export function espalhamentoDoMovimento(ctx: ContextoProcesso): number {
  return MOVIMENTO.amplitudeMm * INFO_MOVIMENTO[movimentoDe(ctx)].k
}

/**
 * Deslocamento visual da tocha no instante t (só desenho, H39): o modelo usa
 * apenas o espalhamento médio, não a posição instantânea da oscilação.
 */
export function oscilacaoVisual(m: Movimento, tMs: number): { dx: number; dy: number } {
  const A = MOVIMENTO.amplitudeMm
  const fase = ((tMs / 1000) * MOVIMENTO.frequenciaVisualHz) % 1
  if (m === 'zigue-zague') return { dx: 0, dy: A * (fase < 0.5 ? 4 * fase - 1 : 3 - 4 * fase) }
  if (m === 'meia-lua') {
    // Meia volta de um lado a outro com pausa de 20 % em cada ponta.
    const meio = fase < 0.5 ? fase * 2 : (fase - 0.5) * 2
    const u = Math.min(1, Math.max(0, (meio - 0.2) / 0.6))
    const lado = fase < 0.5 ? -1 : 1
    const ang = Math.PI * u
    return { dx: -A * 0.4 * Math.sin(ang), dy: lado * A * Math.cos(ang) }
  }
  if (m === 'circulos') return { dx: A * 0.8 * Math.cos(2 * Math.PI * fase), dy: A * Math.sin(2 * Math.PI * fase) }
  return { dx: 0, dy: 0 }
}

/** O contexto do modo livre das etapas 1–4: reproduz exatamente o modelo antigo. */
export const CONTEXTO_PADRAO: ContextoProcesso = {
  material: 'aco-carbono',
  espessuraMm: 3,
  aberturaMm: 1,
  diametroArameMm: 1,
  gas: 'ar-co2',
  oxidoRemovido: true,
}

export function limitarAjustes(a: Ajustes): Ajustes {
  const limitar = (v: number) => Math.min(AJUSTES.maximo, Math.max(AJUSTES.minimo, v))
  return { alimentacao: limitar(a.alimentacao), tensao: limitar(a.tensao) }
}

/**
 * H28: corrente RELATIVA (1 = alimentação 5 com arame de 1,0 mm). É derivada
 * da alimentação e do diâmetro — numa fonte de tensão constante ela não é um
 * controle independente.
 */
export function correnteRelativa(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): number {
  return (a.alimentacao / AJUSTES.alimentacaoReferencia) * ctx.diametroArameMm ** 2
}

/** H1 + H29: volume por segundo ∝ alimentação × seção do arame × rendimento do gás. A tensão não entra. */
export function taxaDeposicao(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): number {
  return MODELO.taxaDeposicaoMm3s * correnteRelativa(a, ctx) * GASES[ctx.gas].rendimento
}

/** H31: potência relativa do arco = corrente relativa × tensão relativa. */
export function potenciaRelativa(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): number {
  return correnteRelativa(a, ctx) * (a.tensao / AJUSTES.tensaoReferencia)
}

/** H9 + H38: forma da seção considerando também a técnica de deslocamento. */
export function razaoEfetiva(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): number {
  return razaoAlturaLargura(a) * INFO_TECNICA[tecnicaDe(ctx)].forma
}

/**
 * H9: mais tensão → cordão mais achatado (razão altura/largura menor).
 * Interpolação linear entre os extremos do botão — forma escolhida para o
 * jogo, só a DIREÇÃO da tendência é o que se quer mostrar.
 */
export function razaoAlturaLargura(a: Ajustes): number {
  const f = (a.tensao - AJUSTES.minimo) / (AJUSTES.maximo - AJUSTES.minimo)
  return MODELO.razaoTensaoMinima + (MODELO.razaoTensaoMaxima - MODELO.razaoTensaoMinima) * f
}

export type CondicaoArco = 'curto' | 'equilibrado' | 'longo'

export interface EquilibrioArco {
  /** Tensão que o jogo considera equilibrada para esta alimentação. */
  tensaoEquilibrio: number
  /** tensão − tensão de equilíbrio, em pontos de botão. */
  desvio: number
  condicao: CondicaoArco
}

/**
 * H10 + H30: mais corrente pede mais tensão. Fora da tolerância o arco fica
 * "curto" ou "longo". Isso só gera aviso e efeito visual.
 */
export function equilibrioArco(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): EquilibrioArco {
  const alimentacaoEquivalente = correnteRelativa(a, ctx) * AJUSTES.alimentacaoReferencia
  const tensaoEquilibrio = EQUILIBRIO.base + EQUILIBRIO.inclinacao * alimentacaoEquivalente
  const desvio = a.tensao - tensaoEquilibrio
  const condicao: CondicaoArco =
    desvio < -EQUILIBRIO.tolerancia ? 'curto' : desvio > EQUILIBRIO.tolerancia ? 'longo' : 'equilibrado'
  return { tensaoEquilibrio, desvio, condicao }
}

/**
 * H11/H17: a meta do jogo é uma faixa fixa de ÁREA de seção — a que se obtém
 * com a alimentação de referência andando dentro da faixa-alvo de velocidade.
 */
export function areaAlvo(): { minMm2: number; maxMm2: number } {
  return {
    minMm2: MODELO.taxaDeposicaoMm3s / VELOCIDADE.alvoMaxMms,
    maxMm2: MODELO.taxaDeposicaoMm3s / VELOCIDADE.alvoMinMms,
  }
}

/** H11: a meta é um tamanho de seção fixo, então a faixa de velocidade acompanha a taxa de deposição. */
export function faixaVelocidadeAlvo(a: Ajustes, ctx: ContextoProcesso = CONTEXTO_PADRAO): { minMms: number; maxMms: number } {
  const fator = taxaDeposicao(a, ctx) / MODELO.taxaDeposicaoMm3s
  return { minMms: VELOCIDADE.alvoMinMms * fator, maxMms: VELOCIDADE.alvoMaxMms * fator }
}
