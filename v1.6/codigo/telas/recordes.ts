/*
 * █ Tela: recordes
 *
 * O que faz: Rankings das missões e do Arcade guardados neste navegador, com
 *    exportar/importar.
 */

import { menuOficina } from '../partes-das-telas/menu-da-oficina'
import { telaMenu } from './menu-inicial'
import { chaveRanking, ranking, type Recorde } from '../salvamento/recordes-das-missoes'
import { chaveRankingArcade, rankingArcade } from '../arcade/recordes-do-arcade'
import { NOME_DISPOSITIVO } from '../dispositivos/lista-de-dispositivos'
import { buscarMissao, NOME_DIFICULDADE } from '../missoes/lista-de-missoes'
import { MATERIAIS } from '../simulacao-mig/materiais-e-gases'
import { CATEGORIAS, NOME_CATEGORIA } from '../pontuacao/regras-de-pontuacao'
import type { App } from '../interface/aplicativo'
import { confirmar } from '../interface/janelas-de-dialogo'
import { dataHora, h, n1, titulo, anexar } from '../interface/criar-elementos'

/*
 * Melhores pontuações. Um ranking por missão (e versão), dificuldade,
 * dispositivo e versão da pontuação — desafios diferentes não se comparam.
 */

function abasRecordes(app: App, atual: 'historia' | 'arcade'): HTMLElement {
  const aba = (id: 'historia' | 'arcade', rotulo: string) =>
    h('button', { type: 'button', role: 'tab', 'aria-selected': String(atual === id), on: { click: () => (id === 'arcade' ? telaRecordesArcade(app) : telaRecordesHistoria(app)) } }, rotulo)
  return h('div', { class: 'abas abas-grandes', role: 'tablist', 'aria-label': 'Tipo de recorde' }, aba('arcade', 'Arcade (partidas)'), aba('historia', 'História (por missão)'))
}

/** Recordes das partidas de Arcade, por dispositivo. */
export function telaRecordesArcade(app: App): void {
  app.ir((app) => {
    document.body.classList.add('menu-grafico')
    app.raiz.classList.add('recordes-oficina')
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
      h('button', { type: 'button', on: { click: () => telaRecordes(app) } }, '← Voltar aos recordes'),
      chaves.length ? h('div', { class: 'campo' }, h('label', { for: 'ranking-arcade' }, 'Dispositivo e versão das regras'), seletor) : null,
      tabela,
      h('p', { class: 'dica' }, 'Cada partida sorteia desafios diferentes: este ranking é de diversão, não uma comparação técnica entre jogadores.'),
    )
    desenhar()
    return () => { document.body.classList.remove('menu-grafico'); app.raiz.classList.remove('recordes-oficina') }
  }, 'Recordes · Arcade')
}

function telaRecordesHistoria(app: App, chaveInicial?: string): void {
  app.ir((app) => {
    document.body.classList.add('menu-grafico')
    app.raiz.classList.add('recordes-oficina')
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
      telaRecordesHistoria(app, chave)
    }

    anexar(app.raiz, 
      titulo('Recordes', 'Guardados só neste navegador. Podem ser perdidos se os dados do site forem apagados.'),
      abasRecordes(app, 'historia'),
      h('button', { type: 'button', on: { click: () => telaRecordes(app) } }, '← Voltar aos recordes'),
      chaves.length ? h('div', { class: 'campo' }, h('label', { for: 'ranking-escolha' }, 'Desafio (missão, dificuldade, dispositivo e versão das regras)'), seletor) : null,
      tabela,

    )
    desenhar()
    return () => { document.body.classList.remove('menu-grafico'); app.raiz.classList.remove('recordes-oficina') }
  }, 'Recordes')
}

/** Entrada padrão: partidas de Arcade; links com chave abrem a missão correspondente. */
export function telaRecordes(app: App, chaveInicial?: string): void {
  if (chaveInicial !== undefined) telaRecordesHistoria(app, chaveInicial)
  else menuOficina(app, 'RECORDES', 'OFICINA / SUAS MARCAS', [
    { nome: 'ARCADE', descricao: 'Partidas, pontuação e desafios concluídos.', abrir: () => telaRecordesArcade(app) },
    { nome: 'HISTÓRIA', descricao: 'Resultados por missão, dificuldade e dispositivo.', abrir: () => telaRecordesHistoria(app) },
  ], { nome: 'VOLTAR AO MENU', descricao: 'Voltar ao início da oficina.', abrir: () => telaMenu(app) })
}
