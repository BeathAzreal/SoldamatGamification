import * as THREE from 'three'
import { Palco3D } from './palco3d'
import { geometriaDa } from '../modelo/junta'
import { CONTEXTO_PADRAO } from '../modelo/processo'
import type { Cordao } from '../modelo/cordao'
import type { Acionamento15 } from '../modelo/acionamento15'
import { criarSuperficieEscoria15 } from './escoriaSuperficie15'
import { girarFerramenta15, type Vetor15 } from '../entrada/giroFerramenta15'
import type { FerramentaBancada15 } from '../modelo/escoria15'

/** Vista do protótipo: porta-eletrodo e vareta em escala de mm, câmera independente. */
export function criarBancada15() {
  const palco = Palco3D.criar({ contexto: CONTEXTO_PADRAO, geometria: geometriaDa('reta'), oficinaTreino: true, sombras: true, pixelRatioMax: 1.5 })
  if (!palco) return null
  const canvas = palco.elemento
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', 'Bancada 3D: selecione soldagem, martelinho ou escova. W sobe e afasta, S desce e aproxima.')
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 4000)
  let azimute = 0.237, polar = 1.077, zoom = 1
  const posicionarCamera = () => {
    const d = 338 * Math.max(1, 1 / camera.aspect) * zoom
    camera.position.setFromSphericalCoords(d, polar, azimute).add(new THREE.Vector3(0, 40, 0))
    camera.position.y = Math.max(-350, camera.position.y)
    camera.lookAt(0, 40, 0)
    camera.updateMatrixWorld()
  }
  const enquadrar = (l: number, a: number) => {
    palco.ajustarTamanho(l, a)
    camera.aspect = l / a
    posicionarCamera()
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }
  const ferramenta = new THREE.Group()
  const eletrodo = new THREE.Group()
  const mig = new THREE.Group()
  ferramenta.add(eletrodo, mig)
  palco.peca.add(ferramenta)
  const metal = new THREE.MeshStandardMaterial({ color: '#b5b9bd', metalness: 0.85, roughness: 0.4 })
  const revestimento = new THREE.MeshStandardMaterial({ color: '#a18e73', roughness: 0.95 })
  const isolante = new THREE.MeshStandardMaterial({ color: '#283842', roughness: 0.8 })
  const cobre = new THREE.MeshStandardMaterial({ color: '#b78552', metalness: 0.85, roughness: 0.35 })
  const cilindro = (grupo: THREE.Group, raio: number, altura: number, y: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, 16), mat)
    m.position.y = y
    m.castShadow = true
    grupo.add(m)
    return m
  }
  const alma = cilindro(eletrodo, 0.7, 1, 0, metal)
  const capa = cilindro(eletrodo, 1.5, 1, 0, revestimento)
  const porta = cilindro(eletrodo, 5, 25, 0, isolante)
  const garra = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 7), cobre)
  eletrodo.add(garra)
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
  const poca = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 10), new THREE.MeshBasicMaterial({ color: '#ffdb92' }))
  palco.peca.add(poca)
  const arco = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#d6f3ff' }))
  palco.peca.add(arco)
  const luz = new THREE.PointLight('#c9eaff', 0, 140, 2)
  palco.peca.add(luz)
  const raio = new THREE.Raycaster()
  const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const ponto = new THREE.Vector3()
  const escoria = criarSuperficieEscoria15()
  palco.peca.add(escoria.malha)
  palco.guardarTexturas(escoria.textura)
  const eixo = new THREE.Vector3(), normal = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion()
  const pontaMartelo = new THREE.Vector3()
  let volumeAntes = -1
  let cordaoAntes: Cordao | null = null
  return {
    canvas, enquadrar,
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
    aproximar(delta: number) { zoom = Math.max(0.5, Math.min(2, zoom * Math.exp(delta * 0.001))); posicionarCamera() },
    centralizar() { azimute = 0.237; polar = 1.077; zoom = 1; posicionarCamera() },
    pontoNaTela(x: number, y: number) {
      const r = canvas.getBoundingClientRect()
      raio.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, 1 - ((y - r.top) / r.height) * 2), camera)
      if (!raio.ray.intersectPlane(plano, ponto)) return null
      const p = { x: ponto.x + 75, y: ponto.z }
      return p.x >= 0 && p.x <= 150 && Math.abs(p.y) <= 50 ? p : null
    },
    desenhar(m: Acionamento15, p: { x: number; y: number }, c: Cordao, modo: FerramentaBancada15 = 'soldar', acionada = false, desdeGolpeMs = Infinity, agoraMs = 0) {
      const ligado = modo === 'soldar' && m.estado === 'arco'
      ferramenta.visible = modo === 'soldar'
      martelo.visible = modo === 'martelo' && m.naPeca
      escova.visible = modo === 'escova' && m.naPeca
      let topo = 0
      for (const cord of [c, ...c.soltos]) {
        const s = cord.secao(cord.indiceEm(p.x))
        if (Math.abs(s.yCentroMm - p.y) < Math.max(3, s.larguraMm / 2)) topo = Math.max(topo, s.alturaMm)
      }
      // Cabo de lado: a cabeça chega em arco lateral e a ponta toca a crosta.
      const golpe = desdeGolpeMs >= 0 && desdeGolpeMs < 260 ? Math.sin(Math.PI * desdeGolpeMs / 260) : 0
      martelo.rotation.set(0, -0.6 + golpe * 0.22, 1.1 + golpe * 0.35)
      pontaMartelo.set(-20.5, 0, 0).applyEuler(martelo.rotation)
      martelo.position.set(p.x - 75 - (1 - golpe) * 10, topo + 0.8 + (1 - golpe) * 5, p.y + (1 - golpe) * 4).sub(pontaMartelo)
      escova.position.set(p.x - 75 + (acionada ? Math.sin(agoraMs * 0.04) * 1.5 : 0), topo + 0.5, p.y)
      escova.rotation.y = 0.2
      const altura = Math.max(0, m.distanciaMm)
      ferramenta.position.set(p.x - 75, altura, p.y)
      const inc = m.inclinacaoGraus * Math.PI / 180, az = m.azimuteGraus * Math.PI / 180
      eixo.set(Math.sin(inc) * Math.cos(az), Math.cos(inc), Math.sin(inc) * Math.sin(az))
      ferramenta.quaternion.setFromUnitVectors(normal, eixo).multiply(q.setFromAxisAngle(normal, m.rolamentoGraus * Math.PI / 180))
      eletrodo.visible = m.processo === 'eletrodo'
      mig.visible = m.processo === 'mig'
      alma.scale.y = m.restanteMm
      alma.position.y = m.restanteMm / 2
      capa.scale.y = Math.max(1, m.restanteMm - 7)
      capa.position.y = 7 + (m.restanteMm - 7) / 2
      porta.position.y = m.restanteMm + 12
      garra.position.set(4, m.restanteMm + 1, 0)
      bocal.position.y = 8
      punho.position.y = 30
      arame.scale.y = Math.max(0.1, altura - 2)
      arame.position.y = -(altura - 2) / 2
      mira.position.set(p.x - 75, 0.3, p.y)
      mira.material.color.set(modo === 'soldar' ? '#edc167' : '#8ccbd4')
      mira.visible = m.naPeca
      poca.position.set(p.x - 75, 1, p.y)
      poca.visible = arco.visible = ligado
      arco.geometry.dispose()
      arco.geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p.x - 75, 0.7, p.y), new THREE.Vector3(p.x - 75, m.processo === 'mig' ? 2 : altura, p.y),
      ])
      luz.position.set(p.x - 75, 6, p.y)
      luz.intensity = ligado ? 700 : 0
      if (c !== cordaoAntes || c.volumeTotal() !== volumeAntes) {
        palco.atualizarCordao(c)
        cordaoAntes = c
        volumeAntes = c.volumeTotal()
      }
      escoria.atualizar(m.escoria, c)
      palco.desenhar(camera)
    },
    destruir() { palco.destruir() },
  }
}
