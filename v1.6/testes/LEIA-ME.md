# Testes automáticos

Cada arquivo `.test.ts` confere regras do jogo sem abrir a tela. Rode todos com `npm test` (na pasta v1.6).

- Os testes do eletrodo começam com `eletrodo-`.
- Se um teste falhar depois de uma mudança, leia a mensagem: ela diz qual regra mudou. Não apague o teste; ajuste-o só se a mudança foi de propósito.
- `utilidades-dos-testes.ts` tem funções de apoio usadas por vários testes.
