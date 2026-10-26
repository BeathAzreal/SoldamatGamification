import { describe, expect, it } from 'vitest'
import { Acionamento15 } from '../codigo/eletrodo/arco-e-vareta'
import { analisarEletrodo } from '../codigo/eletrodo/analise-do-cordao'
import { inspecionarEletrodo, type ResultadoEletrodo } from '../codigo/eletrodo/nota-do-eletrodo'
import { pecaEletrodo, type PecaEletrodo } from '../codigo/eletrodo/pecas-de-treino'
import { RegistroPasse } from '../codigo/eletrodo/registro-do-passe'
import { Cordao } from '../codigo/simulacao-mig/cordao'

interface Tecnica {
  corrente?: number
  diametro?: number
  /** Velocidade de avanço (mm/s). */
  v: number
  /** Comprimento do arco mantido (mm). */
  arco?: number
  passes?: number
  limparEntrePasses?: boolean
  limparNoFim?: boolean
  /** Fica parado no fim do passe antes de afastar (enche a cratera). */
  pararNoFim?: boolean
  /** Abre o arco à frente e volta por cima do início. */
  recuarNaAbertura?: boolean
}

/** Soldador simulado a 60 quadros/s, com a mão firme: mantém o arco e o avanço pedidos. */
function soldar(peca: PecaEletrodo, t: Tecnica): { r: ResultadoEletrodo; cordao: Cordao } {
  const dt = 1 / 60
  const cordao = new Cordao(undefined, undefined, undefined, { junta: peca.junta, dimensoes: { espessuraMm: peca.espessuraMm, aberturaMm: peca.aberturaMm } })
  const reg = new RegistroPasse(cordao.nPosicoes, cordao.passoMm)
  const m = new Acionamento15('eletrodo')
  m.abrirAoTocar = true
  m.compensar = true
  m.regular(t.corrente ?? (peca.correnteA.min + peca.correnteA.max) / 2, t.diametro ?? peca.diametroMm)
  const arco = t.arco ?? m.diametroMm
  let tMs = 0
  const passo = (vx: number) => {
    m.xMm += vx * dt
    const antes = m.estado, inclAntes = m.escoria.inclusaoMm3
    m.avancar(dt, 0, (vol, f) => {
      cordao.depositar(m.xMm, m.yMm, vol, tMs, f?.razao, 0, f?.instabilidade ?? 0)
      if (f) reg.depositar(m.xMm, f, tMs, m.escoria.inclusaoMm3 - inclAntes)
    })
    if (antes !== 'arco' && m.estado === 'arco') reg.inicioArco(m.xMm, m.yMm, tMs, false)
    if (antes === 'arco' && m.estado !== 'arco') reg.fimArco(m.xMm, m.yMm, tMs, m.estado === 'fim' ? 'fim-da-vareta' : m.estado === 'grudado' ? 'grudou' : 'afastou')
    if (m.estado === 'arco' && Math.abs(m.distanciaMm - arco) > 0.05) m.definirDistancia(arco)
    tMs += dt * 1000
  }
  const abrir = (x: number) => {
    m.posicionar(x, 0)
    m.pressionado = true
    m.definirDistancia(0.2)
    passo(0)
    m.definirDistancia(arco)
  }
  const limpar = () => {
    m.soltar()
    for (let i = 0; i < 600; i++) { m.avancar(dt); tMs += dt * 1000 }
    for (let x = peca.inicioMm - 6; x <= peca.fimMm + 6; x += 2) { m.escoria.martelar(x, 0); m.escoria.escovar(x, 0) }
  }
  for (let p = 0; p < (t.passes ?? 1); p++) {
    let x = peca.inicioMm
    if (t.recuarNaAbertura) { abrir(x + 6); for (let k = 0; k < 40; k++) passo(-6 / 40 / dt) } else abrir(x)
    while (m.xMm < peca.fimMm) {
      if (m.estado === 'fim') {
        // Troca de vareta: reabre um pouco antes do fim do cordão e volta por cima da emenda.
        x = m.xMm
        m.soltar(); m.trocarVareta()
        if (t.recuarNaAbertura) { abrir(x + 4); for (let k = 0; k < 30; k++) passo(-8 / 30 / dt) } else abrir(x)
        continue
      }
      if (m.estado !== 'arco') { abrir(m.xMm); continue }
      passo(t.v)
    }
    if (t.pararNoFim) for (let k = 0; k < 21; k++) passo(0)
    reg.fimArco(m.xMm, m.yMm, tMs, 'afastou')
    m.soltar(); m.definirDistancia(15)
    if (t.limparEntrePasses !== false && (p < (t.passes ?? 1) - 1)) limpar()
  }
  if (t.limparNoFim !== false) limpar()
  const analise = analisarEletrodo(peca, cordao, reg)
  return { r: inspecionarEletrodo(peca, cordao, reg, analise, m.escoria), cordao }
}

const bom: Tecnica = { v: 2.5, pararNoFim: true, recuarNaAbertura: true }

describe('inspeção do eletrodo (H74–H77)', () => {
  it('técnica boa no cordão sobre chapa: aprovado, nota alta, reforço na faixa', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), bom)
    expect(r.aprovado).toBe(true)
    expect(r.nota).toBeGreaterThanOrEqual(80)
    expect(r.medidas.geometriaMedia).toBeGreaterThanOrEqual(1)
    expect(r.medidas.geometriaMedia).toBeLessThanOrEqual(3)
    expect(r.medidas.larguraMediaMm).toBeGreaterThan(5)
    expect(r.medidas.larguraMediaMm).toBeLessThan(9)
  })

  it('avanço rápido demais: cordão baixo e falta de fusão', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), { ...bom, v: 6 })
    const tipos = r.defeitos.map((d) => d.tipo)
    expect(tipos).toContain('falta-de-fusao')
    expect(r.nota).toBeLessThan(soldar(pecaEletrodo('cordao-chapa'), bom).r.nota - 20)
  })

  it('avanço lento demais: calor em excesso e cordão alto', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), { ...bom, v: 1 })
    const tipos = r.defeitos.map((d) => d.tipo)
    expect(tipos).toContain('excesso-de-calor')
    expect(tipos).toContain('geometria-alta')
  })

  it('arco longo: mordedura, porosidade e respingos', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), { ...bom, arco: 4.6 })
    const tipos = r.defeitos.map((d) => d.tipo)
    expect(tipos).toContain('mordedura')
    expect(tipos).toContain('porosidade')
    expect(r.aprovado).toBe(false)
  })

  it('sem parar no fim fica cratera; abrir a frio sem recuar deixa poro de partida', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), { v: 2.5 })
    const tipos = r.defeitos.map((d) => d.tipo)
    expect(tipos).toContain('cratera')
    expect(r.nota).toBeLessThan(soldar(pecaEletrodo('cordao-chapa'), bom).r.nota)
  })

  it('sem limpar a escória: perde a limpeza e avisa', () => {
    const { r } = soldar(pecaEletrodo('cordao-chapa'), { ...bom, limparNoFim: false })
    expect(r.defeitos.map((d) => d.tipo)).toContain('escoria')
    expect(r.categorias.find((c) => c.id === 'limpeza')!.pontos).toBeLessThan(3)
  })

  it('filete em T com técnica boa: perna na faixa, calor na referência e aprovado', () => {
    const { r } = soldar(pecaEletrodo('t-estrutural'), bom)
    expect(r.nota).toBeGreaterThanOrEqual(90)
    expect(r.medidas.aporteMedioKJmm / r.medidas.aporteAlvoKJmm).toBeGreaterThan(0.8)
    expect(r.medidas.aporteMedioKJmm / r.medidas.aporteAlvoKJmm).toBeLessThan(1.3)
    expect(r.medidas.geometriaMedia).toBeGreaterThanOrEqual(4)
    expect(r.medidas.geometriaMedia).toBeLessThanOrEqual(6.5)
    expect(r.aprovado).toBe(true)
  })

  it('V 8 mm: um passe não enche; vários passes limpando entre eles enchem sem inclusão', () => {
    const v = pecaEletrodo('v-raiz')
    const um = soldar(v, { ...bom, v: 2.5 }).r
    expect(um.defeitos.map((d) => d.tipo)).toContain('geometria-baixa')
    expect(um.medidas.geometriaMedia).toBeLessThan(1)
    const varios = soldar(v, { ...bom, v: 2.2, passes: 6 }).r
    expect(varios.medidas.geometriaMedia).toBeGreaterThanOrEqual(1)
    expect(varios.defeitos.map((d) => d.tipo)).not.toContain('inclusao-de-escoria')
    expect(varios.nota).toBeGreaterThan(um.nota + 15)
  })

  it('V 8 mm sem limpar entre os passes: inclusão de escória reprova', () => {
    const r = soldar(pecaEletrodo('v-raiz'), { ...bom, v: 2.2, passes: 6, limparEntrePasses: false }).r
    expect(r.defeitos.map((d) => d.tipo)).toContain('inclusao-de-escoria')
    expect(r.aprovado).toBe(false)
  })

  it('canto e sobreposta com técnica boa: aprovados', () => {
    for (const id of ['canto-portao', 'sobreposta-reforco']) {
      const { r } = soldar(pecaEletrodo(id), bom)
      expect(r.aprovado).toBe(true)
      expect(r.nota).toBeGreaterThanOrEqual(90)
    }
  })

  it('filete rápido demais: perna pequena e fusão fraca', () => {
    const { r } = soldar(pecaEletrodo('t-estrutural'), { ...bom, v: 5 })
    const tipos = r.defeitos.map((d) => d.tipo)
    expect(tipos).toContain('geometria-baixa')
    expect(r.aprovado).toBe(false)
  })

  it('peça sem solda nenhuma tira zero', () => {
    const peca = pecaEletrodo('cordao-chapa')
    const cordao = new Cordao(undefined, undefined, undefined, { junta: peca.junta, dimensoes: { espessuraMm: peca.espessuraMm, aberturaMm: peca.aberturaMm } })
    const reg = new RegistroPasse(cordao.nPosicoes, cordao.passoMm)
    const r = inspecionarEletrodo(peca, cordao, reg, analisarEletrodo(peca, cordao, reg), new Acionamento15('eletrodo').escoria)
    expect(r.nota).toBe(0)
    expect(r.aprovado).toBe(false)
  })

  it('canto fino: calor demais derrete a quina', () => {
    const { r } = soldar(pecaEletrodo('canto-portao'), { ...bom, v: 0.8, corrente: 95 })
    expect(r.defeitos.map((d) => d.tipo)).toContain('perfuracao')
    expect(r.aprovado).toBe(false)
  })
})
