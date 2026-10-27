import type { SecaoLocal, Cordao } from './cordao'
import { aberturaNaFaceMm, INFO_JUNTA, juntaDe } from './juntas'
import { GASES, MATERIAIS } from './material'
import { FUSAO, MODELO, MOVIMENTO } from './parametros'
import type { Percurso } from './percurso'
import { INFO_TECNICA, tecnicaDe, type ContextoProcesso } from './processo'

/*
 * Índice de fusão SINTÉTICO (H33) e cobertura das bordas (H34).
 * Tudo aqui é aproximação didática: serve para o jogo distinguir "pouco
 * calor", "calor adequado" e "calor demais", nunca para prever uma solda real.
 */

export type EstadoFusao = 'sem-cordao' | 'perfuracao' | 'enchimento' | 'borda' | 'falta' | 'adequada' | 'excessiva'

export const DESCRICAO_ESTADO: Record<EstadoFusao, string> = {
  'sem-cordao': 'sem cordão',
  perfuracao: 'perfuração prevista',
  enchimento: 'junta não preenchida',
  borda: 'borda da junta não coberta',
  falta: 'falta de fusão prevista',
  adequada: 'fusão adequada prevista',
  excessiva: 'fusão excessiva prevista',
}

export interface PontoFusao {
  xMm: number
  /** Índice de fusão F (adimensional). */
  indice: number
  /** Aporte relativo por mm (potência × s ÷ mm), sem o efeito do aquecimento. */
  aporteMm: number
  estado: EstadoFusao
}

/** Mesmo espalhamento do cordão (H4): o calor também não fica num ponto só. */
export function suavizar(v: Float64Array, passoMm: number): Float64Array {
  const sigma = MODELO.sigmaPocaMm / passoMm
  const raio = Math.ceil(3 * sigma)
  const pesos = Array.from({ length: 2 * raio + 1 }, (_, k) => Math.exp(-0.5 * ((k - raio) / sigma) ** 2))
  const saida = new Float64Array(v.length)
  for (let i = 0; i < v.length; i++) {
    let soma = 0
    let pesoTotal = 0
    for (let k = -raio; k <= raio; k++) {
      const j = i + k
      if (j < 0 || j >= v.length) continue
      soma += v[j] * pesos[k + raio]
      pesoTotal += pesos[k + raio]
    }
    saida[i] = soma / pesoTotal
  }
  return saida
}

/** Aporte relativo por mm que funde exatamente a espessura (F = 1); a junta muda quanto calor é preciso (H46). */
export function aporteNecessario(ctx: ContextoProcesso): number {
  return FUSAO.necessidadePorMm * ctx.espessuraMm * MATERIAIS[ctx.material].necessidadeFusao * INFO_JUNTA[juntaDe(ctx)].fatorFusao
}

/** Metal acumulado sob o arco amortece a fusão (H33). */
export function amortecimento(areaMm2: number): number {
  return 1 / (1 + (areaMm2 / FUSAO.areaAmortecimentoMm2) ** 2)
}

export function analisarFusao(cordao: Cordao, percurso: Percurso, ctx: ContextoProcesso): PontoFusao[] {
  const passo = cordao.passoMm
  const efetivo = suavizar(percurso.copiaDosAportesEfetivos(), passo)
  const bruto = suavizar(percurso.copiaDosAportes(), passo)
  const necessario = aporteNecessario(ctx)
  const material = MATERIAIS[ctx.material]
  const limpeza = material.exigeLimpeza && !ctx.oxidoRemovido ? FUSAO.fatorSemLimpeza : 1
  const gas = GASES[ctx.gas].fatorFusao * INFO_TECNICA[tecnicaDe(ctx)].fusao

  return Array.from({ length: cordao.nPosicoes }, (_, i) => {
    const s = cordao.secao(i)
    // H39: oscilando, o mesmo calor se espalha numa faixa mais larga.
    const espalhamento = s.larguraMm > 0 ? (s.larguraSemOscilacaoMm / s.larguraMm) ** MOVIMENTO.expoenteFusao : 1
    const indice = (efetivo[i] / passo / necessario) * amortecimento(s.areaMm2) * gas * limpeza * espalhamento
    let estado: EstadoFusao
    if (s.larguraMm < 1) estado = 'sem-cordao'
    else if (indice > FUSAO.perfuracao) estado = 'perfuracao'
    else if ((s.enchimento ?? 1) < 1) estado = 'enchimento'
    else if (margemCoberturaBordas(s, ctx) < 0) estado = 'borda'
    else if (indice < FUSAO.minimoAdequado) estado = 'falta'
    else if (indice <= FUSAO.maximoAdequado) estado = 'adequada'
    else estado = 'excessiva'
    return { xMm: s.xMm, indice, aporteMm: bruto[i] / passo, estado }
  })
}

/**
 * Margem em mm até o critério de cobertura (H34/H46).
 * Negativa = borda descoberta; zero ou positiva = atende ao critério.
 */
export function margemCoberturaBordas(s: SecaoLocal, ctx: ContextoProcesso): number {
  const junta = juntaDe(ctx)
  if (INFO_JUNTA[junta].familia === 'filete') {
    if (!s.pernasMm) return 0
    return Math.min(...s.pernasMm) - 0.5 * Math.max(...s.pernasMm)
  }
  return s.larguraMm / 2 - Math.abs(s.yCentroMm) - aberturaNaFaceMm(junta, ctx) / 2 - FUSAO.margemBordaMm
}

/**
 * Índice de deformação D (H36): calor colocado além do necessário, vezes a
 * tendência do material a deformar. Média sobre as posições com cordão.
 */
export function indiceDeformacao(pontos: PontoFusao[], ctx: ContextoProcesso): number {
  const comCordao = pontos.filter((p) => p.estado !== 'sem-cordao')
  if (comCordao.length === 0) return 0
  const aporteMedio = comCordao.reduce((s, p) => s + p.aporteMm, 0) / comCordao.length
  return (
    ((aporteMedio / aporteNecessario(ctx)) * MATERIAIS[ctx.material].fatorDeformacao) / FUSAO.normalizacaoDeformacao
  )
}
