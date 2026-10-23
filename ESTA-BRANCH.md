# Qual é esta branch?

Confira antes de qualquer commit: `git branch --show-current`.

| Branch | Dono | Quem faz commit e push |
| --- | --- | --- |
| `alpha-v1.3` | dono do projeto (versão entregue) | ninguém; só por pull request aprovado pelo dono |
| `claude/v1.3` | Claude (Anthropic Claude Code) | só o Claude |
| `gpt/v1.3` | GPT (OpenAI Codex / ChatGPT) | só o GPT |

Este arquivo é igual nas três branches, para não gerar conflito nos merges.
Trabalhe só na sua branch. As regras estão no [`AGENTS.md`](AGENTS.md).
