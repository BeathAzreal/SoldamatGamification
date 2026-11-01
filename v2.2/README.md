# Oficina de Soldagem — Alpha v2.2 (versão de teste)

> ⚠️ **A v2.2 não é estável e serve apenas para testar funções novas.** Para jogar, use a [Alpha v2.0](../v2.0/Oficina-de-Soldagem-Alpha-v2.0.zip).

**Novo na v2.2, experimental:** **FÁBRICA**, uma prática industrial. A Oficina de Soldagem, a **Usinagem** (torno CNC) e o **Laboratório de Falhas** viram um jogo só: um galpão 3D com os setores de Usinagem, Soldagem, Manufatura Aditiva e Laboratório, ligados por **ordens de serviço**. A OS-01 (*Braço tensor da peneira vibratória*) passa pelos setores como numa indústria. O laboratório investiga por que o braço quebrou, a usinagem refaz o pino dentro da tolerância e a soldagem refaz a emenda em aço SAE 1045 com o procedimento corrigido. No fim, a qualidade libera a OS, e o relatório sai impresso ou em PDF para o professor. Como funciona, sugestão de aula e como criar novas OS: [docs/FABRICA.md](docs/FABRICA.md).

**Menu em 3D (teste da nova interface):** o menu é a própria fábrica, à noite. Cada opção é um lugar do galpão: o portão com o quadro de OS (Fábrica), os fliperamas (Arcade), a cabine de solda (Treino), o robô (Manufatura Aditiva), a estante de troféus (Recordes) e o armário de ferramentas (Configurações). Escolher uma opção vira a câmera para o lugar, e confirmar leva a câmera até lá. A lista fica por cima e continua funcionando com teclado, controle e leitor de tela; também dá para clicar direto no lugar. Sem 3D no computador, volta o menu ilustrado. Código em `src/render/menu3d.ts`.

Todo o resto é a v2.1: Manufatura Aditiva, MIG/MAG, TIG, eletrodo, brasagem, História, Desafios, Versus e o x1 online, com o mesmo protocolo de rede.

## Baixar e jogar

**[Baixar a v2.2 (teste) — ZIP](Oficina-de-Soldagem-Alpha-v2.2.zip)**

Extraia o ZIP inteiro e abra **Oficina de Soldagem.html** (ou **Abrir o jogo.bat**) no Chrome ou Edge, sem instalação e sem internet. **JOGAR ONLINE.html** abre a oficina hospedada para o x1 online.

O ZIP da v2.2 não traz o servidor local de reserva (ele só é gerado no Windows). Para o x1 em rede local, use o pacote da [v2.1](../v2.1/Oficina-de-Soldagem-Alpha-v2.1.zip) ou da [v2.0](../v2.0/Oficina-de-Soldagem-v2.0-Rede.zip), que usam o mesmo protocolo.

## Jogo online

[Abra a Oficina de Solda online](https://oficinadesolda.beath.chatgpt.site/?rede=1).

Uma pessoa cria a sala e usa **Copiar convite**. A outra abre o link, informa seu apelido e entra. O x1 online é para duas pessoas em MIG/MAG; cada uma precisa de conexão com a internet. A nota é calculada no servidor. A pausa local não interrompe o prazo da rodada.

## Servidor local de reserva

Em **servidor-local/**, execute **ABRIR-OFICINA.bat** no PC anfitrião e mantenha a janela aberta. O pacote já inclui o runtime e não precisa de instalação de Node.js.

O outro jogador abre no navegador o endereço com IP mostrado na janela do servidor. `localhost` funciona somente no próprio anfitrião. A rede precisa permitir comunicação entre os PCs na porta 5197; as políticas do Windows e da instituição continuam valendo.

O servidor local guarda salas em memória: reiniciá-lo apaga essas salas. O online hospedado usa armazenamento compartilhado. Os dois modos usam o mesmo contrato de rede, mas suas salas são separadas.

## Seus dados

Recordes e preferências ficam no navegador, não dentro da pasta. Antes de trocar de caminho, versão ou navegador, exporte os recordes que quiser preservar. O ZIP não transfere automaticamente os dados de versões antigas.

## Código-fonte e geração do pacote

A v2.2 fica nesta pasta (`v2.2/`), feita a partir da v2.1. A Alpha v2.0 estável continua em **alpha-v2.0**, e as versões anteriores permanecem em suas branches.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run pacote:v2
```

A geração do ZIP usa a biblioteca ZIP do Windows e o Node.js oficial definido em `licencas/node-runtime.json`. Se o executável em uso não corresponder ao hash desse manifesto, defina `NODE_PORTATIL` com o caminho do `node.exe` oficial correspondente. O gerador confere o SHA-256 antes de incluir o runtime.

`npm run pacote:v2` (só no Windows) gera **Oficina-de-Soldagem-Alpha-v2.2.zip** completo, com o portátil, o atalho HTML online e o servidor local de reserva. A pasta intermediária fica em `pacote-v22/` e não entra no Git. O HTML portátil também pode ser gerado separadamente com `npm run portatil`.

Documentação técnica: [fábrica](docs/FABRICA.md), [manufatura aditiva](docs/MANUFATURA-ADITIVA.md), [rede](docs/REDE-V17.md), [hipóteses](docs/HIPOTESES.md), [pontuação](docs/PONTUACAO.md), [TIG](docs/TIG.md) e [verificação](docs/VERIFICACAO.md).

Modelo didático qualitativo: os números do jogo não qualificam procedimentos nem servem como receita de soldagem.
