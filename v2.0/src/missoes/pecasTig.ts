import type { PecaEletrodo } from './pecasEletrodo'

/**
 * Peças do treino TIG (GTAW, H92). Chapa fina, onde o TIG é escolhido pelo
 * controle da poça: inox e aço carbono. Faixas de corrente didáticas do
 * jogo, não recomendação de fabricante.
 */
export interface PecaTig {
  id: string
  titulo: string
  aplicacao: string
  objetivo: string
  material: 'inox' | 'carbono'
  junta: 'topo' | 't'
  espessuraMm: number
  /** Diâmetro da vareta de adição (mm). */
  varetaMm: 1.6 | 2.4
  correnteA: { min: number; max: number }
  inicioMm: number
  fimMm: number
  /** Chapa inteira (sem emenda): cordões sobre a chapa. */
  sobreChapa?: boolean
}

export const NOME_MATERIAL_TIG: Record<PecaTig['material'], string> = { inox: 'Aço inox', carbono: 'Aço carbono' }

export const PECAS_TIG: readonly PecaTig[] = [
  {
    id: 'tig-chapa',
    titulo: 'Cordões sobre chapa — inox 2 mm',
    aplicacao: 'Primeiro exercício do TIG: abrir a poça, mergulhar a vareta e avançar no ritmo.',
    objetivo: 'Um cordão reto do INÍCIO ao FIM: segure a poça com o pedal, toque a vareta na frente da poça e avance um pouco a cada toque.',
    material: 'inox', junta: 'topo', espessuraMm: 2, varetaMm: 1.6, correnteA: { min: 60, max: 90 },
    inicioMm: 35, fimMm: 115, sobreChapa: true,
  },
  {
    id: 'tig-topo',
    titulo: 'Emenda de chapa fina — inox 1,5 mm',
    aplicacao: 'Bordas encostadas de duas chapas finas: tampas, dutos e peças de cozinha industrial.',
    objetivo: 'Fundir as duas bordas do INÍCIO ao FIM sem furar a chapa, com um pouco de vareta para dar reforço.',
    material: 'inox', junta: 'topo', espessuraMm: 1.5, varetaMm: 1.6, correnteA: { min: 45, max: 70 },
    inicioMm: 35, fimMm: 115,
  },
  {
    id: 'tig-t',
    titulo: 'Filete em T — aço carbono 3 mm',
    aplicacao: 'Suportes e reforços de chapa fina onde o acabamento aparece.',
    objetivo: 'Filete contínuo no canto: a poça precisa molhar as duas chapas antes de cada toque da vareta.',
    material: 'carbono', junta: 't', espessuraMm: 3, varetaMm: 2.4, correnteA: { min: 100, max: 140 },
    inicioMm: 35, fimMm: 115,
  },
]

export function pecaTig(id: string): PecaTig {
  return PECAS_TIG.find((p) => p.id === id) ?? PECAS_TIG[0]
}

/** A mesma peça no formato que o depósito de metal e a bancada 3D já usam (sem abertura). */
export function comoPecaBase(p: PecaTig): PecaEletrodo {
  return {
    id: p.id, titulo: p.titulo, aplicacao: p.aplicacao, porque: '', objetivo: p.objetivo,
    junta: p.junta, espessuraMm: p.espessuraMm, aberturaMm: 0, diametroMm: 2.5,
    correnteA: p.correnteA, inicioMm: p.inicioMm, fimMm: p.fimMm, sobreChapa: p.sobreChapa,
  }
}
