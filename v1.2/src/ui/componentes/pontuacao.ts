import { FICHA_CATEGORIA, type ResultadoPontuacao } from '../../pontuacao/regras'
import { abrirPainel } from '../dialogo'
import { contarAte, h, n1 } from '../dom'

/**
 * Conceito estilo arcade (S, A, B, C, D) — só APRESENTAÇÃO da nota total.
 * Entrega não aprovada fica no máximo com C, para o conceito não esconder um
 * requisito essencial descumprido (docs/PONTUACAO.md).
 */
export function conceito(total: number, aprovada: boolean): string {
  const c = total >= 95 ? 'S' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D'
  return !aprovada && 'SAB'.includes(c) ? 'C' : c
}

/** O que mais provavelmente fez a solda não ser aprovada, em linguagem de bancada. */
function dicaReprovada(r: ResultadoPontuacao): string {
  const falhas = r.essenciais.filter((e) => !e.cumprida).map((e) => e.id)
  // O problema que ocupa mais junta.
  const problema = [...r.problemas].sort((a, b) => b.fimMm - b.inicioMm - (a.fimMm - a.inicioMm))[0]?.descricao ?? ''
  const base = 'Enquanto a solda não for aprovada, deformação e eficiência ficam em zero: economia não compensa um requisito essencial.'
  if (falhas.includes('E4')) return `${base} Marque a remoção do óxido na preparação.`
  if (falhas.includes('E2') || /perfura|excessiv/.test(problema)) return `${base} Calor demais por mm: ande mais rápido ou reduza alimentação/tensão.`
  if (falhas.includes('E3')) return `${base} Houve trecho sem cordão: não feche o arco no meio e cubra do INÍCIO ao FIM.`
  if (/falta/.test(problema)) return `${base} Falta de fusão: ande mais devagar (fique na faixa verde de velocidade) ou aumente alimentação/tensão.`
  if (/borda/.test(problema)) return `${base} O cordão saiu da junta: mantenha a tocha sobre a linha.`
  return base
}

/**
 * Painel da pontuação automática, para caber numa tela: conceito, total,
 * aprovação, categorias em barras e condições essenciais numa linha cada.
 * "O que aconteceu e como é calculado" (o detalhe de cada categoria, as
 * penalidades e os trechos com problema) abre numa sobreposição.
 */
export function montarPontuacao(r: ResultadoPontuacao, opcoes: { animar?: boolean; rotulo?: string } = {}): HTMLElement {
  const total = h('span', { class: 'placar-numero' }, opcoes.animar ? '0,0' : n1(r.total))
  if (opcoes.animar) contarAte(total, r.total)
  const letra = conceito(r.total, r.aprovada)

  const categorias = h(
    'ul',
    { class: 'barras-categorias', 'aria-label': 'Notas por categoria' },
    r.categorias.map((c) => {
      // Categoria zerada pela regra de aprovação: mostra quanto valeria, para não parecer defeito.
      const zerada = r.penalidades.find((p) => p.descricao === `${c.nome} zerada`)
      const valeria = zerada ? -zerada.pontos : 0
      return h(
        'li',
        {},
        h('div', { class: 'barra-cabeca' }, h('span', {}, c.nome), zerada ? h('small', { class: 'nota-zerada', title: 'Zerada porque a solda não foi aprovada' }, `valeria ${n1(valeria)}`) : null, h('strong', {}, `${n1(c.pontos)} / ${c.maximo}`)),
        h(
          'div',
          { class: 'barra-trilho', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(c.maximo), 'aria-valuenow': String(c.pontos), 'aria-label': c.nome },
          zerada ? h('div', { class: 'barra-valeria', style: `width:${(valeria / c.maximo) * 100}%` }) : null,
          h('div', { class: 'barra-valor', style: `width:${c.maximo ? (c.pontos / c.maximo) * 100 : 0}%` }),
        ),
      )
    }),
  )

  // O detalhe de cada categoria, as penalidades e os trechos com problema ficam numa sobreposição.
  const detalhe = () =>
    h(
      'div',
      { class: 'detalhe-pontuacao' },
      r.categorias.map((c) => {
        const ficha = FICHA_CATEGORIA[c.id]
        return h(
          'section',
          { class: 'cartao' },
          h('h4', {}, `${c.nome}: ${n1(c.pontos)} / ${c.maximo}`),
          h('p', {}, c.explicacao),
          h('dl', { class: 'ficha' }, h('dt', {}, 'Definição'), h('dd', {}, ficha.definicao), h('dt', {}, 'Dados'), h('dd', {}, ficha.dados), h('dt', {}, 'Regra'), h('dd', {}, ficha.regra), h('dt', {}, 'Limitações'), h('dd', {}, ficha.limitacoes)),
        )
      }),
      h(
        'section',
        { class: 'cartao' },
        h('h4', {}, 'Condições essenciais'),
        h('ul', { class: 'lista-essenciais' }, r.essenciais.map((e) => h('li', { class: e.cumprida ? 'ok' : 'falha' }, h('strong', {}, `${e.cumprida ? '✔' : '✖'} ${e.descricao}. `), e.justificativa))),
        r.penalidades.length ? h('h4', {}, 'Penalidades') : null,
        r.penalidades.length ? h('ul', { class: 'lista-penalidades' }, r.penalidades.map((p) => h('li', {}, h('strong', {}, `${p.descricao} (${n1(p.pontos)})`), ` — ${p.justificativa}`))) : null,
        h('h4', {}, 'Trechos com problema (previsão sintética)'),
        r.problemas.length
          ? h('ul', { class: 'lista-problemas' }, r.problemas.map((p) => h('li', {}, `${n1(p.inicioMm)} a ${n1(p.fimMm)} mm: ${p.descricao}`)))
          : h('p', { class: 'dica' }, 'Nenhum trecho com problema previsto.'),
        h('p', { class: 'dica pequena' }, `Regras ${r.versao}. O conceito (${letra}) é só apresentação da nota. A integridade é uma previsão sintética do modelo, não um ensaio.`),
      ),
    )

  return h(
    'section',
    { class: 'painel-pontuacao', 'aria-label': 'Pontuação automática' },
    h(
      'div',
      { class: 'placar' },
      h('span', { class: `conceito conceito-${letra}`, 'aria-label': `Conceito ${letra}` }, letra),
      h('div', {}, h('span', { class: 'placar-rotulo' }, opcoes.rotulo ?? 'PONTUAÇÃO AUTOMÁTICA'), h('div', {}, total, h('span', { class: 'placar-max' }, '/ 100'))),
    ),
    r.aprovada
      ? h('p', { class: 'selo selo-ok' }, '✔ Aprovada — condições essenciais cumpridas')
      : h('p', { class: 'selo selo-falha' }, '✖ Não aprovada — condição essencial descumprida'),
    r.aprovada ? null : h('p', { class: 'dica dica-reprovada' }, dicaReprovada(r)),
    categorias,
    h('ul', { class: 'essenciais-curtos', 'aria-label': 'Condições essenciais' }, r.essenciais.map((e) => h('li', { class: e.cumprida ? 'ok' : 'falha', title: e.justificativa }, `${e.cumprida ? '✔' : '✖'} ${e.descricao}`))),
    h(
      'button',
      { type: 'button', class: 'botao-fantasma botao-detalhe', on: { click: () => abrirPainel('O que aconteceu e como é calculado', detalhe()) } },
      `O que aconteceu e como é calculado${r.problemas.length ? ` · ${r.problemas.length} trecho(s) com problema` : ''}`,
    ),
  )
}
