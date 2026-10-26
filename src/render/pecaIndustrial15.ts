import * as THREE from 'three'

/** Complementos sólidos fora do trecho da junta. A superfície soldável continua sendo a junta do modelo. */
export function criarDetalhesIndustriais15(junta: string): THREE.Group {
  const g = new THREE.Group()
  g.name = 'Conjunto industrial de chapa grossa'
  const aco = new THREE.MeshStandardMaterial({ color: '#424e56', metalness: 0.55, roughness: 0.8 })
  const usinado = new THREE.MeshStandardMaterial({ color: '#8c989e', metalness: 0.75, roughness: 0.45 })
  // Orelhas de montagem realmente furadas: ficam além das extremidades soldáveis.
  for (const sinal of [-1, 1]) {
    const forma = new THREE.Shape()
    forma.moveTo(-9,-44); forma.lineTo(9,-44); forma.lineTo(9,44); forma.lineTo(-9,44); forma.closePath()
    for (const z of [-28,28]) { const furo = new THREE.Path(); furo.absarc(0,z,4.5,0,Math.PI*2,true); forma.holes.push(furo) }
    const orelha = new THREE.Mesh(new THREE.ExtrudeGeometry(forma,{ depth: 8, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 1, steps: 1 }), aco)
    orelha.rotation.x = -Math.PI/2
    orelha.position.set(sinal*83,-8,0)
    orelha.castShadow = orelha.receiveShadow = true
    g.add(orelha)
    // Marcas de usinagem discretas nas faces externas.
    for (const z of [-38,38]) {
      const linha = new THREE.Mesh(new THREE.BoxGeometry(14,0.15,0.4),usinado)
      linha.position.set(sinal*83,0.25,z);g.add(linha)
    }
  }
  if (junta === 't' || junta === 'canto') {
    // Travessa inferior da sapata/caixão, abaixo da raiz e sem tapar o acesso.
    const travessa = new THREE.Mesh(new THREE.BoxGeometry(150,12,32),aco)
    travessa.position.set(0,-18,0); travessa.castShadow = true;g.add(travessa)
  }
  return g
}
