# Oficina de Soldagem — versões e downloads

## Alpha v1.9 disponível para teste

**[BAIXAR ALPHA v1.9 — jogo pronto em ZIP](v1.9/Oficina-de-Soldagem-Alpha-v1.9.zip)**

Extraia o ZIP inteiro e abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html**
no Chrome ou Edge. Não precisa instalar nada nem ter internet para jogar.
Entre na sua conta do GitHub para baixar os arquivos deste repositório privado.

O jogo mostra **ALPHA v1.9** no topo. Novidades:

- **Fácil = só nota:** sem aprovação; vale a soma das 5 categorias, mesmo com
  zero em alguma.
- **Difícil = pelo menos 20 % em cada categoria** para a solda ser aprovada.
- **Desafios do Arcade e Modo História só no Difícil**, com pelo menos 40 % em
  cada categoria.
- **Eletrodo sem assistência:** a vareta queima e o jogador desce com toques em
  **S** enquanto avança. Cordão em relevo e peça nova **Cordões sobre chapa**.
- **TIG novo** (Treino → TIG): **mesa digitalizadora + mouse** (a caneta é a tocha
  e a pressão é o pedal; o clique do mouse mergulha a vareta) ou **só mouse**.

**[BAIXAR PACOTE DE REDE v1.9 — para o X1 (Windows 64 bits, 41 MB)](v1.9/Oficina-de-Soldagem-v1.9-Rede.zip)**

No PC anfitrião, extraia a pasta inteira e abra **ABRIR-OFICINA.bat** (não precisa
instalar nada; o Node.js vai junto). Deixe a janela do servidor aberta. No segundo
PC, abra no navegador o endereço com IP mostrado nessa janela (ex.:
`http://192.168.0.10:5197/?rede=1`). Nos dois: Arcade → X1 em rede, um cria a sala
e o outro entra com o código. Os dois PCs precisam estar na v1.9.

No **eletrodo revestido** (Treino → Eletrodo → escolha a peça e o modo), o arco
abre ao tocar a peça com **S** e a vareta queima: continue descendo com toques em **S**; **Encerrar tentativa** ou **Enter** mostra a nota de
0 a 1000 e o botão **Defeitos**, com o lugar, a causa e como corrigir cada defeito.

| Versão | Estado | Download |
|---|---|---|
| **Alpha v1.9** | **Mais nova — TIG com mesa digitalizadora + mouse, Fácil só nota, Difícil com mínimo por categoria, desafios e História no Difícil, eletrodo sem assistência** | [ZIP da v1.9](v1.9/Oficina-de-Soldagem-Alpha-v1.9.zip) · [Pacote de rede (X1)](v1.9/Oficina-de-Soldagem-v1.9-Rede.zip) |
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

- [`v1.9/`](v1.9/) ← [`claude/v1.9`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.9) (feita a partir da `claude/v1.8`; ainda não há `alpha-v1.9`)
- [`v1.8/`](v1.8/) ← [`claude/v1.8`](https://github.com/BeathAzreal/SoldamatGamification/tree/claude/v1.8) (feita a partir da `alpha-v1.7`; ainda não há `alpha-v1.8`)
- [`v1.7/`](v1.7/) ← [`alpha-v1.7`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.7) (`gpt/v1.7` + `claude/v1.7`)
- [`v1.6/`](v1.6/) ← [`alpha-v1.6`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.6) (`gpt/v1.6`) com o código reorganizado e a lista de defeitos do eletrodo (`claude/v1.6`)
- [`v1.5/`](v1.5/) ← [`alpha-v1.5`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.5) (`gpt/v1.5` + `claude/v1.5`)
- [`v1.4/`](v1.4/) ← [`alpha-v1.4`](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.4) (`gpt/v1.4` + `claude/v1.4`)

Detalhes e limites do modelo do eletrodo (hipóteses H59–H73):
[`v1.5/docs/PROTOTIPO-V15.md`](v1.5/docs/PROTOTIPO-V15.md).

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
