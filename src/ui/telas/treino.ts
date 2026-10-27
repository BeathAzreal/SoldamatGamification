import { menuOficina } from '../componentes/menuOficina'
import { telaMenu } from './menu'
import { EXERCICIOS_TECNICOS, type ExercicioTecnico } from '../../didatica/exercicios'
import { abrirPainel, confirmar } from '../dialogo'
import { DIFICULDADES, MISSOES, NOME_DIFICULDADE, PECA_PADRAO, type Dificuldade, type Missao, comJunta } from '../../missoes/catalogo'
import { MATERIAIS } from '../../modelo/material'
import { pontuarRegistro } from '../../pontuacao/oficial'
import type { App } from '../app'
import { montarInspecao } from '../componentes/inspecao'
import { montarPontuacao } from '../componentes/pontuacao'
import { h, n1, titulo, anexar } from '../dom'
import { telaExecucao } from './execucao'
import { montarPreparacao, type ConfiguracaoTentativa } from './missao'
import { botaoExplicacao, tentativaDoRegistro } from '../componentes/explicacao'
import type { Tentativa } from '../../modelo/avaliacao'
import { PECAS_ELETRODO } from '../../missoes/pecasEletrodo'
import { INFO_JUNTA } from '../../modelo/juntas'
import { telaTreinoEletrodo } from './treinoEletrodo'

/** Treino: navegação por processo e peça, sem ranking ou registro oficial. */
export function telaTreino(app: App): void {
  menuOficina(app, 'TREINO', 'OFICINA / PRÁTICA LIVRE', [
    { nome: 'MIG/MAG', descricao: 'Abra a bancada livre. Escolha a junta, regule a máquina e pratique.', abrir: () => escolherModo(app, 'MIG/MAG', 'TREINO / BANCADA LIVRE', (d) => treinoLivre(app, d), () => telaTreino(app)) },
    { nome: 'ELETRODO', descricao: 'Escolha a peça e pratique o controle da distância e o consumo da vareta.', abrir: () => escolherPecaEletrodo(app) },
    { nome: 'EXERCÍCIOS', descricao: 'Roteiros técnicos para experimentar, inspecionar e comparar tentativas.', abrir: () => { telaTreino(app); void escolherExercicio(app) } },
    { nome: 'TREINAR MISSÃO', descricao: 'Repita uma encomenda sem limite de tentativas.', abrir: () => escolherMissaoTreino(app) },
  ], { nome: 'VOLTAR AO MENU', descricao: 'Voltar ao início da oficina.', abrir: () => telaMenu(app) })
}

/** O que cada modo de pontuação faz, para a escolha antes de soldar (H88). */
export const DESCRICAO_MODO: Record<Dificuldade, string> = {
  aprendiz: 'Tolerâncias largas: um pouco fora da medida perde pouco. Bom para aprender o movimento.',
  profissional: 'Tolerâncias apertadas, perto das de norma: desvios e defeitos custam caro.',
}

/** Escolha do modo de pontuação antes de soldar (H88). */
function escolherModo(app: App, titulo: string, caminho: string, abrir: (d: Dificuldade) => void, voltar: () => void): void {
  menuOficina(app, titulo, caminho + ' / MODO DE PONTUAÇÃO', DIFICULDADES.map(d => ({
    nome: NOME_DIFICULDADE[d].toUpperCase(), descricao: DESCRICAO_MODO[d], abrir: () => abrir(d),
  })), { nome: 'VOLTAR', descricao: 'Voltar à escolha anterior.', abrir: voltar })
}

function escolherPecaEletrodo(app: App): void {
  menuOficina(app, 'ELETRODO', 'TREINO / ESCOLHA A PEÇA', PECAS_ELETRODO.map(p => ({
    nome: p.titulo,
    descricao: `${p.aplicacao} · ${n1(p.espessuraMm)} mm · ${INFO_JUNTA[p.junta].nome}. Avaliação visual e nota do treino.`,
    abrir: () => escolherModo(app, 'ELETRODO', 'TREINO / ' + p.titulo.toUpperCase(), (d) => telaTreinoEletrodo(app, p, d, () => escolherPecaEletrodo(app)), () => escolherPecaEletrodo(app)),
  })), { nome: 'VOLTAR AO TREINO', descricao: 'Escolher outro processo ou exercício.', abrir: () => telaTreino(app) })
}

function escolherMissaoTreino(app: App): void {
  menuOficina(app, 'MISSÕES', 'TREINO / ESCOLHA A ENCOMENDA', MISSOES.map(m => ({
    nome: m.titulo,
    descricao: `${MATERIAIS[m.material].nome} · ${n1(m.geometria.espessuraMm)} mm. ${m.desafio}`,
    abrir: () => menuOficina(app, 'DIFICULDADE', m.titulo, DIFICULDADES.map(d => ({
      nome: NOME_DIFICULDADE[d].toUpperCase(), descricao: `${DESCRICAO_MODO[d]} Treino sem limite de tentativas e sem registro oficial.`, abrir: () => treinoMissao(app, m, d),
    })), { nome: 'VOLTAR ÀS MISSÕES', descricao: 'Escolher outra encomenda.', abrir: () => escolherMissaoTreino(app) }),
  })), { nome: 'VOLTAR AO TREINO', descricao: 'Escolher outro processo ou exercício.', abrir: () => telaTreino(app) })
}

/** Um treino em andamento: a missão (ou a peça padrão), e o que repetir. */
interface SessaoTreino {
  m: Missao
  d: Dificuldade
  /** Treino livre: peça padrão com o tipo de junta escolhido na bancada. */
  exercicio?: ExercicioTecnico
  livre: boolean
  inicial?: ConfiguracaoTentativa
  /** Última tentativa avaliada, para a comparação (etapa 4). */
  anterior: Tentativa | null
}

function treinoLivre(app: App, d: Dificuldade): void {
  bancadaTreino(app, { m: PECA_PADRAO, d, livre: true, anterior: null })
}

function treinoMissao(app: App, m: Missao, d: Dificuldade): void {
  bancadaTreino(app, { m, d, livre: false, anterior: null })
}

function bancadaTreino(app: App, s: SessaoTreino): void {
  app.ir((app) => {
    app.escolherOutraPeca = () => s.livre ? telaTreino(app) : escolherMissaoTreino(app)
    const prep = montarPreparacao(app, {
      oficinaTreino: true,
      missao: s.m,
      dificuldade: s.d,
      oficial: null,
      treino: true,
      inicial: s.inicial,
      escolherJunta: s.livre,
      destaque: s.exercicio ? h('div', { class: 'faixa-regra' }, h('strong', {}, s.exercicio.titulo), h('button', { type: 'button', on: { click: () => abrirPainel(s.exercicio!.titulo, roteiro(s.exercicio!)) } }, 'Consultar roteiro')) : null,
      aoIniciar: (config) => {
        // No treino livre a junta vem da bancada.
        const m = s.livre ? comJunta(PECA_PADRAO, config.contexto.junta ?? 'topo') : s.m
        const atual: SessaoTreino = { ...s, m, inicial: config }
        app.ir(
          telaExecucao({
            missao: m,
            dificuldade: s.d,
            contexto: config.contexto,
            ajustes: config.ajustes,
            dispositivo: config.dispositivo,
            preferencias: app.preferencias,
            oficial: false,
            rotulo: s.livre ? `Treino livre · peça padrão · ${NOME_DIFICULDADE[s.d]}` : `Treino · ${m.titulo} · ${NOME_DIFICULDADE[s.d]}`,
            aoConcluir: ({ eventos }) => resultadoTreino(app, atual, config, eventos),
            aoSair: () => bancadaTreino(app, atual),
            aoEscolherPeca: () => s.livre ? telaTreino(app) : escolherMissaoTreino(app),
          }),
          'Treino · execução',
        )
      },
    })
    anexar(
      app.raiz,
      s.livre ? titulo('Treino livre', `Peça de teste de aço carbono · modo ${NOME_DIFICULDADE[s.d]} · escolha o tipo de junta · nada é registrado`) : titulo(`Treino: ${s.m.titulo}`, `${NOME_DIFICULDADE[s.d]} · nada é registrado`),
      prep.elemento,
    )
    return prep.destruir
  }, s.livre ? 'Treino livre' : 'Treino de missão')
}

function resultadoTreino(app: App, s: SessaoTreino, config: ConfiguracaoTentativa, eventos: Parameters<typeof pontuarRegistro>[3]): void {
  app.ir((app) => {
    const { resultado } = pontuarRegistro(s.m, s.d, config.contexto, eventos)
    const inspecao = montarInspecao({ missao: s.m, dificuldade: s.d, contexto: config.contexto, eventos, ajustes: config.ajustes, preparo: config.preparo, dispositivo: config.dispositivo })
    const tentativa = tentativaDoRegistro(config.contexto, eventos)
    // Tela travada: tudo cabe na janela; textos longos abrem em sobreposição.
    app.raiz.classList.add('tela-resultado')
    anexar(
      app.raiz,
      titulo('Resultado do treino', 'Treino: não entra no ranking nem em torneios.'),
      h('div', { class: 'grade-resultado' }, montarPontuacao(resultado, { animar: true, rotulo: 'TREINO — NÃO CONTA' }), inspecao.elemento),
      h(
        'div',
        { class: 'acoes' },
        s.exercicio ? h('button', { type: 'button', on: { click: () => abrirPainel('Investigar o resultado', roteiro(s.exercicio!)) } }, 'Roteiro e reflexão') : null,
        tentativa ? botaoExplicacao(tentativa, s.anterior) : null,
        h('button', { type: 'button', on: { click: () => telaTreino(app) } }, 'Outros treinos'),
        h('button', { type: 'button', class: 'primario', on: { click: () => bancadaTreino(app, { ...s, inicial: config, anterior: tentativa ?? s.anterior }) } }, 'Treinar de novo'),
      ),
    )
    return inspecao.destruir
  }, 'Treino · resultado')
}

/** Roteiro consultável; não impõe travas nem concede aprovação automática. */
function roteiro(e: ExercicioTecnico): HTMLElement {
  return h('section', {},
    h('p', {}, e.objetivo),
    h('h3', {}, 'Mantenha na comparação'), h('p', {}, e.manter),
    h('h3', {}, 'Experimente'), h('p', {}, e.variar),
    h('h3', {}, 'Inspecione'), h('p', {}, e.observar),
    h('h3', {}, 'Explique com suas palavras'), h('p', {}, e.pergunta),
    h('p', { class: 'nota' }, 'O roteiro orienta o experimento; os controles permanecem livres. Use “Treinar de novo” e “Por que saiu assim” para comparar. Se mudar outros fatores, repita antes de atribuir uma causa.'),
    h('p', { class: 'nota' }, 'Modelo qualitativo: valores e critérios do jogo. Estes exercícios não qualificam um procedimento de soldagem.'),
  )
}
async function escolherExercicio(app: App): Promise<void> {
  const seletor = h('select', { 'aria-label': 'Exercício técnico' },
    EXERCICIOS_TECNICOS.map((e) => h('option', { value: e.id }, e.titulo)))
  const conteudo = h('div', {})
  const atualizar = () => {
    const e = EXERCICIOS_TECNICOS.find((item) => item.id === seletor.value)!
    conteudo.replaceChildren(roteiro(e))
  }
  seletor.addEventListener('change', atualizar)
  atualizar()
  const iniciar = await confirmar('Exercícios técnicos · aço carbono 3 mm · topo',
    h('div', {}, seletor, conteudo), { sim: 'Iniciar exercício', nao: 'Voltar' })
  if (!iniciar) return
  const e = EXERCICIOS_TECNICOS.find((item) => item.id === seletor.value)!
  bancadaTreino(app, { m: PECA_PADRAO, d: 'aprendiz', livre: false, anterior: null, exercicio: e })
}
