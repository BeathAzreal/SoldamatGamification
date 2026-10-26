/*
 * █ Início do jogo
 *
 * O que faz: É o primeiro arquivo que roda. Carrega os estilos (cores e
 *    layout), liga os botões do menu lateral às telas e abre o menu
 *    inicial.
 *
 * Onde mexer: Para trocar qual tela abre primeiro, mude a última linha
 *    (telaMenu). Para mudar o texto do painel "Modelo didático",
 *    procure abrirPainel.
 */

import { instalarPause } from './partes-das-telas/menu-de-pausa'
import './estilos/1-base.css'
import './estilos/2-telas-e-componentes.css'
import './estilos/3-visual-v14.css'
import './estilos/4-oficina.css'
import './estilos/5-espacamento-e-layout.css'
import './estilos/6-eletrodo.css'
import './estilos/7-painel-da-maquina.css'
import { App } from './interface/aplicativo'
import { icone } from './partes-das-telas/icones'
import { telaHistoria } from './telas/missoes'
import { telaCentralArcade } from './telas/central-do-arcade'
import { telaTreino } from './telas/treino'
import { telaTorneios } from './telas/torneio'
import { telaRecordes } from './telas/recordes'
import { telaConfiguracoes } from './telas/configuracoes'
import { telaMenu } from './telas/menu-inicial'
import { abrirPainel } from './interface/janelas-de-dialogo'
import { h } from './interface/criar-elementos'
import { somArco } from './interface/som-do-arco'

/*
 * Ponto de entrada: carrega os dados deste navegador e abre o menu.
 * O treino livre usa a mesma bancada e execução das missões, com a peça padrão.
 */
const app = new App()
instalarPause(app)
app.voltarArcade = () => telaCentralArcade(app)
const rotas: Record<string, (app: App) => void> = {
  inicio: telaMenu, historia: telaHistoria, arcade: telaCentralArcade, treino: telaTreino,
  torneio: telaTorneios, recordes: (app) => telaRecordes(app), config: telaConfiguracoes,
}
document.querySelectorAll<HTMLButtonElement>('[data-rota]').forEach(botao => {
  const rota = botao.dataset.rota!
  botao.querySelector('.nav-icone')?.append(icone(rota === 'inicio' ? 'maquina' : rota))
  botao.addEventListener('click', () => rotas[rota]?.(app))
})
document.getElementById('botao-menu')!.addEventListener('click', () => telaMenu(app))
document.getElementById('botao-inicio')!.addEventListener('click', () => telaMenu(app))
document.getElementById('botao-info')!.addEventListener('click', () =>
  abrirPainel(
    'Sobre o modelo',
    h(
      'div',
      { class: 'texto-sobre' },
      h('p', {}, 'Este é um jogo didático com um modelo qualitativo simplificado de MIG/MAG. Os números são do jogo, não valores de processo.'),
      h('p', {}, 'A aparência do cordão não indica qualidade interna. A "integridade prevista" e o corte transversal são resultados sintéticos do modelo, não ensaios.'),
      h('p', {}, 'Requisitos das missões são objetivos didáticos fictícios; o jogo não segue norma nem concede certificação.'),
      h('p', {}, 'As hipóteses e as fontes consultadas estão em documentacao/HIPOTESES.md, no projeto.'),
    ),
  ),
)
// Som do arco (H45): liga/desliga no topo, lembrado nas preferências.
const botaoSom = document.getElementById('botao-som')!
const mostrarSom = () => {
  somArco.ligado = app.preferencias.som
  botaoSom.textContent = app.preferencias.som ? '🔊 Som' : '🔇 Som'
  botaoSom.setAttribute('aria-pressed', String(app.preferencias.som))
  if (!app.preferencias.som) somArco.calar()
}
botaoSom.addEventListener('click', () => {
  app.preferencias.som = !app.preferencias.som
  app.salvar('preferencias')
  mostrarSom()
})
mostrarSom()
telaMenu(app)
