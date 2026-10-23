import { avaliar, type Tentativa } from './avaliacao'
import { Cordao } from './cordao'
import { efeitoPosicao, gravidade, juntaDe, POSICAO_PLANA, type GravidadeJunta, type PosicaoPeca } from './juntas'
import { MATERIAIS } from './material'
import { analisarMovimento } from './movimento'
import { EQUILIBRIO, MODELO, PECA, TRAJETORIA } from './parametros'
import { Percurso } from './percurso'
import {
  AJUSTES_PADRAO,
  CONTEXTO_PADRAO,
  equilibrioArco,
  espalhamentoDoMovimento,
  limitarAjustes,
  potenciaRelativa,
  razaoEfetiva,
  taxaDeposicao,
  type Ajustes,
  type ContextoProcesso,
} from './processo'
import { inicioDoDeslocamento, type Amostra } from './trajetoria'
import { EstimadorVelocidade, type Velocidades } from './velocidade'

/** Ponto da trajetória gravado enquanto o arco está aberto (para análise posterior). */
export interface PontoRegistro {
  t: number
  x: number
  y: number
  /** Tempo de arco acumulado até este ponto. */
  tempoArcoMs: number
  /** Ajustes da máquina usados neste trecho. */
  ajustes: Ajustes
}

/**
 * Registro mínimo para reproduzir uma tentativa (replay): as leituras com o
 * arco aberto, as aberturas e fechamentos, e as trocas de ajuste.
 */
export type EventoTentativa =
  | { tipo: 'inicio' | 'mover' | 'fim'; t: number; x: number; y: number }
  | { tipo: 'ajustes'; ajustes: Ajustes }
  /** Peça tombada/girada (H47); gravado ao abrir o arco, se mudou. */
  | { tipo: 'posicao'; rolagemGraus: number; giroGraus: number }

export interface EstadoTocha {
  arcoAberto: boolean
  /** A tentativa foi avaliada e não aceita mais solda (H19). */
  tentativaEncerrada: boolean
  ajustes: Ajustes
  posicao: { x: number; y: number } | null
  sobreAPeca: boolean
  velocidades: Velocidades
  tempoArcoMs: number
  /** Aquecimento acumulado da peça (H32), relativo. */
  aquecimento: number
}

/**
 * H44: instabilidade do arco com estes ajustes, de −1 (curto demais) a 1
 * (longo demais); zero dentro da tolerância do equilíbrio (H10).
 */
export function instabilidadeArco(a: Ajustes, ctx: ContextoProcesso): number {
  const { desvio } = equilibrioArco(a, ctx)
  const excesso = Math.max(0, Math.abs(desvio) - EQUILIBRIO.tolerancia)
  // Dentro da tolerância é exatamente 0 (nunca −0).
  return excesso === 0 ? 0 : Math.sign(desvio) * Math.min(1, excesso / 3)
}

export function sobreAPeca(x: number, y: number): boolean {
  return x >= 0 && x <= PECA.comprimentoMm && Math.abs(y) <= PECA.larguraChapaMm
}

/**
 * Núcleo da simulação. Não conhece canvas, DOM nem mouse: recebe leituras
 * { t, x, y } e devolve o estado. Por isso pode ser testada sem navegador.
 *
 * Ideia central: enquanto o arco está aberto, a tocha deposita metal a uma
 * taxa constante no tempo, proporcional à alimentação do arame (H1). O metal
 * cai onde a tocha está. Se ela anda devagar, o mesmo volume se acumula em
 * menos comprimento → cordão mais largo. A tensão muda só a forma (H9).
 */
/** Cordão na forma da junta do contexto (H46). */
function novoCordao(ctx: ContextoProcesso): Cordao {
  const junta = juntaDe(ctx)
  return new Cordao(undefined, undefined, undefined, junta === 'topo' ? null : { junta, dimensoes: { espessuraMm: ctx.espessuraMm, aberturaMm: ctx.aberturaMm } })
}

export class Simulacao {
  cordao: Cordao
  /** Tudo o que é preciso para reproduzir a tentativa. */
  eventos: EventoTentativa[] = []
  /** Tempo de arco por posição da junta (H20). */
  percurso = new Percurso()
  registro: PontoRegistro[] = []
  private ajustesAtuais: Ajustes = AJUSTES_PADRAO
  private readonly estimador = new EstimadorVelocidade()
  private ultima: Amostra | null = null
  private arco = false
  /** Até que instante o depósito já foi calculado. */
  private tConsolidado = 0
  private tempoArcoMs = 0
  private aberturasDeArco = 0
  private encerrada = false
  /** Aquecimento acumulado T (H32) e o instante a que ele se refere. */
  private aquecimento = 0
  private tAquecimento: number | null = null
  /** Posição da peça (H47): a atual e a última gravada nos eventos. */
  private posicaoAtual: PosicaoPeca
  private posicaoGravada: PosicaoPeca
  private gravidadeAtual: GravidadeJunta

  constructor(readonly contexto: ContextoProcesso = CONTEXTO_PADRAO) {
    this.cordao = novoCordao(contexto)
    this.eventos.push({ tipo: 'ajustes', ajustes: this.ajustesAtuais })
    this.posicaoAtual = this.posicaoGravada = { ...(contexto.posicaoInicial ?? POSICAO_PLANA) }
    this.gravidadeAtual = gravidade(this.posicaoAtual)
  }

  get posicao(): PosicaoPeca {
    return this.posicaoAtual
  }

  /**
   * Tomba/gira a peça (H47). Recusado com o arco aberto (a peça não se mexe
   * durante o passe) ou com a peça presa na estrutura; devolve se aceitou.
   */
  definirPosicao(p: PosicaoPeca): boolean {
    if (this.arco || this.contexto.posicaoFixa) return false
    this.posicaoAtual = { rolagemGraus: p.rolagemGraus, giroGraus: p.giroGraus }
    this.gravidadeAtual = gravidade(this.posicaoAtual)
    return true
  }

  get arcoAberto(): boolean {
    return this.arco
  }

  get ajustes(): Ajustes {
    return this.ajustesAtuais
  }

  get tentativaEncerrada(): boolean {
    return this.encerrada
  }

  /** Tempo total com o arco aberto (ms), consolidado. */
  get tempoDeArcoMs(): number {
    return this.tempoArcoMs
  }

  /** Muda tensão/alimentação. Recusado com o arco aberto (H12); devolve se aceitou. */
  definirAjustes(a: Ajustes): boolean {
    if (this.arco) return false
    this.ajustesAtuais = limitarAjustes(a)
    this.eventos.push({ tipo: 'ajustes', ajustes: this.ajustesAtuais })
    return true
  }

  /** Nova leitura de posição (com ou sem arco). */
  moverTocha(a: Amostra): void {
    if (this.arco && this.ultima) this.integrarAte(a)
    this.ultima = a
    this.estimador.adicionar(a)
    if (this.arco) {
      this.registrar(a)
      this.eventos.push({ tipo: 'mover', t: a.t, x: a.x, y: a.y })
    }
  }

  iniciarArco(a: Amostra): void {
    if (this.arco || this.encerrada) {
      this.moverTocha(a)
      return
    }
    this.moverTocha(a)
    // A posição só importa com o arco aberto: grava quando muda, antes do início.
    const p = this.posicaoAtual
    if (p.rolagemGraus !== this.posicaoGravada.rolagemGraus || p.giroGraus !== this.posicaoGravada.giroGraus) {
      this.eventos.push({ tipo: 'posicao', rolagemGraus: p.rolagemGraus, giroGraus: p.giroGraus })
      this.posicaoGravada = p
    }
    this.arco = true
    this.aberturasDeArco++
    this.tConsolidado = a.t
    this.esfriarAte(a.t)
    this.registrar(a)
    this.eventos.push({ tipo: 'inicio', t: a.t, x: a.x, y: a.y })
  }

  encerrarArco(a: Amostra): void {
    if (!this.arco) return
    this.moverTocha(a)
    // O 'mover' acima já registrou a posição final; 'fim' só fecha o arco.
    this.eventos.push({ tipo: 'fim', t: a.t, x: a.x, y: a.y })
    this.arco = false
  }

  /**
   * Fecha o arco SEM consolidar o tempo que passou desde a última leitura
   * consolidada (H49): pausa, perda de foco ou janela escondida. Fechar com
   * encerrarArco(agora) depositaria, de uma vez, todo o tempo parado da
   * pausa como se a tocha tivesse ficado ali soldando.
   */
  interromperArco(): void {
    if (!this.arco || !this.ultima) return
    const p = this.ultima
    this.encerrarArco({ t: Math.max(this.tConsolidado, p.t), x: p.x, y: p.y })
  }

  /**
   * Chamado a cada quadro com o relógio atual. Se o mouse não mandou leituras,
   * a tocha está parada e continua depositando no mesmo lugar.
   *
   * Só consolidamos até (agora − duração máxima de deslocamento): uma leitura
   * que ainda vai chegar não pode mudar o que já foi calculado. Assim o
   * resultado é o mesmo com qualquer taxa de quadros.
   */
  avancarTempo(agoraMs: number): void {
    if (!this.arco || !this.ultima) return
    const limite = agoraMs - TRAJETORIA.duracaoMaxDeslocamentoMs
    if (limite > this.tConsolidado) {
      this.depositarParado(this.ultima, this.tConsolidado, limite)
      this.tConsolidado = limite
    }
  }

  estado(agoraMs: number): EstadoTocha {
    const p = this.ultima
    return {
      arcoAberto: this.arco,
      tentativaEncerrada: this.encerrada,
      ajustes: this.ajustesAtuais,
      posicao: p ? { x: p.x, y: p.y } : null,
      sobreAPeca: p ? sobreAPeca(p.x, p.y) : false,
      velocidades: this.estimador.medir(agoraMs),
      tempoArcoMs: this.tempoArcoMs,
      aquecimento: this.aquecimento,
    }
  }

  /**
   * Encerra e avalia a tentativa (H19). Só com o arco fechado; devolve null
   * se o arco estiver aberto. Depois disso, nada mais é depositado até
   * reiniciar().
   */
  finalizar(): Tentativa | null {
    if (this.arco) return null
    this.encerrada = true
    const ajustesUsados: Ajustes[] = []
    for (const p of this.registro) {
      const ultimo = ajustesUsados[ajustesUsados.length - 1]
      if (!ultimo || ultimo.alimentacao !== p.ajustes.alimentacao || ultimo.tensao !== p.ajustes.tensao) {
        ajustesUsados.push(p.ajustes)
      }
    }
    const avaliacao = avaliar(this.cordao)
    return {
      avaliacao,
      movimento: analisarMovimento(this.percurso, avaliacao),
      ajustesUsados,
      tempoArcoMs: this.tempoArcoMs,
      aberturasDeArco: this.aberturasDeArco,
    }
  }

  /** Nova tentativa: chapa limpa. A posição da tocha e os ajustes são mantidos. */
  reiniciar(): void {
    this.cordao = novoCordao(this.contexto)
    this.percurso = new Percurso()
    this.registro = []
    this.eventos = [{ tipo: 'ajustes', ajustes: this.ajustesAtuais }]
    // O registro novo começa da posição de entrega: a atual, se for outra, é gravada no próximo arco.
    this.posicaoGravada = { ...(this.contexto.posicaoInicial ?? POSICAO_PLANA) }
    this.aquecimento = 0
    this.tAquecimento = null
    this.arco = false
    this.encerrada = false
    this.aberturasDeArco = 0
    this.tempoArcoMs = 0
    this.estimador.limpar()
    if (this.ultima) this.estimador.adicionar(this.ultima)
  }

  private integrarAte(a1: Amostra): void {
    const a0 = this.ultima!
    const tMov = Math.max(inicioDoDeslocamento(a0, a1), this.tConsolidado)
    if (tMov > this.tConsolidado) this.depositarParado(a0, this.tConsolidado, tMov)
    if (a1.t > tMov) this.depositarTrecho(a0, a1, tMov, a1.t)
    this.tConsolidado = Math.max(this.tConsolidado, a1.t)
  }

  /** Com o arco fechado a peça só esfria (H32). */
  private esfriarAte(t: number): void {
    if (this.tAquecimento === null) {
      this.tAquecimento = t
      return
    }
    if (t <= this.tAquecimento) return
    const tau = MATERIAIS[this.contexto.material].tauAquecimentoS
    this.aquecimento *= Math.exp(-(t - this.tAquecimento) / 1000 / tau)
    this.tAquecimento = t
  }

  /**
   * Avança o aquecimento de t0 a t1 com potência constante, de forma EXATA
   * (H32), e devolve ∫(1 + e·T) dt em segundos. Como a solução é exata,
   * dividir o intervalo em pedaços diferentes dá o mesmo resultado.
   */
  private aquecer(t0: number, t1: number, potencia: number): number {
    this.esfriarAte(t0)
    const m = MATERIAIS[this.contexto.material]
    const dt = (t1 - t0) / 1000
    const final = m.ganhoAquecimento * potencia
    const decaimento = Math.exp(-dt / m.tauAquecimentoS)
    const integralT = final * dt + (this.aquecimento - final) * m.tauAquecimentoS * (1 - decaimento)
    this.aquecimento = final + (this.aquecimento - final) * decaimento
    this.tAquecimento = t1
    return dt + m.efeitoAquecimento * integralT
  }

  private depositarParado(p: Amostra, t0: number, t1: number): void {
    this.tempoArcoMs += t1 - t0
    // Arco fora da peça não aquece a peça (H32): ela só esfria.
    if (!sobreAPeca(p.x, p.y)) {
      this.esfriarAte(t1)
      return
    }
    const potencia = potenciaRelativa(this.ajustesAtuais, this.contexto)
    const integral = this.aquecer(t0, t1, potencia)
    const volume = (taxaDeposicao(this.ajustesAtuais, this.contexto) * (t1 - t0)) / 1000
    // H47: parada, só pesa a gravidade de lado e para fora da face (sem subir nem descer).
    const ef = efeitoPosicao(this.gravidadeAtual, 0)
    this.cordao.depositar(p.x, p.y + ef.desvioMm, volume, t1, razaoEfetiva(this.ajustesAtuais, this.contexto) * ef.razao, espalhamentoDoMovimento(this.contexto), instabilidadeArco(this.ajustesAtuais, this.contexto))
    this.percurso.registrar(p.x, p.y, t1 - t0, (potencia * (t1 - t0)) / 1000, potencia * integral * ef.fusao)
  }

  /** Divide o trecho em pedaços curtos e deposita um pouco em cada um. */
  private depositarTrecho(p0: Amostra, p1: Amostra, t0: number, t1: number): void {
    this.tempoArcoMs += t1 - t0
    const n = Math.max(1, Math.ceil(Math.hypot(p1.x - p0.x, p1.y - p0.y) / MODELO.subdivisaoMaxMm))
    const dt = (t1 - t0) / n
    const volume = (taxaDeposicao(this.ajustesAtuais, this.contexto) * dt) / 1000
    // H47: a gravidade depende de a tocha estar subindo ou descendo ao longo da junta.
    const ef = efeitoPosicao(this.gravidadeAtual, p1.x - p0.x)
    const razao = razaoEfetiva(this.ajustesAtuais, this.contexto) * ef.razao
    const potencia = potenciaRelativa(this.ajustesAtuais, this.contexto)
    const sigma = espalhamentoDoMovimento(this.contexto)
    const instab = instabilidadeArco(this.ajustesAtuais, this.contexto)
    for (let j = 0; j < n; j++) {
      const f = (j + 0.5) / n
      const x = p0.x + (p1.x - p0.x) * f
      const y = p0.y + (p1.y - p0.y) * f
      if (!sobreAPeca(x, y)) {
        this.esfriarAte(t0 + (j + 1) * dt)
        continue
      }
      const integral = this.aquecer(t0 + j * dt, t0 + (j + 1) * dt, potencia)
      this.cordao.depositar(x, y + ef.desvioMm, volume, t0 + (j + 1) * dt, razao, sigma, instab)
      this.percurso.registrar(x, y, dt, (potencia * dt) / 1000, potencia * integral * ef.fusao)
    }
  }

  private registrar(a: Amostra): void {
    this.registro.push({ t: a.t, x: a.x, y: a.y, tempoArcoMs: this.tempoArcoMs, ajustes: this.ajustesAtuais })
  }
}
