# Oficina de Soldagem — versões e downloads

## Alpha v1.5 disponível para teste — eletrodo revestido

**[BAIXAR ALPHA v1.5 — jogo pronto em ZIP](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip)**

Extraia o ZIP inteiro e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html**
no Chrome ou Edge. Não precisa instalar nada nem ter internet para jogar.
Entre na sua conta do GitHub para baixar os arquivos deste repositório privado.

O jogo mostra **ALPHA v1.5** no topo. O MIG/MAG continua completo (missões,
arcade, treino e torneio). A novidade é o **eletrodo revestido** (SMAW), ainda
sem pontuação: entre em **Treino → Processo: Eletrodo revestido** e escolha uma
das peças (cordões sobre chapa 6,3 mm, filete em T, topo em V 8 mm, canto de
portão e sobreposta de reforço).

- **Abrir o arco:** não há botão. Leve a ponta com o mouse até o INÍCIO e desça
  com **S** até tocar a peça: o arco abre sozinho. Empurrar contra a poça gruda
  o eletrodo (use **Desgrudar**).
- **Manter o arco:** a vareta queima e encurta. Dê **toques curtos em S** para
  manter o arco perto do diâmetro da alma; o medidor sobre a vista mostra se ele
  está curto, adequado ou longo. **W** sobe. A **Ajuda na altura** começa em
  Parcial; use Total para treinar só o avanço ou Desligada para o eletrodo real.
- **Objetivos da peça:** trecho do INÍCIO ao FIM coberto, arco no comprimento
  adequado, sem grudar e escória removida.
- **Escória:** espere esfriar, quebre com o **Martelinho** (clique) e retire os
  resíduos com a **Escova de aço** (arraste).
- **Controles:** botão do meio gira a câmera, botão direito orienta o eletrodo,
  I/K inclinam, J/L mudam a direção e Q/E giram o punho. Tudo pode ser trocado
  em **Controles** (também caneta e controle).

| Versão | Estado | Download |
|---|---|---|
| Alpha v1.6 | Código organizado para editar + eletrodo com nota (inspeção visual) e preenchimento realista | [ZIP da v1.6](v1.6/Oficina-de-Soldagem-Alpha-v1.6.zip) · [guia do código](v1.6/README.md) |
| **Alpha v1.5** | **Em teste — MIG/MAG + treino de eletrodo revestido** | [ZIP da v1.5](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip) |
| Alpha v1.4 | Anterior — MIG/MAG com solda realista | [ZIP da v1.4](v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip) |
| Alpha v1.3 | Aprovada | [ZIP da v1.3](v1.3/Oficina%20de%20Soldagem%203D%20Alpha%20v1.3.zip) |
| Alpha v1.2 | Anterior | [Pasta portátil](v1.2/jogo-portatil/) |
| Alpha v1.1 | Anterior | [Pasta do jogo](v1.1/) |

Se o GitHub abrir a página do ZIP em vez de baixar, clique em **Download raw file**.
**Code → Download ZIP** nesta página baixa o histórico inteiro; use os links
acima para receber somente o jogo pronto.

## Quer mexer no código? Use a v1.6

A pasta [`v1.6/`](v1.6/) tem o jogo da v1.5 com o código reorganizado para quem não programa em JavaScript: pastas e
arquivos com nomes em português (por exemplo, tudo do eletrodo em
`v1.6/codigo/eletrodo/`), um quadro "O que faz / Onde mexer" no começo de
cada arquivo, um `LEIA-ME.md` em cada pasta e um guia com receitas de
mudanças comuns e glossário: [**v1.6/README.md**](v1.6/README.md).

No treino de eletrodo da v1.6, o botão **Inspecionar a peça** dá uma nota de 0 a
100 com aprovação, defeitos (mordedura, poros, cratera, falta de fusão, inclusão
de escória...) e como corrigir; o calor do arco aparece ao vivo, e o V de 8 mm se
enche em vários passes.

## Onde está cada versão?

Cada versão tem sua pasta nesta página (código e ZIP), copiada da branch de
entrega correspondente, que junta o trabalho do GPT e do Claude por pull request:

- [`v1.6/`](v1.6/) ← branch [`reorganizacao`](https://github.com/BeathAzreal/SoldamatGamification/tree/reorganizacao) (código da v1.5 reorganizado)
- [`v1.5/`](v1.5/) ← [`alpha-v1.5`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.5) (`gpt/v1.5` + `claude/v1.5`)
- [`v1.4/`](v1.4/) ← [`alpha-v1.4`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.4) (`gpt/v1.4` + `claude/v1.4`)

Detalhes e limites do modelo do eletrodo (hipóteses H59–H73):
[`v1.5/docs/PROTOTIPO-V15.md`](v1.5/docs/PROTOTIPO-V15.md).

## O que mudou na v1.5?

- Treino de eletrodo revestido com cinco peças próprias do processo e objetivos.
- Arco abre ao tocar a peça, altura por toques curtos com ajuda parcial, arco
  que reacende a quente; consumo da vareta, aderência, escória que esfria e
  limpeza com martelinho e escova.
- Medidor do comprimento do arco e respingos com arco longo.
- Alicate porta-eletrodo em 3D, arco luminoso e ponta incandescente.
- Controles configuráveis para teclado, mouse, caneta e gamepad.

TypeScript, **404 testes** e build aprovados. Testado em navegador automatizado;
teste em aparelhos reais (placa de vídeo, caneta, controle) ainda pendente.

## Dados e versões

Recordes e preferências ficam no navegador de cada computador.
Mudar a pasta do HTML pode fazer os dados anteriores deixarem de aparecer.
Exporte os recordes em JSON antes de trocar de versão.

Esta branch é o catálogo e histórico das versões. O trabalho de cada agente
fica na sua branch; as integrações são feitas por pull request aprovado pelo dono.
