# Desenho 3D (MIG)

Cenas 3D do jogo MIG: palco (sala, chapas, marcas), tocha, calor e faíscas, cordão ao vivo, defeitos e câmeras. Só aparência: nada aqui muda a nota.

| Arquivo | O que é |
|---|---|
| [`calor-faiscas-e-fumaca.ts`](calor-faiscas-e-fumaca.ts) | Calor, faíscas e fumaça — Faíscas, fumaça, brilho do metal quente, gotas que caem e halo de calor no 3D. Só aparência. |
| [`camera-da-soldagem.ts`](camera-da-soldagem.ts) | Câmera da soldagem MIG — A câmera da tela de soldagem MIG e a conversão entre tela e peça em 3D. |
| [`cenario-oficina.ts`](cenario-oficina.ts) | Cenário: oficina de treino — Bancada, armário, ferramentas na parede, máquina e cilindro da oficina pequena. Só decoração. |
| [`cenario-serralheria.ts`](cenario-serralheria.ts) | Cenário: serralheria — Cavalete de tubos, barras e suportes da missão do suporte de prateleira. Só decoração. |
| [`cordao-ao-vivo.ts`](cordao-ao-vivo.ts) | Cordão ao vivo — Monta a forma 3D do cordão enquanto ele é soldado, atualizando só o que mudou. |
| [`defeitos-visiveis.ts`](defeitos-visiveis.ts) | Defeitos visíveis em 3D — Desenha gotas, respingos, poros, mordedura e cores de oxidação calculados em simulacao-mig/defeitos.ts. |
| [`malha-do-cordao.ts`](malha-do-cordao.ts) | Malha do cordão — Contas que transformam as fatias do cordão em triângulos 3D. Sem desenho: só geometria. |
| [`palco.ts`](palco.ts) | Palco 3D — A base de toda cena 3D: sala, luz, chapas da junta, cordão, marcas INÍCIO/FIM e régua. |
| [`qualidade-grafica.ts`](qualidade-grafica.ts) | Qualidade gráfica — Os níveis baixa/média/alta e o monitor que reduz a qualidade se o computador ficar lento. |
| [`tocha-e-arco.ts`](tocha-e-arco.ts) | Tocha e arco (MIG) — A tocha MIG, o clarão do arco e a poça no 3D. |
| [`vista-da-inspecao.ts`](vista-da-inspecao.ts) | Vista 3D da inspeção — A peça soldada no resultado, com câmera livre (girar, aproximar) e o replay. |
| [`vista-da-soldagem.ts`](vista-da-soldagem.ts) | Vista 3D da soldagem MIG — A cena 3D durante a solda MIG: palco + tocha + calor + gotas. |
