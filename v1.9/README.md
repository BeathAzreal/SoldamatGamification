# Oficina de Soldagem — Alpha v1.9

Cópia da branch [`claude/v1.9`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.9), feita a partir da `claude/v1.8` (ainda não existe `alpha-v1.9`).

## Jogar

- **Só jogar:** baixe [`Oficina-de-Soldagem-Alpha-v1.9.zip`](Oficina-de-Soldagem-Alpha-v1.9.zip), extraia e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge. Sem instalação nem internet. A mesma pasta está em [`jogo-portatil/`](jogo-portatil/).
- **X1 em rede:** no PC anfitrião, baixe [`Oficina-de-Soldagem-v1.9-Rede.zip`](Oficina-de-Soldagem-v1.9-Rede.zip) (Windows 64 bits, já com o Node.js), extraia e abra **ABRIR-OFICINA.bat**. No segundo PC, abra o endereço com IP mostrado na janela do servidor. Os dois PCs precisam ser da v1.9.

## O que mudou na v1.9

- **Fácil = só nota:** sem aprovação nem reprovação; vale a soma das 5 categorias, mesmo com zero em alguma.
- **Difícil = 20 % em cada categoria:** a solda só é aprovada com pelo menos 20 % dos pontos em integridade, desenho, regularidade, deformação e eficiência. Um traço em cada barra mostra o mínimo.
- **Desafios do Arcade e Modo História só no Difícil, com 40 %** em cada categoria. Na História, a missão seguinte abre quando a anterior é aprovada assim.
- **Eletrodo sem assistência:** saiu a "Ajuda na altura". A vareta queima e o arco cresce; o jogador dá toques em **S** para descer enquanto avança com o mouse. A vareta queima mais devagar (1,5 mm/s) para dar tempo de acompanhar.
- **Cordão em relevo no eletrodo:** mais metal por mm de vareta e uma peça nova, **Cordões sobre chapa** (primeira da lista), sem abertura, para o cordão ficar todo por cima.
- **Eletrodo Fácil/Difícil:** Fácil só nota; Difícil pede 20 % em cada item e na nota final, com a escória removida.

Detalhes em [`docs/HIPOTESES.md`](docs/HIPOTESES.md) (H90 e H91) e [`docs/PONTUACAO.md`](docs/PONTUACAO.md) (`pontuacao-v10`). O equilíbrio do eletrodo foi calibrado com um jogador simulado, não com pessoas.
