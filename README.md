# Oficina de Soldagem — versões e downloads

## Alpha v2.0 disponível para teste

**[BAIXAR ALPHA v2.0 — jogo pronto em ZIP](v2.0/Oficina-de-Soldagem-Alpha-v2.0.zip)**

Extraia o ZIP inteiro e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html**
no Chrome ou Edge. Não precisa instalar nada nem ter internet para jogar.
Entre na sua conta do GitHub para baixar os arquivos deste repositório privado.

O jogo mostra **ALPHA v2.0** no topo. Novidades:

- **Máquina MIG/MAG em volts e m/min:** tensão de 0 a 30 V, alimentação de 1 a
  15 m/min, corrente em A e modo de transferência (curto-circuito, globular, spray).
- **Os ajustes mudam a solda:** o globular respinga, o spray penetra e fura chapa
  fina, o arco curto deita o metal sem fundir e a tensão alta morde a borda.
  Abaixo de 14 V o arame bate, abaixo de 10 V o arco não abre, e a tocha parada
  consome a chapa em estágios até abrir um buraco de verdade (dá para ver através).
- **Passar da chapa em níveis:** raiz aparente, metal pendurado no avesso, face
  afundada e, no limite, furo, no MIG/MAG, no eletrodo e no TIG. No resultado:
  **Ver o avesso**.
- **Tubo com tubo** nos três processos (MIG/MAG: missão Tubulação da horta;
  eletrodo e TIG: peça Tubo com tubo): solde em volta e gire o tubo (⟲ ⟳).
- **TIG:** a vareta funde na borda da poça mesmo avançando antes de tocar, e
  toques rápidos não se perdem em PC lento.
- **Chapas novas com características próprias** (galvanizado, médio carbono,
  inox ferrítico e cobre): espessura, calor, aquecimento e deformação de cada
  uma. No treino dá para trocar a chapa no MIG/MAG, no eletrodo e no TIG.
- **Bancada do MIG/MAG mais limpa** (fonte e leituras juntas; chapa,
  espessura e junta numa linha; área de teste com mais que o dobro de
  altura no notebook) e **mesa digitalizadora** que solda no MIG/MAG.
- **Passes sobrepostos:** cordão com seção de parábola, passes que somam (morro,
  plano ou vale pelo passo), falta de fusão entre passes no eletrodo e o botão
  **Corte** para ver as camadas.
- **MIG/MAG:** mais arame achata o cordão; rápido demais com corrente alta faz
  corcovas (humping).
- Continua tudo da v1.9: TIG com mesa digitalizadora + mouse, Fácil/Difícil e
  eletrodo sem assistência.

**[BAIXAR PACOTE DE REDE v2.0 — para o X1 (Windows 64 bits, 41 MB)](v2.0/Oficina-de-Soldagem-v2.0-Rede.zip)**

No PC anfitrião, extraia a pasta inteira e abra **ABRIR-OFICINA.bat** (não precisa
instalar nada; o Node.js vai junto). Deixe a janela do servidor aberta. No segundo
PC, abra no navegador o endereço com IP mostrado nessa janela (ex.:
`http://192.168.0.10:5197/?rede=1`). Nos dois: Arcade → X1 em rede, um cria a sala
e o outro entra com o código. Os dois PCs precisam estar na v2.0.

No **eletrodo revestido** (Treino → Eletrodo → escolha a peça e o modo), o arco
abre ao tocar a peça com **S** e a vareta queima: continue descendo com toques em **S**; **Encerrar tentativa** ou **Enter** mostra a nota de
0 a 1000 e o botão **Defeitos**, com o lugar, a causa e como corrigir cada defeito.

| Versão | Estado | Download |
|---|---|---|
| **Alpha v2.0** | **Mais nova — máquina MIG em volts e m/min com efeito na solda (curto-circuito, globular, spray)** | [ZIP da v2.0](v2.0/Oficina-de-Soldagem-Alpha-v2.0.zip) · [Pacote de rede (X1)](v2.0/Oficina-de-Soldagem-v2.0-Rede.zip) |
| Alpha v1.9 | Anterior — TIG com mesa digitalizadora + mouse, Fácil só nota, Difícil com mínimo por categoria, desafios e História no Difícil, eletrodo sem assistência | [ZIP da v1.9](v1.9/Oficina-de-Soldagem-Alpha-v1.9.zip) · [Pacote de rede (X1)](v1.9/Oficina-de-Soldagem-v1.9-Rede.zip) |
| Alpha v1.8 | Anterior — modos Fácil e Difícil, solda mais lenta no MIG/MAG e nota sem trava | [ZIP da v1.8](v1.8/Oficina-de-Soldagem-Alpha-v1.8.zip) · [Pacote de rede (X1)](v1.8/Oficina-de-Soldagem-v1.8-Rede.zip) |
| Alpha v1.7 | Anterior — x1 em rede (MIG/MAG), painel MIG maior e eletrodo com cordão 3D e lista de defeitos | [ZIP da v1.7](v1.7/Oficina-de-Soldagem-Alpha-v1.7.zip) · [Pacote de rede (X1)](v1.7/Oficina-de-Soldagem-v1.7-Rede.zip) |
| Alpha v1.6 | Interface de máquina e eletrodo com nota 0–1000 (alpha-v1.6) + lista de defeitos com causa e correção, com o código organizado para editar | [ZIP da v1.6](v1.6/Oficina-de-Soldagem-Alpha-v1.6.zip) · [guia do código](v1.6/README.md) |
| Alpha v1.5 | Anterior — MIG/MAG + treino de eletrodo revestido | [ZIP da v1.5](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip) |
| Alpha v1.4 | Anterior — MIG/MAG com solda realista | [ZIP da v1.4](v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip) |
| Alpha v1.3 | Aprovada | [ZIP da v1.3](v1.3/Oficina%20de%20Soldagem%203D%20Alpha%20v1.3.zip) |
| Alpha v1.2 | Anterior | [Pasta portátil](v1.2/jogo-portatil/) |
| Alpha v1.1 | Anterior | [Pasta do jogo](v1.1/) |

Se o GitHub abrir a página do ZIP em vez de baixar, clique em **Download raw file**.
**Code → Download ZIP** nesta página baixa o histórico inteiro; use os links
acima para receber somente o jogo pronto.

## Quer mexer no código? Use a v1.6

A pasta [`v1.6/`](v1.6/) tem o jogo da alpha-v1.6 com o código reorganizado para quem não programa em JavaScript: pastas e
arquivos com nomes em português (por exemplo, tudo do eletrodo em
`v1.6/codigo/eletrodo/`), um quadro "O que faz / Onde mexer" no começo de
cada arquivo, um `LEIA-ME.md` em cada pasta e um guia com receitas de
mudanças comuns e glossário: [**v1.6/README.md**](v1.6/README.md).

A v1.6 tem a interface nova da alpha-v1.6 (painel de máquina, menu da oficina,
pausa, Arcade com História/Desafios/Versus) e o eletrodo com depósito real e nota
de 0 a 1000. No resultado do eletrodo, o botão **Defeitos** lista o que se vê no
cordão (falta de fusão, mordedura, poros, cratera, inclusão de escória...) com o
lugar, a causa e como corrigir; os mesmos defeitos ficam desenhados no metal.

## Onde está cada versão?

Cada versão tem sua pasta nesta página (código e ZIP), copiada da branch de
entrega correspondente, que junta o trabalho do GPT e do Claude por pull request:

- [`v2.0/`](v2.0/) ← [`claude/v2.0`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v2.0) (feita a partir da `alpha-v1.9`; já incorporada à `alpha-v2.0` pelos PRs #32, #36, #37 e #39; bancada compacta no #40)
- [`v1.9/`](v1.9/) ← [`alpha-v1.9`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.9) (`claude/v1.9`, com a v1.8 junto)
- [`v1.8/`](v1.8/) ← [`claude/v1.8`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.8) (feita a partir da `alpha-v1.7`; ainda não há `alpha-v1.8`)
- [`v1.7/`](v1.7/) ← [`alpha-v1.7`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.7) (`gpt/v1.7` + `claude/v1.7`)
- [`v1.6/`](v1.6/) ← [`alpha-v1.6`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.6) (`gpt/v1.6`) com o código reorganizado e a lista de defeitos do eletrodo (`claude/v1.6`)
- [`v1.5/`](v1.5/) ← [`alpha-v1.5`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.5) (`gpt/v1.5` + `claude/v1.5`)
- [`v1.4/`](v1.4/) ← [`alpha-v1.4`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.4) (`gpt/v1.4` + `claude/v1.4`)

Detalhes e limites do modelo do eletrodo (hipóteses H59–H73):
[`v1.5/docs/PROTOTIPO-V15.md`](v1.5/docs/PROTOTIPO-V15.md).

## O que mudou na v2.0?

- **Máquina MIG/MAG em unidades reais:** tensão de 0 a 30 V, alimentação de 1 a 15 m/min, corrente em A e modo de transferência. Abaixo de 14 V o arame bate; abaixo de 10 V o arco não abre; tocha parada consome a chapa em estágios até abrir um buraco de verdade, visto de cima e por baixo.
- **Efeito na solda:** globular respinga; spray (só com argônio) penetra e fura chapa fina; arco curto deita o metal sem fundir; tensão alta respinga, achata e morde a borda (`pontuacao-v11`).
- **Passar da chapa em níveis** no MIG/MAG, no eletrodo e no TIG (raiz aparente, metal pendurado, face afundada, furo).
- **Tubo com tubo** (MIG/MAG, eletrodo e TIG), com a posição mudando em volta do tubo no MIG/MAG, e a vareta do TIG fundindo no ritmo do jogador.
- **Chapas com características próprias** (galvanizado, médio carbono, inox ferrítico e cobre, além de aço carbono, inox e alumínio), trocáveis no treino dos três processos (H104).
- **Passes sobrepostos** (a partir de Banaee et al. 2023): seção de parábola, morro/plano/vale pelo passo, falta de fusão entre passes no eletrodo e o **Corte** da peça; no MIG/MAG, forma pela alimentação e humping.

## O que mudou na v1.9?

- **Fácil só nota, Difícil com mínimo:** no Fácil não há aprovação; no Difícil, pelo menos 20 % em cada uma das 5 categorias (`pontuacao-v10`).
- **Desafios do Arcade e Modo História só no Difícil**, com pelo menos 40 % em cada categoria.
- **Eletrodo sem assistência na altura**, com a vareta queimando mais devagar, cordão em relevo e a peça **Cordões sobre chapa**; no Difícil, 20 % em cada item e na nota final.
- **TIG** no treino, com mesa digitalizadora + mouse (duas mãos) ou só mouse; guia em [`v1.9/docs/TIG.md`](v1.9/docs/TIG.md).

## O que mudou na v1.8?

- **Modos Fácil e Difícil** na pontuação, escolhidos antes de soldar, no MIG/MAG e
  no eletrodo (os antigos Aprendiz e Profissional do MIG viraram Fácil e Difícil).
- **Solda mais lenta no MIG/MAG pela física** (metade do metal por segundo, o dobro do calor por mm); o mouse e a caneta respondem como antes.
- **Nota sem trava:** a solda não aprovada também conta todos os pontos.

## O que mudou na v1.7?

- **X1 em rede:** duas pessoas em PCs diferentes disputam a mesma missão MIG/MAG
  numa sala por código (Arcade → X1 em rede). O PC anfitrião usa o pacote de rede;
  o HTML portátil sozinho não hospeda salas. Detalhes em
  [`v1.7/docs/REDE-V17.md`](v1.7/docs/REDE-V17.md).
- **Painel MIG/MAG:** leituras integradas à fonte e painel maior, sem rolagem.
- **Eletrodo:** o cordão aparece em 3D, com escamas e brilho, e o resultado tem o
  botão **Defeitos**, com o lugar, a causa e como corrigir cada defeito.

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
