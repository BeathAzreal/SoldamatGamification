import { vezAtual } from '../../dados/torneio'
import { NOME_DISPOSITIVO } from '../../entrada/tipos'
import type { App } from '../app'
import { icone } from '../componentes/icones'
import { abrirPainel } from '../dialogo'
import { anexar, h } from '../dom'
import { telaArcade } from './arcade'
import { telaConfiguracoes } from './configuracoes'
import { telaHistoria } from './historia'
import { telaRecordes } from './recordes'
import { painelTorneio, telaTorneios } from './torneio'
import { telaTreino } from './treino'

const MODOS = [
  { tecla: '1', icone: 'historia', titulo: 'Missões', descricao: 'Resolva encomendas e avance nos capítulos.', etiqueta: 'Aprender', abrir: telaHistoria },
  { tecla: '2', icone: 'arcade', titulo: 'Arcade', descricao: 'Três vidas. Novos desafios. Supere sua marca.', etiqueta: 'Competir', abrir: telaArcade },
  { tecla: '3', icone: 'torneio', titulo: 'Torneio local', descricao: 'Rodadas por turnos, com ou sem professor.', etiqueta: 'Competir', abrir: telaTorneios },
  { tecla: '4', icone: 'treino', titulo: 'Treino', descricao: 'Experimente ajustes e compare tentativas.', etiqueta: 'Praticar', abrir: telaTreino },
  { tecla: '5', icone: 'recordes', titulo: 'Recordes', descricao: 'Consulte os resultados desta estação.', etiqueta: 'Evoluir', abrir: (app: App) => telaRecordes(app) },
  { tecla: '6', icone: 'config', titulo: 'Configurações', descricao: 'Prepare a bancada e calibre seu dispositivo.', etiqueta: 'Preparar', abrir: telaConfiguracoes },
]

function ilustracao(): HTMLElement {
  const figura = h('div', { class: 'diagrama-estacao', 'aria-hidden': 'true' })
  figura.innerHTML = `<svg viewBox="0 0 460 230" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 145 205 72 423 144 245 218Z" fill="#1c252b" stroke="#66747c"/>
    <path d="M205 72 245 218M28 145 245 218M245 218 423 144" stroke="#a5b3ba" stroke-width="1.5"/>
    <path d="m201 84 37 122" stroke="#f58b3d" stroke-width="5" stroke-linecap="round"/>
    <path d="m204 83 36 122" stroke="#ffd0a6" stroke-dasharray="3 6"/>
    <path d="m305 21-46 68 14 10 47-68Z" fill="#34434c" stroke="#a5b3ba"/>
    <path d="m259 89-22 32 10 7 26-29" fill="#c1cbd0" stroke="#dce4e8"/>
    <path d="m242 125-8 13" stroke="#f58b3d" stroke-width="3"/>
    <circle cx="232" cy="141" r="7" fill="#ffb16c"/>
    <path d="m222 131-10-7m30 21 13 4m-22-23 1-10" stroke="#ffb16c" stroke-width="2"/>
    <path d="M44 194v21h75M351 72h68v39M40 57h95" stroke="#52616b"/>
    <text x="41" y="48" fill="#98a8b1" font-size="11" font-family="monospace">VISTA DA BANCADA</text>
    <text x="356" y="64" fill="#f5a46b" font-size="11" font-family="monospace">MIG/MAG</text>
  </svg>`
  return figura
}

export function telaMenu(app: App): void {
  app.ir((app) => {
    app.raiz.classList.add('tela-inicio')
    const teclas = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('[role="dialog"]')) return
      MODOS.find(m => m.tecla === e.key)?.abrir(app)
    }
    window.addEventListener('keydown', teclas)
    const emAndamento = app.torneios.filter(t => t.status === 'em-andamento').sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]
    const vez = emAndamento ? vezAtual(app.baseDoTorneio(emAndamento.id)) : null
    const nome = vez ? app.perfis.find(p => p.id === vez.participanteId)?.nome : null
    anexar(app.raiz,
      h('div', { class: 'inicio-cabecalho' },
        h('div', {}, h('p', { class: 'sobretitulo' }, 'LABORATÓRIO VIRTUAL / ALPHA v1.4'),
          h('h2', { class: 'tela-titulo', tabindex: '-1' }, 'Seu próximo passe começa aqui.')),
        h('span', { class: 'estado-local' }, h('i', { 'aria-hidden': 'true' }), 'Estação local')),
      h('section', { class: 'inicio-hero', 'aria-label': 'Começar a soldar' },
        h('div', { class: 'inicio-convite' },
          h('p', { class: 'sobretitulo' }, 'AJUSTE. EXECUTE. INVESTIGUE.'),
          h('h3', {}, 'Aprenda na bancada.', h('br'), h('span', {}, 'Evolua a cada tentativa.')),
          h('p', {}, 'Controle a tocha, inspecione seu cordão e entenda como suas escolhas mudam o resultado.'),
          h('div', { class: 'acoes' },
            h('button', { class: 'primario', type: 'button', on: { click: () => telaTreino(app) } }, icone('treino'), 'Praticar agora'),
            h('button', { type: 'button', on: { click: () => telaArcade(app) } }, 'Entrar no Arcade', icone('continuar')))),
        h('div', { class: 'inicio-visual' }, ilustracao(),
          h('p', { class: 'legenda-estacao' }, '01 / Preparação', h('span', {}, '02 / Execução'), h('span', {}, '03 / Inspeção')))),
      h('section', { class: 'processos', 'aria-label': 'Processos de soldagem' },
        h('span', { class: 'sobretitulo' }, 'PROCESSO'),
        h('span', { class: 'processo-ativo' }, h('i', { 'aria-hidden': 'true' }), 'MIG/MAG', h('small', {}, 'disponível')),
        h('button', { class: 'processo-planejado', type: 'button', on: { click: () => abrirPainel('Eletrodo revestido · planejado', h('div', {},
          h('p', {}, 'Este processo ainda não está disponível para jogar.'),
          h('p', {}, 'A próxima etapa será desenvolver controles e um modelo próprios para eletrodo revestido, antes de liberar desafios e pontuação.'),
          h('p', { class: 'nota' }, 'Por enquanto, todos os treinos e competições usam MIG/MAG.'))) } }, 'Eletrodo revestido', h('small', {}, 'planejado'))),
      emAndamento ? h('button', { type: 'button', class: 'continuar', on: { click: () => painelTorneio(app, emAndamento.id) } },
        icone('continuar'), h('span', {}, h('strong', {}, `Retomar ${emAndamento.config.nome}`), h('small', {}, nome ? `Vez de ${nome}` : 'Torneio em andamento'))) : null,
      h('nav', { class: 'atalhos-inicio', 'aria-label': 'Escolher atividade' },
        h('ul', { class: 'grade-atividades' }, MODOS.map(m => h('li', {},
          h('button', { type: 'button', class: 'atividade', 'aria-keyshortcuts': m.tecla, on: { click: () => m.abrir(app) } },
            h('div', { class: 'atividade-topo' }, icone(m.icone), h('span', {}, m.etiqueta), h('kbd', {}, m.tecla)),
            h('strong', {}, m.titulo), h('span', { class: 'atividade-descricao' }, m.descricao)))))),
      h('footer', { class: 'rodape-estacao' },
        h('span', {}, icone(app.preferencias.dispositivo), NOME_DISPOSITIVO[app.preferencias.dispositivo]),
        h('span', {}, `${app.recordes.length} resultado(s) · ${app.perfis.length} participante(s)`),
        h('span', {}, app.persistente ? 'Offline · dados neste navegador' : 'Armazenamento indisponível')),
    )
    return () => window.removeEventListener('keydown', teclas)
  }, '')
}
