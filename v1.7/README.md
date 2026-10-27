# Oficina de Soldagem — Alpha v1.7

Cópia da branch [`alpha-v1.7`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.7), que junta o trabalho do GPT (`gpt/v1.7`) e do Claude (`claude/v1.7`).

## Jogar

Baixe [`Oficina-de-Soldagem-Alpha-v1.7.zip`](Oficina-de-Soldagem-Alpha-v1.7.zip), extraia e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge. Não precisa instalar nada nem ter internet. A mesma pasta está em [`jogo-portatil/`](jogo-portatil/).

## O que há na v1.7

- **X1 em rede (GPT):** duas pessoas em PCs diferentes disputam a mesma missão MIG/MAG numa sala por código. No PC anfitrião, baixe [`Oficina-de-Soldagem-v1.7-Rede.zip`](Oficina-de-Soldagem-v1.7-Rede.zip) (Windows 64 bits, já com o Node.js), extraia e abra **ABRIR-OFICINA.bat**; o HTML portátil sozinho não hospeda salas. O pacote foi gerado com `npm run pacote:rede` a partir desta versão, com o `node.exe` oficial v24.19.0 conferido pelo SHA-256. Detalhes em [`docs/REDE-V17.md`](docs/REDE-V17.md).
- **Painel MIG/MAG (GPT):** leituras integradas à fonte e painel maior, sem rolagem.
- **Eletrodo (Claude):** cordão 3D com escamas e brilho, e o botão **Defeitos** no resultado, com o lugar, a causa e como corrigir cada defeito, desenhados também no cordão. A nota de 0 a 1000 do GPT continua igual. Detalhes (H82–H86) em [`docs/PROTOTIPO-V15.md`](docs/PROTOTIPO-V15.md).

O código desta pasta está no layout original (`src/`). A versão com pastas e arquivos de nomes intuitivos é a [`v1.6/`](../v1.6/).
