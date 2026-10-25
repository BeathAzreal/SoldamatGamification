import { MATERIAIS, type MaterialId } from '../simulacao-mig/materiais-e-gases'
import { h } from '../interface/criar-elementos'

/** Selo do material (cor + nome: a informação nunca depende só da cor). */
export function seloMaterial(id: MaterialId, espessuraMm?: number): HTMLElement {
  const m = MATERIAIS[id]
  return h(
    'span',
    { class: `selo-material material-${id}` },
    h('span', { class: 'selo-material-amostra', 'aria-hidden': 'true' }),
    h('span', {}, m.nome, espessuraMm !== undefined ? ` · ${espessuraMm.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} mm` : ''),
  )
}
