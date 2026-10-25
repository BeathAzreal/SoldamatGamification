import { Acionamento15, VARETA15, type Processo15 } from '../../modelo/acionamento15'
import { Cordao } from '../../modelo/cordao'
import { criarBancada15 } from '../../render/bancada15'
import type { Tela } from '../app'
import { h, n1 } from '../dom'

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
  const teclas = new Set<string>()
  const vista = criarBancada15()
  if (!vista) return app.raiz.append(h('p', {}, 'WebGL indisponível: abra o protótipo no Chrome ou Edge com aceleração gráfica.'))
  const canvas = vista.canvas
  const soltar = () => { ponteiro = painel = false; teclas.clear(); modelo.soltar() }
  const estado = h('strong', { class: 'p15-estado', role: 'status', 'aria-live': 'polite' })
  const distancia = h('output', { class: 'p15-numero' })
  const restante = h('output')
  const tempo = h('output')
  const barra = h('progress', { max: VARETA15.inicialMm, value: VARETA15.inicialMm, 'aria-label': 'Comprimento restante da vareta' })
  const consumo = h('div', { class: 'p15-consumo' }, h('span', {}, 'Vareta restante'), restante, barra)
  const legenda = h('span', {})
  const faixa = h('input', { type: 'range', min: 0, max: 35, step: 0.1, value: 10, 'aria-label': 'Distância da ferramenta à peça' })
  const ajuda = h('p', { class: 'p15-ajuda' })
  const dica = h('p', { class: 'p15-dica' })
  const acionar = h('button', { type: 'button', class: 'primario p15-acionar' })
  const trocar = h('button', { type: 'button', on: { click: () => { modelo.trocarVareta(); canvas.focus() } } }, 'Nova vareta')
  const pausar = h('button', { type: 'button', on: { click: () => { pausado = !pausado; soltar(); pausar.textContent = pausado ? 'Continuar' : 'Pausar'; anterior = performance.now() } } }, 'Pausar')
  const botoes = new Map<Processo15, HTMLButtonElement>()
  const escolher = (p: Processo15) => {
    soltar()
    modelo = new Acionamento15(p)
    cordao = new Cordao()
    posicao = { x: 75, y: 0 }
    for (const [id, b] of botoes) b.setAttribute('aria-pressed', String(id === p))
    acionar.textContent = p === 'mig' ? 'Acionar tocha (segure)' : 'Habilitar eletrodo (segure)'
    legenda.textContent = p === 'mig' ? 'Distância bico–peça' : 'Distância ponta–peça'
    ajuda.textContent = p === 'mig' ? 'Mova sobre a chapa e segure o botão esquerdo ou Espaço para acionar a tocha.' : 'Segure o botão esquerdo ou Espaço. Aproxime até tocar e afaste levemente para abrir o arco.'
    dica.textContent = p === 'mig' ? 'O gatilho comanda o arco. O arame é alimentado continuamente neste ensaio.' : 'A vareta encurta e a ponta se afasta. Compense aproximando o porta-eletrodo. O botão é uma convenção do jogo: o porta-eletrodo real não tem gatilho.'
    consumo.hidden = trocar.hidden = p === 'mig'
  }
  for (const [p, texto] of [['mig', 'MIG/MAG'], ['eletrodo', 'Eletrodo revestido']] as const) {
    botoes.set(p, h('button', { type: 'button', 'aria-pressed': p === 'eletrodo' ? 'true' : 'false', on: { click: () => escolher(p) } }, texto))
  }
  const area = h('div', { class: 'p15-vista' }, canvas,
    h('div', { class: 'p15-instrucoes' }, h('strong', {}, 'Bancada experimental'), h('span', {}, 'Mouse: mover · botão/ Espaço: habilitar · W: aproximar · S: afastar · roda: ajustar altura')))
  const limpar = h('button', { type: 'button', on: { click: () => escolher(modelo.processo) } }, 'Reiniciar ensaio')
  const conteudo = h('section', { class: 'p15' },
    h('header', { class: 'p15-cabecalho' }, h('div', {}, h('h2', { class: 'tela-titulo', tabindex: '-1' }, 'Controle do arco'), h('p', {}, 'v1.5 · Protótipo de distância e consumo · sem pontuação')), h('div', { class: 'p15-processos' }, [...botoes.values()])),
    h('div', { class: 'p15-grade' }, area,
      h('aside', { class: 'p15-painel' }, estado, ajuda,
        h('label', {}, legenda, distancia, faixa),
        h('p', { class: 'p15-teclas' }, 'W aproxima · S afasta · roda ajusta 0,5 mm'),
        acionar, consumo, trocar,
        h('p', {}, 'Tempo de arco: ', tempo), dica,
        h('div', { class: 'p15-acoes' }, pausar, limpar),
        h('small', {}, 'Limiares e consumo são didáticos. Física SMAW, escória e avaliação de qualidade ficam para as próximas etapas.'))))
  app.raiz.append(conteudo)
  escolher('eletrodo')
  const ouvintes: (() => void)[] = []
  const ouvir = (alvo: EventTarget, tipo: string, f: EventListener) => { alvo.addEventListener(tipo, f); ouvintes.push(() => alvo.removeEventListener(tipo, f)) }
  const atualizarPosicao = (e: PointerEvent) => {
    const p = vista.pontoNaTela(e.clientX, e.clientY)
    modelo.naPeca = !!p
    if (p) posicao = p
  }
  ouvir(canvas, 'pointerdown', (ev) => {
    const e = ev as PointerEvent
    if (e.button !== 0 || pausado) return
    e.preventDefault(); canvas.focus(); canvas.setPointerCapture(e.pointerId)
    atualizarPosicao(e); ponteiro = true
  })
  ouvir(canvas, 'pointermove', e => atualizarPosicao(e as PointerEvent))
  for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) ouvir(canvas, tipo, () => { ponteiro = false; modelo.soltar() })
  ouvir(canvas, 'pointerleave', () => { if (!ponteiro) modelo.naPeca = false })
  ouvir(canvas, 'wheel', e => {
    e.preventDefault()
    if (!pausado) modelo.definirDistancia(modelo.distanciaMm + Math.sign((e as WheelEvent).deltaY) * 0.5)
  })
  faixa.addEventListener('input', () => { if (!pausado) modelo.definirDistancia(Number(faixa.value)) })
  ouvir(acionar, 'pointerdown', ev => {
    const e = ev as PointerEvent
    if (e.button !== 0 || pausado) return
    e.preventDefault(); acionar.setPointerCapture(e.pointerId); painel = true; modelo.naPeca = true
  })
  for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) ouvir(acionar, tipo, () => { painel = false; modelo.soltar() })
  ouvir(window, 'keydown', ev => {
    const e = ev as KeyboardEvent
    if ((e.target as HTMLElement)?.matches('input,select,textarea') || !['KeyW', 'KeyS', 'Space'].includes(e.code)) return
    e.preventDefault()
    if (!pausado) teclas.add(e.code)
  })
  ouvir(window, 'keyup', ev => { const e = ev as KeyboardEvent; teclas.delete(e.code); if (e.code === 'Space') modelo.soltar() })
  ouvir(window, 'blur', soltar)
  ouvir(document, 'visibilitychange', () => { soltar(); anterior = performance.now() })
  const tamanho = new ResizeObserver(() => { const r = area.getBoundingClientRect(); vista.enquadrar(r.width, r.height) })
  tamanho.observe(area)
  const mensagens = {
    desligado: 'Solto · arco desligado', pronto: 'Aproxime até tocar e afaste levemente', contato: 'Contato · afaste levemente para abrir',
    arco: 'Arco aberto', afastado: 'Fora da faixa ou da peça', fim: 'Fim da vareta · solte e troque',
  }
  const quadro = (agora: number) => {
    const dt = (agora - anterior) / 1000
    anterior = agora
    modelo.pressionado = !pausado && (ponteiro || painel || teclas.has('Space'))
    if (!modelo.pressionado) modelo.soltar()
    if (!pausado) modelo.avancar(dt, (Number(teclas.has('KeyS')) - Number(teclas.has('KeyW'))) * 3, volume => cordao.depositar(posicao.x, posicao.y, volume, agora))
    const texto = pausado ? 'Pausado · arco desligado' : mensagens[modelo.estado]
    if (estado.textContent !== texto) estado.textContent = texto
    estado.dataset.arco = String(modelo.estado === 'arco')
    distancia.value = `${n1(modelo.distanciaMm)} mm`
    faixa.value = String(modelo.distanciaMm)
    faixa.disabled = pausado
    restante.value = `${n1(modelo.restanteMm)} / ${VARETA15.inicialMm} mm`
    barra.value = modelo.restanteMm
    tempo.value = `${n1(modelo.tempoArcoS)} s`
    trocar.disabled = modelo.pressionado || pausado
    vista.desenhar(modelo, posicao, cordao)
    pedido = requestAnimationFrame(quadro)
  }
  pedido = requestAnimationFrame(quadro)
  return () => { cancelAnimationFrame(pedido); soltar(); tamanho.disconnect(); ouvintes.forEach(f => f()); vista.destruir() }
}
