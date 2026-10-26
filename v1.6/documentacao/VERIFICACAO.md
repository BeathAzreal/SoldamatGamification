# Verificação

## v1.6 — interface e eletrodo da alpha-v1.6 + lista de defeitos (branch `claude/v1.6-ui-gpt`)

A pasta v1.6 tinha sido reorganizada a partir da alpha-v1.5 e não trazia o que o GPT fez na alpha-v1.6 (interface de máquina, menu da oficina, pausa, central do Arcade, depósito real do eletrodo e nota de 0 a 1000). Agora traz.

- Como foi feito: merge da alpha-v1.6 sobre a v1.6 reorganizada, com o git seguindo os arquivos renomeados. Os arquivos novos do GPT ganharam nomes em português e cabeçalho "O que faz / Onde mexer" (tabela em MAPA-v1.5-para-v1.6.md); os imports foram recalculados pelo mapa.
- O código do GPT ficou igual: comparando arquivo por arquivo (sem cabeçalhos e imports), as únicas diferenças são nomes de arquivo citados em comentários e os acréscimos da lista de defeitos (tela do treino, resultado, peças, cena 3D, metal 3D e a passagem da energia do arco em arco-e-vareta.ts, que não muda o depósito).
- Minhas mudanças anteriores que alteravam o eletrodo do GPT foram desfeitas: consumo da vareta (voltou a 3 mm/s), volume depositado (0,7), forma do cordão pela corrente, a nota de 0 a 100 e a medida por peça.
- CSS do build: idêntico ao da alpha-v1.6, mais 7 regras da lista de defeitos (cor do avanço e botão/lista de defeitos).
- Telas comparadas pixel a pixel com a build da alpha-v1.6 (Chromium headless, 1366×768): menu, Arcade, Treino, escolha da peça do eletrodo, bancada do eletrodo, bancada MIG, Recordes, Configurações e pausa: 0% de pixels diferentes.
- Soldagem no navegador (bancada do eletrodo, soldador automático): arco abre ao tocar, Enter encerra, o resultado mostra a nota de 0 a 1000 do GPT e o botão "Defeitos (N)" na mesma linha de "Detalhes da avaliação" (o painel não cresce); a lista abre com lugar, causa e correção; sem a escória, aparecem respingos, cratera e cor de calor sobre o metal. Sem erros no console.
- Testes: `npm test` com 43 arquivos; `testes/eletrodo-defeitos.test.ts` (10 casos, soldador simulado a 60 quadros/s) calibra a lista: técnica boa sem defeitos nas cinco peças; rápido demais → falta de fusão; lento demais → perfuração na raiz aberta ou calor em excesso no filete; arco longo → poros e respingos; sem parar no fim → cratera; vários passes sem limpar a escória fria → inclusão; a lista não muda a nota nem o metal.
- Não testado em aparelhos físicos (mesa digitalizadora, controle, celular).

## v1.6 — reorganização do código (branch `reorganizacao`)

Objetivo: mesmo jogo da v1.5, com pastas e arquivos de nomes intuitivos e
comentários para quem não programa em JavaScript.

- Pastas e arquivos renomeados por um script a partir de uma tabela
  (`MAPA-v1.5-para-v1.6.md`); os imports foram recalculados automaticamente.
  Nomes de funções, classes e variáveis não mudaram.
- Prova de que o jogo não mudou: o build da v1.6 foi comparado com o da v1.5.
  CSS e HTML idênticos byte a byte; o JavaScript difere só em 3 textos:
  "ALPHA / 1.6" no menu, "Controles da bancada v1.6" e o caminho
  `documentacao/HIPOTESES.md` no painel Modelo didático.
- TypeScript e 404 testes aprovados (os mesmos da v1.5).
- Portátil aberto direto do arquivo (Chromium sem interface): menu com
  ALPHA / 1.6, treino de eletrodo e treino livre MIG carregando sem erros.

## Alpha v1.5 — treino de eletrodo após o teste do dono (branch `claude/v1.5`)

Pedido: controle de altura ruim (o arco apagava e era preciso soldar aos poucos), menu
organizado (sem protótipo no topo, escolha MIG/MAG ou eletrodo no Treino), sem botão para
soldar (abrir ao tocar a peça) e peças que fazem sentido para eletrodo.

- Simulação a 60 quadros/s com jogador de reação 0,2 s (testes/eletrodo-refino-e-jogabilidade.test.ts): com a
  ajuda parcial, arco aceso > 97% do tempo a vareta inteira, sem grudar, ~0,4–0,7 toque/s
  em S (80, 100 e 130 A); sem ajuda também foi possível. Toque curto desce 0,2–0,4 mm.
- Navegador (Chromium sem interface, ~3,5 quadros/s), 1366×768: menu sem o atalho do
  protótipo; Treino com o seletor MIG/MAG | Eletrodo revestido e as cinco peças; peça
  "Cordões sobre chapa" com objetivos; filete em T: arco aberto ao tocar, cordão na raiz
  (82% do trecho com uma vareta), escória quebrada e escovada; topo em V 8 mm: 100% do
  trecho coberto, sem grudar, raiz visível após a limpeza.
- Corrigido durante o teste: o cordão do eletrodo não conhecia a junta (no filete não
  aparecia na raiz); o ponteiro não encontrava as paredes a 45°; curto com ajuda total
  grudava mesmo sem empurrar.
- Limites: a taxa de quadros do navegador sem interface não permite reproduzir o controle
  manual por toques (o atraso de leitura é de ~0,6 s); esse controle foi verificado pela
  simulação acima. Não testado com pessoas, GPU real, caneta ou gamepad.

## Alpha v1.5 — refino da bancada SMAW (branch `claude/v1.5`)

Conferido no Chromium sem interface (Playwright, ~3,5 quadros/s) com o jogo em
execução local, em 1366×768, 1166×884 e 1024×768:

- Passe completo com eletrodo 2,5 mm a 90 A e compensação assistida: abertura
  por toque e afastamento, arco "adequado" a 2,5 mm, vareta consumida até o toco
  de 25 mm ("Fim da vareta"), cordão coberto por escória contínua (laranja perto
  do arco, escura ao esfriar).
- Limpeza: martelinho deixa resíduos claros; escova retira os resíduos e mostra
  o cordão metálico. Leituras finais: escória 0 mm², resíduos 0 mm².
- Arco longo (4,6 mm): medidor em âmbar com "arco longo", muitos respingos na
  vista e contador de respingos alto (268 contra 10 no arco adequado).
- Modo MIG/MAG: medidor com faixa de 5 a 25 mm; painel sem campos do eletrodo.
- Diálogo de controles com nomes legíveis (S, Espaço).
- Limites: com a taxa de quadros do navegador sem interface, o passe ficou lento
  e o cordão saiu curto; o controle manual de altura (sem compensação) foi
  verificado por testes do modelo, não por partida humana. Não testado em GPU
  real, mesa digitalizadora ou gamepad físico.

Testes: `testes/eletrodo-refino-e-jogabilidade.test.ts` (H68–H70, avanço medido, escória na largura do
cordão, limpeza ao longo do passe, nomes de tecla). TypeScript e todos os
testes aprovados; portátil regenerado.

## Alpha v1.4 — sobrecabeça: inspeção, gotas e layout (branch `claude/v1.4`)

Revisão visual do GPT na v1.4 integrada (três pontos), conferida no Chromium
sem interface (Playwright) com o jogo em execução local:

- **Orientação na inspeção:** a peça agora fica na mesma posição da soldagem
  (rolagem e giro, H47). Antes, a inspeção redesenhava a chapa na posição
  plana e as gotas de sobrecabeça apareciam por cima. Agora é a câmera que
  se move. Em sobrecabeça, a vista inicial e o botão "Olhar a face" (antes
  "Olhar de cima") olham a face por baixo, e a órbita pode descer abaixo da
  peça. Conferido: chapa de cabeça para baixo, gotas penduradas para baixo.
- **Desprendimento das gotas:** a gravidade das partículas passa a vir do
  mundo, convertida para os eixos da peça, e não da peça girada. As gotas
  que se soltam agora têm um corpo sólido (esfera) e cor opaca, em vez de
  pontos aditivos quase invisíveis. Elas nascem onde o gotejamento previsto
  existe perto da tocha (±4 mm). Conferido numa passada lenta em
  sobrecabeça: gota laranja caindo em direção ao piso, abaixo da tocha.
  Limite: no navegador sem interface a taxa de quadros é baixa, então
  aparecem poucas gotas por segundo de tela. Não testado em GPU real.
- **Câmera na execução:** "Centralizar" com a peça inclinada para baixo
  (▲, ângulo negativo) não fazia nada. Agora olha a face (por baixo em
  sobrecabeça), sem deixar as marcas de cabeça para baixo.
- **Sobreposição no resultado:** conferida por medição dos retângulos dos
  blocos da inspeção, das abas e do conteúdo da aba, com a aba Defeitos
  aberta, em 960×720, 1024×768, 1166×884, 1280×720, 1366×768, 1440×900 e
  1920×1080. Resultado: nenhuma sobreposição e página sem rolagem horizontal.
- Ajustes de realismo e textos didáticos anteriores da v1.4 foram mantidos.
  Pontuação inalterada (`pontuacao-v7`).

Validação: TypeScript e 364 testes em 29 arquivos aprovados; build de
produção e portátil regenerados.

## Alpha v1.4 — correções da revisão visual do GPT (branch `claude/v1.4`)

- Preparação em 1280×720: a peça de teste ficava atrás da barra de ações.
  Novo `codigo/estilos/5-espacamento-e-layout.css` (carregado por último): em telas baixas, título
  menor, cabeçalho da peça numa faixa, descrição da junta escondida (está na
  ficha), giro/posição/Centralizar numa linha só (o "Rotação somente X" some e
  fica a posição), altura mínima da peça 150 px e o resumo do passe rolando
  por dentro.
- Inspeção no resultado: a seção da peça encolhia por baixo das abas.
  Agora peça, controles (numa faixa compacta), abas e conteúdo ficam em
  faixas separadas; o conteúdo da aba rola por dentro e, se faltar altura, o
  cartão rola.
- Corrimão da rampa (peça de pé): a câmera começava de cima e via as bordas.
  A câmera inicial e o "Centralizar" agora sobem a elevação igual ao
  tombamento da peça (de frente para a face da junta); a posição física da
  peça e os limites da câmera não mudaram.
- Condição essencial E2: "Nenhuma perfuração prevista" virou "Evitar
  perfuração" (a evidência continua na justificativa).
- Cordão esticado em lâminas ao soldar de novo longe do primeiro (relato do
  dono, junta em T na horizontal): o segundo passe entrava na mesma fatia e o
  modelo usava um centro médio com espalhamento enorme. Agora vira um cordão
  solto (H58), com malha própria sobre a chapa ou a parede. Testes novos em
  `testes/soltos.test.ts`; conferido em 3D (T com passes na raiz, na alma e na
  base; topo com um passe a 22 mm). Pontuação `pontuacao-v7`.
- Conferido no navegador em 1280×720 e 1366×768: preparação → tentativa →
  resultado (abas Largura, Corte e Defeitos) → Treinar de novo; corrimão na
  preparação e na execução.

## Alpha v1.4 — defeitos visíveis (branch `claude/v1.4`)

- Novo `testes/defeitos.test.ts` (19 testes): referência sem defeitos;
  cratera ao fechar andando, cheia parando 400 ms e coberta por outro passe;
  gotas na sobrecabeça (e não na plana); escorrimento e sobreposição na
  vertical descendente; caimento, mordedura em cima e sobreposição embaixo na
  horizontal; mordedura com arco longo; sobreposição devagar com arco curto;
  respingos (mistura < CO₂ < CO₂ desequilibrado); porosidade (alumínio sujo,
  DBCP 20); empeno com mais calor; escamas mais juntas devagar; os mesmos
  defeitos no replay e com quadros de 7 e 33 ms; pontuação v6 (superfície,
  porosidade na fusão, essenciais iguais, cratera barata).
- No navegador (página de teste temporária, fora do repositório, em
  1400×800): referência lisa com escamas; gotas penduradas na sobrecabeça;
  ondas na vertical; borda de cima mordida e cordão caído na horizontal;
  mordedura e respingos com arco longo; respingos com CO₂ e arco curto;
  sobreposição devagar; cores do inox (palha → roxo → azul); poros abertos
  no alumínio sujo (junta em T); cratera afundada × ponta cheia parando.
- Na bancada: poça viva maior e para trás do avanço durante o passe; linha
  "Defeitos visíveis" no resumo do passe. No resultado do treino: aba
  "Defeitos" com a lista e o conselho, empeno de 3,5° na peça 3D e o corte.
- Erros achados e corrigidos: falsa mordedura na referência (regra de calor
  começava em F = 1,2; agora acima do adequado, F = 2); faixas de oxidação
  escondidas sob a chapa (altura pequena demais para a profundidade e, na
  inspeção, a chapa empenada passava por cima: agora as faixas acompanham o
  empeno).
- **Não testado**: queda de gotas do arco na sobrecabeça ao vivo (o giro da
  bancada é por tempo de botão e o navegador de teste é lento demais para
  chegar a 180°); mesa digitalizadora e controle físicos.

## Alpha v1.3 — mecânica técnica (branch `claude/v1.3`)

- `npm run typecheck` e `npm test` antes de cada commit; o resultado final
  está no fim desta seção.
- Novo `testes/referencia.test.ts` (caso de referência de HIPOTESES.md):
  metal, corrente e potência na referência; alimentação, tensão, DBCP,
  diâmetro, velocidade e técnica (cada um mexendo só no que deve);
  conservação de metal; tocha parada depositando e aquecendo; pausa sem
  salto (H49); arco fora da peça sem aquecer; 30, 60 e 144 quadros/s;
  limites da DBCP e preparo antigo sem DBCP; nota e relatório iguais no
  replay e ao vivo; buraco no cordão na pontuação v2.
- `testes/arcade.test.ts`: o teste "técnicas puxando e empurrando" passa a
  experimentar os diâmetros de arame da missão (o desafio só trava a
  técnica). Com a corrente revista, arame de 1,2 mm no inox de 2 mm perfura
  em qualquer alimentação; com 0,8 mm há solução.
- Cordão alto demais no 3D: era o exagero vertical de 3× do topo reto.
  Agora a solda e o resultado começam em 1× (escala real), conferido no
  navegador.
- Fresta do topo reto (H18 revista): o metal enche a fresta antes do
  reforço. `CONTEXTO_PADRAO` passou a ter abertura 0 (modelo das etapas
  1–4, cordão sobre chapa), então os testes daquelas etapas seguem iguais;
  testes novos em `testes/juntas.test.ts`. A didática (área do GPT) usa
  largura ∝ √área e fica aproximada no topo com abertura: ver
  `documentacao/NOTAS-PARA-GPT.md`.
- Cordão "dentro da chapa" com listras no 3D (relato do dono): na junta de
  topo com abertura, o modelo mandava o metal para a fresta mesmo com o
  cordão longe dela e desenhava o metal abaixo da face. Agora só o trecho
  da fresta embaixo do cordão é enchido; fora dela o cordão fica sobre a
  chapa. Teste novo em `testes/juntas.test.ts` (falhava antes da correção);
  no navegador, passe em zigue-zague fora da fresta sem listras e com a
  previsão "borda".
- Pontuação `pontuacao-v3` (0–1000, notas graduadas): testes novos em
  `testes/referencia.test.ts` (escala, nota graduada da largura, reinícios
  e metal fora do trecho); `testes/torneio.test.ts` e `testes/dados.test.ts`
  ajustados à escala de 1000. No navegador: placar "/ 1000" com notas
  inteiras, nomes novos das categorias e a aba "Execução" da explicação,
  em 1366×768 e 1280×720, sem rolagem.
- Pendências: mesa digitalizadora e controle físicos não testados; os
  números do jogo seguem sem validação experimental (só a direção das
  relações tem fonte).

## Exercícios técnicos orientados — GPT

Adicionados três roteiros ao treino (avanço, alimentação e tensão), com
consulta na preparação e no resultado. Reutilizam a comparação existente;
não alteram a física, a pontuação nem os dados persistidos.

Verificação nesta alteração:
- TypeScript: aprovado.
- Vitest: 22 arquivos, 278 testes aprovados.
- Build de produção: aprovado.
- Navegador: tentativa de acesso à prévia local bloqueada pelo ambiente.
  Pendentes a navegação manual e a conferência em 1280×720 e 1366×768.
- Portátil regenerado na integração da `alpha-v1.3` (inclui estes roteiros).

## Etapa 6 (21/10/2026): bancada, História, Arcade aleatório, técnica, visual

- `npm run build`: sem erros. `npm test`: **127 testes em 10 arquivos, todos
  passando** (novos: técnica puxando/empurrando; geração de desafios
  determinística; toda condição do Arcade com solução em todas as missões e
  níveis; avaliação das condições e combo; recordes do Arcade).
- No navegador: menu novo (atalhos 1–6); bancada nas Configurações com passe
  na peça de teste e resumo do passe; História (capítulos, bloqueios, ficha,
  bancada, tentativa oficial "puxando" com conceito S, abas da inspeção);
  Arcade (desafio aprovado com combo, três abandonos até o fim de jogo,
  condição "contra o relógio", recorde salvo e na aba Arcade de Recordes);
  bancada dentro de um torneio; tela de celular sem rolagem horizontal.
- Erro encontrado e corrigido: a bancada herdava o gás da missão anterior
  (Arcade e rodadas de torneio com materiais diferentes) e travava.
- **Controle real:** depois da correção do índice do gamepad (o jogo agora usa o
  controle conectado em qualquer posição da lista), o usuário testou com o
  próprio controle e **funcionou** (21/10/2026). Tipo de conexão e navegador
  não registrados.
- Continua **não testado** com hardware real: mesa digitalizadora e mouse em
  partida longa.

## Etapa 5

Registro do que foi conferido na etapa 5 (Arcade, torneios, julgamento,
materiais, dispositivos) — em 20/10/2026.

## Compilação e testes automáticos

- `npm run build` (TypeScript estrito + Vite): sem erros.
- `npm test` (Vitest): **95 testes em 9 arquivos, todos passando**.

| Arquivo | O que garante |
|---|---|
| `simulacao.test.ts` | Cordão igual com 0, 30, 60 e 144 quadros/s; balanço de massa |
| `processo.test.ts` | Tensão, alimentação, equilíbrio, trava dos ajustes com arco aberto |
| `avaliacao.test.ts`, `explicacao.test.ts` | Avaliação e explicação do modo original (etapas 3–4) |
| `fusao.test.ts` | Índice de fusão sintético nas faixas certas; amortecimento; borda descoberta; **aquecimento acumulado independente dos quadros**; alumínio diferente do aço; limpeza do óxido; inox deforma mais; **replay idêntico** ao original |
| `missoes.test.ts` | Só gases compatíveis; combinações recusadas; missões planejadas não jogáveis; processo, junta, tipo e posição separados; **cada missão tem solução aprovável nas duas dificuldades** |
| `torneio.test.ts` | **Alternância dos jogadores e avanço de rodadas** (rodízio); **limite de tentativas**; entregar antes do limite; ação fora da vez recusada; **entrega duplicada recusada**; tentativa interrompida conta e não é entregue; conclusão duplicada recusada; **regras de entrega** (última, melhor, escolhida; aprovada vence nota maior); **regras bloqueadas** e duplicação; dispositivo exigido e mantido; **classificação e desempates**; classificação por dispositivo; **anonimato** (lista e evidências sem nome nem id; **nota automática oculta antes da avaliação inicial**); "não avaliado"; **publicação só com tudo avaliado**; **histórico de revisões** (anterior, novo, data, motivo) e recálculo após publicação; média ponderada |
| `dados.test.ts` | **Nome salvo no recorde** (normalizado); **persistência após "recarregar"**; rankings separados por missão, dificuldade e dispositivo; novo recorde; exportação/importação com validação; migração de dados sem versão; recuperação de dados corrompidos; versão futura recusada; registro compacto preserva o replay; **treino separado das tentativas oficiais** no Arcade |
| `entrada.test.ts` | Zona morta e curva; **trajetória do controle independente da taxa de quadros**; sensibilidade; desconexão fecha o arco e pede pausa; reconhecimento do mapeamento padrão |

## Percurso no navegador (pane do Claude, Chromium)

Gestos de mouse simulados com eventos de ponteiro; telas acionadas por
clique e por teclado.

1. **Partida Arcade com registro de nome** — apelido digitado, missão
   "Suporte de prateleira" (Aprendiz), ficha com desenho, preparação
   (treino/oficial, botão oficial só após a confirmação), tentativa oficial
   (99,0, aprovada), entrega com confirmação, pontuação final, nome editado
   para "  Vic   Neves  " e salvo como "Vic Neves", tela "NOVO RECORDE!".
   Depois de **recarregar a página**: recorde na tela de Recordes, nome
   lembrado e progressão liberada (Profissional e a missão seguinte).
2. **Torneio automático com dois participantes** (2 rodadas, regra "melhor",
   rodízio) — vez de Ana, vez de Bruno com duas tentativas (a melhor foi
   entregue), passagem de turno sem dados, Bruno abriu a rodada 2.
   **Recarregamento no meio de uma tentativa oficial**: ela virou
   "interrompida", contou no limite e apareceu aviso. Classificação geral
   com desempate por menos tentativas.
3. **Torneio com professor, incluindo revisão** — dois participantes; lista
   de julgamento só com códigos; evidências sem nomes; pontuação automática
   oculta até confirmar a avaliação inicial; publicação bloqueada com uma
   entrega pendente; publicação; classificação pela nota final do professor
   com a automática como referência; **revisão da nota final após a
   publicação** (8 → 9,5, com motivo), registrada no histórico, com a
   classificação recalculada (a ordem mudou).

Também conferidos (na época): o Treino livre no modo original (removido na
etapa 8, substituído pela bancada com a peça padrão); treino de missão no alumínio (tela de execução, aquecimento,
brilho fraco do alumínio, faixa de velocidade); Configurações e teste de
dispositivo; atalho de teclado do menu; layout em largura de celular (sem
rolagem horizontal da página).

Erro encontrado e corrigido durante o percurso: o corte sintético tentava
desenhar com raio negativo quando o gráfico ainda não tinha largura.

## O que NÃO foi possível testar

- **Controle de PlayStation 4 real** (cabo ou Bluetooth) e qualquer gamepad
  físico: a lógica foi testada com um controle simulado. Mapeamento,
  detecção, desconexão e pausa precisam de teste com o hardware.
- **Mesa digitalizadora real**: pressão, inclinação e gatilho por pressão só
  foram verificados no código; a caneta não foi usada.
- **Mouse real** numa partida inteira: os gestos foram simulados; a sensação
  de controle (velocidade confortável, precisão) precisa de teste com pessoas.
- **Equivalência competitiva entre dispositivos**: não testada; por isso o
  padrão do torneio é separar a classificação por dispositivo.
- **Navegadores além do Chromium** (Firefox, Safari) e dispositivos de toque.
- **Limite de espaço do localStorage** em torneios longos (cada tentativa
  oficial guarda seu registro de eventos; tipicamente dezenas de kB).
- **Validação física** das hipóteses H27–H36 em livro-texto (ver HIPOTESES).

## Correções da revisão técnica pelo GPT (2026-10-23)

- Regressões adicionadas em testes/revisao-gpt.test.ts: pausa longa e
  repetida sem alteração térmica, temporal ou de metal; replay compacto;
  média de torneio antigo; bloqueio de mistura de versões sem mutar dados;
  magnitude de borda no topo e margem de filete; aberturas planejadas;
  explicação e comparação de juntas com fresta.
- Os objetos simulados em testes/torneio.test.ts agora usam a versão atual
  ao representar tentativas de torneios novos. O caso legado tem teste próprio.
- Atualizadas as asserções de versão de testes/referencia.test.ts para v4.
- A revisão visual em 1280×720 e 1366×768 permanece pendente: o navegador
  integrado não acessa o servidor local deste ambiente.
- Esta entrega atualiza código e documentação. O portátil e o ZIP
  previamente publicados não foram substituídos.

Validação final: TypeScript, 305 testes em 24 arquivos e build de produção aprovados.
