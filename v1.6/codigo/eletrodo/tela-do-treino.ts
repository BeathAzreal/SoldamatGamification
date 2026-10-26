/*
 * █ Eletrodo: tela do treino
 *
 * O que faz: A tela inteira do treino de eletrodo: painel sobre a vista
 *    (estado, medidor do arco, vareta, avanço), painel lateral
 *    (objetivos, ferramentas, corrente, ajuda na altura) e o laço que
 *    roda a cada quadro.
 *
 * Onde mexer: Textos de estado estão em "mensagens" e TEXTO_FAIXA; os
 *    leituras do objetivo em itensObjetivo e o painel da nota em painelResultado; as opções de ajuda na altura em
 *    ajudaAltura.
 */

import { Acionamento15, RENDIMENTO15, VARETA15, velocidadeAltura15, type FaixaArco15 } from './arco-e-vareta'
import { Cordao } from '../simulacao-mig/cordao'
import { criarBancada15 } from './bancada-3d'
import type { App } from '../interface/aplicativo'
import { h, n0, n1 } from '../interface/criar-elementos'
import { carregarControles15, nomeTecla15 as nomeTecla } from './controles-salvos'
import { configurarControles15 } from './janela-de-controles'
import type { FerramentaBancada15 } from './escoria'
import { INFO_JUNTA } from '../simulacao-mig/tipos-de-junta-e-posicao'
import { aporteAlvoKJmm, type PecaEletrodo } from './pecas-de-treino'
import { RegistroPasse } from './registro-do-passe'
import { analisarEletrodo, LIMITES, type AnaliseEletrodo } from './analise-do-cordao'
import { inspecionarEletrodo, type ResultadoEletrodo } from './nota-do-eletrodo'
import { abrirPainel } from '../interface/janelas-de-dialogo'

/** Quadro muito longo (aba travada, depurador) não vira um salto de vários segundos de arco. */
const DT_MAX = 0.25
/** Largura mínima (mm) para contar um trecho como coberto pelo cordão. */
const LARGURA_COBERTA_MM = 2

const TEXTO_FAIXA: Record<FaixaArco15, string> = {
  curto: 'arco curto · risco de grudar',
  adequado: 'arco adequado · perto do diâmetro da alma',
  longo: 'arco longo · cordão largo, baixo e com respingos',
}

/**
 * Treino de eletrodo revestido (H59–H72): a peça escolhida no Treino, sem
 * botão de soldar. O porta-eletrodo está energizado; o arco abre quando a
 * ponta toca a peça e o soldador controla altura, avanço e orientação.
 */
export function telaTreinoEletrodo(app: App, peca: PecaEletrodo, voltar: () => void): void {
  app.ir((app) => {
    app.raiz.classList.add('app-cheia')
    let modelo = new Acionamento15('eletrodo')
    // O cordão conhece a junta (filete com pernas, V que enche o chanfro), como no jogo MIG.
    const novoCordao = () => new Cordao(undefined, undefined, undefined, { junta: peca.junta, dimensoes: { espessuraMm: peca.espessuraMm, aberturaMm: peca.aberturaMm } })
    let cordao = novoCordao()
    let registro = new RegistroPasse(cordao.nPosicoes, cordao.passoMm)
    let analise: AnaliseEletrodo | null = null
    let analiseMs = 0, inclusaoAntes = 0
    const alvo = aporteAlvoKJmm(peca)
    let posicao = { x: 75, y: 0 }
    let ponteiro = false
    let pausado = false
    let pedido = 0
    let anterior = performance.now()
    let cfg = carregarControles15()
    let ferramentaAtual: FerramentaBancada15 = 'soldar'
    let limpezaPressionada = false, ultimoGolpeMs = -Infinity
    let modal = false, foco = true
    let gesto: 'camera' | 'ferramenta' | null = null
    let ultimaTela = { x: 0, y: 0 }
    let inicioGiro = { x: 0, y: 0 }
    let giroNaTela: ReturnType<NonNullable<ReturnType<typeof criarBancada15>>['iniciarGiro']> | null = null
    let seguraSobe = 0, seguraDesce = 0
    const teclas = new Set<string>()
    const vista = criarBancada15(peca)
    if (!vista) return app.raiz.append(h('p', {}, 'WebGL indisponível: abra o treino no Chrome ou Edge com aceleração gráfica.'))
    const canvas = vista.canvas
    const soltar = () => { ponteiro = false; teclas.clear(); modelo.soltar() }

    // Leituras sobre a vista 3D: o que o soldador precisa ver sem tirar os olhos da poça.
    const estado = h('strong', { class: 'p15-estado', role: 'status', 'aria-live': 'polite' })
    const faixasEl = h('div', { class: 'p15-medidor-faixas' })
    const marcador = h('span', { class: 'p15-medidor-marca' })
    const medidor = h('div', { class: 'p15-medidor', 'aria-hidden': 'true' }, faixasEl, marcador)
    const medidorTexto = h('span', { class: 'p15-medidor-texto' })
    const distanciaHud = h('output', { class: 'p15-numero' })
    const restante = h('output')
    const barra = h('progress', { max: VARETA15.inicialMm, value: VARETA15.inicialMm, 'aria-label': 'Comprimento restante da vareta' })
    const avanco = h('output')
    const faixaAvanco = h('small', { class: 'p15-sub' })
    const calorHud = h('output')
    const fonteHud = h('output')
    const hud = h('div', { class: 'p15-hud' }, estado,
      h('div', { class: 'p15-hud-arco' }, h('div', { class: 'p15-hud-linha' }, h('span', { class: 'p15-rotulo' }, 'Comprimento do arco'), distanciaHud), medidor, medidorTexto),
      h('div', { class: 'p15-hud-grade' },
        h('div', { class: 'p15-hud-item p15-consumo' }, h('span', { class: 'p15-rotulo' }, 'Vareta'), restante, barra),
        h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Avanço'), avanco, faixaAvanco),
        h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo', title: 'Aporte de calor: energia do arco por milímetro de cordão' }, 'Calor'), calorHud),
        h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Fonte'), fonteHud)))

    // Painel lateral.
    const ajuda = h('p', { class: 'p15-ajuda' })
    const trocar = h('button', { type: 'button', on: { click: () => { modelo.soltar(); modelo.trocarVareta(); canvas.focus() } } }, 'Nova vareta')
    const desgrudar = h('button', { type: 'button', class: 'p15-alerta', on: { click: () => { modelo.soltar(); modelo.desgrudar(); canvas.focus() } } }, 'Desgrudar eletrodo')
    const botoesFerramenta = new Map<FerramentaBancada15, HTMLButtonElement>()
    const selecionarFerramenta = (f: FerramentaBancada15) => {
      soltar(); limpezaPressionada = false; ferramentaAtual = f
      for (const [id, b] of botoesFerramenta) b.setAttribute('aria-pressed', String(id === f))
      canvas.focus()
    }
    for (const [id, nome] of [['soldar', 'Eletrodo'], ['martelo', 'Martelinho'], ['escova', 'Escova de aço']] as const) {
      botoesFerramenta.set(id, h('button', { type: 'button', 'aria-pressed': id === 'soldar' ? 'true' : 'false', on: { click: () => selecionarFerramenta(id) } }, nome))
    }
    const ferramentas = h('div', { class: 'p15-ferramentas', role: 'group', 'aria-label': 'Ferramenta na mão' }, [...botoesFerramenta.values()])
    const correnteValor = h('output')
    const corrente = h('input', { type: 'range', min: 40, max: 180, step: 5, value: 90, 'aria-label': 'Corrente do eletrodo (A)' })
    corrente.addEventListener('input', () => { modelo.soltar(); modelo.regular(Number(corrente.value)) })
    const diametro = h('select', { 'aria-label': 'Diâmetro do eletrodo' }, [2.5, 3.2].map(d => h('option', { value: d }, `${n1(d)} mm`)))
    diametro.addEventListener('change', () => { modelo.soltar(); modelo.regular(modelo.correnteA, Number(diametro.value)); canvas.focus() })
    // H70: quanto do consumo a bancada compensa. Parcial é o padrão: o arco cresce devagar e o jogador corrige.
    const ajudaAltura = h('select', { 'aria-label': 'Ajuda na altura' },
      ([['0.8', 'Parcial (recomendada)'], ['1', 'Total (arco não cresce)'], ['0', 'Desligada (eletrodo real)']] as const).map(([v, t]) => h('option', { value: v }, t)))
    const aplicarAjuda = () => { modelo.assistencia = Number(ajudaAltura.value); modelo.compensar = false }
    ajudaAltura.addEventListener('change', () => { aplicarAjuda(); canvas.focus() })
    const referencia = h('small', { class: 'p15-dica' })
    const fisica = h('fieldset', { class: 'p15-fonte' }, h('legend', {}, 'Fonte e consumível'),
      h('label', {}, h('span', { class: 'p15-linha' }, 'Corrente', correnteValor), corrente),
      h('label', { class: 'p15-linha' }, 'Eletrodo didático', diametro),
      referencia,
      h('label', { class: 'p15-linha', title: 'A vareta queima e o arco cresce. Parcial: a bancada desce o alicate 80% do consumo e você corrige com toques em S. Desligada: você compensa tudo.' }, 'Ajuda na altura', ajudaAltura))
    const faixa = h('input', { type: 'range', min: 0, max: 35, step: 0.1, value: 10, 'aria-label': 'Distância da ponta à peça' })
    const altura = h('label', {}, h('span', { class: 'p15-linha' }, 'Altura manual', h('small', {}, 'W / S ou roda')), faixa)
    const orientacoes = [
      ['Direção da ferramenta (360°)', 360], ['Inclinação da ferramenta', 85], ['Rolamento do punho (360°)', 360],
    ].map(([nome, max]) => h('input', { type: 'range', min: 0, max, step: 1, value: 0, 'aria-label': nome }))
    const lerOrientacao = () => modelo.orientar(Number(orientacoes[0].value), Number(orientacoes[1].value), Number(orientacoes[2].value))
    orientacoes.forEach(c => c.addEventListener('input', lerOrientacao))
    const orientacaoValores = orientacoes.map(() => h('output'))
    const orientar = h('details', {}, h('summary', {}, 'Orientação e câmera 360°'),
      ...orientacoes.map((c, i) => h('label', {}, h('span', { class: 'p15-linha' }, ['Direção', 'Inclinação (máx. 85°)', 'Punho'][i], orientacaoValores[i]), c)),
      h('p', { class: 'p15-dica' }, 'Arraste com o botão direito para orientar; I/K inclinam, J/L mudam a direção, Q/E giram o punho.'),
      h('button', { type: 'button', on: { click: () => { vista.centralizar(); canvas.focus() } } }, 'Centralizar câmera'))
    const leituras = h('dl', { class: 'p15-leituras' })
    const valoresLeitura = new Map<string, HTMLElement>()
    for (const nome of ['Tensão do arco', 'Consumo', 'Tempo de arco', 'Energia', 'Escória', 'Resíduos soltos', 'Sobre escória fria', 'Respingos']) {
      const dd = h('dd')
      valoresLeitura.set(nome, dd)
      leituras.append(h('dt', {}, nome), dd)
    }
    const detalhes = h('details', {}, h('summary', {}, 'Leituras do modelo'), leituras,
      h('small', { class: 'p15-dica' }, 'Consumo, aderência, energia e escória são aproximações didáticas. Não predizem qualidade interna nem definem parâmetros de procedimento.'))
    // Leituras ao vivo do que a inspeção vai medir (H75); a nota sai em "Inspecionar a peça" (H77).
    const nomeMedida = peca.medida.tipo === 'perna' ? `Perna do filete (${n1(peca.medida.min)}–${n1(peca.medida.max)} mm)` : peca.medida.tipo === 'enchimento' ? 'Chanfro cheio até a face' : `Reforço (${n1(peca.medida.min)}–${n1(peca.medida.max)} mm)`
    const itensObjetivo = ['Trecho do INÍCIO ao FIM coberto', nomeMedida, `Calor por passe (${n1(LIMITES.fusaoFracaAbaixo * alvo)}–${n1(LIMITES.fusaoExcessoAcima * alvo)} kJ/mm)`, 'Escória removida'].map(t => {
      const valor = h('span', { class: 'p15-obj-valor' })
      const li = h('li', {}, h('span', {}, t), valor)
      return { li, valor }
    })
    const inspecionar = h('button', { type: 'button', class: 'primario', on: { click: () => mostrarInspecao() } }, 'Inspecionar a peça')
    const objetivo = h('section', { class: 'p15-objetivo', 'aria-label': 'Objetivo da peça' },
      h('p', {}, peca.objetivo), h('ul', {}, itensObjetivo.map(i => i.li)), inspecionar)
    const controles = h('button', { type: 'button', on: { click: async () => {
      soltar(); modal = true
      try { cfg = await configurarControles15(cfg) } finally { modal = false; anterior = performance.now(); canvas.focus() }
    } } }, 'Controles')
    const pausar = h('button', { type: 'button', on: { click: () => { pausado = !pausado; soltar(); pausar.textContent = pausado ? 'Continuar' : 'Pausar'; anterior = performance.now() } } }, 'Pausar')
    const recomecar = () => {
      soltar()
      modelo = new Acionamento15('eletrodo')
      modelo.superficie = vista.superficie
      modelo.abrirAoTocar = true
      aplicarAjuda()
      modelo.regular(Number(corrente.value), Number(diametro.value))
      modelo.posicionar(peca.inicioMm, 0)
      cordao = novoCordao()
      registro = new RegistroPasse(cordao.nPosicoes, cordao.passoMm)
      analise = null
      inclusaoAntes = 0
      vista.atualizarDefeitos(null)
      posicao = { x: peca.inicioMm, y: 0 }
      selecionarFerramenta('soldar')
    }
    const teclasVista = h('div', { class: 'p15-instrucoes' })
    const area = h('div', { class: 'p15-vista' }, canvas, hud, teclasVista)
    const conteudo = h('section', { class: 'p15' },
      h('header', { class: 'p15-cabecalho' },
        h('div', {},
          h('h2', { class: 'tela-titulo', tabindex: '-1' }, peca.titulo),
          h('p', {}, `Eletrodo revestido · ${INFO_JUNTA[peca.junta].nome} · ${n1(peca.espessuraMm)} mm · ${peca.aplicacao}`)),
        h('div', { class: 'p15-processos' }, controles, h('button', { type: 'button', on: { click: () => voltar() } }, 'Outras peças'))),
      h('div', { class: 'p15-grade' }, area,
        h('aside', { class: 'p15-painel' }, objetivo, ferramentas, ajuda,
          h('div', { class: 'p15-comandos' }, desgrudar, trocar),
          fisica, altura, orientar, detalhes,
          h('div', { class: 'p15-acoes' }, pausar, h('button', { type: 'button', on: { click: recomecar } }, 'Recomeçar peça')))))
    app.raiz.append(conteudo)
    corrente.value = String(Math.round((peca.correnteA.min + peca.correnteA.max) / 10) * 5)
    diametro.value = String(peca.diametroMm)
    recomecar()

    const ouvintes: (() => void)[] = []
    const ouvir = (alvo: EventTarget, tipo: string, f: EventListener) => { alvo.addEventListener(tipo, f); ouvintes.push(() => alvo.removeEventListener(tipo, f)) }
    const atualizarPosicao = (e: PointerEvent) => {
      if (modelo.grudado) return
      const p = vista.pontoNaTela(e.clientX, e.clientY)
      modelo.naPeca = !!p
      if (p) { posicao = p; modelo.xMm = p.x; modelo.yMm = p.y }
    }
    ouvir(canvas, 'pointerdown', (ev) => {
      const e = ev as PointerEvent
      if (pausado || modal) return
      e.preventDefault(); canvas.focus(); canvas.setPointerCapture(e.pointerId)
      ultimaTela = { x: e.clientX, y: e.clientY }
      if (e.button === cfg.camera) gesto = 'camera'
      else if (e.button === cfg.ferramenta) {
        gesto = 'ferramenta'
        inicioGiro = { ...ultimaTela }
        giroNaTela = vista.iniciarGiro(modelo)
      } else { atualizarPosicao(e); ponteiro = true }
    })
    ouvir(canvas, 'pointermove', ev => {
      const e = ev as PointerEvent
      if (pausado || modal) return
      const dx = e.clientX - ultimaTela.x, dy = e.clientY - ultimaTela.y
      if (gesto === 'camera') { if (modelo.estado !== 'arco') vista.orbitar(dx * cfg.sensibilidade, dy * cfg.sensibilidade) }
      else if (gesto === 'ferramenta' && giroNaTela) {
        const o = giroNaTela(e.clientX - inicioGiro.x, e.clientY - inicioGiro.y, cfg.sensibilidade)
        modelo.orientar(o.azimute, o.inclinacao, modelo.rolamentoGraus)
      } else {
        // O eletrodo segue o ponteiro sobre a peça: mover a mão é avançar o cordão.
        atualizarPosicao(e)
        if (e.pointerType === 'pen' && cfg.caneta) modelo.orientar(Math.atan2(e.tiltY, e.tiltX) * 180 / Math.PI, Math.hypot(e.tiltX, e.tiltY), modelo.rolamentoGraus)
      }
      ultimaTela = { x: e.clientX, y: e.clientY }
    })
    ouvir(canvas, 'pointerup', () => { ponteiro = false; gesto = null })
    ouvir(canvas, 'pointercancel', () => { gesto = null; ponteiro = false })
    ouvir(canvas, 'lostpointercapture', () => { ponteiro = false; gesto = null })
    ouvir(canvas, 'contextmenu', e => e.preventDefault())
    ouvir(canvas, 'pointerleave', () => { if (!gesto) modelo.naPeca = false })
    ouvir(canvas, 'wheel', e => {
      e.preventDefault()
      if (!pausado && !modal) {
        if (cfg.roda === 'zoom') vista.aproximar((e as WheelEvent).deltaY)
        else modelo.definirDistancia(modelo.distanciaMm + Math.sign((e as WheelEvent).deltaY) * 0.3)
      }
    })
    faixa.addEventListener('input', () => { if (!pausado) modelo.definirDistancia(Number(faixa.value)) })
    ouvir(window, 'keydown', ev => {
      const e = ev as KeyboardEvent
      if (modal || (e.target as HTMLElement)?.matches('input,select,textarea') || !Object.values(cfg.teclas).includes(e.code)) return
      e.preventDefault()
      if (!pausado) teclas.add(e.code)
    })
    ouvir(window, 'keyup', ev => { teclas.delete((ev as KeyboardEvent).code) })
    ouvir(window, 'blur', () => { foco = false; soltar() })
    ouvir(window, 'focus', () => { foco = true })
    ouvir(document, 'visibilitychange', () => { soltar(); anterior = performance.now() })
    const tamanho = new ResizeObserver(() => { const r = area.getBoundingClientRect(); vista.enquadrar(r.width, r.height) })
    tamanho.observe(area)
    const mensagens = {
      desligado: 'Pausado · porta-eletrodo desenergizado', pronto: 'Desça até tocar a peça para abrir o arco', contato: 'Encostado na poça · solte S ou suba com W, senão gruda',
      arco: 'Arco aberto', afastado: 'Leve a ponta até a peça', fim: 'Fim da vareta · troque a vareta', grudado: 'Eletrodo grudado · use Desgrudar',
    }
    let teclasChave = '', medidorChave = ''
    const desenharMedidor = () => {
      const d = modelo.diametroMm, escala = 8
      const faixas: [number, string, string][] = [[VARETA15.contatoMm, 'contato', 'contato'], [0.5 * d, 'curto', 'atencao'], [1.3 * d, 'adequado', 'bom'], [modelo.arcoMaxMm, 'longo', 'atencao'], [8, 'apaga', 'fora']]
      const chave = String(d)
      if (chave !== medidorChave) {
        medidorChave = chave
        let de = 0
        faixasEl.replaceChildren(...faixas.map(([ate, nome, classe]) => {
          const el = h('span', { class: `p15-faixa p15-faixa-${classe}`, title: nome, style: `width:${(Math.min(ate, escala) - de) / escala * 100}%` })
          de = Math.min(ate, escala)
          return el
        }))
      }
      marcador.style.left = `${Math.min(100, Math.max(0, modelo.distanciaMm / escala * 100))}%`
    }
    const coberto = () => {
      let n = 0, total = 0
      for (let x = peca.inicioMm; x <= peca.fimMm; x += 2) {
        total++
        if (cordao.secao(cordao.indiceEm(x)).larguraMm >= LARGURA_COBERTA_MM) n++
      }
      return total ? n / total : 0
    }
    let objetivoMs = 0
    const atualizarObjetivo = (agora: number) => {
      if (agora - objetivoMs < 250) return
      objetivoMs = agora
      const cob = coberto()
      // Média da medida e do calor no trecho com cordão.
      let somaMedida = 0, somaCalor = 0, nMedida = 0, dentro = 0
      for (let x = peca.inicioMm; x <= peca.fimMm; x += 2) {
        const i = cordao.indiceEm(x), s = cordao.secao(i)
        if (s.larguraMm < LARGURA_COBERTA_MM) continue
        const v = peca.medida.tipo === 'perna' ? (s.pernasMm ? Math.min(...s.pernasMm) : 0) : peca.medida.tipo === 'enchimento' ? (s.enchimento ?? 0) : s.alturaMm
        somaMedida += v; somaCalor += registro.aportePorPasse(i).max; nMedida++
        const ok = peca.medida.tipo === 'enchimento' ? v >= peca.medida.min && s.alturaMm <= peca.medida.max : v >= peca.medida.min && v <= peca.medida.max
        if (ok) dentro++
      }
      const medida = nMedida ? somaMedida / nMedida : 0, calor = nMedida ? somaCalor / nMedida : 0
      const textoMedida = !nMedida ? '—' : peca.medida.tipo === 'enchimento' ? `${n0(medida * 100)}% cheio` : `${n1(medida)} mm`
      const calorOk = calor >= LIMITES.fusaoFracaAbaixo * alvo && calor <= LIMITES.fusaoExcessoAcima * alvo
      const escoriaFeita = modelo.escoria.areaMm2 < 5 && cob > 0.05
      const itens: [boolean, string][] = [
        [cob >= 0.95, `${n0(cob * 100)}%`],
        [nMedida > 0 && dentro / nMedida >= 0.9, textoMedida],
        [nMedida > 0 && calorOk, nMedida ? `${n1(calor)} kJ/mm` : '—'],
        [escoriaFeita, cob > 0.05 ? (escoriaFeita ? 'limpa' : `${n0(modelo.escoria.areaMm2)} mm²`) : '—'],
      ]
      itens.forEach(([ok, texto], i) => {
        const { li, valor } = itensObjetivo[i]
        li.dataset.ok = String(ok)
        if (valor.textContent !== texto) valor.textContent = texto
      })
    }
    /** Inspeção visual (H77): nota, aprovação e defeitos com causa e correção. */
    const mostrarInspecao = async () => {
      soltar(); modal = true
      try {
        analise = analisarEletrodo(peca, cordao, registro)
        vista.atualizarDefeitos(analise.defeitos)
        await abrirPainel('Inspeção visual da peça', painelResultado(inspecionarEletrodo(peca, cordao, registro, analise, modelo.escoria)))
      } finally { modal = false; anterior = performance.now(); canvas.focus() }
    }
    const painelResultado = (r: ResultadoEletrodo) => {
      const m = r.medidas
      const medida = peca.medida.tipo === 'enchimento' ? `${n0(m.geometriaMedia * 100)}% do chanfro` : `${n1(m.geometriaMedia)} mm`
      return h('div', { class: 'p15-resultado' },
        h('div', { class: 'p15-res-topo' },
          h('div', { class: 'p15-res-nota', 'data-conceito': r.conceito }, h('strong', {}, String(r.nota)), h('span', {}, '/ 100'), h('em', {}, r.conceito)),
          h('div', {},
            h('p', { class: 'p15-res-veredito', 'data-aprovado': String(r.aprovado) }, r.aprovado ? 'Aprovada na inspeção visual' : 'Reprovada na inspeção visual'),
            h('p', { class: 'p15-dica' }, `${n0(m.coberturaPct)}% do trecho · largura ${n1(m.larguraMediaMm)} mm (varia ${n0(m.variacaoLarguraPct)}%) · ${peca.medida.tipo === 'perna' ? 'perna' : peca.medida.tipo === 'enchimento' ? 'enchimento' : 'reforço'} ${medida} · calor ${n1(m.aporteMedioKJmm)} kJ/mm (ref. ${n1(m.aporteAlvoKJmm)}) · ${m.passes} passe(s)`))),
        h('ul', { class: 'p15-res-categorias' }, r.categorias.map((c) => h('li', {},
          h('span', {}, c.nome), h('meter', { min: 0, max: c.maximo, value: c.pontos, low: c.maximo * 0.5, high: c.maximo * 0.8, optimum: c.maximo }), h('b', {}, `${c.pontos}/${c.maximo}`), h('small', {}, c.detalhe)))),
        r.defeitos.length
          ? h('ul', { class: 'p15-res-defeitos' }, r.defeitos.map((d) => h('li', { 'data-reprova': String(d.reprova) },
            h('strong', {}, `${d.nome}${d.quantidade > 1 ? ` (${d.quantidade})` : ''}`),
            h('span', { class: 'p15-res-onde' }, d.fimMm - d.inicioMm < 0.5 ? `em ${n0(d.inicioMm)} mm` : `de ${n0(d.inicioMm)} a ${n0(d.fimMm)} mm`),
            d.reprova ? h('span', { class: 'p15-res-reprova' }, 'reprova') : null,
            h('p', {}, d.causa), h('p', { class: 'p15-res-corrigir' }, `Como corrigir: ${d.corrigir}`))))
          : h('p', {}, 'Nenhum defeito encontrado no trecho.'),
        h('p', { class: 'p15-dica' }, 'Critérios didáticos do jogo, inspirados em inspeção visual de soldagem. Não é norma nem certificação. A régua na peça mostra as posições em mm.'))
    }
    const quadro = (agora: number) => {
      const dt = Math.min(DT_MAX, (agora - anterior) / 1000)
      anterior = agora
      const pode = !pausado && !modal && foco && !document.hidden
      const ativo = (a: keyof typeof cfg.teclas) => Number(teclas.has(cfg.teclas[a]))
      let alturaControle = 0, gatilhoControle = false
      const g = cfg.controle && pode ? [...navigator.getGamepads()].find(Boolean) : null
      if (g) {
        const eixo = (i: number) => Math.abs(g.axes[i] ?? 0) > cfg.zona ? (g.axes[i] ?? 0) : 0
        gatilhoControle = (g.buttons[cfg.gatilho]?.value ?? 0) > 0.5
        if (!modelo.grudado) {
          modelo.xMm = Math.max(0, Math.min(150, modelo.xMm + eixo(0) * dt * 35))
          modelo.yMm = Math.max(-50, Math.min(50, modelo.yMm + eixo(1) * dt * 35))
          if (eixo(0) || eixo(1)) modelo.naPeca = true
        }
        alturaControle = Number(g.buttons[13]?.pressed ?? false) - Number(g.buttons[12]?.pressed ?? false)
        if (cfg.analogico === 'camera' && modelo.estado !== 'arco') vista.orbitar(eixo(2) * dt * 180, eixo(3) * dt * 180)
        else if (cfg.analogico === 'ferramenta') modelo.orientar(modelo.azimuteGraus + eixo(2) * dt * 60, modelo.inclinacaoGraus + eixo(3) * dt * 60, modelo.rolamentoGraus + (Number(g.buttons[5]?.pressed ?? false) - Number(g.buttons[4]?.pressed ?? false)) * dt * 60)
      }
      // Sem botão: o porta-eletrodo fica energizado enquanto o eletrodo está na mão (H72).
      modelo.pressionado = pode && ferramentaAtual === 'soldar'
      if (!modelo.pressionado) modelo.soltar()
      // Rampa de altura (H72): toque curto move poucos décimos; segurar acelera até a velocidade configurada.
      const sobe = ativo('afastar') || alturaControle > 0, desce = ativo('aproximar') || alturaControle < 0
      seguraSobe = sobe && pode ? seguraSobe + dt : 0
      seguraDesce = desce && pode ? seguraDesce + dt : 0
      const vAltura = velocidadeAltura15(seguraSobe, cfg.velocidade) - velocidadeAltura15(seguraDesce, cfg.velocidade)
      if (pode) {
        if (ferramentaAtual === 'soldar') modelo.orientar(modelo.azimuteGraus + (ativo('azMais') - ativo('azMenos')) * dt * 60, modelo.inclinacaoGraus + (ativo('inclMais') - ativo('inclMenos')) * dt * 45, modelo.rolamentoGraus + (ativo('rolMais') - ativo('rolMenos')) * dt * 60)
        const estadoAntes = modelo.estado, quenteAntes = modelo.pontaQuente
        modelo.avancar(dt, ferramentaAtual === 'soldar' ? vAltura : 0, (volume, forma) => {
          cordao.depositar(modelo.xMm, modelo.yMm, volume, agora, forma?.razao, 0, forma?.instabilidade ?? 0)
          // Registro do passe (H74–H76): calor, arco e metal posto sobre escória fria.
          if (forma) registro.depositar(modelo.xMm, forma, agora, modelo.escoria.inclusaoMm3 - inclusaoAntes)
          inclusaoAntes = modelo.escoria.inclusaoMm3
        })
        const estadoDepois = modelo.estado
        if (estadoAntes !== 'arco' && estadoDepois === 'arco') registro.inicioArco(modelo.xMm, modelo.yMm, agora, quenteAntes)
        if (estadoAntes === 'arco' && estadoDepois !== 'arco') {
          registro.fimArco(modelo.xMm, modelo.yMm, agora, estadoDepois === 'fim' ? 'fim-da-vareta' : estadoDepois === 'grudado' ? 'grudou' : !modelo.pressionado ? 'soltou' : 'afastou')
        }
        if (estadoAntes !== 'grudado' && estadoDepois === 'grudado') registro.grudou(modelo.xMm, modelo.yMm)
        const pressionada = !!(modelo.naPeca && (ponteiro || ativo('acionar') || gatilhoControle))
        if (ferramentaAtual === 'martelo' && pressionada && !limpezaPressionada) {
          modelo.escoria.martelar(modelo.xMm, modelo.yMm); ultimoGolpeMs = agora
        }
        if (ferramentaAtual === 'escova' && pressionada) modelo.escoria.escovar(modelo.xMm, modelo.yMm)
        limpezaPressionada = pressionada
      }
      posicao = { x: modelo.xMm, y: modelo.yMm }
      const quente = modelo.escoria.fracaoQuente
      const texto = pausado || modal ? 'Pausado · porta-eletrodo desenergizado'
        : ferramentaAtual === 'martelo' ? (quente > 0.5 ? 'Martelinho · escória ainda quente, espere esfriar' : 'Martelinho · clique para quebrar escória fria')
        : ferramentaAtual === 'escova' ? 'Escova · arraste com o botão esquerdo'
        : modelo.esticado ? 'Arco esticado · desça já ou ele apaga'
        : modelo.estado === 'pronto' && modelo.pontaQuente ? 'Arco apagou · ponta quente: desça para reacender'
        : mensagens[modelo.estado]
      const faixaArco = modelo.faixaArco
      const instrucao = ferramentaAtual === 'martelo' ? 'Clique na crosta fria: um golpe por clique. O martelinho solta a escória e deixa resíduos para a escova.'
        : ferramentaAtual === 'escova' ? 'Segure o botão esquerdo e arraste sobre os resíduos soltos. Crosta intacta precisa primeiro do martelinho.'
        : `Mova o mouse para levar a ponta ao INÍCIO. Desça com ${nomeTecla(cfg.teclas.aproximar)} até tocar: o arco abre sozinho. Toques curtos em ${nomeTecla(cfg.teclas.aproximar)} mantêm o arco enquanto a vareta queima.`
      if (ajuda.textContent !== instrucao) ajuda.textContent = instrucao
      if (estado.textContent !== texto) estado.textContent = texto
      estado.dataset.arco = String(modelo.estado === 'arco' && !modelo.esticado)
      estado.dataset.alerta = String(modelo.estado === 'grudado' || modelo.estado === 'fim' || modelo.esticado)
      desenharMedidor()
      distanciaHud.value = `${n1(modelo.distanciaMm)} mm`
      const textoMedidor = modelo.esticado ? 'arco esticado · apaga em instantes' : faixaArco ? TEXTO_FAIXA[faixaArco] : `abre ao tocar; sustenta até ${n1(modelo.arcoMaxMm)} mm`
      if (medidorTexto.textContent !== textoMedidor) medidorTexto.textContent = textoMedidor
      medidorTexto.dataset.faixa = modelo.esticado ? 'longo' : faixaArco ?? ''
      // Calor do arco agora (H74): potência que entra na peça ÷ velocidade de avanço; e a faixa de avanço que dá o calor certo.
      const potenciaW = RENDIMENTO15.termico * modelo.correnteA * (20 + 2 * Math.max(0.5, Math.min(modelo.arcoMaxMm, modelo.distanciaMm)))
      const vMin = potenciaW / (LIMITES.fusaoExcessoAcima * alvo * 1000), vMax = potenciaW / (LIMITES.fusaoFracaAbaixo * alvo * 1000)
      const arcoAceso = modelo.estado === 'arco'
      avanco.value = `${n1(arcoAceso ? modelo.velocidadeMmS : 0)} mm/s`
      const textoFaixa = `faixa ${n1(vMin)}–${n1(vMax)}`
      if (faixaAvanco.textContent !== textoFaixa) faixaAvanco.textContent = textoFaixa
      const calorAgora = arcoAceso && modelo.velocidadeMmS > 0.3 ? potenciaW / modelo.velocidadeMmS / 1000 : 0
      calorHud.value = calorAgora ? `${n1(calorAgora)} kJ/mm` : '—'
      calorHud.dataset.faixa = !calorAgora ? '' : calorAgora < LIMITES.fusaoFracaAbaixo * alvo ? 'frio' : calorAgora > LIMITES.fusaoExcessoAcima * alvo ? 'quente' : 'bom'
      avanco.dataset.faixa = calorHud.dataset.faixa
      fonteHud.value = `${n0(modelo.correnteA)} A · Ø ${n1(modelo.diametroMm)}`
      const chaveTeclas = JSON.stringify(cfg.teclas)
      if (chaveTeclas !== teclasChave) {
        teclasChave = chaveTeclas
        const t = cfg.teclas
        teclasVista.replaceChildren(...([
          ['mouse', 'leva a ponta'], [`${nomeTecla(t.aproximar)}/${nomeTecla(t.afastar)}`, 'desce/sobe (toques curtos)'],
          ['meio', 'câmera'], ['direito', 'orienta'], [`${nomeTecla(t.inclMenos)}/${nomeTecla(t.inclMais)}`, 'inclina'],
          [`${nomeTecla(t.azMenos)}/${nomeTecla(t.azMais)}`, 'direção'], [`${nomeTecla(t.rolMenos)}/${nomeTecla(t.rolMais)}`, 'punho'],
        ] as const).map(([k, o]) => h('span', {}, h('kbd', {}, k), o)))
      }
      faixa.value = String(modelo.distanciaMm)
      faixa.disabled = pausado || modal || modelo.grudado || ferramentaAtual !== 'soldar'
      corrente.disabled = diametro.disabled = modelo.estado === 'arco' || pausado || modal
      correnteValor.value = `${n0(modelo.correnteA)} A`
      const relativa = modelo.correnteRelativa
      const faixaPeca = `Sugerido para esta peça: ${peca.correnteA.min}–${peca.correnteA.max} A com Ø ${n1(peca.diametroMm)} mm.`
      const textoRef = (relativa < 0.55 ? 'Corrente baixa demais: o arco não se sustenta. ' : relativa < 0.65 ? 'Corrente baixa: gruda com facilidade. ' : relativa > 1.45 ? 'Corrente alta: a vareta queima depressa. ' : '') + faixaPeca
      if (referencia.textContent !== textoRef) referencia.textContent = textoRef
      const leitura = (nome: string, v: string) => { const el = valoresLeitura.get(nome)!; if (el.textContent !== v) el.textContent = v }
      leitura('Tensão do arco', `${n1(modelo.tensaoV)} V`)
      leitura('Consumo', `${n1(modelo.consumoMmS)} mm/s`)
      leitura('Tempo de arco', `${n1(modelo.tempoArcoS)} s`)
      leitura('Energia', `${n1(modelo.energiaJ / 1000)} kJ`)
      leitura('Escória', `${n0(modelo.escoria.areaMm2)} mm²${modelo.escoria.cobertura > 0.01 ? ` · ${n0(quente * 100)}% quente` : ''}`)
      leitura('Resíduos soltos', `${n0(modelo.escoria.residuos * 9)} mm²`)
      leitura('Sobre escória fria', `${n1(modelo.escoria.inclusaoMm3)} mm³ (indicador)`)
      leitura('Respingos', n0(modelo.respingos))
      ;[modelo.azimuteGraus, modelo.inclinacaoGraus, modelo.rolamentoGraus].forEach((v, i) => {
        orientacoes[i].value = String(v); orientacoes[i].disabled = modelo.grudado || pausado || modal
        orientacaoValores[i].value = `${n0(v)}°`
      })
      desgrudar.hidden = !modelo.grudado
      desgrudar.disabled = pausado || modal
      restante.value = `${n0(modelo.restanteMm)} / ${VARETA15.inicialMm} mm`
      barra.value = modelo.restanteMm
      barra.dataset.fim = String(modelo.restanteMm < VARETA15.reservaMm + 10)
      trocar.disabled = pausado || modelo.estado === 'arco' || modelo.grudado
      trocar.classList.toggle('primario', modelo.estado === 'fim')
      atualizarObjetivo(agora)
      // A análise (escamas, poros, crateras, respingos, cor de calor) acompanha o cordão a cada meio segundo.
      if (agora - analiseMs > 500 && registro.aberturas.length) {
        analiseMs = agora
        analise = analisarEletrodo(peca, cordao, registro)
        vista.atualizarDefeitos(analise.defeitos)
      }
      vista.desenhar(modelo, posicao, cordao, ferramentaAtual, limpezaPressionada && pode, agora - ultimoGolpeMs, agora, pode ? dt : 0)
      pedido = requestAnimationFrame(quadro)
    }
    pedido = requestAnimationFrame(quadro)
    return () => { cancelAnimationFrame(pedido); soltar(); tamanho.disconnect(); ouvintes.forEach(f => f()); vista.destruir() }
  }, 'Treino · eletrodo revestido')
}
