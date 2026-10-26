import { COLECOES, PREFIXO } from '../../dados/armazenamento'
import { PREFERENCIAS_PADRAO } from '../../dados/preferencias'
import { DISPOSITIVOS, NOME_DISPOSITIVO, type Dispositivo } from '../../entrada/tipos'
import type { App } from '../app'
import { montarControles } from '../componentes/controles'
import { montarCalibracao } from '../componentes/calibracao'
import { somArco } from '../som'
import { configurarControles15 } from '../componentes/controles15'
import { carregarControles15 } from '../../dados/controles15'
import { confirmar, pedirTexto } from '../dialogo'
import { anexar, h, titulo } from '../dom'
import { webglDisponivel } from '../../render/palco3d'
import { NOME_QUALIDADE, QUALIDADES, RESUMO_QUALIDADE, type Qualidade3D } from '../../render/qualidade3d'
import { telaMenu } from './menu'

/** Preferências do jogo, separadas da bancada de treino. */
export function telaConfiguracoes(app: App): void {
  app.ir((app) => {
    const dispositivo = h('select', { id: 'pref-dispositivo' }, DISPOSITIVOS.map(d => h('option', { value: d, selected: d === app.preferencias.dispositivo }, NOME_DISPOSITIVO[d])))
    dispositivo.addEventListener('change', () => {
      app.preferencias.dispositivo = dispositivo.value as Dispositivo
      app.salvar('preferencias')
      telaConfiguracoes(app)
    })
    const som = h('input', { type: 'checkbox', checked: app.preferencias.som })
    som.addEventListener('change', () => {
      app.preferencias.som = som.checked
      somArco.ligado = som.checked
      if (!som.checked) somArco.calar()
      app.salvar('preferencias')
      const topo = document.getElementById('botao-som')!
      topo.textContent = som.checked ? '🔊 Som' : '🔇 Som'
      topo.setAttribute('aria-pressed', String(som.checked))
    })

    const restaurar = async () => {
      if (!(await confirmar('Restaurar calibração?', 'Sensibilidade, zona morta, botões, opções da caneta e controles da câmera e da peça voltam ao padrão.'))) return
      const p = app.preferencias
      // O visual 3D não é calibração: fica como estava.
      app.preferencias = { ...PREFERENCIAS_PADRAO, ultimoNome: p.ultimoNome, dispositivo: p.dispositivo, qualidade3d: p.qualidade3d }
      app.salvar('preferencias')
      telaConfiguracoes(app)
    }
    const apagarTudo = async () => {
      const texto = await pedirTexto('Apagar todos os dados?', 'Recordes, torneios, avaliações e preferências deste navegador serão apagados. Para confirmar, escreva APAGAR.')
      if (texto !== 'APAGAR') return
      for (const c of COLECOES) app.repo.apagar(c)
      app.recordes = []
      app.recordesArcade = []
      app.perfis = []
      app.tentativas = []
      app.entregas = []
      app.torneios = []
      app.avaliacoes = []
      app.preferencias = { ...PREFERENCIAS_PADRAO }
      app.avisar('Todos os dados deste navegador foram apagados.')
      telaMenu(app)
    }

    // Visual da soldagem (3D): a qualidade só muda o custo do desenho.
    const temWebgl = webglDisponivel()
    const qualidade = h('select', { id: 'pref-qualidade3d', disabled: !temWebgl }, QUALIDADES.map((q) => h('option', { value: q, selected: q === app.preferencias.qualidade3d }, NOME_QUALIDADE[q])))
    const resumo = h('p', { class: 'dica' }, RESUMO_QUALIDADE[app.preferencias.qualidade3d])
    qualidade.addEventListener('change', () => {
      app.preferencias.qualidade3d = qualidade.value as Qualidade3D
      resumo.textContent = RESUMO_QUALIDADE[app.preferencias.qualidade3d]
      app.salvar('preferencias')
    })
    const cartaoVisual = h(
      'section',
      { class: 'cartao opcoes-visual' },
      h('h3', {}, 'Visual da soldagem'),
      h('div', { class: 'campo' }, h('label', { for: 'pref-qualidade3d' }, 'Qualidade do 3D'), qualidade),
      resumo,
      h(
        'p',
        { class: 'dica' },
        temWebgl
          ? 'Só muda o desenho: a mira, o cordão e a pontuação não mudam. Se o 3D ficar lento, o jogo baixa a qualidade sozinho.'
          : 'Este navegador não oferece WebGL: o jogo usa um desenho 2D de reserva.',
      ),
    )

    const outros = h(
      'div',
      {},
      h(
        'div',
        { class: 'mais-opcoes-caixa grade-cartoes' },
        cartaoVisual,
        h('section', { class: 'cartao' }, h('h3', {}, 'Calibração'), h('p', {}, 'O dispositivo escolhido aqui vira o padrão das partidas. Ajuste a sensibilidade e os botões abaixo; pratique depois em Treino.'), h('button', { type: 'button', class: 'botao-secundario', on: { click: restaurar } }, 'Restaurar calibração padrão')),
        h(
          'section',
          { class: 'cartao' },
          h('h3', {}, 'Dados salvos'),
          h('p', {}, `Ficam só neste navegador (chaves "${PREFIXO}…"), separados em participantes, tentativas, entregas, torneios, avaliações, recordes e preferências. Nada é enviado pela internet.`),
          h('p', { class: 'dica' }, 'Limpar os dados do site no navegador apaga tudo.'),
          h('button', { type: 'button', class: 'perigo', on: { click: apagarTudo } }, 'Apagar todos os dados'),
        ),
      ),
    )

    app.raiz.classList.add('app-cheia')
    const calibracao = montarCalibracao(app, app.preferencias.dispositivo, () => null, () => telaConfiguracoes(app))
    calibracao.elemento.querySelector('h4')?.remove()
    anexar(app.raiz,
      titulo('Configurações', 'Ajustes salvos automaticamente neste navegador.'),
      h('div', { class: 'config-paineis' },
        h('section', { class: 'cartao' }, h('h3', {}, 'Som e dispositivo'),
          h('label', {}, som, ' Som do arco'),
          h('div', { class: 'campo' }, h('label', { for: 'pref-dispositivo' }, 'Dispositivo padrão'), dispositivo)),
        h('section', { class: 'cartao' }, h('h3', {}, 'Câmera e peça'), montarControles(app)),
        h('section', { class: 'cartao' }, h('h3', {}, 'Calibração do dispositivo'), calibracao.elemento),
        h('section', { class: 'cartao' }, h('h3', {}, 'Eletrodo revestido'), h('p', {}, 'Teclas de altura, orientação da vareta, câmera e ferramentas.'), h('button', { type: 'button', class: 'botao-secundario', on: { click: () => { void configurarControles15(carregarControles15()) } } }, 'Configurar controles do eletrodo')),
        outros))
  }, 'Configurações')
}
