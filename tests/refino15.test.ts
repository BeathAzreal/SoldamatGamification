import { describe, expect, it } from 'vitest'
import { Acionamento15 } from '../src/modelo/acionamento15'
import { Escoria15 } from '../src/modelo/escoria15'
import { nomeTecla15 } from '../src/dados/controles15'

function aberto(distancia = 2.5) {
  const m = new Acionamento15('eletrodo')
  m.pressionado = true
  m.definirDistancia(0)
  m.avancar(1 / 120)
  m.definirDistancia(distancia)
  m.avancar(1 / 120)
  return m
}

describe('refino da bancada SMAW (H68–H70)', () => {
  it('H68: riscar a ponta na chapa demora mais para grudar do que bater parado', () => {
    const parado = new Acionamento15('eletrodo'), riscando = new Acionamento15('eletrodo')
    for (const m of [parado, riscando]) { m.pressionado = true; m.definirDistancia(0) }
    for (let i = 0; i < 48; i++) {
      parado.avancar(1 / 60)
      riscando.xMm += 0.5 // 30 mm/s
      riscando.avancar(1 / 60)
    }
    expect(parado.estado).toBe('grudado')
    expect(riscando.estado).toBe('contato')
    riscando.definirDistancia(2.5)
    riscando.avancar(1 / 60)
    expect(riscando.estado).toBe('arco')
  })

  it('H69: classifica o arco pelo diâmetro da alma', () => {
    expect(aberto(0.8).faixaArco).toBe('curto')
    expect(aberto(2.5).faixaArco).toBe('adequado')
    expect(aberto(4.5).faixaArco).toBe('longo')
    const solto = new Acionamento15('eletrodo')
    expect(solto.faixaArco).toBeNull()
  })

  it('H69: arco longo deposita cordão mais baixo e instável e gera mais respingos', () => {
    const formas: Record<string, { razao: number; instabilidade: number }[]> = { curto: [], longo: [] }
    const curto = aberto(1), longo = aberto(4.5)
    curto.avancar(0.5, -curto.consumoMmS, (_, f) => formas.curto.push(f!))
    longo.avancar(0.5, -longo.consumoMmS, (_, f) => formas.longo.push(f!))
    expect(formas.curto.length).toBeGreaterThan(0)
    expect(formas.longo[0].razao).toBeLessThan(formas.curto[0].razao)
    expect(formas.longo[0].instabilidade).toBeGreaterThan(formas.curto[0].instabilidade)
    expect(longo.respingos).toBeGreaterThan(curto.respingos)
  })

  it('H70: compensação mantém a distância enquanto a vareta é consumida', () => {
    const livre = aberto(2.5), assistido = aberto(2.5)
    assistido.compensar = true
    livre.avancar(3)
    assistido.avancar(3)
    expect(livre.estado).not.toBe('arco')
    expect(assistido.estado).toBe('arco')
    expect(assistido.distanciaMm).toBeCloseTo(2.5, 1)
    expect(assistido.restanteMm).toBeLessThan(115)
  })

  it('mede o avanço da ponta e posicionar não conta como deslocamento', () => {
    const m = aberto(2.5)
    m.compensar = true
    for (let i = 0; i < 60; i++) { m.xMm += 0.1; m.avancar(1 / 60) }
    expect(m.velocidadeMmS).toBeGreaterThan(4)
    expect(m.velocidadeMmS).toBeLessThan(7)
    m.posicionar(10, 0)
    m.avancar(1 / 60)
    expect(m.velocidadeMmS).toBeLessThan(6)
  })

  it('escória cobre a largura do cordão e conserva o volume entre as células', () => {
    const larga = new Escoria15(), ponto = new Escoria15()
    larga.depositar(75, 0, 2, 4)
    ponto.depositar(75, 0, 2)
    expect(larga.quantidade.filter(q => q > 0).length).toBeGreaterThan(4)
    expect(larga.cobertura).toBeCloseTo(ponto.cobertura)
    expect(larga.areaMm2).toBeCloseTo(larga.cobertura * 9)
    expect(larga.fracaoQuente).toBe(1)
    larga.esfriar(6)
    expect(larga.fracaoQuente).toBe(0)
  })

  it('cordão inteiro coberto pode ser limpo com martelinho e escova ao longo do caminho', () => {
    const m = aberto(2.5)
    m.compensar = true
    for (let i = 0; i < 300; i++) { m.xMm += 0.05; m.avancar(1 / 60) }
    m.soltar()
    m.avancar(6)
    for (let x = 70; x <= 95; x += 3) m.escoria.martelar(x, 0)
    for (let x = 70; x <= 95; x += 3) m.escoria.escovar(x, 0)
    expect(m.escoria.cobertura).toBeLessThan(1e-9)
  })

  it('mostra teclas com nomes legíveis', () => {
    expect(nomeTecla15('Space')).toBe('Espaço')
    expect(nomeTecla15('KeyS')).toBe('S')
    expect(nomeTecla15('Digit4')).toBe('4')
    expect(nomeTecla15('ArrowUp')).toBe('↑')
  })
})
