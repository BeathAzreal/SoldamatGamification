import { descompactar, type EventosCompactos } from '../dados/eventos'
import type { Dificuldade, Missao } from '../missoes/catalogo'
import type { ContextoProcesso } from '../modelo/processo'
import { reproduzir } from '../modelo/replay'
import type { Simulacao } from '../modelo/simulacao'
import { pontuar, PESOS_PADRAO, type Pesos, type ResultadoPontuacao } from './regras'

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
    { missao, dificuldade, contexto, cordao: sim.cordao, percurso: sim.percurso, tempoArcoMs: sim.tempoDeArcoMs },
    pesos,
  )
  return { sim, resultado }
}
