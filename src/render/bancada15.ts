import { limitesPecaEletrodo } from '../missoes/pecasEletrodo'
import { criarDetalhesIndustriais15 } from './pecaIndustrial15'
import * as THREE from 'three'
import { Palco3D } from './palco3d'
import { geometriaDa } from '../modelo/junta'
import { CONTEXTO_PADRAO } from '../modelo/processo'
import type { Cordao } from '../modelo/cordao'
import type { Acionamento15 } from '../modelo/acionamento15'
import { criarSuperficieEscoria15 } from './escoriaSuperficie15'
import { girarFerramenta15, type Vetor15 } from '../entrada/giroFerramenta15'
import type { FerramentaBancada15 } from '../modelo/escoria15'
import { cristaMm, INFO_JUNTA, juntaDe, pontoNaSuperficie, type TipoJunta } from '../modelo/juntas'

/** Ponta nua da vareta presa nas garras do alicate (mm). */
const PONTA_NUA = 20
/** H73: faixa (mm) em que a ponta assenta na raiz do filete. */
const ASSENTO_FILETE_MM = 4
const MAX_RESPINGOS = 160
const GRAVIDADE = 9810

/** Brilho radial para o arco e a poça (textura pequena gerada em código: o jogo segue offline). */
function texturaBrilho(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.25, 'rgba(210,235,255,0.75)')
  r.addColorStop(1, 'rgba(120,170,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Vista do protótipo: porta-eletrodo e vareta em escala de mm, câmera independente. */
export function criarBancada15(peca?: { junta: TipoJunta; espessuraMm: number; aberturaMm: number; inicioMm: number; fimMm: number; larguraMm?: number; conjunto?: 'grade' }) {
  // A peça chega na posição plana (rolagem 0): no filete, o canto fica voltado para cima.
  const contexto = peca ? { ...CONTEXTO_PADRAO, junta: peca.junta, espessuraMm: peca.espessuraMm, aberturaMm: peca.aberturaMm } : CONTEXTO_PADRAO
  const palco = Palco3D.criar({
    larguraPecaMm: peca?.larguraMm, processo: 'eletrodo', contexto, geometria: geometriaDa('reta'), oficinaTreino: true, sombras: true, pixelRatioMax: 1.5,
    missao: peca ? { inicioMm: peca.inicioMm, fimMm: peca.fimMm } : undefined, regua: !!peca && !peca.larguraMm,
  })
  if (!palco) return null
  const canvas = palco.elemento
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', 'Bancada 3D: selecione soldagem, martelinho ou escova. W sobe e afasta, S desce e aproxima.')
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 4000)
  // Filete na posição plana: câmera mais alta para enxergar as duas paredes e a raiz no fundo do V.
  const filete = !!peca && INFO_JUNTA[peca.junta].familia === 'filete'
  const AZIMUTE0 = 0.237, POLAR0 = filete ? 0.62 : 1.077, ZOOM0 = filete ? 0.75 : 1, ALVO_Y = filete ? 12 : 40
  let azimute = AZIMUTE0, polar = POLAR0, zoom = ZOOM0, alvoY = ALVO_Y
  const posicionarCamera = () => {
    const d = 338 * Math.max(1, 1 / camera.aspect) * zoom
    camera.position.setFromSphericalCoords(d, polar, azimute).add(new THREE.Vector3(0, alvoY, 0))
    camera.position.y = Math.max(-350, camera.position.y)
    camera.lookAt(0, alvoY, 0)
    camera.updateMatrixWorld()
  }
  const enquadrar = (l: number, a: number) => {
    palco.ajustarTamanho(l, a)
    camera.aspect = l / a
    posicionarCamera()
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }
  const Y = new THREE.Vector3(0, 1, 0)
  const ferramenta = new THREE.Group()
  const eletrodo = new THREE.Group()
  const mig = new THREE.Group()
  ferramenta.add(eletrodo, mig)
  palco.peca.add(ferramenta)
  const metal = new THREE.MeshStandardMaterial({ color: '#b5b9bd', metalness: 0.85, roughness: 0.4 })
  const revestimento = new THREE.MeshStandardMaterial({ color: '#b39a74', roughness: 0.95 })
  const isolante = new THREE.MeshStandardMaterial({ color: '#283842', roughness: 0.8 })
  const cobre = new THREE.MeshStandardMaterial({ color: '#b78552', metalness: 0.85, roughness: 0.35 })
  const borracha = new THREE.MeshStandardMaterial({ color: '#1d1f22', roughness: 0.9 })
  const vermelho = new THREE.MeshStandardMaterial({ color: '#9a2a22', roughness: 0.6 })
  const cilindro = (grupo: THREE.Object3D, raio: number, altura: number, y: number, mat: THREE.Material, lados = 16) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, lados), mat)
    m.position.y = y
    m.castShadow = true
    grupo.add(m)
    return m
  }
  /** Cilindro de comprimento `comprimento` saindo de `inicio` na direção `dir` (eixos locais do grupo). */
  const haste = (grupo: THREE.Object3D, raio: number, comprimento: number, inicio: THREE.Vector3, dir: THREE.Vector3, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, comprimento, 18), mat)
    m.quaternion.setFromUnitVectors(Y, dir)
    m.position.copy(inicio).addScaledVector(dir, comprimento / 2)
    m.castShadow = true
    grupo.add(m)
    return m
  }
  // Vareta: alma metálica com revestimento até a ponta; o topo fica nu para as garras (H61).
  const alma = cilindro(eletrodo, 1, 1, 0, metal, 10)
  const capa = cilindro(eletrodo, 1, 1, 0, revestimento, 14)
  const brasaMat = new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0 })
  const brasa = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), brasaMat)
  eletrodo.add(brasa)
  // Alicate porta-eletrodo: garras na ponta nua e cabo inclinado. Girar o punho (rolamento) move o cabo.
  const alicate = new THREE.Group()
  eletrodo.add(alicate)
  const garraA = new THREE.Mesh(new THREE.BoxGeometry(6, 14, 10), cobre)
  garraA.position.set(-3.6, 0, 0)
  const garraB = garraA.clone()
  garraB.position.x = 3.6
  alicate.add(garraA, garraB)
  const dirCabo = new THREE.Vector3(0.82, 0.57, 0).normalize()
  const inicioCabo = new THREE.Vector3(3, 6, 0)
  const pescoco = haste(alicate, 4, 14, inicioCabo, dirCabo, cobre)
  const protetor = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 3, 24), vermelho)
  protetor.quaternion.setFromUnitVectors(Y, dirCabo)
  protetor.position.copy(inicioCabo).addScaledVector(dirCabo, 14)
  alicate.add(protetor)
  const empunhadura = haste(alicate, 7, 72, inicioCabo.clone().addScaledVector(dirCabo, 15.5), dirCabo, borracha)
  const caboEletrico = haste(alicate, 3.2, 90, inicioCabo.clone().addScaledVector(dirCabo, 87), dirCabo, borracha)
  void pescoco; void empunhadura; void caboEletrico
  const bocal = cilindro(mig, 5, 16, 8, cobre)
  const punho = cilindro(mig, 7, 28, 30, isolante)
  const arame = cilindro(mig, 0.45, 1, 0, metal)
  const madeira = new THREE.MeshStandardMaterial({ color: '#996d3f', roughness: 0.85 })
  const martelo = new THREE.Group(), escova = new THREE.Group()
  palco.peca.add(martelo, escova)
  cilindro(martelo, 2.5, 46, 27, madeira)
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(23, 7, 8), metal)
  martelo.add(cabeca)
  const ponta = new THREE.Mesh(new THREE.ConeGeometry(4, 11, 4), metal)
  ponta.rotation.z = Math.PI / 2
  ponta.position.x = -15
  martelo.add(ponta)
  const caboEscova = new THREE.Mesh(new THREE.BoxGeometry(36, 7, 14), madeira)
  caboEscova.position.y = 10
  escova.add(caboEscova)
  for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
    const cerda = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 0.8), metal)
    cerda.position.set(-14 + i * 3.5, 3.5, -4.5 + j * 3)
    escova.add(cerda)
  }
  const mira = new THREE.Mesh(new THREE.RingGeometry(3, 3.5, 40), new THREE.MeshBasicMaterial({ color: '#edc167', side: THREE.DoubleSide }))
  mira.rotation.x = -Math.PI / 2
  palco.peca.add(mira)
  // Arco: coluna luminosa da ponta à poça, halo voltado para a câmera, poça e luz que tremulam.
  const aditivo = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false } as const
  const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.6, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#d9f0ff', opacity: 0.9, ...aditivo }))
  palco.peca.add(coluna)
  const textura = texturaBrilho()
  palco.guardarTexturas(textura)
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: textura, color: '#cfe6ff', opacity: 0.95, ...aditivo }))
  palco.peca.add(halo)
  const poca = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshBasicMaterial({ color: '#ffd38a', toneMapped: false }))
  palco.peca.add(poca)
  const luz = new THREE.PointLight('#c9eaff', 0, 160, 2)
  palco.peca.add(luz)
  // Respingos: gotas balísticas que caem pela gravidade e se apagam ao esfriar.
  const posRespingo = new Float32Array(MAX_RESPINGOS * 3)
  const corRespingo = new Float32Array(MAX_RESPINGOS * 3)
  const velRespingo = new Float32Array(MAX_RESPINGOS * 3)
  const vidaRespingo = new Float32Array(MAX_RESPINGOS)
  const geoRespingo = new THREE.BufferGeometry()
  geoRespingo.setAttribute('position', new THREE.BufferAttribute(posRespingo, 3))
  geoRespingo.setAttribute('color', new THREE.BufferAttribute(corRespingo, 3))
  const respingos = new THREE.Points(geoRespingo, new THREE.PointsMaterial({ size: 1.6, vertexColors: true, sizeAttenuation: true, ...aditivo }))
  respingos.frustumCulled = false
  palco.peca.add(respingos)
  let proximoRespingo = 0, acumulado = 0
  const raio = new THREE.Raycaster()
  const ponto = new THREE.Vector3()
  const limitesX = limitesPecaEletrodo(peca ?? {})
  const junta = juntaDe(contexto)
  /** Altura da superfície das chapas a um desvio lateral n (filete na posição plana: paredes a 45°). */
  const superficie = (n: number) => pontoNaSuperficie(junta, contexto, n)[1]
  /** Até onde vão as chapas de cada lado da junta (no filete, 50 mm de parede a 45°). */
  const alcanceLateral = INFO_JUNTA[junta].familia === 'filete' ? 50 / Math.SQRT2 : 50
  const escoria = criarSuperficieEscoria15(superficie, junta)
  // Risco de pedra-sabão na raiz do filete, do INÍCIO ao FIM: mostra onde o cordão deve correr.
  if (peca && filete) {
    const giz = new THREE.Mesh(new THREE.BoxGeometry(peca.fimMm - peca.inicioMm, 0.12, 0.6), new THREE.MeshBasicMaterial({ color: '#e9e4d4', transparent: true, opacity: 0.8 }))
    giz.position.set((peca.inicioMm + peca.fimMm) / 2 - 75, superficie(0) + 0.45, 0)
    palco.peca.add(giz)
  }
  palco.peca.add(escoria.malha)
  palco.guardarTexturas(escoria.textura, escoria.crosta)
  if (peca) palco.peca.add(criarDetalhesIndustriais15(junta, peca.conjunto))
  const eixo = new THREE.Vector3(), normal = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion()
  const pontaMartelo = new THREE.Vector3()
  const cameraLocal = new THREE.Vector3()
  let volumeAntes = -1
  let cordaoAntes: Cordao | null = null
  const lascas = new THREE.Group()
  palco.peca.add(lascas)
  const particulasEscoria: { malha: THREE.Mesh; velocidade: THREE.Vector3; vida: number }[] = []
  for (let i = 0; i < 24; i++) {
    const malha = new THREE.Mesh(new THREE.TetrahedronGeometry(1), new THREE.MeshStandardMaterial({ color: '#373632', roughness: 0.88 }))
    malha.visible = false; lascas.add(malha)
    particulasEscoria.push({ malha, velocidade: new THREE.Vector3(), vida: 0 })
  }
  let calorPonta = 0
  return {
    canvas, enquadrar, superficie,
    soltarEscoria(x: number, y: number, removido: number) {
      if (removido <= 0) return
      const quantidade = Math.min(24, Math.max(4, Math.ceil(removido * 6)))
      for (let i = 0; i < quantidade; i++) {
        const p = particulasEscoria[i], a = i * 2.39996
        p.vida = 0.45 + (i % 4) * 0.08
        p.malha.position.set(x - 75, superficie(y) + 2, y)
        p.malha.scale.set(1.2 + (i % 3) * 0.3, 0.25, 0.7)
        p.velocidade.set(Math.cos(a) * 24, 30 + (i % 5) * 7, Math.sin(a) * 24)
        p.malha.visible = true
      }
    },
    iniciarGiro(m: Acionamento15) {
      const inicial = { azimute: m.azimuteGraus, inclinacao: m.inclinacaoGraus }
      const direita = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).toArray() as unknown as Vetor15
      const cima = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).toArray() as unknown as Vetor15
      return (dx: number, dy: number, sensibilidade: number) => girarFerramenta15(inicial, direita, cima, dx, dy, sensibilidade)
    },
    orbitar(dx: number, dy: number) {
      azimute += dx * 0.006
      polar = Math.max(0.04, Math.min(Math.PI - 0.04, polar + dy * 0.006))
      posicionarCamera()
    },
    aproximar(delta: number) { zoom = Math.max(0.5, Math.min(3, zoom * Math.exp(delta * 0.001))); posicionarCamera() },
    verEstacao() { alvoY = -140; zoom = 3; polar = 0.85; azimute = AZIMUTE0; posicionarCamera() },
    centralizar() { alvoY = ALVO_Y; azimute = AZIMUTE0; polar = POLAR0; zoom = ZOOM0; posicionarCamera() },
    pontoNaTela(x: number, y: number) {
      const r = canvas.getBoundingClientRect()
      raio.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, 1 - ((y - r.top) / r.height) * 2), camera)
      // Anda pelo raio até cruzar a superfície das chapas e refina por bissecção.
      const o = raio.ray.origin, d = raio.ray.direction
      const acima = (t: number) => {
        const n = o.z + d.z * t, x = o.x + d.x * t + 75
        if (Math.abs(n) > alcanceLateral || x < limitesX.min || x > limitesX.max) return true
        return o.y + d.y * t > superficie(n)
      }
      let t0 = 0, t1 = -1
      for (let t = 0; t < 3000; t += 2) {
        if (!acima(t)) { t1 = t; break }
        t0 = t
      }
      if (t1 < 0) return null
      for (let i = 0; i < 30; i++) {
        const tm = (t0 + t1) / 2
        if (acima(tm)) t0 = tm
        else t1 = tm
      }
      raio.ray.at((t0 + t1) / 2, ponto)
      const p = { x: ponto.x + 75, y: ponto.z }
      if (!(p.x >= limitesX.min && p.x <= limitesX.max && Math.abs(p.y) <= alcanceLateral)) return null
      // H73: no filete a ponta apoiada desliza para o fundo do canto; perto da raiz ela assenta ali.
      if (filete) p.y = Math.sign(p.y) * Math.max(0, Math.abs(p.y) - ASSENTO_FILETE_MM)
      return p
    },
    desenhar(m: Acionamento15, p: { x: number; y: number }, c: Cordao, modo: FerramentaBancada15 = 'soldar', acionada = false, desdeGolpeMs = Infinity, agoraMs = 0, dt = 0, direcaoGolpe: 'lateral' | 'diagonal' | 'cima' = 'lateral') {
      const ligado = modo === 'soldar' && m.estado === 'arco'
      ferramenta.visible = modo === 'soldar'
      martelo.visible = modo === 'martelo' && m.naPeca
      escova.visible = modo === 'escova' && m.naPeca
      // Alturas absolutas (acima da raiz): chão sob a ponta e crista do cordão, se houver.
      const chao = superficie(p.y)
      let topo = chao
      for (const cord of [c, ...c.soltos]) {
        const s = cord.secao(cord.indiceEm(p.x))
        if (s.larguraMm > 0 && Math.abs(s.yCentroMm - p.y) < Math.max(3, s.larguraMm / 2)) topo = Math.max(topo, cristaMm(s, junta))
      }
      // Cabo de lado: a cabeça chega em arco lateral e a ponta toca a crosta.
      const golpe = desdeGolpeMs >= 0 && desdeGolpeMs < 260 ? Math.sin(Math.PI * desdeGolpeMs / 260) : 0
      const deCima = direcaoGolpe === 'cima', diagonal = direcaoGolpe === 'diagonal'
      martelo.rotation.set(diagonal ? 0.45 : 0, -0.6 + golpe * 0.22, (deCima ? 0 : diagonal ? 0.6 : 1.1) + golpe * 0.35)
      pontaMartelo.set(-20.5, 0, 0).applyEuler(martelo.rotation)
      martelo.position.set(p.x - 75 - (1 - golpe) * 10, topo + 0.8 + (1 - golpe) * (deCima ? 28 : diagonal ? 18 : 5), p.y + (1 - golpe) * 4).sub(pontaMartelo)
      escova.position.set(p.x - 75 + (acionada ? Math.sin(agoraMs * 0.04) * 1.5 : 0), topo + 0.5, p.y)
      escova.rotation.y = 0.2
      const altura = Math.max(0, m.distanciaMm)
      // O arco nasce no cordão já depositado (ou na chapa), nunca acima da ponta.
      const base = m.processo === 'eletrodo' ? Math.min(topo, chao + altura) : 0
      ferramenta.position.set(p.x - 75, chao + altura, p.y)
      const inc = m.inclinacaoGraus * Math.PI / 180, az = m.azimuteGraus * Math.PI / 180
      eixo.set(Math.sin(inc) * Math.cos(az), Math.cos(inc), Math.sin(inc) * Math.sin(az))
      ferramenta.quaternion.setFromUnitVectors(normal, eixo).multiply(q.setFromAxisAngle(normal, m.rolamentoGraus * Math.PI / 180))
      eletrodo.visible = m.processo === 'eletrodo'
      mig.visible = m.processo === 'mig'
      const r = m.diametroMm / 2
      alma.scale.set(r, m.restanteMm, r)
      alma.position.y = m.restanteMm / 2
      const revestida = Math.max(0.5, m.restanteMm - PONTA_NUA)
      capa.scale.set(r * 1.65, revestida, r * 1.65)
      capa.position.y = revestida / 2 + 0.25
      alicate.position.y = m.restanteMm - PONTA_NUA / 2 + 2
      // Ponta incandescente: acende no arco e esfria devagar depois.
      calorPonta = ligado ? 1 : calorPonta * Math.exp(-dt / 1.2)
      brasa.scale.setScalar(r * 1.3)
      brasa.position.y = 0.2
      brasaMat.opacity = Math.min(1, calorPonta * 1.2)
      brasaMat.color.setRGB(1, 0.35 + 0.45 * calorPonta, 0.1 + 0.4 * calorPonta * calorPonta)
      brasa.visible = calorPonta > 0.02
      bocal.position.y = 8
      punho.position.y = 30
      arame.scale.y = Math.max(0.1, altura - 2)
      arame.position.y = -(altura - 2) / 2
      mira.position.set(p.x - 75, chao + 0.3, p.y)
      mira.material.color.set(modo === 'soldar' ? '#edc167' : '#8ccbd4')
      mira.visible = m.naPeca && !ligado
      // Arco e poça.
      const tremor = 0.85 + 0.3 * Math.random()
      const instavel = ligado && m.processo === 'eletrodo' ? m.forma.instabilidade : 0
      const comprimento = m.processo === 'mig' ? 2 : Math.max(0.3, chao + altura - base)
      coluna.visible = halo.visible = poca.visible = ligado
      coluna.position.set(p.x - 75, base + comprimento / 2, p.y)
      coluna.scale.set(tremor * (1 + instavel * 0.6), comprimento, tremor * (1 + instavel * 0.6))
      palco.peca.worldToLocal(cameraLocal.copy(camera.position))
      halo.position.set(p.x - 75, base + comprimento * 0.4, p.y)
      halo.lookAt(cameraLocal)
      halo.scale.setScalar((16 + 6 * instavel) * tremor)
      const raioPoca = 1.3 + m.diametroMm * 0.55
      poca.position.set(p.x - 75, base + 0.2, p.y)
      poca.scale.set(raioPoca, 0.6, raioPoca)
      luz.position.set(p.x - 75, base + 6, p.y)
      luz.intensity = ligado ? 700 * tremor : 0
      // Respingos: base pequena, muito mais com arco longo (H69).
      if (ligado && m.processo === 'eletrodo') acumulado += dt * (4 + 70 * instavel)
      while (acumulado >= 1) {
        acumulado -= 1
        const i = proximoRespingo
        proximoRespingo = (proximoRespingo + 1) % MAX_RESPINGOS
        const ang = Math.random() * Math.PI * 2, v = 80 + Math.random() * 220
        posRespingo.set([p.x - 75, base + 0.5, p.y], i * 3)
        velRespingo.set([Math.cos(ang) * v, 120 + Math.random() * 260, Math.sin(ang) * v], i * 3)
        vidaRespingo[i] = 0.35 + Math.random() * 0.45
      }
      let vivos = false
      for (let i = 0; i < MAX_RESPINGOS; i++) {
        if (vidaRespingo[i] <= 0) { corRespingo.set([0, 0, 0], i * 3); continue }
        vivos = true
        vidaRespingo[i] -= dt
        velRespingo[i * 3 + 1] -= GRAVIDADE * 0.12 * dt
        for (let k = 0; k < 3; k++) posRespingo[i * 3 + k] += velRespingo[i * 3 + k] * dt
        if (posRespingo[i * 3 + 1] < 0.2) { posRespingo[i * 3 + 1] = 0.2; velRespingo.fill(0, i * 3, i * 3 + 3) }
        const t = Math.max(0, vidaRespingo[i]) / 0.8
        corRespingo.set([1, 0.35 + 0.5 * t, 0.08 + 0.3 * t * t], i * 3)
      }
      respingos.visible = vivos
      geoRespingo.attributes.position.needsUpdate = true
      geoRespingo.attributes.color.needsUpdate = true
      if (c !== cordaoAntes || c.volumeTotal() !== volumeAntes) {
        palco.atualizarCordao(c)
        cordaoAntes = c
        volumeAntes = c.volumeTotal()
      }
      for (const p of particulasEscoria) {
        if (p.vida <= 0) { p.malha.visible = false; continue }
        p.vida -= dt
        p.velocidade.y -= 230 * dt
        p.malha.position.addScaledVector(p.velocidade, dt)
        p.malha.rotation.x += dt * 8; p.malha.rotation.z += dt * 5
      }
      escoria.atualizar(m.escoria, c)
      palco.desenhar(camera)
    },
    destruir() { palco.destruir() },
  }
}
