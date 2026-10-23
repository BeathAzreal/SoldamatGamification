# Verificação

## Alpha v1.3 — mecânica técnica (branch `claude/v1.3`)

- `npm run typecheck` e `npm test` antes de cada commit; o resultado final
  está no fim desta seção.
- Novo `tests/referencia.test.ts` (caso de referência de HIPOTESES.md):
  metal, corrente e potência na referência; alimentação, tensão, DBCP,
  diâmetro, velocidade e técnica (cada um mexendo só no que deve);
  conservação de metal; tocha parada depositando e aquecendo; pausa sem
  salto (H49); arco fora da peça sem aquecer; 30, 60 e 144 quadros/s;
  limites da DBCP e preparo antigo sem DBCP; nota e relatório iguais no
  replay e ao vivo; buraco no cordão na pontuação v2.
- `tests/arcade.test.ts`: o teste "técnicas puxando e empurrando" passa a
  experimentar os diâmetros de arame da missão (o desafio só trava a
  técnica). Com a corrente revista, arame de 1,2 mm no inox de 2 mm perfura
  em qualquer alimentação; com 0,8 mm há solução.
- Cordão alto demais no 3D: era o exagero vertical de 3× do topo reto.
  Agora a solda e o resultado começam em 1× (escala real), conferido no
  navegador.
- Fresta do topo reto (H18 revista): o metal enche a fresta antes do
  reforço. `CONTEXTO_PADRAO` passou a ter abertura 0 (modelo das etapas
  1–4, cordão sobre chapa), então os testes daquelas etapas seguem iguais;
  testes novos em `tests/juntas.test.ts`. A didática (área do GPT) usa
  largura ∝ √área e fica aproximada no topo com abertura: ver
  `docs/NOTAS-PARA-GPT.md`.
- Pontuação `pontuacao-v3` (0–1000, notas graduadas): testes novos em
  `tests/referencia.test.ts` (escala, nota graduada da largura, reinícios
  e metal fora do trecho); `tests/torneio.test.ts` e `tests/dados.test.ts`
  ajustados à escala de 1000. No navegador: placar "/ 1000" com notas
  inteiras, nomes novos das categorias e a aba "Execução" da explicação,
  em 1366×768 e 1280×720, sem rolagem.
- Pendências: mesa digitalizadora e controle físicos não testados; os
  números do jogo seguem sem validação experimental (só a direção das
  relações tem fonte).

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

- Regressões adicionadas em tests/revisao-gpt.test.ts: pausa longa e
  repetida sem alteração térmica, temporal ou de metal; replay compacto;
  média de torneio antigo; bloqueio de mistura de versões sem mutar dados;
  magnitude de borda no topo e margem de filete; aberturas planejadas;
  explicação e comparação de juntas com fresta.
- Os objetos simulados em tests/torneio.test.ts agora usam a versão atual
  ao representar tentativas de torneios novos. O caso legado tem teste próprio.
- Atualizadas as asserções de versão de tests/referencia.test.ts para v4.
- A revisão visual em 1280×720 e 1366×768 permanece pendente: o navegador
  integrado não acessa o servidor local deste ambiente.
- Esta entrega atualiza código e documentação. O portátil e o ZIP
  previamente publicados não foram substituídos.

Validação final: TypeScript, 305 testes em 24 arquivos e build de produção aprovados.
