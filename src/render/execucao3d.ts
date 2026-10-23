import * as THREE from 'three'
import type { Cordao } from '../modelo/cordao'
import { aporteNecessario } from '../modelo/fusao'
import type { GeometriaJunta } from '../modelo/junta'
import { MATERIAIS } from '../modelo/material'
import { MODELO, PECA } from '../modelo/parametros'
import type { Percurso } from '../modelo/percurso'
import { gravidade, juntaDe } from '../modelo/juntas'
import { dbcpDe, movimentoDe, oscilacaoVisual, tecnicaDe, type ContextoProcesso } from '../modelo/processo'
import { sobreAPeca, type PontoRegistro } from '../modelo/simulacao'
import { Calor3D } from './calor3d'
import { janelaDoRegistro } from './cordaoVivo'
import { taxaFaiscas } from './efeitos'
import { paraMundo } from './malha3d'
import { Palco3D } from './palco3d'
import { PERFIS, type Qualidade3D } from './qualidade3d'
import { INCLINACAO_TECNICA_RAD, Tocha3D, type QuadroTocha } from './tocha3d'
import type { Vista } from './vista'
import { Vista3D } from './vista3d'

/*
 * Cena 3D da EXECUÇÃO: o palco comum com a câmera fixa da Vista3D (sem
 * órbita livre, para não disputar o mouse com a tocha). Só LÊ o modelo; a
 * entrada continua chegando pelo canvas 2D transparente por cima.
 */

export interface DadosQuadro3D {
  cordao: Cordao
  /** Registro da simulação: diz por onde a tocha passou desde o último quadro. */
  registro: readonly PontoRegistro[]
  /** Posição da tocha em (s, n), ou null fora da área. */
  posicao: { x: number; y: number } | null
  arcoAberto: boolean
  /** Desenhar a mira (ponteiro dentro e sem pausa), como em cena.ts. */
  ponteiroDentro: boolean
  /** Giro da peça (radianos, como Vista.angulo). */
  angulo: number
  /** O arco está sobre a peça (EstadoTocha.sobreAPeca). */
  sobreAPeca: boolean
  /** Tensão − tensão de equilíbrio (equilibrioArco, H10): muda só o clarão. */
  desvio: number
  agoraMs: number
  /** Aquecimento acumulado da peça (H32): alarga o halo. */
  aquecimento: number
  /** Aportes por fatia (tinta térmica do inox). */
  percurso: Percurso
  /** Peça tombada (graus, H47): o mundo gira em volta da junta. */
  rolagemGraus: number
}

export interface CenaExecucao3D {
  readonly elemento: HTMLCanvasElement
  readonly vista: Vista3D
  ajustarTamanho(largura: number, altura: number): void
  desenhar(d: DadosQuadro3D): void
  destruir(): void
}

export interface OpcoesExecucao3D {
  contexto: ContextoProcesso
  geometria: GeometriaJunta
  /** Marcas do desenho da missão (a peça de teste da bancada não tem). */
  missao?: { inicioMm: number; fimMm: number; alinhamentoMm: number }
  /** A Vista 2D da tela: a 3D segue o mesmo zoom, pivô e giro. */
  vista2d: Vista
  /** Sombras, resolução e quantidade de partículas. */
  qualidade: Qualidade3D
}

export function criarCenaExecucao3D(op: OpcoesExecucao3D): CenaExecucao3D | null {
  const perfil = PERFIS[op.qualidade]
  const palco = Palco3D.criar({
    contexto: op.contexto,
    geometria: op.geometria,
    missao: op.missao,
    regua: true,
    sombras: perfil.sombras,
    mapaSombra: perfil.mapaSombra,
    pixelRatioMax: perfil.pixelRatioMax,
    antialias: perfil.antialias,
  })
  if (!palco) return null
  const elemento = palco.elemento
  elemento.className = 'tela-solda-3d'
  elemento.setAttribute('aria-hidden', 'true')
  const vista = new Vista3D(op.vista2d)

  // Mira: o mesmo anel de 7 mm da tocha da vista de cima, sempre por cima de tudo.
  const mira = new THREE.Group()
  const matMira = new THREE.MeshBasicMaterial({ color: '#ebeef2', transparent: true, opacity: 0.85, depthTest: false, toneMapped: false })
  const anel = new THREE.Mesh(new THREE.RingGeometry(6.6, 7.2, 48), matMira)
  const cruz = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.3), matMira)
  const cruz2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 7), matMira)
  for (const m of [anel, cruz, cruz2]) {
    m.rotation.x = -Math.PI / 2
    m.renderOrder = 10
    mira.add(m)
  }
  mira.visible = false
  palco.peca.add(mira)
  const tocha = new Tocha3D()
  palco.peca.add(tocha.grupo)
  palco.guardarTexturas(...tocha.texturas)
  const movimento = movimentoDe(op.contexto)
  const aparencia = MATERIAIS[op.contexto.material].aparencia
  const calor = new Calor3D(op.geometria, Math.ceil(PECA.comprimentoMm / MODELO.passoMm), MODELO.passoMm, perfil.particulas, aparencia.tintaTermica, juntaDe(op.contexto), op.contexto)
  palco.peca.add(calor.particulas)
  palco.relevo.add(calor.relevo)
  palco.guardarTexturas(...calor.texturas)
  const necessario = aporteNecessario(op.contexto)
  // A tinta térmica lê uma cópia dos aportes: no máximo 10 vezes por segundo.
  let tTinta = -Infinity
  let tintaPendente = false
  let cordaoAtual: Cordao | null = null
  const emissor = { x: 0, y: 0, z: 0 }
  // Reaproveitado a cada quadro (sem alocar).
  const qt: QuadroTocha = { x: 0, dbcpMm: dbcpDe(op.contexto), z: 0, topoMm: 0, soldando: false, fora: false, desvio: 0, larguraMm: 0, rumo: 0, angulo: 0, inclinacao: 0, intensidadePoca: aparencia.brilhoFraco ? 0.5 : 1 }
  const gPeca = { x: 0, y: -1, z: 0 }
  // H38: empurrando, o topo da tocha fica atrás do avanço; puxando, à frente.
  const tecnica = tecnicaDe(op.contexto)
  const sinalTecnica = tecnica === 'empurrando' ? 1 : tecnica === 'puxando' ? -1 : 0
  // Sentido de avanço ao longo da junta, pelo movimento da mão (vale o último que passou de 0,3 mm).
  let sentido = 1
  let sRef: number | null = null
  const SEM_OSCILACAO = { dx: 0, dy: 0 }
  // O metal novo cai nos trechos entre pontos do registro (simulacao.ts), espalhado
  // por até 3σ (H4). Ler o registro, e não só a tocha, cobre quadros perdidos.
  const MARGEM_MM = 3 * MODELO.sigmaPocaMm + 2
  let registroAtual: readonly PontoRegistro[] | null = null
  let lidos = 0

  return {
    elemento,
    vista,
    ajustarTamanho(l, a) {
      palco.ajustarTamanho(l, a)
      vista.ajustar(l, a)
    },
    desenhar(d) {
      palco.definirGiro(d.angulo)
      palco.definirRolagem(d.rolagemGraus)
      // Gravidade nos eixos da peça (x ao longo da junta, y para fora da face, z lateral), H47.
      const g = gravidade({ rolagemGraus: d.rolagemGraus, giroGraus: (d.angulo * 180) / Math.PI })
      gPeca.x = g.t
      gPeca.y = g.w
      gPeca.z = g.n
      if (d.registro !== registroAtual) {
        registroAtual = d.registro
        lidos = 0
      }
      const j = janelaDoRegistro(d.registro, lidos, MARGEM_MM)
      lidos = d.registro.length
      const mudou = j ? palco.atualizarCordao(d.cordao, j.s0, j.s1) : palco.atualizarCordao(d.cordao)
      // Peça limpa (cordão novo): a tinta antiga tem de sumir já.
      if (d.cordao !== cordaoAtual) {
        cordaoAtual = d.cordao
        tTinta = -Infinity
        tintaPendente = true
      }
      if (mudou) tintaPendente = true
      if (calor.comTinta && tintaPendente && d.agoraMs - tTinta >= 100) {
        calor.atualizarTinta(d.percurso.copiaDosAportes(), necessario, palco.malhaCordao)
        tTinta = d.agoraMs
        tintaPendente = false
      }
      calor.atualizarCalor(d.agoraMs, d.aquecimento, palco.malhaCordao, palco.geometriaCordao, aparencia.brilhoFraco ? 0.25 : 1, aparencia.brilhoFraco ? 0.35 : 1)
      let emite = false
      const ver = !!d.posicao && d.ponteiroDentro
      mira.visible = ver
      if (d.posicao) {
        const p = d.posicao
        // H39: o vaivém da tocha é só desenho (mesma regra de cena.ts).
        const osc = d.arcoAberto && movimento !== 'reto' ? oscilacaoVisual(movimento, d.agoraMs) : SEM_OSCILACAO
        const q = op.geometria.pontoEm(p.x + osc.dx, p.y + osc.dy)
        const [x, , z] = paraMundo(q.x, q.y, 0)
        const fora = !sobreAPeca(p.x, p.y)
        // No plano do topo da chapa, onde o raio da entrada acerta: sem paralaxe com a inclinação.
        mira.position.set(x, 0.1, z)
        // Arco aberto: anel escuro, como na vista de cima. Fora da peça: vermelho.
        matMira.color.setHex(fora ? 0xff6a5a : d.arcoAberto ? 0x282828 : 0xebeef2)
        matMira.opacity = d.arcoAberto && !fora ? 0.55 : 0.85
        cruz.visible = cruz2.visible = !d.arcoAberto || fora
        if (sRef === null) sRef = p.x
        else if (Math.abs(p.x - sRef) > 0.3) {
          sentido = Math.sign(p.x - sRef)
          sRef = p.x
        }
        if (ver) {
          qt.inclinacao = sinalTecnica * sentido * INCLINACAO_TECNICA_RAD
          qt.x = x
          qt.z = z
          qt.topoMm = palco.alturaEm(p.x)
          qt.soldando = d.arcoAberto && d.sobreAPeca
          qt.fora = fora
          qt.desvio = d.desvio
          qt.larguraMm = d.cordao.secao(d.cordao.indiceEm(p.x)).larguraMm
          qt.rumo = op.geometria.rumoEm(p.x)
          qt.angulo = d.angulo
          tocha.atualizar(qt)
          if (qt.soldando) {
            emissor.x = x
            emissor.y = qt.topoMm + 1
            emissor.z = z
            emite = true
          }
        } else tocha.esconder()
      } else tocha.esconder()
      calor.atualizarParticulas(d.agoraMs, emite ? emissor : null, taxaFaiscas(op.contexto, d.desvio), gPeca)
      palco.desenhar(vista.camera)
    },
    destruir() {
      palco.destruir()
    },
  }
}
