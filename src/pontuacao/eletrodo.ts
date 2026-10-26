import type { Acionamento15 } from '../modelo/acionamento15'
import type { PecaEletrodo } from '../missoes/pecasEletrodo'
import { DepositoEletrodo, alvoEletrodo, trechoEletrodo } from '../modelo/depositoEletrodo'

export type NivelISO = 'B' | 'C' | 'D'
/** ISO 5817:2023, tabela 1, itens 1.9/1.10. Só h/b; ver docs/AVALIACAO-SMAW.md. */
export function limiteReforcoISO(b:number,filete:boolean,nivel:NivelISO):number{
  return Math.min(filete?{B:3,C:4,D:5}[nivel]:{B:5,C:7,D:10}[nivel],1+{B:.1,C:.15,D:.25}[nivel]*Math.max(0,b))
}

/** H79: somente o perfil conectado à emenda; depósitos em outras faces não o substituem. */
function perfilAvaliado(c:DepositoEletrodo,x:number){
  const a=alvoEletrodo(c.peca),passo=c.dy
  let e=0,d=0
  if(c.espessura(x,0)<.1)return null
  while(e>-c.alcanceY && c.espessura(x,e-passo)>.1)e-=passo
  while(d<c.alcanceY && c.espessura(x,d+passo)>.1)d+=passo
  const he=c.altura(x,e),hd=c.altura(x,d)
  let h=-Infinity
  for(let y=e;y<=d;y+=passo){
    const base=a.filete?he+(hd-he)*(y-e)/Math.max(passo,d-e):a.raiz?-c.peca.espessuraMm:0
    h=Math.max(h,c.altura(x,y)-base)
  }
  return {h:Math.max(0,h),b:a.filete?Math.hypot(d-e,hd-he):d-e}
}

/** A nota é didática (0–1000); as comparações ISO são parciais e explicitamente separadas. */
export function avaliarEletrodo(p:PecaEletrodo,c:DepositoEletrodo,m:Acionamento15,nivel:NivelISO='C'){
  const alvo=alvoEletrodo(p)
  let total=0,cobertos=0,somaPreenchimento=0,sequencia=0,maior=0,medidas=0,dentro=0,desvioPior=-Infinity
  let pior={h:0,b:0,limite:0},alinhado=0,metal=0
  for(let j=0;j<c.ny;j++)for(let i=0;i<c.nx;i++){
    const v=c.metal[j*c.nx+i]*c.dx*c.dy
    metal+=v
    if(c.x(i)>=p.inicioMm && c.x(i)<=p.fimMm && Math.abs(c.y(j))<=alvo.faixa)alinhado+=v
  }
  for(let x=p.inicioMm+.5;x<p.fimMm;x++){
    total++
    const trecho=trechoEletrodo(c,x)
    somaPreenchimento+=trecho.progresso
    if(trecho.coberto){cobertos++;sequencia++;maior=Math.max(maior,sequencia)}else sequencia=0
    const perfil=trecho.coberto?perfilAvaliado(c,x):null
    if(!perfil)continue
    // Uma raiz de 2 mm não é reforço na face de uma chapa de 12 mm.
    const limite=alvo.raiz?4:limiteReforcoISO(perfil.b,alvo.filete,nivel),desvio=perfil.h-limite
    medidas++;if(desvio<=1e-8)dentro++
    if(desvio>desvioPior){desvioPior=desvio;pior={...perfil,limite}}
  }
  const executado=m.tempoArcoS>0 && metal>0,cobertura=total?cobertos/total:0,preenchimento=total?somaPreenchimento/total:0
  const limpeza=m.escoria.gerada>0?Math.max(0,1-m.escoria.cobertura/m.escoria.gerada):0
  const inspecaoPendente=executado && m.escoria.cobertura>.01
  const itens=[
    {nome:'União das duas bordas',maximo:300,fracao:cobertura,explicacao:`${Math.round(cobertura*100)}% dos ${p.fimMm-p.inicioMm} mm solicitados atingem o perfil-alvo nas duas bordas e no centro.`},
    {nome:'Preenchimento e perfil',maximo:400,fracao:.5*preenchimento+.5*(total?dentro/total:0),explicacao:inspecaoPendente?'Remova a escória para inspecionar.':`${Math.round(preenchimento*100)}% do preenchimento-alvo. `+(alvo.raiz?'Passe de raiz: camada-alvo 2 mm, teto didático 4 mm; não é o reforço final ISO.':medidas?`Comparação parcial ISO 5817 · ${alvo.filete?'503':'502'} · ${nivel}: h=${pior.h.toFixed(2)} mm, b=${pior.b.toFixed(2)} mm, limite h=${pior.limite.toFixed(2)} mm.`:'A face ainda não foi preenchida para comparar o reforço ISO.')},
    {nome:'Metal na região solicitada',maximo:150,fracao:metal?alinhado/metal:0,explicacao:'Metal entre INÍCIO e FIM, próximo à emenda. Depósitos fora desse trecho não preenchem o objetivo.'},
    {nome:'Continuidade da união',maximo:150,fracao:total?maior/total:0,explicacao:'Maior trecho unido sem lacunas, medido sobre a mesma superfície 3D.'},
  ].map(i=>({...i,pontos:executado?Math.round(i.fracao*i.maximo):0}))
  const fator=Math.min(1,preenchimento/.8)
  const nota=inspecaoPendente?null:executado?Math.min(1000,Math.round(itens.reduce((a,i)=>a+i.pontos,0)*fator)):0
  const arco=m.tempoFaixaS,tempo=arco.curto+arco.adequado+arco.longo
  return {nota,nivel,itens,cobertura,preenchimento,limpeza,inspecaoPendente,fator,medidas,dentro,pior,
    criterioISO:inspecaoPendente?'Remova a escória antes da inspeção.':alvo.raiz?'Avaliação do passe de raiz; não exige encher todo o chanfro nem declara aprovação ISO.':!medidas?'Complete a união das bordas e o preenchimento da face; o reforço ainda não pode ser comparado.':dentro===medidas?'Dimensão h/b dentro do limite selecionado, nas seções preenchidas.':'Há seções fora do limite dimensional selecionado.',
    dicas:`${alvo.descricao}. Arco adequado: ${tempo?Math.round(arco.adequado/tempo*100):0}% do tempo. Eletrodo grudou ${m.grudadas} vez(es). Técnica e metas de preenchimento são critérios didáticos.`,
    limites:'Verificação parcial: não avalia transição suave, trincas, porosidade, fusão, penetração ou inclusões internas. Não declara conformidade global nem qualifica soldador.'}
}
