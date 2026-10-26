# Eletrodo revestido

Tudo do modo eletrodo revestido (SMAW), criado na v1.5: a física do arco e da vareta, a escória, as peças do treino, a cena 3D, a tela e os controles. Os nomes terminados em 15 (Acionamento15, VARETA15...) vêm dessa versão. Detalhes e hipóteses H59–H73 em ../../documentacao/PROTOTIPO-V15.md.

| Arquivo | O que é |
|---|---|
| [`analise-do-cordao.ts`](analise-do-cordao.ts) | Eletrodo: análise do cordão — Calcula a fusão pelo calor de cada passe, a mordedura, a sobreposição, os poros, as crateras, a inclusão de escória, os respingos e as escamas, no formato que o 3D desenha. Limites em LIMITES. |
| [`arco-e-vareta.ts`](arco-e-vareta.ts) | Eletrodo: arco e vareta (a "física" do eletrodo) — Decide se o arco está aceso, curto, adequado ou longo; quanto a vareta queima; quando o eletrodo gruda; e quanto metal e escória são depositados. Hipóteses H59–H73 (documentacao/PROTOTIPO-V15.md). |
| [`bancada-3d.ts`](bancada-3d.ts) | Eletrodo: cena 3D — Desenha a peça, o alicate porta-eletrodo, a vareta, o arco, a poça, os respingos, o martelinho e a escova, e converte a posição do mouse em ponto da peça. |
| [`controles-salvos.ts`](controles-salvos.ts) | Eletrodo: controles salvos — As teclas e botões padrão do eletrodo (W sobe, S desce, etc.), a validação e o salvamento no navegador. |
| [`escoria-3d.ts`](escoria-3d.ts) | Eletrodo: escória em 3D — Desenha a crosta de escória sobre o cordão, com cor de quente (laranja) a fria (marrom escuro) e os resíduos. |
| [`escoria.ts`](escoria.ts) | Eletrodo: escória — Guarda onde há escória sobre a peça, se está quente ou fria e o que o martelinho e a escova removem. |
| [`girar-com-o-mouse.ts`](girar-com-o-mouse.ts) | Eletrodo: girar com o mouse — Conta matemática que transforma o arraste do mouse (botão direito) em inclinação e direção do eletrodo, acompanhando a câmera. |
| [`janela-de-controles.ts`](janela-de-controles.ts) | Eletrodo: janela de controles — A janela "Controles" do treino de eletrodo, onde o jogador troca teclas, botões e sensibilidade. |
| [`nota-do-eletrodo.ts`](nota-do-eletrodo.ts) | Eletrodo: inspeção visual e nota — Dá a nota de 0 a 100, diz se a peça foi aprovada e lista cada defeito com o lugar, a causa e como corrigir. Pesos em PESOS, reprovação em REPROVA, textos em TEXTO. |
| [`pecas-de-treino.ts`](pecas-de-treino.ts) | Eletrodo: peças do treino — A lista das peças do treino de eletrodo: nome, aplicação, junta, espessura, eletrodo e corrente sugeridos, trecho e objetivo. |
| [`registro-do-passe.ts`](registro-do-passe.ts) | Eletrodo: registro do passe — Anota, ao longo da junta, o calor de cada passe, o tempo e o comprimento do arco, onde o arco abriu e apagou e onde o eletrodo grudou. |
| [`tela-do-treino.ts`](tela-do-treino.ts) | Eletrodo: tela do treino — A tela inteira do treino de eletrodo: painel sobre a vista (estado, medidor do arco, vareta, avanço), painel lateral (objetivos, ferramentas, corrente, ajuda na altura) e o laço que roda a cada quadro. |
