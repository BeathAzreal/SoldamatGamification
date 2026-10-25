export type FerramentaBancada15 = 'soldar' | 'martelo' | 'escova'
/** H63–H67: relações qualitativas SMAW; parâmetros sintéticos, sem qualificação de solda. */
export class Escoria15 {
  readonly colunas = 50
  readonly linhas = 34
  readonly quantidade = new Float64Array(1700)
  readonly calor = new Float64Array(1700)
  readonly fragmentos = new Float64Array(1700)
  inclusaoMm3 = 0
  private indice(x: number, y: number): number {
    return Math.max(0, Math.min(33, Math.floor((y + 50) / 3))) * 50 + Math.max(0, Math.min(49, Math.floor(x / 3)))
  }
  depositar(x: number, y: number, volume: number): void {
    const i = this.indice(x, y)
    if (this.calor[i] < 0.15) this.inclusaoMm3 += this.quantidade[i] * volume
    this.quantidade[i] = Math.min(1, this.quantidade[i] + volume / 5)
    this.fragmentos[i] = 0
    this.calor[i] = 1
  }
  esfriar(dt: number): void {
    const fator = Math.exp(-dt / 2.2)
    for (let i = 0; i < this.calor.length; i++) this.calor[i] *= fator
  }
  martelar(x: number, y: number): number {
    let removido = 0
    for (let i = 0; i < this.quantidade.length; i++) {
      const px = (i % 50) * 3 + 1.5, py = Math.floor(i / 50) * 3 - 48.5
      if (Math.hypot(px - x, py - y) > 5 || this.calor[i] > 0.15) continue
      const crosta = Math.max(0, this.quantidade[i] - this.fragmentos[i])
      removido += crosta * 0.8
      this.quantidade[i] -= crosta * 0.8
      this.fragmentos[i] += crosta * 0.2
    }
    return removido
  }
  escovar(x: number, y: number): number {
    let removido = 0
    for (let i = 0; i < this.quantidade.length; i++) {
      const px = (i % 50) * 3 + 1.5, py = Math.floor(i / 50) * 3 - 48.5
      if (Math.hypot(px - x, py - y) > 8 || this.calor[i] > 0.15) continue
      removido += this.fragmentos[i]
      this.quantidade[i] = Math.max(0, this.quantidade[i] - this.fragmentos[i])
      if (this.quantidade[i] < 1e-10) this.quantidade[i] = 0
      this.fragmentos[i] = 0
    }
    return removido
  }
  get residuos(): number { return this.fragmentos.reduce((a, b) => a + b, 0) }
  get cobertura(): number { return this.quantidade.reduce((a, b) => a + b, 0) }
}
