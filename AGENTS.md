# Instruções para agentes de IA (GPT/Codex e Claude)

> **Leia tudo antes de mexer em qualquer arquivo.** Este repositório é
> trabalhado por **dois agentes ao mesmo tempo**, cada um na sua branch.

## 1. Quem trabalha em qual branch (NÃO TROQUE)

| Branch | Dono | Pode fazer commit/push? |
|---|---|---|
| `gpt/v1.3` | **GPT (OpenAI Codex / ChatGPT)** | só o GPT |
| `claude/v1.3` | **Claude (Anthropic Claude Code)** | só o Claude |
| `alpha-v1.3` | dono do projeto (versão entregue) | **ninguém**, só por pull request aprovado pelo dono |
| `claude/epic-allen-8rmum9` | histórico de todas as versões (v1.1, v1.2, v1.3) | **ninguém** |

Antes de começar, rode `git branch --show-current`:

- Se você é o **GPT** e não está em `gpt/v1.3`: rode `git checkout gpt/v1.3`. Nunca faça commit ou push em `claude/v1.3`.
- Se você é o **Claude** e não está em `claude/v1.3`: rode `git checkout claude/v1.3`. Nunca faça commit ou push em `gpt/v1.3`.
- **Nunca** use `git push --force`, `git rebase` ou reescreva o histórico da branch do outro agente.
- Para trazer o trabalho do outro agente, **não** faça merge direto entre as duas branches. O dono junta tudo em `alpha-v1.3` por pull request, e depois cada agente atualiza a sua com `git merge origin/alpha-v1.3`.
- Se o pedido do dono parecer exigir trabalhar na branch do outro, **pare e pergunte**.

## 2. O projeto

**Oficina de Soldagem MIG/MAG**: jogo didático de soldagem no navegador, em
**3D** (Three.js), feito em **TypeScript + Vite**. Roda sem servidor, sem
conta e sem internet. Público: estudantes de soldagem, em português do Brasil.

O jogador regula a máquina (tensão, alimentação, arame, gás, técnica da
tocha), posiciona a peça (girar e tombar de 0° a 180°), solda com mouse,
mesa digitalizadora (caneta) ou controle, e recebe uma pontuação explicada.

**Modelo qualitativo simplificado:** os números são do jogo, não de norma,
catálogo nem medição. Mostra *tendências* (mais devagar → cordão mais
largo). Todas as hipóteses têm código (H1…H47) em `docs/HIPOTESES.md`, e o
código cita esses códigos nos comentários.

### Modos
História (capítulos com Aprendiz/Profissional), Arcade (desafios
sorteados, 3 vidas), Torneio local (por turnos, com professor), Treino,
Recordes e Configurações (bancada com peça de teste).

### Pastas
| Pasta | O que tem |
|---|---|
| `src/modelo/` | simulação pura: cordão, fusão, juntas (topo, V, T, sobreposta, canto), posição e gravidade, parâmetros |
| `src/pontuacao/` | regras de pontuação (`docs/PONTUACAO.md`) |
| `src/missoes/` | catálogo de missões (`docs/MISSOES.md`) |
| `src/arcade/` | geração dos desafios do Arcade |
| `src/dados/` | armazenamento no navegador (localStorage), recordes, torneio, preferências |
| `src/entrada/` | mouse, caneta, controle e gestos de câmera/peça (`gestos.ts`) |
| `src/render/` | 3D: palco, câmera (`vista3d.ts`), tocha, cordão, calor; 2D de reserva |
| `src/ui/` | telas e componentes (DOM feito à mão com `h()` de `src/ui/dom.ts`) |
| `src/didatica/` | explicações e comparação de tentativas |
| `tests/` | testes Vitest (sem navegador) |
| `docs/` | hipóteses, pontuação, missões, dados, dispositivos, torneio, verificação |
| `scripts/portatil.mjs` | gera o jogo portátil (um HTML único) |
| `jogo-portatil/` | o jogo pronto que vai para os jogadores |

## 3. Comandos

```bash
npm install          # uma vez
npm run dev          # jogo em http://localhost:5173
npm run typecheck    # tipos (TypeScript)
npm test             # testes (Vitest)
npm run portatil     # build + pasta portatil/Oficina de Soldagem/
```

**Antes de cada commit:** `npm run typecheck` e `npm test` têm de passar.
Não apague nem desligue testes para eles passarem. Se um teste descreve um
comportamento que o dono mandou mudar, atualize o teste e explique no commit.

Para entregar o jogo pronto: `npm run portatil` e copie os 3 arquivos de
`portatil/Oficina de Soldagem/` para `jogo-portatil/`. As notas da versão
ficam em `scripts/portatil.mjs` (viram o `LEIA-ME.txt`).

## 4. Regras do projeto

1. **Tudo em português do Brasil:** textos da tela, nomes no código (`cordao`, `junta`, `tocha`), comentários e mensagens de commit.
2. **Siga o estilo do código vizinho:** TypeScript estrito, funções pequenas, comentários curtos que explicam o porquê, códigos H nos comentários quando a regra vem de uma hipótese.
3. **O modelo (`src/modelo/`) é puro:** nada de DOM nem Three.js ali. O 3D e a interface só LEEM o modelo; efeitos visuais nunca mudam pontuação.
4. **Mudou uma regra do modelo ou da pontuação?** Atualize `docs/HIPOTESES.md` ou `docs/PONTUACAO.md` e crie ou ajuste testes.
5. **Tela travada numa página:** nada de rolar a página. Texto longo vai numa sobreposição (`abrirPainel` em `src/ui/dialogo.ts`) ou em abas (`src/ui/componentes/abas.ts`). Confira em 1280×720 e 1366×768.
6. **Controles (v1.3):**
   - mouse: botão do meio move a câmera e o direito gira a peça;
   - caneta: Espaço move a câmera, E ou B giram a peça;
   - controle: o analógico direito move a câmera e o direcional gira a peça;
   - tudo só com o arco fechado, e configurável em "Controles" (`src/ui/componentes/controles.ts`).
   Não quebre isso.
7. **Dados salvos:** mudou o formato de algo em `src/dados/`? Mantenha a leitura de dados antigos (veja `validarPreferencias`).
8. **Versões:** esta branch é a **Alpha v1.3**. Não crie pastas de outras versões aqui. Uma versão nova (v1.4) é decidida pelo dono.
9. **Sem dependências novas** sem o dono pedir. O jogo tem de continuar funcionando offline, num HTML único.
10. Commits pequenos, um assunto por commit, mensagem em português dizendo o que mudou e por quê.

## 5. Divisão do trabalho

Para os dois agentes não mexerem nos mesmos arquivos, o dono diz em cada
pedido qual área é de quem. Sem essa indicação, use a sugestão abaixo e
**pergunte antes** de mexer em área do outro:

| Área | Pastas principais | Sugestão |
|---|---|---|
| Missões, textos didáticos, novas juntas no catálogo | `src/missoes/`, `src/didatica/`, `docs/MISSOES.md` | GPT |
| Arcade, torneio, recordes, dados | `src/arcade/`, `src/dados/`, `src/ui/telas/{arcade,torneio,recordes}.ts` | GPT |
| 3D, câmera, tocha, entrada (mouse, caneta, controle) | `src/render/`, `src/entrada/` | Claude |
| Modelo físico e pontuação | `src/modelo/`, `src/pontuacao/` | Claude |
| Telas comuns (bancada, execução, resultado) | `src/ui/componentes/`, `src/ui/telas/{execucao,julgamento,historia}.ts` | combinar com o dono |

Arquivos que os dois podem precisar tocar (`src/estilo-app.css`, `docs/*.md`,
`scripts/portatil.mjs`): mexa só no trecho necessário, para o merge ficar fácil.

## 6. Ao terminar uma tarefa

1. `npm run typecheck` e `npm test` passando.
2. Se mexeu em algo visível, abra o jogo (`npm run dev`) e confira.
3. Commit e push **na sua branch** (seção 1).
4. Escreva ao dono o que mudou, o que testou e o que ficou pendente.
