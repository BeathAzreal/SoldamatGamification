/*
 * █ Lista de dispositivos
 *
 * O que faz: Os dispositivos aceitos (mouse, caneta, controle) e seus nomes na
 *    tela.
 */

/** Dispositivos de entrada reconhecidos pelo jogo (documentacao/DISPOSITIVOS.md). */
export type Dispositivo = 'mouse' | 'caneta' | 'controle'

export const DISPOSITIVOS: Dispositivo[] = ['mouse', 'caneta', 'controle']

export const NOME_DISPOSITIVO: Record<Dispositivo, string> = {
  mouse: 'Mouse',
  caneta: 'Mesa digitalizadora (caneta)',
  controle: 'Controle (gamepad)',
}
