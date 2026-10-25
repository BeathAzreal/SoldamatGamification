# Desenho 2D

Desenhos planos: gráficos da inspeção, corte transversal, desenho técnico da missão e a cena 2D usada sem 3D. Só aparência.

| Arquivo | O que é |
|---|---|
| [`cena-2d.ts`](cena-2d.ts) | Cena 2D — Desenho da peça vista de cima em 2D (usado quando o 3D não está disponível e em sobreposições). |
| [`corte-transversal.ts`](corte-transversal.ts) | Corte transversal — O corte da peça na aba Corte: chapas, cordão e zona fundida prevista. |
| [`desenho-da-missao.ts`](desenho-da-missao.ts) | Desenho técnico da missão — O desenho com vista de cima e corte das chapas mostrado na preparação (esquema próprio do jogo). |
| [`efeitos-visuais.ts`](efeitos-visuais.ts) | Efeitos visuais (2D) — Regras de brilho, halo de calor, faíscas e escamas usadas também no 3D. Só aparência. |
| [`grafico-de-largura.ts`](grafico-de-largura.ts) | Gráfico de largura — O gráfico da aba Largura: largura do cordão, faixa do desenho e faixa colorida de fusão prevista. |
| [`graficos-da-inspecao.ts`](graficos-da-inspecao.ts) | Gráficos da inspeção — Desenha os gráficos de velocidade ao longo da junta. |
| [`tela-para-peca.ts`](tela-para-peca.ts) | Tela ⇄ peça — Converte um ponto da tela (pixels) para um ponto da peça (mm) e de volta, considerando zoom e giro. |
