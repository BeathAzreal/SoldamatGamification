# Código do jogo

Comece por [`inicio.ts`](inicio.ts), o primeiro arquivo que roda. Cada pasta tem um LEIA-ME.md e cada arquivo começa com um quadro "O que faz / Onde mexer".

| Pasta | O que tem |
|---|---|
| [`telas/`](telas/) | Telas: Cada arquivo é uma tela inteira do jogo. |
| [`partes-das-telas/`](partes-das-telas/) | Partes das telas: Pedaços reaproveitados em mais de uma tela (bancada MIG, abas, quadro de nota, inspeção...). |
| [`eletrodo/`](eletrodo/) | Eletrodo revestido: Tudo do modo eletrodo revestido (SMAW), criado na v1.5: a física do arco e da vareta, a escória, as peças do treino, a cena 3D, a tela e os controles. |
| [`simulacao-mig/`](simulacao-mig/) | Simulação MIG/MAG: A "física" didática do MIG/MAG: como os ajustes e o movimento formam o cordão, a fusão prevista e os defeitos visíveis. |
| [`pontuacao/`](pontuacao/) | Pontuação: Como a tentativa vira nota de 0 a 1000 e o relatório que a explica. |
| [`missoes/`](missoes/) | Missões: As missões do modo História (MIG/MAG) e os roteiros de aprendizagem de cada uma. |
| [`arcade/`](arcade/) | Arcade: Desafios sorteados, regras da partida e recordes do Arcade. |
| [`torneio/`](torneio/) | Torneio: Regras dos torneios locais (participantes, rodadas, avaliação do professor, classificação). |
| [`explicacoes/`](explicacoes/) | Explicações didáticas: Textos que explicam o resultado ("por que saiu assim"), comparação entre tentativas, devolutiva e exercícios técnicos. |
| [`dispositivos/`](dispositivos/) | Dispositivos: Leitura do mouse, da caneta (mesa digitalizadora) e do controle (gamepad) no jogo MIG, e os gestos de câmera e peça. |
| [`salvamento/`](salvamento/) | Salvamento: O que fica guardado no navegador do jogador: recordes, preferências, participantes e registros das tentativas. |
| [`desenho-3d/`](desenho-3d/) | Desenho 3D (MIG): Cenas 3D do jogo MIG: palco (sala, chapas, marcas), tocha, calor e faíscas, cordão ao vivo, defeitos e câmeras. |
| [`desenho-2d/`](desenho-2d/) | Desenho 2D: Desenhos planos: gráficos da inspeção, corte transversal, desenho técnico da missão e a cena 2D usada sem 3D. |
| [`interface/`](interface/) | Base da interface: O que todas as telas usam: troca de tela (aplicativo.ts), criação de elementos (h), janelas de diálogo e som. |
| [`estilos/`](estilos/) | Estilos (cores e layout): Arquivos .css com cores, fontes e posições. |
| [`imagens-e-fontes/`](imagens-e-fontes/) | Imagens e fontes: Arquivos originais da ilustração do menu e da fonte Barlow Condensed (licença OFL em OFL-Barlow.txt). |
