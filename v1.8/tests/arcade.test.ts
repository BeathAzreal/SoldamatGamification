import { describe, expect, it } from 'vitest'
import { ajustePreDefinido, avaliarDesafio, gerarDesafio, multiplicador, type Desafio } from '../src/arcade/desafios'
import {
  chaveRankingArcade,
  criarRecordeArcade,
  problemasDoRecordeArcade,
  rankingArcade,
  validarListaArcade,
} from '../src/dados/recordesArcade'
import { DIFICULDADES, MISSOES } from '../src/missoes/catalogo'
import { areaParaLargura, INFO_JUNTA } from '../src/modelo/juntas'
import { equilibrioArco, razaoEfetiva, taxaDeposicao, type Tecnica } from '../src/modelo/processo'
import { contextoDaMissao, requisitosEfetivos } from '../src/missoes/catalogo'
import type { ResultadoPontuacao } from '../src/pontuacao/regras'
import { executar, jeitosDeSoldar } from './util'

function semente(s = 42) {
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

describe('geração de desafios', () => {
  it('é determinística com a mesma semente e começa com aquecimento', () => {
    const a = Array.from({ length: 10 }, (_, i) => gerarDesafio(i + 1, semente(7)))
    const b = Array.from({ length: 10 }, (_, i) => gerarDesafio(i + 1, semente(7)))
    expect(a).toEqual(b)
    for (const n of [1, 2]) {
      const d = gerarDesafio(n, semente(n))
      expect(d.condicao.tipo).toBe('livre')
      expect(d.dificuldade).toBe('aprendiz')
    }
  })

  it('só sorteia missões jogáveis e cobre todas as condições', () => {
    const r = semente(3)
    const tipos = new Set<string>()
    for (let i = 0; i < 400; i++) {
      const d = gerarDesafio(3 + (i % 8), r)
      expect(MISSOES.some((m) => m.id === d.missaoId)).toBe(true)
      tipos.add(d.condicao.tipo)
    }
    expect([...tipos].sort()).toEqual(['arco-unico', 'livre', 'maquina-ajustada', 'tecnica', 'tempo-arco'])
  })
})

/** Procura velocidade (e aceleração, no alumínio) que aprova com ajustes dados. */
function aprovaCom(m: (typeof MISSOES)[number], d: (typeof DIFICULDADES)[number], ajustes: { alimentacao: number; tensao: number }, tecnica: Tecnica = 'neutra', vMin = 2) {
  const preparo = { diametroArameMm: m.consumiveis.diametrosMm[m.consumiveis.diametrosMm.length - 1], gas: m.consumiveis.gases[0], oxidoRemovido: true, tecnica }
  // v1.8 (H87): metade das velocidades de antes (era de 4 a 30 mm/s, de 0,5 em 0,5).
  for (let v = vMin; v <= 15; v += 0.25) {
    for (const acel of m.material === 'aluminio' ? [0, 0.3, 0.5] : [0]) {
      for (const jeito of jeitosDeSoldar(m)) {
        const r = executar(m, d, preparo, ajustes, v, acel, jeito)
        if (r.aprovada) return { v, acel, total: r.total }
      }
    }
  }
  return null
}

describe('cada condição sorteável tem solução', () => {
  for (const m of MISSOES) {
    for (const d of DIFICULDADES) {
      it(`máquina pré-ajustada: ${m.id} / ${d}`, () => {
        const { ajustes } = ajustePreDefinido(m, d)
        expect(aprovaCom(m, d, ajustes)).not.toBeNull()
      }, 60000)

      it(`técnicas puxando e empurrando: ${m.id} / ${d}`, () => {
        for (const tecnica of ['puxando', 'empurrando'] as const) {
          // A condição só trava a técnica: o arame continua sendo escolha do jogador (H48: arame
          // grosso em chapa fina dá corrente alta mesmo com pouca alimentação).
          let achou = false
          for (const diametro of m.consumiveis.diametrosMm) {
            const preparo = { diametroArameMm: diametro, gas: m.consumiveis.gases[0], oxidoRemovido: true, tecnica }
            const ctx = contextoDaMissao(m, preparo)
            const req = requisitosEfetivos(m, d)
            for (let w = 2; w <= 10 && !achou; w += 0.5) {
              const tensao = Math.round(Math.min(10, equilibrioArco({ alimentacao: w, tensao: 5 }, ctx).tensaoEquilibrio) * 2) / 2
              const a = { alimentacao: w, tensao }
              const area = areaParaLargura(m.geometria.junta, ctx, (req.larguraMinMm + req.larguraMaxMm) / 2, razaoEfetiva(a, ctx))
              const v = taxaDeposicao(a, ctx) / area
              for (const f of [0.9, 1, 1.1]) {
                for (const acel of m.material === 'aluminio' ? [0, 0.3, 0.5] : [0]) {
                  for (const jeito of jeitosDeSoldar(m)) {
                    if (!achou && executar(m, d, preparo, a, v * f, acel, jeito).aprovada) achou = true
                  }
                }
              }
            }
          }
          expect(achou, `${tecnica} sem solução`).toBe(true)
        }
      }, 60000)

      it(`contra o relógio: ${m.id} / ${d}`, () => {
        const { ajustes } = ajustePreDefinido(m, d)
        // O limite de tempo pede 3/4 da velocidade típica da junta: aprovar um pouco acima disso.
        const r = aprovaCom(m, d, ajustes, 'neutra', Math.ceil(0.8 * INFO_JUNTA[m.geometria.junta].velocidadeReferenciaMms))
        expect(r).not.toBeNull()
      }, 60000)
    }
  }
})

const resultado = (total: number, aprovada = true) => ({ total, aprovada }) as ResultadoPontuacao

describe('avaliação do desafio e combo', () => {
  const base = { numero: 3, missaoId: MISSOES[0].id, dificuldade: 'aprendiz' } as const
  const exec = { aberturasDeArco: 1, tempoArcoS: 10, tecnica: 'neutra' as Tecnica, ajustes: { alimentacao: 5, tensao: 5.5 } }

  it('não aprovar a missão não faz perder o desafio; a nota conta (v1.8, H89)', () => {
    const r = avaliarDesafio({ ...base, condicao: { tipo: 'livre' } }, resultado(90, false), exec, 0)
    expect(r.concluido).toBe(true)
    expect(r.pontos).toBeGreaterThan(0)
  })

  it('verifica cada condição', () => {
    const casos: [Desafio['condicao'], Partial<typeof exec>, boolean][] = [
      [{ tipo: 'arco-unico' }, { aberturasDeArco: 2 }, false],
      [{ tipo: 'arco-unico' }, { aberturasDeArco: 1 }, true],
      [{ tipo: 'tempo-arco', maximoS: 12 }, { tempoArcoS: 12.5 }, false],
      [{ tipo: 'tempo-arco', maximoS: 12 }, { tempoArcoS: 11 }, true],
      [{ tipo: 'tecnica', tecnica: 'puxando' }, { tecnica: 'neutra' }, false],
      [{ tipo: 'tecnica', tecnica: 'puxando' }, { tecnica: 'puxando' }, true],
      [{ tipo: 'maquina-ajustada', ajustes: { alimentacao: 5, tensao: 5.5 }, preparo: {} }, { ajustes: { alimentacao: 6, tensao: 5.5 } }, false],
      [{ tipo: 'maquina-ajustada', ajustes: { alimentacao: 5, tensao: 5.5 }, preparo: {} }, {}, true],
    ]
    for (const [condicao, e, esperado] of casos) {
      expect(avaliarDesafio({ ...base, condicao }, resultado(80), { ...exec, ...e }, 0).concluido).toBe(esperado)
    }
  })

  it('combo multiplica até ×2', () => {
    expect(multiplicador(0)).toBe(1)
    expect(multiplicador(2)).toBe(1.5)
    expect(multiplicador(10)).toBe(2)
    expect(avaliarDesafio({ ...base, condicao: { tipo: 'livre' } }, resultado(80), exec, 2).pontos).toBe(120)
  })
})

describe('recordes do Arcade', () => {
  const novo = (nome: string, pontos: number, dispositivo: 'mouse' | 'controle' = 'mouse') =>
    criarRecordeArcade(
      { pontos, desafiosConcluidos: 3, desafios: [{ missaoId: MISSOES[0].id, missaoTitulo: 'x', dificuldade: 'aprendiz', material: 'aco-carbono', condicao: 'Solda livre', total: 90, concluido: true }], processo: 'MIG/MAG', dispositivo, versaoArcade: 'arcade-v1', versaoPontuacao: 'pontuacao-v1' },
      nome,
      new Date('2026-10-21T10:00:00Z'),
    )

  it('guarda o nome, valida e ordena por pontos dentro do mesmo dispositivo', () => {
    const a = novo('  Ana ', 300)
    const b = novo('Bia', 450)
    const c = novo('Caio', 999, 'controle')
    expect(a.nome).toBe('Ana')
    expect(problemasDoRecordeArcade(a)).toEqual([])
    expect(rankingArcade([a, b, c], chaveRankingArcade(a)).map((r) => r.nome)).toEqual(['Bia', 'Ana'])
    expect(validarListaArcade([a, { lixo: true }])).toEqual([a])
  })
})

describe('variedade de material no Arcade', () => {
  it('dois desafios seguidos nunca têm o mesmo material', () => {
    const r = semente(11)
    let d = gerarDesafio(1, r)
    const materiais = new Set<string>()
    for (let n = 2; n <= 200; n++) {
      const proximo = gerarDesafio(n, r, d)
      const ma = MISSOES.find((m) => m.id === d.missaoId)!.material
      const mb = MISSOES.find((m) => m.id === proximo.missaoId)!.material
      expect(mb).not.toBe(ma)
      materiais.add(mb)
      d = proximo
    }
    expect(materiais.size).toBe(3)
  })
})

describe('variedade de material no modo História', () => {
  it('capítulos seguidos têm materiais diferentes', () => {
    for (let i = 1; i < MISSOES.length; i++) expect(MISSOES[i].material).not.toBe(MISSOES[i - 1].material)
  })
})
