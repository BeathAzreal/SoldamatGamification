import { describe, expect, it } from 'vitest'
import { FORMATOS, geometriaDa } from '../src/modelo/junta'
import { Vista } from '../src/render/vista'
import { ELEVACAO_MAX_GRAUS, INCLINACAO_MAX_GRAUS, Vista3D, ZOOM_MAX, ZOOM_MIN } from '../src/render/vista3d'

/** Mesma tela, mesma junta e mesmo giro nas duas vistas. */
function par(formato: (typeof FORMATOS)[number], w: number, h: number, angulo: number): { v2: Vista; v3: Vista3D } {
  const v2 = new Vista()
  v2.geometria = geometriaDa(formato)
  v2.ajustar(w, h)
  v2.definirAngulo(angulo)
  const v3 = new Vista3D()
  v3.geometria = geometriaDa(formato)
  v3.ajustar(w, h)
  v3.definirAngulo(angulo)
  return { v2, v3 }
}

/** Pixels de teste: grade interna mais as bordas e os cantos da área. */
function pixels(w: number, h: number): [number, number][] {
  const lista: [number, number][] = []
  for (const fx of [0, 0.13, 0.5, 0.77, 1]) for (const fy of [0, 0.21, 0.5, 0.88, 1]) lista.push([fx * w, fy * h])
  return lista
}

describe('Vista3D: a mira 3D é a mesma do 2D sem inclinação', () => {
  for (const formato of FORMATOS) {
    for (const [w, h] of [[1000, 600], [640, 720]]) {
      for (const angulo of [0, 0.7, -2.1]) {
        it(`${formato}, ${w}×${h}, giro ${angulo} rad: paraPeca e ponto iguais ao 2D (inclusive bordas)`, () => {
          const { v2, v3 } = par(formato, w, h, angulo)
          for (const [px, py] of pixels(w, h)) {
            const a = v2.paraChapa(px, py)
            const b = v3.paraChapa(px, py)
            expect(b.x).toBeCloseTo(a.x, 6)
            expect(b.y).toBeCloseTo(a.y, 6)
            const sa = v2.paraPeca(px, py)
            const sb = v3.paraPeca(px, py)
            expect(sb.x).toBeCloseTo(sa.x, 6)
            expect(sb.y).toBeCloseTo(sa.y, 6)
          }
          for (const s of [0, 37.5, 75, 150]) {
            for (const n of [-12, 0, 6]) {
              const a = v2.ponto(s, n)
              const b = v3.ponto(s, n)
              expect(b.x).toBeCloseTo(a.x, 5)
              expect(b.y).toBeCloseTo(a.y, 5)
            }
            expect(Math.cos(v3.rumoNaTela(s) - v2.rumoNaTela(s))).toBeCloseTo(1, 6)
          }
        })
      }
    }
  }

  it('segue a Vista 2D passada no construtor (zoom e giro da própria tela)', () => {
    const v2 = new Vista()
    v2.geometria = geometriaDa('circular')
    v2.ajustar(900, 600)
    const v3 = new Vista3D(v2)
    v3.ajustar(900, 600)
    v2.definirAngulo(1.2) // o giro da tela mexe só na Vista 2D
    const a = v2.paraPeca(300, 200)
    const b = v3.paraPeca(300, 200)
    expect(b.x).toBeCloseTo(a.x, 6)
    expect(b.y).toBeCloseTo(a.y, 6)
  })
})

describe('Vista3D inclinada', () => {
  for (const graus of [12, 35, 60]) {
    it(`${graus}°: ida e volta junta → tela → junta, e as bordas da tela ainda caem na chapa`, () => {
      const { v3 } = par('curva', 1000, 600, 0.4)
      v3.definirInclinacao((graus * Math.PI) / 180)
      for (const s of [5, 40, 75, 120, 148]) {
        for (const n of [-8, 0, 3]) {
          const q = v3.ponto(s, n)
          const r = v3.paraPeca(q.x, q.y)
          // A projeção na junta tem a mesma folga do 2D (polilinha a cada 0,25 mm).
          expect(Math.abs(r.x - s)).toBeLessThan(0.2)
          expect(Math.abs(r.y - n)).toBeLessThan(0.2)
        }
      }
      for (const [px, py] of pixels(1000, 600)) {
        const p = v3.paraChapa(px, py)
        expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
      }
    })
  }

  it('inclinar muda a mira (perspectiva) mas não o ponto do centro da tela', () => {
    const { v3 } = par('reta', 1000, 600, 0)
    const centro0 = v3.paraChapa(500, 300)
    const canto0 = v3.paraChapa(100, 80)
    v3.definirInclinacao(0.5)
    const centro = v3.paraChapa(500, 300)
    expect(centro.x).toBeCloseTo(centro0.x, 6)
    expect(centro.y).toBeCloseTo(centro0.y, 6)
    expect(Math.hypot(v3.paraChapa(100, 80).x - canto0.x, v3.paraChapa(100, 80).y - canto0.y)).toBeGreaterThan(1)
  })

  it('a inclinação fica entre 0 e o máximo', () => {
    const v3 = new Vista3D()
    v3.definirInclinacao(5)
    expect(v3.inclinacao).toBeCloseTo((INCLINACAO_MAX_GRAUS * Math.PI) / 180, 9)
    v3.definirInclinacao(-1)
    expect(v3.inclinacao).toBe(0)
  })
})

describe('Vista3D: câmera livre (v1.3)', () => {
  for (const [az, el] of [[0.9, 0.5], [-2.4, 0.8], [Math.PI, 1.1]]) {
    it(`azimute ${az}, elevação ${el}: ida e volta junta → tela → junta`, () => {
      const { v3 } = par('reta', 1000, 600, 0.3)
      v3.definirCamera(az, el)
      for (const s of [20, 75, 130]) {
        for (const n of [-6, 0, 4]) {
          const q = v3.ponto(s, n)
          const r = v3.paraPeca(q.x, q.y)
          expect(Math.abs(r.x - s)).toBeLessThan(0.2)
          expect(Math.abs(r.y - n)).toBeLessThan(0.2)
        }
      }
    })
  }

  it('o azimute dá a volta; a elevação e o zoom ficam nos limites', () => {
    const v3 = new Vista3D()
    v3.definirCamera(3 * Math.PI, 5, 99)
    expect(Math.cos(v3.azimute)).toBeCloseTo(-1, 9)
    expect(v3.elevacao).toBeCloseTo((ELEVACAO_MAX_GRAUS * Math.PI) / 180, 9)
    expect(v3.zoom).toBe(ZOOM_MAX)
    v3.definirCamera(0, -1, 0)
    expect(v3.elevacao).toBe(0)
    expect(v3.zoom).toBe(ZOOM_MIN)
    expect(INCLINACAO_MAX_GRAUS).toBe(ELEVACAO_MAX_GRAUS)
  })

  it('arrastar orbita, a roda aproxima e centralizar volta à vista de frente (igual ao 2D)', () => {
    const { v2, v3 } = par('reta', 1000, 600, 0)
    v3.orbitar(-120, 80)
    expect(v3.azimute).toBeGreaterThan(0)
    expect(v3.elevacao).toBeGreaterThan(0)
    const antes = v3.zoom
    v3.aproximar(-200)
    expect(v3.zoom).toBeLessThan(antes)
    v3.centralizar()
    const a = v2.paraPeca(300, 200)
    const b = v3.paraPeca(300, 200)
    expect(b.x).toBeCloseTo(a.x, 6)
    expect(b.y).toBeCloseTo(a.y, 6)
  })
})
