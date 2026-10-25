/*
 * █ Tela: configurações
 *
 * O que faz: Opções do jogo: dispositivo, calibração, controles, qualidade
 *    gráfica e dados salvos.
 */

import { COLECOES, PREFIXO } from '../salvamento/armazenamento-no-navegador'
import { PREFERENCIAS_PADRAO } from '../salvamento/preferencias'
import { PECA_PADRAO } from '../missoes/lista-de-missoes'
import type { App } from '../interface/aplicativo'
import { montarBancada } from '../partes-das-telas/bancada-mig'
import { confirmar, pedirTexto } from '../interface/janelas-de-dialogo'
import { anexar, h, titulo } from '../interface/criar-elementos'
import { webglDisponivel } from '../desenho-3d/palco'
import { NOME_QUALIDADE, QUALIDADES, RESUMO_QUALIDADE, type Qualidade3D } from '../desenho-3d/qualidade-grafica'
import { telaMenu } from './menu-inicial'

/**
 * Configurações = bancada com a peça padrão (aço carbono 3 mm): escolher e
 * calibrar o dispositivo soldando, experimentar tensão, alimentação e
 * técnica. Abaixo, a gestão dos dados salvos.
 */
export function telaConfiguracoes(app: App): void {
  app.ir((app) => {
    const bancada = montarBancada(app, { missao: PECA_PADRAO, dificuldade: 'aprendiz', escolherJunta: true })

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
      'details',
      { class: 'mais-opcoes' },
      h('summary', { class: 'botao-fantasma' }, 'Visual 3D, calibração padrão e dados salvos'),
      h(
        'div',
        { class: 'mais-opcoes-caixa grade-cartoes' },
        cartaoVisual,
        h('section', { class: 'cartao' }, h('h3', {}, 'Calibração'), h('p', {}, 'O dispositivo escolhido aqui vira o padrão das partidas. A calibração fica no botão "Calibrar", ao lado da peça.'), h('button', { type: 'button', class: 'botao-secundario', on: { click: restaurar } }, 'Restaurar calibração padrão')),
        h(
          'section',
          { class: 'cartao' },
          h('h3', {}, 'Dados salvos'),
          h('p', {}, `Ficam só neste navegador (chaves "${PREFIXO}…"), separados em participantes, tentativas, entregas, torneios, avaliações, recordes e preferências. Nada é enviado pela internet.`),
          h('p', { class: 'dica' }, 'Limpar os dados do site no navegador apaga tudo. Exporte os recordes na tela de Recordes para guardar uma cópia.'),
          h('button', { type: 'button', class: 'perigo', on: { click: apagarTudo } }, 'Apagar todos os dados'),
        ),
      ),
    )

    // Tela em bloco: tudo cabe na altura da janela, sem rolar a página.
    app.raiz.classList.add('tela-bancada')
    const cabecalho = titulo('Configurações', 'Regule a máquina e o dispositivo soldando numa peça padrão de aço carbono de 3 mm.')
    cabecalho.append(outros)
    anexar(app.raiz, cabecalho, bancada.elemento)
    return () => bancada.destruir()
  }, 'Configurações')
}
