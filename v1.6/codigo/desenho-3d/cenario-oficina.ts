import * as THREE from 'three'

/** Cenografia estática: fora do volume de giro da chapa, sem participar da simulação. */
export function criarOficinaTreino(piso: number, op: { armario?: boolean } = {}): THREE.Group {
  const oficina = new THREE.Group()
  oficina.name = 'Oficina pequena de treino'
  const material = (cor: string, metalness = 0.35) => new THREE.MeshStandardMaterial({ color: cor, metalness, roughness: 0.72 })
  const estrutura = material('#303b42')
  const tampo = material('#586168', 0.6)
  const azul = material('#385867')
  const vermelho = material('#9d4337')
  const borracha = material('#20272b', 0)
  const claro = material('#acb5b5')
  const caixa = (largura: number, altura: number, profundidade: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, profundidade), mat)
    m.position.set(x, y, z)
    m.castShadow = m.receiveShadow = true
    oficina.add(m)
    return m
  }
  const cilindro = (raio: number, altura: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, 16), mat)
    m.position.set(x, y, z)
    m.castShadow = m.receiveShadow = true
    oficina.add(m)
    return m
  }
  const cabo = (pontos: number[][], raio: number, mat: THREE.Material) => {
    const curva = new THREE.CatmullRomCurve3(pontos.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
    const m = new THREE.Mesh(new THREE.TubeGeometry(curva, 32, raio, 6, false), mat)
    oficina.add(m)
  }

  // Bancada atrás da estação: tampo e ferramentas não entram na trajetória da peça.
  caixa(430, 12, 140, -30, -115, -195, tampo)
  for (const x of [-225, 165]) for (const z of [-250, -140]) {
    caixa(12, -121 - piso, 12, x, (piso - 121) / 2, z, estrutura)
  }
  caixa(402, 8, 112, -30, piso + 65, -195, estrutura)
  caixa(150, 38, 105, -115, -142, -195, azul)
  caixa(52, 4, 4, -115, -139, -140, claro)
  // Pequena morsa na ponta da bancada, afastada da junta.
  caixa(40, 8, 35, -185, -105, -165, estrutura)
  caixa(38, 24, 12, -185, -90, -174, azul)
  caixa(38, 24, 10, -185, -90, -150, azul)
  caixa(45, 5, 13, -185, -76, -174, claro)
  caixa(45, 5, 11, -185, -76, -150, claro)
  // Painel encostado na parede traseira (z = -280), ferramentas presas à face.
  caixa(300, 150, 8, -45, 10, -276, estrutura)
  for (let i = 0; i < 5; i++) {
    caixa(5, 48, 5, -150 + i * 48, 18, -269.5, claro)
    caixa(19, 7, 7, -150 + i * 48, 43, -269, claro)
  }
  caixa(70, 18, 32, 65, -100, -210, vermelho)
  caixa(34, 4, 5, 65, -88, -210, estrutura)

  // Fonte de soldagem no carrinho lateral; frente voltada para quem trabalha.
  const xM = 265
  caixa(105, 9, 155, xM, piso + 30, -35, estrutura)
  for (const x of [xM - 42, xM + 42]) for (const z of [-92, 20]) {
    const roda = cilindro(13, 8, x, piso + 15, z, borracha)
    roda.rotation.z = Math.PI / 2
  }
  caixa(86, 115, 122, xM, piso + 92, -35, vermelho)
  caixa(74, 83, 4, xM, piso + 100, 28, estrutura)
  caixa(37, 17, 3, xM - 10, piso + 126, 31, material('#91b9af', 0))
  for (const dx of [-18, 16]) {
    const botao = cilindro(7, 5, xM + dx, piso + 100, 33, claro)
    botao.rotation.x = Math.PI / 2
  }
  for (let i = 0; i < 5; i++) caixa(51, 3, 3, xM, piso + 62 + i * 6, 32, borracha)
  caixa(6, 16, 6, xM - 25, piso + 158, -35, estrutura)
  caixa(6, 16, 6, xM + 25, piso + 158, -35, estrutura)
  caixa(56, 6, 6, xM, piso + 168, -35, estrutura)
  // Cilindro de gás preso ao carrinho, com regulador e mangueira.
  cilindro(22, 174, xM, piso + 123, -116, azul)
  cilindro(9, 17, xM, piso + 218, -116, claro)
  caixa(35, 7, 8, xM, piso + 230, -116, estrutura)
  const manometro = cilindro(10, 4, xM - 14, piso + 240, -111, claro)
  manometro.rotation.x = Math.PI / 2
  cabo([[265, piso + 230, -110], [302, piso + 204, -70], [300, piso + 110, -15]], 2, borracha)

  // Armário baixo ao fundo; a região central fica inteiramente livre.
  if (op.armario !== false) {
    caixa(140, 210, 90, -390, piso + 105, -230, azul)
    caixa(3, 185, 3, -390, piso + 107, -183, estrutura)
    for (const x of [-400, -380]) caixa(3, 28, 5, x, piso + 122, -180, claro)
  }
  return oficina
}
