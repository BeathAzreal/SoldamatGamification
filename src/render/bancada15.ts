import * as THREE from 'three'
import { Palco3D } from './palco3d'
import { geometriaDa } from '../modelo/junta'
import { CONTEXTO_PADRAO } from '../modelo/processo'
import type { Cordao } from '../modelo/cordao'
import type { Acionamento15 } from '../modelo/acionamento15'

/** Vista do protótipo: porta-eletrodo e vareta em escala de mm, câmera independente. */
export function criarBancada15() {
  const palco = Palco3D.criar({ contexto: CONTEXTO_PADRAO, geometria: geometriaDa('reta'), oficinaTreino: true, sombras: true, pixelRatioMax: 1.5 })
  if (!palco) return null
  const canvas = palco.elemento
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', 'Bancada 3D: mova sobre a chapa e segure o botão esquerdo ou Espaço para habilitar a soldagem. W aproxima, S afasta.')
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 4000)
  const enquadrar = (l: number, a: number) => {
    palco.ajustarTamanho(l, a)
    camera.aspect = l / a
    const afastamento = Math.max(1, 1 / camera.aspect)
    camera.position.set(70 * afastamento, 40 + 160 * afastamento, 290 * afastamento)
    camera.lookAt(0, 40, 0)
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
  const bocal = cilindro(mig, 5, 16, 8, cobre)
  const punho = cilindro(mig, 7, 28, 30, isolante)
  const arame = cilindro(mig, 0.45, 1, 0, metal)
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
  let volumeAntes = -1
  let cordaoAntes: Cordao | null = null
  return {
    canvas, enquadrar,
    pontoNaTela(x: number, y: number) {
      const r = canvas.getBoundingClientRect()
      raio.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, 1 - ((y - r.top) / r.height) * 2), camera)
      if (!raio.ray.intersectPlane(plano, ponto)) return null
      const p = { x: ponto.x + 75, y: ponto.z }
      return p.x >= 0 && p.x <= 150 && Math.abs(p.y) <= 50 ? p : null
    },
    desenhar(m: Acionamento15, p: { x: number; y: number }, c: Cordao) {
      const ligado = m.estado === 'arco'
      const altura = Math.max(0, m.distanciaMm)
      ferramenta.position.set(p.x - 75, 0, p.y)
      eletrodo.visible = m.processo === 'eletrodo'
      mig.visible = m.processo === 'mig'
      alma.scale.y = m.restanteMm
      alma.position.y = altura + m.restanteMm / 2
      capa.scale.y = Math.max(1, m.restanteMm - 7)
      capa.position.y = altura + 7 + (m.restanteMm - 7) / 2
      porta.position.y = m.alturaMm + 12
      bocal.position.y = altura + 8
      punho.position.y = altura + 30
      arame.scale.y = Math.max(0.1, altura - 2)
      arame.position.y = (altura + 2) / 2
      mira.position.set(p.x - 75, 0.3, p.y)
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
      palco.desenhar(camera)
    },
    destruir() { palco.destruir() },
  }
}
