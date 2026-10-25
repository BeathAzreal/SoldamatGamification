/*
 * █ Pontuar uma tentativa
 *
 * O que faz: Refaz a tentativa a partir do registro salvo e só então dá a
 *    nota, para que nota e replay usem os mesmos dados.
 */

import { descompactar, type EventosCompactos } from '../salvamento/registro-compacto'
import type { Dificuldade, Missao } from '../missoes/lista-de-missoes'
import type { ContextoProcesso } from '../simulacao-mig/regulagem-da-maquina'
import { reproduzir } from '../simulacao-mig/reproduzir-tentativa'
import type { Simulacao } from '../simulacao-mig/simulacao'
import { pontuar, PESOS_PADRAO, type Pesos, type ResultadoPontuacao } from './regras-de-pontuacao'
import { relatorioTecnico, type RelatorioTecnico } from './relatorio-da-nota'

/**
 * Pontuação OFICIAL: reproduz a tentativa a partir do registro salvo e só
 * então pontua. Assim a nota, o replay do professor e a inspeção usam
 * exatamente os mesmos dados.
 */
export function pontuarRegistro(
  missao: Missao,
  dificuldade: Dificuldade,
  contexto: ContextoProcesso,
  eventos: EventosCompactos,
  pesos: Pesos = PESOS_PADRAO,
): { sim: Simulacao; resultado: ResultadoPontuacao } {
  const sim = reproduzir(contexto, descompactar(eventos))
  const resultado = pontuar(
    {
      missao,
      dificuldade,
      contexto,
      cordao: sim.cordao,
      percurso: sim.percurso,
      tempoArcoMs: sim.tempoDeArcoMs,
      // v3: reinícios de arco contam na Execução.
      aberturasDeArco: sim.eventos.filter((ev) => ev.tipo === 'inicio').length,
      // v6: crateras nos fins de passe.
      eventos: sim.eventos,
    },
    pesos,
  )
  return { sim, resultado }
}

/**
 * O mesmo que pontuarRegistro, mais o relatório técnico estruturado
 * (relatorio-da-nota.ts) para a didática. Mesmo registro → mesma nota e mesmo relatório.
 */
export function relatorioDoRegistro(
  missao: Missao,
  dificuldade: Dificuldade,
  contexto: ContextoProcesso,
  eventos: EventosCompactos,
  pesos: Pesos = PESOS_PADRAO,
): { sim: Simulacao; resultado: ResultadoPontuacao; relatorio: RelatorioTecnico } {
  const { sim, resultado } = pontuarRegistro(missao, dificuldade, contexto, eventos, pesos)
  const relatorio = relatorioTecnico({ missao, dificuldade, contexto, cordao: sim.cordao, percurso: sim.percurso, eventos: sim.eventos, tempoArcoMs: sim.tempoDeArcoMs, resultado })
  return { sim, resultado, relatorio }
}
