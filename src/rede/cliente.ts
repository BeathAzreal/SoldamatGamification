import { PROTOCOLO_REDE,MODELO_REDE,type CredencialRede,type ConfigRede,type SalaRede,type ComandoRede } from './contrato'

export class ClienteRede {
 private abortar=new AbortController()
 private parado=false
 estado:SalaRede|null=null
 aoEstado:((s:SalaRede)=>void)|null=null
 aoConexao:((conectado:boolean,mensagem:string)=>void)|null=null
 constructor(readonly credencial:CredencialRede,readonly base=location.origin){}
 static async verificar(base=location.origin){const r=await fetch(new URL('/api/rede/info',base));if(!r.ok)throw new Error('Abra o jogo pelo endereço exibido no servidor de rede.');const d=await r.json();if((d.protocolo!==PROTOCOLO_REDE||d.modelo!==MODELO_REDE))throw new Error('Versão incompatível. Recarregue a página do servidor.');return d}
 static async criar(nome:string,config:ConfigRede,base=location.origin){return this.solicitar('/api/salas',{nome,config,protocolo:PROTOCOLO_REDE},undefined,base) as Promise<CredencialRede>}
 static async entrar(codigo:string,nome:string,base=location.origin){return this.solicitar(`/api/salas/${codigo}/entrar`,{nome,protocolo:PROTOCOLO_REDE},undefined,base) as Promise<CredencialRede>}
 private static async solicitar(caminho:string,corpo:unknown,token?:string,base=location.origin){
  const abortar=new AbortController(),timer=setTimeout(()=>abortar.abort(),15000)
  try{const r=await fetch(new URL(caminho,base),{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(corpo),signal:abortar.signal});const d=await r.json();if(!r.ok)throw new Error(d.erro??'Não foi possível conectar.');return d}finally{clearTimeout(timer)}
 }
 async comando(c:ComandoRede){const s=await ClienteRede.solicitar(`/api/salas/${this.credencial.codigo}/comandos`,c,this.credencial.token,this.base) as SalaRede;this.receber(s);return s}
 private receber(s:SalaRede){
  if(this.parado)return
  const ordem={espera:0,contagem:1,partida:2,resultado:3,encerrada:4},anterior=this.estado
  if(anterior && (s.rodada<anterior.rodada || s.agora<anterior.agora || (s.rodada===anterior.rodada && ordem[s.fase]<ordem[anterior.fase])))return
  if(s.protocolo!==PROTOCOLO_REDE||s.modelo!==MODELO_REDE){this.aoConexao?.(false,'O servidor mudou de versão. Recarregue o jogo.');this.fechar();return}this.estado=s;this.aoEstado?.(s)}
 async conectar(){
  while(!this.parado){
   try{
    const r=await fetch(new URL(`/api/salas/${this.credencial.codigo}/eventos`,this.base),{headers:{Authorization:`Bearer ${this.credencial.token}`},signal:this.abortar.signal,cache:'no-store'})
    if(!r.ok){const d=await r.json();if([403,404,409].includes(r.status)){this.aoConexao?.(false,d.erro);this.fechar();return}throw Error(d.erro)}
    this.aoConexao?.(true,'Conectado ao servidor')
    const leitor=r.body!.getReader(),decodificador=new TextDecoder();let texto=''
    for(;;){const {value,done}=await leitor.read();if(done)break;texto+=decodificador.decode(value,{stream:true});let fim:number
     while((fim=texto.indexOf('\n\n'))>=0){const evento=texto.slice(0,fim);texto=texto.slice(fim+2);const dado=evento.split('\n').find(l=>l.startsWith('data: '));if(dado){const obj=JSON.parse(dado.slice(6));if(evento.startsWith('event: erro'))throw Error(obj.erro);this.receber(obj)}}
    }
    if(!this.parado)throw Error('Conexão interrompida.')
   }catch(e){if(this.parado)return;this.aoConexao?.(false,`Reconectando… ${(e as Error).message}`);await new Promise(ok=>setTimeout(ok,1500))}
  }
 }
 fechar(){this.parado=true;this.abortar.abort()}
}
