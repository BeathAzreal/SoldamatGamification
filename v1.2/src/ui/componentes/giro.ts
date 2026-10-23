import type { FonteEntrada } from '../../entrada/fonte'
import { FontePonteiro } from '../../entrada/ponteiro'
import { gravidade, NOME_POSICAO, POSICAO_PLANA, posicaoDe, ROLAGEM_MAX_GRAUS, SIGLAS_POSICAO, type FamiliaJunta, type PosicaoPeca } from '../../modelo/juntas'
import type { Vista } from '../../render/vista'
import { h } from '../dom'

/*
 * Posicionar a peça (H42, H47), sempre com o arco FECHADO:
 * - girar no próprio plano: segurar Q/E, os botões ⟲ ⟳ ou o direcional ← →;
 * - tombar de 0° (face para cima) a 180° (de cabeça para baixo): W/S, os
 *   botões ▲ ▼ ou o direcional ↑ ↓.
 * As duas juntas decidem a posição de soldagem (plana, horizontal, vertical
 * ou sobrecabeça), que muda a poça (H47). Peça presa na estrutura não mexe.
 */

const VELOCIDADE_GRAUS_S = 60
/** Direcional do controle no mapeamento padrão do navegador. */
const BOTAO_CIMA = 12
const BOTAO_BAIXO = 13
const BOTAO_ESQUERDA = 14
const BOTAO_DIREITA = 15

export interface OpcoesGiro {
  /** Como a peça chega (H47). */
  inicial?: PosicaoPeca
  /** Peça presa: nada gira. */
  fixa?: boolean
  /** Para o código da posição (1G… ou 1F…). */
  familia?: FamiliaJunta
}

export interface Giro {
  elemento: HTMLElement
  /** Posição atual da peça (graus). */
  readonly posicao: PosicaoPeca
  /** Chamado a cada quadro, antes de desenhar. */
  atualizar: (agoraMs: number, vista: Vista, fonte: FonteEntrada | null, arcoAberto: boolean) => void
  /** Volta para a posição em que a peça chegou (troca de peça na bancada). */
  reiniciar: (op?: OpcoesGiro) => void
  destruir: () => void
}

export function montarGiro(op: OpcoesGiro = {}): Giro {
  let inicial: PosicaoPeca = op.inicial ?? POSICAO_PLANA
  let fixa = !!op.fixa
  let familia: FamiliaJunta = op.familia ?? 'chanfro'
  let giro = inicial.giroGraus
  let rolagem = inicial.rolagemGraus
  let tAnterior: number | null = null
  const teclas = { esq: false, dir: false, cima: false, baixo: false }
  const tela = { esq: false, dir: false, cima: false, baixo: false }
  type Lado = keyof typeof teclas

  const segurar = (rotulo: string, titulo: string, lado: Lado) => {
    const b = h('button', { type: 'button', class: 'botao-redondo botao-giro', title: titulo, 'aria-label': titulo }, rotulo)
    const soltar = () => (tela[lado] = false)
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      tela[lado] = true
      try {
        b.setPointerCapture(e.pointerId)
      } catch {
        // Ponteiro sintético: segue sem captura.
      }
    })
    b.addEventListener('pointerup', soltar)
    b.addEventListener('pointercancel', soltar)
    b.addEventListener('lostpointercapture', soltar)
    return b
  }
  const botoes = [
    segurar('⟲', 'Girar a peça no plano, sentido anti-horário (segure, ou tecla Q)', 'esq'),
    segurar('⟳', 'Girar a peça no plano, sentido horário (segure, ou tecla E)', 'dir'),
    segurar('▲', 'Tombar a peça para trás, até 0° com a face para cima (segure, ou tecla W)', 'cima'),
    segurar('▼', 'Tombar a peça para a frente, até 180° de cabeça para baixo (segure, ou tecla S)', 'baixo'),
  ]
  const leituraGiro = h('output', { class: 'giro-angulo', title: 'Giro no plano' }, '0°')
  const leituraRolagem = h('output', { class: 'giro-angulo', title: 'Tombamento (0° = face para cima)' }, '0°')
  const leituraPosicao = h('output', { class: 'giro-posicao', 'aria-live': 'polite' })
  // A peça vista de lado: a chapa tomba contra o piso e a tocha fica sempre do lado da face (H47).
  const lado = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  lado.setAttribute('viewBox', '0 0 40 40')
  lado.setAttribute('class', 'giro-lado')
  lado.setAttribute('aria-hidden', 'true')
  lado.innerHTML =
    '<line class="piso" x1="2" y1="37" x2="38" y2="37"/><g class="peca-lado"><rect class="chapa" x="8" y="19" width="24" height="4" rx="1"/><line class="face" x1="8" y1="19" x2="32" y2="19"/><path class="tocha" d="M20 16 L20 6 M17 9 L20 5 L23 9"/></g>'
  const pecaLado = lado.querySelector('.peca-lado')!
  const endireitar = h('button', { type: 'button', class: 'botao-fantasma botao-endireitar', title: 'Voltar a peça para como ela chegou (com o arco fechado)' }, 'Como chegou')
  endireitar.addEventListener('click', () => {
    giro = inicial.giroGraus
    rolagem = inicial.rolagemGraus
  })

  const elemento = h(
    'div',
    { class: 'giro', role: 'group', 'aria-label': 'Posicionar a peça' },
    h('span', { class: 'giro-grupo' }, botoes[0], leituraGiro, botoes[1]),
    h('span', { class: 'giro-grupo' }, botoes[2], leituraRolagem, botoes[3]),
    lado,
    leituraPosicao,
    endireitar,
  )

  const tecla = (valor: boolean) => (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return
    const k = e.key.toLowerCase()
    if (k === 'q') teclas.esq = valor
    else if (k === 'e') teclas.dir = valor
    else if (k === 'w') teclas.cima = valor
    else if (k === 's') teclas.baixo = valor
  }
  const baixo = tecla(true)
  const cima = tecla(false)
  const perdeuFoco = () => {
    for (const k of Object.keys(teclas) as Lado[]) teclas[k] = tela[k] = false
  }
  window.addEventListener('keydown', baixo)
  window.addEventListener('keyup', cima)
  window.addEventListener('blur', perdeuFoco)

  const direcional = (a: number, b: number): number => {
    let d = 0
    for (const g of navigator.getGamepads?.() ?? []) {
      if (!g) continue
      if (g.buttons[a]?.pressed) d -= 1
      if (g.buttons[b]?.pressed) d += 1
    }
    return Math.sign(d)
  }
  const sentido = (menos: Lado, mais: Lado, a: number, b: number) =>
    Math.sign((teclas[mais] || tela[mais] ? 1 : 0) - (teclas[menos] || tela[menos] ? 1 : 0) + direcional(a, b))

  const api: Giro = {
    elemento,
    get posicao() {
      return { rolagemGraus: rolagem, giroGraus: giro }
    },
    atualizar(agoraMs, vista, fonte, arcoAberto) {
      const dt = tAnterior === null ? 0 : Math.min(0.1, (agoraMs - tAnterior) / 1000)
      tAnterior = agoraMs
      // H47: a peça só se mexe com o arco fechado (e não se estiver presa).
      const pode = !arcoAberto && !fixa
      if (pode) {
        giro += sentido('esq', 'dir', BOTAO_ESQUERDA, BOTAO_DIREITA) * VELOCIDADE_GRAUS_S * dt
        rolagem = Math.min(ROLAGEM_MAX_GRAUS, Math.max(0, rolagem + sentido('cima', 'baixo', BOTAO_CIMA, BOTAO_BAIXO) * VELOCIDADE_GRAUS_S * dt))
      }
      for (const b of botoes) b.disabled = !pode
      endireitar.disabled = !pode || (giro === inicial.giroGraus && rolagem === inicial.rolagemGraus)
      const angulo = (giro * Math.PI) / 180
      const mudou = vista.angulo !== angulo
      vista.definirAngulo(angulo)
      if (mudou && fonte instanceof FontePonteiro) fonte.reamostrar(agoraMs)
      leituraGiro.textContent = `${Math.round(((giro % 360) + 360) % 360)}°`
      leituraRolagem.textContent = `${Math.round(rolagem)}°`
      pecaLado.setAttribute('transform', `rotate(${-rolagem.toFixed(1)} 20 21)`)
      const pos = posicaoDe(gravidade({ rolagemGraus: rolagem, giroGraus: giro }))
      leituraPosicao.textContent = `${fixa ? 'Peça fixa · ' : ''}${NOME_POSICAO[pos]} (${SIGLAS_POSICAO[familia][pos]})`
      elemento.classList.toggle('travado', !pode)
    },
    reiniciar(novo = {}) {
      inicial = novo.inicial ?? POSICAO_PLANA
      fixa = !!novo.fixa
      familia = novo.familia ?? 'chanfro'
      giro = inicial.giroGraus
      rolagem = inicial.rolagemGraus
    },
    destruir() {
      window.removeEventListener('keydown', baixo)
      window.removeEventListener('keyup', cima)
      window.removeEventListener('blur', perdeuFoco)
    },
  }
  return api
}
