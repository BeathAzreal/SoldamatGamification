# Oficina de Soldagem — Alpha v2.0

Cópia da branch [`claude/v2.0`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v2.0), feita a partir da `alpha-v1.9`. Já incorporada à `alpha-v2.0` (PRs #32, #36 e #37).

## Jogar

- **Só jogar:** baixe [`Oficina-de-Soldagem-Alpha-v2.0.zip`](Oficina-de-Soldagem-Alpha-v2.0.zip), extraia e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge. Sem instalação nem internet. O ZIP também traz **JOGAR ONLINE.html** (X1 online por convite) e o servidor local de reserva. A mesma pasta está em [`jogo-portatil/`](jogo-portatil/).
- **X1 em rede:** no PC anfitrião, baixe [`Oficina-de-Soldagem-v2.0-Rede.zip`](Oficina-de-Soldagem-v2.0-Rede.zip) (Windows 64 bits, já com o Node.js), extraia e abra **ABRIR-OFICINA.bat**. Os dois PCs precisam ser da v2.0.

## O que mudou na v2.0

- **Tubo com tubo** (emenda de topo de dois tubos, soldada em volta), nos três processos:
  - MIG/MAG: a missão **Tubulação da horta comunitária**;
  - eletrodo e TIG: a peça **Tubo com tubo**;
  - solde perto do alto, apague o arco e gire o tubo (⟲ ⟳);
  - no MIG/MAG a posição muda em volta: plana em cima, vertical no lado, sobrecabeça embaixo (gotas e escorrimento aparecem onde o tubo está).
- **TIG: a vareta funde.** Ela vai à borda da poça mesmo se você avançar a tocha antes de tocar, e toques rápidos não se perdem em PC lento.
- **Máquina MIG/MAG em unidades reais:** tensão de **0 a 30 V** e alimentação do arame de **1 a 15 m/min**, em passos de 0,5. O painel mostra a **corrente em A** e o **modo de transferência**.
- **Os ajustes mudam a solda:**
  - **curto-circuito** (tensão baixa): pouco calor, bom para chapa fina;
  - **globular:** respinga e deixa o cordão irregular;
  - **spray** (só com argônio, corrente e tensão altas): liso, penetra muito e fura chapa fina;
  - **tensão baixa demais para o arame:** o metal deita sem fundir as bordas;
  - **tensão alta demais:** respinga, achata o cordão e morde a borda.
  - **abaixo de 14 V:** o arame bate e mergulha na poça: cordão frio, alto, sem fundir as bordas e com respingo;
  - **abaixo de 10 V:** o arco não abre; o arame só sai e bate na chapa;
  - **tocha parada no mesmo lugar:** consome a chapa em estágios: a raiz aparece embaixo, o metal vaza e pinga pelo avesso, a face afunda e, no ponto mais quente, abre um **buraco de verdade**, que alarga com o calor. Dá para ver através, de cima e por baixo. Chapa grossa aguenta mais; o alumínio quase não avisa antes de cair.
- **Passar da chapa em níveis:** com calor demais, primeiro a raiz aparece no avesso (normal), depois o metal passa e fica pendurado do outro lado, depois a poça cai e a face afunda e, no limite, a chapa vara e abre um furo. No resultado, o botão **Ver o avesso** mostra tudo isso. Vale para o MIG/MAG, o eletrodo e o TIG (no filete, só o furo conta).
- **Passes sobrepostos mais reais** (a partir de Banaee et al. 2023, sobre cordões sobrepostos):
  - cada cordão tem seção de parábola, e passes lado a lado somam. Com o passo certo (cerca de 2/3 da largura) a superfície fica quase plana; mais perto vira morro, mais longe deixa vale;
  - no eletrodo, cada passe vira uma camada: um passe frio ou rápido sobre o anterior não funde nele (**falta de fusão entre passes**);
  - no resultado do eletrodo, o botão **Corte** mostra a seção em escala real, com uma cor por passe.
- **MIG/MAG:** mais arame deixa o cordão mais achatado, e andar rápido demais com corrente alta faz corcovas (**humping**).
- No Arcade, a máquina pré-ajustada usa os passos do painel e fica fora do globular.
- Novo exercício técnico: **4. Curto-circuito, globular e spray**.
- **Chapas com características próprias** (espessura, calor para fundir, quanto esquentam, quanto guardam o calor, deformação, limpeza). Novas: **aço galvanizado** (fino, com zinco que faz poro se não for esmerilhado), **aço médio carbono** (grosso, custa a esquentar e guarda o calor), **inox ferrítico** (bem fino, esquenta muito rápido) e **cobre** (pede o maior calor e esfria rápido). Cada chapa tem uma ficha com níveis de 1 a 5 tirados do próprio modelo.
- **No treino, troque a chapa** e ela leva as características dela:
  - MIG/MAG, treino livre: grupos **Chapa** e **Espessura** na bancada (gás, arame e limpeza acompanham; o V só em chapa de 4 mm ou mais);
  - eletrodo e TIG: **Escolha a chapa** depois da peça; a corrente sugerida acompanha o material.
- Continua tudo da v1.9: TIG com mesa digitalizadora + mouse, Fácil/Difícil, eletrodo sem assistência.

Detalhes em [`docs/HIPOTESES.md`](docs/HIPOTESES.md) (H93 a H104) e [`docs/PONTUACAO.md`](docs/PONTUACAO.md) (`pontuacao-v11`). Números do jogo, não de catálogo de fabricante.
