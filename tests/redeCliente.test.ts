import {describe,it,expect,vi} from 'vitest'
import {ClienteRede} from '../src/rede/cliente'
import {PROTOCOLO_REDE,MODELO_REDE,type SalaRede} from '../src/rede/contrato'
function estado(fase:SalaRede['fase'],agora:number):SalaRede{return{codigo:'ABC234',protocolo:PROTOCOLO_REDE,modelo:MODELO_REDE,config:{processo:'mig',missaoId:'suporte-carbono',dificuldade:'aprendiz'},fase,rodada:1,jogadores:[],agora,inicioEm:100,fimEm:180100,vencedorId:null,motivo:''}}
describe('cliente de rede',()=>{
 it('não volta do jogo à sala por uma resposta atrasada',async()=>{
  const recebidos:string[]=[],c=new ClienteRede({codigo:'ABC234',jogadorId:'A',token:'credencial',protocolo:PROTOCOLO_REDE},'http://servidor.test')
  const estados=[estado('partida',20),estado('espera',10),estado('contagem',21),estado('resultado',30)]
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(new ReadableStream({start(ctrl){for(const s of estados)ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(s)}\n\n`));ctrl.close()}}),{status:200})))
  c.aoEstado=s=>{recebidos.push(s.fase);if(s.fase==='resultado')c.fechar()}
  try{await c.conectar();expect(recebidos).toEqual(['partida','resultado'])}finally{c.fechar();vi.unstubAllGlobals()}
 })
 it('rejeita modelo do servidor diferente, sem iniciar uma tentativa',async()=>{
  const c=new ClienteRede({codigo:'ABC234',jogadorId:'A',token:'credencial',protocolo:PROTOCOLO_REDE},'http://servidor.test'),erros:string[]=[]
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(new ReadableStream({start(ctrl){ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({...estado('partida',20),modelo:'antigo'})}\n\n`));ctrl.close()}}))))
  c.aoConexao=(_,msg)=>erros.push(msg)
  try{await c.conectar();expect(c.estado).toBeNull();expect(erros.join(' ')).toContain('versão')}finally{c.fechar();vi.unstubAllGlobals()}
 })
})
