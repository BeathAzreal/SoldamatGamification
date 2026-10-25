# Salvamento

O que fica guardado no navegador do jogador: recordes, preferências, participantes e registros das tentativas. Cuidado: mudar nomes de chaves faz os dados antigos sumirem.

| Arquivo | O que é |
|---|---|
| [`armazenamento-no-navegador.ts`](armazenamento-no-navegador.ts) | Salvamento no navegador — Grava e lê os dados do jogo no próprio navegador (localStorage), com versão, e guarda à parte dados corrompidos. |
| [`participantes.ts`](participantes.ts) | Participantes — Perfis de jogadores do Arcade e dos torneios, e o progresso nas missões. |
| [`preferencias.ts`](preferencias.ts) | Preferências — Escolhas deste navegador: dispositivo, calibração, controles, som e último nome usado. |
| [`recordes-das-missoes.ts`](recordes-das-missoes.ts) | Recordes das missões — Rankings por missão, dificuldade, dispositivo e versão da pontuação. |
| [`registro-compacto.ts`](registro-compacto.ts) | Registro compacto da tentativa — Versão compacta dos eventos de uma tentativa, para salvar sem ocupar muito espaço; o replay e a nota usam esta forma. |
