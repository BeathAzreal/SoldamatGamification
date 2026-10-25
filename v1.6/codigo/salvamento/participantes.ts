import { MISSOES, type Dificuldade } from '../missoes/lista-de-missoes'
import { normalizarNome } from './recordes-das-missoes'
import type { Participante } from '../torneio/regras-e-dados-do-torneio'

/*
 * Perfis de participantes. O mesmo registro serve ao Arcade (com o progresso
 * de missões) e aos torneios (cada torneio cria os seus participantes).
 */

export interface PerfilParticipante extends Participante {
  origem: 'arcade' | 'torneio'
  /** Missões aprovadas no Arcade: "missaoId|dificuldade". */
  aprovadas?: string[]
}

export const chaveProgresso = (missaoId: string, d: Dificuldade) => `${missaoId}|${d}`

/** Progressão do Arcade: a 1ª missão abre; cada Aprendiz aprovado abre a próxima missão e o Profissional da mesma. */
export function missaoLiberada(perfil: PerfilParticipante | undefined, missaoId: string, d: Dificuldade): { liberada: boolean; motivo: string } {
  const i = MISSOES.findIndex((m) => m.id === missaoId)
  if (i < 0) return { liberada: false, motivo: 'Missão indisponível.' }
  const aprovadas = new Set(perfil?.aprovadas ?? [])
  if (d === 'profissional' && !aprovadas.has(chaveProgresso(missaoId, 'aprendiz'))) {
    return { liberada: false, motivo: 'Seja aprovado no nível Aprendiz desta missão.' }
  }
  if (d === 'aprendiz' && i > 0 && !aprovadas.has(chaveProgresso(MISSOES[i - 1].id, 'aprendiz'))) {
    return { liberada: false, motivo: `Seja aprovado em "${MISSOES[i - 1].titulo}" (Aprendiz).` }
  }
  return { liberada: true, motivo: '' }
}

export function buscarPerfilArcade(perfis: PerfilParticipante[], nome: string): PerfilParticipante | undefined {
  const alvo = normalizarNome(nome).toLocaleLowerCase('pt-BR')
  return perfis.find((p) => p.origem === 'arcade' && p.nome.toLocaleLowerCase('pt-BR') === alvo)
}

export function validarPerfis(dados: unknown): PerfilParticipante[] | null {
  if (!Array.isArray(dados)) return null
  return dados.filter(
    (p) =>
      p && typeof p === 'object' && typeof p.id === 'string' && typeof p.nome === 'string' && (p.origem === 'arcade' || p.origem === 'torneio'),
  ) as PerfilParticipante[]
}


/** Resumo derivado dos dados existentes: aprovações desconhecidas não contam. */
export function progressoDoPerfil(perfil: PerfilParticipante | undefined) {
  const aprovadas = new Set(perfil?.aprovadas ?? [])
  const aprendiz = MISSOES.filter(m => aprovadas.has(chaveProgresso(m.id, 'aprendiz'))).length
  const profissional = MISSOES.filter(m => aprovadas.has(chaveProgresso(m.id, 'profissional'))).length
  const proxima = MISSOES.find(m => !aprovadas.has(chaveProgresso(m.id, 'aprendiz')) && missaoLiberada(perfil,m.id,'aprendiz').liberada)
  const aprofundar = MISSOES.find(m => !aprovadas.has(chaveProgresso(m.id, 'profissional')) && missaoLiberada(perfil,m.id,'profissional').liberada)
  return { aprendiz, profissional, total: MISSOES.length, proximaId: proxima?.id ?? aprofundar?.id ?? null, dificuldade: proxima ? 'aprendiz' as const : 'profissional' as const }
}
