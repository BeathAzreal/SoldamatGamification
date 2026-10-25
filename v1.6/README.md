# Oficina de Soldagem — Alpha v1.4 para teste

## Baixar e jogar

**[Baixar o jogo Alpha v1.4 em ZIP](https://github.com/BeathAzreal/SoldamatGamification/raw/refs/heads/gpt/v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip)**

1. Baixe o ZIP pelo link acima. Se o GitHub abrir a página do arquivo, clique em **Download raw file**.
2. Extraia o ZIP inteiro para uma pasta.
3. Abra **Abrir o jogo.bat** ou **Oficina de Soldagem.html** no Chrome ou Edge.
4. Confira **ALPHA v1.4** no topo e a navegação lateral.

Não precisa instalar Node.js, executar servidor nem ter internet para jogar.
Como o repositório é privado, entre na sua conta do GitHub para baixar.

## Qual versão é esta?

Esta é a **1.4.0-alpha.1**, disponível para testar a nova interface.
O processo jogável continua sendo **MIG/MAG**. **Eletrodo revestido está apenas planejado.**

A v1.4 tem início redesenhado, navegação lateral e uma linguagem visual comum
para treino, missões, bancada, execução, resultados, recordes e torneios.

| Versão | Estado | Acesso |
|---|---|---|
| Alpha v1.4 | Para teste; revisão visual pendente | [ZIP da v1.4](https://github.com/BeathAzreal/SoldamatGamification/raw/refs/heads/gpt/v1.4/Oficina-de-Soldagem-Alpha-v1.4.zip) |
| Alpha v1.3 | Aprovada, preservada | [Branch alpha-v1.3](https://github.com/BeathAzreal/SoldamatGamification/tree/alpha-v1.3) |

## Por que a v1.4 ainda não aparece na página principal?

A branch padrão do repositório é o histórico de versões.
O trabalho da v1.4 está em **gpt/v1.4**, com integração proposta em
**alpha-v1.4** pelo [pull request #6](https://github.com/BeathAzreal/SoldamatGamification/pull/6).
Você pode baixar e testar o ZIP antes de aprovar o PR.

## O que conferir no teste

- Menu e navegação em 1280×720 ou 1366×768.
- Treino livre, exercícios técnicos e missões.
- Regulagem da bancada, controles, câmera e execução.
- Resultado, inspeção e comparação de tentativas.
- Arcade, torneios e recordes.

TypeScript, **305 testes** e build aprovados. A revisão visual e dos dispositivos
continua pendente; o navegador integrado não acessou a prévia local.

## Seus dados

Recordes e preferências ficam no navegador e podem depender do caminho do
HTML. Antes de trocar de pasta ou versão, exporte os recordes em JSON.
O ZIP não transfere automaticamente os dados da v1.3.

## Código-fonte

Selecione a branch **gpt/v1.4** e use **Code → Download ZIP** para baixar o projeto.
Para desenvolvimento:

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run portatil
```

O portátil é gerado em `portatil/Oficina de Soldagem/`.
As instruções dos agentes estão em [AGENTS.md](AGENTS.md);
as decisões de interface, em [docs/UI-v1.4.md](docs/UI-v1.4.md).

Modelo didático qualitativo: os números do jogo não qualificam procedimentos de soldagem.


### Atualização didática da Alpha v1.4

As missões apresentam roteiro de aprendizagem; capítulos mostram progresso e ação Continuar. Os resultados incluem Plano da próxima tentativa, baseado nos dados registrados. Arcade v2 introduz gradualmente missões, técnica e tempo, mantendo recordes antigos separados. Torneios têm resumo de pendências e desempates coerentes. Consulte `docs/ETAPA-DIDATICA.md`. As alterações de realismo do modelo e renderização continuam em desenvolvimento separado.
