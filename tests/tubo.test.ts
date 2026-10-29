import { describe, expect, it } from 'vitest'
import { analisarDefeitos } from '../src/modelo/defeitos'
import { analisarFusao } from '../src/modelo/fusao'
import { gravidadeTubo, posicaoDe } from '../src/modelo/juntas'
import { PECA } from '../src/modelo/parametros'
import { CONTEXTO_PADRAO, type ContextoProcesso } from '../src/modelo/processo'
import { Simulacao } from '../src/modelo/simulacao'

const D = PECA.comprimentoMm / Math.PI
const TUBO: ContextoProcesso = { ...CONTEXTO_PADRAO, tubo: { diametroMm: D } }
const topo = PECA.comprimentoMm / 2
const s = (graus: number) => topo + (graus * Math.PI * D) / 360

describe('H103: gravidade em volta da emenda de dois tubos', () => {
  const fixo = { rolagemGraus: 0, giroGraus: 0 }
  it('em cima é plana, no lado é vertical e embaixo é sobrecabeça', () => {
    expect(posicaoDe(gravidadeTubo(fixo, s(0), D, topo))).toBe('plana')
    expect(posicaoDe(gravidadeTubo(fixo, s(90), D, topo))).toBe('vertical')
    expect(posicaoDe(gravidadeTubo(fixo, s(-90), D, topo))).toBe('vertical')
    expect(posicaoDe(gravidadeTubo(fixo, s(180), D, topo))).toBe('sobrecabeca')
  })
  it('no lado, avançando no sentido da volta, o metal desce (t > 0); do outro lado, sobe', () => {
    expect(gravidadeTubo(fixo, s(90), D, topo).t).toBeCloseTo(1, 6)
    expect(gravidadeTubo(fixo, s(-90), D, topo).t).toBeCloseTo(-1, 6)
  })
  it('girar o tubo no próprio eixo leva outro trecho para cima', () => {
    expect(posicaoDe(gravidadeTubo({ rolagemGraus: 0, giroGraus: -90 }, s(90), D, topo))).toBe('plana')
  })
  it('com o eixo do tubo de pé, a solda em volta é horizontal (2G)', () => {
    for (const g of [0, 90, 180, 270]) expect(posicaoDe(gravidadeTubo({ rolagemGraus: 90, giroGraus: 0 }, s(g), D, topo))).toBe('horizontal')
  })
})

/** Um passe de x0 a x1 a v mm/s com o tubo na posição dada. */
function passe(sim: Simulacao, x0: number, x1: number, v: number, t0: number) {
  let t = t0, x = x0
  sim.iniciarArco({ t, x, y: 0 })
  while (x < x1) { t += 8; x += (v * 8) / 1000; sim.moverTocha({ t, x, y: 0 }) }
  sim.encerrarArco({ t, x, y: 0 })
  return t + 3000
}

describe('H103: o efeito da gravidade aparece onde o tubo está', () => {
  const defeitos = (sim: Simulacao) => analisarDefeitos({ cordao: sim.cordao, percurso: sim.percurso, contexto: TUBO, registro: sim.registro, eventos: sim.eventos, fusao: analisarFusao(sim.cordao, sim.percurso, TUBO) })
  const media = (v: Float32Array, a: number, b: number) => { let m = 0; for (let i = Math.round(a / 0.5); i < Math.round(b / 0.5); i++) m = Math.max(m, v[i]); return m }

  it('tubo fixo (5G), volta inteira com a poça grande: gotas embaixo, escorrimento nos lados, nada em cima', () => {
    const sim = new Simulacao(TUBO)
    sim.definirAjustes({ alimentacao: 7, tensao: 6.5 })
    passe(sim, 3, 147, 4, 0)
    const a = defeitos(sim)
    expect(media(a.gotejamento, s(150), s(178))).toBeGreaterThan(0.2)
    expect(Math.max(media(a.rolos, s(70), s(110)), media(a.rolos, s(-110), s(-70)))).toBeGreaterThan(0.2)
    expect(media(a.gotejamento, s(-20), s(20))).toBe(0)
    expect(media(a.rolos, s(-20), s(20))).toBe(0)
  })
  it('girando o tubo a cada 45° para soldar sempre perto do alto (1G): sem gotas nem escorrimento', () => {
    const sim = new Simulacao(TUBO)
    sim.definirAjustes({ alimentacao: 7, tensao: 6.5 })
    let t = 0
    // Oito trechos de 45°: antes de cada um, o tubo gira para trazer o trecho para cima.
    for (let k = 0; k < 8; k++) {
      const a0 = -180 + 45 * k, a1 = a0 + 45
      expect(sim.definirPosicao({ rolagemGraus: 0, giroGraus: -(a0 + 22.5) })).toBe(true)
      t = passe(sim, Math.max(3, s(a0)), Math.min(147, s(a1)), 4, t)
    }
    const a = defeitos(sim)
    expect(Math.max(...a.gotejamento)).toBeLessThan(0.05)
    expect(Math.max(...a.rolos)).toBeLessThan(0.2)
  })
})
