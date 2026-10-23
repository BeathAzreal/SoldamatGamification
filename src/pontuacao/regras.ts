import type { Cordao } from '../modelo/cordao'
import { analisarFusao, DESCRICAO_ESTADO, indiceDeformacao, type EstadoFusao, type PontoFusao } from '../modelo/fusao'
import { GASES, MATERIAIS } from '../modelo/material'
import type { Percurso } from '../modelo/percurso'
import type { ContextoProcesso } from '../modelo/processo'
import { requisitosEfetivos, type Dificuldade, type Missao } from '../missoes/catalogo'

/*
 * Pontuação automática — regras da versão pontuacao-v2 (docs/PONTUACAO.md).
 * Só usa grandezas do modelo; nada é medido pela imagem.
 *
 * v2 (Alpha v1.3): a largura passa a ser medida só onde há cordão (um trecho
 * sem cordão já perde em Integridade, Extensão e E3), e o modelo da corrente
 * mudou (H28 revista, H48): o mesmo registro pode dar outra nota que na v1.
 */

export const VERSAO_PONTUACAO = 'pontuacao-v2'

export type CategoriaId = 'integridade' | 'desenho' | 'regularidade' | 'deformacao' | 'eficiencia'
export type Pesos = Record<CategoriaId, number>

export const CATEGORIAS: CategoriaId[] = ['integridade', 'desenho', 'regularidade', 'deformacao', 'eficiencia']
export const NOME_CATEGORIA: Record<CategoriaId, string> = {
  integridade: 'Integridade prevista pelo modelo',
  desenho: 'Atendimento ao desenho',
  regularidade: 'Regularidade do cordão',
  deformacao: 'Controle de deformação',
  eficiencia: 'Eficiência',
}
export const PESOS_PADRAO: Pesos = { integridade: 40, desenho: 25, regularidade: 15, deformacao: 10, eficiencia: 10 }

/** Texto fixo de cada categoria (definição, dados, regra, limitações). */
export const FICHA_CATEGORIA: Record<CategoriaId, { definicao: string; dados: string; regra: string; limitacoes: string }> = {
  integridade: {
    definicao: 'Fração do trecho avaliado em que o modelo prevê junta íntegra.',
    dados: 'Largura, centro e seção do cordão; aporte relativo, aquecimento acumulado, espessura, material, gás e limpeza.',
    regra: 'Posição íntegra = há cordão, ele cobre as duas bordas e o índice de fusão sintético está entre 1 e 2. Pontos = peso × fração íntegra.',
    limitacoes: 'Índice sintético do modelo. Não representa porosidade, trincas, inclusões nem penetração real.',
  },
  desenho: {
    definicao: 'Quanto o cordão obedece às medidas e tolerâncias do desenho da missão.',
    dados: 'Extensão, largura, altura (reforço) e centro do cordão.',
    regra: 'Extensão 7/25, largura 8/25, reforço 5/25 e alinhamento 5/25, cada parte pela fração atendida.',
    limitacoes: 'Tolerâncias são objetivos didáticos do jogo, não requisitos de norma.',
  },
  regularidade: {
    definicao: 'Constância da largura ao longo do trecho avaliado.',
    dados: 'Coeficiente de variação da largura (desvio-padrão ÷ média).',
    regra: 'Pontos = peso × (0,20 − variação) ÷ 0,17, entre 0 e o peso.',
    limitacoes: 'Oscilações menores que uns 2 mm são alisadas pelo modelo.',
  },
  deformacao: {
    definicao: 'Calor colocado além do necessário, ponderado pela tendência do material a deformar.',
    dados: 'Índice de deformação D (aporte médio ÷ aporte necessário × fator do material).',
    regra: 'Pontos = peso × (2 − D), entre 0 e o peso.',
    limitacoes: 'É um índice; não há medida de empenamento.',
  },
  eficiencia: {
    definicao: 'Aproveitamento do metal e do tempo de arco.',
    dados: 'Rendimento de deposição do gás e fração do tempo de arco sobre a junta, no trecho do desenho.',
    regra: 'Metade: (rendimento − 0,85) ÷ 0,15. Metade: (fração de tempo − 0,70) ÷ 0,30. Cada metade entre 0 e 1.',
    limitacoes: 'O rendimento é uma aproximação por gás.',
  },
}

export interface ResultadoCategoria {
  id: CategoriaId
  nome: string
  pontos: number
  maximo: number
  explicacao: string
  detalhes: { rotulo: string; valor: string }[]
}

export interface CondicaoEssencial {
  id: 'E1' | 'E2' | 'E3' | 'E4'
  descricao: string
  cumprida: boolean
  justificativa: string
}

export interface Penalidade {
  descricao: string
  pontos: number
  justificativa: string
}

export interface TrechoProblema {
  inicioMm: number
  fimMm: number
  estado: EstadoFusao
  descricao: string
}

export interface ResultadoPontuacao {
  versao: string
  pesos: Pesos
  total: number
  aprovada: boolean
  categorias: ResultadoCategoria[]
  essenciais: CondicaoEssencial[]
  penalidades: Penalidade[]
  problemas: TrechoProblema[]
  /** Medidas usadas, para mostrar e para desempates. */
  medidas: {
    fracaoIntegra: number
    larguraMediaMm: number
    alturaMediaMm: number
    cvLargura: number
    deformacao: number
    rendimento: number
    fracaoTempoUtil: number
  }
}

export interface EntradaPontuacao {
  missao: Missao
  dificuldade: Dificuldade
  contexto: ContextoProcesso
  cordao: Cordao
  percurso: Percurso
  tempoArcoMs: number
}

const limitar = (v: number) => Math.min(1, Math.max(0, v))
const arred = (v: number) => Math.round(v * 10) / 10
const fmt1 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtPct = (v: number) => v.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 0 })

export function validarPesos(p: Pesos): string[] {
  const erros: string[] = []
  for (const c of CATEGORIAS) {
    if (!Number.isFinite(p[c]) || p[c] < 0 || p[c] > 100) erros.push(`Peso de "${NOME_CATEGORIA[c]}" deve estar entre 0 e 100.`)
  }
  const soma = CATEGORIAS.reduce((s, c) => s + (p[c] || 0), 0)
  if (Math.abs(soma - 100) > 1e-9) erros.push(`Os pesos devem somar 100 (agora somam ${soma}).`)
  return erros
}

/** Maior sequência contínua (mm) de posições que satisfazem o critério. */
function maiorSequencia(pontos: PontoFusao[], criterio: (p: PontoFusao) => boolean, passoMm: number): number {
  let maior = 0
  let atual = 0
  for (const p of pontos) {
    atual = criterio(p) ? atual + 1 : 0
    maior = Math.max(maior, atual)
  }
  return maior * passoMm
}

function agruparProblemas(pontos: PontoFusao[], passoMm: number): TrechoProblema[] {
  const trechos: TrechoProblema[] = []
  for (const p of pontos) {
    if (p.estado === 'adequada') continue
    const ultimo = trechos[trechos.length - 1]
    if (ultimo && ultimo.estado === p.estado && Math.abs(ultimo.fimMm - (p.xMm - passoMm / 2)) < 1e-6) {
      ultimo.fimMm = p.xMm + passoMm / 2
    } else {
      trechos.push({ inicioMm: p.xMm - passoMm / 2, fimMm: p.xMm + passoMm / 2, estado: p.estado, descricao: DESCRICAO_ESTADO[p.estado] })
    }
  }
  return trechos.filter((t) => t.fimMm - t.inicioMm >= 1)
}

export function pontuar(e: EntradaPontuacao, pesos: Pesos = PESOS_PADRAO): ResultadoPontuacao {
  const { missao, contexto, cordao } = e
  const req = requisitosEfetivos(missao, e.dificuldade)
  const passo = cordao.passoMm
  const { inicioMm: x0, fimMm: x1 } = missao.trecho
  const a0 = x0 + 2
  const a1 = x1 - 2

  const fusao = analisarFusao(cordao, e.percurso, contexto)
  const secoes = Array.from({ length: cordao.nPosicoes }, (_, i) => cordao.secao(i))
  const noTrecho = (x: number) => x >= x0 && x <= x1
  const avaliado = (x: number) => x >= a0 && x <= a1
  const fAvaliado = fusao.filter((p) => avaliado(p.xMm))
  const sAvaliado = secoes.filter((s) => avaliado(s.xMm))
  const comCordao = sAvaliado.filter((s) => s.larguraMm >= 1)
  const n = Math.max(1, fAvaliado.length)

  // Integridade.
  const fracaoIntegra = fAvaliado.filter((p) => p.estado === 'adequada').length / n
  const contagem = (estado: EstadoFusao) => fAvaliado.filter((p) => p.estado === estado).length / n

  // Desenho.
  const noTrechoSecoes = secoes.filter((s) => noTrecho(s.xMm))
  const extensao = noTrechoSecoes.filter((s) => s.larguraMm >= 1).length / Math.max(1, noTrechoSecoes.length)
  // Só onde há cordão: a falta de cordão já conta na extensão, na integridade e em E3.
  const largura = comCordao.length ? comCordao.filter((s) => s.larguraMm >= req.larguraMinMm && s.larguraMm <= req.larguraMaxMm).length / comCordao.length : 0
  const reforco = comCordao.length ? comCordao.filter((s) => s.alturaMm <= req.reforcoMaxMm).length / comCordao.length : 0
  const alinhamento = comCordao.length
    ? comCordao.filter((s) => Math.abs(s.yCentroMm) <= req.alinhamentoMm).length / comCordao.length
    : 0
  const fracaoDesenho = (7 * extensao + 8 * largura + 5 * reforco + 5 * alinhamento) / 25

  // Regularidade.
  const larguras = comCordao.map((s) => s.larguraMm)
  const media = larguras.length ? larguras.reduce((a, b) => a + b, 0) / larguras.length : 0
  const cv = larguras.length >= 10 ? Math.sqrt(larguras.reduce((s, w) => s + (w - media) ** 2, 0) / larguras.length) / media : 1
  const fracaoRegularidade = larguras.length >= 10 ? limitar((0.2 - cv) / 0.17) : 0
  const alturaMedia = comCordao.length ? comCordao.reduce((s, c) => s + c.alturaMm, 0) / comCordao.length : 0

  // Deformação.
  const deformacao = indiceDeformacao(fAvaliado, contexto)
  const fracaoDeformacao = fAvaliado.some((p) => p.estado !== 'sem-cordao') ? limitar(2 - deformacao) : 0

  // Eficiência.
  const rendimento = GASES[contexto.gas].rendimento
  const tempoUtil = e.tempoArcoMs > 0 ? e.percurso.pertoDaJuntaEntre(x0 - 5, x1 + 5) / e.tempoArcoMs : 0
  const fracaoEficiencia = 0.5 * limitar((rendimento - 0.85) / 0.15) + 0.5 * limitar((tempoUtil - 0.7) / 0.3)

  // Condições essenciais.
  const perfuracaoMm = maiorSequencia(fAvaliado, (p) => p.estado === 'perfuracao', passo)
  const semCordaoMm = maiorSequencia(fAvaliado, (p) => p.estado === 'sem-cordao', passo)
  const essenciais: CondicaoEssencial[] = [
    {
      id: 'E1',
      descricao: `Integridade prevista em pelo menos ${fmtPct(req.integridadeMinima)} do trecho avaliado`,
      cumprida: fracaoIntegra >= req.integridadeMinima,
      justificativa: `Integridade prevista em ${fmtPct(fracaoIntegra)} do trecho.`,
    },
    {
      id: 'E2',
      descricao: 'Nenhuma perfuração prevista',
      cumprida: perfuracaoMm < 1,
      justificativa: perfuracaoMm < 1 ? 'Sem perfuração prevista.' : `Perfuração prevista em até ${fmt1(perfuracaoMm)} mm contínuos.`,
    },
    {
      id: 'E3',
      descricao: 'Cordão contínuo no trecho exigido',
      cumprida: semCordaoMm < 1,
      justificativa: semCordaoMm < 1 ? 'Sem interrupções.' : `Trecho sem cordão de até ${fmt1(semCordaoMm)} mm.`,
    },
  ]
  if (MATERIAIS[contexto.material].exigeLimpeza) {
    essenciais.push({
      id: 'E4',
      descricao: 'Óxido removido antes de soldar',
      cumprida: contexto.oxidoRemovido,
      justificativa: contexto.oxidoRemovido ? 'Limpeza feita na preparação.' : 'A limpeza do óxido não foi feita na preparação.',
    })
  }
  const aprovada = essenciais.every((c) => c.cumprida)

  const pontos = (c: CategoriaId, fracao: number) => arred(pesos[c] * fracao)
  const categorias: ResultadoCategoria[] = [
    {
      id: 'integridade',
      nome: NOME_CATEGORIA.integridade,
      pontos: pontos('integridade', fracaoIntegra),
      maximo: pesos.integridade,
      explicacao:
        `Junta íntegra prevista em ${fmtPct(fracaoIntegra)} do trecho avaliado. ` +
        `Falta de fusão: ${fmtPct(contagem('falta'))}; fusão excessiva: ${fmtPct(contagem('excessiva'))}; ` +
        `perfuração: ${fmtPct(contagem('perfuracao'))}; borda descoberta: ${fmtPct(contagem('borda'))}; ` +
        `sem cordão: ${fmtPct(contagem('sem-cordao'))}. Resultado sintético do modelo.`,
      detalhes: [{ rotulo: 'Fração íntegra', valor: fmtPct(fracaoIntegra) }],
    },
    {
      id: 'desenho',
      nome: NOME_CATEGORIA.desenho,
      pontos: pontos('desenho', fracaoDesenho),
      maximo: pesos.desenho,
      explicacao:
        `Extensão ${fmtPct(extensao)}, largura entre ${fmt1(req.larguraMinMm)} e ${fmt1(req.larguraMaxMm)} mm em ${fmtPct(largura)}, ` +
        `reforço até ${fmt1(req.reforcoMaxMm)} mm em ${fmtPct(reforco)}, centro a até ${fmt1(req.alinhamentoMm)} mm da junta em ${fmtPct(alinhamento)}.`,
      detalhes: [
        { rotulo: 'Extensão', valor: fmtPct(extensao) },
        { rotulo: 'Largura na faixa', valor: fmtPct(largura) },
        { rotulo: 'Reforço no limite', valor: fmtPct(reforco) },
        { rotulo: 'Alinhamento', valor: fmtPct(alinhamento) },
      ],
    },
    {
      id: 'regularidade',
      nome: NOME_CATEGORIA.regularidade,
      pontos: pontos('regularidade', fracaoRegularidade),
      maximo: pesos.regularidade,
      explicacao:
        larguras.length >= 10
          ? `A largura variou ${fmtPct(cv)} (média ${fmt1(media)} mm). Até 3 % ganha tudo; 20 % ou mais, nada.`
          : 'Cordão curto demais para medir a regularidade.',
      detalhes: [{ rotulo: 'Variação da largura', valor: larguras.length >= 10 ? fmtPct(cv) : '—' }],
    },
    {
      id: 'deformacao',
      nome: NOME_CATEGORIA.deformacao,
      pontos: pontos('deformacao', fracaoDeformacao),
      maximo: pesos.deformacao,
      explicacao: `Índice de deformação ${fmt1(deformacao)} (até 1 sem perda; 2 ou mais perde tudo). ${MATERIAIS[contexto.material].nome}: fator ${fmt1(MATERIAIS[contexto.material].fatorDeformacao)}.`,
      detalhes: [{ rotulo: 'Índice D', valor: fmt1(deformacao) }],
    },
    {
      id: 'eficiencia',
      nome: NOME_CATEGORIA.eficiencia,
      pontos: pontos('eficiencia', fracaoEficiencia),
      maximo: pesos.eficiencia,
      explicacao: `Rendimento do metal ${fmtPct(rendimento)} (${GASES[contexto.gas].nome}); ${fmtPct(tempoUtil)} do tempo de arco sobre a junta, no trecho do desenho.`,
      detalhes: [
        { rotulo: 'Rendimento', valor: fmtPct(rendimento) },
        { rotulo: 'Tempo útil de arco', valor: fmtPct(tempoUtil) },
      ],
    },
  ]

  // Essencial descumprido: economia e rapidez não podem compensar (docs/PONTUACAO.md).
  const penalidades: Penalidade[] = []
  if (!aprovada) {
    for (const c of categorias.filter((c) => c.id === 'deformacao' || c.id === 'eficiencia')) {
      if (c.pontos > 0) {
        penalidades.push({
          descricao: `${c.nome} zerada`,
          pontos: -c.pontos,
          justificativa: 'Condição essencial descumprida: deformação e eficiência não compensam o requisito.',
        })
      }
      c.pontos = 0
    }
  }

  return {
    versao: VERSAO_PONTUACAO,
    pesos: { ...pesos },
    total: arred(categorias.reduce((s, c) => s + c.pontos, 0)),
    aprovada,
    categorias,
    essenciais,
    penalidades,
    problemas: agruparProblemas(fusao.filter((p) => noTrecho(p.xMm)), passo),
    medidas: {
      fracaoIntegra,
      larguraMediaMm: media,
      alturaMediaMm: alturaMedia,
      cvLargura: larguras.length >= 10 ? cv : NaN,
      deformacao,
      rendimento,
      fracaoTempoUtil: tempoUtil,
    },
  }
}

/** Notas de uma categoria, para desempates. */
export function notaCategoria(r: Pick<ResultadoPontuacao, 'categorias'>, id: CategoriaId): number {
  return r.categorias.find((c) => c.id === id)?.pontos ?? 0
}

export type CriterioDesempate = 'integridade-desenho' | 'desenho-integridade'

/**
 * Ordem: aprovada antes de não aprovada → total → (integridade, desenho) na
 * ordem escolhida. Negativo se `a` fica à frente de `b`.
 */
export function compararPontuacoes(
  a: Pick<ResultadoPontuacao, 'aprovada' | 'total' | 'categorias'>,
  b: Pick<ResultadoPontuacao, 'aprovada' | 'total' | 'categorias'>,
  criterio: CriterioDesempate = 'integridade-desenho',
): number {
  if (a.aprovada !== b.aprovada) return a.aprovada ? -1 : 1
  if (a.total !== b.total) return b.total - a.total
  const ordem: CategoriaId[] = criterio === 'integridade-desenho' ? ['integridade', 'desenho'] : ['desenho', 'integridade']
  for (const c of ordem) {
    const d = notaCategoria(b, c) - notaCategoria(a, c)
    if (d !== 0) return d
  }
  return 0
}

