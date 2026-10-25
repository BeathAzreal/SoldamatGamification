# Base da interface

O que todas as telas usam: troca de tela (aplicativo.ts), criação de elementos (h), janelas de diálogo e som.

| Arquivo | O que é |
|---|---|
| [`aplicativo.ts`](aplicativo.ts) | Aplicativo (o "esqueleto" do jogo) — Guarda os dados carregados do navegador (recordes, torneios, preferências) e troca de uma tela para outra com app.ir(...). Também marca no menu lateral qual seção está aberta. |
| [`criar-elementos.ts`](criar-elementos.ts) | Ferramentas para montar telas — Contém h(), a função usada em todo o jogo para criar botões, textos e caixas sem escrever HTML; e funções para formatar números (n0, n1) e datas. |
| [`janelas-de-dialogo.ts`](janelas-de-dialogo.ts) | Janelas de diálogo — Janelas que aparecem por cima da tela: confirmar (Sim/Não), avisar, pedir um texto e o painel de informações. |
| [`som-do-arco.ts`](som-do-arco.ts) | Som do arco — Gera o chiado do arco elétrico no próprio navegador (sem arquivo de áudio). Fica mais forte ou instável conforme o arco. |
