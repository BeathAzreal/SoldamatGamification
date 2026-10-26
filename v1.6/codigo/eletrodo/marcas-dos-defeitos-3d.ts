/*
 * █ Eletrodo: defeitos desenhados no cordão (3D)
 *
 * O que faz: desenha sobre o metal do eletrodo o que a análise do cordão
 *    achou (analise-do-cordao.ts): poros (furinhos escuros), respingos e
 *    marcas de abertura (bolinhas de metal na chapa), mordedura (risco
 *    escuro na borda do cordão) e cratera (mancha escura no fim do passe).
 *    A cor de calor e o escurecimento da cratera são pintados no próprio
 *    metal (metal-do-cordao-3d.ts). Só desenha: não muda o depósito nem a
 *    nota (H84).
 *
 * Onde mexer: cores e tamanhos estão em COR e nos números de cada bloco.
 */
import * as THREE from 'three'
import type { AnaliseDefeitos } from '../simulacao-mig/defeitos'
import { LIMITES, secaoDoDeposito } from './analise-do-cordao'
import type { DepositoEletrodo } from './deposito-do-cordao'

const COR = { poro: '#0d0c0b', respingo: '#6f6d68', mordedura: '#151413', cratera: '#1b1a18' }
/** Quantas marcas de cada tipo cabem (o resto não é desenhado). */
const MAXIMO = 900

function marcas(geometria: THREE.BufferGeometry, cor: string, metal = 0.2) {
  const malha = new THREE.InstancedMesh(geometria, new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: metal }), MAXIMO)
  malha.count = 0
  malha.frustumCulled = false
  return malha
}

export function criarMarcasDefeitos() {
  const grupo = new THREE.Group()
  const poros = marcas(new THREE.SphereGeometry(1, 10, 6), COR.poro)
  const respingos = marcas(new THREE.SphereGeometry(1, 8, 6), COR.respingo, 0.6)
  const mordeduras = marcas(new THREE.BoxGeometry(1, 1, 1), COR.mordedura)
  const crateras = marcas(new THREE.CylinderGeometry(1, 1, 1, 18), COR.cratera)
  grupo.add(poros, respingos, mordeduras, crateras)
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3()
  const por = (malha: THREE.InstancedMesh, x: number, y: number, n: number, sx: number, sy: number, sz: number) => {
    if (malha.count >= MAXIMO) return
    m.compose(p.set(x - 75, y, n), q, s.set(sx, sy, sz))
    malha.setMatrixAt(malha.count++, m)
  }
  return {
    grupo,
    atualizar(a: AnaliseDefeitos | null, dep: DepositoEletrodo | null) {
      for (const malha of [poros, respingos, mordeduras, crateras]) malha.count = 0
      if (a && dep) {
        // Poros: só os que chegam à superfície aparecem; meio enterrados no metal.
        for (const o of a.poros) if (o.superficie) por(poros, o.xMm, dep.altura(o.xMm, o.nMm) - o.raioMm * 0.3, o.nMm, o.raioMm, o.raioMm * 0.7, o.raioMm)
        // Respingos e marcas de abertura: bolinhas assentadas na chapa ou no cordão.
        for (const r of a.respingos) por(respingos, r.xMm, dep.altura(r.xMm, r.nMm) + r.raioMm * 0.4, r.nMm, r.raioMm, r.raioMm * 0.7, r.raioMm)
        // Mordedura: um risco escuro em cada borda do cordão, do tamanho da fatia.
        for (let i = 0; i < a.n; i++) {
          const fundo = Math.max(a.mordeduraMenos[i], a.mordeduraMais[i])
          if (fundo <= LIMITES.mordeduraLimiteMm) continue
          const x = (i + 0.5) * a.passoMm
          const sec = secaoDoDeposito(dep, x)
          if (sec.larguraMm < 1) continue
          for (const lado of [-1, 1]) {
            const n = sec.yCentroMm + lado * (sec.larguraMm / 2 + 0.2)
            por(mordeduras, x, dep.altura(x, n) - fundo * 0.3, n, a.passoMm * 1.05, fundo * 0.6, 0.35 + 0.3 * fundo)
          }
        }
        // Cratera: disco escuro e raso no ponto em que o passe acabou.
        for (let i = 1; i + 1 < a.n; i++) {
          const c = a.cratera[i]
          if (c < 0.3 || c < a.cratera[i - 1] || c < a.cratera[i + 1]) continue
          const x = (i + 0.5) * a.passoMm
          const sec = secaoDoDeposito(dep, x)
          if (sec.larguraMm < 1.5) continue
          const r = 0.3 * sec.larguraMm * c
          por(crateras, x, dep.altura(x, sec.yCentroMm) + 0.02, sec.yCentroMm, r, 0.05, r)
        }
      }
      for (const malha of [poros, respingos, mordeduras, crateras]) malha.instanceMatrix.needsUpdate = true
    },
  }
}
