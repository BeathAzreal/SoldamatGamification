import { fileURLToPath } from 'node:url'
import { resolve,dirname } from 'node:path'
import { criarServidor,enderecos } from './http.mjs'
const porta=Number(process.env.PORT??5197),host=process.env.HOST??'0.0.0.0'
if(!Number.isInteger(porta)||porta<1||porta>65535)throw new Error('PORT deve ser uma porta entre 1 e 65535.')
const publico=process.env.PUBLIC_DIR??resolve(dirname(fileURLToPath(import.meta.url)),'../dist')
const app=criarServidor({publico,origens:process.env.ORIGENS_PERMITIDAS?.split(',').filter(Boolean)})
app.servidor.on('error',erro=>{console.error('Não foi possível iniciar o servidor:',erro.message);process.exitCode=1})
app.servidor.listen(porta,host,()=>{
 console.log('\nOFICINA DE SOLDAGEM v1.7 — X1 EM REDE\n')
 console.log('Mantenha esta janela aberta. Nos dois PCs, abra um dos endereços abaixo no navegador:')
 for(const url of enderecos(porta))console.log('  '+url)
 console.log('\nArcade → X1 em rede → Criar sala / Entrar por código.')
 console.log('No segundo PC, use o endereço com o IP do anfitrião; localhost só funciona neste PC.\nCtrl+C encerra o servidor e as salas.\n')
})
