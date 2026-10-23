import { vezAtual } from '../../dados/torneio'
import { NOME_DISPOSITIVO } from '../../entrada/tipos'
import type { App } from '../app'
import { icone } from '../componentes/icones'
import { anexar, h } from '../dom'
import { telaArcade } from './arcade'
import { telaConfiguracoes } from './configuracoes'
import { telaHistoria } from './historia'
import { telaRecordes } from './recordes'
import { painelTorneio, telaTorneios } from './torneio'
import { telaTreino } from './treino'

interface Modo {
  tecla: string
  icone: string
  titulo: string
  descricao: string
  abrir: (app: App) => void
  destaque?: boolean
}

const MODOS: Modo[] = [
  { tecla: '1', icone: 'historia', titulo: 'História', descricao: 'Capítulos com Aprendiz e Profissional', abrir: telaHistoria, destaque: true },
  { tecla: '2', icone: 'arcade', titulo: 'Arcade', descricao: 'Desafios aleatórios, 3 vidas, combo', abrir: telaArcade, destaque: true },
  { tecla: '3', icone: 'torneio', titulo: 'Torneio local', descricao: 'Por turnos, com ou sem professor', abrir: telaTorneios },
  { tecla: '4', icone: 'treino', titulo: 'Treino', descricao: 'Livre ou por missão, sem contar', abrir: telaTreino },
  { tecla: '5', icone: 'recordes', titulo: 'Recordes', descricao: 'Rankings deste computador', abrir: (app) => telaRecordes(app) },
  { tecla: '6', icone: 'config', titulo: 'Configurações', descricao: 'Bancada: máquina e dispositivo', abrir: telaConfiguracoes },
]

export function telaMenu(app: App): void {
  app.ir((app) => {
    const teclas = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.ctrlKey || e.altKey || e.metaKey) return
      MODOS.find((m) => m.tecla === e.key)?.abrir(app)
    }
    window.addEventListener('keydown', teclas)

    const emAndamento = app.torneios.filter((t) => t.status === 'em-andamento').sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]
    const vez = emAndamento ? vezAtual(app.baseDoTorneio(emAndamento.id)) : null
    const nomeVez = vez ? app.perfis.find((p) => p.id === vez.participanteId)?.nome : null

    anexar(
      app.raiz,
      h(
        'section',
        { class: 'hero' },
        h(
          'div',
          { class: 'hero-texto' },
          h('p', { class: 'hero-sobre' }, 'MIG/MAG · aço carbono · inox · alumínio'),
          h('h2', { class: 'tela-titulo hero-titulo', tabindex: '-1' }, 'Oficina de', h('br'), h('span', {}, 'Soldagem')),
          h('p', { class: 'hero-sub' }, 'Regule a máquina, controle a tocha e veja o que o modelo prevê para o seu cordão.'),
        ),
        h('div', { class: 'hero-cena', 'aria-hidden': 'true' }, h('div', { class: 'chapa' }), h('div', { class: 'cordao' }), h('div', { class: 'tocha' }), h('div', { class: 'arco' }), h('div', { class: 'faiscas' }, Array.from({ length: 8 }, () => h('i')))),
      ),
      emAndamento
        ? h(
            'button',
            { type: 'button', class: 'continuar', on: { click: () => painelTorneio(app, emAndamento.id) } },
            icone('continuar'),
            h('span', {}, h('strong', {}, `Continuar "${emAndamento.config.nome}"`), h('small', {}, nomeVez ? `Vez de ${nomeVez}` : 'Abrir o painel do torneio')),
          )
        : null,
      h(
        'ul',
        { class: 'grade-modos' },
        MODOS.map((m) =>
          h(
            'li',
            {},
            h(
              'button',
              { type: 'button', class: `modo ${m.destaque ? 'modo-destaque' : ''}`, 'aria-keyshortcuts': m.tecla, on: { click: () => m.abrir(app) } },
              icone(m.icone, 'icone modo-icone'),
              h('span', { class: 'modo-titulo' }, m.titulo),
              h('span', { class: 'modo-desc' }, m.descricao),
              h('kbd', {}, m.tecla),
            ),
          ),
        ),
      ),
      h(
        'footer',
        { class: 'rodape-menu' },
        h('span', { class: 'chip-info' }, icone(app.preferencias.dispositivo), ` Dispositivo: ${NOME_DISPOSITIVO[app.preferencias.dispositivo]}`),
        h('span', {}, 'Tudo fica salvo só neste navegador, sem conta e sem internet.'),
        app.persistente ? null : h('strong', {}, ' O armazenamento está bloqueado: nada será salvo.'),
      ),
    )
    return () => window.removeEventListener('keydown', teclas)
  }, '')
}
