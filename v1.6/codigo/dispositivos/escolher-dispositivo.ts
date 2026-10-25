/*
 * █ Escolher o dispositivo
 *
 * O que faz: Cria a leitura certa (mouse, caneta ou controle) com a calibração
 *    salva.
 */

import type { Preferencias } from '../salvamento/preferencias'
import { FonteControle } from './controle-gamepad'
import type { FonteEntrada, Mapeamento } from './leitura-comum'
import { FontePonteiro } from './mouse-e-caneta'
import type { Dispositivo } from './lista-de-dispositivos'

/** Cria a fonte de entrada do dispositivo escolhido, já com a calibração salva. */
export function criarFonte(
  dispositivo: Dispositivo,
  alvo: HTMLElement,
  mapa: Mapeamento,
  prefs: Preferencias,
  inicio: { x: number; y: number },
  limites: { xMin: number; xMax: number; yMin: number; yMax: number },
): FonteEntrada {
  if (dispositivo === 'controle') {
    const c = new FonteControle(prefs.indiceControle, prefs.controle, inicio)
    c.definirLimites(limites)
    return c
  }
  return new FontePonteiro(dispositivo, alvo, mapa, prefs.caneta)
}
