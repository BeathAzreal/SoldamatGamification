// Gera um HTML autossuficiente; não instala nada nem altera a Área de Trabalho.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const saida = join('portatil', 'Oficina de Soldagem')
const nome = 'Oficina de Soldagem.html'
const versao = JSON.parse(readFileSync('package.json', 'utf8')).version
let html = readFileSync(join('dist', 'index.html'), 'utf8')
let folhas = 0
let modulos = 0
html = html.replace(/<link rel="stylesheet"[^>]*href="\/?([^"]+)"[^>]*>/g, (_, arquivo) => {
  folhas++
  return `<style>\n${readFileSync(join('dist', arquivo), 'utf8')}\n</style>`
})
html = html.replace(/<script type="module"[^>]*src="\/?([^"]+)"[^>]*><\/script>/g, (_, arquivo) => {
  modulos++
  const js = readFileSync(join('dist', arquivo), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})
if (!folhas || !modulos || /(?:src|href)="\/?assets\//.test(html)) {
  throw new Error('O HTML portátil não ficou autossuficiente.')
}
mkdirSync(saida, { recursive: true })
writeFileSync(join(saida, nome), `<!-- Oficina de Soldagem ${versao} -->\n${html}`)
writeFileSync(join(saida, 'Abrir o jogo.bat'), ['@echo off', 'rem Abra com Chrome ou Edge.', `start "" "%~dp0${nome}"`, ''].join('\r\n'))
writeFileSync(join(saida, 'LEIA-ME.txt'), [
  'OFICINA DE SOLDAGEM — ALPHA v1.4',
  `Versão: ${versao}`,
  '',
  'COMO TESTAR',
  '1. Extraia o ZIP inteiro para uma pasta.',
  '2. Abra "Abrir o jogo.bat" ou "Oficina de Soldagem.html" no Chrome ou Edge.',
  '3. O topo deve mostrar ALPHA v1.4 e uma navegação lateral.',
  'Não precisa de Node.js, instalação ou internet.',
  '',
  'ESTA VERSÃO',
  'Nova interface em estilo laboratório industrial.',
  'MIG/MAG é o processo disponível. Eletrodo revestido está apenas planejado.',
  'Versão de teste: conferência visual e dos dispositivos ainda pendente.',
  '',
  'CONTROLES',
  'Mouse: esquerdo solda, meio move a câmera, direito gira a peça.',
  'Caneta: Espaço move a câmera; E ou B giram a peça.',
  'Controle: analógico direito move a câmera; direcional gira a peça.',
  'Posicionamento só com arco fechado. Ajuste os comandos em Controles.',
  '',
  'DADOS',
  'Os dados ficam no navegador deste computador.',
  'Se mudar a pasta ou o arquivo, os dados anteriores podem não aparecer.',
  'Para preservar recordes, exporte o JSON na versão anterior.',
  '',
  'Modelo didático simplificado; não qualifica um procedimento de soldagem.',
  '',
].join('\r\n'))
console.log(`Portátil ${versao} gerado em ${saida}`)
