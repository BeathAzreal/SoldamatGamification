# Instruções para agentes de IA (GPT/Codex e Claude)

> **Leia tudo antes de mexer em qualquer arquivo.** Este repositório é
> trabalhado por **dois agentes**, cada um na sua branch, e o dono do projeto
> **não programa em JavaScript**: o código precisa continuar legível para ele.

## 1. Branches

A v1.6 (esta pasta) foi criada na branch `reorganizacao`, a partir da
`alpha-v1.5`. **Pergunte ao dono** em qual branch trabalhar na v1.6 antes de
começar. Regras que continuam valendo:

- Cada agente faz commit só na sua branch; versões entregues (`alpha-…`) só
  recebem mudanças por pull request aprovado pelo dono.
- **Nunca** use `git push --force`, `git rebase` nem reescreva o histórico da
  branch do outro agente.
- Pastas de versões antigas (`v1.1` … `v1.5`) **não são alteradas**.

## 2. O projeto

**Oficina de Soldagem**: jogo didático de soldagem no navegador, em 3D
(Three.js), feito em TypeScript + Vite. Roda sem servidor, sem conta e sem
internet. Público: estudantes de soldagem, em português do Brasil.

- **MIG/MAG:** jogo completo (missões em capítulos, arcade, treino, torneio
  local com professor, recordes).
- **Eletrodo revestido (SMAW):** treino com peças próprias, sem pontuação,
  em Treino → Processo: Eletrodo revestido (criado na v1.5).

Modelo qualitativo simplificado: os números são do jogo, não de norma,
catálogo nem medição. As hipóteses têm código (H1…H73) em
`documentacao/HIPOTESES.md` e `documentacao/PROTOTIPO-V15.md`.

### Pastas

O mapa completo está no [`README.md`](README.md) (seção 3) e em
`codigo/LEIA-ME.md`. Resumo:

| Pasta | O que tem |
|---|---|
| `codigo/simulacao-mig/` | modelo MIG puro (sem DOM nem Three.js): cordão, fusão, defeitos, juntas, materiais, parâmetros |
| `codigo/eletrodo/` | tudo do eletrodo: física (`arco-e-vareta.ts`, `escoria.ts`), peças, 3D, tela, controles |
| `codigo/pontuacao/` | regras da nota (`documentacao/PONTUACAO.md`) |
| `codigo/missoes/`, `codigo/arcade/`, `codigo/torneio/` | catálogo de missões, arcade e regras do torneio |
| `codigo/explicacoes/` | textos didáticos e comparação |
| `codigo/dispositivos/` | mouse, caneta, controle e gestos (MIG) |
| `codigo/salvamento/` | dados no navegador (localStorage) |
| `codigo/desenho-3d/`, `codigo/desenho-2d/` | só desenham; nunca mudam a nota |
| `codigo/telas/`, `codigo/partes-das-telas/`, `codigo/interface/` | telas, componentes e base da interface |
| `codigo/estilos/` | CSS, carregado na ordem numérica |
| `testes/` | Vitest (sem navegador) |
| `ferramentas/gerar-jogo-portatil.mjs` | gera o HTML único |

## 3. Comandos (dentro de `v1.6/`)

```bash
npm install          # uma vez
npm run dev          # jogo em http://localhost:5173
npm run typecheck    # tipos (TypeScript)
npm test             # testes (Vitest)
npm run portatil     # build + pasta portatil/Oficina de Soldagem v1.6/
```

**Antes de cada commit:** `npm run typecheck` e `npm test` têm de passar.
Não apague nem desligue testes para eles passarem.

## 4. Regras do projeto

1. **Tudo em português do Brasil:** textos, nomes no código, comentários, commits.
2. **Legível para quem não programa:**
   - todo arquivo novo começa com o quadro `█ Título / O que faz / Onde mexer`
     (veja qualquer arquivo de `codigo/`);
   - nomes de arquivo em português, com hífens, sem acento (`pecas-de-treino.ts`);
   - arquivo novo entra também no `LEIA-ME.md` da pasta.
3. **A simulação é pura:** `simulacao-mig/`, `eletrodo/arco-e-vareta.ts` e
   `eletrodo/escoria.ts` não usam DOM nem Three.js. O desenho só LÊ o modelo.
4. **Mudou uma regra do modelo ou da pontuação?** Atualize
   `documentacao/HIPOTESES.md` ou `documentacao/PONTUACAO.md` e os testes.
   Mudou a nota? Troque `VERSAO_PONTUACAO`.
5. **Tela travada numa página:** nada de rolar a página; texto longo vai em
   `abrirPainel` (`codigo/interface/janelas-de-dialogo.ts`) ou em abas
   (`codigo/partes-das-telas/abas.ts`). Confira em 1280×720 e 1366×768.
6. **Dados salvos:** não mude chaves do localStorage (`PREFIXO`, coleções,
   `CHAVE_CONTROLES15`) e mantenha a leitura de dados antigos.
7. **Sem dependências novas** sem o dono pedir. Offline, num HTML único.
8. Commits pequenos, um assunto por commit, mensagem em português dizendo o
   que mudou e por quê.

## 5. Ao terminar uma tarefa

1. `npm run typecheck` e `npm test` passando.
2. Se mexeu em algo visível, abra o jogo (`npm run dev`) e confira.
3. Commit e push na branch combinada.
4. Escreva ao dono o que mudou, o que testou e o que ficou pendente.
