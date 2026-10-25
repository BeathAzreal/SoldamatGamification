/*
 * █ Quando usar a explicação por contexto
 *
 * O que faz: Decide se a explicação simples (cordão sobre chapa) vale ou se é
 *    preciso a explicação por contexto.
 */

import type { Tentativa } from '../simulacao-mig/medidas-do-cordao'

/** A decomposição antiga só vale para o cordão de referência sobre chapa. */
export function exigeExplicacaoContextual(t: Tentativa): boolean {
  const c = t.contexto
  return !!c && (c.aberturaMm > 0 || (c.junta ?? 'topo') !== 'topo' ||
    c.material !== 'aco-carbono' || c.diametroArameMm !== 1 || c.gas !== 'ar-co2' ||
    (c.tecnica ?? 'neutra') !== 'neutra' || (c.movimento ?? 'reto') !== 'reto' ||
    (c.dbcpMm ?? 15) !== 15 || !!c.posicaoInicial?.rolagemGraus || !!c.posicaoInicial?.giroGraus)
}
