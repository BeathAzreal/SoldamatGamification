# Oficina de Soldagem — Alpha v2.1 (versão de teste)

> ⚠️ **A v2.1 não é estável e serve apenas para testar funções novas.** Para jogar, use a [Alpha v2.0](Oficina-de-Soldagem-Alpha-v2.0.zip).

**Novo na v2.1, experimental:** **MANUFATURA ADITIVA**, uma programação robotizada. O jogador escreve um job num subconjunto do INFORM (controlador Yaskawa, referência DX200), ensina as posições, valida, roda sem deposição e fabrica uma parede de várias camadas por deposição a arco. Depois inspeciona e corrige. O simulador não é réplica do controlador, da fonte nem do robô. Detalhes, fontes e limites em [docs/MANUFATURA-ADITIVA.md](docs/MANUFATURA-ADITIVA.md). Todo o resto é a v2.0: MIG/MAG, TIG, eletrodo, brasagem, História, Desafios, Versus e o x1 online, com o mesmo protocolo de rede.

## Baixar e jogar

**[Baixar o pacote completo da v2.1 (teste)](Oficina-de-Soldagem-Alpha-v2.1.zip)**

Extraia o ZIP inteiro. A pasta contém três formas de acesso:

| Arquivo ou pasta | Quando usar |
|---|---|
| **JOGAR ONLINE.html** | Abre a oficina hospedada no navegador. Precisa de internet; não inicia Node.js nem servidor no PC. |
| **Oficina de Soldagem.html** | Abre o jogo offline, para treinos e demais modos locais. Sem instalação e sem internet. |
| **servidor-local/** | Reserva para x1 pela mesma rede. Inclui servidor, jogo e Node.js portátil para Windows x64. |

O arquivo **Abrir o jogo.bat** também abre o jogo offline. As instruções de cada opção estão em **LEIA-ME.txt**; as notas da versão ficam em **NOTAS DA VERSAO.txt**.

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

A versão de teste integrada fica em **alpha-v2.1**; o trabalho do Claude na v2.1 fica em **claude/v2.1**. A Alpha v2.0 estável continua em **alpha-v2.0**, e as versões anteriores permanecem em suas branches.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run pacote:v2
```

A geração do ZIP usa a biblioteca ZIP do Windows e o Node.js oficial definido em `licencas/node-runtime.json`. Se o executável em uso não corresponder ao hash desse manifesto, defina `NODE_PORTATIL` com o caminho do `node.exe` oficial correspondente. O gerador confere o SHA-256 antes de incluir o runtime.

`npm run pacote:v2` gera **Oficina-de-Soldagem-Alpha-v2.1.zip**, incluindo o portátil, o atalho HTML online e o servidor local de reserva. A pasta intermediária fica em `pacote-v21/` e não entra no Git. O HTML portátil também pode ser gerado separadamente com `npm run portatil`.

Documentação técnica: [manufatura aditiva](docs/MANUFATURA-ADITIVA.md), [rede](docs/REDE-V17.md), [hipóteses](docs/HIPOTESES.md), [pontuação](docs/PONTUACAO.md), [TIG](docs/TIG.md) e [verificação](docs/VERIFICACAO.md).

Modelo didático qualitativo: os números do jogo não qualificam procedimentos nem servem como receita de soldagem.
