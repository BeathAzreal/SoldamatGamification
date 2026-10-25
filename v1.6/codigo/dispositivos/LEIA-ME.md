# Dispositivos

Leitura do mouse, da caneta (mesa digitalizadora) e do controle (gamepad) no jogo MIG, e os gestos de câmera e peça.

| Arquivo | O que é |
|---|---|
| [`controle-gamepad.ts`](controle-gamepad.ts) | Controle (gamepad) — Lê o controle de videogame: o analógico controla a velocidade da tocha. |
| [`escolher-dispositivo.ts`](escolher-dispositivo.ts) | Escolher o dispositivo — Cria a leitura certa (mouse, caneta ou controle) com a calibração salva. |
| [`gestos-de-camera-e-peca.ts`](gestos-de-camera-e-peca.ts) | Gestos de câmera e peça (MIG) — Arrastar para girar a câmera ou a peça, roda para aproximar, e as teclas configuráveis desses gestos. |
| [`leitura-comum.ts`](leitura-comum.ts) | Leitura comum dos dispositivos — O formato único que todo dispositivo entrega à simulação: posição em mm, instante e arco aberto/fechado. |
| [`lista-de-dispositivos.ts`](lista-de-dispositivos.ts) | Lista de dispositivos — Os dispositivos aceitos (mouse, caneta, controle) e seus nomes na tela. |
| [`mouse-e-caneta.ts`](mouse-e-caneta.ts) | Mouse e caneta — Lê o mouse e a mesa digitalizadora (pressão e inclinação da caneta). |
