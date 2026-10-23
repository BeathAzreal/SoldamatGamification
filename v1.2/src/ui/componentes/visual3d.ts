import type { Mapeamento } from '../../entrada/fonte'
import type { GeometriaJunta } from '../../modelo/junta'
import type { ContextoProcesso } from '../../modelo/processo'
import { criarCenaExecucao3D, type CenaExecucao3D, type DadosQuadro3D } from '../../render/execucao3d'
import { webglDisponivel } from '../../render/palco3d'
import { MonitorQuadros, NOME_QUALIDADE, qualidadeAbaixo, type Qualidade3D } from '../../render/qualidade3d'
import type { Vista } from '../../render/vista'
import { INCLINACAO_MAX_GRAUS } from '../../render/vista3d'
import type { App } from '../app'
import { h } from '../dom'

/*
 * Visual 3D de uma peça soldada AO VIVO (execução e peça de teste da
 * bancada). O canvas 2D da tela continua por cima, transparente, recebendo
 * o ponteiro: a entrada pergunta a posição por `mapa`, que usa o raycast da
 * Vista3D com o 3D ligado e a Vista 2D no resto (o mesmo resultado sem
 * inclinação). O jogo é só 3D: o desenho 2D é só o plano B sem WebGL.
 * Se ficar lento, a qualidade baixa sozinha. A inclinação fica lembrada.
 */

export interface OpcoesVisual3D {
  app: App
  /** Onde fica o canvas 3D (atrás do 2D). */
  area: HTMLElement
  /** Canvas 2D da tela: recebe o ponteiro e o foco. */
  canvas: HTMLCanvasElement
  vista: Vista
  /** O que a cena 3D precisa saber da peça; relido a cada `recriar()`. */
  peca: () => { contexto: ContextoProcesso; geometria: GeometriaJunta; missao?: { inicioMm: number; fimMm: number; alinhamentoMm: number } }
  /** A mesma posição na tela pode ser outro ponto da junta (troca de vista ou inclinação). */
  aoMudarMapa: () => void
  /** Texto do aviso de queda de qualidade (ex.: "nesta tentativa"). */
  quando?: string
}

export interface Visual3D {
  /** Botões 2D/3D, inclinação e aviso (vai por cima da área da peça). */
  readonly elemento: HTMLElement
  readonly mapa: Mapeamento
  /** O 3D está ligado e desenhando. */
  readonly ativo: boolean
  /** Começa no visual salvo nas preferências. Chamar depois que a tela estiver montada. */
  iniciar(): void
  ajustarTamanho(largura: number, altura: number): void
  /** Chamado a cada quadro com o 3D ativo (inclui o monitor de desempenho). */
  desenhar(d: DadosQuadro3D): void
  /** A peça pode ter mudado (material, espessura, formato, gás, movimento): refaz a cena 3D se mudou. */
  recriar(): void
  destruir(): void
}

export function montarVisual3D(op: OpcoesVisual3D): Visual3D {
  const { app, area, canvas, vista } = op
  let modo: '2d' | '3d' = '2d'
  let cena: CenaExecucao3D | null = null
  let qualidade: Qualidade3D = app.preferencias.qualidade3d
  let largura = 0
  let altura = 0
  /** O que define a cena 3D; recriar() só refaz se isto mudou. */
  const chave = () => {
    const { contexto: c, geometria } = op.peca()
    return [c.material, c.espessuraMm, c.aberturaMm, c.junta ?? 'topo', geometria.formato, c.gas, c.tecnica ?? 'neutra'].join('|')
  }
  let chaveAtual = ''
  const monitor = new MonitorQuadros()
  let avisouLento = false
  const temWebgl = webglDisponivel()

  const aviso = h('span', { class: 'aviso-visual', role: 'status', hidden: true })
  const avisar = (texto: string) => {
    aviso.textContent = texto
    aviso.hidden = false
  }
  const lembrar = (mudar: (p: typeof app.preferencias) => void) => {
    mudar(app.preferencias)
    app.salvar('preferencias')
  }

  // Inclinar a câmera (só no 3D). Com o ponteiro parado, a tocha passa a apontar outro ponto, como no giro.
  const grausIniciais = String(app.preferencias.inclinacao3d)
  const inclinacao = h('input', { type: 'range', min: '0', max: String(INCLINACAO_MAX_GRAUS), step: '1', value: grausIniciais, 'aria-label': 'Inclinação da câmera (graus)' })
  const textoInclinacao = h('output', {}, `${grausIniciais}°`)
  const rotuloInclinacao = h('label', { class: 'inclinacao', hidden: true, title: 'Inclinar a câmera: 0° = de cima, como no 2D' }, 'Inclinação ', inclinacao, textoInclinacao)
  const radianos = () => (Number(inclinacao.value) * Math.PI) / 180

  const criar = (): boolean => {
    cena = criarCenaExecucao3D({ ...op.peca(), vista2d: vista, qualidade })
    if (!cena) return false
    chaveAtual = chave()
    area.prepend(cena.elemento)
    cena.vista.definirInclinacao(radianos())
    const r = area.getBoundingClientRect()
    largura = r.width
    altura = r.height
    cena.ajustarTamanho(largura, altura)
    monitor.reiniciar()
    return true
  }
  const descartar = () => {
    cena?.destruir()
    cena = null
  }

  /** O jogo é só 3D; o desenho 2D fica como plano B (sem WebGL ou 3D lento demais). */
  const definirModo = (m: '2d' | '3d') => {
    if (m === '3d' && !cena && !criar()) {
      avisar('Sem WebGL: usando o desenho 2D de reserva.')
      m = '2d'
    }
    if (m === '3d' && modo !== '3d') monitor.reiniciar()
    modo = m
    if (cena) cena.elemento.hidden = m !== '3d'
    rotuloInclinacao.hidden = m !== '3d'
    op.aoMudarMapa()
    canvas.focus()
  }

  inclinacao.addEventListener('input', () => {
    textoInclinacao.textContent = `${inclinacao.value}°`
    cena?.vista.definirInclinacao(radianos())
    op.aoMudarMapa()
  })
  inclinacao.addEventListener('change', () => {
    lembrar((p) => (p.inclinacao3d = Number(inclinacao.value)))
    // Devolve o foco à peça, para os atalhos de teclado voltarem a funcionar.
    canvas.focus()
  })

  const quando = op.quando ?? 'nesta tela'
  const api: Visual3D = {
    elemento: h('div', { class: 'visual-sobre', role: 'group', 'aria-label': 'Câmera' }, rotuloInclinacao, aviso),
    mapa: { paraPeca: (px, py) => (modo === '3d' && cena ? cena.vista : vista).paraPeca(px, py) },
    get ativo() {
      return modo === '3d' && cena !== null
    },
    iniciar() {
      if (temWebgl) definirModo('3d')
      else avisar('Sem WebGL neste navegador: usando o desenho 2D de reserva.')
    },
    ajustarTamanho(l, a) {
      largura = l
      altura = a
      cena?.ajustarTamanho(l, a)
    },
    desenhar(d) {
      if (!cena) return
      cena.desenhar(d)
      // Lento: baixa a qualidade. O jogo é só 3D: na mais baixa, continua em 3D e só avisa.
      if (monitor.registrar(d.agoraMs) !== 'lento') return
      const menor = qualidadeAbaixo(qualidade)
      if (!menor) {
        if (!avisouLento) avisar('O 3D está lento neste computador, mesmo na qualidade baixa.')
        avisouLento = true
        monitor.reiniciar()
        return
      }
      descartar()
      qualidade = menor
      if (criar()) avisar(`3D lento: qualidade ${NOME_QUALIDADE[menor].toLowerCase()} ${quando}.`)
      else definirModo('2d')
    },
    recriar() {
      if (!cena || chave() === chaveAtual) return
      const visivel = modo === '3d'
      descartar()
      if (criar() && cena) (cena as CenaExecucao3D).elemento.hidden = !visivel
      else if (visivel) definirModo('2d')
      if (largura > 0) cena?.ajustarTamanho(largura, altura)
    },
    destruir() {
      descartar()
    },
  }
  return api
}
