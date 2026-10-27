import type { Amostra } from '../modelo/trajetoria'
import type { Extras, FonteEntrada, Mapeamento, Receptor } from './fonte'

/*
 * Mouse e mesa digitalizadora (caneta) via Pointer Events.
 *
 * - Posição absoluta: o ponto da tela é o ponto da peça. Com o arco aberto,
 *   a tocha vai até ele no máximo a VELOCIDADE_MAXIMA_PONTEIRO (H87): se a
 *   mão corre, a tocha fica para trás e alcança no próprio ritmo, a cada
 *   quadro (atualizar).
 * - O instante de cada leitura é event.timeStamp (mesmo relógio de
 *   performance.now()); getCoalescedEvents() recupera leituras agrupadas.
 *   Assim o resultado não depende da frequência de eventos nem dos quadros.
 * - Mouse: arco com o botão esquerdo pressionado.
 * - Caneta: arco com a ponta encostada. Opcionalmente, por pressão (limiar),
 *   quando a caneta informa pressão de verdade. A pressão NÃO controla a
 *   corrente: em MIG/MAG a corrente segue a alimentação do arame (H28).
 */

export interface OpcoesCaneta {
  usarPressao: boolean
  /** 0–1. */
  limiarPressao: number
}

export const OPCOES_CANETA_PADRAO: OpcoesCaneta = { usarPressao: false, limiarPressao: 0.25 }

/** H87: velocidade máxima da tocha com o arco aberto, no mouse e na caneta (mm/s). */
export const VELOCIDADE_MAXIMA_PONTEIRO = 12

export class FontePonteiro implements FonteEntrada {
  posicao: { x: number; y: number } | null = null
  gatilho = false
  extras: Extras = {}
  aoDesconectar: (() => void) | null = null
  readonly conectado = true
  /** A caneta já informou pressão variável (não só 0/0,5/1)? */
  pressaoDisponivel = false
  private receptor: Receptor | null = null
  private readonly remover: (() => void)[] = []

  constructor(
    readonly dispositivo: 'mouse' | 'caneta',
    private readonly alvo: HTMLElement,
    private readonly mapa: Mapeamento,
    private readonly opcoes: OpcoesCaneta = OPCOES_CANETA_PADRAO,
  ) {}

  /** Último evento recebido, para diagnóstico na calibração. */
  ultimoEvento = ''

  /**
   * Mouse: só eventos de mouse. Caneta: qualquer tipo de ponteiro, porque
   * muitos drivers de mesa digitalizadora mandam o "passar por cima" como
   * caneta mas o toque como mouse ou toque (ou tudo como mouse).
   */
  private aceita(e: PointerEvent): boolean {
    this.ultimoEvento = `${e.type} · ${e.pointerType || '?'} · botões ${e.buttons} · pressão ${e.pressure.toFixed(2)}`
    return this.dispositivo === 'caneta' ? true : e.pointerType === 'mouse'
  }

  /** Último ponto da tela (relativo ao alvo), para reamostrar quando a peça gira. */
  private ultimaTela: { x: number; y: number } | null = null

  private amostra(e: PointerEvent): Amostra {
    const r = this.alvo.getBoundingClientRect()
    this.ultimaTela = { x: e.clientX - r.left, y: e.clientY - r.top }
    return { t: e.timeStamp, ...this.mapa.paraPeca(this.ultimaTela.x, this.ultimaTela.y) }
  }

  /**
   * A peça girou sob o ponteiro parado (H42): a mesma posição na tela agora é
   * outro ponto da junta. Gera uma leitura nova no instante t.
   */
  reamostrar(t: number): void {
    if (!this.ultimaTela || !this.receptor) return
    const a = { t, ...this.mapa.paraPeca(this.ultimaTela.x, this.ultimaTela.y) }
    this.posicao = { x: a.x, y: a.y }
    if (this.receptor.arcoAberto) this.receptor.moverTocha(a)
  }

  private lerExtras(e: PointerEvent): void {
    if (this.dispositivo !== 'caneta') return
    if (e.pressure > 0 && e.pressure !== 0.5 && e.pressure !== 1) this.pressaoDisponivel = true
    this.extras = { pressao: e.pressure, inclinacaoX: e.tiltX, inclinacaoY: e.tiltY }
  }

  /** Gatilho desejado para este evento. */
  private gatilhoDe(e: PointerEvent): boolean {
    if (this.dispositivo === 'mouse') return (e.buttons & 1) === 1
    // Contato: ponta encostada (botão 1) ou pressão informada. O botão lateral
    // da caneta sozinho (sem contato) não abre o arco.
    const encostada = (e.buttons & 1) === 1 || (e.pointerType === 'pen' && e.pressure > 0 && e.buttons !== 2)
    if (this.opcoes.usarPressao && this.pressaoDisponivel) return encostada && e.pressure >= this.opcoes.limiarPressao
    return encostada
  }

  /** Onde a mão está (mm da peça) e onde a tocha está com o arco aberto (H87). */
  private alvoMao: Amostra | null = null
  private tocha: Amostra | null = null

  /** Leva a tocha em direção à mão até o instante t, sem passar da velocidade máxima. */
  private seguirMao(t: number): Amostra {
    const alvo = this.alvoMao!, de = this.tocha ?? alvo
    const dt = Math.max(0, t - de.t)
    const dx = alvo.x - de.x, dy = alvo.y - de.y, d = Math.hypot(dx, dy)
    const passo = (VELOCIDADE_MAXIMA_PONTEIRO * dt) / 1000
    const f = d <= passo || d === 0 ? 1 : passo / d
    this.tocha = { t, x: de.x + dx * f, y: de.y + dy * f }
    return this.tocha
  }

  private processar(leituras: PointerEvent[]): void {
    for (const l of leituras) {
      const mao = this.amostra(l)
      this.alvoMao = mao
      // Com o arco aberto, a tocha anda até a mão no máximo a VELOCIDADE_MAXIMA_PONTEIRO (H87).
      const a = this.receptor?.arcoAberto ? this.seguirMao(mao.t) : mao
      this.posicao = { x: a.x, y: a.y }
      this.lerExtras(l)
      const quer = this.gatilhoDe(l)
      if (!this.receptor) {
        this.gatilho = quer
        continue
      }
      if (quer && !this.receptor.arcoAberto) {
        this.tocha = a
        this.receptor.iniciarArco(a)
      } else if (!quer && this.receptor.arcoAberto) {
        this.receptor.encerrarArco(a)
        this.tocha = null
      } else this.receptor.moverTocha(a)
      this.gatilho = quer
    }
  }

  ligar(receptor: Receptor): void {
    this.receptor = receptor
    const ouvir = <K extends keyof HTMLElementEventMap>(tipo: K, f: (e: HTMLElementEventMap[K]) => void) => {
      this.alvo.addEventListener(tipo, f as EventListener)
      this.remover.push(() => this.alvo.removeEventListener(tipo, f as EventListener))
    }
    ouvir('pointerdown', (e) => {
      if (!this.aceita(e)) return
      try {
        this.alvo.setPointerCapture(e.pointerId)
      } catch {
        // Ponteiro sintético ou já liberado: segue sem captura.
      }
      e.preventDefault()
      this.processar([e])
    })
    ouvir('pointermove', (e) => {
      if (!this.aceita(e)) return
      const agrupadas = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : []
      this.processar(agrupadas.length ? agrupadas : [e])
    })
    const soltar = (e: PointerEvent) => {
      if (!this.aceita(e)) return
      const mao = this.amostra(e)
      this.alvoMao = mao
      const a = this.receptor?.arcoAberto ? this.seguirMao(mao.t) : mao
      this.gatilho = false
      if (this.receptor?.arcoAberto) this.receptor.encerrarArco(a)
      this.tocha = null
    }
    ouvir('pointerup', soltar)
    ouvir('pointercancel', soltar)
    ouvir('lostpointercapture', soltar)
    ouvir('pointerleave', (e) => {
      if (this.aceita(e) && !this.receptor?.arcoAberto) this.posicao = null
    })
    ouvir('contextmenu', (e) => e.preventDefault())
  }

  desligar(): void {
    for (const r of this.remover.splice(0)) r()
    this.receptor = null
  }

  atualizar(agoraMs: number): void {
    // Com a mão parada à frente, a tocha continua indo até ela no próprio ritmo (H87).
    if (!this.receptor?.arcoAberto || !this.tocha || !this.alvoMao || agoraMs <= this.tocha.t) return
    if (this.tocha.x === this.alvoMao.x && this.tocha.y === this.alvoMao.y) return
    const a = this.seguirMao(agoraMs)
    this.posicao = { x: a.x, y: a.y }
    this.receptor.moverTocha(a)
  }
}
