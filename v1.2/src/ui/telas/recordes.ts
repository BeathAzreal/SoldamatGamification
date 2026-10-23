import { chaveRanking, exportarRecordes, importarRecordes, ranking, type Recorde } from '../../dados/recordes'
import { chaveRankingArcade, exportarRecordesArcade, rankingArcade } from '../../dados/recordesArcade'
import { NOME_DISPOSITIVO } from '../../entrada/tipos'
import { buscarMissao, NOME_DIFICULDADE } from '../../missoes/catalogo'
import { MATERIAIS } from '../../modelo/material'
import { CATEGORIAS, NOME_CATEGORIA } from '../../pontuacao/regras'
import type { App } from '../app'
import { avisar, confirmar } from '../dialogo'
import { baixarArquivo, dataHora, h, n1, titulo, anexar } from '../dom'

/*
 * Melhores pontuações. Um ranking por missão (e versão), dificuldade,
 * dispositivo e versão da pontuação — desafios diferentes não se comparam.
 */

function abasRecordes(app: App, atual: 'historia' | 'arcade'): HTMLElement {
  const aba = (id: 'historia' | 'arcade', rotulo: string) =>
    h('button', { type: 'button', role: 'tab', 'aria-selected': String(atual === id), on: { click: () => (id === 'arcade' ? telaRecordesArcade(app) : telaRecordes(app)) } }, rotulo)
  return h('div', { class: 'abas abas-grandes', role: 'tablist', 'aria-label': 'Tipo de recorde' }, aba('historia', 'História (por missão)'), aba('arcade', 'Arcade (partidas)'))
}

/** Recordes das partidas de Arcade, por dispositivo. */
export function telaRecordesArcade(app: App): void {
  app.ir((app) => {
    const chaves = [...new Set(app.recordesArcade.map(chaveRankingArcade))].sort()
    let chave = chaves.find((c) => c.startsWith(app.preferencias.dispositivo)) ?? chaves[0]
    const tabela = h('div', {})
    const seletor = h('select', { id: 'ranking-arcade' }, chaves.map((c) => h('option', { value: c, selected: c === chave }, `${NOME_DISPOSITIVO[c.split('|')[0] as keyof typeof NOME_DISPOSITIVO] ?? c} · ${c.split('|').slice(1).join(' · ')}`)))
    const desenhar = () => {
      if (!chave) {
        tabela.replaceChildren(h('p', {}, 'Nenhuma partida de Arcade registrada ainda.'))
        return
      }
      const lista = rankingArcade(app.recordesArcade, chave)
      tabela.replaceChildren(
        h(
          'div',
          { class: 'rolagem-tabela' },
          h(
            'table',
            { class: 'tabela ranking' },
            h('caption', {}, `Partidas (${lista.length})`),
            h('thead', {}, h('tr', {}, ['Pos.', 'Nome', 'Pontos', 'Desafios concluídos', 'Desafios', 'Data', ''].map((c) => h('th', { scope: 'col' }, c)))),
            h(
              'tbody',
              {},
              lista.map((r, i) =>
                h(
                  'tr',
                  { class: i === 0 ? 'lider' : '' },
                  h('td', {}, i < 3 ? `${i + 1}º ★` : `${i + 1}º`),
                  h('th', { scope: 'row' }, r.nome),
                  h('td', { class: 'num' }, r.pontos.toLocaleString('pt-BR')),
                  h('td', { class: 'num' }, `${r.desafiosConcluidos} / ${r.desafios.length}`),
                  h('td', {}, r.desafios.map((d) => `${d.concluido ? '✔' : '✖'} ${d.missaoTitulo}`).join(' · ')),
                  h('td', {}, dataHora(r.data)),
                  h(
                    'td',
                    {},
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'pequeno perigo',
                        'aria-label': `Excluir a partida de ${r.nome}`,
                        on: {
                          click: async () => {
                            if (!(await confirmar('Excluir recorde?', `${r.nome}, ${r.pontos} pontos, de ${dataHora(r.data)}.`, { sim: 'Excluir', perigo: true }))) return
                            app.recordesArcade = app.recordesArcade.filter((x) => x.id !== r.id)
                            app.salvar('recordesArcade')
                            telaRecordesArcade(app)
                          },
                        },
                      },
                      'Excluir',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      )
    }
    seletor.addEventListener('change', () => {
      chave = seletor.value
      desenhar()
    })
    anexar(
      app.raiz,
      titulo('Recordes', 'Guardados só neste navegador. Podem ser perdidos se os dados do site forem apagados.'),
      abasRecordes(app, 'arcade'),
      chaves.length ? h('div', { class: 'campo' }, h('label', { for: 'ranking-arcade' }, 'Dispositivo e versão das regras'), seletor) : null,
      tabela,
      h('p', { class: 'dica' }, 'Cada partida sorteia desafios diferentes: este ranking é de diversão, não uma comparação técnica entre jogadores.'),
      h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'botao-secundario', disabled: app.recordesArcade.length === 0, on: { click: () => baixarArquivo(`arcade-soldagem-${new Date().toISOString().slice(0, 10)}.json`, exportarRecordesArcade(app.recordesArcade, new Date())) } }, 'Exportar JSON')),
    )
    desenhar()
  }, 'Recordes · Arcade')
}

export function telaRecordes(app: App, chaveInicial?: string): void {
  app.ir((app) => {
    const chaves = [...new Set(app.recordes.map(chaveRanking))].sort()
    let chave = chaveInicial && chaves.includes(chaveInicial) ? chaveInicial : chaves[0]
    const tabela = h('div', {})
    const seletor = h(
      'select',
      { id: 'ranking-escolha' },
      chaves.map((c) => {
        const r = app.recordes.find((x) => chaveRanking(x) === c)!
        const m = buscarMissao(r.missaoId)
        return h('option', { value: c, selected: c === chave }, `${m?.titulo ?? r.missaoTitulo} · ${NOME_DIFICULDADE[r.dificuldade]} · ${NOME_DISPOSITIVO[r.dispositivo]}${r.missaoVersao !== m?.versao ? ' · versão antiga da missão' : ''} · ${r.versaoPontuacao}`)
      }),
    )
    seletor.addEventListener('change', () => {
      chave = seletor.value
      desenhar()
    })

    const desenhar = () => {
      if (!chave) {
        tabela.replaceChildren(h('p', {}, 'Nenhum recorde registrado ainda. Jogue um capítulo do modo História.'))
        return
      }
      const lista = ranking(app.recordes, chave)
      const exemplo = lista[0]
      tabela.replaceChildren(
        h('p', { class: 'nota' }, `Processo ${exemplo.processo} · ${MATERIAIS[exemplo.material].nome}. Ordem: aprovadas primeiro, depois nota total, integridade, desenho e data.`),
        h(
          'div',
          { class: 'rolagem-tabela' },
          h(
            'table',
            { class: 'tabela ranking' },
            h('caption', {}, `Ranking (${lista.length} registro(s))`),
            h('thead', {}, h('tr', {}, ['Pos.', 'Nome', 'Total', 'Situação', ...CATEGORIAS.map((c) => NOME_CATEGORIA[c]), 'Data', ''].map((c) => h('th', { scope: 'col' }, c)))),
            h(
              'tbody',
              {},
              lista.map((r, i) =>
                h(
                  'tr',
                  { class: i === 0 ? 'lider' : '' },
                  h('td', {}, i < 3 ? `${i + 1}º ★` : `${i + 1}º`),
                  h('th', { scope: 'row' }, r.nome),
                  h('td', { class: 'num' }, n1(r.total)),
                  h('td', {}, r.aprovada ? 'aprovada' : 'não aprovada'),
                  CATEGORIAS.map((c) => h('td', { class: 'num' }, n1(r.categorias[c]))),
                  h('td', {}, dataHora(r.data)),
                  h('td', {}, h('button', { type: 'button', class: 'pequeno', 'aria-label': `Excluir o recorde de ${r.nome} (${n1(r.total)})`, on: { click: () => excluir(r) } }, 'Excluir')),
                ),
              ),
            ),
          ),
        ),
      )
    }

    const excluir = async (r: Recorde) => {
      if (!(await confirmar('Excluir recorde?', `${r.nome}, ${n1(r.total)} pontos, de ${dataHora(r.data)}. Esta ação não pode ser desfeita.`, { sim: 'Excluir', perigo: true }))) return
      app.recordes = app.recordes.filter((x) => x.id !== r.id)
      app.salvar('recordes')
      telaRecordes(app, chave)
    }

    const exportar = () => baixarArquivo(`recordes-soldagem-${new Date().toISOString().slice(0, 10)}.json`, exportarRecordes(app.recordes, new Date()))
    const arquivo = h('input', { type: 'file', accept: 'application/json,.json', id: 'importar-recordes', class: 'sr-only', tabindex: '-1', 'aria-hidden': 'true' })
    arquivo.addEventListener('change', async () => {
      const f = arquivo.files?.[0]
      if (!f) return
      const r = importarRecordes(await f.text(), app.recordes)
      arquivo.value = ''
      if (r.erro) return avisar('Importação recusada', `${r.erro} Nenhum recorde foi alterado.`)
      const detalhes = h(
        'div',
        {},
        h('p', {}, `${r.novos.length} recorde(s) novo(s), ${r.repetidos} já existente(s), ${r.recusados.length} recusado(s).`),
        r.recusados.length ? h('ul', {}, r.recusados.slice(0, 8).map((x) => h('li', {}, `Registro ${x.indice + 1}: ${x.motivo}`))) : null,
      )
      if (r.novos.length === 0) return avisar('Nada a importar', detalhes)
      if (!(await confirmar('Importar recordes?', detalhes, { sim: `Importar ${r.novos.length}` }))) return
      app.recordes = [...app.recordes, ...r.novos]
      app.salvar('recordes')
      telaRecordes(app, chave)
    })
    const apagarTodos = async () => {
      if (!(await confirmar('Apagar todos os recordes?', `${app.recordes.length} registro(s) serão apagados deste navegador. Exporte antes se quiser guardar uma cópia.`, { sim: 'Apagar todos', perigo: true }))) return
      app.recordes = []
      app.salvar('recordes')
      telaRecordes(app)
    }

    anexar(app.raiz, 
      titulo('Recordes', 'Guardados só neste navegador. Podem ser perdidos se os dados do site forem apagados.'),
      abasRecordes(app, 'historia'),
      chaves.length ? h('div', { class: 'campo' }, h('label', { for: 'ranking-escolha' }, 'Desafio (missão, dificuldade, dispositivo e versão das regras)'), seletor) : null,
      tabela,
      h(
        'div',
        { class: 'acoes' },
        h('button', { type: 'button', disabled: app.recordes.length === 0, on: { click: exportar } }, 'Exportar JSON'),
        h('button', { type: 'button', on: { click: () => arquivo.click() } }, 'Importar JSON'),
        arquivo,
        h('button', { type: 'button', class: 'perigo', disabled: app.recordes.length === 0, on: { click: apagarTodos } }, 'Apagar todos'),
      ),
      h('p', { class: 'nota' }, 'Os recordes ficam guardados só neste navegador e podem ser perdidos ao limpar os dados do site. A exportação gera um arquivo JSON que pode ser importado depois (o conteúdo é conferido antes).'),
    )
    desenhar()
  }, 'Recordes')
}
