/*
 * █ Eletrodo: tela do treino
 *
 * O que faz: A tela inteira do treino de eletrodo: painel sobre a vista
 *    (estado, medidor do arco, vareta, avanço), painel da máquina
 *    (FONTE, TOCHA, LEITURAS, MISSÃO) e o laço que roda a cada quadro.
 *    Enquanto o arco está aceso, anota o calor de cada passe
 *    (registro-do-passe.ts); a cada meio segundo a análise desenha os
 *    defeitos no cordão; ao encerrar, o resultado mostra a nota de 0 a
 *    1000 e a lista de defeitos com causa e correção.
 *
 * Onde mexer: Textos de estado estão em "mensagens" e TEXTO_FAIXA; os
 *    itens do objetivo em itensObjetivo; as leituras em valoresLeitura;
 *    as opções de ajuda na altura em ajudaAltura.
 */

import { avaliarEletrodo, type NivelISO } from './placar-do-eletrodo'
import { resultadoEletrodo } from './janela-do-resultado'
import { painelMaquina } from '../partes-das-telas/painel-da-maquina'
import { Acionamento15, RENDIMENTO15, VARETA15, velocidadeAltura15, velocidadeDescida15, type FaixaArco15 } from './arco-e-vareta'
import { DepositoEletrodo, alvoEletrodo, trechoEletrodo } from './deposito-do-cordao'
import { criarBancada15 } from './bancada-3d'
import type { App } from '../interface/aplicativo'
import { h, n0, n1 } from '../interface/criar-elementos'
import { carregarControles15, nomeTecla15 as nomeTecla } from './controles-salvos'
import { configurarControles15 } from './janela-de-controles'
import type { FerramentaBancada15 } from './escoria'
import { INFO_JUNTA } from '../simulacao-mig/tipos-de-junta-e-posicao'
import { RegistroPasse } from './registro-do-passe'
import { analisarEletrodo, LIMITES } from './analise-do-cordao'
import { inspecionarDefeitos } from './defeitos-do-eletrodo'
import { aporteAlvoKJmm, limitesPecaEletrodo, type PecaEletrodo } from './pecas-de-treino'

/** Quadro muito longo (aba travada, depurador) não vira um salto de vários segundos de arco. */
const DT_MAX = 0.25

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
    app.escolherOutraPeca = voltar
    const limitesX = limitesPecaEletrodo(peca)
    let modelo = new Acionamento15('eletrodo')
    modelo.limitesX = limitesX
    const novoCordao = () => new DepositoEletrodo(peca)
    let cordao = novoCordao()
    // Calor de cada passe, arco e escória sob o metal (H82–H84), em fatias de meio milímetro.
    const novoRegistro = () => new RegistroPasse(300, 0.5)
    let registro = novoRegistro()
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
    let encerrada = false, ocultarEscoria = false
    let painelResultado: HTMLElement | null = null
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
    const fonteHud = h('output')
    const hud = h('div', { class: 'p15-hud' }, estado,
      h('div', { class: 'p15-hud-arco' }, h('div', { class: 'p15-hud-linha' }, h('span', { class: 'p15-rotulo' }, 'Comprimento do arco'), distanciaHud), medidor, medidorTexto),
      h('div', { class: 'p15-hud-grade' },
        h('div', { class: 'p15-hud-item p15-consumo' }, h('span', { class: 'p15-rotulo' }, 'Vareta'), restante, barra),
        h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Avanço'), avanco),
        h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Fonte'), fonteHud)))

    // Painel lateral.
    const ajuda = h('p', { class: 'p15-ajuda' })
    const trocar = h('button', { type: 'button', on: { click: () => { modelo.soltar(); modelo.trocarVareta(); canvas.focus() } } }, 'Nova vareta')
    const desgrudar = h('button', { type: 'button', class: 'p15-alerta', on: { click: () => { modelo.soltar(); modelo.desgrudar(); canvas.focus() } } }, 'Desgrudar eletrodo')
    let direcaoGolpe: 'lateral' | 'diagonal' | 'cima' = 'lateral'
    const botoesFerramenta = new Map<FerramentaBancada15, HTMLButtonElement>()
    const selecionarFerramenta = (f: FerramentaBancada15) => {
      soltar(); limpezaPressionada = false; ferramentaAtual = f
      trocar.hidden = f !== 'soldar'
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
      ([['0.8', 'Parcial (recomendada)'], ['1', 'Total (arco não cresce)'], ['0', 'Manual (sem ajuda automática)']] as const).map(([v, t]) => h('option', { value: v }, t)))
    const aplicarAjuda = () => { modelo.assistencia = Number(ajudaAltura.value); modelo.compensar = false }
    ajudaAltura.addEventListener('change', () => { aplicarAjuda(); canvas.focus() })
    const referencia = h('small', { class: 'p15-dica' })
    const fisica = h('fieldset', { class: 'p15-fonte' }, h('legend', {}, 'Fonte e consumível'),
      h('label', {}, h('span', { class: 'p15-linha' }, 'Corrente', correnteValor), corrente),
      h('label', { class: 'p15-linha' }, 'Eletrodo didático', diametro),
      referencia,
      h('label', { class: 'p15-linha', title: 'A vareta queima e o arco cresce. Parcial: a bancada desce o alicate 80% do consumo e segurar S acompanha o consumo e reduz a distância. Manual: o acompanhamento só ocorre enquanto você segura a descida.' }, 'Ajuda na altura', ajudaAltura))
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
      h('button', { type: 'button', on: { click: () => { vista.centralizar(); canvas.focus() } } }, 'Centralizar câmera'),
      h('button', { type: 'button', on: { click: () => { vista.verEstacao(); canvas.focus() } } }, 'Ver estação SMAW'))
    const leituras = h('dl', { class: 'p15-leituras' })
    const valoresLeitura = new Map<string, HTMLElement>()
    for (const nome of ['Tensão do arco', 'Consumo', 'Tempo de arco', 'Energia', 'Calor do passe', 'Escória', 'Resíduos soltos', 'Sobre escória fria', 'Respingos']) {
      const dd = h('dd')
      valoresLeitura.set(nome, dd)
      leituras.append(h('dt', {}, nome), dd)
    }
    const detalhes = h('details', {}, h('summary', {}, 'Leituras do modelo'), leituras,
      h('small', { class: 'p15-dica' }, 'Consumo, aderência, energia e escória são aproximações didáticas. Não predizem qualidade interna nem definem parâmetros de procedimento.'))
    // Mesmas amostras locais na missão e na avaliação final.
    const itensObjetivo = ['União e preenchimento do trecho', 'Arco no comprimento adequado', 'Sem grudar o eletrodo', 'Escória removida'].map(t => {
      const valor = h('span', { class: 'p15-obj-valor' })
      const li = h('li', {}, h('span', {}, t), valor)
      return { li, valor }
    })
    const objetivo = h('section', { class: 'p15-objetivo', 'aria-label': 'Objetivo da peça' },
      h('p', {}, peca.objetivo), h('p', {}, `${alvoEletrodo(peca).descricao}. Trecho: ${peca.inicioMm}–${peca.fimMm} mm, na emenda central.`), h('ul', {}, itensObjetivo.map(i => i.li)))
    const controles = h('button', { type: 'button', on: { click: async () => {
      soltar(); modal = true
      try { cfg = await configurarControles15(cfg) } finally { modal = false; anterior = performance.now(); canvas.focus() }
    } } }, 'Controles')
    app.controlePausa = { pausar: () => { pausado = true; soltar() }, retomar: () => { cfg = carregarControles15(); pausado = false; anterior = performance.now() } }
    const pausar = h('button', { type: 'button', class: 'navegacao-de-partida', on: { click: () => { pausado = !pausado; soltar(); pausar.textContent = pausado ? 'Continuar' : 'Pausar'; anterior = performance.now() } } }, 'Pausar')
    const recomecar = () => {
      soltar()
      encerrada = false; ocultarEscoria = false
      hud.hidden = false; teclasVista.hidden = false
      painelResultado?.remove(); painelResultado = null
      const painel = app.raiz.querySelector<HTMLElement>('.p15-painel')
      if (painel) painel.hidden = false
      cordao = novoCordao()
      registro = novoRegistro(); inclusaoAntes = 0; analiseMs = 0
      vista.atualizarDefeitos(null)
      modelo = new Acionamento15('eletrodo')
      modelo.limitesX = limitesX
      modelo.superficie = y => cordao.altura(modelo.xMm,y)
      modelo.abrirAoTocar = true
      aplicarAjuda()
      modelo.regular(Number(corrente.value), Number(diametro.value))
      modelo.posicionar(peca.inicioMm, 0)
      modelo.definirDistancia(10)
      posicao = { x: peca.inicioMm, y: 0 }
      selecionarFerramenta('soldar')
    }
    const teclasVista = h('div', { class: 'p15-instrucoes' })
    const zoomValor=h('output',{},'100%')
    const zoomMais=h('button',{type:'button','aria-label':'Aproximar câmera',on:{click:()=>{vista.aproximar(-150);canvas.focus()}}},'+')
    const zoomMenos=h('button',{type:'button','aria-label':'Afastar câmera',on:{click:()=>{vista.aproximar(150);canvas.focus()}}},'−')
    const area = h('div', { class: 'p15-vista' }, canvas, hud, teclasVista,
      h('div',{class:'zoom-bancada',role:'group','aria-label':'Zoom da câmera'},h('span',{title:'Teclas + e −'},'ZOOM'),zoomMenos,zoomValor,zoomMais))
    const nivelISO: NivelISO = 'C' // Referência fixa do exercício; detalhes aparecem depois da tentativa.
    const encerrar = () => {
      if (encerrada || pausado || modal || modelo.tempoArcoS < .1) return
      soltar(); encerrada = true
      hud.hidden = true; teclasVista.hidden = true
      const r = avaliarEletrodo(peca,cordao,modelo,nivelISO)
      registro.fimArco(modelo.xMm, modelo.yMm, performance.now(), 'soltou')
      const analise = analisarEletrodo(peca, cordao, registro)
      vista.atualizarDefeitos(analise.defeitos)
      const inspecao = inspecionarDefeitos(peca, cordao, registro, analise)
      const resultado = resultadoEletrodo(r, inspecao, {nova:recomecar,pecas:voltar,camada:oculta=>{ocultarEscoria=oculta}})
      const painel = conteudo.querySelector<HTMLElement>('.p15-painel')!
      painel.hidden = true
      painelResultado = resultado.painel
      painel.parentElement!.append(painelResultado)
      resultado.focar()
    }
    const avaliar=h('button',{type:'button',class:'primario',disabled:true,on:{click:encerrar}},'Encerrar tentativa ↵')
    const avaliacao=h('div',{class:'p15-avaliacao'},avaliar,pausar,h('button',{type:'button','aria-label':'Recomeçar peça',on:{click:recomecar}},'↺'))
    orientar.open = true
    detalhes.open = true
    const instrumentos = painelMaquina([
      ['FONTE', h('div', {}, fisica, altura)],
      ['TOCHA', h('div', {}, orientar)],
      ['LEITURAS', h('div', {}, detalhes)],
      ['MISSÃO', h('div', {}, objetivo, ajuda)],
    ])
    const conteudo = h('section', { class: 'p15' },
      h('header', { class: 'p15-cabecalho' },
        h('div', {},
          h('h2', { class: 'tela-titulo', tabindex: '-1' }, peca.titulo),
          h('p', {}, `Eletrodo revestido · ${INFO_JUNTA[peca.junta].nome} · ${n1(peca.espessuraMm)} mm · ${peca.aplicacao}`)),
        h('div', { class: 'p15-processos navegacao-de-partida' }, controles, h('button', { type: 'button', on: { click: () => voltar() } }, 'Outras peças'))),
      h('div', { class: 'p15-grade' }, area,
        h('aside', { class: 'p15-painel' },
          h('div', { class: 'maquina-identificacao' }, 'SMAW / CC', h('span', {}, '● FONTE ENERGIZADA')),
          ferramentas, h('div', { class: 'p15-comandos' }, desgrudar, trocar),
          instrumentos,
          avaliacao)))
    app.raiz.append(conteudo)
    corrente.value = String(Math.round((peca.correnteA.min + peca.correnteA.max) / 10) * 5)
    diametro.value = String(peca.diametroMm)
    recomecar()

    const ouvintes: (() => void)[] = []
    const ouvir = (alvo: EventTarget, tipo: string, f: EventListener) => { alvo.addEventListener(tipo, f); ouvintes.push(() => alvo.removeEventListener(tipo, f)) }
    const atualizarPosicao = (e: PointerEvent) => {
      if (modelo.grudado) return
      const p = vista.pontoNaTela(e.clientX, e.clientY)
      modelo.naPeca = !!p?.naPeca
      if (p) { posicao = p; modelo.xMm = p.x; modelo.yMm = p.y }
    }
    ouvir(canvas, 'pointerdown', (ev) => {
      const e = ev as PointerEvent
      if (pausado || modal) return
      e.preventDefault(); canvas.focus(); canvas.setPointerCapture(e.pointerId)
      ultimaTela = { x: e.clientX, y: e.clientY }
      if (e.button === cfg.camera) gesto = 'camera'
      else if (e.button === cfg.ferramenta && !encerrada) {
        gesto = 'ferramenta'
        inicioGiro = { ...ultimaTela }
        giroNaTela = vista.iniciarGiro(modelo)
      } else if (!encerrada) { atualizarPosicao(e); ponteiro = true }
    })
    ouvir(canvas, 'pointermove', ev => {
      const e = ev as PointerEvent
      if (pausado || modal) return
      const dx = e.clientX - ultimaTela.x, dy = e.clientY - ultimaTela.y
      if (gesto === 'camera') { if (modelo.estado !== 'arco') vista.orbitar(dx * cfg.sensibilidade, dy * cfg.sensibilidade) }
      else if (gesto === 'ferramenta' && giroNaTela) {
        const o = giroNaTela(e.clientX - inicioGiro.x, e.clientY - inicioGiro.y, cfg.sensibilidade)
        modelo.orientar(o.azimute, o.inclinacao, modelo.rolamentoGraus)
      } else if (!encerrada) {
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
        if (encerrada) { vista.aproximar((e as WheelEvent).deltaY); return }
        if (cfg.roda === 'zoom') vista.aproximar((e as WheelEvent).deltaY)
        else modelo.definirDistancia(modelo.distanciaMm + Math.sign((e as WheelEvent).deltaY) * 0.3)
      }
    })
    faixa.addEventListener('input', () => { if (!pausado) modelo.definirDistancia(Number(faixa.value)) })
    ouvir(window, 'keydown', ev => {
      const e = ev as KeyboardEvent
      if (modal || (e.target as HTMLElement)?.matches('input,select,textarea')) return
      if (e.key === 'Enter' && !encerrada) { e.preventDefault(); encerrar(); return }
      if (['+','-','='].includes(e.key) || ['NumpadAdd','NumpadSubtract'].includes(e.code)) {
        e.preventDefault()
        if (!pausado && modelo.estado !== 'arco') vista.aproximar(e.key === '-' || e.code === 'NumpadSubtract' ? 150 : -150)
        return
      }
      if (!Object.values(cfg.teclas).includes(e.code)) return
      e.preventDefault()
      if (!pausado && !encerrada) teclas.add(e.code)
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
      let n = 0, total = 0, preenchimento = 0
      for (let x = peca.inicioMm; x <= peca.fimMm; x += 2) {
        total++
        const trecho = trechoEletrodo(cordao,x)
        preenchimento += trecho.progresso
        if (trecho.coberto) n++
      }
      return {unido: total ? n / total : 0, preenchimento: total ? preenchimento / total : 0}
    }
    let objetivoMs = 0
    const atualizarObjetivo = (agora: number) => {
      if (agora - objetivoMs < 250) return
      objetivoMs = agora
      const progresso = coberto(), cob = progresso.unido
      const t = modelo.tempoFaixaS, total = t.curto + t.adequado + t.longo
      const adequado = total > 0 ? t.adequado / total : 0
      const escoriaFeita = modelo.escoria.areaMm2 < 5 && cob > 0.05
      const itens: [boolean, string][] = [
        [cob >= 0.95, `${n0(cob * 100)}% unido · ${n0(progresso.preenchimento * 100)}% preenchido`],
        [total > 1 && adequado >= 0.7, total > 0 ? `${n0(adequado * 100)}% do tempo` : '—'],
        [modelo.grudadas === 0 && total > 0, `${modelo.grudadas}×`],
        [escoriaFeita, cob > 0.05 ? (escoriaFeita ? 'limpa' : `${n0(modelo.escoria.areaMm2)} mm²`) : '—'],
      ]
      itens.forEach(([ok, texto], i) => {
        const { li, valor } = itensObjetivo[i]
        li.dataset.ok = String(ok)
        if (valor.textContent !== texto) valor.textContent = texto
      })
    }
    const quadro = (agora: number) => {
      const dt = Math.min(DT_MAX, (agora - anterior) / 1000)
      anterior = agora
      const pode = !encerrada && !pausado && !modal && foco && !document.hidden
      const ativo = (a: keyof typeof cfg.teclas) => Number(teclas.has(cfg.teclas[a]))
      let alturaControle = 0, gatilhoControle = false
      const g = cfg.controle && pode ? [...navigator.getGamepads()].find(Boolean) : null
      if (g) {
        const eixo = (i: number) => Math.abs(g.axes[i] ?? 0) > cfg.zona ? (g.axes[i] ?? 0) : 0
        gatilhoControle = (g.buttons[cfg.gatilho]?.value ?? 0) > 0.5
        if (!modelo.grudado) {
          modelo.xMm = Math.max(limitesX.min, Math.min(limitesX.max, modelo.xMm + eixo(0) * dt * 35))
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
      const vAltura = velocidadeAltura15(seguraSobe, cfg.velocidade) - velocidadeDescida15(seguraDesce, cfg.velocidade, modelo.consumoMmS, modelo.compensar ? 1 : modelo.assistencia, modelo.cosInclinado, modelo.estado === 'arco')
      if (pode) {
        if (ferramentaAtual === 'soldar') modelo.orientar(modelo.azimuteGraus + (ativo('azMais') - ativo('azMenos')) * dt * 60, modelo.inclinacaoGraus + (ativo('inclMais') - ativo('inclMenos')) * dt * 45, modelo.rolamentoGraus + (ativo('rolMais') - ativo('rolMenos')) * dt * 60)
        const estadoAntes = modelo.estado, quenteAntes = modelo.pontaQuente
        modelo.avancar(dt, ferramentaAtual === 'soldar' ? vAltura : 0, (volume, forma) => {
          cordao.depositar(modelo.xMm, modelo.yMm, volume, agora, forma?.razao, 0, forma?.instabilidade ?? 0)
          // Registro do passe (H82–H84): calor, arco e metal posto sobre escória fria.
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
          const direcoes = ['lateral', 'diagonal', 'cima'] as const
          const outras = direcoes.filter(d => d !== direcaoGolpe)
          direcaoGolpe = outras[Math.floor(app.ambiente.aleatorio() * outras.length)]
          const removido = modelo.escoria.martelar(modelo.xMm, modelo.yMm)
          vista.soltarEscoria(modelo.xMm, modelo.yMm, removido)
          ultimoGolpeMs = agora
        }
        if (ferramentaAtual === 'escova' && pressionada) modelo.escoria.escovar(modelo.xMm, modelo.yMm)
        limpezaPressionada = pressionada
      }
      posicao = { x: modelo.xMm, y: modelo.yMm }
      const quente = modelo.escoria.fracaoQuente
      const texto = encerrada ? 'Tentativa encerrada · inspecione e veja a nota ao lado' : pausado || modal ? 'Pausado · porta-eletrodo desenergizado'
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
      avanco.value = `${n1(modelo.estado === 'arco' ? modelo.velocidadeMmS : 0)} mm/s`
      // Calor do arco agora (H82): potência que entra na peça ÷ velocidade de avanço, comparado com o da peça.
      const calorAgora = modelo.estado === 'arco' && modelo.velocidadeMmS > 0.3 ? RENDIMENTO15.termico * modelo.correnteA * modelo.tensaoV / modelo.velocidadeMmS / 1000 : 0
      avanco.dataset.faixa = !calorAgora ? '' : calorAgora < LIMITES.fusaoFracaAbaixo * alvo ? 'frio' : calorAgora > LIMITES.fusaoExcessoAcima * alvo ? 'quente' : 'bom'
      fonteHud.value = `${n0(modelo.correnteA)} A · Ø ${n1(modelo.diametroMm)}`
      const chaveTeclas = JSON.stringify(cfg.teclas)
      if (chaveTeclas !== teclasChave) {
        teclasChave = chaveTeclas
        const t = cfg.teclas
        teclasVista.replaceChildren(...([
          ['mouse', 'leva a ponta'], [`${nomeTecla(t.aproximar)}/${nomeTecla(t.afastar)}`, 'acompanha/afasta'],
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
      leitura('Calor do passe', `${calorAgora ? `${n1(calorAgora)} kJ/mm` : '—'} · bom de ${n1(LIMITES.fusaoFracaAbaixo * alvo)} a ${n1(LIMITES.fusaoExcessoAcima * alvo)}`)
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
      avaliar.disabled = encerrada || modelo.tempoArcoS < 0.1 || pausado || modal
      zoomValor.value = `${vista.zoomPercentual()}%`
      zoomMais.disabled = zoomMenos.disabled = modelo.estado === 'arco'
      atualizarObjetivo(agora)
      // A análise (poros, crateras, mordedura, respingos, cor de calor) acompanha o cordão a cada meio segundo.
      if (!encerrada && agora - analiseMs > 500 && registro.aberturas.length) {
        analiseMs = agora
        vista.atualizarDefeitos(analisarEletrodo(peca, cordao, registro).defeitos)
      }
      vista.desenhar(modelo, posicao, cordao, ferramentaAtual, limpezaPressionada && pode, agora - ultimoGolpeMs, agora, pode ? dt : 0, direcaoGolpe, ocultarEscoria, encerrada)
      pedido = requestAnimationFrame(quadro)
    }
    pedido = requestAnimationFrame(quadro)
    return () => { cancelAnimationFrame(pedido); soltar(); tamanho.disconnect(); ouvintes.forEach(f => f()); vista.destruir() }
  }, 'Treino · eletrodo revestido')
}
