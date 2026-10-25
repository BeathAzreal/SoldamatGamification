import * as THREE from 'three'
import type { Escoria15 } from '../modelo/escoria15'
import type { Cordao } from '../modelo/cordao'

/** Crosta superficial contínua. A grade física é a máscara; não são grãos depositados. */
export function criarSuperficieEscoria15() {
  const colunas = 50, linhas = 34
  const vertices = (colunas + 1) * (linhas + 1)
  const posicoes = new Float32Array(vertices * 3), cores = new Float32Array(vertices * 3), uvs = new Float32Array(vertices * 2)
  const indices: number[] = []
  for (let j = 0; j <= linhas; j++) for (let i = 0; i <= colunas; i++) {
    const n = j * (colunas + 1) + i
    posicoes[n * 3] = i * 3 - 75
    posicoes[n * 3 + 2] = Math.min(50, j * 3 - 50)
    uvs[n * 2] = i / colunas
    uvs[n * 2 + 1] = j / linhas
    if (i < colunas && j < linhas) {
      indices.push(n, n + colunas + 1, n + 1, n + 1, n + colunas + 1, n + colunas + 2)
    }
  }
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3))
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3))
  geometria.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometria.setIndex(indices)
  const pixels = new Uint8Array(colunas * linhas * 4)
  const textura = new THREE.DataTexture(pixels, colunas, linhas, THREE.RGBAFormat)
  textura.magFilter = textura.minFilter = THREE.LinearFilter
  const material = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.98, metalness: 0.03, alphaMap: textura, alphaTest: 0.12, side: THREE.DoubleSide })
  const malha = new THREE.Mesh(geometria, material)
  malha.frustumCulled = false
  malha.receiveShadow = true
  const fria = new THREE.Color('#3c342c'), quente = new THREE.Color('#c46b2c'), cor = new THREE.Color()
  return {
    malha, textura,
    atualizar(escoria: Escoria15, cordao: Cordao) {
      malha.visible = escoria.cobertura > 0.001
      if (!malha.visible) return
      for (let i = 0; i < escoria.quantidade.length; i++) {
        const alfa = Math.round(Math.min(1, escoria.quantidade[i] * 1.5) * 255)
        pixels.set([alfa, alfa, alfa, 255], i * 4)
      }
      const cordoes = [cordao, ...cordao.soltos]
      for (let j = 0; j <= linhas; j++) for (let i = 0; i <= colunas; i++) {
        const n = j * (colunas + 1) + i
        const x = i * 3, y = Math.min(50, j * 3 - 50)
        let topo = 0, calor = 0, quantidade = 0, amostras = 0
        for (const c of cordoes) {
          const s = c.secao(c.indiceEm(x))
          const r = Math.abs(s.yCentroMm - y) / Math.max(0.2, s.larguraMm / 2)
          if (r < 1) topo = Math.max(topo, s.alturaMm * (1 - r * r))
        }
        for (const dj of [-1, 0]) for (const di of [-1, 0]) {
          const a = j + dj, b = i + di
          if (a < 0 || a >= linhas || b < 0 || b >= colunas) continue
          const k = a * colunas + b
          quantidade += escoria.quantidade[k]
          calor += escoria.calor[k] * escoria.quantidade[k]
          amostras++
        }
        posicoes[n * 3 + 1] = topo + 0.15 + 0.18 * quantidade / Math.max(1, amostras)
        cor.copy(fria).lerp(quente, quantidade > 0 ? calor / quantidade : 0)
        cores.set([cor.r, cor.g, cor.b], n * 3)
      }
      textura.needsUpdate = true
      geometria.attributes.position.needsUpdate = true
      geometria.attributes.color.needsUpdate = true
      geometria.computeVertexNormals()
    },
  }
}
