# Oficina de Soldagem — v1.6 (código organizado)

A v1.6 é **o jogo da alpha-v1.6** (a interface nova de máquina, o menu da
oficina, a pausa, o Arcade com História/Desafios/Versus e o eletrodo com
depósito real e nota de 0 a 1000, feitos pelo GPT), com o código
reorganizado para quem não programa em JavaScript conseguir encontrar,
entender e reescrever partes. Por cima disso, o eletrodo ganhou a **lista
de defeitos** (falta de fusão, mordedura, poros, cratera, inclusão de
escória...) com o lugar, a causa e como corrigir, desenhados no cordão; ela
não muda a nota.

- Pastas e arquivos com nomes em português que dizem o que há dentro.
- Tudo do **eletrodo revestido** numa pasta só: [`codigo/eletrodo/`](codigo/eletrodo/).
- Cada arquivo começa com um quadro **"O que faz / Onde mexer"**.
- Cada pasta tem um `LEIA-ME.md` curto.
- Tabela de onde foi parar cada arquivo da v1.5 e da alpha-v1.6:
  [`documentacao/MAPA-v1.5-para-v1.6.md`](documentacao/MAPA-v1.5-para-v1.6.md).

---

## 1. Só quero jogar

Abra [`jogo-portatil/`](jogo-portatil/) e dê dois cliques em
**Abrir o jogo.bat** (ou abra **Oficina de Soldagem.html** no Chrome ou Edge).
Não precisa instalar nada nem ter internet.

## 2. Quero mudar o jogo

### 2.1 Preparar o computador (uma vez)

1. Instale o **Node.js** (versão LTS) em <https://nodejs.org>. Ele traz o `npm`.
2. Abra um terminal **dentro da pasta `v1.6`** (no Windows: clique com o botão
   direito na pasta → "Abrir no Terminal").
3. Rode `npm install` e espere terminar. Isso baixa as bibliotecas do jogo
   para a pasta `node_modules` (não precisa abrir essa pasta).

### 2.2 Os quatro comandos

| Comando | Para que serve |
|---|---|
| `npm run dev` | Abre o jogo em modo de edição. O terminal mostra um endereço (ex.: `http://localhost:5173`); abra no navegador. **Cada vez que você salva um arquivo, o jogo atualiza sozinho.** |
| `npm test` | Roda os **testes automáticos** (404 hoje). Se todos passarem, as regras do jogo continuam funcionando. |
| `npm run typecheck` | Confere se o código não tem erro de digitação ou de tipo (ex.: um nome escrito errado). |
| `npm run portatil` | Gera o jogo pronto em `portatil/Oficina de Soldagem v1.6/`. Copie os 3 arquivos de lá para `jogo-portatil/` para distribuir. |

**Regra de ouro:** depois de mudar algo, rode `npm run typecheck` e
`npm test`. Se aparecer erro, a mensagem diz o arquivo e a linha.

### 2.3 Editor recomendado

Use o **Visual Studio Code** (gratuito). Ao parar o mouse sobre um nome, ele
mostra o comentário que explica aquele nome; **F12** leva até onde ele foi
criado; **Ctrl+Shift+F** procura um texto em todos os arquivos (ótimo para
achar uma frase que aparece na tela).

---

## 3. Mapa das pastas

```
v1.6/
├── jogo-portatil/        O jogo pronto (HTML único). É o que vai para os jogadores.
├── codigo/               Todo o código do jogo.
│   ├── inicio.ts         Primeiro arquivo que roda: liga o menu e abre o jogo.
│   ├── telas/            Cada tela inteira: menu, missões, treino, arcade, torneio...
│   ├── partes-das-telas/ Pedaços reaproveitados nas telas: bancada MIG, abas, nota...
│   ├── eletrodo/         TUDO do eletrodo revestido (física, peças, 3D, tela, controles).
│   ├── simulacao-mig/    A "física" do MIG/MAG: cordão, fusão, defeitos, juntas, materiais.
│   ├── pontuacao/        Como a nota de 0 a 1000 é calculada.
│   ├── missoes/          Lista de missões do MIG (cliente, junta, requisitos).
│   ├── arcade/           Desafios sorteados e recordes do Arcade.
│   ├── torneio/          Regras dos torneios (sem tela).
│   ├── explicacoes/      Textos didáticos: "por que saiu assim", comparação, exercícios.
│   ├── dispositivos/     Mouse, caneta (mesa digitalizadora) e controle (gamepad).
│   ├── salvamento/       O que fica guardado no navegador: recordes, preferências.
│   ├── desenho-3d/       Cenas 3D do MIG: sala, chapas, tocha, calor, câmera.
│   ├── desenho-2d/       Desenhos 2D: gráficos, corte, desenho técnico da missão.
│   ├── interface/        Base das telas: troca de tela, janelas, botões, som.
│   ├── estilos/          Cores, fontes e layout (arquivos .css, numerados na ordem).
│   └── imagens-e-fontes/ Arquivos originais da ilustração e da fonte.
├── testes/               Testes automáticos (um arquivo por assunto).
├── documentacao/         Hipóteses do modelo, pontuação, missões, verificações.
├── ferramentas/          Script que gera o jogo portátil.
├── index.html            Página que carrega o jogo.
└── package.json          Nome, versão e comandos do projeto.
```

Regra geral do projeto: **a simulação calcula, o desenho só mostra.** Nada em
`desenho-3d/` ou `desenho-2d/` muda a nota; a nota só depende de
`simulacao-mig/` e `pontuacao/`.

---

## 4. Receitas: mudanças comuns

> Dica: para achar onde um texto da tela está no código, copie a frase e use
> **Ctrl+Shift+F** no VS Code.

### Mudar um texto que aparece na tela
Os textos ficam entre aspas no arquivo da tela. Exemplo, no treino de
eletrodo: [`codigo/eletrodo/tela-do-treino.ts`](codigo/eletrodo/tela-do-treino.ts),
procure `mensagens` (estado do arco) ou `TEXTO_FAIXA` (medidor do arco).
Troque só o que está **entre as aspas**.

### Criar ou mudar uma peça do treino de eletrodo
Arquivo [`codigo/eletrodo/pecas-de-treino.ts`](codigo/eletrodo/pecas-de-treino.ts).
Cada peça é um bloco entre `{ }` dentro de `PECAS_ELETRODO`. Para criar uma,
copie um bloco inteiro (do `{` até o `},`), cole logo abaixo e troque:
`id` (único, sem espaço), `titulo`, `aplicacao`, `porque`, `junta`
(`'topo'`, `'v'`, `'t'`, `'sobreposta'` ou `'canto'`), `espessuraMm`,
`diametroMm` (`2.5` ou `3.2`), `correnteA`, `inicioMm`/`fimMm` e `objetivo`.
Ela aparece sozinha no Treino → Eletrodo revestido.

### Ajustar a "física" do eletrodo
Arquivo [`codigo/eletrodo/arco-e-vareta.ts`](codigo/eletrodo/arco-e-vareta.ts), no começo:
- `VARETA15`: tamanho da vareta (`inicialMm`), toco que sobra (`reservaMm`),
  distância de contato e arco máximo.
- `ARCO15`: quanto o arco aguenta esticado e o tempo para reacender a quente.
- `RISCO15`: abrir o arco riscando.

Depois rode `npm test`: alguns testes conferem essas regras e podem precisar
de ajuste se a mudança for intencional.

### Mudar a nota do eletrodo
Arquivo [`codigo/eletrodo/placar-do-eletrodo.ts`](codigo/eletrodo/placar-do-eletrodo.ts):
a lista `itens` dentro de `avaliarEletrodo` tem o máximo de cada critério
(união 300, preenchimento e perfil 400, metal na região 150, continuidade 150;
soma 1000) e `penalidadeEscoria` o desconto pela escória. Explicação em
[`documentacao/AVALIACAO-SMAW.md`](documentacao/AVALIACAO-SMAW.md).

### Mudar a lista de defeitos do eletrodo
- Textos (nome, causa, "como corrigir"): `TEXTO` em
  [`codigo/eletrodo/defeitos-do-eletrodo.ts`](codigo/eletrodo/defeitos-do-eletrodo.ts).
- Limites (quanto calor é falta de fusão, arco longo que dá poro...): `LIMITES` em
  [`codigo/eletrodo/analise-do-cordao.ts`](codigo/eletrodo/analise-do-cordao.ts).
- Calor de referência de cada peça: `aporteAlvoKJmm` em `pecas-de-treino.ts`.

Depois rode `npm test` (os testes `eletrodo-defeitos` conferem a calibração).

### Mudar as teclas padrão do eletrodo
Arquivo [`codigo/eletrodo/controles-salvos.ts`](codigo/eletrodo/controles-salvos.ts),
em `TECLAS15` (ex.: `aproximar: 'KeyS'`). Os nomes seguem o padrão do
navegador: `KeyA`…`KeyZ`, `Digit0`…`Digit9`, `Space`, `ArrowUp`…

### Mudar ou criar uma missão do MIG
Arquivo [`codigo/missoes/lista-de-missoes.ts`](codigo/missoes/lista-de-missoes.ts),
lista `MISSOES`. Veja também [`documentacao/MISSOES.md`](documentacao/MISSOES.md).

### Ajustar a "física" do MIG
Arquivo [`codigo/simulacao-mig/parametros-do-modelo.ts`](codigo/simulacao-mig/parametros-do-modelo.ts):
todos os números do modelo MIG estão ali, com o código da hipótese (H1, H2...)
explicado em [`documentacao/HIPOTESES.md`](documentacao/HIPOTESES.md).

### Mudar cores
Pasta [`codigo/estilos/`](codigo/estilos/). Cores aparecem como `#e12629`
(vermelho). Os arquivos são carregados na ordem do número: o de número maior
pode sobrescrever o anterior.

### Mudar a nota
Arquivo [`codigo/pontuacao/regras-de-pontuacao.ts`](codigo/pontuacao/regras-de-pontuacao.ts).
Se a regra mudar, troque também `VERSAO_PONTUACAO` (assim recordes antigos não
se misturam com os novos) e atualize [`documentacao/PONTUACAO.md`](documentacao/PONTUACAO.md).

---

## 5. Glossário rápido (para ler o código)

| No código | O que significa |
|---|---|
| `// texto` ou `/* texto */` | Comentário: explicação para pessoas, o computador ignora. |
| `import { x } from './arquivo'` | "Use o `x` que foi criado em outro arquivo." |
| `export` | "Este nome pode ser usado por outros arquivos." |
| `const nome = valor` | Cria um nome para um valor que não muda. |
| `let nome = valor` | Cria um nome para um valor que pode mudar. |
| `function fazer(a, b) { ... }` ou `(a, b) => ...` | Uma função: um passo a passo que recebe valores e devolve um resultado. |
| `if (condição) { ... } else { ... }` | "Se... senão..." |
| `{ chave: valor, ... }` | Um objeto: um conjunto de informações com nomes. |
| `[a, b, c]` | Uma lista. |
| `interface` / `type` | Descreve o formato de um objeto (quais campos ele tem). Não roda nada. |
| `class` | Um "molde" de objeto com dados e funções juntos (ex.: `Acionamento15`). |
| `: number`, `: string`, `: boolean` | Tipo do valor: número, texto, verdadeiro/falso. |
| `'texto'`, `` `texto ${x}` `` | Textos. Com crase e `${x}`, o valor de `x` entra no meio do texto. |
| `h('button', {...}, 'Salvar')` | Cria um elemento da tela (aqui, um botão "Salvar"). |
| `Mm`, `S`, `A` no fim de um nome | Unidade: milímetros, segundos, ampères (ex.: `distanciaMm`). |
| `H59`, `H72`... nos comentários | Código da hipótese do modelo, explicada em `documentacao/`. |
| Nome terminado em `15` | Criado na v1.5 para o eletrodo (ex.: `Acionamento15`). |

---

## 6. Cuidados

1. **Rode `npm test` depois de mudar algo.** Não apague testes para "passar":
   se um teste falha, ele mostra uma regra que mudou.
2. **Não mude os nomes de onde os dados ficam salvos** (`CHAVE_CONTROLES15`,
   `PREFIXO` e os nomes das coleções em `codigo/salvamento/`): os recordes e
   preferências dos jogadores deixariam de aparecer.
3. **Os números do modelo são didáticos**, não de norma nem de fabricante.
   Mudou uma regra? Registre em `documentacao/HIPOTESES.md`.
4. O jogo precisa continuar funcionando **offline, num HTML único**: não
   adicione bibliotecas novas sem necessidade.

Instruções para os agentes de IA (GPT e Claude): [`AGENTS.md`](AGENTS.md).
