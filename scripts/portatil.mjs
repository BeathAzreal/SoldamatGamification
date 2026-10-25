// Gera um único HTML offline do protótipo, na branch v1.5.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const saida = join('portatil', 'Oficina de Soldagem v1.5')
let html = readFileSync('dist/index.html', 'utf8')
html = html.replace(/<link rel="stylesheet"[^>]*href="\/?([^"]+)"[^>]*>/g, (_, arquivo) => `<style>${readFileSync(join('dist', arquivo), 'utf8')}</style>`)
html = html.replace(/<script type="module"[^>]*src="\/?([^"]+)"[^>]*><\/script>/g, (_, arquivo) => `<script type="module">${readFileSync(join('dist', arquivo), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`)
if (/(?:src|href)="\/?assets\//.test(html)) throw new Error('Referência externa no portátil')
mkdirSync(saida, { recursive: true })
writeFileSync(join(saida, 'Oficina de Soldagem.html'), html)
writeFileSync(join(saida, 'Abrir o jogo.bat'), '@echo off\r\nstart "" "%~dp0Oficina de Soldagem.html"\r\n')
writeFileSync(join(saida, 'LEIA-ME.txt'), 'OFICINA DE SOLDAGEM — v1.5 PROTÓTIPO\r\n\r\nAbra o HTML no Chrome ou Edge. Sem instalação ou internet.\r\n\r\nMIG: mova sobre a chapa e mantenha esquerdo ou Espaço para acionar.\r\nEletrodo: habilite com o mesmo comando, aproxime até contato e afaste levemente.\r\nW aproxima e S afasta. A roda ajusta 0,5 mm. A barra também regula a distância.\r\nA vareta encurta: compense a distância para manter o arco. Solte antes de trocar.\r\nPausar, perder foco ou soltar desabilita. Nova vareta mantém o cordão.\r\n\r\nProtótipo sem pontuação ou física SMAW calibrada. Números didáticos.\r\nO botão no eletrodo é convenção de entrada, não gatilho físico do porta-eletrodo.\r\nA v1.4 permanece em sua branch separada.\r\n')
console.log(`Protótipo offline gerado em ${saida}`)
