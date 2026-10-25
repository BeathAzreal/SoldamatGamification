# Oficina de Soldagem — versões e downloads

## Alpha v1.5 disponível para teste — eletrodo revestido

**[BAIXAR ALPHA v1.5 — jogo pronto em ZIP](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip)**

Extraia o ZIP inteiro e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html**
no Chrome ou Edge. Não precisa instalar nada nem ter internet para jogar.
Entre na sua conta do GitHub para baixar os arquivos deste repositório privado.

O jogo abre direto na **Bancada de soldagem** e mostra **ALPHA v1.5** no topo.
É um **protótipo de eletrodo revestido** (SMAW), ainda sem pontuação:

- **Abrir o arco:** segure o botão esquerdo ou Espaço, toque a ponta na chapa e
  afaste um pouco, ou risque a ponta como um fósforo. Contato demorado gruda o
  eletrodo (use **Desgrudar**).
- **Manter o arco:** a vareta queima e encurta; desça com **S** para manter o
  arco perto do diâmetro da alma. O medidor sobre a vista mostra se o arco está
  curto, adequado ou longo. Arco longo deixa o cordão largo e irregular e solta
  muitos respingos. Para treinar só o avanço, ligue **Compensar consumo (assistido)**.
- **Escória:** o cordão sai coberto de escória, que esfria com o tempo. Fria,
  quebre com o **Martelinho** (clique) e retire os resíduos com a **Escova de aço**
  (arraste).
- **Corrente e eletrodo:** 40 a 180 A, com 2,5 ou 3,2 mm. Mais corrente queima a
  vareta mais depressa; corrente baixa gruda com facilidade.
- **Controles:** W sobe, S desce, botão do meio gira a câmera, botão direito
  orienta o eletrodo, I/K inclinam, J/L mudam a direção e Q/E giram o punho.
  Tudo pode ser trocado em **Configurar controles** (também caneta e controle).

O jogo MIG/MAG completo da v1.4 continua disponível pelo menu lateral.

| Versão | Estado | Download |
|---|---|---|
| **Alpha v1.5** | **Em teste — protótipo de eletrodo revestido** | [ZIP da v1.5](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip) |
| Alpha v1.4 | Anterior — MIG/MAG com solda realista | [ZIP da v1.4](v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip) |
| Alpha v1.3 | Aprovada | [ZIP da v1.3](v1.3/Oficina%20de%20Soldagem%203D%20Alpha%20v1.3.zip) |
| Alpha v1.2 | Anterior | [Pasta portátil](v1.2/jogo-portatil/) |
| Alpha v1.1 | Anterior | [Pasta do jogo](v1.1/) |

Se o GitHub abrir a página do ZIP em vez de baixar, clique em **Download raw file**.
**Code → Download ZIP** nesta página baixa o histórico inteiro; use os links
acima para receber somente o jogo pronto.

## Onde está cada versão?

Cada versão tem sua pasta nesta página (código e ZIP), copiada da branch de
entrega correspondente, que junta o trabalho do GPT e do Claude por pull request:

- [`v1.5/`](v1.5/) ← [`alpha-v1.5`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.5) (`gpt/v1.5` + `claude/v1.5`)
- [`v1.4/`](v1.4/) ← [`alpha-v1.4`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.4) (`gpt/v1.4` + `claude/v1.4`)

Detalhes e limites do modelo do eletrodo (hipóteses H59–H70):
[`v1.5/docs/PROTOTIPO-V15.md`](v1.5/docs/PROTOTIPO-V15.md).

## O que mudou na v1.5?

- Bancada nova de eletrodo revestido: abertura por toque, consumo da vareta,
  aderência, troca de vareta, escória que esfria e limpeza com martelinho e escova.
- Medidor do comprimento do arco, respingos com arco longo e modo assistido.
- Alicate porta-eletrodo em 3D, arco luminoso e ponta incandescente.
- Controles configuráveis para teclado, mouse, caneta e gamepad.

TypeScript, **394 testes** e build aprovados. Testado em navegador automatizado;
teste em aparelhos reais (placa de vídeo, caneta, controle) ainda pendente.

## Dados e versões

Recordes e preferências ficam no navegador de cada computador.
Mudar a pasta do HTML pode fazer os dados anteriores deixarem de aparecer.
Exporte os recordes em JSON antes de trocar de versão.

Esta branch é o catálogo e histórico das versões. O trabalho de cada agente
fica na sua branch; as integrações são feitas por pull request aprovado pelo dono.
