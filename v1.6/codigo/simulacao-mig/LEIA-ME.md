# Simulação MIG/MAG

A "física" didática do MIG/MAG: como os ajustes e o movimento formam o cordão, a fusão prevista e os defeitos visíveis. Aqui não há desenho nem tela: só contas. Todos os números ficam em parametros-do-modelo.ts.

| Arquivo | O que é |
|---|---|
| [`analise-do-movimento.ts`](analise-do-movimento.ts) | Análise do movimento — Divide a junta em trechos de 5 mm e calcula quanto tempo a tocha passou em cada um e com que velocidade. |
| [`cordao.ts`](cordao.ts) | Cordão de solda — Guarda o cordão em fatias ao longo da junta: quanto metal cada fatia recebeu, largura, altura e cordões soltos fora da junta. |
| [`defeitos.ts`](defeitos.ts) | Defeitos visíveis previstos — Calcula gotejamento, mordedura, sobreposição, respingos, cratera, porosidade, escamas e empeno a partir da tentativa. |
| [`fusao.ts`](fusao.ts) | Fusão prevista — Índice sintético que diz se faltou calor, se ficou adequado ou se passou do ponto (perfuração), posição por posição. |
| [`linha-da-junta.ts`](linha-da-junta.ts) | Linha da junta — Converte posições na chapa para "ao longo da junta" e "desvio lateral", e de volta. |
| [`materiais-e-gases.ts`](materiais-e-gases.ts) | Materiais e gases — Aço carbono, inox e alumínio; os gases de proteção; e quais combinações são compatíveis. |
| [`medidas-do-cordao.ts`](medidas-do-cordao.ts) | Medidas do cordão — Mede largura, altura, alinhamento e regularidade do cordão no fim da tentativa. |
| [`parametros-do-modelo.ts`](parametros-do-modelo.ts) | Números do modelo MIG — Todos os números do modelo didático MIG reunidos num só lugar (tamanho da peça, faixas, coeficientes). Nenhum vem de norma. |
| [`percurso-da-tocha.ts`](percurso-da-tocha.ts) | Percurso da tocha — Registra, posição por posição, o tempo e o calor que a tocha levou com o arco aberto. |
| [`regulagem-da-maquina.ts`](regulagem-da-maquina.ts) | Regulagem da máquina MIG — Como tensão, alimentação, arame, gás, técnica e distância bico–peça mudam o cordão (largura, altura, equilíbrio do arco). |
| [`reproduzir-tentativa.ts`](reproduzir-tentativa.ts) | Reproduzir tentativa (replay) — Refaz uma tentativa a partir do registro salvo; o resultado é idêntico ao original. |
| [`simulacao.ts`](simulacao.ts) | Simulação MIG (o coração do jogo MIG) — A cada instante, lê a posição da tocha, deposita metal no cordão, acumula calor e registra os eventos da tentativa. Não depende da velocidade do computador. |
| [`tipos-de-junta-e-posicao.ts`](tipos-de-junta-e-posicao.ts) | Tipos de junta e posição — As juntas (topo, V, T, sobreposta, canto), a forma das chapas em corte e a posição de soldagem (plana, vertical, sobrecabeça) com o efeito da gravidade. |
| [`trajetoria.ts`](trajetoria.ts) | Trajetória — Pequenas contas sobre as leituras de posição da tocha (onde ela estava num instante). |
| [`velocidade-da-tocha.ts`](velocidade-da-tocha.ts) | Velocidade da tocha — Estima a velocidade de avanço da tocha, suavizada, para o mostrador da tela. |
