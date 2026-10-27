

## v1.6/v1.7 — calor por passe, defeitos e cordão 3D do eletrodo (H82 a H86, Claude)

Somam-se ao depósito do GPT (H79–H80) e à nota de 0 a 1000 (H81). Não mudam a nota, o depósito nem o consumo da vareta: explicam o que se vê no cordão e o que fazer na próxima tentativa.

**H82 — calor (aporte) por passe e fusão:** a energia que entra na peça é 0,8 × corrente × tensão do arco (20 + 2 × comprimento do arco, em V), espalhada ±2 mm ao longo da junta (`src/modelo/registroPasse.ts`). Dividida pelo comprimento, dá o aporte de calor em kJ/mm, como na prática. Cada peça tem um calor de referência: o da corrente no meio da faixa sugerida, arco do tamanho do diâmetro e avanço de 2,5 mm/s (cerca de 15 cm/min). A fusão de cada fatia é o calor do passe mais quente ÷ referência: abaixo de 0,6, falta de fusão (colagem); 0,6–0,8, fusão fraca; 0,8–1,7, adequada; acima de 1,7, calor em excesso; acima de 2,3 no primeiro passe de uma raiz aberta, perfuração prevista. Passar de novo pela fatia depois de 2 s conta como outro passe. Na tela, a leitura "Calor do passe" mostra o calor agora e a faixa boa, e o avanço no HUD muda de cor (frio, bom, quente).

**H83 — onde olhar:** a análise mede o metal do depósito (`DepositoEletrodo`) em fatias de 0,5 mm: largura, centro e altura da faixa contínua de metal que passa pela parte mais grossa. Fatias com menos de 2 mm de largura não entram na lista de defeitos.

**H84 — defeitos do eletrodo**, calculados a partir do registro do passe e desenhados sobre o cordão 3D com o mesmo desenho dos defeitos do MIG (`src/render/defeitos3d.ts`), a cada meio segundo enquanto se solda:
- mordedura: arco longo (acima de 1,3 diâmetro) e calor em excesso; risco escuro na borda do cordão;
- sobreposição: passe frio e lento;
- porosidade: arco longo (acima de 1,5 diâmetro) tira a proteção do revestimento; abrir o arco a frio e seguir em frente deixa poros no começo, a menos que a ponta volte por cima do ponto de abertura; furinhos escuros no cordão;
- cratera: apagar o arco sem parar 0,3 s sobre a poça, a não ser que outro passe cubra depois; mancha escura no fim do passe;
- inclusão de escória: metal posto sobre escória fria (soldar sem limpar entre passes);
- respingos presos (alguns sempre; muitos com arco longo), marca de abertura de arco fora da junta e marca de eletrodo grudado: bolinhas de metal na chapa;
- escamas espaçadas pelo avanço a cada 190 ms de arco;
- cor de calor ao lado do cordão onde o calor passou da referência.

**H85 — lista de defeitos no resultado:** ao encerrar, o resultado mostra, abaixo da nota, os defeitos do trecho exigido com a posição em mm (a régua da peça), a causa provável e como corrigir (`src/pontuacao/defeitosEletrodo.ts`). Falta de fusão, perfuração, inclusão de escória e sobreposição aparecem primeiro, como trechos que pediriam reparo. A lista é didática, inspirada em inspeção visual de soldagem; não é norma, não mexe na nota e não entra em recordes.

**H86 — cordão 3D na tela:** o cordão que aparece é o cordão 3D (o mesmo do MIG, com seção arredondada, escamas e brilho de metal), alimentado com o mesmo metal, no mesmo lugar e ao mesmo tempo que o depósito do GPT (H79). O depósito continua decidindo o comprimento do arco, a nota de 0 a 1000 e a lista de defeitos; o cordão 3D é só o desenho, e a escória, a ponta e o martelinho seguem a sua superfície. A malha do depósito (`src/render/metalEletrodo.ts`) não aparece mais.

Calibração (`tests/defeitosEletrodo.test.ts`, soldador simulado a 60 quadros/s): técnica boa (arco ≈ diâmetro, avanço de 2,5 mm/s, parada no fim, recuo na abertura, limpeza entre passes) não deixa defeito grave; avanço rápido demais dá falta de fusão; lento demais dá calor em excesso e, na raiz aberta, perfuração; arco longo dá mordedura, poros e respingos; não parar no fim deixa cratera; soldar por cima da escória sem limpar dá inclusão.
