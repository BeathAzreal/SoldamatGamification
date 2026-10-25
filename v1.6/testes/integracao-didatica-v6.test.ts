import { expect, it } from 'vitest'
import { MISSOES, contextoDaMissao, preparoPadrao } from '../codigo/missoes/lista-de-missoes'
import { Simulacao } from '../codigo/simulacao-mig/simulacao'
import { compactar } from '../codigo/salvamento/registro-compacto'
import { relatorioDoRegistro } from '../codigo/pontuacao/pontuar-tentativa'
import { devolverTentativa } from '../codigo/explicacoes/devolutiva'
import { roteiroDaMissao } from '../codigo/missoes/roteiros-de-aprendizagem'

for (const m of MISSOES) {
  it(`integra feedback e roteiro com relatório de defeitos v6: ${m.id}`, () => {
    const contexto = contextoDaMissao(m, { ...preparoPadrao(m), oxidoRemovido: true })
    const sim = new Simulacao(contexto)
    sim.definirAjustes({ alimentacao: 5, tensao: 5.5 })
    sim.iniciarArco({ t: 1000, x: 10, y: 0 })
    for (let i = 1; i <= 100; i++) sim.moverTocha({ t: 1000 + i * 100, x: 10 + i * 1.2, y: 0 })
    sim.encerrarArco({ t: 11000, x: 130, y: 0 })
    const { resultado, relatorio } = relatorioDoRegistro(m, 'aprendiz', contexto, compactar(sim.eventos))
    const antes = structuredClone(resultado)
    const feedback = devolverTentativa(resultado)
    expect(resultado.versao).toBe('pontuacao-v7')
    expect(resultado.categorias.find(c => c.id === 'desenho')!.detalhes.some(d => d.rotulo === 'Superfície')).toBe(true)
    expect(relatorio.defeitos).toBeDefined()
    expect(Object.values(feedback).every(t => t.length > 0)).toBe(true)
    expect(roteiroDaMissao(m).habilidade.length).toBeGreaterThan(15)
    expect(resultado).toEqual(antes)
  })
}
