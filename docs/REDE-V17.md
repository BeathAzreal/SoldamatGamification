# X1 em rede — v1.7

Escopo: dois navegadores em PCs da mesma rede, criando uma sala por código. Primeiro processo: MIG/MAG, reutilizando a execução e o replay existentes. A física, a renderização e o eletrodo do Claude não são modificados. Sem bibliotecas novas.

## Partida

O anfitrião escolhe missão e dificuldade. Ambos usam a mesma preparação e regulagem padronizadas, confirmam prontidão, recebem a contagem regressiva do servidor e soldam na própria bancada. Cada um encerra normalmente a tentativa, com o arco fechado. O servidor reproduz o registro e calcula a nota; não aceita uma nota declarada pelo cliente. Ambos veem os resultados quando os dois entregam. Tentativa não entregue em três minutos vale zero. Sair durante a disputa conta como abandono. A pausa local não interrompe o prazo do servidor.

## Separação técnica

- `src/rede/`: contrato versionado, configurações de partida e cliente de transporte.
- `servidor/`: estado das salas, autorização, limites de entrada, reprodução e transporte HTTP.
- `src/ui/rede/`: sala, contagem, adaptador da execução existente e resultado.
- Integração única de navegação: Arcade → X1 em rede.

O servidor entrega os mesmos arquivos do jogo e a API na mesma origem. Estados chegam por fluxo SSE e comandos por POST autenticado; isso usa apenas as APIs HTTP nativas, sem dependência de uma biblioteca WebSocket. O cliente não conhece detalhes do armazenamento das salas. A mesma API funciona atrás de HTTPS em uma hospedagem futura. Processo, versão do protocolo e versão da pontuação fazem parte do contrato.

## Limites do protótipo

Salas privadas de dois jogadores, em memória; reiniciar o servidor remove as salas. Sem contas, matchmaking ou ranking entre instituições nesta etapa. A validação de replay impede enviar só uma nota inventada, mas não prova que os movimentos foram feitos por uma pessoa; não é um sistema antifraude de competição pública. O pacote Windows x64 já leva o runtime necessário: não há instalação separada de Node.js. O segundo PC só precisa do navegador. Para executar pelo código-fonte, continua sendo necessário Node.js 22 ou mais recente. Testes com dois clientes na mesma máquina não substituem validação física em dois PCs e nas regras de rede da faculdade.

## Validação da implementação

Testes do estado das salas cobrem dois participantes, credenciais, versão, prontidão, contagem, replay no servidor, ocultação do resultado adversário até o fim, entrega idempotente, revanche, expiração, cancelamento e desconexão. Testes HTTP iniciam um servidor real e dois fluxos autenticados independentes. Testes do cliente rejeitam mensagens atrasadas e modelo incompatível.

No navegador, dois clientes no mesmo computador criaram/entraram por código, confirmaram prontidão, fizeram a mesma missão, entregaram soldas distintas e receberam 254 e 194 pontos, com vitória do primeiro cliente. Também foram conferidos o encerramento por prazo, revanche e saída da sala. Isso não representa um teste em dois PCs físicos. Nenhum arquivo de física, entrada, renderização ou pontuação da v1.6 foi alterado nesta etapa.

Validação final: typecheck, checagem sintática do servidor nativo, 450 testes em 44 arquivos, build do cliente, build do servidor e geração do pacote. O lançador INICIAR-REDE.bat foi executado no Windows e a página foi acessada pelo IP privado da máquina. Isso valida o empacotamento e a interface LAN neste host, sem afirmar compatibilidade física já testada em outra máquina.

Foi conferida também a recarga da página durante uma partida: ela interrompe a participação, limpa a credencial local e comunica a vitória por abandono ao adversário, sem abrir confirmações repetidas ou permitir uma segunda tentativa.

## Pacote autossuficiente para Windows x64

ABRIR-OFICINA.bat usa exclusivamente runtime/node.exe por caminho relativo e abre o jogo após o servidor começar a escutar. Não procura Node.js no PATH nem instala componentes. O runtime oficial v24.19.0 foi conferido contra o SHA-256 publicado pelo Node.js; a licença integral e os metadados de origem acompanham o executável. O binário entra apenas no pacote gerado, não no Git. A geração usa o processo Node atual ou NODE_PORTATIL e exige o hash do manifesto em licencas/node-runtime.json. SEM_ABRIR_NAVEGADOR=1 serve ao teste sem lançar uma janela de navegador por fora das ferramentas de UI.

Teste do pacote integrado: ABRIR-OFICINA.bat iniciou o servidor com o PATH reduzido a pastas do Windows; where node não localizou Node.js instalado. O jogo foi acessado no navegador e os 450 testes existentes passaram. A abertura automática do navegador foi desabilitada apenas nesse teste para usar a ferramenta de UI.
