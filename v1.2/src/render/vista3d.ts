import * as THREE from 'three'
import type { GeometriaJunta } from '../modelo/junta'
import { PECA } from '../modelo/parametros'
import { paraMundo } from './malha3d'
import { Vista } from './vista'

/*
 * Câmera fixa da EXECUÇÃO em 3D e o equivalente 3D de Vista (paraPeca,
 * ponto, rumoNaTela). Olha de cima para o centro da chapa, como a vista 2D,
 * com leve perspectiva (campo de visão estreito). A distância é escolhida
 * para que, no plano do topo da chapa, 1 mm ocupe os mesmos pixels da Vista
 * 2D: sem inclinação, a mira 3D é a mesma do 2D.
 *
 * Zoom, pivô e giro vêm de uma Vista 2D (a mesma da tela, se for passada):
 * tela → raio da câmera → plano do topo da chapa (y = 0) → desfaz o giro em
 * torno do pivô → chapa (X, Y) → junta (s, n) pela geometria, como no 2D.
 */

/** Campo de visão vertical (graus): estreito para a perspectiva ser leve. */
export const FOV_EXECUCAO_GRAUS = 30
/** Inclinação máxima da câmera (graus), para o plano da chapa nunca sair da tela. */
export const INCLINACAO_MAX_GRAUS = 35

export class Vista3D {
  readonly camera = new THREE.PerspectiveCamera(FOV_EXECUCAO_GRAUS, 1, 1, 5000)
  /** Inclinação da câmera (radianos; 0 = de cima). */
  inclinacao = 0
  // Reaproveitados a cada leitura: nada é alocado por evento de ponteiro.
  private readonly raio = new THREE.Raycaster()
  private readonly ndc = new THREE.Vector2()
  private readonly topo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  private readonly alvo = new THREE.Vector3()

  /** `plano`: a Vista 2D cujo zoom, pivô e giro esta vista segue. */
  constructor(readonly plano: Vista = new Vista()) {}

  get escala(): number {
    return this.plano.escala
  }

  get larguraCss(): number {
    return this.plano.larguraCss
  }

  get alturaCss(): number {
    return this.plano.alturaCss
  }

  get angulo(): number {
    return this.plano.angulo
  }

  get geometria(): GeometriaJunta {
    return this.plano.geometria
  }

  set geometria(g: GeometriaJunta) {
    this.plano.geometria = g
    this.atualizarCamera()
  }

  ajustar(larguraCss: number, alturaCss: number): void {
    this.plano.ajustar(larguraCss, alturaCss)
    this.atualizarCamera()
  }

  definirAngulo(angulo: number): void {
    this.plano.definirAngulo(angulo)
  }

  definirInclinacao(radianos: number): void {
    this.inclinacao = Math.min(THREE.MathUtils.degToRad(INCLINACAO_MAX_GRAUS), Math.max(0, radianos))
    this.atualizarCamera()
  }

  /** Distância da câmera ao centro da chapa (mm). */
  get distancia(): number {
    const meiaFov = THREE.MathUtils.degToRad(FOV_EXECUCAO_GRAUS / 2)
    return this.plano.alturaCss / this.plano.escala / (2 * Math.tan(meiaFov))
  }

  private atualizarCamera(): void {
    const { larguraCss: w, alturaCss: h } = this.plano
    if (w <= 0 || h <= 0) return
    const d = this.distancia
    const c = this.camera
    c.aspect = w / h
    c.near = d * 0.2
    // A sala da oficina (palco3d.ts) fica a até ~3 m: o fundo tem de caber.
    c.far = d * 4 + 4500
    // Inclina para o lado de baixo da tela (+z): o jogador vê a peça "de frente".
    c.position.set(0, d * Math.cos(this.inclinacao), d * Math.sin(this.inclinacao))
    // Para cima na tela = −z do mundo (o y da vista de cima cresce para baixo).
    c.up.set(0, 0, -1)
    c.lookAt(0, 0, 0)
    c.updateProjectionMatrix()
    c.updateMatrixWorld()
  }

  /** Pivô do giro no mundo (x, z), o mesmo de Vista e de Palco3D. */
  private pivoMundo(): { x: number; z: number } {
    const p = this.geometria.centro ?? { x: PECA.comprimentoMm / 2, y: 0 }
    const [x, , z] = paraMundo(p.x, p.y, 0)
    return { x, z }
  }

  /** Tela → chapa (X, Y), pelo raio da câmera no plano do topo da chapa. */
  paraChapa(px: number, py: number): { x: number; y: number } {
    const { larguraCss: w, alturaCss: h } = this.plano
    this.ndc.set((px / w) * 2 - 1, 1 - (py / h) * 2)
    this.raio.setFromCamera(this.ndc, this.camera)
    // Com a inclinação limitada o raio sempre desce até a chapa; por segurança, cai no 2D.
    if (!this.raio.ray.intersectPlane(this.topo, this.alvo)) return this.plano.paraChapa(px, py)
    const pv = this.pivoMundo()
    const dx = this.alvo.x - pv.x
    const dz = this.alvo.z - pv.z
    // Desfaz o giro da peça (horário na tela, como Vista.angulo).
    const c = Math.cos(this.angulo)
    const s = Math.sin(this.angulo)
    return { x: pv.x + dx * c + dz * s + PECA.comprimentoMm / 2, y: pv.z - dx * s + dz * c }
  }

  /** Chapa (X, Y) a uma altura Z (mm, já com exagero) → tela. */
  daChapa(X: number, Y: number, Z = 0): { x: number; y: number } {
    const pv = this.pivoMundo()
    const dx = X - PECA.comprimentoMm / 2 - pv.x
    const dz = Y - pv.z
    const c = Math.cos(this.angulo)
    const s = Math.sin(this.angulo)
    this.alvo.set(pv.x + dx * c - dz * s, Z, pv.z + dx * s + dz * c).project(this.camera)
    return { x: ((this.alvo.x + 1) / 2) * this.plano.larguraCss, y: ((1 - this.alvo.y) / 2) * this.plano.alturaCss }
  }

  /** Junta (s, n) → tela. */
  ponto(s: number, n = 0): { x: number; y: number } {
    const p = this.geometria.pontoEm(s, n)
    return this.daChapa(p.x, p.y)
  }

  /** Direção da junta em s, já na tela (radianos). Com inclinação, a perspectiva entra aqui. */
  rumoNaTela(s: number): number {
    // Mesma tangente da Vista 2D (rumoEm), projetada: sem inclinação dá rumoEm + giro.
    const p = this.geometria.pontoEm(s)
    const r = this.geometria.rumoEm(s)
    const a = this.daChapa(p.x, p.y)
    const b = this.daChapa(p.x + Math.cos(r), p.y + Math.sin(r))
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  /** Tela → junta (s, n): o que as fontes de entrada mandam para o modelo (Mapeamento). */
  paraPeca(px: number, py: number): { x: number; y: number } {
    const p = this.paraChapa(px, py)
    return this.geometria.projetar(p.x, p.y)
  }
}
