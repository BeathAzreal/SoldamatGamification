/** H59–H62: protótipo de interação, sem calibração de processo ou pontuação. */
export type Processo15 = 'mig' | 'eletrodo'
import { Escoria15 } from './escoria15'
export type EstadoArco15 = 'desligado' | 'pronto' | 'contato' | 'arco' | 'afastado' | 'fim' | 'grudado'
export const VARETA15 = { inicialMm: 120, reservaMm: 25, consumoMmS: 3, contatoMm: 0.35, arcoMaxMm: 5 }
const PASSO = 1 / 120

export class Acionamento15 {
  pressionado = false
  naPeca = true
  restanteMm = VARETA15.inicialMm
  alturaMm: number
  tempoArcoS = 0
  volumeMm3 = 0
  trocas = 0
  correnteA = 90
  diametroMm = 2.5
  azimuteGraus = 0
  inclinacaoGraus = 0
  rolamentoGraus = 0
  xMm = 75
  yMm = 0
  energiaJ = 0
  grudadas = 0
  grudado = false
  readonly escoria = new Escoria15()
  private tempoContato = 0
  private contato = false
  private fracao = 0

  constructor(readonly processo: Processo15) {
    this.alturaMm = processo === 'eletrodo' ? this.restanteMm + 10 : 15
  }

  get cosInclinado(): number { return Math.cos(this.inclinacaoGraus * Math.PI / 180) }
  get distanciaMm(): number { return this.alturaMm - (this.processo === 'eletrodo' ? this.restanteMm * this.cosInclinado : 0) }
  get correnteRelativa(): number { return this.correnteA / (36 * this.diametroMm) }
  get consumoMmS(): number { return VARETA15.consumoMmS * this.correnteRelativa ** 1.35 }
  get tensaoV(): number { return this.estado === 'arco' ? 20 + 2 * this.distanciaMm : 0 }

  regular(corrente: number, diametro = this.diametroMm): void {
    if (this.pressionado || !Number.isFinite(corrente)) return
    this.correnteA = Math.max(40, Math.min(180, corrente))
    this.diametroMm = diametro === 3.2 ? 3.2 : 2.5
  }

  orientar(azimute: number, inclinacao: number, rolamento: number): void {
    if (this.grudado || ![azimute, inclinacao, rolamento].every(Number.isFinite)) return
    const distancia = this.distanciaMm
    this.azimuteGraus = ((azimute % 360) + 360) % 360
    this.inclinacaoGraus = Math.max(0, Math.min(85, inclinacao))
    this.rolamentoGraus = ((rolamento % 360) + 360) % 360
    this.definirDistancia(distancia)
  }

  desgrudar(): boolean {
    if (!this.grudado || this.pressionado) return false
    this.grudado = false
    this.tempoContato = 0
    this.contato = false
    this.definirDistancia(3)
    return true
  }

  definirDistancia(mm: number): void {
    if (!Number.isFinite(mm) || this.grudado) return
    this.alturaMm = (this.processo === 'eletrodo' ? this.restanteMm * this.cosInclinado : 0) + Math.max(0, Math.min(35, mm))
  }

  get estado(): EstadoArco15 {
    if (this.grudado) return 'grudado'
    if (this.processo === 'eletrodo' && this.restanteMm <= VARETA15.reservaMm + 1e-8) return 'fim'
    if (!this.pressionado) return 'desligado'
    if (!this.naPeca) return 'afastado'
    if (this.processo === 'mig') return this.distanciaMm >= 5 && this.distanciaMm <= 25 ? 'arco' : 'afastado'
    if (this.distanciaMm <= VARETA15.contatoMm) return 'contato'
    if (this.contato && this.distanciaMm <= Math.min(VARETA15.arcoMaxMm, this.diametroMm * 2) && this.correnteRelativa >= 0.55) return 'arco'
    return 'pronto'
  }

  /** Passo fixo: consumo e tempo de arco não dependem da taxa de quadros. */
  avancar(segundos: number, velocidadeAlturaMmS = 0, depositar?: (volumeMm3: number) => void): void {
    if (!Number.isFinite(segundos) || segundos <= 0 || !Number.isFinite(velocidadeAlturaMmS)) return
    this.fracao += segundos
    while (this.fracao + 1e-12 >= PASSO) {
      this.fracao -= PASSO
      this.escoria.esfriar(PASSO)
      this.definirDistancia(this.distanciaMm + velocidadeAlturaMmS * PASSO)
      if (this.processo === 'eletrodo' && this.pressionado && this.naPeca && this.distanciaMm <= VARETA15.contatoMm && this.estado !== 'fim') {
        this.tempoContato += PASSO
        if (!this.grudado && this.tempoContato >= (this.correnteRelativa < 0.65 ? 0.15 : 0.65)) {
          this.grudado = true
          this.grudadas++
        }
      } else this.tempoContato = 0
      if (!this.pressionado || !this.naPeca) this.contato = false
      else if (this.processo === 'eletrodo' && this.distanciaMm <= VARETA15.contatoMm) this.contato = true
      else if (this.distanciaMm > VARETA15.arcoMaxMm && this.processo === 'eletrodo') this.contato = false
      if (this.estado !== 'arco') continue
      const tensaoAntes = this.tensaoV
      let dt = PASSO
      if (this.processo === 'eletrodo') {
        dt = Math.min(dt, (this.restanteMm - VARETA15.reservaMm) / this.consumoMmS)
        const gasto = this.consumoMmS * dt
        this.restanteMm = Math.max(VARETA15.reservaMm, this.restanteMm - gasto)
        const lado = gasto * Math.sin(this.inclinacaoGraus * Math.PI / 180)
        this.xMm += lado * Math.cos(this.azimuteGraus * Math.PI / 180)
        this.yMm += lado * Math.sin(this.azimuteGraus * Math.PI / 180)
        this.naPeca = this.xMm >= 0 && this.xMm <= 150 && Math.abs(this.yMm) <= 50
      }
      this.tempoArcoS += dt
      // Só traço visual de depósito. Não usa as regras MIG como física SMAW.
      const volume = this.processo === 'mig' ? 64 * dt : Math.PI * (this.diametroMm / 2) ** 2 * this.consumoMmS * 0.7 * dt
      this.volumeMm3 += volume
      if (this.processo === 'eletrodo') {
        this.energiaJ += this.correnteA * tensaoAntes * dt
        this.escoria.depositar(this.xMm, this.yMm, volume)
      }
      depositar?.(volume)
    }
  }

  soltar(): void { this.pressionado = false; this.contato = false }

  trocarVareta(): boolean {
    if (this.processo !== 'eletrodo' || this.pressionado || this.grudado) return false
    this.restanteMm = VARETA15.inicialMm
    this.alturaMm = this.restanteMm * this.cosInclinado + 10
    this.contato = false
    this.trocas++
    return true
  }
}
