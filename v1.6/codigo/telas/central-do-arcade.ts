/*
 * █ Tela: central do Arcade
 *
 * O que faz: O menu do Arcade com as três formas de jogar: HISTÓRIA
 *    (missões), DESAFIOS (sorteados, com vidas) e VERSUS (torneio local).
 *
 * Onde mexer: Textos de cada opção na lista abaixo.
 */
import type { App } from '../interface/aplicativo'
import { menuOficina } from '../partes-das-telas/menu-da-oficina'
import { telaHistoria } from './missoes'
import { telaArcade } from './arcade'
import { telaTorneios } from './torneio'
import { telaMenu } from './menu-inicial'

export function telaCentralArcade(app: App): void {
  menuOficina(app, 'ARCADE', 'OFICINA / PARTIDAS', [
    { nome: 'HISTÓRIA', descricao: 'Missões e encomendas organizadas em capítulos.', abrir: () => telaHistoria(app) },
    { nome: 'DESAFIOS', descricao: 'Desafios sorteados, três vidas e recordes.', abrir: () => telaArcade(app) },
    { nome: 'VERSUS', descricao: 'Disputa local por turnos, com participantes e rodadas.', abrir: () => telaTorneios(app) },
  ], { nome: 'VOLTAR AO MENU', descricao: 'Voltar ao início da oficina.', abrir: () => telaMenu(app) })
}
