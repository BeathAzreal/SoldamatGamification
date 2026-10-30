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
- **Brasagem** (Treino → BRASAGEM): maçarico, fluxo e vareta; a liga corre
  por capilaridade para dentro da folga sem fundir a peça. Ligas, fluxos e
  temperaturas reais, quatro peças e inspeção da folga por dentro.
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

## Alpha v2.1 — versão de teste (não estável)

> ⚠️ **A v2.1 não é estável e serve apenas para testar funções novas.** Para jogar, use a Alpha v2.0 acima.

**[Baixar Alpha v2.1 (teste) — ZIP](v2.1/Oficina-de-Soldagem-Alpha-v2.1.zip)**

Novo e experimental: **MANUFATURA ADITIVA**, uma programação robotizada (menu principal). Você escreve o programa do robô num subconjunto do **INFORM**, a linguagem dos controladores Yaskawa Motoman, com o DX200 como referência. Depois ensina as posições, valida, roda sem deposição e fabrica uma **parede de várias camadas** por deposição a arco (WAAM). A inspeção traz a nota e o que corrigir. No **modo livre**, sem missão e sem nota, dá para testar à vontade e ver só as medidas da peça.

O simulador não é réplica do controlador, da fonte nem do robô. Comandos fora do subconjunto dão erro explicado. Detalhes, fontes e limites: [`v2.1/docs/MANUFATURA-ADITIVA.md`](v2.1/docs/MANUFATURA-ADITIVA.md).

Todo o resto é igual à v2.0. O x1 online continua com o mesmo protocolo.

**[BAIXAR PACOTE DE REDE v2.0 — para o X1 (Windows 64 bits, 41 MB)](v2.0/Oficina-de-Soldagem-v2.0-Rede.zip)**

No PC anfitrião, extraia a pasta inteira e abra **ABRIR-OFICINA.bat** (não precisa
instalar nada; o Node.js vai junto). Deixe a janela do servidor aberta. No segundo
PC, abra no navegador o endereço com IP mostrado nessa janela (ex.:
`http://192.168.0.10:5197/?rede=1`). Nos dois: Arcade → X1 em rede, um cria a sala
e o outro entra com o código. Os dois PCs precisam estar na v2.0.

No **eletrodo revestido** (Treino → Eletrodo → escolha a peça e o modo), o arco
abre ao tocar a peça com **S** e a vareta queima: continue descendo com toques em **S**; **Encerrar tentativa** ou **Enter** mostra a nota de
0 a 1000 e o botão **Defeitos**, com o lugar, a causa e como corrigir cada defeito.

| Versão | O que tem de novo | Download |
|---|---|---|
| Alpha v2.1 | **Teste, não estável.** Modo experimental **Manufatura Aditiva**: robô programado em INFORM fabrica uma parede de várias camadas | [ZIP da v2.1 (teste)](v2.1/Oficina-de-Soldagem-Alpha-v2.1.zip) |
| **Alpha v2.0** | **Mais nova estável.** Máquina MIG/MAG em volts e m/min com curto-circuito, globular e spray; chapa que passa e fura em níveis; tubo com tubo; chapas com características próprias; **brasagem** com maçarico | [ZIP da v2.0](v2.0/Oficina-de-Soldagem-Alpha-v2.0.zip) · [Pacote de rede (X1)](v2.0/Oficina-de-Soldagem-v2.0-Rede.zip) |
| Alpha v1.9 | **TIG** com mesa digitalizadora + mouse; Fácil só nota e Difícil com mínimo por categoria; eletrodo sem ajuda na altura | [ZIP da v1.9](v1.9/Oficina-de-Soldagem-Alpha-v1.9.zip) · [Pacote de rede (X1)](v1.9/Oficina-de-Soldagem-v1.9-Rede.zip) |
| Alpha v1.8 | Modos **Fácil e Difícil**; MIG/MAG mais lento pela física; nota sem trava | [ZIP da v1.8](v1.8/Oficina-de-Soldagem-Alpha-v1.8.zip) · [Pacote de rede (X1)](v1.8/Oficina-de-Soldagem-v1.8-Rede.zip) |
| Alpha v1.7 | **X1 em rede** no MIG/MAG; painel MIG maior; eletrodo com cordão 3D e lista de defeitos | [ZIP da v1.7](v1.7/Oficina-de-Soldagem-Alpha-v1.7.zip) · [Pacote de rede (X1)](v1.7/Oficina-de-Soldagem-v1.7-Rede.zip) |
| Alpha v1.6 | Painel de máquina, pausa e Arcade com História, Desafios e Versus; eletrodo com nota de 0 a 1000 e defeitos; **código organizado em português** para editar | [ZIP da v1.6](v1.6/Oficina-de-Soldagem-Alpha-v1.6.zip) · [guia do código](v1.6/README.md) |
| Alpha v1.5 | Primeiro treino de **eletrodo revestido**: cinco peças, vareta que queima, escória, martelinho e escova | [ZIP da v1.5](v1.5/Oficina-de-Soldagem-Alpha-v1.5.zip) |
| Alpha v1.4 | **Interface nova** (menu ilustrado, oficina e serralheria em 3D) e solda realista: gravidade no metal e defeitos visíveis | [ZIP da v1.4](v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip) |
| Alpha v1.3 | **Aprovada.** Câmera livre, giro da peça por gestos, distância bico–peça e nota de 0 a 1000 | [ZIP da v1.3](v1.3/Oficina%20de%20Soldagem%203D%20Alpha%20v1.3.zip) |
| Alpha v1.2 | Jogo só em 3D, **cinco tipos de junta** e posições de soldagem (plana, horizontal, vertical, sobrecabeça) | [Pasta portátil](v1.2/jogo-portatil/) |
| Alpha v1.1 | **Primeira versão 3D** do jogo MIG/MAG, com volta para o 2D sem WebGL | [Pasta do jogo](v1.1/) |

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

- [`v2.1/`](v2.1/) ← [`alpha-v2.1`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v2.1) (`claude/v2.1` e `gpt/v2.1`, a partir da `alpha-v2.0`; PRs #47, #49, #50, #52 e #54). **Versão de teste, não estável.**
- [`v2.0/`](v2.0/) ← [`claude/v2.0`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v2.0) (feita a partir da `alpha-v1.9`; já incorporada à `alpha-v2.0` pelos PRs #32, #36, #37, #39, #40, #42 e #43)
- [`v1.9/`](v1.9/) ← [`alpha-v1.9`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.9) (`claude/v1.9`, com a v1.8 junto)
- [`v1.8/`](v1.8/) ← [`claude/v1.8`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.8) (feita a partir da `alpha-v1.7`; ainda não há `alpha-v1.8`)
- [`v1.7/`](v1.7/) ← [`alpha-v1.7`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.7) (`gpt/v1.7` + `claude/v1.7`)
- [`v1.6/`](v1.6/) ← [`alpha-v1.6`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.6) (`gpt/v1.6`) com o código reorganizado e a lista de defeitos do eletrodo (`claude/v1.6`)
- [`v1.5/`](v1.5/) ← [`alpha-v1.5`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.5) (`gpt/v1.5` + `claude/v1.5`)
- [`v1.4/`](v1.4/) ← [`alpha-v1.4`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.4) (`gpt/v1.4` + `claude/v1.4`)
- [`v1.3/`](v1.3/) ← [`alpha-v1.3`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.3) (a versão aprovada)
- [`v1.2/`](v1.2/) e [`v1.1/`](v1.1/): guardadas só aqui, de antes das branches de entrega (a v1.1 tem só o jogo pronto)

Detalhes e limites do modelo do eletrodo (hipóteses H59–H73):
[`v1.5/docs/PROTOTIPO-V15.md`](v1.5/docs/PROTOTIPO-V15.md).

## O que mudou na v2.1? (teste, não estável)

- **Manufatura Aditiva — Programação Robotizada** (H106, experimental):
  - editor do job em INFORM, com números de linha, a linha em execução e erros com a linha, a causa e a correção;
  - executar sem deposição, fabricar, pausar, passo, parar e reiniciar;
  - tabela de posições com jog e registro;
  - arquivos de início e fim de arco (ASF/AEF) separados do movimento;
  - célula 3D com robô ilustrativo;
  - parede multicamadas com efeito do incremento programado, da distância da tocha e do interpasse;
  - inspeção com nota e atividade guiada;
  - **modo livre** (teste): sem missão e sem nota, só as medidas da peça (#54).
  - cordões com relevo 3D por camada e escoamento da poça para os vizinhos mais baixos, que conserva o volume (#49, GPT).
- Versão visível 2.1. Protocolo de rede, convites e endereço online iguais aos da v2.0.

## O que mudou na v2.0?

- **Máquina MIG/MAG em unidades reais:** tensão de 0 a 30 V, alimentação de 1 a 15 m/min, corrente em A e modo de transferência. Abaixo de 14 V o arame bate; abaixo de 10 V o arco não abre; tocha parada consome a chapa em estágios até abrir um buraco de verdade, visto de cima e por baixo.
- **Efeito na solda:** globular respinga; spray (só com argônio) penetra e fura chapa fina; arco curto deita o metal sem fundir; tensão alta respinga, achata e morde a borda (`pontuacao-v11`).
- **Passar da chapa em níveis** no MIG/MAG, no eletrodo e no TIG (raiz aparente, metal pendurado, face afundada, furo).
- **Tubo com tubo** (MIG/MAG, eletrodo e TIG), com a posição mudando em volta do tubo no MIG/MAG, e a vareta do TIG fundindo no ritmo do jogador.
- **Chapas com características próprias** (galvanizado, médio carbono, inox ferrítico e cobre, além de aço carbono, inox e alumínio), trocáveis no treino dos três processos (H104).
- **Brasagem forte com maçarico** (H105): capilaridade, fluxo, cor de trabalho e ligas de catálogo; no treino, quatro peças sobrepostas.
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

## O que mudou na v1.6?

- **Interface da alpha-v1.6** (GPT): painel de máquina, menu da oficina, pausa e
  Arcade com História, Desafios e Versus.
- **Eletrodo revestido** com depósito de metal real e nota de 0 a 1000.
- **Defeitos do eletrodo** (Claude): falta de fusão, mordedura, poros, cratera,
  inclusão de escória e outros, com o lugar, a causa e como corrigir, desenhados
  no cordão; a lista não muda a nota.
- **Código organizado para editar:** pastas e arquivos em português, um quadro
  "O que faz / Onde mexer" no começo de cada arquivo e um `LEIA-ME.md` por pasta
  (veja "Quer mexer no código?" acima).

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

## O que mudou na v1.4?

- **Interface nova:** início com o soldador e menu ilustrado, e a mesma
  identidade visual em todas as telas.
- **Cenários 3D:** o treino acontece numa oficina (bancada, morsa, ferramentas e
  máquina no carrinho); a missão Suporte de prateleira, numa serralheria.
- **Solda mais realista no MIG/MAG:** a gravidade escorre o metal na vertical,
  pinga na sobrecabeça e derruba o cordão na horizontal.
- **Defeitos visíveis** na peça 3D, no corte e na aba Defeitos do resultado:
  mordedura, sobreposição, respingos, cratera no fim, porosidade, escamas, cores
  de calor e empeno das chapas (`pontuacao-v7`).
- Roteiros de missões, progresso e plano da próxima tentativa; Arcade v2;
  torneios com pendências por rodada.

## O que mudou na v1.3?

Esta é a versão **aprovada** que serviu de base para as seguintes.

- **Câmera livre** em volta da peça (botão do meio, Espaço com a caneta ou
  analógico direito) e **giro da peça por gestos** (botão direito, E/B com a
  caneta ou direcional), só com o arco fechado. Os botões e as teclas mudam em
  **Controles**.
- A peça fica numa oficina com piso, paredes e teto, presa num suporte.
- **Distância bico–peça (DBCP)** na bancada (10, 15 ou 20 mm): mais distância,
  menos corrente e menos fusão com o mesmo metal.
- **Nota de 0 a 1000** (`pontuacao-v3`): fusão, geometria do cordão,
  regularidade, controle térmico e execução, cada critério perdendo pontos aos
  poucos.
- Na junta de topo, o metal enche primeiro a fresta entre as chapas; o cordão
  aparece em escala real.
- As telas cabem num notebook de 1280×720 sem rolar.

## O que mudou na v1.2?

- **O jogo passou a ser só 3D**, com um desenho 2D de reserva sem WebGL.
- **Cinco tipos de junta:** topo reto, topo em V, em T, sobreposta e de canto.
  Cada missão tem a sua; no treino livre dá para escolher.
- **Posicionar a peça** (girar no plano e tombar de 0° a 180°), com a posição de
  soldagem mostrada no canto: plana, horizontal, vertical ou sobrecabeça. Na
  vertical, subir funde mais e descer funde menos; de cabeça para baixo o cordão
  fica mais alto.
- A técnica (empurrando ou puxando) inclina a tocha no 3D.
- As telas cabem numa página; os textos longos abrem por botões.

## O que mudou na v1.1?

- **Primeira versão em 3D** do jogo MIG/MAG: o 3D vem ligado na peça de teste da
  bancada e durante a soldagem, com os botões 2D / 3D e a inclinação da vista.
- A mira, o cordão e a pontuação são os mesmos do 2D: o 3D só muda o desenho.
- Se o 3D ficar lento, o jogo baixa a qualidade sozinho e, se preciso, volta para
  o 2D; sem WebGL, tudo funciona em 2D.
- Já trazia o jogo base: História, Arcade, Torneio local, Recordes, Treino e
  Configurações, com mouse, caneta e controle.

## Dados e versões

Recordes e preferências ficam no navegador de cada computador.
Mudar a pasta do HTML pode fazer os dados anteriores deixarem de aparecer.
Exporte os recordes em JSON antes de trocar de versão.

Esta branch é o catálogo e histórico das versões. O trabalho de cada agente
fica na sua branch; as integrações são feitas por pull request aprovado pelo dono.
