import * as THREE from 'three'
import { estiloArco } from './efeitos'

/*
 * Tocha, arco e poça da execução em 3D. EFEITOS PURAMENTE VISUAIS (H8, H43,
 * H45), como em efeitos.ts: nada daqui volta para o modelo. O clarão usa a
 * mesma regra do 2D (estiloArco), ligada ao desvio do equilíbrio (H10).
 * Coordenadas: as do grupo "peça" do palco (mm, y para cima, sem exagero).
 */

/** Degradê radial numa textura (clarão e poça). */
function texturaRadial(paradas: [number, string][]): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  for (const [f, cor] of paradas) g.addColorStop(f, cor)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Altura do bico acima da superfície (mm do jogo, só desenho). */
const BICO_MM = 9
/** Intensidade da luz do arco equilibrado (candela do Three, ajuste visual). */
const LUZ_ARCO = 700

export interface QuadroTocha {
  /** Ponto do arco no mundo (x, z), já com o vaivém visual (H39). */
  x: number
  z: number
  /** Altura da superfície do cordão sob a tocha (mm, com exagero). */
  topoMm: number
  /** Arco aberto sobre a peça. */
  soldando: boolean
  /** Tocha fora da chapa: o modelo não deposita ali. */
  fora: boolean
  desvio: number
  /** Largura do cordão sob a tocha (mm), para o tamanho da poça. */
  larguraMm: number
  /** Direção da junta no mundo (radianos em torno de y), para alongar a poça. */
  rumo: number
  /** 0,5 no alumínio, que quase não brilha (aparencia.brilhoFraco). */
  intensidadePoca: number
  /** Giro da peça (Vista.angulo): o pescoço compensa para ficar fixo na tela. */
  angulo: number
  /**
   * Inclinação da tocha ao longo da junta (radianos, H38): positivo = topo
   * da tocha para trás de +s. Vem da técnica e do sentido de avanço.
   */
  inclinacao: number
}

/** Quanto a tocha tomba na técnica empurrando/puxando: 20°, o ângulo de trabalho usual (só desenho; o efeito no cordão é o de H38). */
export const INCLINACAO_TECNICA_RAD = (20 * Math.PI) / 180

export class Tocha3D {
  readonly grupo = new THREE.Group()
  readonly texturas: THREE.Texture[] = []
  /** Gira em torno da ponta do arame (o arco): a técnica tomba a tocha (H38). */
  private readonly inclinacao = new THREE.Group()
  private readonly corpo = new THREE.Group()
  private readonly pescoco = new THREE.Group()
  private readonly arame: THREE.Mesh
  private readonly clarao: THREE.Sprite
  private readonly matClarao: THREE.SpriteMaterial
  private readonly luz: THREE.PointLight
  private readonly poca: THREE.Mesh
  private readonly matPoca: THREE.MeshBasicMaterial
  private readonly matBocal: THREE.MeshStandardMaterial
  private readonly corBocal = new THREE.Color('#b9915a')
  private readonly corFora = new THREE.Color('#d0473a')

  constructor() {
    // Bocal aberto (vê-se o arco por dentro olhando de cima), bico de contato, cano reto no eixo da tocha
    // e, no alto, a curva do pescoço e o punho indo para longe da câmera.
    this.matBocal = new THREE.MeshStandardMaterial({ color: this.corBocal, metalness: 0.9, roughness: 0.32, side: THREE.DoubleSide })
    const bocal = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 5, 18, 32, 1, true), this.matBocal)
    bocal.position.y = 9
    const matCobre = new THREE.MeshStandardMaterial({ color: '#c77b43', metalness: 0.9, roughness: 0.35 })
    const bico = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 6, 12), matCobre)
    bico.position.y = 4
    // Cano reto no eixo da tocha: é ele que mostra a inclinação da técnica (H38), mesmo vista de cima.
    const matCano = new THREE.MeshStandardMaterial({ color: '#3a3f46', metalness: 0.6, roughness: 0.45 })
    const cano = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.2, 34, 20), matCano)
    cano.position.y = 18 + 17
    const anel = new THREE.Mesh(new THREE.TorusGeometry(5.6, 1.1, 10, 28), matCobre)
    anel.rotation.x = Math.PI / 2
    anel.position.y = 18.5
    // Pescoço curvado e punho semitransparentes: vistos de cima, não escondem a junta à frente da tocha.
    const matCorpo = new THREE.MeshStandardMaterial({ color: '#2c3036', metalness: 0.4, roughness: 0.6, transparent: true, opacity: 0.5, depthWrite: false })
    const curva = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 22, 16), matCorpo)
    // Sai do topo do cano inclinado 45°; o grupo aponta para cima e à esquerda NA TELA.
    curva.position.set(0, 52 + 7.8, -7.8)
    curva.rotation.x = -Math.PI / 4
    const punho = new THREE.Mesh(new THREE.CylinderGeometry(7, 6, 46, 18), matCorpo)
    punho.position.set(0, 52 + 15.6 + 6, -15.6 - 21)
    punho.rotation.x = -Math.PI / 2.6
    this.pescoco.add(curva, punho)
    this.corpo.add(bocal, bico, cano, anel, this.pescoco)
    for (const m of [bocal, bico, cano, curva, punho]) m.castShadow = true
    // Bocal acima do arco; o arame vai do bico até a superfície. Tudo gira em torno da ponta do arame.
    this.corpo.position.y = BICO_MM - 1
    this.arame = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1, 8), new THREE.MeshStandardMaterial({ color: '#d9dde2', metalness: 1, roughness: 0.25 }))
    this.arame.scale.y = BICO_MM
    this.arame.position.y = BICO_MM / 2
    this.inclinacao.add(this.corpo, this.arame)
    this.grupo.add(this.inclinacao)

    const tClarao = texturaRadial([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(215,232,255,0.9)'], [0.45, 'rgba(130,175,255,0.28)'], [1, 'rgba(90,140,255,0)']])
    this.matClarao = new THREE.SpriteMaterial({ map: tClarao, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true, toneMapped: false })
    this.clarao = new THREE.Sprite(this.matClarao)
    this.clarao.renderOrder = 20
    this.grupo.add(this.clarao)
    this.luz = new THREE.PointLight('#cfe6ff', 0, 160, 2)
    this.grupo.add(this.luz)

    const tPoca = texturaRadial([[0, 'rgba(255,250,225,0.95)'], [0.5, 'rgba(255,190,80,0.65)'], [1, 'rgba(255,120,30,0)']])
    this.matPoca = new THREE.MeshBasicMaterial({ map: tPoca, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })
    this.poca = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.matPoca)
    this.poca.rotation.order = 'YXZ'
    this.poca.renderOrder = 5
    this.grupo.add(this.poca)
    this.texturas.push(tClarao, tPoca)
    this.grupo.visible = false
  }

  esconder(): void {
    this.grupo.visible = false
    this.luz.intensity = 0
  }

  atualizar(q: QuadroTocha): void {
    this.grupo.visible = true
    this.grupo.position.set(q.x, 0, q.z)
    // A ponta do arame fica na superfície do cordão; a técnica tomba a tocha em torno dela.
    this.inclinacao.position.y = q.topoMm
    this.inclinacao.rotation.z = q.inclinacao
    // −z do grupo = para cima na tela; +45° em y leva para cima e à esquerda; +giro desfaz o giro da peça.
    this.pescoco.rotation.y = Math.PI / 4 + q.angulo
    this.arame.visible = !q.fora
    this.matBocal.color.copy(q.fora ? this.corFora : this.corBocal)

    this.clarao.visible = q.soldando
    this.poca.visible = q.soldando
    if (!q.soldando) {
      this.luz.intensity = 0
      return
    }
    const e = estiloArco(q.desvio)
    const raio = e.raioMm
    this.clarao.position.set(e.dxMm, q.topoMm + 1, e.dyMm)
    this.clarao.scale.set(2 * raio, 2 * raio, 1)
    this.matClarao.opacity = e.alfa
    this.luz.position.set(e.dxMm, q.topoMm + 3, e.dyMm)
    this.luz.intensity = LUZ_ARCO * e.tamanho * e.alfa

    // Poça (2D: elipse 1,6 × meia-largura, recuada 0,4 no sentido da junta).
    const meia = Math.max(1.5, q.larguraMm / 2)
    this.poca.rotation.set(-Math.PI / 2, -q.rumo, 0)
    this.poca.scale.set(2 * 1.6 * meia, 2 * meia, 1)
    this.poca.position.set(-0.4 * meia * Math.cos(q.rumo), q.topoMm + 0.15, -0.4 * meia * Math.sin(q.rumo))
    this.matPoca.opacity = q.intensidadePoca
  }
}
