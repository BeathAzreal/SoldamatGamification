import { armazenamentoDoNavegador, novoId, Repositorio, type Colecao } from '../dados/armazenamento'
import { validarPerfis, type PerfilParticipante } from '../dados/participantes'
import { PREFERENCIAS_PADRAO, validarPreferencias, type Preferencias } from '../dados/preferencias'
import { validarListaRecordes, type Recorde } from '../dados/recordes'
import { validarListaArcade, type RecordeArcade } from '../dados/recordesArcade'
import {
  marcarInterrompidas,
  recortarBase,
  type Ambiente,
  type Avaliacao,
  type BaseTorneio,
  type Entrega,
  type TentativaRegistro,
  type Torneio,
} from '../dados/torneio'
import { h } from './dom'

/*
 * Estado da aplicação: dados carregados do navegador, gravação e navegação
 * entre telas. Cada tela é uma função que monta o DOM em `app.raiz` e pode
 * devolver uma função de limpeza.
 */

export type Tela = (app: App) => void | (() => void)

function validarListaComId<T>(dados: unknown): T[] | null {
  if (!Array.isArray(dados)) return null
  return dados.filter((x) => x && typeof x === 'object' && typeof (x as { id?: unknown }).id === 'string') as T[]
}

export class App {
  readonly raiz = document.getElementById('app') as HTMLElement
  readonly repo: Repositorio
  readonly persistente: boolean
  recordes: Recorde[] = []
  recordesArcade: RecordeArcade[] = []
  perfis: PerfilParticipante[] = []
  tentativas: TentativaRegistro[] = []
  entregas: Entrega[] = []
  torneios: Torneio[] = []
  avaliacoes: Avaliacao[] = []
  preferencias: Preferencias = { ...PREFERENCIAS_PADRAO }
  readonly ambiente: Ambiente = {
    agora: () => new Date(),
    aleatorio: () => {
      const v = new Uint32Array(1)
      crypto.getRandomValues(v)
      return v[0] / 2 ** 32
    },
    novoId,
  }
  private limpeza: (() => void) | null = null
  /** Pergunta antes de sair da tela atual (ex.: tentativa oficial em andamento). */
  guardaSaida: (() => Promise<boolean>) | null = null

  constructor() {
    const { armazenamento, persistente } = armazenamentoDoNavegador()
    this.repo = new Repositorio(armazenamento)
    this.persistente = persistente
    if (!persistente) this.avisar('Este navegador bloqueou o armazenamento local: nada será salvo ao fechar a página.')
    this.carregar()
  }

  private carregar(): void {
    const ler = <T>(c: Colecao, padrao: T, validar: (d: unknown) => T | null): T => {
      const r = this.repo.ler(c, padrao, validar)
      if (r.aviso) this.avisar(r.aviso)
      return r.dados
    }
    this.recordes = ler('recordes', [], validarListaRecordes)
    this.recordesArcade = ler('recordesArcade', [], validarListaArcade)
    this.perfis = ler('participantes', [], validarPerfis)
    this.tentativas = ler('tentativas', [], validarListaComId<TentativaRegistro>)
    this.entregas = ler('entregas', [], validarListaComId<Entrega>)
    this.torneios = ler('torneios', [], validarListaComId<Torneio>)
    this.avaliacoes = ler('avaliacoes', [], validarListaComId<Avaliacao>)
    this.preferencias = ler('preferencias', { ...PREFERENCIAS_PADRAO }, (d) => validarPreferencias(d))

    // Página recarregada no meio de uma tentativa oficial: ela conta como interrompida.
    for (const t of this.torneios) {
      const r = marcarInterrompidas(this.baseDoTorneio(t.id))
      if (r.alteradas) {
        this.gravarBase(r.base)
        this.avisar(`Torneio "${t.config.nome}": ${r.alteradas} tentativa(s) em andamento foram marcadas como interrompidas e contam no limite.`)
      }
    }
  }

  salvar(colecao: Colecao): void {
    const dados: Record<Colecao, unknown> = {
      recordes: this.recordes,
      recordesArcade: this.recordesArcade,
      participantes: this.perfis,
      tentativas: this.tentativas,
      entregas: this.entregas,
      torneios: this.torneios,
      avaliacoes: this.avaliacoes,
      preferencias: this.preferencias,
    }
    const r = this.repo.gravar(colecao, dados[colecao])
    if (!r.ok) this.avisar(r.erro)
  }

  baseDoTorneio(id: string): BaseTorneio {
    const t = this.torneios.find((x) => x.id === id)
    if (!t) throw new Error('Torneio não encontrado.')
    return recortarBase(t, { participantes: this.perfis, tentativas: this.tentativas, entregas: this.entregas, avaliacoes: this.avaliacoes })
  }

  /** Grava um torneio inteiro depois de uma ação (salva após cada ação relevante). */
  gravarBase(b: BaseTorneio): void {
    const id = b.torneio.id
    this.torneios = [...this.torneios.filter((t) => t.id !== id), b.torneio]
    const ids = new Set(b.participantes.map((p) => p.id))
    this.perfis = [...this.perfis.filter((p) => !ids.has(p.id)), ...b.participantes.map((p) => ({ ...p, origem: 'torneio' as const }))]
    this.tentativas = [...this.tentativas.filter((t) => t.torneioId !== id), ...b.tentativas]
    this.entregas = [...this.entregas.filter((e) => e.torneioId !== id), ...b.entregas]
    this.avaliacoes = [...this.avaliacoes.filter((a) => a.torneioId !== id), ...b.avaliacoes]
    for (const c of ['torneios', 'participantes', 'tentativas', 'entregas', 'avaliacoes'] as Colecao[]) this.salvar(c)
  }

  excluirTorneio(id: string): void {
    const t = this.torneios.find((x) => x.id === id)
    this.torneios = this.torneios.filter((x) => x.id !== id)
    this.tentativas = this.tentativas.filter((x) => x.torneioId !== id)
    this.entregas = this.entregas.filter((x) => x.torneioId !== id)
    this.avaliacoes = this.avaliacoes.filter((x) => x.torneioId !== id)
    if (t) this.perfis = this.perfis.filter((p) => !t.participanteIds.includes(p.id))
    for (const c of ['torneios', 'participantes', 'tentativas', 'entregas', 'avaliacoes'] as Colecao[]) this.salvar(c)
  }

  avisar(texto: string): void {
    const caixa = document.getElementById('avisos')!
    const aviso = h('div', { class: 'aviso-item' }, h('span', {}, texto), h('button', { type: 'button', 'aria-label': 'Fechar aviso', on: { click: () => aviso.remove() } }, '×'))
    caixa.append(aviso)
  }

  /** Mostra uma tela (fazendo a limpeza da anterior) e põe o foco no título. */
  async ir(tela: Tela, contexto = ''): Promise<void> {
    if (this.guardaSaida && !(await this.guardaSaida())) return
    this.guardaSaida = null
    this.limpeza?.()
    this.limpeza = null
    this.raiz.replaceChildren()
    this.raiz.classList.remove('app-cheia', 'tela-bancada', 'tela-resultado', 'tela-julgamento')
    document.getElementById('topo-contexto')!.textContent = contexto
    const r = tela(this)
    if (typeof r === 'function') this.limpeza = r
    this.raiz.querySelector<HTMLElement>('.tela-titulo')?.focus()
    window.scrollTo(0, 0)
  }
}
