// Gera a pasta portátil do jogo: um HTML único (CSS e JS embutidos) que abre
// com dois cliques em qualquer PC com Chrome ou Edge, sem instalar nada e sem
// internet. Rode depois de `vite build` (o script `npm run portatil` faz os dois).
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DIST = 'dist'
const SAIDA = join('portatil', 'Oficina de Soldagem')
const NOME_HTML = 'Oficina de Soldagem.html'

let html = readFileSync(join(DIST, 'index.html'), 'utf8')

// CSS: troca o <link> pelo conteúdo.
html = html.replace(/<link rel="stylesheet"[^>]*href="\/?([^"]+)"[^>]*>/g, (_, arquivo) => {
  const css = readFileSync(join(DIST, arquivo), 'utf8')
  return `<style>\n${css}\n</style>`
})

// JS: troca o <script src> pelo código. Módulos embutidos também esperam a
// página carregar, então a ordem continua a mesma.
html = html.replace(/<script type="module"[^>]*src="\/?([^"]+)"[^>]*><\/script>/g, (_, arquivo) => {
  const js = readFileSync(join(DIST, arquivo), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})

if (/(src|href)="\/assets\//.test(html)) throw new Error('Sobrou referência a /assets/ no HTML portátil.')

rmSync('portatil', { recursive: true, force: true })
mkdirSync(SAIDA, { recursive: true })
writeFileSync(join(SAIDA, NOME_HTML), html)

writeFileSync(
  join(SAIDA, 'Abrir o jogo.bat'),
  ['@echo off', 'rem Abre o jogo no navegador padrao (Chrome ou Edge recomendados).', `start "" "%~dp0${NOME_HTML}"`, ''].join('\r\n'),
)

writeFileSync(
  join(SAIDA, 'LEIA-ME.txt'),
  [
    'OFICINA DE SOLDAGEM MIG/MAG — jogo didático',
    '',
    'COMO JOGAR EM OUTRO PC',
    '1. Copie esta pasta inteira (pendrive, rede, e-mail compactado).',
    '2. Dê dois cliques em "Abrir o jogo.bat" (ou no arquivo "Oficina de Soldagem.html").',
    '3. Use Google Chrome ou Microsoft Edge atualizados. Não precisa de internet nem instalar nada.',
    '',
    'CONTROLE (PS4/PS5/Xbox) E MESA DIGITALIZADORA',
    '- Controle: conecte e APERTE QUALQUER BOTÃO com o jogo aberto (o navegador só mostra o controle depois disso).',
    '- Mesa/caneta: escolha "Caneta" na bancada; se não soldar, abra "Calibrar" e veja a linha "Último evento".',
    '',
    'ONDE FICAM OS DADOS',
    '- Recordes, torneios e preferências ficam guardados NO NAVEGADOR deste PC, ligados a este arquivo.',
    '- Se mover ou renomear a pasta, o navegador trata como outro jogo e os dados não aparecem.',
    '- Para levar os recordes, use Recordes → "Exportar JSON" e depois importe o arquivo no outro PC.',
    '',
    'SOM',
    '- O som do arco liga/desliga no botão "Som" do topo.',
    '',
    'Modelo qualitativo simplificado: números do jogo, não valores de processo.',
    'A aparência do cordão não indica qualidade interna.',
    '',
  ].join('\r\n'),
)

console.log(`Pasta portátil pronta em ${SAIDA} (${Math.round(html.length / 1024)} kB).`)

// Cópia pronta para mandar: a mesma pasta na Área de Trabalho (substituída a cada geração).
const areaDeTrabalho = join(homedir(), 'Desktop')
if (existsSync(areaDeTrabalho)) {
  const destino = join(areaDeTrabalho, 'Oficina de Soldagem')
  rmSync(destino, { recursive: true, force: true })
  cpSync(SAIDA, destino, { recursive: true })
  console.log(`Cópia na Área de Trabalho: ${destino}`)
}
