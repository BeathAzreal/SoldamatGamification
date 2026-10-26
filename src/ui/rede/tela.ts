import { abrirPainel } from '../dialogo'
import type { App } from '../app'
import { h } from '../dom'
import { ClienteRede } from '../../rede/cliente'
import { MISSOES_REDE,PROTOCOLO_REDE,type CredencialRede } from '../../rede/contrato'
import { paginaRede,botaoRede } from './pagina'
import { CHAVE_SESSAO,SessaoRede,sairParaArcade } from './sessao'

export function telaRede(app:App){
 const erro=h('p',{class:'rede-erro',role:'alert'}),nome=h('input',{maxLength:24,placeholder:'Seu apelido',required:true,'aria-label':'Seu apelido'}),codigo=h('input',{maxLength:6,placeholder:'Ex.: ABC234','aria-label':'Código para entrar',autocomplete:'off',on:{input:e=>{const el=e.target as HTMLInputElement;el.value=el.value.toUpperCase().replace(/[^A-Z2-9]/g,'')}}})
 const missao=h('select',{'aria-label':'Missão do x1'},...MISSOES_REDE.map(m=>h('option',{value:m.id},m.titulo))),dificuldade=h('select',{'aria-label':'Dificuldade do x1'},h('option',{value:'aprendiz'},'Aprendiz'),h('option',{value:'profissional'},'Profissional'))
 let conectado=false,ocupado=false,vivo=true
 const entrarSessao=(c:CredencialRede)=>new SessaoRede(app,c,()=>telaRede(app)).iniciar()
 const acao=async(tipo:'criar'|'entrar')=>{
  if(ocupado||!conectado)return
  if(!nome.value.trim()){erro.textContent='Digite seu apelido.';nome.focus();return}
  if(tipo==='entrar'&&codigo.value.length!==6){erro.textContent='Digite os seis caracteres do código.';codigo.focus();return}
  ocupado=true;atualizar();erro.textContent=''
  try{const c=tipo==='criar'?await ClienteRede.criar(nome.value,{processo:'mig',missaoId:missao.value,dificuldade:dificuldade.value as 'aprendiz'|'profissional'}):await ClienteRede.entrar(codigo.value,nome.value);if(vivo)entrarSessao(c)}catch(e){erro.textContent=(e as Error).message}finally{ocupado=false;atualizar()}
 }
 const criar=botaoRede('Criar sala',()=>void acao('criar'),true),entrar=botaoRede('Entrar por código',()=>void acao('entrar'))
 const atualizar=()=>{criar.disabled=entrar.disabled=!conectado||ocupado}
 const endereco=h('input',{type:'url',placeholder:'http://IP-do-servidor:5197',value:location.protocol==='file:'?'':location.origin,'aria-label':'Endereço do servidor'})
 const abrirServidor=botaoRede('Abrir servidor',()=>{try{const url=new URL(endereco.value);if(!['http:','https:'].includes(url.protocol))throw Error();location.assign(url.origin+'/?rede=1')}catch{erro.textContent='Use um endereço HTTP ou HTTPS válido.'}})
 const info=h('p',{class:'rede-conexao',role:'status'},'Verificando servidor…')
 const caixa=h('section',{class:'rede-caixa'},info,h('label',{},'APELIDO',nome),
  h('div',{class:'rede-opcoes'},h('label',{},'MISSÃO',missao),h('label',{},'DIFICULDADE',dificuldade)),criar,
  h('div',{class:'rede-entrar'},codigo,entrar),erro,
  botaoRede('Como conectar os dois PCs',()=>void abrirPainel('Conectar o x1 em rede',h('section',{class:'rede-caixa'},h('p',{},'No primeiro PC, execute INICIAR-REDE.bat. Nos dois navegadores, abra o endereço de rede mostrado nessa janela. Crie a sala em um PC e digite o código no outro.'),h('p',{},'Ambos confirmam prontidão. Feche o arco e encerre a tentativa em até três minutos; sem entrega no prazo a nota é zero. Pausar não para o relógio do servidor.'),h('label',{},'ENDEREÇO DO SERVIDOR',endereco),abrirServidor))),
  botaoRede('Voltar ao Arcade',()=>sairParaArcade(app)))
 const tela=paginaRede('X1 EM REDE','ARCADE / DOIS COMPUTADORES',caixa)
 void app.ir(a=>{const limpar=tela(a);return()=>{vivo=false;limpar?.()}},'Versus · X1 em rede')
 atualizar()
 void(async()=>{
  try{
   if(!['http:','https:'].includes(location.protocol))throw Error('Para x1, execute INICIAR-REDE.bat e abra o endereço do servidor. O HTML portátil continua funcionando offline.')
   const dados=await ClienteRede.verificar();if(!vivo)return
   conectado=true;info.textContent='Servidor conectado · MIG/MAG · sala privada para dois jogadores';atualizar()
   try{const salvo=JSON.parse(sessionStorage.getItem(CHAVE_SESSAO)??'null') as CredencialRede|null;if(salvo?.protocolo===PROTOCOLO_REDE && typeof salvo.token==='string' && /^[A-Z2-9]{6}$/.test(salvo.codigo))entrarSessao(salvo)}catch{/* sem sessão anterior */}
   if(Array.isArray(dados.enderecos))endereco.value=['localhost','127.0.0.1','[::1]'].includes(location.hostname)?dados.enderecos.find((u:string)=>!u.includes('localhost'))??location.origin:location.origin
  }catch(e){if(vivo){info.textContent='Servidor de rede não encontrado';erro.textContent=(e as Error).message;}}
 })()
}
