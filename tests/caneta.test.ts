import { describe, expect, it } from 'vitest'
import { FontePonteiro, OPCOES_CANETA_PADRAO } from '../src/entrada/ponteiro'
import { Simulacao } from '../src/modelo/simulacao'

/** Elemento falso: guarda os ouvintes e permite disparar eventos de ponteiro. */
class AlvoFalso {
  private ouvintes = new Map<string, ((e: unknown) => void)[]>()
  addEventListener(tipo: string, f: (e: unknown) => void) {
    this.ouvintes.set(tipo, [...(this.ouvintes.get(tipo) ?? []), f])
  }
  removeEventListener() {}
  setPointerCapture() {}
  getBoundingClientRect() {
    return { left: 0, top: 0 }
  }
  disparar(type: string, e: { pointerType: string; buttons: number; pressure: number; x: number; t: number }) {
    const evento = { type, pointerType: e.pointerType, buttons: e.buttons, pressure: e.pressure, clientX: e.x, clientY: 0, timeStamp: e.t, tiltX: 0, tiltY: 0, preventDefault() {} }
    for (const f of this.ouvintes.get(type) ?? []) f(evento)
  }
}

const mapa = { paraPeca: (px: number, py: number) => ({ x: px, y: py }) }

/** Passa por cima (hover), encosta, arrasta 40 mm e levanta. */
function passe(tipoHover: string, tipoContato: string, pressaoContato: number) {
  const alvo = new AlvoFalso()
  const fonte = new FontePonteiro('caneta', alvo as unknown as HTMLElement, mapa, OPCOES_CANETA_PADRAO)
  const sim = new Simulacao()
  fonte.ligar(sim)
  let t = 0
  alvo.disparar('pointermove', { pointerType: tipoHover, buttons: 0, pressure: 0, x: 10, t })
  const abertoNoHover = sim.arcoAberto
  alvo.disparar('pointerdown', { pointerType: tipoContato, buttons: 1, pressure: pressaoContato, x: 10, t: (t += 8) })
  for (let x = 10; x <= 50; x += 0.1) alvo.disparar('pointermove', { pointerType: tipoContato, buttons: 1, pressure: pressaoContato, x, t: (t += 8) })
  const abertoNoContato = sim.arcoAberto
  alvo.disparar('pointerup', { pointerType: tipoContato, buttons: 0, pressure: 0, x: 50, t: (t += 8) })
  return { abertoNoHover, abertoNoContato, fechou: !sim.arcoAberto, volume: sim.cordao.volumeTotal(), ultimo: fonte.ultimoEvento }
}

describe('caneta: contato abre o arco com qualquer driver', () => {
  it('caneta pura (Windows Ink): passar por cima não solda; encostar solda', () => {
    const r = passe('pen', 'pen', 0.4)
    expect(r.abertoNoHover).toBe(false)
    expect(r.abertoNoContato).toBe(true)
    expect(r.fechou).toBe(true)
    expect(r.volume).toBeGreaterThan(0)
  })

  it('driver que manda o toque como mouse', () => {
    const r = passe('pen', 'mouse', 0.5)
    expect(r.abertoNoContato).toBe(true)
    expect(r.volume).toBeGreaterThan(0)
  })

  it('driver que manda o toque como toque', () => {
    const r = passe('pen', 'touch', 0.5)
    expect(r.abertoNoContato).toBe(true)
  })

  it('registra o último evento para diagnóstico', () => {
    expect(passe('pen', 'pen', 0.4).ultimo).toContain('pointerup · pen')
  })
})

describe('mouse e caneta com velocidade máxima de soldagem (H87)', () => {
  it('com o arco aberto a tocha não passa de VELOCIDADE_MAXIMA_PONTEIRO; com a mão parada, alcança a mão quadro a quadro', async () => {
    const { VELOCIDADE_MAXIMA_PONTEIRO: V } = await import('../src/entrada/ponteiro')
    expect(V).toBeLessThanOrEqual(16)
    const alvo = new AlvoFalso()
    const fonte = new FontePonteiro('mouse', alvo as unknown as HTMLElement, mapa, OPCOES_CANETA_PADRAO)
    const sim = new Simulacao()
    fonte.ligar(sim)
    let t = 1000
    alvo.disparar('pointerdown', { pointerType: 'mouse', buttons: 1, pressure: 0.5, x: 10, t })
    // Mão a 40 mm/s durante 1 s: a tocha anda só V mm.
    for (let k = 1; k <= 125; k++) alvo.disparar('pointermove', { pointerType: 'mouse', buttons: 1, pressure: 0.5, x: 10 + 40 * k * 0.008, t: (t += 8) })
    expect(fonte.posicao!.x).toBeCloseTo(10 + V, 4)
    // Mão parada em 50 mm: a cada quadro a tocha continua indo até ela, sem passar.
    for (let k = 0; k < 600; k++) fonte.atualizar((t += 16))
    expect(fonte.posicao!.x).toBeCloseTo(50, 6)
    alvo.disparar('pointerup', { pointerType: 'mouse', buttons: 0, pressure: 0, x: 50, t: (t += 8) })
    expect(sim.arcoAberto).toBe(false)
    // Mão devagar (abaixo do limite): a tocha fica embaixo do ponteiro.
    alvo.disparar('pointerdown', { pointerType: 'mouse', buttons: 1, pressure: 0.5, x: 60, t: (t += 8) })
    for (let k = 1; k <= 125; k++) alvo.disparar('pointermove', { pointerType: 'mouse', buttons: 1, pressure: 0.5, x: 60 + 8 * k * 0.008, t: (t += 8) })
    expect(fonte.posicao!.x).toBeCloseTo(68, 4)
    // Arco fechado: a tocha mira no ponto exato da tela, sem limite.
    alvo.disparar('pointerup', { pointerType: 'mouse', buttons: 0, pressure: 0, x: 68, t: (t += 8) })
    alvo.disparar('pointermove', { pointerType: 'mouse', buttons: 0, pressure: 0, x: 120, t: (t += 8) })
    expect(fonte.posicao!.x).toBeCloseTo(120, 6)
  })
})
