import type { Dificuldade } from '../missoes/catalogo'
import type { PecaTig } from '../missoes/pecasTig'
import type { DepositoEletrodo } from '../modelo/depositoEletrodo'
import type { ModeloTig } from '../modelo/tig'

/*
 * Nota do TIG (H92), de 0 a 1000, nos mesmos moldes da do eletrodo:
 * cinco itens medidos sobre a peça e descontos por furo. Fácil só nota;
 * Difícil aprova com 20 % em cada item e na nota final (aprovacaoEletrodo).
 */

/** Faixa de reforço (altura do metal da vareta sobre a linha da junta, mm) e largura mínima fundida, por peça. */
export function alvoTig(p: PecaTig) {
  return p.junta === 't'
    ? { reforcoMin: 0.8, reforcoMax: 3.2, larguraMin: 2.5, descricao: 'Filete com a poça molhando as duas chapas e metal da vareta no canto' }
    : p.sobreChapa
      ? { reforcoMin: 0.4, reforcoMax: 2.5, larguraMin: 3, descricao: 'Cordão fundido de pelo menos 3 mm de largura, com reforço de vareta de 0,4 a 2,5 mm' }
      : { reforcoMin: 0.2, reforcoMax: 2, larguraMin: 2.5, descricao: 'As duas bordas fundidas juntas, com um pouco de reforço (0,2 a 2 mm)' }
}

/** Descontos por furo: graves (pedem reparo), com teto. */
export const MODOS_TIG = {
  aprendiz: { porFuro: 40, maxFuros: 120 },
  profissional: { porFuro: 120, maxFuros: 360 },
} as const

const limitar = (v: number) => Math.max(0, Math.min(1, v))
function coeficienteVariacao(v: readonly number[]): number {
  if (v.length < 2) return 1
  const m = v.reduce((a, b) => a + b, 0) / v.length
  if (m <= 0) return 1
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) / m
}

export interface TrechoTig { fundido: boolean; largura: number; reforco: number }

export function trechoTig(p: PecaTig, m: ModeloTig, dep: DepositoEletrodo, x: number): TrechoTig {
  const largura = m.larguraFundida(x)
  return { fundido: m.fundiuEm(x, 0) && largura >= alvoTig(p).larguraMin, largura, reforco: dep.espessura(x, 0) }
}

export function avaliarTig(p: PecaTig, m: ModeloTig, dep: DepositoEletrodo, modo: Dificuldade) {
  const alvo = alvoTig(p)
  let total = 0, fundidos = 0, comReforco = 0
  const larguras: number[] = []
  for (let x = p.inicioMm + 0.5; x < p.fimMm; x++) {
    total++
    const t = trechoTig(p, m, dep, x)
    if (t.fundido) { fundidos++; larguras.push(t.largura) }
    if (t.fundido && t.reforco >= alvo.reforcoMin && t.reforco <= alvo.reforcoMax) comReforco++
  }
  const comprimento = p.fimMm - p.inicioMm
  const toques = m.toques.filter((t) => t.xMm >= p.inicioMm && t.xMm <= p.fimMm).map((t) => t.xMm).sort((a, b) => a - b)
  const passos = toques.slice(1).map((x, i) => x - toques[i]).filter((d) => d > 0.05)
  const cobertura = total ? fundidos / total : 0
  const executado = m.tempoArcoS > 0
  const limpeza = limitar(1 - 0.25 * m.contaminacoes - 0.2 * m.varetaNoTungstenio - 0.04 * m.varetaFria - 0.15 * m.crateras.length)
  const itens = [
    { nome: 'Fusão no trecho', maximo: 300, fracao: cobertura, explicacao: `${Math.round(cobertura * 100)}% dos ${comprimento} mm fundidos na linha da junta, com pelo menos ${alvo.larguraMin} mm de largura.` },
    { nome: 'Adição e reforço', maximo: 200, fracao: total ? comReforco / total : 0, explicacao: `Metal da vareta sobre a junta entre ${alvo.reforcoMin} e ${alvo.reforcoMax} mm de altura, só onde fundiu.` },
    { nome: 'Largura regular', maximo: 200, fracao: larguras.length ? cobertura * limitar(1 - coeficienteVariacao(larguras) / 0.35) : 0, explicacao: 'Mesma largura de poça do início ao fim: pedal e avanço constantes.' },
    { nome: 'Escamas regulares', maximo: 150, fracao: passos.length >= 3 ? limitar(1 - coeficienteVariacao(passos) / 0.6) * limitar(toques.length / (comprimento / 3)) : 0, explicacao: `${toques.length} toques da vareta no trecho. Toques no mesmo ritmo e passo deixam as escamas iguais.` },
    { nome: 'Limpeza do processo', maximo: 150, fracao: limpeza, explicacao: `Tungstênio na poça ${m.contaminacoes}×, vareta no tungstênio ${m.varetaNoTungstenio}×, vareta na chapa fria ${m.varetaFria}×, crateras ${m.crateras.length}.` },
  ].map((i) => ({ ...i, pontos: executado ? Math.round(i.fracao * i.maximo) : 0 }))
  const regras = MODOS_TIG[modo]
  const penalidadeFuros = executado ? Math.min(regras.maxFuros, m.furos.length * regras.porFuro) : 0
  const nota = executado ? Math.max(0, Math.min(1000, itens.reduce((a, i) => a + i.pontos, 0) - penalidadeFuros)) : 0
  return { nota, itens, penalidadeFuros, cobertura, toques: toques.length, inspecaoPendente: false, descricao: alvo.descricao }
}

export type ResultadoTig = ReturnType<typeof avaliarTig>

export interface DefeitoTig {
  nome: string
  onde: string
  causa: string
  corrigir: string
  grave: boolean
}

/** Trechos contínuos (mm) em que `falta(x)` é verdadeiro, dentro do trecho exigido. */
function trechos(p: PecaTig, falta: (x: number) => boolean): [number, number][] {
  const r: [number, number][] = []
  let inicio: number | null = null
  for (let x = p.inicioMm + 0.5; x < p.fimMm; x++) {
    if (falta(x)) inicio ??= x
    else if (inicio !== null) { if (x - inicio >= 2) r.push([inicio, x]); inicio = null }
  }
  if (inicio !== null && p.fimMm - inicio >= 2) r.push([inicio, p.fimMm])
  return r
}
const mm = (v: number) => String(Math.round(v))
const ondeTrechos = (t: [number, number][]) => t.length === 1 ? `de ${mm(t[0][0])} a ${mm(t[0][1])} mm` : `em ${t.length} trechos, entre ${mm(t[0][0])} e ${mm(t[t.length - 1][1])} mm`

/** O que se vê na peça, onde, por que e como corrigir (do mais grave para o mais leve). */
export function inspecionarTig(p: PecaTig, m: ModeloTig, dep: DepositoEletrodo): DefeitoTig[] {
  const d: DefeitoTig[] = []
  if (m.furos.length) d.push({ nome: `Furo na chapa${m.furos.length > 1 ? ` (${m.furos.length}×)` : ''}`, onde: m.furos.map((f) => `${mm(f.xMm)} mm`).join(', '), grave: true,
    causa: 'Calor demais para a espessura: corrente alta ou a tocha parada sobre a poça.', corrigir: 'Alivie o pedal assim que a poça se formar e avance; em chapa fina, use a corrente do meio da faixa.' })
  const semFusao = trechos(p, (x) => !trechoTig(p, m, dep, x).fundido)
  if (semFusao.length && m.tempoArcoS > 0) d.push({ nome: 'Falta de fusão', onde: ondeTrechos(semFusao), grave: true,
    causa: 'A tocha passou sem formar poça (avanço rápido, pedal baixo ou arco longo).', corrigir: 'Espere a poça brilhar antes de avançar e mantenha o tungstênio a 2–3 mm.' })
  if (m.contaminacoes) d.push({ nome: `Tungstênio contaminado (${m.contaminacoes}×)`, onde: 'no eletrodo', grave: false,
    causa: 'O tungstênio encostou na poça: o arco fica instável e espalha.', corrigir: 'Afie o tungstênio (botão Afiar) e mantenha distância; suba um pouco quando o cordão crescer.' })
  if (m.varetaNoTungstenio) d.push({ nome: `Vareta tocou o tungstênio (${m.varetaNoTungstenio}×)`, onde: 'no eletrodo', grave: false,
    causa: 'Arco curto demais para a vareta entrar entre o tungstênio e a poça.', corrigir: 'Abra um pouco o arco antes de mergulhar a vareta na frente da poça.' })
  if (m.varetaFria) d.push({ nome: `Vareta na chapa fria (${m.varetaFria}×)`, onde: 'na frente da poça', grave: false,
    causa: 'A vareta tocou a chapa onde ainda não havia poça: ela não funde, só bate.', corrigir: 'Mergulhe só quando a poça estiver formada e brilhando.' })
  if (m.crateras.length) d.push({ nome: `Cratera no fim${m.crateras.length > 1 ? ` (${m.crateras.length}×)` : ''}`, onde: m.crateras.map((c) => `${mm(c.xMm)} mm`).join(', '), grave: false,
    causa: 'O arco foi cortado de uma vez com a poça grande.', corrigir: 'No fim, dê um último toque de vareta e solte o pedal devagar.' })
  const alvo = alvoTig(p)
  const semReforco = trechos(p, (x) => { const t = trechoTig(p, m, dep, x); return t.fundido && t.reforco < alvo.reforcoMin })
  if (semReforco.length) d.push({ nome: 'Pouco reforço', onde: ondeTrechos(semReforco), grave: false,
    causa: 'Fundiu, mas sem metal da vareta suficiente: o cordão fica baixo ou côncavo.', corrigir: 'Toque a vareta na borda da frente da poça a cada avanço.' })
  const excesso = trechos(p, (x) => trechoTig(p, m, dep, x).reforco > alvo.reforcoMax)
  if (excesso.length) d.push({ nome: 'Reforço alto', onde: ondeTrechos(excesso), grave: false,
    causa: 'Vareta demais para a poça (toques longos ou avanço lento).', corrigir: 'Toques curtos e avanço de um passo a cada toque.' })
  return d.sort((a, b) => Number(b.grave) - Number(a.grave))
}

