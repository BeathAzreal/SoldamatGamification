// Gera um único HTML offline do protótipo, na branch v1.6.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const saida = join('portatil', 'Oficina de Soldagem v1.6')
let html = readFileSync('dist/index.html', 'utf8')
html = html.replace(/<link rel="stylesheet"[^>]*href="\/?([^"]+)"[^>]*>/g, (_, arquivo) => `<style>${readFileSync(join('dist', arquivo), 'utf8')}</style>`)
html = html.replace(/<script type="module"[^>]*src="\/?([^"]+)"[^>]*><\/script>/g, (_, arquivo) => `<script type="module">${readFileSync(join('dist', arquivo), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`)
if (/(?:src|href)="\/?assets\//.test(html)) throw new Error('Referência externa no portátil')
mkdirSync(saida, { recursive: true })
writeFileSync(join(saida, 'Oficina de Soldagem.html'), html)
writeFileSync(join(saida, 'Abrir o jogo.bat'), '@echo off\r\nstart "" "%~dp0Oficina de Soldagem.html"\r\n')
writeFileSync(join(saida, 'LEIA-ME.txt'), 'OFICINA DE SOLDAGEM — ALPHA v1.6\r\n\r\nAbra o HTML no Chrome ou Edge. Sem instalação ou internet.\r\n\r\nMIG/MAG: jogo completo (missões, arcade, treino, torneio), como na v1.4.\r\n\r\nEletrodo revestido: Treino → Processo: Eletrodo revestido → escolha a peça.\r\nNão há botão para soldar: leve a ponta com o mouse até o INÍCIO e desça com S até tocar; o arco abre sozinho.\r\nA vareta queima: segure S para acompanhar o consumo e reduzir o arco; solte para manter a distância (o medidor mostra curto, adequado ou longo). W sobe.\r\nAjuda na altura: Parcial (padrão), Total ou Manual (sem ajuda automática). Empurrar contra a poça gruda: use Desgrudar.\r\nNo fim, espere a escória esfriar, quebre com o Martelinho (clique; golpes laterais, diagonais ou por cima variam automaticamente) e limpe com a Escova de aço (arraste).\r\nMeio gira a câmera; direito orienta; I/K inclinam, J/L mudam a direção, Q/E giram o punho. Teclas em Controles.\r\n\r\nModelo qualitativo, sem pontuação no eletrodo nesta versão. Números didáticos, não receita de soldagem.\r\n')
console.log(`Protótipo offline gerado em ${saida}`)
