/** H59–H62: protótipo de interação, sem calibração de processo ou pontuação. */
export type Processo15 = 'mig' | 'eletrodo'
export type EstadoArco15 = 'desligado' | 'pronto' | 'contato' | 'arco' | 'afastado' | 'fim'
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
  private contato = false
  private fracao = 0

  constructor(readonly processo: Processo15) {
    this.alturaMm = processo === 'eletrodo' ? this.restanteMm + 10 : 15
  }

  get distanciaMm(): number { return this.alturaMm - (this.processo === 'eletrodo' ? this.restanteMm : 0) }

  definirDistancia(mm: number): void {
    if (!Number.isFinite(mm)) return
    this.alturaMm = (this.processo === 'eletrodo' ? this.restanteMm : 0) + Math.max(0, Math.min(35, mm))
  }

  get estado(): EstadoArco15 {
    if (this.processo === 'eletrodo' && this.restanteMm <= VARETA15.reservaMm + 1e-8) return 'fim'
    if (!this.pressionado) return 'desligado'
    if (!this.naPeca) return 'afastado'
    if (this.processo === 'mig') return this.distanciaMm >= 5 && this.distanciaMm <= 25 ? 'arco' : 'afastado'
    if (this.distanciaMm <= VARETA15.contatoMm) return 'contato'
    if (this.contato && this.distanciaMm <= VARETA15.arcoMaxMm) return 'arco'
    return 'pronto'
  }

  /** Passo fixo: consumo e tempo de arco não dependem da taxa de quadros. */
  avancar(segundos: number, velocidadeAlturaMmS = 0, depositar?: (volumeMm3: number) => void): void {
    if (!Number.isFinite(segundos) || segundos <= 0 || !Number.isFinite(velocidadeAlturaMmS)) return
    this.fracao += segundos
    while (this.fracao + 1e-12 >= PASSO) {
      this.fracao -= PASSO
      this.definirDistancia(this.distanciaMm + velocidadeAlturaMmS * PASSO)
      if (!this.pressionado || !this.naPeca) this.contato = false
      else if (this.processo === 'eletrodo' && this.distanciaMm <= VARETA15.contatoMm) this.contato = true
      else if (this.distanciaMm > VARETA15.arcoMaxMm && this.processo === 'eletrodo') this.contato = false
      if (this.estado !== 'arco') continue
      let dt = PASSO
      if (this.processo === 'eletrodo') {
        dt = Math.min(dt, (this.restanteMm - VARETA15.reservaMm) / VARETA15.consumoMmS)
        this.restanteMm = Math.max(VARETA15.reservaMm, this.restanteMm - VARETA15.consumoMmS * dt)
      }
      this.tempoArcoS += dt
      // Só traço visual de depósito. Não usa as regras MIG como física SMAW.
      const volume = (this.processo === 'mig' ? 64 : 35) * dt
      this.volumeMm3 += volume
      depositar?.(volume)
    }
  }

  soltar(): void { this.pressionado = false; this.contato = false }

  trocarVareta(): boolean {
    if (this.processo !== 'eletrodo' || this.pressionado) return false
    this.restanteMm = VARETA15.inicialMm
    this.alturaMm = this.restanteMm + 10
    this.contato = false
    this.trocas++
    return true
  }
}
