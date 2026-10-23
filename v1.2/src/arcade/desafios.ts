import type { FormatoJunta } from '../modelo/junta'
import { buscarMissao, contextoDaMissao, MISSOES, requisitosEfetivos, type Dificuldade, type Missao, type Preparo } from '../missoes/catalogo'
import { AJUSTES } from '../modelo/parametros'
import { areaParaLargura, INFO_JUNTA } from '../modelo/juntas'
import { equilibrioArco, razaoEfetiva, taxaDeposicao, type Ajustes, type Tecnica } from '../modelo/processo'
import type { ResultadoPontuacao } from '../pontuacao/regras'

/*
 * Arcade: sequência de desafios aleatórios com vidas e combo.
 * Cada desafio é uma missão do catálogo + uma dificuldade + uma CONDIÇÃO
 * extra. As condições só usam o que o modelo já mede (ajustes, técnica,
 * aberturas de arco, tempo de arco). Funções puras: testáveis sem tela.
 */

export const VERSAO_ARCADE = 'arcade-v1'
export const VIDAS_INICIAIS = 3

export type Condicao =
  | { tipo: 'livre' }
  | { tipo: 'maquina-ajustada'; ajustes: Ajustes; preparo: Partial<Preparo> }
  | { tipo: 'arco-unico' }
  | { tipo: 'tecnica'; tecnica: Tecnica }
  | { tipo: 'tempo-arco'; maximoS: number }

export interface Desafio {
  numero: number
  missaoId: string
  dificuldade: Dificuldade
  condicao: Condicao
  /** Só em partidas antigas (traçado sorteado, H41); a junta agora vem da missão (H46). */
  formato?: FormatoJunta
}

export function descreverCondicao(c: Condicao): { titulo: string; texto: string } {
  switch (c.tipo) {
    case 'livre':
      return { titulo: 'Solda livre', texto: 'Só a missão: seja aprovado.' }
    case 'maquina-ajustada':
      return {
        titulo: 'Máquina pré-ajustada',
        texto: `Tensão ${c.ajustes.tensao.toLocaleString('pt-BR')} e alimentação ${c.ajustes.alimentacao.toLocaleString('pt-BR')} travadas: acerte a velocidade com a mão.`,
      }
    case 'arco-unico':
      return { titulo: 'Arco único', texto: 'Solde o trecho inteiro sem fechar o arco: só uma abertura vale.' }
    case 'tecnica':
      return { titulo: `Técnica obrigatória: ${c.tecnica}`, texto: `A tocha fica travada ${c.tecnica}. Compense com os ajustes.` }
    case 'tempo-arco':
      return { titulo: 'Contra o relógio', texto: `No máximo ${c.maximoS.toLocaleString('pt-BR')} s de arco aberto, somando tudo.` }
  }
}

/**
 * Ajuste "de fábrica" plausível para a missão: tensão no equilíbrio do jogo e
 * alimentação que dá a largura do meio do desenho na velocidade típica da
 * junta (12 mm/s no topo; o V cheio pede andar mais devagar, H46).
 * Garante que a condição "máquina pré-ajustada" tenha solução.
 */
export function ajustePreDefinido(m: Missao, d: Dificuldade): { ajustes: Ajustes; preparo: Partial<Preparo> } {
  const req = requisitosEfetivos(m, d)
  const preparo: Preparo = { diametroArameMm: m.consumiveis.diametrosMm[m.consumiveis.diametrosMm.length - 1], gas: m.consumiveis.gases[0], oxidoRemovido: true, tecnica: 'neutra' }
  const ctx = contextoDaMissao(m, preparo)
  const larguraAlvo = (req.larguraMinMm + req.larguraMaxMm) / 2
  const vAlvo = INFO_JUNTA[m.geometria.junta].velocidadeReferenciaMms
  let melhor: Ajustes = { alimentacao: 5, tensao: 5.5 }
  let erro = Infinity
  for (let w = AJUSTES.minimo; w <= AJUSTES.maximo; w += AJUSTES.passo) {
    const tensao = Math.min(AJUSTES.maximo, Math.max(AJUSTES.minimo, Math.round(equilibrioArco({ alimentacao: w, tensao: 5 }, ctx).tensaoEquilibrio * 2) / 2))
    const a = { alimentacao: w, tensao }
    const area = areaParaLargura(m.geometria.junta, ctx, larguraAlvo, razaoEfetiva(a, ctx))
    const v = taxaDeposicao(a, ctx) / area
    if (Math.abs(v - vAlvo) < erro) {
      erro = Math.abs(v - vAlvo)
      melhor = a
    }
  }
  // A limpeza do óxido continua sendo escolha do jogador.
  return { ajustes: melhor, preparo: { diametroArameMm: preparo.diametroArameMm, gas: preparo.gas } }
}

/**
 * Gera o desafio número n (1, 2, ...). Os dois primeiros são de aquecimento.
 * O material nunca se repete em dois desafios seguidos.
 */
export function gerarDesafio(numero: number, aleatorio: () => number, anterior?: Desafio): Desafio {
  const sortear = <T>(lista: readonly T[]): T => lista[Math.min(lista.length - 1, Math.floor(aleatorio() * lista.length))]
  const materialAnterior = anterior ? buscarMissao(anterior.missaoId)?.material : undefined
  const candidatas = MISSOES.filter((m) => m.material !== materialAnterior)
  const missao = sortear(candidatas.length ? candidatas : MISSOES)
  const chanceProfissional = Math.min(0.75, Math.max(0, (numero - 2) * 0.15))
  const dificuldade: Dificuldade = aleatorio() < chanceProfissional ? 'profissional' : 'aprendiz'
  let condicao: Condicao = { tipo: 'livre' }
  if (numero > 2) {
    const tipo = sortear(['livre', 'maquina-ajustada', 'arco-unico', 'tecnica', 'tempo-arco'] as const)
    if (tipo === 'maquina-ajustada') condicao = { tipo, ...ajustePreDefinido(missao, dificuldade) }
    else if (tipo === 'arco-unico') condicao = { tipo }
    else if (tipo === 'tecnica') condicao = { tipo, tecnica: sortear(['empurrando', 'puxando'] as const) }
    else if (tipo === 'tempo-arco') {
      // Exige média de uns 3/4 da velocidade típica da junta (com 5 mm de folga em cada ponta).
      const comprimento = missao.trecho.fimMm - missao.trecho.inicioMm + 10
      condicao = { tipo, maximoS: Math.ceil(comprimento / (0.75 * INFO_JUNTA[missao.geometria.junta].velocidadeReferenciaMms)) }
    }
  }
  // A junta (e a posição em que a peça chega) vem da missão sorteada (H46, H47).
  return { numero, missaoId: missao.id, dificuldade, condicao }
}

export interface DadosExecucao {
  aberturasDeArco: number
  tempoArcoS: number
  tecnica: Tecnica
  ajustes: Ajustes
}

export interface ResultadoDesafio {
  concluido: boolean
  /** Motivo de falha (vazio se concluído). */
  motivo: string
  pontos: number
  multiplicador: number
}

/** Combo: cada desafio concluído em sequência soma 0,25 ao multiplicador (até ×2). */
export function multiplicador(combo: number): number {
  return Math.min(2, 1 + 0.25 * combo)
}

export function avaliarDesafio(d: Desafio, r: ResultadoPontuacao, e: DadosExecucao, combo: number): ResultadoDesafio {
  let motivo = ''
  if (!r.aprovada) motivo = 'A solda não foi aprovada (condição essencial da missão).'
  else if (d.condicao.tipo === 'arco-unico' && e.aberturasDeArco > 1) motivo = `O arco foi aberto ${e.aberturasDeArco} vezes.`
  else if (d.condicao.tipo === 'tempo-arco' && e.tempoArcoS > d.condicao.maximoS) motivo = `Tempo de arco de ${e.tempoArcoS.toFixed(1).replace('.', ',')} s, acima de ${d.condicao.maximoS} s.`
  else if (d.condicao.tipo === 'tecnica' && e.tecnica !== d.condicao.tecnica) motivo = 'A técnica exigida não foi usada.'
  else if (
    d.condicao.tipo === 'maquina-ajustada' &&
    (e.ajustes.alimentacao !== d.condicao.ajustes.alimentacao || e.ajustes.tensao !== d.condicao.ajustes.tensao)
  ) motivo = 'Os ajustes travados foram alterados.'
  const concluido = motivo === ''
  const m = multiplicador(combo)
  return { concluido, motivo, multiplicador: m, pontos: concluido ? Math.round(r.total * m) : 0 }
}

/** Missão do desafio (sempre existe: só sorteamos do catálogo). */
export function missaoDoDesafio(d: Desafio): Missao {
  return buscarMissao(d.missaoId)!
}
