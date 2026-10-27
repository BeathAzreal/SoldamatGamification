# Eletrodo revestido

Tudo do modo eletrodo revestido (SMAW): a física do arco e da vareta, o metal depositado, a escória, as peças do treino, a cena 3D, a tela, a nota e os defeitos. Os nomes terminados em 15 (Acionamento15, VARETA15...) vêm da v1.5, quando o eletrodo foi criado. Hipóteses H59–H73 e H82–H85 em ../../documentacao/PROTOTIPO-V15.md; H74–H81 (v1.6, GPT) em ../../documentacao/HIPOTESES.md e a nota em ../../documentacao/AVALIACAO-SMAW.md.

Caminho de uma tentativa: `tela-do-treino.ts` lê o mouse e o teclado → `arco-e-vareta.ts` decide o arco e quanto metal sai → `deposito-do-cordao.ts` guarda o metal (e o mesmo metal alimenta o cordão 3D de `../simulacao-mig/cordao.ts`, que é o que aparece na tela) → ao encerrar, `placar-do-eletrodo.ts` dá a nota e `defeitos-do-eletrodo.ts` lista os defeitos → `janela-do-resultado.ts` mostra tudo.

| Arquivo | O que é |
|---|---|
| [`analise-do-cordao.ts`](analise-do-cordao.ts) | Eletrodo: análise do cordão — Mede o metal depositado e calcula a fusão pelo calor de cada passe, a mordedura, a sobreposição, os poros, as crateras, a inclusão de escória e os respingos. Limites em LIMITES. |
| [`arco-e-vareta.ts`](arco-e-vareta.ts) | Eletrodo: arco e vareta (a "física" do eletrodo) — Decide se o arco está aceso, curto, adequado ou longo; quanto a vareta queima; quando o eletrodo gruda; e quanto metal e escória são depositados. |
| [`bancada-3d.ts`](bancada-3d.ts) | Eletrodo: cena 3D — Desenha a peça, o alicate porta-eletrodo, a vareta, o arco, a poça, os respingos, o martelinho e a escova, e converte a posição do mouse em ponto da peça. |
| [`controles-salvos.ts`](controles-salvos.ts) | Eletrodo: controles salvos — As teclas e botões padrão do eletrodo (W sobe, S desce, etc.), a validação e o salvamento no navegador. |
| [`defeitos-do-eletrodo.ts`](defeitos-do-eletrodo.ts) | Eletrodo: defeitos encontrados — A lista do resultado: cada defeito com o lugar (mm), a causa provável e como corrigir. Não mexe na nota. Textos em TEXTO. |
| [`deposito-do-cordao.ts`](deposito-do-cordao.ts) | Eletrodo: metal depositado — Guarda quanto metal caiu em cada ponto da peça e a altura da superfície; diz o que cada junta pede e quanto de um trecho está unido. |
| [`escoria-3d.ts`](escoria-3d.ts) | Eletrodo: escória em 3D — Desenha a crosta de escória sobre o cordão, com cor de quente (laranja) a fria (marrom escuro) e os resíduos. |
| [`escoria.ts`](escoria.ts) | Eletrodo: escória — Guarda onde há escória sobre a peça, se está quente ou fria e o que o martelinho e a escova removem. |
| [`girar-com-o-mouse.ts`](girar-com-o-mouse.ts) | Eletrodo: girar com o mouse — Conta matemática que transforma o arraste do mouse (botão direito) em inclinação e direção do eletrodo, acompanhando a câmera. |
| [`janela-de-controles.ts`](janela-de-controles.ts) | Eletrodo: janela de controles — A janela "Controles" do treino de eletrodo, onde o jogador troca teclas, botões e sensibilidade. |
| [`janela-do-resultado.ts`](janela-do-resultado.ts) | Eletrodo: resultado da tentativa — O painel ao encerrar: conceito, nota de 0 a 1000, barras dos critérios, resumo dos defeitos e os botões de nova tentativa e outra peça. |
| [`metal-do-cordao-3d.ts`](metal-do-cordao-3d.ts) | Eletrodo: metal do cordão em malha — Sólido de malha do metal depositado; a altura serve para a crosta de escória. Na tela aparece o cordão 3D do MIG (H86). |
| [`pecas-de-treino.ts`](pecas-de-treino.ts) | Eletrodo: peças do treino — A lista das peças: nome, aplicação, junta, espessura, eletrodo e corrente sugeridos, trecho e objetivo; e o calor de referência de cada peça. |
| [`pecas-industriais-3d.ts`](pecas-industriais-3d.ts) | Eletrodo: acabamento das peças industriais — Partes da peça fora do trecho soldado (orelhas, travessas, quadro da grade). Só visual. |
| [`placar-do-eletrodo.ts`](placar-do-eletrodo.ts) | Eletrodo: nota da tentativa (0 a 1000) — União, preenchimento e perfil, metal na região e continuidade, com desconto pela escória. |
| [`registro-do-passe.ts`](registro-do-passe.ts) | Eletrodo: registro do passe — Anota, ao longo da junta, o calor de cada passe, o tempo e o comprimento do arco, onde o arco abriu e apagou e onde o eletrodo grudou. |
| [`tela-do-treino.ts`](tela-do-treino.ts) | Eletrodo: tela do treino — A tela inteira do treino de eletrodo: painel sobre a vista, painel da máquina (FONTE, TOCHA, LEITURAS, MISSÃO) e o laço que roda a cada quadro. |
