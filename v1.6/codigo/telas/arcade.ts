/*
 * █ Tela: Arcade
 *
 * O que faz: Partidas de desafios sorteados, com vidas e combo.
 *
 * Onde mexer: As regras dos desafios estão em arcade/desafios-sorteados.ts.
 */

import { etapaArcade } from '../arcade/desafios-sorteados'
import { seloMaterial } from '../partes-das-telas/selo-do-material'
import {
  avaliarDesafio,
  descreverCondicao,
  gerarDesafio,
  missaoDoDesafio,
  multiplicador,
  VERSAO_ARCADE,
  VIDAS_INICIAIS,
  type Desafio,
  type ResultadoDesafio,
} from '../arcade/desafios-sorteados'
import { descompactar } from '../salvamento/registro-compacto'
import { NOME_MAXIMO, normalizarNome } from '../salvamento/recordes-das-missoes'
import { chaveRankingArcade, criarRecordeArcade, rankingArcade, type DesafioRegistrado, type RecordeArcade } from '../arcade/recordes-do-arcade'
import { NOME_DISPOSITIVO, type Dispositivo } from '../dispositivos/lista-de-dispositivos'
import { NOME_DIFICULDADE, descreverJunta } from '../missoes/lista-de-missoes'
import { tecnicaDe } from '../simulacao-mig/regulagem-da-maquina'
import { pontuarRegistro } from '../pontuacao/pontuar-tentativa'
import { VERSAO_PONTUACAO, type ResultadoPontuacao } from '../pontuacao/regras-de-pontuacao'
import type { App } from '../interface/aplicativo'
import { icone } from '../partes-das-telas/icones'
import { montarPontuacao } from '../partes-das-telas/quadro-de-pontuacao'
import { anexar, contarAte, dataHora, h, n0, n1, titulo } from '../interface/criar-elementos'
import { telaExecucao } from './soldagem-mig'
import { telaMenu } from './menu-inicial'
import { montarPreparacao, type ConfiguracaoTentativa } from './preparacao-da-missao'

/*
 * Arcade: desafios aleatórios em sequência. Três vidas; cada desafio tem uma
 * tentativa; acertar seguidas aumenta o combo. A peça de teste da bancada é
 * livre. A partida não é salva no meio (só o recorde no fim).
 */

interface Partida {
  nome: string
  dispositivo: Dispositivo | null
  vidas: number
  pontos: number
  combo: number
  desafio: Desafio
  historico: (DesafioRegistrado & { pontos: number; motivo: string })[]
  ultimaConfig?: ConfiguracaoTentativa
}

const CONTEXTO = 'Arcade'

function aleatorio(app: App): () => number {
  return app.ambiente.aleatorio
}

function placarTopo(p: Partida): HTMLElement {
  return h(
    'div',
    { class: 'placar-arcade', role: 'status' },
    h('span', { class: 'placar-item' }, h('small', {}, 'PONTOS'), h('strong', {}, n0(p.pontos))),
    h('span', { class: 'placar-item' }, h('small', {}, 'DESAFIO'), h('strong', {}, String(p.desafio.numero))),
    h('span', { class: 'placar-item' }, h('small', {}, 'COMBO'), h('strong', {}, `×${multiplicador(p.combo).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`)),
    h(
      'span',
      { class: 'placar-item vidas', 'aria-label': `${p.vidas} vida(s)` },
      h('small', {}, 'VIDAS'),
      h('span', { class: 'coracoes' }, Array.from({ length: VIDAS_INICIAIS }, (_, i) => icone('coracao', i < p.vidas ? 'icone cheio' : 'icone vazio'))),
    ),
  )
}

export function telaArcade(app: App): void {
  app.ir((app) => {
    const campo = h('input', { id: 'arcade-nome', type: 'text', maxlength: String(NOME_MAXIMO), value: app.preferencias.ultimoNome, autocomplete: 'nickname', placeholder: 'ex.: Vic' })
    const erro = h('p', { class: 'erro', role: 'alert' })
    const lista = rankingArcade(app.recordesArcade, chaveRankingArcade({ dispositivo: app.preferencias.dispositivo, versaoArcade: VERSAO_ARCADE, versaoPontuacao: VERSAO_PONTUACAO })).slice(0, 5)
    const comecar = (e: Event) => {
      e.preventDefault()
      const nome = normalizarNome(campo.value)
      if (!nome) {
        erro.textContent = 'Escreva um nome ou apelido.'
        return
      }
      app.preferencias.ultimoNome = nome
      app.salvar('preferencias')
      const p: Partida = { nome, dispositivo: null, vidas: VIDAS_INICIAIS, pontos: 0, combo: 0, desafio: gerarDesafio(1, aleatorio(app)), historico: [] }
      apresentarDesafio(app, p)
    }
    anexar(
      app.raiz,
      h(
        'div',
        { class: 'arcade-abertura' },
        h(
          'form',
          { class: 'cartao cartao-destaque form-nome', on: { submit: comecar } },
          icone('arcade', 'icone grande'),
          h('h2', { class: 'tela-titulo titulo-arcade', tabindex: '-1' }, 'DESAFIOS'),
          h('p', { class: 'piscar' }, 'TRÊS VIDAS. ATÉ ONDE VOCÊ CHEGA?'),
          h(
            'ul',
            { class: 'regras-arcade' },
            h('li', {}, icone('coracao'), ' 3 vidas: cada desafio não concluído custa uma.'),
            h('li', {}, icone('raio'), ' Desafios progressivos: aquecimento, controle, técnica e tempo.'),
            h('li', {}, icone('estrela'), ' Acertos seguidos aumentam o combo (até ×2).'),
            h('li', {}, icone('ajuste'), ' Uma tentativa por desafio; a peça de teste da bancada é livre.'),
          ),
          h('label', { for: 'arcade-nome' }, 'Nome ou apelido'),
          campo,
          erro,
          h('button', { type: 'submit', class: 'primario grande largura-total' }, icone('continuar'), ' Começar partida'),
        ),
        h(
          'section',
          { class: 'cartao' },
          h('h3', {}, `Melhores · ${NOME_DISPOSITIVO[app.preferencias.dispositivo]}`),
          lista.length
            ? h('ol', { class: 'mini-ranking' }, lista.map((r) => h('li', {}, h('span', {}, r.nome), h('strong', {}, n0(r.pontos)))))
            : h('p', { class: 'dica' }, 'Ainda sem recordes neste dispositivo.'),
          h('p', { class: 'dica' }, 'Cada partida sorteia desafios diferentes: o ranking é de diversão, não uma comparação técnica.'),
        ),
      ),
    )
  }, CONTEXTO)
}

function apresentarDesafio(app: App, p: Partida): void {
  app.ir((app) => {
    const m = missaoDoDesafio(p.desafio)
    const c = descreverCondicao(p.desafio.condicao)
    anexar(
      app.raiz,
      placarTopo(p),
      h(
        'section',
        { class: 'cartao-desafio', 'aria-labelledby': 'titulo-desafio' },
        h('p', { class: 'desafio-num' }, `DESAFIO ${p.desafio.numero}`),
        h('p', { class: 'dica' }, etapaArcade(p.desafio.numero)),
        h('h2', { id: 'titulo-desafio', class: 'tela-titulo', tabindex: '-1' }, m.titulo),
        h('p', { class: 'desafio-material' }, seloMaterial(m.material, m.geometria.espessuraMm), ` ${NOME_DIFICULDADE[p.desafio.dificuldade]}`),
        h('p', {}, m.contexto),
        h('p', { class: 'dica' }, descreverJunta(m)),
        h('div', { class: `condicao condicao-${p.desafio.condicao.tipo}` }, h('strong', {}, c.titulo), h('span', {}, c.texto)),
        h('button', { type: 'button', class: 'primario grande', on: { click: () => bancada(app, p) } }, 'Para a bancada'),
      ),
    )
  }, `${CONTEXTO} · desafio ${p.desafio.numero}`)
}

function bancada(app: App, p: Partida): void {
  app.ir((app) => {
    const m = missaoDoDesafio(p.desafio)
    const cond = p.desafio.condicao
    const travas =
      cond.tipo === 'maquina-ajustada'
        ? { ajustes: cond.ajustes, preparo: cond.preparo }
        : cond.tipo === 'tecnica'
          ? { preparo: { tecnica: cond.tecnica } }
          : undefined
    const c = descreverCondicao(cond)
    const prep = montarPreparacao(app, {
      missao: m,
      dificuldade: p.desafio.dificuldade,
      oficial: 'Soldar (1 tentativa)',
      treino: false,
      // A partida inteira usa o mesmo dispositivo do primeiro desafio.
      dispositivos: p.dispositivo ? [p.dispositivo] : undefined,
      inicial: p.ultimaConfig,
      travas,
      destaque: h('div', { class: `condicao condicao-${cond.tipo}` }, h('strong', {}, `Desafio ${p.desafio.numero}: ${c.titulo}`), h('span', {}, c.texto)),
      aoIniciar: (config) => soldar(app, p, config),
    })
    // Placar e título numa linha só: a bancada inteira cabe na tela.
    anexar(app.raiz, h('div', { class: 'linha-titulo-arcade' }, titulo('Bancada', `${m.titulo} · ${NOME_DIFICULDADE[p.desafio.dificuldade]}`), placarTopo(p)), prep.elemento)
    return prep.destruir
  }, `${CONTEXTO} · bancada`)
}

function soldar(app: App, p: Partida, config: ConfiguracaoTentativa): void {
  p.ultimaConfig = config
  p.dispositivo = config.dispositivo
  const m = missaoDoDesafio(p.desafio)
  app.ir(
    telaExecucao({
      missao: m,
      dificuldade: p.desafio.dificuldade,
      contexto: config.contexto,
      ajustes: config.ajustes,
      dispositivo: config.dispositivo,
      preferencias: app.preferencias,
      oficial: true,
      rotulo: `Desafio ${p.desafio.numero} · ${descreverCondicao(p.desafio.condicao).titulo}`,
      aoConcluir: ({ eventos }) => {
        const { resultado, sim } = pontuarRegistro(m, p.desafio.dificuldade, config.contexto, eventos)
        const r = avaliarDesafio(
          p.desafio,
          resultado,
          {
            aberturasDeArco: descompactar(eventos).filter((e) => e.tipo === 'inicio').length,
            tempoArcoS: sim.tempoDeArcoMs / 1000,
            tecnica: tecnicaDe(config.contexto),
            ajustes: config.ajustes,
          },
          p.combo,
        )
        concluir(app, p, resultado, r)
      },
      aoSair: () => concluir(app, p, null, { concluido: false, motivo: 'Tentativa abandonada.', pontos: 0, multiplicador: multiplicador(p.combo) }),
    }),
    `${CONTEXTO} · solda`,
  )
}

function concluir(app: App, p: Partida, resultado: ResultadoPontuacao | null, r: ResultadoDesafio): void {
  const m = missaoDoDesafio(p.desafio)
  p.historico.push({
    missaoId: m.id,
    missaoTitulo: m.titulo,
    dificuldade: p.desafio.dificuldade,
    material: m.material,
    condicao: descreverCondicao(p.desafio.condicao).titulo,
    total: resultado?.total ?? 0,
    concluido: r.concluido,
    pontos: r.pontos,
    motivo: r.motivo,
  })
  p.pontos += r.pontos
  if (r.concluido) p.combo++
  else {
    p.combo = 0
    p.vidas--
  }
  app.ir((app) => {
    const fim = p.vidas <= 0
    const ganho = h('strong', { class: 'ganho' }, '+0')
    if (r.concluido) contarAte(ganho, r.pontos, 0, 900)
    anexar(
      app.raiz,
      placarTopo(p),
      h(
        'section',
        { class: `cartao-desafio ${r.concluido ? 'sucesso' : 'falha'}` },
        h('p', { class: 'desafio-num' }, `DESAFIO ${p.desafio.numero}`),
        h('h2', { class: 'tela-titulo', tabindex: '-1' }, r.concluido ? 'CONCLUÍDO!' : fim ? 'FIM DE JOGO' : 'NÃO CONCLUÍDO'),
        r.concluido ? h('p', { class: 'ganho-linha' }, ganho, h('span', {}, ` pontos (nota ${n1(resultado!.total)} × combo ${r.multiplicador.toLocaleString('pt-BR', { maximumFractionDigits: 2 })})`)) : h('p', { class: 'motivo' }, `${r.motivo} Você perdeu uma vida.`),
        h('div', { class: 'acoes centro' }, fim ? h('button', { type: 'button', class: 'primario grande', on: { click: () => finalPartida(app, p) } }, 'Ver pontuação final') : h('button', { type: 'button', class: 'primario grande', on: { click: () => proximo(app, p) } }, icone('continuar'), ' Próximo desafio')),
      ),
      resultado ? h('details', { class: 'detalhes-resultado' }, h('summary', {}, 'Ver a pontuação detalhada desta solda'), montarPontuacao(resultado)) : null,
    )
  }, `${CONTEXTO} · resultado`)
}

function proximo(app: App, p: Partida): void {
  p.desafio = gerarDesafio(p.desafio.numero + 1, aleatorio(app), p.desafio)
  apresentarDesafio(app, p)
}

function finalPartida(app: App, p: Partida): void {
  app.ir((app) => {
    const numero = h('span', { class: 'placar-numero gigante' }, '0')
    contarAte(numero, p.pontos, 0, 1600)
    const campo = h('input', { id: 'arcade-final-nome', type: 'text', maxlength: String(NOME_MAXIMO), value: p.nome })
    const erro = h('p', { class: 'erro', role: 'alert' })
    const concluidos = p.historico.filter((x) => x.concluido).length
    const registrar = (e: Event) => {
      e.preventDefault()
      const nome = normalizarNome(campo.value)
      if (!nome) {
        erro.textContent = 'Informe um nome ou apelido.'
        return
      }
      const rec = criarRecordeArcade(
        {
          pontos: p.pontos,
          desafiosConcluidos: concluidos,
          desafios: p.historico.map(({ pontos: _p, motivo: _m, ...d }) => d),
          processo: 'MIG/MAG',
          dispositivo: p.dispositivo ?? app.preferencias.dispositivo,
          versaoArcade: VERSAO_ARCADE,
          versaoPontuacao: VERSAO_PONTUACAO,
        },
        nome,
        new Date(),
      )
      app.recordesArcade = [...app.recordesArcade, rec]
      app.salvar('recordesArcade')
      app.preferencias.ultimoNome = nome
      app.salvar('preferencias')
      rankingFinal(app, rec)
    }
    anexar(
      app.raiz,
      h(
        'div',
        { class: 'tela-centro' },
        h(
          'section',
          { class: 'cartao cartao-destaque placar-final' },
          h('p', { class: 'desafio-num' }, 'FIM DE JOGO'),
          h('h2', { class: 'tela-titulo', tabindex: '-1' }, 'Pontuação final'),
          numero,
          h('p', {}, `${concluidos} de ${p.historico.length} desafio(s) concluído(s) · ${NOME_DISPOSITIVO[p.dispositivo ?? app.preferencias.dispositivo]}`),
          h('ol', { class: 'lista-desafios' }, p.historico.map((x) => h('li', { class: x.concluido ? 'ok' : 'falha' }, h('span', {}, `${x.concluido ? '✔' : '✖'} ${x.missaoTitulo} · ${x.condicao}`), h('strong', {}, x.concluido ? `+${n0(x.pontos)}` : '—')))),
          h(
            'form',
            { on: { submit: registrar } },
            h('label', { for: 'arcade-final-nome' }, 'Confirme ou edite o nome do recorde'),
            campo,
            erro,
            h('p', { class: 'dica' }, 'Os recordes ficam só neste navegador e somem se os dados do site forem apagados.'),
            h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'botao-fantasma', on: { click: () => telaMenu(app) } }, 'Sair sem registrar'), h('button', { type: 'submit', class: 'primario' }, 'Registrar recorde')),
          ),
        ),
      ),
    )
  }, `${CONTEXTO} · fim`)
}

function rankingFinal(app: App, rec: RecordeArcade): void {
  app.ir((app) => {
    const lista = rankingArcade(app.recordesArcade, chaveRankingArcade(rec))
    const pos = lista.findIndex((r) => r.id === rec.id) + 1
    anexar(
      app.raiz,
      titulo(pos === 1 ? 'NOVO RECORDE!' : `${pos}º lugar`, `Arcade · ${NOME_DISPOSITIVO[rec.dispositivo]}`),
      pos === 1 ? h('p', { class: 'faixa-recorde', role: 'status' }, `★ ${rec.nome} lidera com ${n0(rec.pontos)} pontos ★`) : null,
      h(
        'table',
        { class: 'tabela ranking' },
        h('caption', {}, 'Melhores partidas'),
        h('thead', {}, h('tr', {}, ['Pos.', 'Nome', 'Pontos', 'Desafios', 'Data'].map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, lista.slice(0, 10).map((r, i) => h('tr', { class: r.id === rec.id ? 'destaque' : '' }, h('td', {}, `${i + 1}º`), h('th', { scope: 'row' }, r.nome), h('td', { class: 'num' }, n0(r.pontos)), h('td', { class: 'num' }, String(r.desafiosConcluidos)), h('td', {}, dataHora(r.data))))),
      ),
      h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'botao-secundario', on: { click: () => telaMenu(app) } }, 'Menu'), h('button', { type: 'button', class: 'primario grande', on: { click: () => telaArcade(app) } }, 'Jogar de novo')),
    )
  }, `${CONTEXTO} · ranking`)
}
