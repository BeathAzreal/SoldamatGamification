/*
 * █ Eletrodo: inspeção visual e nota
 *
 * O que faz: depois do passe (e da limpeza da escória), inspeciona o trecho
 *    exigido como num teste de soldador: continuidade, geometria (reforço,
 *    perna ou enchimento), fusão pelo calor, defeitos de superfície e
 *    limpeza. Dá uma nota de 0 a 100, diz se a peça foi aprovada e lista
 *    cada defeito com o lugar (mm), a causa provável e como corrigir (H77).
 *
 * Onde mexer: os pesos das categorias estão em PESOS e os critérios de
 *    reprovação em REPROVA. Os textos de causa e correção estão em TEXTO.
 *    São critérios didáticos do jogo, inspirados em inspeção visual de
 *    soldagem; não são norma nem certificação.
 */
import type { Cordao } from '../simulacao-mig/cordao'
import type { Escoria15 } from './escoria'
import { LIMITES, type AnaliseEletrodo } from './analise-do-cordao'
import type { PecaEletrodo } from './pecas-de-treino'
import type { RegistroPasse } from './registro-do-passe'

/** Versão das regras da nota do eletrodo: troque se mudar a regra. */
export const VERSAO_NOTA_ELETRODO = 'eletrodo-v1'

export const PESOS = { continuidade: 20, geometria: 25, fusao: 25, superficie: 20, limpeza: 10 } as const

/** Reprova a peça, como na inspeção visual de um teste de soldador (critério do jogo). */
export const REPROVA = {
  coberturaMinima: 0.9,
  faltaDeFusaoMm: 10,
  porosAbertos: 3,
  inclusaoMm: 3,
  perfuracaoMm: 2,
  sobreposicaoMm: 10,
  /** Perna ou enchimento abaixo do pedido por este comprimento reprova (filete pequeno, chanfro não cheio). */
  faltaGeometriaMm: 10,
} as const

export type TipoDefeitoEletrodo =
  | 'interrompido' | 'falta-de-fusao' | 'fusao-fraca' | 'excesso-de-calor' | 'perfuracao'
  | 'mordedura' | 'sobreposicao' | 'porosidade' | 'cratera' | 'inclusao-de-escoria'
  | 'respingos' | 'abertura-fora' | 'grudou' | 'geometria-baixa' | 'geometria-alta' | 'largura-irregular' | 'escoria'

const TEXTO: Record<TipoDefeitoEletrodo, { nome: string; causa: string; corrigir: string }> = {
  'interrompido': { nome: 'Cordão interrompido', causa: 'O arco apagou ou a ponta saiu da junta e o trecho ficou sem metal.', corrigir: 'Reabra o arco um pouco antes do fim do cordão anterior e volte por cima da emenda.' },
  'falta-de-fusao': { nome: 'Falta de fusão (colagem)', causa: 'Calor de menos para a espessura: avanço rápido ou corrente baixa. O metal "colou" sem fundir a chapa.', corrigir: 'Avance mais devagar ou suba a corrente para a faixa sugerida.' },
  'fusao-fraca': { nome: 'Fusão fraca', causa: 'Calor no limite de baixo: o cordão fica alto e mal ligado às bordas.', corrigir: 'Reduza um pouco a velocidade de avanço.' },
  'excesso-de-calor': { nome: 'Calor em excesso', causa: 'Avanço muito lento ou corrente alta: cordão largo, mordedura e deformação.', corrigir: 'Avance mais rápido ou baixe a corrente.' },
  'perfuracao': { nome: 'Perfuração prevista', causa: 'Calor demais numa borda fina ou raiz aberta: o metal atravessa a chapa.', corrigir: 'Avance mais rápido, encurte o arco e baixe a corrente.' },
  'mordedura': { nome: 'Mordedura', causa: 'Arco longo ou calor demais cavam a borda da chapa ao lado do cordão.', corrigir: 'Mantenha o arco perto do diâmetro da alma e não demore no mesmo ponto.' },
  'sobreposicao': { nome: 'Sobreposição', causa: 'Metal frio e lento rolou sobre a chapa sem fundir a borda.', corrigir: 'Aumente o calor do passe: mais corrente ou avanço constante, sem parar.' },
  'porosidade': { nome: 'Porosidade', causa: 'Arco longo deixa ar entrar na poça; abrir o arco a frio e seguir em frente também deixa poros no começo.', corrigir: 'Arco curto. Na abertura, abra um pouco à frente e volte por cima do início.' },
  'cratera': { nome: 'Cratera não preenchida', causa: 'O arco apagou de uma vez no fim do passe, deixando um buraco.', corrigir: 'No fim, pare a ponta um instante sobre a poça antes de afastar.' },
  'inclusao-de-escoria': { nome: 'Inclusão de escória (prevista)', causa: 'Soldou por cima de escória fria que não foi limpa.', corrigir: 'Entre um passe e outro, quebre a escória com o martelinho e escove.' },
  'respingos': { nome: 'Respingos em excesso', causa: 'Arco longo espalha gotas de metal ao redor do cordão.', corrigir: 'Encurte o arco.' },
  'abertura-fora': { nome: 'Abertura de arco fora da junta', causa: 'O arco foi aberto na chapa, longe de onde o cordão passa: deixa marca e endurece o local.', corrigir: 'Abra o arco dentro da junta, à frente do início, e volte.' },
  'grudou': { nome: 'Eletrodo grudado', causa: 'A ponta foi empurrada contra a poça ou a corrente estava baixa.', corrigir: 'Não force a ponta para baixo depois de abrir; confira a corrente.' },
  'geometria-baixa': { nome: 'Cordão abaixo do especificado', causa: 'Pouco metal no trecho: avanço rápido demais ou chanfro não preenchido.', corrigir: 'Avance mais devagar ou faça mais um passe.' },
  'geometria-alta': { nome: 'Cordão acima do especificado', causa: 'Metal demais: avanço lento ou passes em excesso.', corrigir: 'Avance mais rápido ou faça menos passes.' },
  'largura-irregular': { nome: 'Largura irregular', causa: 'O ritmo de avanço variou ao longo do passe.', corrigir: 'Mantenha a mão num ritmo constante; olhe a poça, não a ponta.' },
  'escoria': { nome: 'Escória não removida', causa: 'A inspeção visual precisa da superfície limpa.', corrigir: 'Quebre com o martelinho e escove os resíduos.' },
}

export interface DefeitoEncontrado {
  tipo: TipoDefeitoEletrodo
  nome: string
  inicioMm: number
  fimMm: number
  /** Quantas vezes (poros, aberturas, crateras) ou 1 para trechos. */
  quantidade: number
  causa: string
  corrigir: string
  /** Este defeito reprova a peça. */
  reprova: boolean
}

export interface CategoriaNota { id: keyof typeof PESOS; nome: string; pontos: number; maximo: number; detalhe: string }

export interface ResultadoEletrodo {
  versao: string
  nota: number
  conceito: 'A' | 'B' | 'C' | 'D'
  aprovado: boolean
  categorias: CategoriaNota[]
  defeitos: DefeitoEncontrado[]
  medidas: {
    coberturaPct: number
    larguraMediaMm: number
    variacaoLarguraPct: number
    /** Reforço, perna ou enchimento médio, conforme a peça. */
    geometriaMedia: number
    geometriaUnidade: string
    aporteMedioKJmm: number
    aporteAlvoKJmm: number
    passes: number
    escoriaRestanteMm2: number
  }
}

const lim01 = (v: number) => Math.max(0, Math.min(1, v))

/** Valor da medida da peça numa seção (reforço mm, menor perna mm ou enchimento). */
function medidaDaSecao(p: PecaEletrodo, s: ReturnType<Cordao['secao']>): number {
  if (p.medida.tipo === 'perna') return s.pernasMm ? Math.min(s.pernasMm[0], s.pernasMm[1]) : 0
  if (p.medida.tipo === 'enchimento') return s.enchimento ?? 0
  return s.alturaMm
}

/** A seção atende à medida da peça? */
function medidaOk(p: PecaEletrodo, s: ReturnType<Cordao['secao']>): -1 | 0 | 1 {
  const v = medidaDaSecao(p, s)
  if (p.medida.tipo === 'enchimento') return v < p.medida.min ? -1 : s.alturaMm > p.medida.max ? 1 : 0
  return v < p.medida.min ? -1 : v > p.medida.max ? 1 : 0
}

export function inspecionarEletrodo(peca: PecaEletrodo, cordao: Cordao, reg: RegistroPasse, analise: AnaliseEletrodo, escoria: Escoria15): ResultadoEletrodo {
  const passo = cordao.passoMm
  const i0 = cordao.indiceEm(peca.inicioMm), i1 = cordao.indiceEm(peca.fimMm)
  const total = i1 - i0 + 1
  const a = analise.defeitos
  const defeitos: DefeitoEncontrado[] = []
  const add = (tipo: TipoDefeitoEletrodo, inicioMm: number, fimMm: number, quantidade = 1, reprova = false) =>
    defeitos.push({ tipo, ...TEXTO[tipo], inicioMm, fimMm, quantidade, reprova })
  /** Junta trechos contínuos de fatias que cumprem `cond` (com tolerância de 1 mm de buraco). */
  const trechos = (cond: (i: number) => boolean, minimoMm = 1) => {
    const lista: [number, number][] = []
    let ini = -1, ultimo = -1
    for (let i = i0; i <= i1 + 1; i++) {
      const v = i <= i1 && cond(i)
      if (v) { if (ini < 0) ini = i; ultimo = i }
      else if (ini >= 0 && (i - ultimo) * passo > 1) {
        if ((ultimo - ini + 1) * passo >= minimoMm) lista.push([ini * passo, (ultimo + 1) * passo])
        ini = -1
      }
    }
    if (ini >= 0 && (ultimo - ini + 1) * passo >= minimoMm) lista.push([ini * passo, (ultimo + 1) * passo])
    return lista
  }
  const mmDe = (l: [number, number][]) => l.reduce((t, [x, y]) => t + y - x, 0)
  const secoes = Array.from({ length: cordao.nPosicoes }, (_, i) => cordao.secao(i))
  const tem = (i: number) => secoes[i].larguraMm >= 2

  // 1. Continuidade.
  let cobertas = 0
  for (let i = i0; i <= i1; i++) if (tem(i)) cobertas++
  const cobertura = cobertas / total
  for (const [x, y] of trechos((i) => !tem(i), 2)) add('interrompido', x, y)
  const crateras = trechos((i) => a.cratera[i] > 0.3, 0.5)
  for (const [x, y] of crateras) add('cratera', x, y)
  const ptsContinuidade = PESOS.continuidade * lim01((cobertura - 0.5) / 0.5) - 3 * crateras.length

  // 2. Geometria: medida da peça e regularidade da largura.
  let dentro = 0, soma = 0, nGeo = 0
  const larguras: number[] = []
  for (let i = i0; i <= i1; i++) {
    if (!tem(i)) continue
    const s = secoes[i]
    larguras.push(s.larguraMm)
    soma += medidaDaSecao(peca, s); nGeo++
    if (medidaOk(peca, s) === 0) dentro++
  }
  const baixa = trechos((i) => tem(i) && medidaOk(peca, secoes[i]) === -1, 3)
  const reprovaBaixa = peca.medida.tipo !== 'reforco' && mmDe(baixa) >= REPROVA.faltaGeometriaMm
  for (const [x, y] of baixa) add('geometria-baixa', x, y, 1, reprovaBaixa)
  for (const [x, y] of trechos((i) => tem(i) && medidaOk(peca, secoes[i]) === 1, 3)) add('geometria-alta', x, y)
  const media = larguras.length ? larguras.reduce((t, v) => t + v, 0) / larguras.length : 0
  const desvio = larguras.length ? Math.sqrt(larguras.reduce((t, v) => t + (v - media) ** 2, 0) / larguras.length) : 0
  const variacao = media > 0 ? desvio / media : 0
  if (variacao > 0.18) add('largura-irregular', peca.inicioMm, peca.fimMm)
  const fracGeo = dentro / total
  const ptsGeometria = 17 * fracGeo + 8 * (larguras.length ? lim01(1 - (variacao - 0.08) / 0.2) : 0)

  // 3. Fusão pelo calor de cada passe (H74).
  let fusaoBoa = 0, somaAporte = 0, nAporte = 0
  const passes: number[] = []
  const juntaFina = peca.junta === 'canto' || (peca.junta === 'v' && peca.aberturaMm > 0)
  for (let i = i0; i <= i1; i++) {
    if (!tem(i)) continue
    // A fatia está fundida se algum passe deu calor bastante; um retoque rápido por cima não desfaz a fusão.
    const fmax = analise.fusaoMax[i]
    const p = reg.aportePorPasse(i)
    somaAporte += p.max; nAporte++
    passes.push(p.passes)
    const ok = (f: number) => f >= LIMITES.fusaoFracaAbaixo && f <= LIMITES.fusaoExcessoAcima ? 1 : f >= LIMITES.fusaoFaltaAbaixo && f <= LIMITES.fusaoExcessoAcima + 0.4 ? 0.5 : 0
    fusaoBoa += ok(fmax)
  }
  const falta = trechos((i) => tem(i) && analise.fusaoMax[i] < LIMITES.fusaoFaltaAbaixo, 2)
  for (const [x, y] of falta) add('falta-de-fusao', x, y, 1, mmDe(falta) >= REPROVA.faltaDeFusaoMm)
  for (const [x, y] of trechos((i) => tem(i) && analise.fusaoMax[i] >= LIMITES.fusaoFaltaAbaixo && analise.fusaoMax[i] < LIMITES.fusaoFracaAbaixo, 3)) add('fusao-fraca', x, y)
  // Só o primeiro passe fura: os de enchimento já têm a raiz por baixo (no canto, a quina sempre está exposta).
  const furaEm = (i: number) => peca.junta === 'v' ? analise.fusaoPrimeiro[i] : analise.fusaoMax[i]
  const furos = juntaFina ? trechos((i) => furaEm(i) > LIMITES.perfuracaoAcima, 1) : []
  for (const [x, y] of furos) add('perfuracao', x, y, 1, mmDe(furos) >= REPROVA.perfuracaoMm)
  for (const [x, y] of trechos((i) => tem(i) && analise.fusaoMax[i] > LIMITES.fusaoExcessoAcima && !(juntaFina && furaEm(i) > LIMITES.perfuracaoAcima), 5)) add('excesso-de-calor', x, y)
  const ptsFusao = PESOS.fusao * (fusaoBoa / total)

  // 4. Defeitos de superfície.
  let perda = 0
  const morde = trechos((i) => Math.max(a.mordeduraMenos[i], a.mordeduraMais[i]) > LIMITES.mordeduraLimiteMm, 1)
  for (const [x, y] of morde) add('mordedura', x, y)
  perda += Math.min(6, mmDe(morde) / 5)
  const sobre = trechos((i) => tem(i) && Math.max(a.sobreposicaoMenos[i], a.sobreposicaoMais[i]) > 0.35, 2)
  for (const [x, y] of sobre) add('sobreposicao', x, y, 1, mmDe(sobre) >= REPROVA.sobreposicaoMm)
  perda += Math.min(5, mmDe(sobre) / 5)
  const porosNoTrecho = a.poros.filter((p) => p.superficie && p.xMm >= peca.inicioMm && p.xMm <= peca.fimMm)
  if (porosNoTrecho.length) {
    const xs = porosNoTrecho.map((p) => p.xMm)
    add('porosidade', Math.min(...xs), Math.max(...xs), porosNoTrecho.length, porosNoTrecho.length >= REPROVA.porosAbertos)
  }
  perda += Math.min(6, 2 * porosNoTrecho.length)
  const inclusoes = trechos((i) => analise.inclusao[i] > LIMITES.inclusaoMinimaMm3, 0.5)
  for (const [x, y] of inclusoes) add('inclusao-de-escoria', x, y, 1, mmDe(inclusoes) >= REPROVA.inclusaoMm)
  perda += Math.min(8, 4 * inclusoes.length)
  const respingos = a.respingos.filter((r) => r.raioMm < 0.8 && r.xMm >= peca.inicioMm - 5 && r.xMm <= peca.fimMm + 5).length
  const por10 = cobertas ? respingos / (cobertas * passo) * 10 : 0
  if (por10 > 2) add('respingos', peca.inicioMm, peca.fimMm, respingos)
  perda += Math.min(3, Math.max(0, por10 - 2))
  const fora = reg.aberturas.filter((ab) => !ab.aQuente && (Math.abs(ab.yMm) > 6 || ab.xMm < peca.inicioMm - 4 || ab.xMm > peca.fimMm + 4))
  for (const ab of fora) add('abertura-fora', ab.xMm, ab.xMm)
  perda += 2 * fora.length
  if (reg.grudadas.length) add('grudou', Math.min(...reg.grudadas.map((g) => g.xMm)), Math.max(...reg.grudadas.map((g) => g.xMm)), reg.grudadas.length)
  perda += reg.grudadas.length
  // Sem cordão não há superfície para elogiar: os pontos crescem com o trecho soldado.
  const ptsSuperficie = Math.max(0, PESOS.superficie * lim01(cobertura / REPROVA.coberturaMinima) - perda)

  // 5. Limpeza: a inspeção visual é feita com a superfície limpa.
  const restante = escoria.areaMm2 + escoria.residuos * 9
  let depositada = 0
  for (let i = 0; i < reg.nPosicoes; i++) depositada += reg.tempoS[i]
  const ptsLimpeza = depositada > 0 ? PESOS.limpeza * lim01(1 - restante / Math.max(40, cobertas * passo * 6)) : 0
  if (restante > 5) add('escoria', peca.inicioMm, peca.fimMm)

  const categorias: CategoriaNota[] = [
    { id: 'continuidade', nome: 'Continuidade', pontos: ptsContinuidade, maximo: PESOS.continuidade, detalhe: `${Math.round(cobertura * 100)}% do trecho com cordão; ${crateras.length} cratera(s)` },
    { id: 'geometria', nome: peca.medida.tipo === 'perna' ? 'Perna do filete' : peca.medida.tipo === 'enchimento' ? 'Enchimento do chanfro' : 'Reforço e largura', pontos: ptsGeometria, maximo: PESOS.geometria, detalhe: `${Math.round(fracGeo * 100)}% do trecho na faixa; largura varia ${Math.round(variacao * 100)}%` },
    { id: 'fusao', nome: 'Fusão (calor)', pontos: ptsFusao, maximo: PESOS.fusao, detalhe: `aporte médio ${(nAporte ? somaAporte / nAporte : 0).toFixed(2).replace('.', ',')} kJ/mm (referência ${analise.aporteAlvoKJmm.toFixed(2).replace('.', ',')})` },
    { id: 'superficie', nome: 'Defeitos de superfície', pontos: ptsSuperficie, maximo: PESOS.superficie, detalhe: `${defeitos.filter((d) => ['mordedura', 'sobreposicao', 'porosidade', 'inclusao-de-escoria', 'respingos', 'abertura-fora', 'grudou'].includes(d.tipo)).length} ocorrência(s)` },
    { id: 'limpeza', nome: 'Limpeza da escória', pontos: ptsLimpeza, maximo: PESOS.limpeza, detalhe: restante > 5 ? `${Math.round(restante)} mm² de escória ou resíduo` : 'superfície limpa' },
  ].map((c) => ({ ...c, pontos: Math.max(0, Math.min(c.maximo, Math.round(c.pontos))) })) as CategoriaNota[]
  const nota = categorias.reduce((t, c) => t + c.pontos, 0)
  const reprovada = cobertura < REPROVA.coberturaMinima || defeitos.some((d) => d.reprova)
  defeitos.sort((x, y) => Number(y.reprova) - Number(x.reprova) || x.inicioMm - y.inicioMm)
  const unidade = peca.medida.tipo === 'enchimento' ? '× chanfro' : 'mm'
  return {
    versao: VERSAO_NOTA_ELETRODO,
    nota,
    conceito: nota >= 90 ? 'A' : nota >= 75 ? 'B' : nota >= 60 ? 'C' : 'D',
    aprovado: !reprovada && nota >= 70,
    categorias,
    defeitos,
    medidas: {
      coberturaPct: cobertura * 100,
      larguraMediaMm: media,
      variacaoLarguraPct: variacao * 100,
      geometriaMedia: nGeo ? soma / nGeo : 0,
      geometriaUnidade: unidade,
      aporteMedioKJmm: nAporte ? somaAporte / nAporte : 0,
      aporteAlvoKJmm: analise.aporteAlvoKJmm,
      passes: passes.length ? passes.sort((x, y) => x - y)[Math.floor(passes.length / 2)] : 0,
      escoriaRestanteMm2: restante,
    },
  }
}
