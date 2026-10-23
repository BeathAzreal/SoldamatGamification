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
    'VERSÃO 3D ALPHA v1.3 (2026-10-23)',
    '- CÂMERA LIVRE (só com o arco fechado):',
    '    Mouse ........ arraste com o botão do meio (rodinha): a câmera dá a volta na peça e sobe/desce;',
    '                   a roda aproxima e afasta; "Centralizar" volta para a vista de frente.',
    '    Caneta ....... segure ESPAÇO e mova a caneta.',
    '    Controle ..... analógico direito.',
    '- GIRAR A PEÇA (só com o arco fechado):',
    '    Mouse ........ arraste com o botão direito: para os lados gira no plano, para cima/baixo tomba (0° a 180°).',
    '    Caneta ....... segure E ou B e mova a caneta (com a tecla apertada a caneta não abre o arco).',
    '    Controle ..... direcional. Os botões ⟲ ⟳ ▲ ▼ na tela continuam valendo.',
    '- Os botões, a roda e as teclas mudam em "Controles", ao lado de "Calibrar" na bancada (antes da tentativa).',
    '- A peça fica numa oficina (piso, paredes, teto) presa num suporte: ao tombar, aparece o chão, a parede ou o teto.',
    '  O mini desenho ao lado dos botões mostra a peça de lado.',
    '- A tocha tem cano reto: empurrando ou puxando, ela inclina 20° e isso aparece no 3D.',
    '- As telas cabem também em notebook 1280×720, sem rolar; "O que aconteceu e como é calculado" abre em abas.',
    '- Mecânica: a corrente agora sai da alimentação, do arame e da DISTÂNCIA BICO–PEÇA (DBCP, nova escolha',
    '  na bancada: 10, 15 ou 20 mm). Mais DBCP = menos corrente e menos fusão, com o mesmo metal.',
    '- Pausar, esconder a janela ou tirar o foco não vira solda parada.',
    '- PONTUAÇÃO DE 0 A 1000 ("pontuacao-v3"): fusão prevista 400, geometria do cordão 250, regularidade 150,',
    '  controle térmico 100 e execução 100 (arco sobre a junta, reinícios de arco, metal no trecho). Cada critério',
    '  perde pontos aos poucos, conforme o tamanho do erro. Recordes das versões antigas (0 a 100) ficam separados.',
    '- Junta de topo: o metal enche primeiro a fresta entre as chapas; o cordão aparece em escala real (sem exagero).',
    '',
    'VERSÃO 3D ALPHA v1.2 (2026-10-23)',
    '- O jogo é só 3D (sem WebGL, ele usa um desenho 2D de reserva).',
    '- Juntas reais: topo reto, topo em V (chapa grossa: encha o V devagar ou em dois passes),',
    '  em T, sobreposta e de canto. Cada missão tem a sua; no treino livre dá para escolher.',
    '- Posicionar a peça (só com o arco fechado):',
    '    Q / E ou ⟲ ⟳ ...... gira a peça no próprio plano',
    '    W / S ou ▲ ▼ ...... tomba a peça de 0° (face para cima) a 180° (de cabeça para baixo)',
    '  O canto da peça mostra a posição de soldagem (plana, horizontal, vertical, sobrecabeça).',
    '  Na vertical, subir funde mais e descer funde menos; de cabeça para baixo o cordão fica mais alto.',
    '  Algumas peças estão presas na estrutura e não giram (ex.: o corrimão).',
    '- A técnica (empurrando/puxando) agora inclina a tocha no 3D.',
    '- Saíram o "Ver desenho e ficha" e o "Movimento da tocha"; o arame mostra 0,8, 1,0 e 1,2 mm em toda missão.',
    '- As telas cabem numa página; os textos longos abrem por botões ("O que aconteceu e como é calculado",',
    '  "Por que saiu assim").',
    '- Os recordes desta pasta ficam separados dos das outras versões.',
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
