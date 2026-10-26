/*
 * █ Eletrodo: peças do treino
 *
 * O que faz: A lista das peças do treino de eletrodo: nome, aplicação, junta,
 *    espessura, eletrodo e corrente sugeridos, trecho e objetivo.
 *
 * Onde mexer: Para criar uma peça nova, copie um bloco { id: ..., titulo: ...
 *    } da lista PECAS_ELETRODO e troque os valores. O id precisa ser
 *    único.
 */

import type { TipoJunta } from '../simulacao-mig/tipos-de-junta-e-posicao'

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
  /**
   * O que a inspeção mede para saber se o cordão encheu o que devia (H75):
   * reforço acima da chapa (mm), perna do filete (mm) ou enchimento do
   * chanfro (min = 1 é cheio até a face; max = reforço máximo em mm).
   */
  medida: { tipo: 'reforco' | 'perna' | 'enchimento'; min: number; max: number }
}

/** H74: quanto cada junta precisa de calor por mm de espessura. No filete o calor escapa por três lados (T, sobreposta). */
const FATOR_APORTE: Record<TipoJunta, number> = { topo: 1, v: 0.9, t: 1.4, sobreposta: 1.3, canto: 1.1 }

/**
 * H74: aporte de calor de referência da peça (kJ/mm). Cresce com a espessura;
 * a faixa adequada da inspeção vai de 0,8 a 1,7 vez este valor.
 */
export function aporteAlvoKJmm(p: PecaEletrodo): number {
  return 0.12 * p.espessuraMm * FATOR_APORTE[p.junta]
}

export const PECAS_ELETRODO: readonly PecaEletrodo[] = [
  {
    id: 'cordao-chapa',
    titulo: 'Cordões sobre chapa 6,3 mm',
    aplicacao: 'Primeiro exercício de todo curso de eletrodo.',
    porque: 'Chapa grossa e parada: só abrir o arco, manter o comprimento e avançar em linha.',
    junta: 'topo', espessuraMm: 6.3, aberturaMm: 0, diametroMm: 2.5, correnteA: { min: 80, max: 100 },
    inicioMm: 20, fimMm: 130,
    objetivo: 'Um cordão contínuo do INÍCIO ao FIM, com o arco perto do diâmetro da alma e reforço de 1 a 3 mm.',
    medida: { tipo: 'reforco', min: 1, max: 3 },
  },
  {
    id: 't-estrutural',
    titulo: 'Filete em T — base de máquina',
    aplicacao: 'Nervuras, suportes e bases de estrutura metálica.',
    porque: 'Aço estrutural grosso soldado na oficina ou no campo, sem cilindro de gás.',
    junta: 't', espessuraMm: 6.3, aberturaMm: 0, diametroMm: 3.2, correnteA: { min: 100, max: 130 },
    inicioMm: 10, fimMm: 140,
    objetivo: 'Filete contínuo no canto, com perna de 4 a 6,5 mm; limpe a escória no fim.',
    medida: { tipo: 'perna', min: 4, max: 6.5 },
  },
  {
    id: 'v-raiz',
    titulo: 'Topo em V 8 mm — raiz e enchimento',
    aplicacao: 'Chapa grossa, tanques e tubulação.',
    porque: 'Chapa grossa chanfrada se enche em vários passes de eletrodo: raiz, enchimento e acabamento.',
    junta: 'v', espessuraMm: 8, aberturaMm: 2.5, diametroMm: 2.5, correnteA: { min: 75, max: 95 },
    inicioMm: 30, fimMm: 120,
    objetivo: 'Encha o chanfro em vários passes até a face, com reforço de até 3 mm: raiz com 2,5 mm e enchimento com 3,2 mm. Limpe a escória entre um passe e outro.',
    medida: { tipo: 'enchimento', min: 1, max: 3 },
  },
  {
    id: 'canto-portao',
    titulo: 'Canto externo — quadro de portão',
    aplicacao: 'Serralheria: quadros, grades e portões de cantoneira.',
    porque: 'Serviço de serralheria e de campo, muitas vezes ao ar livre.',
    junta: 'canto', espessuraMm: 4.75, aberturaMm: 0, diametroMm: 2.5, correnteA: { min: 75, max: 95 },
    inicioMm: 15, fimMm: 135,
    objetivo: 'Cordão na quina com perna de 3 a 5 mm, sem derreter a borda: arco curto e avanço constante.',
    medida: { tipo: 'perna', min: 3, max: 5 },
  },
  {
    id: 'sobreposta-reforco',
    titulo: 'Sobreposta — reforço de chapa no campo',
    aplicacao: 'Manutenção: reforços e remendos em estruturas já montadas.',
    porque: 'Com vento, o gás de proteção do MIG seria soprado; o revestimento do eletrodo protege.',
    junta: 'sobreposta', espessuraMm: 6.3, aberturaMm: 0, diametroMm: 3.2, correnteA: { min: 105, max: 130 },
    inicioMm: 10, fimMm: 140,
    objetivo: 'Filete contínuo na borda da chapa de cima, com perna de 4 a 6,5 mm; limpe toda a escória.',
    medida: { tipo: 'perna', min: 4, max: 6.5 },
  },
]

export function pecaEletrodo(id: string): PecaEletrodo {
  return PECAS_ELETRODO.find(p => p.id === id) ?? PECAS_ELETRODO[0]
}
