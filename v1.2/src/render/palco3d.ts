import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Cordao } from '../modelo/cordao'
import type { GeometriaJunta } from '../modelo/junta'
import { MATERIAIS, type MaterialId } from '../modelo/material'
import { PECA } from '../modelo/parametros'
import type { ContextoProcesso } from '../modelo/processo'
import { MalhaCordaoViva } from './cordaoVivo'
import { chapasNaJunta, cristaMm, juntaDe, pontoNaSuperficie } from '../modelo/juntas'
import { paraMundo } from './malha3d'

/*
 * Palco 3D comum à inspeção e à execução: renderer, luz, chapas, bancada,
 * cordão, marcas da missão e régua. Só LÊ o modelo (H3, H41); brilho,
 * riscos e luz são aparência (H8, H40).
 *
 * Grupos: cena → giro (no pivô de vista.ts, H42) → peça (desfaz o pivô)
 * → relevo (exagero vertical: escala só o y).
 */

/** Acabamento do metal: só aparência (H40). */
const ACABAMENTO: Record<MaterialId, { metalness: number; roughness: number }> = {
  'aco-carbono': { metalness: 0.75, roughness: 0.5 },
  'inox-austenitico': { metalness: 0.9, roughness: 0.32 },
  aluminio: { metalness: 0.6, roughness: 0.62 },
}

/** Faixas de cor do cordão pela distância ao centro, como as camadas da vista de cima. */
const LIMITES_CAMADAS = [1, 0.72, 0.42, 0.14]

export const EXAGERO_PADRAO = 3
export const EXAGERO_MIN = 1
export const EXAGERO_MAX = 6

/** Altura (mm, antes do exagero) das linhas e rótulos desenhados sobre a chapa. */
const SOBRE_CHAPA = 0.03

export interface OpcoesPalco {
  contexto: ContextoProcesso
  geometria: GeometriaJunta
  /** Marcas do desenho da missão; `alinhamentoMm` liga a faixa de tolerância. */
  missao?: { inicioMm: number; fimMm: number; alinhamentoMm?: number }
  /** Rótulos INÍCIO/FIM e régua de 10 em 10 mm (como a vista de cima da execução). */
  regua?: boolean
  sombras?: boolean
  /** Lado do mapa de sombra (pixels). */
  mapaSombra?: number
  pixelRatioMax?: number
  antialias?: boolean
}

/** Testa se o navegador consegue criar um contexto WebGL. */
export function webglDisponivel(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') ?? c.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** Riscos de chapa escovada ao longo de X (sorteio fixo, como em cena.ts). */
function texturaEscovada(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#e6e6e6'
  ctx.fillRect(0, 0, c.width, c.height)
  let semente = 11
  const sorteio = () => (semente = (semente * 16807) % 2147483647) / 2147483647
  for (let k = 0; k < 2600; k++) {
    const y = sorteio() * c.height
    const x = sorteio() * c.width
    const comp = 40 + sorteio() * 420
    const claro = sorteio() < 0.5
    ctx.strokeStyle = claro ? `rgba(255,255,255,${0.15 + sorteio() * 0.35})` : `rgba(90,90,90,${0.05 + sorteio() * 0.15})`
    ctx.lineWidth = 0.6 + sorteio() * 0.9
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + comp, y)
    ctx.stroke()
    // Continua do outro lado, para a textura repetir sem emenda.
    if (x + comp > c.width) {
      ctx.beginPath()
      ctx.moveTo(x - c.width, y)
      ctx.lineTo(x + comp - c.width, y)
      ctx.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  // As faces das chapas têm UV em mm (ExtrudeGeometry): u na largura, v ao longo da junta.
  // Girada 90°, os riscos de laminação ficam ao longo da junta, como na vista de cima.
  t.repeat.set(1 / (2 * PECA.larguraChapaMm), 1 / PECA.comprimentoMm)
  t.center.set(0.5, 0.5)
  t.rotation = Math.PI / 2
  return t
}

/**
 * Chapas da junta (H46): o corte de chapasNaJunta, no plano (n, w),
 * extrudado ao longo da junta (reta) de s = 0 a 150 mm.
 */
function geometriaChapas(contexto: ContextoProcesso): THREE.BufferGeometry[] {
  const L = PECA.comprimentoMm
  return chapasNaJunta(juntaDe(contexto), contexto, PECA.larguraChapaMm).map((poligono) => {
    // Forma em (−n, w): girada 90° em y, a extrusão (z local) vira +x e −n vira +z (= n).
    const forma = new THREE.Shape(poligono.map(([n, w]) => new THREE.Vector2(-n, w)))
    const g = new THREE.ExtrudeGeometry(forma, { depth: L, bevelEnabled: false, curveSegments: 1 })
    g.rotateY(Math.PI / 2)
    g.translate(-L / 2, 0, 0)
    return g
  })
}

/** Texto deitado sobre a chapa (rótulos da régua e da missão). */
function rotuloDeitado(texto: string, alturaMm: number, cor: string): THREE.Mesh {
  const c = document.createElement('canvas')
  const px = 64
  const ctx = c.getContext('2d')!
  ctx.font = `bold ${px}px system-ui, sans-serif`
  c.width = Math.ceil(ctx.measureText(texto).width) + 8
  c.height = Math.ceil(px * 1.25)
  ctx.font = `bold ${px}px system-ui, sans-serif`
  ctx.fillStyle = cor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(texto, c.width / 2, c.height / 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry((alturaMm * c.width) / c.height, alturaMm),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }),
  )
  // O plano nasce de frente para +z; deitado, o "para cima" do texto vira −z (para cima na tela).
  m.rotation.x = -Math.PI / 2
  return m
}

export class Palco3D {
  readonly renderer: THREE.WebGLRenderer
  readonly elemento: HTMLCanvasElement
  readonly cena = new THREE.Scene()
  /** Gira em torno do pivô de vista.ts (H42). */
  readonly giro = new THREE.Group()
  /** Coordenadas do mundo de malha3d.ts (sem giro). Tocha e efeitos entram aqui. */
  readonly peca = new THREE.Group()
  /** Tudo que tem relevo: o exagero escala só o y. */
  readonly relevo = new THREE.Group()
  readonly sol: THREE.DirectionalLight
  /** Bancada, chão e sol: giram com a peça tombada (H47), porque a câmera fica de frente para a junta. */
  readonly ambienteGrupo = new THREE.Group()
  private readonly bancada: THREE.Mesh
  /** Cantos das chapas (coordenadas da peça, sem exagero), para pôr o chão embaixo dela. */
  private readonly cantos: [number, number, number][] = []
  private rolagemGraus = 0
  private anguloGiro = 0
  private readonly cordao3d: THREE.Mesh
  private readonly cores: THREE.Color[]
  private readonly texturas: THREE.Texture[] = []
  private readonly pmrem: THREE.PMREMGenerator
  private readonly ambiente: THREE.Texture
  private cordaoAtual: Cordao | null = null
  private volumeAtual = -1
  /** Buffers fixos do cordão (cordaoVivo.ts); refeitos só quando o cordão é outro. */
  private viva: MalhaCordaoViva | null = null
  private exagero = EXAGERO_PADRAO
  largura = 0
  altura = 0

  /** Null se o WebGL não puder ser iniciado. */
  static criar(op: OpcoesPalco): Palco3D | null {
    try {
      return new Palco3D(op, new THREE.WebGLRenderer({ antialias: op.antialias ?? true }))
    } catch {
      return null
    }
  }

  private constructor(
    private readonly op: OpcoesPalco,
    renderer: THREE.WebGLRenderer,
  ) {
    this.renderer = renderer
    this.elemento = renderer.domElement
    renderer.setPixelRatio(Math.min(op.pixelRatioMax ?? 2, window.devicePixelRatio || 1))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.shadowMap.enabled = op.sombras ?? true
    renderer.shadowMap.type = THREE.PCFShadowMap

    const material = MATERIAIS[op.contexto.material]
    const cena = this.cena
    cena.background = new THREE.Color('#17191c')
    this.pmrem = new THREE.PMREMGenerator(renderer)
    const ambienteCena = new RoomEnvironment()
    this.ambiente = this.pmrem.fromScene(ambienteCena, 0.04).texture
    ambienteCena.dispose()
    cena.environment = this.ambiente
    cena.environmentIntensity = 0.7

    cena.add(new THREE.AmbientLight(0xffffff, 0.35))
    // Luz de frente (do lado de quem solda): a face da junta nunca fica no escuro, mesmo de cabeça para baixo.
    const frontal = new THREE.DirectionalLight(0xffffff, 0.7)
    frontal.position.set(30, 200, 120)
    cena.add(frontal)
    cena.add(this.ambienteGrupo)
    const sol = new THREE.DirectionalLight(0xffffff, 2.4)
    sol.position.set(-90, 170, 70)
    sol.castShadow = op.sombras ?? true
    sol.shadow.mapSize.set(op.mapaSombra ?? 2048, op.mapaSombra ?? 2048)
    Object.assign(sol.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 10, far: 500 })
    sol.shadow.bias = -0.0004
    sol.shadow.normalBias = 0.3
    sol.shadow.camera.updateProjectionMatrix()
    this.ambienteGrupo.add(sol)
    this.sol = sol

    // Pivô do giro: o mesmo de vista.ts (centro da chapa ou da junta circular).
    const pivo = op.geometria.centro ?? { x: PECA.comprimentoMm / 2, y: 0 }
    const [px, , pz] = paraMundo(pivo.x, pivo.y, 0)
    this.giro.position.set(px, 0, pz)
    this.peca.position.set(-px, 0, -pz)
    cena.add(this.giro)
    this.giro.add(this.peca)
    this.peca.add(this.relevo)

    const textura = texturaEscovada()
    textura.anisotropy = renderer.capabilities.getMaxAnisotropy()
    this.texturas.push(textura)
    const matChapa = new THREE.MeshStandardMaterial({ color: material.aparencia.chapaClara, map: textura, ...ACABAMENTO[material.id] })
    for (const g of geometriaChapas(op.contexto)) {
      const m = new THREE.Mesh(g, matChapa)
      m.receiveShadow = true
      m.castShadow = true
      this.relevo.add(m)
    }
    for (const poligono of chapasNaJunta(juntaDe(op.contexto), op.contexto, PECA.larguraChapaMm)) {
      for (const [n, w] of poligono) for (const x of [-PECA.comprimentoMm / 2, PECA.comprimentoMm / 2]) this.cantos.push([x, w, n])
    }

    // Bancada embaixo da peça (aparece pela fresta e recebe a sombra): fica no "mundo", que tomba ao contrário da peça.
    this.bancada = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1000), new THREE.MeshStandardMaterial({ color: '#25282c', roughness: 0.9, metalness: 0.2 }))
    this.bancada.rotation.x = -Math.PI / 2
    this.bancada.receiveShadow = true
    this.ambienteGrupo.add(this.bancada)

    this.montarMarcas()

    this.cores = material.aparencia.cordao.map((c) => new THREE.Color(c))
    const matCordao = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.7, roughness: 0.36, side: THREE.DoubleSide })
    this.cordao3d = new THREE.Mesh(new THREE.BufferGeometry(), matCordao)
    this.cordao3d.castShadow = true
    this.cordao3d.receiveShadow = true
    // Os buffers mudam a cada quadro e lugares sem uso ficam zerados: sem recorte por esfera envolvente.
    this.cordao3d.frustumCulled = false
    this.relevo.add(this.cordao3d)

    // H46: o exagero vertical só ajuda na chapa fina vista de cima; no V e no filete deformaria os ângulos.
    this.definirExagero(juntaDe(op.contexto) === 'topo' ? EXAGERO_PADRAO : 1)
  }

  /** Marcas da missão (INÍCIO/FIM, tolerância) e régua, como em cena.ts. */
  private montarMarcas(): void {
    const { geometria: geo, missao, regua, contexto } = this.op
    const junta = juntaDe(contexto)
    // Na superfície das chapas (no filete, subindo pelas paredes do canto), H46.
    const naSuperficie = (n: number) => pontoNaSuperficie(junta, contexto, n)
    const ponto = (s: number, n: number) => {
      const [nn, w] = naSuperficie(n)
      const p = geo.pontoEm(s, nn)
      return new THREE.Vector3(...paraMundo(p.x, p.y, w + SOBRE_CHAPA))
    }
    const deitar = (m: THREE.Mesh, s: number, n: number) => {
      m.position.copy(ponto(s, n))
      // Acompanha a inclinação da superfície (parede do filete).
      const [a0, b0] = naSuperficie(n - 0.5)
      const [a1, b1] = naSuperficie(n + 0.5)
      m.rotation.x = -Math.PI / 2 - Math.atan2(b1 - b0, a1 - a0)
      this.relevo.add(m)
      this.texturas.push((m.material as THREE.MeshBasicMaterial).map!)
    }
    if (missao) {
      const pts: THREE.Vector3[] = []
      for (const s of [missao.inicioMm, missao.fimMm]) {
        for (const [n0, n1] of [[-14, -4], [4, 14]]) pts.push(ponto(s, n0), ponto(s, n1))
      }
      this.relevo.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#ffc440', transparent: true, opacity: 0.9, toneMapped: false })))
      if (regua) {
        deitar(rotuloDeitado('INÍCIO', 3, '#ffc440'), missao.inicioMm, -19)
        deitar(rotuloDeitado('FIM', 3, '#ffc440'), missao.fimMm, -19)
      }
      if (missao.alinhamentoMm) {
        // Faixa de tolerância de alinhamento: tracejado dos dois lados da junta.
        for (const n of [-missao.alinhamentoMm, missao.alinhamentoMm]) {
          const linha: THREE.Vector3[] = []
          for (let s = missao.inicioMm; s < missao.fimMm; s += 1) linha.push(ponto(s, n))
          linha.push(ponto(missao.fimMm, n))
          const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linha), new THREE.LineDashedMaterial({ color: '#ffc440', transparent: true, opacity: 0.75, dashSize: 1.1, gapSize: 1.3, toneMapped: false }))
          l.computeLineDistances()
          this.relevo.add(l)
        }
      }
    }
    if (regua) {
      const pts: THREE.Vector3[] = []
      for (let s = 0; s <= PECA.comprimentoMm; s += 10) {
        const grande = s % 50 === 0
        pts.push(ponto(s, -20), ponto(s, grande ? -25 : -22.5))
        if (grande) deitar(rotuloDeitado(String(s), 2.6, 'rgba(230,233,237,0.8)'), s, -29)
      }
      this.relevo.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#e6e9ed', transparent: true, opacity: 0.6, toneMapped: false })))
    }
  }

  /** Buffers do cordão (null antes do primeiro cordão); trocam quando o cordão é outro. */
  get malhaCordao(): MalhaCordaoViva | null {
    return this.viva
  }

  get geometriaCordao(): THREE.BufferGeometry {
    return this.cordao3d.geometry
  }

  /** Texturas criadas fora do palco que devem ser liberadas com ele. */
  guardarTexturas(...t: THREE.Texture[]): void {
    this.texturas.push(...t)
  }

  get exageroVertical(): number {
    return this.exagero
  }

  definirExagero(fator: number): void {
    this.exagero = Math.min(EXAGERO_MAX, Math.max(EXAGERO_MIN, fator))
    this.relevo.scale.y = this.exagero
    this.posicionarAmbiente()
  }

  /** Giro da peça (radianos, positivo = horário na tela, como Vista.angulo). */
  definirGiro(angulo: number): void {
    // Na tela, x aponta para a direita e z para baixo: horário na tela = −θ em torno de y.
    this.giro.rotation.y = -angulo
    if (angulo !== this.anguloGiro) {
      this.anguloGiro = angulo
      this.posicionarAmbiente()
    }
  }

  /**
   * Peça tombada (H47). A câmera continua de frente para a junta; quem gira
   * é o mundo (bancada, sol, gravidade): tombar φ é girar o ambiente −φ em
   * torno do eixo horizontal da tela.
   */
  definirRolagem(graus: number): void {
    if (graus === this.rolagemGraus) return
    this.rolagemGraus = graus
    this.posicionarAmbiente()
  }

  /** Gira o mundo e põe a bancada logo abaixo do ponto mais baixo da peça. */
  private posicionarAmbiente(): void {
    const f = (this.rolagemGraus * Math.PI) / 180
    this.ambienteGrupo.rotation.x = -f
    // "Para cima" no mundo, nas coordenadas da cena: (0, cos φ, −sin φ).
    const c = Math.cos(this.anguloGiro)
    const s = Math.sin(this.anguloGiro)
    let menor = Infinity
    for (const [x, w, n] of this.cantos) {
      const z = s * x + c * n
      const altura = w * this.exagero * Math.cos(f) - z * Math.sin(f)
      if (altura < menor) menor = altura
    }
    this.bancada.position.y = menor - 0.05
  }

  /**
   * Atualiza o cordão em buffers fixos: só as fatias que mudaram são
   * reescritas e enviadas à placa de vídeo. `s0Mm`–`s1Mm` limita a leitura
   * às fatias perto da tocha (execução); sem a janela, ou se ela não achar
   * a mudança, lê o cordão inteiro.
   */
  atualizarCordao(cordao: Cordao, s0Mm?: number, s1Mm?: number): boolean {
    const volume = cordao.volumeTotal()
    if (cordao === this.cordaoAtual && volume === this.volumeAtual) return false
    // Cordão novo: a janela não vale (o metal pode estar em qualquer lugar).
    const nova = cordao !== this.cordaoAtual || !this.viva || this.viva.nPosicoes !== cordao.nPosicoes
    if (nova) this.novaMalha(cordao)
    this.cordaoAtual = cordao
    this.volumeAtual = volume
    const viva = this.viva!
    let mudou = !nova && s0Mm !== undefined && s1Mm !== undefined ? viva.atualizar(cordao, cordao.indiceEm(s0Mm), cordao.indiceEm(s1Mm)) : false
    if (!mudou) mudou = viva.atualizar(cordao)
    if (!mudou) return false
    const g = this.cordao3d.geometry
    const a = viva.inicioMudado
    const b = viva.fimMudado
    for (const nome of ['position', 'normal'] as const) {
      const atr = g.getAttribute(nome) as THREE.BufferAttribute
      atr.clearUpdateRanges()
      atr.addUpdateRange(3 * a, 3 * (b - a))
      atr.needsUpdate = true
    }
    if (viva.indicesMudaram) {
      const idx = g.getIndex()!
      idx.clearUpdateRanges()
      idx.addUpdateRange(0, viva.nIndices)
      idx.needsUpdate = true
      g.setDrawRange(0, viva.nIndices)
      this.cordao3d.visible = viva.nIndices > 0
    }
    return true
  }

  /** Aloca os buffers do cordão (uma vez por cordão; as cores das camadas não mudam). */
  private novaMalha(cordao: Cordao): void {
    const viva = (this.viva = new MalhaCordaoViva(cordao.nPosicoes, cordao.passoMm, this.op.geometria, undefined, cordao.forma))
    const cor = new Float32Array(viva.raios.length * 3)
    const c = new THREE.Color()
    viva.raios.forEach((r, k) => this.corDaCamada(r, c).toArray(cor, 3 * k))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(viva.posicoes, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('normal', new THREE.BufferAttribute(viva.normais, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('color', new THREE.BufferAttribute(cor, 3))
    g.setIndex(new THREE.BufferAttribute(viva.indices, 1).setUsage(THREE.DynamicDrawUsage))
    g.setDrawRange(0, 0)
    this.cordao3d.geometry.dispose()
    this.cordao3d.geometry = g
    this.cordao3d.visible = false
  }

  /** Altura da crista do cordão em s acima do plano da mira (mm, já com o exagero), para pôr a tocha em cima. */
  alturaEm(s: number): number {
    const c = this.cordaoAtual
    return c ? Math.max(0, cristaMm(c.secao(c.indiceEm(s)), juntaDe(this.op.contexto))) * this.exagero : 0
  }

  private corDaCamada(r: number, alvo: THREE.Color): THREE.Color {
    // LIMITES_CAMADAS vai da borda (1) à crista (0,14): cores[0] é a borda.
    const cores = this.cores
    if (r <= LIMITES_CAMADAS[3]) return alvo.copy(cores[3])
    for (let k = 0; k < 3; k++) {
      const [r0, r1] = [LIMITES_CAMADAS[k + 1], LIMITES_CAMADAS[k]]
      if (r <= r1) return alvo.copy(cores[k + 1]).lerp(cores[k], (r - r0) / (r1 - r0))
    }
    return alvo.copy(cores[0])
  }

  /** Tamanho em pixels CSS; devolve true se mudou. */
  ajustarTamanho(largura: number, altura: number): boolean {
    if (largura <= 0 || altura <= 0 || (largura === this.largura && altura === this.altura)) return false
    this.largura = largura
    this.altura = altura
    this.renderer.setSize(largura, altura, false)
    return true
  }

  desenhar(camera: THREE.Camera): void {
    if (this.largura > 0) this.renderer.render(this.cena, camera)
  }

  destruir(): void {
    this.cena.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Points) {
        o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        for (const m of mats) m.dispose()
      }
    })
    for (const t of this.texturas) t.dispose()
    this.ambiente.dispose()
    this.pmrem.dispose()
    this.sol.shadow.map?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.elemento.remove()
  }
}
