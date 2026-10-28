import { describe, expect, it } from 'vitest'
import { ModeloTig, pedalDaPressao, TIG } from '../src/modelo/tig'
import { PECAS_TIG, comoPecaBase, pecaTig, type PecaTig } from '../src/missoes/pecasTig'
import { DepositoEletrodo } from '../src/modelo/depositoEletrodo'
import { avaliarTig, inspecionarTig } from '../src/pontuacao/tig'
import { aprovacaoEletrodo } from '../src/pontuacao/eletrodo'

interface Jeito {
  fps?: number
  corrente?: number
  velocidade?: number
  distancia?: number
  /** Intervalo entre toques da vareta (s); 0 = sem vareta. */
  cadencia?: number
  toqueS?: number
  /** Espera a poça antes de andar. */
  esperarPoca?: boolean
  rampaFinal?: boolean
}

/** Soldador simulado: pedal cheio, avanço constante, toques de vareta no ritmo. */
function soldar(p: PecaTig, j: Jeito = {}) {
  const fps = j.fps ?? 60, dt = 1 / fps
  const m = new ModeloTig(p), dep = new DepositoEletrodo(comoPecaBase(p))
  m.correnteA = j.corrente ?? (p.correnteA.min + p.correnteA.max) / 2
  m.xMm = p.inicioMm - 2
  m.distanciaMm = j.distancia ?? 2.5
  m.pedal = 1
  const depositar = (x: number, y: number, v: number) => dep.depositar(x, y, v)
  let t = 0
  if (j.esperarPoca !== false) while (m.raioPocaMm < 1.5 && t < 5) { m.avancar(dt, depositar); t += dt }
  let andando = 0
  while (m.xMm < p.fimMm + 1 && t < 200) {
    m.xMm += (j.velocidade ?? 2) * dt
    andando += dt
    m.mergulhar = !!j.cadencia && andando % j.cadencia < (j.toqueS ?? 0.2)
    m.avancar(dt, depositar)
    t += dt
  }
  m.mergulhar = false
  if (j.rampaFinal !== false) for (let k = 0; k < fps; k++) { m.pedal = Math.max(0, 1 - k / fps); m.avancar(dt, depositar) }
  m.pedal = 0
  m.avancar(dt, depositar)
  return { m, dep, r: avaliarTig(p, m, dep, 'profissional') }
}

describe('TIG (H92): modelo de calor, poça e vareta', () => {
  it('sem pedal não há arco nem calor; com o tungstênio longe o arco não abre', () => {
    const m = new ModeloTig(PECAS_TIG[0])
    m.distanciaMm = 2
    m.avancar(1)
    expect(m.estado).toBe('pronto')
    expect(m.energiaJ).toBe(0)
    m.pedal = 1; m.distanciaMm = 7
    m.avancar(0.5)
    expect(m.estado).toBe('afastado')
    m.distanciaMm = 3
    m.avancar(1.5)
    expect(m.estado).toBe('arco')
    expect(m.raioPocaMm).toBeGreaterThan(1)
  })

  it('mais devagar alarga a poça; mais rápido estreita', () => {
    const p = pecaTig('tig-chapa')
    const largura = (v: number) => { const { m } = soldar(p, { velocidade: v }); return m.larguraFundida(75) }
    expect(largura(1)).toBeGreaterThan(largura(2))
    expect(largura(2)).toBeGreaterThan(largura(4))
  })

  it('a vareta só funde na poça: na chapa fria ela bate e conta como defeito', () => {
    const p = pecaTig('tig-chapa')
    const m = new ModeloTig(p)
    m.distanciaMm = 2.5
    m.mergulhar = true
    m.avancar(0.5)
    expect(m.varetaFria).toBe(1)
    expect(m.toques.length).toBe(0)
  })

  it('tungstênio na poça e vareta no tungstênio contaminam; afiar só com o arco apagado', () => {
    const p = pecaTig('tig-chapa')
    const m = new ModeloTig(p)
    m.pedal = 1; m.distanciaMm = 2
    m.avancar(1)
    m.distanciaMm = 0.2
    m.avancar(0.2)
    expect(m.contaminacoes).toBe(1)
    expect(m.contaminado).toBe(true)
    expect(m.afiar()).toBe(false)
    m.distanciaMm = 0.8; m.mergulhar = true
    m.avancar(0.3)
    expect(m.varetaNoTungstenio).toBe(1)
    m.pedal = 0; m.avancar(0.1)
    expect(m.afiar()).toBe(true)
    expect(m.contaminado).toBe(false)
  })

  it('corrente acima da faixa fura a chapa fina', () => {
    const p = pecaTig('tig-topo')
    expect(soldar(p, { cadencia: 0.7 }).m.furos.length).toBe(0)
    expect(soldar(p, { corrente: p.correnteA.max + 25, cadencia: 0.7 }).m.furos.length).toBeGreaterThan(0)
  })

  it('não depende da taxa de quadros', () => {
    const p = pecaTig('tig-chapa')
    const a = soldar(p, { fps: 30, cadencia: 0.7 }), b = soldar(p, { fps: 144, cadencia: 0.7 })
    expect(a.m.larguraFundida(75)).toBeCloseTo(b.m.larguraFundida(75), 0)
    expect(a.r.nota).toBeGreaterThan(b.r.nota - 120)
    expect(a.r.nota).toBeLessThan(b.r.nota + 120)
  })
})

describe('TIG (H92): nota de 0 a 1000', () => {
  for (const p of PECAS_TIG) {
    it(`soldador atento vai bem e é aprovado no Difícil: ${p.titulo}`, () => {
      const { m, dep, r } = soldar(p, { cadencia: 0.7, velocidade: p.junta === 't' ? 1.5 : 2 })
      expect(r.cobertura).toBeGreaterThan(0.9)
      expect(r.nota).toBeGreaterThan(600)
      expect(aprovacaoEletrodo(r, 'profissional').aprovada).toBe(true)
      expect(inspecionarTig(p, m, dep).filter((d) => d.grave)).toEqual([])
    })
  }

  it('sem vareta: fundiu, mas sem reforço e sem escamas', () => {
    const p = pecaTig('tig-chapa')
    const { m, dep, r } = soldar(p)
    expect(r.cobertura).toBeGreaterThan(0.9)
    expect(r.itens.find((i) => i.nome === 'Adição e reforço')!.pontos).toBe(0)
    expect(r.itens.find((i) => i.nome === 'Escamas regulares')!.pontos).toBe(0)
    expect(inspecionarTig(p, m, dep).map((d) => d.nome)).toContain('Pouco reforço')
  })

  it('andar rápido demais deixa falta de fusão e reprova no Difícil', () => {
    const p = pecaTig('tig-chapa')
    const { m, dep, r } = soldar(p, { velocidade: 9, cadencia: 0.7 })
    expect(r.cobertura).toBeLessThan(0.5)
    expect(aprovacaoEletrodo(r, 'profissional').aprovada).toBe(false)
    expect(inspecionarTig(p, m, dep).some((d) => d.nome === 'Falta de fusão' && d.grave)).toBe(true)
  })

  it('cortar o arco de uma vez deixa cratera; soltar o pedal devagar, não', () => {
    const p = pecaTig('tig-chapa')
    expect(soldar(p, { cadencia: 0.7, rampaFinal: false }).m.crateras.length).toBe(1)
    expect(soldar(p, { cadencia: 0.7 }).m.crateras.length).toBe(0)
  })

  it('sem arco a nota é zero', () => {
    const p = pecaTig('tig-chapa')
    const m = new ModeloTig(p)
    expect(avaliarTig(p, m, new DepositoEletrodo(comoPecaBase(p)), 'aprendiz').nota).toBe(0)
  })

  it('pressão da caneta vira pedal: toque leve não acende, pedal cheio antes do fundo', () => {
    expect(pedalDaPressao(0)).toBe(0)
    expect(pedalDaPressao(0.05)).toBe(0)
    expect(pedalDaPressao(0.35)).toBeCloseTo(0.5)
    expect(pedalDaPressao(0.65)).toBe(1)
    expect(pedalDaPressao(1)).toBe(1)
  })

  it('a vareta acaba e precisa de uma nova', () => {
    const m = new ModeloTig(PECAS_TIG[0])
    expect(m.varetaRestanteMm).toBe(TIG.varetaInicialMm)
    m.varetaRestanteMm = 0
    m.novaVareta()
    expect(m.varetaRestanteMm).toBe(TIG.varetaInicialMm)
  })
})
