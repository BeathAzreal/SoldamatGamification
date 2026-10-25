/**
 * Materiais e gases do jogo (H27, H35). Todos os números são relativos e do
 * jogo; o que vem de fora é só a ORDEM das propriedades (ver docs/HIPOTESES.md).
 */

export type MaterialId = 'aco-carbono' | 'inox-austenitico' | 'aluminio'

export interface Material {
  id: MaterialId
  nome: string
  /** n: multiplica o aporte necessário para fundir (H33, H35). */
  necessidadeFusao: number
  /** e: quanto o aquecimento acumulado facilita a fusão (H32). */
  efeitoAquecimento: number
  /** g: ganho do aquecimento acumulado por unidade de potência (H32). */
  ganhoAquecimento: number
  /** τ: tempo característico de aquecimento e resfriamento da peça, em s (H32). */
  tauAquecimentoS: number
  /** f: tendência a deformar (H36). */
  fatorDeformacao: number
  /** A superfície precisa de limpeza do óxido antes de soldar (H35). */
  exigeLimpeza: boolean
  /** Só aparência (H8). */
  aparencia: {
    chapaClara: string
    chapaEscura: string
    /** Camadas do cordão, da borda para a crista (H40). */
    cordao: readonly [string, string, string, string]
    /** O metal quase não muda de cor ao aquecer (alumínio). */
    brilhoFraco: boolean
    /** Faixa de coloração térmica ao lado do cordão (inox). */
    tintaTermica: boolean
  }
}

export const MATERIAIS: Record<MaterialId, Material> = {
  'aco-carbono': {
    id: 'aco-carbono',
    nome: 'Aço de baixo carbono',
    necessidadeFusao: 1,
    efeitoAquecimento: 0.3,
    ganhoAquecimento: 0.25,
    tauAquecimentoS: 12,
    fatorDeformacao: 1,
    exigeLimpeza: false,
    aparencia: { chapaClara: '#77808b', chapaEscura: '#545c66', cordao: ['#474d55', '#6c737b', '#959ca4', '#c8cdd2'], brilhoFraco: false, tintaTermica: false },
  },
  'inox-austenitico': {
    id: 'inox-austenitico',
    nome: 'Aço inoxidável austenítico',
    necessidadeFusao: 0.85,
    efeitoAquecimento: 0.25,
    ganhoAquecimento: 0.35,
    tauAquecimentoS: 18,
    fatorDeformacao: 1.7,
    exigeLimpeza: false,
    aparencia: { chapaClara: '#d3d1cb', chapaEscura: '#aba79f', cordao: ['#726c62', '#a09a8f', '#cbc6bc', '#efede8'], brilhoFraco: false, tintaTermica: true },
  },
  aluminio: {
    id: 'aluminio',
    nome: 'Liga de alumínio',
    necessidadeFusao: 1.8,
    efeitoAquecimento: 0.8,
    ganhoAquecimento: 0.3,
    tauAquecimentoS: 8,
    fatorDeformacao: 1.2,
    exigeLimpeza: true,
    aparencia: { chapaClara: '#e6ebf1', chapaEscura: '#c2cbd6', cordao: ['#97a2ae', '#bcc6d1', '#dbe2ea', '#f8fafc'], brilhoFraco: true, tintaTermica: false },
  },
}

export type GasId = 'ar-co2' | 'co2' | 'ar' | 'ar-co2-baixo'

export interface Gas {
  id: GasId
  nome: string
  /** MIG = gás inerte; MAG = gás ativo. */
  processo: 'MIG' | 'MAG'
  /** η: rendimento de deposição relativo (H29). */
  rendimento: number
  /** Fator do gás no índice de fusão (H33). */
  fatorFusao: number
  /** Materiais para os quais o jogo oferece este gás (H27). */
  materiais: MaterialId[]
}

export const GASES: Record<GasId, Gas> = {
  'ar-co2': {
    id: 'ar-co2',
    nome: 'Mistura argônio + CO₂',
    processo: 'MAG',
    rendimento: 1,
    fatorFusao: 1,
    materiais: ['aco-carbono'],
  },
  co2: {
    id: 'co2',
    nome: 'CO₂ puro',
    processo: 'MAG',
    rendimento: 0.94,
    fatorFusao: 1.1,
    materiais: ['aco-carbono'],
  },
  'ar-co2-baixo': {
    id: 'ar-co2-baixo',
    nome: 'Argônio com baixo teor de CO₂',
    processo: 'MAG',
    rendimento: 1,
    fatorFusao: 1,
    materiais: ['inox-austenitico'],
  },
  ar: {
    id: 'ar',
    nome: 'Argônio puro',
    processo: 'MIG',
    rendimento: 1,
    fatorFusao: 1,
    materiais: ['aluminio'],
  },
}

/** Arames sólidos: cada material tem o seu (H27). */
export const ARAMES: Record<MaterialId, string> = {
  'aco-carbono': 'Arame sólido de aço carbono',
  'inox-austenitico': 'Arame sólido de inox austenítico',
  aluminio: 'Arame sólido de liga de alumínio',
}

export function gasCompativel(gas: GasId, material: MaterialId): boolean {
  return GASES[gas].materiais.includes(material)
}
