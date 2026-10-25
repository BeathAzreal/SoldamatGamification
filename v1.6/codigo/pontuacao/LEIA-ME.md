# Pontuação

Como a tentativa vira nota de 0 a 1000 e o relatório que a explica. Regras em ../../documentacao/PONTUACAO.md.

| Arquivo | O que é |
|---|---|
| [`pontuar-tentativa.ts`](pontuar-tentativa.ts) | Pontuar uma tentativa — Refaz a tentativa a partir do registro salvo e só então dá a nota, para que nota e replay usem os mesmos dados. |
| [`regras-de-pontuacao.ts`](regras-de-pontuacao.ts) | Regras da pontuação — Transforma as medidas da tentativa em nota de 0 a 1000, com categorias (fusão, geometria, regularidade, calor, execução) e condições essenciais. |
| [`relatorio-da-nota.ts`](relatorio-da-nota.ts) | Relatório técnico — Monta o relatório que explica a nota trecho a trecho (regulagem usada, ocorrências). |
