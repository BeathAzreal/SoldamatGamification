# Oficina de Soldagem — Alpha v1.8

Cópia da branch [`claude/v1.8`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.8), feita a partir da `alpha-v1.7` (ainda não existe `alpha-v1.8`).

## Jogar

- **Só jogar:** baixe [`Oficina-de-Soldagem-Alpha-v1.8.zip`](Oficina-de-Soldagem-Alpha-v1.8.zip), extraia e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge. Sem instalação nem internet. A mesma pasta está em [`jogo-portatil/`](jogo-portatil/).
- **X1 em rede:** no PC anfitrião, baixe [`Oficina-de-Soldagem-v1.8-Rede.zip`](Oficina-de-Soldagem-v1.8-Rede.zip) (Windows 64 bits, já com o Node.js), extraia e abra **ABRIR-OFICINA.bat**. No segundo PC, abra o endereço com IP mostrado na janela do servidor. Os dois PCs precisam ser da v1.8.

## O que mudou na v1.8

- **Fácil e Difícil:** antes de soldar, no MIG/MAG e no eletrodo, o jogador escolhe o modo de pontuação. No Fácil as tolerâncias são largas e os defeitos custam pouco; no Difícil as tolerâncias são apertadas (no eletrodo, nível B da ISO 5817) e cada defeito grave custa 100 pontos. No MIG, os antigos níveis Aprendiz e Profissional viraram Fácil e Difícil, com mais diferença na nota (`pontuacao-v8`). Tabelas em [`docs/PONTUACAO.md`](docs/PONTUACAO.md).
- **Solda mais lenta no MIG/MAG:** com o arco aberto, no mouse e na caneta, a tocha não passa de 12 mm/s. Se a mão correr, a tocha vai atrás no próprio ritmo. Detalhes em [`docs/HIPOTESES.md`](docs/HIPOTESES.md) (H87 e H88).
- Continua tudo da v1.7: X1 em rede, painel MIG, cordão 3D e lista de defeitos no eletrodo.
