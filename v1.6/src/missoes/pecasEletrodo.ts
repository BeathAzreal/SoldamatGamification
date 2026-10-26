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
  larguraMm?: number
  conjunto?: 'grade'
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
    titulo: 'Unir duas chapas — junta de topo',
    aplicacao: 'Duas chapas separadas e alinhadas para formar uma única peça.',
    porque: 'Montagem de chapas de aço carbono: unir as bordas pela abertura central.',
    junta: 'topo', espessuraMm: 8, aberturaMm: 2, diametroMm: 2.5, correnteA: { min: 80, max: 100 },
    inicioMm: 20, fimMm: 130,
    objetivo: 'Preencher a abertura até a face das chapas, unindo as duas bordas do INÍCIO ao FIM. Faça mais de um passe, trocando a vareta e limpando entre eles.',
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
    titulo: 'Conserto de grade — emenda da barra',
    aplicacao: 'Grade de aço com uma barra chata cortada em duas partes, alinhadas para o reparo.',
    porque: 'Serviço de manutenção: recompor a continuidade da barra dentro do quadro da grade.',
    conjunto: 'grade', larguraMm: 40,
    junta: 'topo', espessuraMm: 6.3, aberturaMm: 1.5, diametroMm: 2.5, correnteA: { min: 75, max: 95 },
    inicioMm: 57, fimMm: 93,
    objetivo: 'Soldar a abertura entre as duas metades da barra de 40 mm, limpar e inspecionar a união.',
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

/** Coordenadas da largura real da peça no domínio de 150 mm da bancada. */
export function limitesPecaEletrodo(p: { larguraMm?: number }): { min: number; max: number } {
  const meia = (p.larguraMm ?? 150) / 2
  return { min: 75 - meia, max: 75 + meia }
}
