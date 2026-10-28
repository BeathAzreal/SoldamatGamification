import { describe, expect, it } from 'vitest'
import { CONSUMO, estagioChapa, larguraFuroMm, LIMIARES_PENETRACAO, novoMapaConsumo, preencherMapaConsumo } from '../src/modelo/consumoChapa'
import { analisarDefeitos } from '../src/modelo/defeitos'
import { analisarFusao } from '../src/modelo/fusao'
import { FUSAO, PECA } from '../src/modelo/parametros'
import { botaoDaTensao, CONTEXTO_PADRAO, type ContextoProcesso } from '../src/modelo/processo'
import { Simulacao } from '../src/modelo/simulacao'

/** Tocha parada no meio da chapa por `seg` segundos; devolve a análise no meio. */
function parado(V: number, seg: number, ctx: ContextoProcesso = CONTEXTO_PADRAO, dtMs = 8) {
  const sim = new Simulacao(ctx)
  sim.definirAjustes({ alimentacao: 5, tensao: botaoDaTensao(V) })
  let t = 0
  sim.iniciarArco({ t, x: 75, y: 0 })
  while (t < seg * 1000) { t += dtMs; sim.moverTocha({ t, x: 75, y: 0 }) }
  sim.encerrarArco({ t, x: 75, y: 0 })
  const fusao = analisarFusao(sim.cordao, sim.percurso, ctx)
  const a = analisarDefeitos({ cordao: sim.cordao, percurso: sim.percurso, contexto: ctx, registro: sim.registro, fusao })
  const i = sim.cordao.indiceEm(75)
  return { a, i, F: fusao[i].indice, sim }
}

describe('H101: a chapa consumida em estágios pelo calor', () => {
  it('estágios na ordem: raiz, vazando, afundando, furada', () => {
    const l = LIMIARES_PENETRACAO['aco-carbono']
    expect([1, 1.8, 2.2, 2.5, 3].map((F) => estagioChapa(F, l))).toEqual(['intacta', 'raiz', 'vazando', 'afundando', 'furada'])
  })
  it('o alumínio quase não avisa: onde o aço já vaza, ele ainda está inteiro', () => {
    expect(estagioChapa(2.2, LIMIARES_PENETRACAO['aco-carbono'])).toBe('vazando')
    expect(estagioChapa(2.2, LIMIARES_PENETRACAO.aluminio)).toBe('intacta')
    const faixa = (m: keyof typeof LIMIARES_PENETRACAO) => LIMIARES_PENETRACAO[m].furo - LIMIARES_PENETRACAO[m].raizAparente
    expect(faixa('aluminio')).toBeLessThan(faixa('aco-carbono') / 2)
  })
  it('o buraco nasce pequeno no meio e alarga com o calor', () => {
    expect(larguraFuroMm(FUSAO.perfuracao, 10)).toBe(0)
    expect(larguraFuroMm(FUSAO.perfuracao * 1.02, 10)).toBeLessThan(1)
    const l = [3, 4, 6, 10, 20].map((F) => larguraFuroMm(F, 30))
    for (let k = 1; k < l.length; k++) expect(l[k]).toBeGreaterThan(l[k - 1])
  })
  it('tocha parada: o buraco abre e só cresce (o que caiu não volta)', () => {
    const larguras = [3, 6, 10, 14].map((s) => { const r = parado(28, s); return r.a.furoMm[r.i] })
    expect(larguras[0]).toBeGreaterThan(0)
    for (let k = 1; k < larguras.length; k++) expect(larguras[k]).toBeGreaterThanOrEqual(larguras[k - 1])
    expect(larguras[3]).toBeGreaterThan(larguras[0])
  })
  it('antes de furar, o metal vaza: a faixa do avesso que vazou é mais larga que o buraco', () => {
    const r = parado(28, 6)
    expect(r.a.larguraAvessoMm[r.i]).toBeGreaterThan(r.a.furoMm[r.i])
    expect(r.a.penetracaoMm[r.i]).toBeGreaterThan(1)
  })
  it('a espessura conta: na chapa de 8 mm o mesmo tempo parado não fura', () => {
    const r = parado(28, 6, { ...CONTEXTO_PADRAO, espessuraMm: 8 })
    expect(r.a.furoMm[r.i]).toBe(0)
  })
  it('o material conta: o alumínio pede mais calor para fundir (conduz para longe)', () => {
    const aco = parado(24, 4).F
    const alu = parado(24, 4, { ...CONTEXTO_PADRAO, material: 'aluminio', gas: 'ar', diametroArameMm: 1.2 }).F
    expect(alu).toBeLessThan(aco)
  })
  it('independe da taxa de quadros', () => {
    const a = parado(28, 5, CONTEXTO_PADRAO, 1000 / 144)
    const b = parado(28, 5, CONTEXTO_PADRAO, 1000 / 30)
    expect(Math.abs(a.a.furoMm[a.i] - b.a.furoMm[b.i])).toBeLessThan(0.4)
  })
  it('o mapa da chapa recorta o ponto mais quente (o meio da poça), não as bordas', () => {
    const r = parado(28, 8)
    const mapa = novoMapaConsumo(PECA.comprimentoMm)
    const centro = new Float32Array(r.a.n)
    expect(preencherMapaConsumo(mapa, r.a.passoMm, r.a.furoMm, centro, r.a.afundamento)).toBe(true)
    const celula = (xMm: number, nMm: number) => {
      const ix = Math.floor(xMm / CONSUMO.celulaMm)
      const iy = Math.floor((nMm + CONSUMO.meiaLarguraMm) / CONSUMO.celulaMm)
      return mapa.dados[4 * (iy * mapa.nx + ix)]
    }
    expect(celula(75, 0)).toBe(255)
    expect(celula(75, 12)).toBe(0)
    expect(celula(40, 0)).toBe(0)
  })
})
