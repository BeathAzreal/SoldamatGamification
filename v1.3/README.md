# Oficina de Soldagem MIG/MAG — jogo didático

Jogo de navegador para estudar como os ajustes da máquina, a técnica, o tipo
de junta e a posição de soldagem mudam o cordão. Feito em **TypeScript + Vite
+ Three.js (3D)**, sem servidor, sem conta e sem internet.

**Jogo pronto, sem instalar nada:** abra `jogo-portatil/Abrir o jogo.bat` (ou o
`Oficina de Soldagem.html` da mesma pasta) no Chrome ou no Edge. Para gerar
essa pasta de novo a partir do código: `npm run portatil`.

> **Modelo qualitativo simplificado.** Os números são do jogo, não valores de
> processo. A aparência do cordão não indica qualidade interna; a
> "integridade prevista" é um resultado **sintético** do modelo. Veja
> [docs/HIPOTESES.md](docs/HIPOTESES.md).

## Como executar

Precisa do [Node.js](https://nodejs.org) (testado com a versão 24).

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).
No Windows também dá para usar o atalho `Jogo de Soldagem MIG.bat` da área de
trabalho.

| Comando | O que faz |
|---|---|
| `npm run build` | Confere os tipos (TypeScript) e gera a versão final em `dist/` |
| `npm run preview` | Serve a versão de `dist/` para testar |
| `npm test` | Roda os testes (modelo, pontuação, torneio, dados, entrada) sem navegador |
| `npm run typecheck` | Só confere os tipos |

## Rodar em outro PC (pasta portátil)

```bash
npm run portatil
```

Gera `portatil/Oficina de Soldagem/` (e o `.zip` ao lado, quando compactado):
um único `Oficina de Soldagem.html` com tudo embutido (e uma cópia da pasta na Área de Trabalho), o atalho
`Abrir o jogo.bat` e um `LEIA-ME.txt`. Basta copiar a pasta e dar dois
cliques — sem Node, sem internet, em Chrome ou Edge. Recordes e torneios
ficam no navegador de cada PC (use Exportar/Importar JSON para levar).

## Câmera e peça (Alpha v1.3)

Só com o arco fechado (ninguém gira a peça e solda ao mesmo tempo):

| | Mouse | Mesa digitalizadora (caneta) | Controle |
|---|---|---|---|
| Mover a câmera em volta da peça | arrastar com o botão do meio; a roda aproxima | segurar **Espaço** e mover a caneta | analógico direito |
| Girar (para os lados) e tombar (para cima/baixo) a peça | arrastar com o botão direito | segurar **E** ou **B** e mover a caneta | direcional |

Tudo isso muda no botão **Controles** da bancada (Configurações e antes de
cada tentativa). "Centralizar" volta a câmera para a vista de frente.

## Modos (menu)

| Modo | O que é |
|---|---|
| **História** | Capítulos (missões) com níveis Aprendiz e Profissional: nome → capítulo → ficha com desenho → bancada → tentativas → entrega → pontuação detalhada (conceito S–D, contagem animada) → ranking local. Aprovar o Aprendiz libera o próximo capítulo e o Profissional. |
| **Arcade** | Desafios aleatórios em sequência (missão + nível + condição extra: máquina pré-ajustada, arco único, técnica obrigatória, contra o relógio). Três vidas, uma tentativa por desafio, combo até ×2, recorde da partida. |
| **Torneio local** | Por turnos no mesmo computador, com ou sem professor. Regras bloqueadas depois do início; salvo após cada ação; retomável depois de recarregar. Ver [docs/TORNEIO.md](docs/TORNEIO.md). |
| **Recordes** | Melhores pontuações por missão, dificuldade e dispositivo; exportar e importar JSON com validação; excluir com confirmação. |
| **Treino** | *Treino livre* (peça padrão de aço carbono 3 mm na bancada, qualquer dispositivo e formato de junta, com pontuação, explicação e comparação com a tentativa anterior) e *treino de missão* com o dispositivo escolhido. Nada vai para ranking ou torneio. |
| **Configurações** | A **bancada** com a peça padrão (aço carbono 3 mm): regular tensão, alimentação, arame, gás e técnica soldando numa peça de teste, escolher e calibrar o dispositivo. E a gestão dos dados. |

Atalhos: no menu, teclas **1–6**; na execução, **Enter** encerra a tentativa e
**P** pausa.

**Bancada:** antes de cada tentativa (em todos os modos) a máquina fica ao lado
de uma **peça de teste** do mesmo material, onde se solda à vontade para
regular os parâmetros e o dispositivo. O resumo de cada passe mostra largura,
reforço, fusão prevista e velocidade em relação ao desenho. Nada feito na
peça de teste conta.

## Documentação

| Arquivo | Assunto |
|---|---|
| [docs/HIPOTESES.md](docs/HIPOTESES.md) | Todas as hipóteses do modelo (H1–H37), o que é fixo, configurável ou controlado, fontes consultadas |
| [docs/PONTUACAO.md](docs/PONTUACAO.md) | Pontuação automática v1: categorias, regras, limitações, essenciais, desempates, versão |
| [docs/MISSOES.md](docs/MISSOES.md) | Catálogo de missões, combinações não oferecidas, missões e processos ainda não jogáveis |
| [docs/TORNEIO.md](docs/TORNEIO.md) | Torneio local, regras de entrega, julgamento do professor, revisões |
| [docs/DISPOSITIVOS.md](docs/DISPOSITIVOS.md) | Mouse, caneta e controle; calibração; desconexão; limites do controle de PS4 |
| [docs/DADOS.md](docs/DADOS.md) | O que é salvo, versões, migração, recuperação, exportação |
| [docs/VERIFICACAO.md](docs/VERIFICACAO.md) | O que foi testado (automático e no navegador) e o que não pôde ser testado |

## Como o código está organizado

```
src/
  modelo/       ← a "física" do jogo. Não sabe que existe tela nem dispositivo.
    parametros.ts   números do modelo, em um lugar só
    material.ts     materiais, gases e arames (H27, H35)
    processo.ts     corrente relativa, taxa, potência, forma, equilíbrio (H1, H9–H11, H28–H31)
    simulacao.ts    abre/fecha arco, deposita, aquece a peça (H32), registra eventos
    cordao.ts       metal depositado → largura/altura (H2–H4, H7)
    percurso.ts     tempo e aporte por posição (H20, H31)
    fusao.ts        índice de fusão sintético, bordas, deformação (H33, H34, H36)
    replay.ts       reproduz uma tentativa a partir dos eventos
    avaliacao.ts, movimento.ts, trajetoria.ts, velocidade.ts
  missoes/      catálogo de missões e validação de combinações
  pontuacao/    regras da pontuação v1 e pontuação oficial a partir do replay
  dados/        persistência versionada, recordes, motor do torneio, sessão do Arcade
  entrada/      camada comum: mouse/caneta (Pointer Events) e controle (Gamepad API)
  didatica/     explicação e comparação por regras fixas (modo original)
  render/       canvas: cena, efeitos, desenho da missão (SVG), gráficos, corte sintético
  ui/           aplicação, telas e componentes (sem framework)
tests/          testes automáticos (Vitest)
```

## Decisões das etapas 1–4, em linguagem simples

**Por que separar modelo, interface e efeitos?**
Para saber sempre de onde vem cada coisa. Se o cordão está largo, a causa
está em `modelo/` — nunca num efeito visual. Isso também permite testar o
modelo sem abrir o navegador e trocar o desenho sem mexer na física.

**Por que a largura depende da velocidade?**
Por conservação de volume. Se a tocha despeja sempre o mesmo volume por
segundo, andar devagar espalha esse volume por menos milímetros: cada
milímetro recebe mais metal, e o cordão fica mais "gordo". O jogo guarda o
volume em fatias de 0,5 mm ao longo da junta e transforma volume em largura
supondo uma forma fixa de seção (hipótese H3 — a mais simplificadora).

**Por que não medir a velocidade "por quadro"?**
Um computador pode desenhar 30 quadros por segundo e outro 144. Se a
velocidade fosse "pixels por quadro", o mesmo gesto daria resultados
diferentes. Aqui cada leitura do mouse traz o instante em que aconteceu, e a
velocidade é distância ÷ tempo real. O teste automático confirma que a mesma
trajetória gera o mesmo cordão a 30, 60 ou 144 quadros/s.

**Por que a tocha parada continua depositando?**
O mouse parado não envia eventos, mas o arco continua aberto. O laço de
desenho avisa a simulação de que o tempo passou, e o metal se acumula no
mesmo lugar.

**Por que tensão e alimentação são "de 1 a 10" e não volts e m/min?**
Para mostrar valores reais seria preciso escolher arame, gás e máquina e ter
dados medidos dessa combinação. Sem isso, qualquer número em volts seria
inventado e pareceria uma recomendação. Os botões de 1 a 10 deixam claro que
o jogo mostra só a direção das tendências.

**O que a alimentação do arame faz?**
Decide quanto metal entra por segundo. É conservação de massa outra vez:
com o diâmetro do arame fixo, o dobro de velocidade do arame é o dobro de
volume por segundo (H1). Por isso, com mais arame, é preciso andar mais
rápido para manter o mesmo tamanho de cordão — e a faixa verde de
velocidade se desloca junto (H11).

**O que a tensão faz?**
No jogo, só muda a *forma* da seção, não a quantidade de metal: mais tensão
→ cordão mais largo e achatado; menos tensão → mais estreito e alto (H9).
É a tendência qualitativa costumeiramente ensinada; os números da relação
são do jogo e a direção ainda deve ser conferida em fonte de referência.

**E o "equilíbrio" entre os dois?**
Na prática, mais arame pede mais tensão. O jogo usa uma reta inventada para
dizer se o arco está "curto", "equilibrado" ou "longo" (H10). Nesta etapa
isso só gera um aviso e muda o desenho do arco (faíscas) — não altera o
cordão nem vira nota, porque não temos base para dizer *quanto* o
desequilíbrio afetaria o resultado.

**Por que os ajustes travam com o arco aberto?**
Para cada trecho do cordão ter ajustes bem definidos. Isso vai simplificar a
avaliação final (H12).

**O que a avaliação mede — e o que ela não mede?**
Ela mede só o que o modelo calcula: largura, altura, onde está o centro do
cordão e se há trechos sem cordão. Não sabe nada sobre penetração, fusão ou
defeitos internos, e a tela diz isso em destaque (H13). Um cordão bonito
por fora pode estar ruim por dentro; o jogo não tem como saber e não finge
saber.

**Como "regularidade" vira um número?**
Pelo coeficiente de variação da largura: desvio-padrão ÷ média. 0 % seria
um cordão de largura perfeitamente constante. As faixas "muito regular /
regular / irregular" são do jogo (H15). Antes de medir, cortamos 5 mm de
cada ponta, porque ali o modelo só tem a "cauda" do espalhamento numérico
(H14).

**Por que o corte transversal tem uma parte hachurada?**
O corte desenha o domo calculado (largura, altura e deslocamento reais do
modelo). Abaixo dele, onde numa solda real estaria a zona fundida, o modelo
não calcula nada — então o desenho mostra essa região como "não modelada"
em vez de inventar uma penetração. A espessura das chapas também é só
ilustrativa (H18).

**Por que "linha da junta coberta" diz que não indica fusão?**
Ela só verifica, na vista de cima, se o cordão passa por cima da linha da
junta. Para as chapas estarem de fato unidas, a fusão teria que atingir as
duas bordas em profundidade — coisa que o modelo não calcula (H16).

**Como o jogo sabe "por que" o cordão ficou assim?**
Porque o modelo é nosso: o cordão do jogo só muda por alguns caminhos
(quantidade de metal por segundo, tempo que a tocha passa em cada lugar,
posição lateral da tocha e tensão). As regras em `didatica/` percorrem
esses caminhos e escrevem frases com os números da tentativa. Não há IA nem
sorteio: a mesma tentativa sempre gera o mesmo texto (H21). Dentro do modelo
a explicação é exata; para solda real, não serve de diagnóstico — e o texto
termina dizendo isso.

**O que é "velocidade efetiva por trecho"?**
A região avaliada é dividida em trechos de 5 mm; para cada um, medimos
quanto tempo de arco a tocha passou ali. Velocidade efetiva = 5 mm ÷ esse
tempo. Parar ou voltar para trás aumenta o tempo e "deixa o trecho mais
lento" — exatamente o que faz o metal se acumular (H20). O gráfico de
barras fica alinhado com o de largura: onde a barra cai, a largura sobe.

**Como a comparação separa as causas?**
No modelo, largura ∝ √(alimentação ÷ (velocidade × forma da tensão)). Então
a mudança de largura entre duas tentativas vira o produto de três fatores,
e o jogo mostra cada um — inclusive quando eles se compensam e a largura
fica igual (H25). "Melhor/pior" só aparece onde o jogo tem critério; para
largura, altura e velocidade ele diz só "maior/menor" (H24).

**Por que a velocidade usa só o eixo da junta?**
"Velocidade de avanço" é quanto a solda progride ao longo da junta. Se você
faz zigue-zague, a tocha anda bastante, mas a solda avança pouco. O painel
mostra separadamente o movimento lateral.

**Por que existe uma "faixa-alvo" de velocidade?**
Só para o jogo ter um objetivo. Ela é arbitrária e não é recomendação de
processo.

## Decisões da etapa 5, em linguagem simples

**Por que só MIG/MAG é jogável?** Eletrodo revestido e TIG precisam de
controles e comportamentos próprios. Mostrá-los com o comportamento do
MIG/MAG e outro nome seria enganar; eles aparecem como "não disponíveis".

**Por que a corrente não é um botão?** Numa fonte de tensão constante, a
corrente acompanha a alimentação do arame. O jogo mostra a corrente
*relativa* como resultado, não como controle.

**Como os materiais se diferenciam?** Não é cor nem multiplicador: cada um
tem calor necessário para fundir, aquecimento acumulado ao longo do passe,
tendência a deformar e, no alumínio, a limpeza do óxido. Isso muda o que dá
certo: no inox é preciso fundir com pouco calor; no alumínio é preciso muito
calor no começo e acelerar depois.

**De onde vem a "integridade"?** De um índice de fusão sintético calculado
pelo aporte de calor, pela cobertura das bordas e pela preparação — nunca da
aparência do cordão. O corte transversal mostra essa previsão e diz que é
sintética.

**Por que a nota oficial vem do replay?** A tentativa é gravada como uma lista
de eventos. A nota, a inspeção do professor e o replay são calculados desse
mesmo registro, então todos veem os mesmos dados.

**Por que recarregar a página no meio de uma tentativa oficial não ajuda?**
A tentativa é gravada como "em andamento" assim que começa; ao recarregar,
ela vira "interrompida" e conta no limite.

## Próximos passos (ideias)

- Conferir H27–H36 em livro-texto (gases por material, propriedades térmicas,
  penetração) e registrar as fontes.
- Modelos próprios para eletrodo revestido e TIG antes de liberá-los.
- Junta em T (solda em ângulo) e posição vertical, para as missões planejadas.
- Testar mouse, caneta e controle lado a lado antes de comparar dispositivos.

Antes de cada novo parâmetro, a relação usada será registrada em
`docs/HIPOTESES.md` com o que precisa de validação.
