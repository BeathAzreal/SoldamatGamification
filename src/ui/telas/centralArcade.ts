import type { App } from '../app'
import { anexar, h, titulo } from '../dom'
import { telaHistoria } from './historia'
import { telaArcade } from './arcade'
import { telaTorneios } from './torneio'

/** Reúne as partidas; Treino permanece como prática livre. */
export function telaCentralArcade(app: App): void {
  app.ir(() => {
    const modos = [
      { nome: 'História', texto: 'Missões e encomendas organizadas em capítulos.', acao: telaHistoria },
      { nome: 'Desafios', texto: 'Desafios sorteados, três vidas e recordes.', acao: telaArcade },
      { nome: 'Versus', texto: 'Disputa local por turnos, com participantes e rodadas.', acao: telaTorneios },
    ]
    anexar(app.raiz, titulo('Arcade', 'Escolha como quer jogar.'),
      h('div', { class: 'grade-cartoes' }, ...modos.map(m =>
        h('section', { class: 'cartao' }, h('h3', {}, m.nome), h('p', {}, m.texto),
          h('button', { type: 'button', class: 'primario', on: { click: () => m.acao(app) } }, `Abrir ${m.nome}`)))))
  }, 'Arcade')
}
