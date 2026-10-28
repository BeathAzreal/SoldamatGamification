import type { PecaEletrodo } from '../missoes/pecasEletrodo'
import { limitesPecaEletrodo } from '../missoes/pecasEletrodo'
import { faceRaizMm, INFO_JUNTA, pontoNaSuperficie } from './juntas'

/** H79: altura real do metal-base; o fundo aberto usa uma raiz retentora didática. */
export function baseEletrodo(p: PecaEletrodo, y: number): number {
  if (INFO_JUNTA[p.junta].familia === 'filete') return pontoNaSuperficie(p.junta,p,y)[1]
  const n=Math.abs(y), a=p.aberturaMm/2
  if (p.junta==='topo') return n<a ? -p.espessuraMm : 0
  if(n<=a) return -p.espessuraMm
  return Math.min(0,-p.espessuraMm+faceRaizMm(p)+(n-a)/Math.tan(Math.PI/6))
}

/** Depósito SMAW em células locais: sem deslocar metal para uma junta pré-fixada. */
export class DepositoEletrodo {
  readonly nx=150
  readonly ny=200
  readonly dx=1
  readonly dy=.5
  readonly metal=new Float64Array(this.nx*this.ny)
  readonly limitesX
  readonly alcanceY
  versao=0
  private volume=0
  constructor(readonly peca:PecaEletrodo){
    this.limitesX=limitesPecaEletrodo(peca)
    this.alcanceY=INFO_JUNTA[peca.junta].familia==='filete'?50/Math.SQRT2:50
  }
  x(i:number){return (i+.5)*this.dx}
  y(j:number){return -50+(j+.5)*this.dy}
  naPeca(x:number,y:number){return x>=this.limitesX.min && x<=this.limitesX.max && Math.abs(y)<=this.alcanceY}
  private amostrar(x:number,y:number,absoluta=false):number {
    if(!this.naPeca(x,y))return 0
    const u=Math.max(0,Math.min(this.nx-1,x/this.dx-.5)),v=Math.max(0,Math.min(this.ny-1,(y+50)/this.dy-.5))
    const i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j
    const q=(i:number,j:number)=>{
      i=Math.min(this.nx-1,i);j=Math.min(this.ny-1,j)
      return this.metal[j*this.nx+i]+(absoluta?baseEletrodo(this.peca,this.y(j)):0)
    }
    return q(i,j)*(1-a)*(1-b)+q(i+1,j)*a*(1-b)+q(i,j+1)*(1-a)*b+q(i+1,j+1)*a*b
  }
  espessura(x:number,y:number){return this.amostrar(x,y)}
  altura(x:number,y:number){
    // Interpole a altura absoluta, como os triângulos do 3D, sem somar o fundo outra vez na borda.
    return this.espessura(x,y)>1e-9?this.amostrar(x,y,true):baseEletrodo(this.peca,y)
  }
  volumeTotal(){return this.volume}
  depositar(x:number,y:number,volume:number,_agora=0,razao=.25,_oscilacao=0,instabilidade=0){
    if(volume<=0 || !this.naPeca(x,y))return
    const sx=1.2,sy=Math.max(.8,Math.min(1.8,1.05+( .25-razao)*2+Math.abs(instabilidade)*.4))
    const celulas:{k:number;peso:number;altura:number}[]=[]
    let minimo=Infinity
    for(let j=Math.max(0,Math.floor((y+50-3*sy)/this.dy));j<=Math.min(this.ny-1,Math.ceil((y+50+3*sy)/this.dy));j++)
      for(let i=Math.max(0,Math.floor(x-3*sx));i<=Math.min(this.nx-1,Math.ceil(x+3*sx));i++){
        const cx=this.x(i),cy=this.y(j)
        if(!this.naPeca(cx,cy))continue
        const r=((cx-x)/sx)**2+((cy-y)/sy)**2
        if(r>9)continue
        const k=j*this.nx+i,altura=baseEletrodo(this.peca,cy)+this.metal[k]
        minimo=Math.min(minimo,altura)
        celulas.push({k,peso:Math.exp(-.5*r),altura})
      }
    // Só o metal novo molha o entorno imediato; não move cordões frios nem salta para a raiz.
    let soma=0
    // Após preencher o perfil-alvo, a distribuição local mantém a coroa convexa.
    const nivel=alvoEletrodo(this.peca).altura+1.2
    for(const c of celulas){c.peso/=1+2*Math.max(0,Math.min(nivel,c.altura)-Math.min(nivel,minimo));soma+=c.peso}
    if(!soma)return
    for(const c of celulas)this.metal[c.k]+=volume*c.peso/soma/(this.dx*this.dy)
    this.volume+=volume;this.versao++
  }
}

/** A região avaliada vem do trabalho solicitado, não da altura global da chapa. */
export function alvoEletrodo(p:PecaEletrodo){
  const filete=INFO_JUNTA[p.junta].familia==='filete',raiz=p.junta==='v'
  // H91: cordão sobre chapa — miolo de um diâmetro de largura com pelo menos 1,5 mm de altura.
  if(p.sobreChapa)return {raiz:false,filete:false,meia:p.diametroMm/2,faixa:p.diametroMm+2,altura:1.5,descricao:'Cordão em relevo sobre a chapa (pelo menos 1,5 mm de altura no miolo, sem falhas)'}
  const meia=filete?2.8:Math.max(.6,p.aberturaMm/2)
  return {raiz,filete,meia,faixa:meia+2,
    altura:raiz?-p.espessuraMm+2:filete?2.8:0,
    descricao:raiz?'Passe de raiz no fundo do chanfro (camada de 2 mm)':filete?'Filete no canto entre as duas chapas (perna-alvo 4 mm)':'União e preenchimento da abertura até a face das chapas',
  }
}

export function trechoEletrodo(c:DepositoEletrodo,x:number){
  const a=alvoEletrodo(c.peca)
  let progresso=0,unidos=0
  for(let k=0;k<9;k++){
    const y=(-.9+1.8*k/8)*a.meia,base=baseEletrodo(c.peca,y),metal=c.espessura(x,y)
    const falta=Math.max(.2,a.altura-base)
    progresso+=metal>.001?Math.max(0,Math.min(1,(c.altura(x,y)-base)/falta))/9:0
    if(metal>.1 && c.altura(x,y)>=a.altura-.2)unidos++
  }
  // As duas bordas precisam estar unidas: só o centro cheio não conta como junta completa.
  return {progresso,coberto:unidos===9}
}
