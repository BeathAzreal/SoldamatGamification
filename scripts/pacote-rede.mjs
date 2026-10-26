import {mkdirSync,cpSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs'
import {resolve,join,dirname,sep} from 'node:path'
const raiz=resolve('pacote-rede'),saida=join(raiz,'Oficina-de-Soldagem-v1.7-Rede')
if(dirname(saida)!==raiz || !saida.startsWith(resolve(process.cwd())+sep))throw Error('Destino do pacote fora do projeto.')
if(existsSync(saida))rmSync(saida,{recursive:true,force:true})
mkdirSync(join(saida,'servidor'),{recursive:true})
cpSync('dist',join(saida,'dist'),{recursive:true})
cpSync('dist-servidor/index.js',join(saida,'servidor/index.js'))
writeFileSync(join(saida,'package.json'),JSON.stringify({private:true,type:'module',version:'1.7.0',engines:{node:'>=22'}},null,2))
const bat=`@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Instale o Node.js LTS em https://nodejs.org/ e abra este arquivo novamente.
 pause
 exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"
if errorlevel 1 (
 echo Este servidor precisa do Node.js 22 ou mais recente.
 pause
 exit /b 1
)
node servidor\\index.js
pause
`
writeFileSync(join(saida,'INICIAR-REDE.bat'),bat.replace(/\n/g,'\r\n'))
writeFileSync(join(saida,'ABRIR-NESTE-PC.url'),'[InternetShortcut]\r\nURL=http://localhost:5197/?rede=1\r\n')
const leia=`OFICINA DE SOLDAGEM v1.7 — X1 EM REDE LOCAL

1. Extraia esta pasta inteira no PC que hospedará a sala.
2. Esse PC precisa de Node.js 22 ou mais recente (https://nodejs.org/). O outro PC só precisa de Chrome ou Edge.
3. Execute INICIAR-REDE.bat e mantenha a janela aberta.
4. No anfitrião, abra ABRIR-NESTE-PC.url ou http://localhost:5197/?rede=1.
5. No segundo PC, use um dos endereços com IP mostrados na janela do servidor, acrescentando ?rede=1. Exemplo ilustrativo: http://192.168.0.10:5197/?rede=1. Localhost não serve para acessar o outro computador.
6. Os dois PCs precisam se alcançar pela rede. Se a rede da faculdade isolar os aparelhos ou bloquear a porta, peça à TI para liberar o acesso local ao servidor na porta 5197. Não é preciso abrir portas do roteador para a internet.

PARTIDA
O anfitrião escolhe missão e dificuldade e cria a sala. O segundo jogador entra com o código de seis caracteres. Cada um usa seu apelido. Quando os dois confirmarem prontidão, a contagem inicia a disputa.
Nesta etapa o processo é MIG/MAG, com a mesma preparação e regulagem inicial para ambos. O eletrodo e a física anteriores foram preservados.
Segure o botão esquerdo para soldar; feche o arco e use Encerrar tentativa ou Enter para entregar. Há três minutos por rodada, contados pelo servidor. Pausar não interrompe esse prazo. Não entregar no prazo vale zero.
O servidor reproduz o registro e calcula 0 a 1000 pontos. A maior nota vence; notas iguais empatam. Abandono ou perda de conexão por mais de 30 segundos pode decidir por W/O. Revanche exige a confirmação dos dois.
Recarregar a página durante uma tentativa interrompe a participação. Queda rápida da rede tenta reconectar sem criar outro jogador. Reiniciar o servidor apaga as salas, que ficam apenas em memória.

USO OFFLINE
Os outros modos continuam no mesmo jogo. O pacote HTML portátil separado pode ser aberto sem servidor, mas o x1 precisa desta conexão local.

INTERNET NO FUTURO
A interface já usa um contrato versionado e uma API de mesma origem. O mesmo servidor pode ser colocado atrás de HTTPS; o cliente usa o endereço de onde o jogo foi aberto. PORT muda a porta (padrão 5197) e HOST a interface (padrão 0.0.0.0). Contas, matchmaking, persistência e proteção antifraude pública não fazem parte deste primeiro protótipo.

VALIDAÇÃO
Consulte docs/REDE-V17.md no código-fonte para testes e limitações. Dois clientes automatizados na mesma máquina não substituem o teste físico na rede da faculdade.
`
writeFileSync(join(saida,'LEIA-ME.txt'),leia.replace(/\n/g,'\r\n'))
if(existsSync('portatil/Oficina de Soldagem v1.7/Oficina de Soldagem.html'))cpSync('portatil/Oficina de Soldagem v1.7/Oficina de Soldagem.html',join(saida,'Oficina-de-Soldagem-v1.7-offline.html'))
console.log(`Pacote de rede gerado: ${saida}`)
