import { Acionamento15, VARETA15, type FaixaArco15, type Processo15 } from '../../modelo/acionamento15'
import { Cordao } from '../../modelo/cordao'
import { criarBancada15 } from '../../render/bancada15'
import type { Tela } from '../app'
import { h, n0, n1 } from '../dom'
import { carregarControles15, nomeTecla15 as nomeTecla } from '../../dados/controles15'
import { configurarControles15 } from '../componentes/controles15'
import type { FerramentaBancada15 } from '../../modelo/escoria15'

/** Quadro muito longo (aba travada, depurador) não vira um salto de vários segundos de arco. */
const DT_MAX = 0.25

/** Faixas do medidor de distância: [até (mm), nome, classe]. */
function faixasMedidor(m: Acionamento15): { escala: number; faixas: [number, string, string][] } {
  if (m.processo === 'mig') return { escala: 35, faixas: [[5, 'perto', 'fora'], [25, 'faixa do arco', 'bom'], [35, 'longe', 'fora']] }
  const d = m.diametroMm
  return {
    escala: 8,
    faixas: [[VARETA15.contatoMm, 'contato', 'contato'], [0.5 * d, 'curto', 'atencao'], [1.3 * d, 'adequado', 'bom'], [m.arcoMaxMm, 'longo', 'atencao'], [8, 'apaga', 'fora']],
  }
}

const TEXTO_FAIXA: Record<FaixaArco15, string> = {
  curto: 'arco curto · risco de grudar',
  adequado: 'arco adequado · perto do diâmetro da alma',
  longo: 'arco longo · cordão largo, baixo e com respingos',
}

export const telaPrototipo15: Tela = (app) => {
  app.raiz.classList.add('app-cheia')
  let modelo = new Acionamento15('eletrodo')
  let cordao = new Cordao()
  let posicao = { x: 75, y: 0 }
  let ponteiro = false
  let painel = false
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
  const teclas = new Set<string>()
  const vista = criarBancada15()
  if (!vista) return app.raiz.append(h('p', {}, 'WebGL indisponível: abra o protótipo no Chrome ou Edge com aceleração gráfica.'))
  const canvas = vista.canvas
  const soltar = () => { ponteiro = painel = false; teclas.clear(); modelo.soltar() }

  // Leituras sobre a vista 3D: o que o soldador precisa ver sem tirar os olhos da poça.
  const estado = h('strong', { class: 'p15-estado', role: 'status', 'aria-live': 'polite' })
  const faixasEl = h('div', { class: 'p15-medidor-faixas' })
  const marcador = h('span', { class: 'p15-medidor-marca' })
  const medidor = h('div', { class: 'p15-medidor', 'aria-hidden': 'true' }, faixasEl, marcador)
  const medidorTexto = h('span', { class: 'p15-medidor-texto' })
  const distanciaHud = h('output', { class: 'p15-numero' })
  const legenda = h('span', { class: 'p15-rotulo' })
  const restante = h('output')
  const barra = h('progress', { max: VARETA15.inicialMm, value: VARETA15.inicialMm, 'aria-label': 'Comprimento restante da vareta' })
  const consumo = h('div', { class: 'p15-hud-item p15-consumo' }, h('span', { class: 'p15-rotulo' }, 'Vareta'), restante, barra)
  const avanco = h('output')
  const fonteHud = h('output')
  const hud = h('div', { class: 'p15-hud' }, estado,
    h('div', { class: 'p15-hud-arco' }, h('div', { class: 'p15-hud-linha' }, legenda, distanciaHud), medidor, medidorTexto),
    h('div', { class: 'p15-hud-grade' },
      consumo,
      h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Avanço'), avanco),
      h('div', { class: 'p15-hud-item' }, h('span', { class: 'p15-rotulo' }, 'Fonte'), fonteHud)))

  // Painel lateral: ferramenta, comandos, regulagem e detalhes recolhíveis.
  const ajuda = h('p', { class: 'p15-ajuda' })
  const acionar = h('button', { type: 'button', class: 'primario p15-acionar' })
  const trocar = h('button', { type: 'button', on: { click: () => { modelo.trocarVareta(); canvas.focus() } } }, 'Nova vareta')
  const desgrudar = h('button', { type: 'button', class: 'p15-alerta', on: { click: () => { modelo.desgrudar(); canvas.focus() } } }, 'Desgrudar eletrodo')
  const botoesFerramenta = new Map<FerramentaBancada15, HTMLButtonElement>()
  const selecionarFerramenta = (f: FerramentaBancada15) => {
    soltar(); limpezaPressionada = false; ferramentaAtual = f
    for (const [id, b] of botoesFerramenta) b.setAttribute('aria-pressed', String(id === f))
    acionar.hidden = f !== 'soldar'
    canvas.focus()
  }
  for (const [id, nome] of [['soldar', 'Soldagem'], ['martelo', 'Martelinho'], ['escova', 'Escova de aço']] as const) {
    botoesFerramenta.set(id, h('button', { type: 'button', 'aria-pressed': id === 'soldar' ? 'true' : 'false', on: { click: () => selecionarFerramenta(id) } }, nome))
  }
  const ferramentas = h('div', { class: 'p15-ferramentas', role: 'group', 'aria-label': 'Ferramentas da bancada' }, [...botoesFerramenta.values()])
  const correnteValor = h('output')
  const corrente = h('input', { type: 'range', min: 40, max: 180, step: 5, value: 90, 'aria-label': 'Corrente do eletrodo (A)' })
  corrente.addEventListener('input', () => modelo.regular(Number(corrente.value)))
  const diametro = h('select', { 'aria-label': 'Diâmetro do eletrodo' }, [2.5, 3.2].map(d => h('option', { value: d }, `${n1(d)} mm`)))
  diametro.addEventListener('change', () => { modelo.regular(modelo.correnteA, Number(diametro.value)); canvas.focus() })
  const compensar = h('input', { type: 'checkbox' })
  compensar.addEventListener('change', () => { modelo.compensar = compensar.checked; canvas.focus() })
  const referencia = h('small', { class: 'p15-dica' })
  const fisica = h('fieldset', { class: 'p15-fonte' }, h('legend', {}, 'Fonte e consumível'),
    h('label', {}, h('span', { class: 'p15-linha' }, 'Corrente', correnteValor), corrente),
    h('label', { class: 'p15-linha' }, 'Eletrodo didático', diametro),
    referencia,
    h('label', { class: 'p15-check', title: 'Desce o porta-eletrodo na mesma taxa em que a vareta queima. Desligado, quem compensa é você (S).' }, compensar, 'Compensar consumo (assistido)'))
  const faixa = h('input', { type: 'range', min: 0, max: 35, step: 0.1, value: 10, 'aria-label': 'Distância da ferramenta à peça' })
  const altura = h('label', {}, h('span', { class: 'p15-linha' }, 'Altura manual', h('small', {}, 'W / S ou roda')), faixa)
  const orientacoes = [
    ['Direção da ferramenta (360°)', 360], ['Inclinação da ferramenta', 85], ['Rolamento do punho (360°)', 360],
  ].map(([nome, max]) => h('input', { type: 'range', min: 0, max, step: 1, value: 0, 'aria-label': nome }))
  const lerOrientacao = () => modelo.orientar(Number(orientacoes[0].value), Number(orientacoes[1].value), Number(orientacoes[2].value))
  orientacoes.forEach(c => c.addEventListener('input', lerOrientacao))
  const orientacaoValores = ['Direção', 'Inclinação (máx. 85°)', 'Punho'].map(() => h('output'))
  const orientar = h('details', {}, h('summary', {}, 'Orientação e câmera 360°'),
    ...orientacoes.map((c, i) => h('label', {}, h('span', { class: 'p15-linha' }, ['Direção', 'Inclinação (máx. 85°)', 'Punho'][i], orientacaoValores[i]), c)),
    h('p', { class: 'p15-dica' }, 'Arraste com o botão direito para orientar; I/K inclinam, J/L mudam a direção, Q/E giram o punho.'),
    h('button', { type: 'button', on: { click: () => { vista.centralizar(); canvas.focus() } } }, 'Centralizar câmera'))
  const leituras = h('dl', { class: 'p15-leituras' })
  const valoresLeitura = new Map<string, HTMLElement>()
  for (const nome of ['Tensão do arco', 'Consumo', 'Tempo de arco', 'Energia', 'Escória', 'Resíduos soltos', 'Sobre escória fria', 'Respingos', 'Grudou']) {
    const dd = h('dd')
    valoresLeitura.set(nome, dd)
    leituras.append(h('dt', {}, nome), dd)
  }
  const detalhes = h('details', {}, h('summary', {}, 'Leituras do modelo'), leituras,
    h('small', { class: 'p15-dica' }, 'Consumo, aderência, energia e escória são aproximações didáticas. Não predizem qualidade interna nem definem parâmetros de procedimento.'))
  const hardware = h('small', { class: 'p15-dica' })
  const dica = h('p', { class: 'p15-dica' })
  const controles = h('button', { type: 'button', on: { click: async () => {
    soltar(); modal = true
    try { cfg = await configurarControles15(cfg) } finally { modal = false; anterior = performance.now(); canvas.focus() }
  } } }, 'Configurar controles')
  const pausar = h('button', { type: 'button', on: { click: () => { pausado = !pausado; soltar(); pausar.textContent = pausado ? 'Continuar' : 'Pausar'; anterior = performance.now() } } }, 'Pausar')
  const botoes = new Map<Processo15, HTMLButtonElement>()
  let medidorChave = ''
  const escolher = (p: Processo15) => {
    soltar()
    modelo = new Acionamento15(p)
    modelo.compensar = p === 'eletrodo' && compensar.checked
    selecionarFerramenta('soldar')
    cordao = new Cordao()
    posicao = { x: 75, y: 0 }
    for (const [id, b] of botoes) b.setAttribute('aria-pressed', String(id === p))
    acionar.textContent = p === 'mig' ? 'Acionar tocha (segure)' : 'Habilitar eletrodo (segure)'
    legenda.textContent = p === 'mig' ? 'Bico–peça' : 'Comprimento do arco'
    dica.textContent = p === 'mig' ? 'O gatilho comanda o arco. O arame é alimentado continuamente neste ensaio.' : 'Para abrir, toque e afaste, ou risque a ponta na chapa como um fósforo. Mantenha o arco perto do diâmetro da alma. Espere a escória esfriar e limpe antes de outro passe.'
    consumo.hidden = trocar.hidden = p === 'mig'
    fisica.hidden = ferramentas.hidden = detalhes.hidden = p === 'mig'
    corrente.value = '90'; diametro.value = '2.5'
    medidorChave = ''
  }
  for (const [p, texto] of [['mig', 'MIG/MAG'], ['eletrodo', 'Eletrodo revestido']] as const) {
    botoes.set(p, h('button', { type: 'button', 'aria-pressed': p === 'eletrodo' ? 'true' : 'false', on: { click: () => escolher(p) } }, texto))
  }
  const teclasVista = h('div', { class: 'p15-instrucoes' })
  const area = h('div', { class: 'p15-vista' }, canvas, hud, teclasVista)
  const limpar = h('button', { type: 'button', on: { click: () => escolher(modelo.processo) } }, 'Reiniciar ensaio')
  const conteudo = h('section', { class: 'p15' },
    h('header', { class: 'p15-cabecalho' },
      h('div', {}, h('h2', { class: 'tela-titulo', tabindex: '-1' }, 'Bancada de soldagem'), h('p', {}, 'v1.5 · Modelo qualitativo SMAW · sem certificação')),
      h('div', { class: 'p15-processos' }, controles, h('div', { class: 'p15-segmentos', role: 'group', 'aria-label': 'Processo' }, [...botoes.values()]))),
    h('div', { class: 'p15-grade' }, area,
      h('aside', { class: 'p15-painel' }, ferramentas, ajuda,
        h('div', { class: 'p15-comandos' }, acionar, desgrudar, trocar),
        fisica, altura, orientar, detalhes, dica,
        h('div', { class: 'p15-acoes' }, pausar, limpar), hardware)))
  app.raiz.append(conteudo)
  escolher('eletrodo')
  const ouvintes: (() => void)[] = []
  const ouvir = (alvo: EventTarget, tipo: string, f: EventListener) => { alvo.addEventListener(tipo, f); ouvintes.push(() => alvo.removeEventListener(tipo, f)) }
  const atualizarPosicao = (e: PointerEvent) => {
    if (modelo.grudado) return
    const p = vista.pontoNaTela(e.clientX, e.clientY)
    modelo.naPeca = !!p
    if (p) { posicao = p; modelo.xMm = p.x; modelo.yMm = p.y }
  }
  const mascara = (b: number) => [1, 4, 2][b]
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
    }
    else if (e.button === cfg.acionar) { atualizarPosicao(e); ponteiro = true }
  })
  ouvir(canvas, 'pointermove', ev => {
    const e = ev as PointerEvent
    if (pausado || modal) return
    const dx = e.clientX - ultimaTela.x, dy = e.clientY - ultimaTela.y
    if (gesto === 'camera') { if (!modelo.pressionado) vista.orbitar(dx * cfg.sensibilidade, dy * cfg.sensibilidade) }
    else if (gesto === 'ferramenta' && giroNaTela) {
      const o = giroNaTela(e.clientX - inicioGiro.x, e.clientY - inicioGiro.y, cfg.sensibilidade)
      modelo.orientar(o.azimute, o.inclinacao, modelo.rolamentoGraus)
    }
    else {
      atualizarPosicao(e)
      if (e.pointerType === 'pen' && cfg.caneta) modelo.orientar(Math.atan2(e.tiltY, e.tiltX) * 180 / Math.PI, Math.hypot(e.tiltX, e.tiltY), modelo.rolamentoGraus)
    }
    ultimaTela = { x: e.clientX, y: e.clientY }
    ponteiro = (e.buttons & mascara(cfg.acionar)) !== 0
  })
  ouvir(canvas, 'pointerup', ev => {
    ponteiro = ((ev as PointerEvent).buttons & mascara(cfg.acionar)) !== 0
    gesto = null
    if (!ponteiro && !painel && !teclas.has(cfg.teclas.acionar)) modelo.soltar()
  })
  ouvir(canvas, 'pointercancel', () => { gesto = null; soltar() })
  ouvir(canvas, 'lostpointercapture', () => {
    ponteiro = false; gesto = null
    // Soltar o botão de orientação não interrompe o comando mantido no teclado.
    if (!painel && !teclas.has(cfg.teclas.acionar)) modelo.soltar()
  })
  ouvir(canvas, 'contextmenu', e => e.preventDefault())
  ouvir(canvas, 'pointerleave', () => { if (!ponteiro) modelo.naPeca = false })
  ouvir(canvas, 'wheel', e => {
    e.preventDefault()
    if (!pausado && !modal) {
      if (cfg.roda === 'zoom') vista.aproximar((e as WheelEvent).deltaY)
      else modelo.definirDistancia(modelo.distanciaMm + Math.sign((e as WheelEvent).deltaY) * 0.5)
    }
  })
  faixa.addEventListener('input', () => { if (!pausado) modelo.definirDistancia(Number(faixa.value)) })
  ouvir(acionar, 'pointerdown', ev => {
    const e = ev as PointerEvent
    if (e.button !== 0 || pausado || modal) return
    e.preventDefault(); acionar.setPointerCapture(e.pointerId); painel = true; modelo.naPeca = true
  })
  for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) ouvir(acionar, tipo, () => { painel = false; modelo.soltar() })
  ouvir(window, 'keydown', ev => {
    const e = ev as KeyboardEvent
    if (modal || (e.target as HTMLElement)?.matches('input,select,textarea') || !Object.values(cfg.teclas).includes(e.code)) return
    e.preventDefault()
    if (!pausado) teclas.add(e.code)
  })
  ouvir(window, 'keyup', ev => { const e = ev as KeyboardEvent; teclas.delete(e.code); if (e.code === cfg.teclas.acionar) modelo.soltar() })
  ouvir(window, 'blur', () => { foco = false; soltar() })
  ouvir(window, 'focus', () => { foco = true })
  ouvir(document, 'visibilitychange', () => { soltar(); anterior = performance.now() })
  const tamanho = new ResizeObserver(() => { const r = area.getBoundingClientRect(); vista.enquadrar(r.width, r.height) })
  tamanho.observe(area)
  const mensagens = {
    desligado: 'Solto · arco desligado', pronto: 'Aproxime até tocar e afaste levemente', contato: 'Contato · afaste levemente para abrir',
    arco: 'Arco aberto', afastado: 'Fora da faixa ou da peça', fim: 'Fim da vareta · solte e troque', grudado: 'Eletrodo grudado · solte e use Desgrudar',
  }
  let teclasChave = ''
  const desenharMedidor = () => {
    const { escala, faixas } = faixasMedidor(modelo)
    const chave = `${modelo.processo}|${modelo.diametroMm}`
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
      if (cfg.analogico === 'camera' && !modelo.pressionado) vista.orbitar(eixo(2) * dt * 180, eixo(3) * dt * 180)
      else if (cfg.analogico === 'ferramenta') modelo.orientar(modelo.azimuteGraus + eixo(2) * dt * 60, modelo.inclinacaoGraus + eixo(3) * dt * 60, modelo.rolamentoGraus + (Number(g.buttons[5]?.pressed ?? false) - Number(g.buttons[4]?.pressed ?? false)) * dt * 60)
    }
    const textoHardware = `Controle: ${g ? 'conectado' : 'não conectado'} · Caneta: ${cfg.caneta ? 'inclinação habilitada' : 'manual'}`
    if (hardware.textContent !== textoHardware) hardware.textContent = textoHardware
    modelo.pressionado = pode && ferramentaAtual === 'soldar' && (ponteiro || painel || teclas.has(cfg.teclas.acionar) || gatilhoControle)
    if (!modelo.pressionado) modelo.soltar()
    if (pode) {
      if (ferramentaAtual === 'soldar') modelo.orientar(modelo.azimuteGraus + (ativo('azMais') - ativo('azMenos')) * dt * 60, modelo.inclinacaoGraus + (ativo('inclMais') - ativo('inclMenos')) * dt * 45, modelo.rolamentoGraus + (ativo('rolMais') - ativo('rolMenos')) * dt * 60)
      modelo.avancar(dt, ferramentaAtual === 'soldar' ? (ativo('afastar') - ativo('aproximar') + alturaControle) * cfg.velocidade : 0,
        (volume, forma) => cordao.depositar(modelo.xMm, modelo.yMm, volume, agora, forma?.razao, 0, forma?.instabilidade ?? 0))
      const pressionada = !!(modelo.naPeca && (ponteiro || ativo('acionar') || gatilhoControle))
      if (ferramentaAtual === 'martelo' && pressionada && !limpezaPressionada && !modelo.grudado) {
        modelo.escoria.martelar(modelo.xMm, modelo.yMm); ultimoGolpeMs = agora
      }
      if (ferramentaAtual === 'escova' && pressionada && !modelo.grudado) modelo.escoria.escovar(modelo.xMm, modelo.yMm)
      limpezaPressionada = pressionada
    }
    posicao = { x: modelo.xMm, y: modelo.yMm }
    const quente = modelo.escoria.fracaoQuente
    const texto = pausado || modal ? 'Pausado · arco desligado'
      : ferramentaAtual === 'martelo' ? (quente > 0.5 ? 'Martelinho · escória ainda quente, espere esfriar' : 'Martelinho · clique para quebrar escória fria')
      : ferramentaAtual === 'escova' ? 'Escova · arraste para retirar resíduos'
      : mensagens[modelo.estado]
    const faixaArco = modelo.faixaArco
    const comando = `botão ${['esquerdo', 'do meio', 'direito'][cfg.acionar]} ou ${nomeTecla(cfg.teclas.acionar)}`
    const instrucao = ferramentaAtual === 'martelo' ? 'Dê um clique por golpe na crosta fria. O martelinho solta a escória e deixa resíduos para a escova.'
      : ferramentaAtual === 'escova' ? 'Segure e arraste sobre os resíduos soltos. Crosta intacta precisa primeiro do martelinho.'
      : modelo.processo === 'mig' ? `Segure ${comando} sobre a chapa.`
      : `Segure ${comando}. Toque e afaste levemente para abrir o arco; depois desça com ${nomeTecla(cfg.teclas.aproximar)} conforme a vareta queima.`
    if (ajuda.textContent !== instrucao) ajuda.textContent = instrucao
    if (estado.textContent !== texto) estado.textContent = texto
    estado.dataset.arco = String(modelo.estado === 'arco')
    estado.dataset.alerta = String(modelo.estado === 'grudado' || modelo.estado === 'fim')
    desenharMedidor()
    distanciaHud.value = `${n1(modelo.distanciaMm)} mm`
    const textoMedidor = faixaArco ? TEXTO_FAIXA[faixaArco]
      : modelo.processo === 'mig' ? 'faixa do arco: 5 a 25 mm'
      : `abre entre o toque e ${n1(modelo.arcoMaxMm)} mm`
    if (medidorTexto.textContent !== textoMedidor) medidorTexto.textContent = textoMedidor
    medidorTexto.dataset.faixa = faixaArco ?? ''
    avanco.value = `${n1(modelo.estado === 'arco' ? modelo.velocidadeMmS : 0)} mm/s`
    fonteHud.value = modelo.processo === 'mig' ? 'MIG/MAG' : `${n0(modelo.correnteA)} A · Ø ${n1(modelo.diametroMm)}`
    const chaveTeclas = JSON.stringify(cfg.teclas) + cfg.acionar
    if (chaveTeclas !== teclasChave) {
      teclasChave = chaveTeclas
      const t = cfg.teclas
      teclasVista.replaceChildren(...([
        [nomeTecla(t.acionar), 'habilita'], [`${nomeTecla(t.afastar)}/${nomeTecla(t.aproximar)}`, 'sobe/desce'],
        ['meio', 'câmera'], ['direito', 'orienta'], [`${nomeTecla(t.inclMenos)}/${nomeTecla(t.inclMais)}`, 'inclina'],
        [`${nomeTecla(t.azMenos)}/${nomeTecla(t.azMais)}`, 'direção'], [`${nomeTecla(t.rolMenos)}/${nomeTecla(t.rolMais)}`, 'punho'],
      ] as const).map(([k, o]) => h('span', {}, h('kbd', {}, k), o)))
    }
    faixa.value = String(modelo.distanciaMm)
    faixa.disabled = pausado || modal || modelo.grudado || ferramentaAtual !== 'soldar'
    corrente.disabled = diametro.disabled = modelo.pressionado || pausado || modal
    correnteValor.value = `${n0(modelo.correnteA)} A`
    const relativa = modelo.correnteRelativa
    const textoRef = relativa < 0.55 ? 'Corrente baixa demais: o arco não se sustenta.' : relativa < 0.65 ? 'Corrente baixa: gruda com facilidade.' : relativa > 1.45 ? 'Corrente alta: a vareta queima depressa.' : 'Corrente na faixa de trabalho do modelo.'
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
    leitura('Grudou', `${modelo.grudadas}×`)
    ;[modelo.azimuteGraus, modelo.inclinacaoGraus, modelo.rolamentoGraus].forEach((v, i) => {
      orientacoes[i].value = String(v); orientacoes[i].disabled = modelo.grudado || pausado || modal
      orientacaoValores[i].value = `${n0(v)}°`
    })
    desgrudar.hidden = !modelo.grudado
    desgrudar.disabled = modelo.pressionado || pausado || modal
    restante.value = `${n0(modelo.restanteMm)} / ${VARETA15.inicialMm} mm`
    barra.value = modelo.restanteMm
    barra.dataset.fim = String(modelo.restanteMm < VARETA15.reservaMm + 10)
    trocar.disabled = modelo.pressionado || pausado
    trocar.classList.toggle('primario', modelo.estado === 'fim')
    vista.desenhar(modelo, posicao, cordao, ferramentaAtual, limpezaPressionada && pode, agora - ultimoGolpeMs, agora, pode ? dt : 0)
    pedido = requestAnimationFrame(quadro)
  }
  pedido = requestAnimationFrame(quadro)
  return () => { cancelAnimationFrame(pedido); soltar(); tamanho.disconnect(); ouvintes.forEach(f => f()); vista.destruir() }
}
