# Pontuação automática — versão `pontuacao-v1`

A pontuação é uma **proposta didática**. Ela só mede o que o modelo do jogo
calcula (ver [HIPOTESES.md](HIPOTESES.md)). Nenhum item é medido por
aparência da imagem: tudo vem dos números do modelo.

Escala de 0 a 100, com pesos padrão:

| Categoria | Peso padrão |
|---|---|
| Integridade da junta prevista pelo modelo | 40 |
| Atendimento ao desenho | 25 |
| Regularidade do cordão | 15 |
| Controle de deformação | 10 |
| Eficiência | 10 |

Os pesos podem ser mudados **antes** de um torneio começar (somando 100). O
Arcade usa sempre os pesos padrão. Cada resultado guarda os pesos e a versão
das regras usados naquele momento.

## Por que todas as categorias puderam ser mantidas

Antes da etapa 5 o modelo não tinha calor, fusão nem deformação, e as
categorias "integridade" e "deformação" não teriam o que medir. A etapa 5
acrescentou o aporte relativo, o aquecimento acumulado, o índice de fusão
sintético (H31–H34) e o índice de deformação (H36). Por isso a distribuição
40/25/15/10/10 foi mantida — mas cada categoria só usa esses índices, e
todos são aproximações didáticas.

## Trecho avaliado

Cada missão define um **trecho exigido** (por exemplo, de 10 a 140 mm). A
integridade, a largura, o reforço, o alinhamento e a regularidade são
medidos no trecho exigido **menos 2 mm em cada ponta** (H37).

## Categorias

### Integridade da junta prevista pelo modelo (40)

- **Definição:** fração do trecho avaliado em que o modelo prevê uma junta
  íntegra.
- **Dados usados:** largura, centro e seção do cordão em cada posição;
  aporte relativo e aquecimento acumulado (H31, H32); espessura, material,
  gás e limpeza (H33, H35).
- **Regra:** uma posição é íntegra quando (1) há cordão (largura ≥ 1 mm),
  (2) o cordão cobre as duas bordas da junta (H34) e (3) o índice de fusão F
  está entre 1 e 2 (H33). Pontos = peso × fração de posições íntegras.
- **Limitações:** o índice F é **sintético**. Não representa porosidade,
  trincas, inclusões, diluição nem penetração real.
- **Explicação no jogo:** lista os trechos com "falta de fusão prevista",
  "fusão excessiva prevista", "perfuração prevista", "borda não coberta" ou
  "sem cordão".

### Atendimento ao desenho (25)

- **Definição:** quanto o cordão obedece às medidas e tolerâncias do desenho
  da missão.
- **Dados usados:** extensão, largura, altura (reforço) e centro do cordão.
- **Regra:** quatro partes, cada uma uma fração de 0 a 1:
  extensão (7/25) = fração do trecho exigido com cordão;
  largura (8/25) = fração do trecho avaliado com largura dentro da faixa;
  reforço (5/25) = fração com altura até o máximo;
  alinhamento (5/25) = fração com o centro a até a tolerância da linha da junta.
- **Limitações:** as tolerâncias são **objetivos didáticos do jogo**, não
  requisitos de norma. A largura e a altura vêm do modelo de forma (H3, H9).
- **Explicação no jogo:** mostra cada parte com a fração atendida.

### Regularidade do cordão (15)

- **Definição:** constância da largura ao longo do trecho avaliado.
- **Dados usados:** coeficiente de variação da largura (H15).
- **Regra:** pontos = peso × (0,20 − variação) ÷ 0,17, limitado entre 0 e o
  peso. Variação de até 3 % ganha tudo; 20 % ou mais, nada.
- **Limitações:** o espalhamento numérico (H4) alisa oscilações menores que
  uns 2 mm.
- **Explicação no jogo:** a variação em % e a ligação com a velocidade.

### Controle de deformação (10)

- **Definição:** quanto calor além do necessário foi colocado, ponderado pela
  tendência do material a deformar.
- **Dados usados:** índice D (H36).
- **Regra:** pontos = peso × (2 − D), limitado entre 0 e o peso.
- **Limitações:** não há medida de empenamento, só um índice.
- **Explicação no jogo:** o valor de D e a comparação com 1 e 2.

### Eficiência (10)

- **Definição:** aproveitamento do metal e do tempo de arco.
- **Dados usados:** rendimento η (H29) e fração do tempo de arco com a tocha
  dentro do trecho exigido (com 5 mm de folga) e a até 10 mm da junta.
- **Regra:** metade para o metal: (η − 0,85) ÷ 0,15; metade para o tempo:
  (fração − 0,70) ÷ 0,30; cada metade limitada entre 0 e 1.
- **Limitações:** η é aproximação (respingo por gás e por desequilíbrio).
- **Explicação no jogo:** η e a fração de tempo bem usado.

## Condições essenciais (aprovação)

Cada missão lista suas condições essenciais. As usadas na v1:

| Código | Condição | Aprendiz | Profissional |
|---|---|---|---|
| E1 | Integridade prevista no trecho avaliado | ≥ 85 % | ≥ 95 % |
| E2 | Nenhuma perfuração prevista (F > 2,6 em 1 mm ou mais) | sim | sim |
| E3 | Cordão contínuo no trecho exigido (sem trecho de 1 mm ou mais sem cordão) | sim | sim |
| E4 | Óxido removido antes de soldar (só missões de alumínio) | sim | sim |

**Se alguma condição essencial falhar, a entrega é "não aprovada"** e:

Na tela, a categoria zerada mostra **quanto valeria** (barra tracejada e
"Valeria X — zerada porque a solda não foi aprovada"), e logo abaixo do selo
"Não aprovada" aparece uma dica do motivo mais provável (falta de fusão →
andar mais devagar; perfuração → mais rápido; óxido; trecho sem cordão).
Isso é só apresentação: a regra e o total não mudam (`pontuacao-v1`).

- as categorias **deformação e eficiência ficam zeradas** (penalidade
  registrada com justificativa), para que economia ou rapidez não compensem;
- nos rankings, **toda entrega aprovada fica acima de qualquer não aprovada**,
  qualquer que seja a nota.

## Desempate

Ordem padrão (Arcade e torneios):

1. aprovada antes de não aprovada;
2. maior nota total;
3. maior nota de integridade;
4. maior nota de atendimento ao desenho;
5. menos tentativas usadas (só torneios);
6. registro mais antigo (Arcade).

Em torneios dá para escolher, antes de começar, a variante "desenho antes de
integridade" nos itens 3 e 4.

## Conceito (S, A, B, C, D)

A partir da etapa 6 a tela mostra um **conceito estilo arcade**, que é só uma
forma de apresentar a nota total: S ≥ 95, A ≥ 85, B ≥ 70, C ≥ 50, D abaixo.
Uma entrega **não aprovada fica no máximo com C**, para o conceito não
esconder uma condição essencial descumprida. O conceito não entra em ranking
nem em desempate.

## Arcade (desafios aleatórios)

No modo Arcade, cada desafio usa a pontuação v1 da missão sorteada. O desafio
é **concluído** se a solda for aprovada **e** a condição extra for cumprida
(arco aberto uma só vez; tempo de arco até o limite; técnica exigida; ajustes
pré-definidos sem alteração). Pontos do desafio = nota × multiplicador do
combo (1 + 0,25 por acerto seguido, até ×2). Desafio não concluído: zero
pontos, perde uma vida, combo zera. Regras: `arcade-v1`
(`src/arcade/desafios.ts`); um teste garante que toda condição sorteável tem
solução.

## Versão das regras

Todo resultado guarda `versaoPontuacao: "pontuacao-v1"`, os pesos e o
detalhamento. Se as regras mudarem, a versão muda; resultados antigos **não
são recalculados**, e os rankings separam versões diferentes.
