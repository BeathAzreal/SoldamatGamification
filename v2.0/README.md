# Oficina de Soldagem — Alpha v2.0

Cópia da branch [`claude/v2.0`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v2.0), feita a partir da `alpha-v1.9` (ainda não existe `alpha-v2.0`).

## Jogar

- **Só jogar:** baixe [`Oficina-de-Soldagem-Alpha-v2.0.zip`](Oficina-de-Soldagem-Alpha-v2.0.zip), extraia e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge. Sem instalação nem internet. A mesma pasta está em [`jogo-portatil/`](jogo-portatil/).
- **X1 em rede:** no PC anfitrião, baixe [`Oficina-de-Soldagem-v2.0-Rede.zip`](Oficina-de-Soldagem-v2.0-Rede.zip) (Windows 64 bits, já com o Node.js), extraia e abra **ABRIR-OFICINA.bat**. Os dois PCs precisam ser da v2.0.

## O que mudou na v2.0

- **Máquina MIG/MAG em unidades reais:** tensão de **14 a 30 V** e alimentação do arame de **1 a 15 m/min**, em passos de 0,5. O painel mostra a **corrente em A** e o **modo de transferência**.
- **Os ajustes mudam a solda:**
  - **curto-circuito** (tensão baixa): pouco calor, bom para chapa fina;
  - **globular:** respinga e deixa o cordão irregular;
  - **spray** (só com argônio, corrente e tensão altas): liso, penetra muito e fura chapa fina;
  - **tensão baixa demais para o arame:** o metal deita sem fundir as bordas;
  - **tensão alta demais:** respinga, achata o cordão e morde a borda.
- No Arcade, a máquina pré-ajustada usa os passos do painel e fica fora do globular.
- Novo exercício técnico: **4. Curto-circuito, globular e spray**.
- Continua tudo da v1.9: TIG com mesa digitalizadora + mouse, Fácil/Difícil, eletrodo sem assistência.

Detalhes em [`docs/HIPOTESES.md`](docs/HIPOTESES.md) (H93) e [`docs/PONTUACAO.md`](docs/PONTUACAO.md) (`pontuacao-v11`). Números do jogo, não de catálogo de fabricante.
