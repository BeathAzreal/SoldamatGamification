import type { TipoJunta } from '../modelo/juntas'

/**
 * Peças do treino de eletrodo revestido (SMAW). Escolhidas pelo que o processo
 * faz bem: aço carbono mais grosso, estrutura e serviço de campo (vento, sem
 * gás, peça presa no lugar). Chapa fina continua no treino MIG/MAG.
 * Correntes sugeridas são faixas do modelo didático (Iref = 36 × diâmetro, H63),
 * não recomendação de fabricante.
 */
export interface PecaEletrodo {
  id: string
  titulo: string
  /** Onde essa junta aparece no trabalho real. */
  aplicacao: string
  /** Por que eletrodo revestido aqui. */
  porque: string
  junta: TipoJunta
  espessuraMm: number
  aberturaMm: number
  diametroMm: 2.5 | 3.2
  correnteA: { min: number; max: number }
  /** Trecho exigido, marcado na peça. */
  inicioMm: number
  fimMm: number
  objetivo: string
}

export const PECAS_ELETRODO: readonly PecaEletrodo[] = [
  {
    id: 'cordao-chapa',
    titulo: 'Emenda de chapa — estrutura de transportador',
    aplicacao: 'Fabricação de estrutura de transportador industrial em aço carbono.',
    porque: 'Chapa grossa e parada: só abrir o arco, manter o comprimento e avançar em linha.',
    junta: 'topo', espessuraMm: 10, aberturaMm: 0, diametroMm: 2.5, correnteA: { min: 80, max: 100 },
    inicioMm: 20, fimMm: 130,
    objetivo: 'Um cordão contínuo do INÍCIO ao FIM, com o arco perto do diâmetro da alma.',
  },
  {
    id: 't-estrutural',
    titulo: 'Nervura de sapata — base de equipamento',
    aplicacao: 'Nervuras, suportes e bases de estrutura metálica.',
    porque: 'Aço estrutural grosso soldado na oficina ou no campo, sem cilindro de gás.',
    junta: 't', espessuraMm: 10, aberturaMm: 0, diametroMm: 3.2, correnteA: { min: 100, max: 130 },
    inicioMm: 10, fimMm: 140,
    objetivo: 'Filete contínuo no canto, sem grudar o eletrodo; limpe a escória no fim.',
  },
  {
    id: 'v-raiz',
    titulo: 'Emenda chanfrada — longarina de ponte rolante',
    aplicacao: 'Emenda de chapas grossas de uma longarina de equipamento.',
    porque: 'O passe de raiz com eletrodo fino é clássico em chapa grossa chanfrada.',
    junta: 'v', espessuraMm: 12, aberturaMm: 2.5, diametroMm: 2.5, correnteA: { min: 75, max: 95 },
    inicioMm: 10, fimMm: 140,
    objetivo: 'Raiz contínua no fundo do chanfro com arco curto; limpe a escória antes de outro passe.',
  },
  {
    id: 'canto-portao',
    titulo: 'Canto de caixa — coluna de pórtico',
    aplicacao: 'Fechamento de seção de caixa de uma coluna de estrutura industrial.',
    porque: 'Serviço de serralheria e de campo, muitas vezes ao ar livre.',
    junta: 'canto', espessuraMm: 8, aberturaMm: 0, diametroMm: 2.5, correnteA: { min: 75, max: 95 },
    inicioMm: 15, fimMm: 135,
    objetivo: 'Cordão na quina sem furar a borda: arco curto e avanço constante.',
  },
  {
    id: 'sobreposta-reforco',
    titulo: 'Chapa de reforço — manutenção de estrutura',
    aplicacao: 'Manutenção: reforços e remendos em estruturas já montadas.',
    porque: 'Com vento, o gás de proteção do MIG seria soprado; o revestimento do eletrodo protege.',
    junta: 'sobreposta', espessuraMm: 10, aberturaMm: 0, diametroMm: 3.2, correnteA: { min: 105, max: 130 },
    inicioMm: 10, fimMm: 140,
    objetivo: 'Filete contínuo na borda da chapa de cima; limpe toda a escória.',
  },
]

export function pecaEletrodo(id: string): PecaEletrodo {
  return PECAS_ELETRODO.find(p => p.id === id) ?? PECAS_ELETRODO[0]
}
