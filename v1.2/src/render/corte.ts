import type { SecaoLocal } from '../modelo/cordao'
import { DESCRICAO_ESTADO, type PontoFusao } from '../modelo/fusao'
import { chapasNaJunta, INFO_JUNTA, juntaDe, perfilNaJunta, type Ponto2 } from '../modelo/juntas'
import { MATERIAIS } from '../modelo/material'
import { FUSAO } from '../modelo/parametros'
import type { ContextoProcesso } from '../modelo/processo'
import { prepararCanvas } from './graficos'

/*
 * Corte transversal SINTÉTICO das missões (H18 + H33 + H46). Mostra as
 * chapas da junta (topo reto, V, T, sobreposta, canto) com a espessura real,
 * o cordão calculado e a zona fundida PREVISTA pelo índice de fusão. Não é
 * macrografia: é um esquema do que o modelo calcula.
 */

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function desenharCorteSintetico(
  canvas: HTMLCanvasElement,
  s: SecaoLocal | null,
  fusao: PontoFusao | null,
  ctx0: ContextoProcesso,
): void {
  const { ctx, w, h } = prepararCanvas(canvas)
  // Ainda sem tamanho (aba fechada ou fora da tela): nada a desenhar.
  if (w < 80 || h < 80) return
  ctx.fillStyle = '#121519'
  ctx.fillRect(0, 0, w, h)
  const junta = juntaDe(ctx0)
  const filete = INFO_JUNTA[junta].familia === 'filete'
  const e = ctx0.espessuraMm
  // Janela do desenho (mm no plano n, w): o filete precisa de altura para as paredes.
  const meia = 14
  const wMin = filete ? -e - 4 : -e - 1.5
  const wMax = filete ? 12 : 7
  const escala = Math.min((w - 40) / (2 * meia), (h - 70) / (wMax - wMin))
  const u0 = w / 2
  const z0 = 40 + wMax * escala
  const pu = (u: number) => u0 + u * escala
  const pz = (z: number) => z0 - z * escala
  const caminho = (pts: Ponto2[]) => {
    ctx.beginPath()
    pts.forEach(([n, ww], k) => (k === 0 ? ctx.moveTo(pu(n), pz(ww)) : ctx.lineTo(pu(n), pz(ww))))
    ctx.closePath()
  }
  const material = MATERIAIS[ctx0.material]
  const perfurado = fusao?.estado === 'perfuracao'

  // Chapas (recortadas pela janela do desenho).
  ctx.save()
  ctx.beginPath()
  ctx.rect(pu(-meia), pz(wMax), 2 * meia * escala, (wMax - wMin) * escala)
  ctx.clip()
  ctx.fillStyle = material.aparencia.chapaEscura
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'
  for (const chapa of chapasNaJunta(junta, ctx0, 60)) {
    caminho(chapa)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()

  ctx.font = '12px system-ui, sans-serif'
  const temCordao = s !== null && s.larguraMm >= 1
  if (temCordao && fusao) {
    const F = fusao.indice
    // Zona fundida prevista: profundidade proporcional a F (F = 1 atravessa a espessura).
    // No filete ela entra a partir da raiz, pela bissetriz.
    const prof = Math.min(1, F) * e
    const meiaZona = filete ? Math.max(1, (s.larguraMm / 2) * 0.6) : (s.larguraMm / 2) * 0.85
    const cn = filete ? 0 : s.yCentroMm
    ctx.fillStyle = perfurado ? 'rgba(0,0,0,0)' : 'rgba(255, 170, 70, 0.55)'
    ctx.strokeStyle = 'rgba(255, 190, 100, 0.95)'
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.ellipse(pu(cn), pz(0), Math.max(0, meiaZona * escala), Math.max(0, prof * escala), 0, 0, Math.PI)
    if (!perfurado) ctx.fill()
    ctx.stroke()
    ctx.setLineDash([])

    if (perfurado) {
      // Furo previsto: a poça atravessou e o metal escorreu.
      ctx.fillStyle = '#121519'
      ctx.fillRect(pu(cn - meiaZona * 0.6), pz(0) - 1, meiaZona * 1.2 * escala, e * escala + 2)
    } else if (F > 1 && !filete) {
      // Reforço de raiz previsto, pequeno, crescendo com o excesso de fusão.
      const raiz = Math.min(0.35 * e, (F - 1) * 0.3 * e)
      ctx.fillStyle = '#9aa0a6'
      ctx.beginPath()
      ctx.ellipse(pu(cn), pz(-e), Math.max(0, meiaZona * 0.5 * escala), Math.max(0, raiz * escala), 0, 0, Math.PI)
      ctx.fill()
    }

    // Cordão na forma da junta (domo de H3, V cheio ou aberto, filete).
    const p = perfilNaJunta(s, junta, ctx0, 40)
    caminho([...p.topo, ...[...p.baixo].reverse()])
    ctx.fillStyle = material.aparencia.cordao[2]
    ctx.fill()
    ctx.strokeStyle = 'rgba(20,22,25,0.9)'
    ctx.stroke()

    ctx.fillStyle = '#e4e7ea'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`Índice de fusão F = ${fmt(F)} (adequado de ${fmt(FUSAO.minimoAdequado)} a ${fmt(FUSAO.maximoAdequado)})`, 10, 8)
    ctx.fillText(`Previsão: ${DESCRICAO_ESTADO[fusao.estado]}`, 10, 26)
    ctx.textAlign = 'right'
    const medidas = filete && s.pernasMm
      ? `pernas ${fmt(s.pernasMm[1])} e ${fmt(s.pernasMm[0])} mm · face ${fmt(s.larguraMm)} mm`
      : s.alturaMm < 0
        ? `V aberto: falta ${fmt(-s.alturaMm)} mm para encher`
        : `largura ${fmt(s.larguraMm)} mm · reforço ${fmt(s.alturaMm)} mm`
    ctx.fillText(medidas, w - 10, 8)
  } else {
    ctx.fillStyle = '#9aa1a8'
    ctx.textAlign = 'center'
    ctx.fillText('Sem cordão nesta posição', u0, pz(wMax - 2))
  }

  // Linha da junta (a mira da tocha: a fresta no topo, a raiz no filete).
  ctx.setLineDash([2, 3])
  ctx.strokeStyle = 'rgba(224, 163, 58, 0.8)'
  ctx.beginPath()
  ctx.moveTo(Math.round(pu(0)) + 0.5, pz(wMax - 1))
  ctx.lineTo(Math.round(pu(0)) + 0.5, pz(filete ? 0 : -e - 1))
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#9aa1a8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`Corte sintético do modelo (não é macrografia) · ${INFO_JUNTA[junta].nome} · ${fmt(e)} mm · laranja: zona fundida prevista`, u0, h - 6)
}
