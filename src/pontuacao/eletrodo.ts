import type { Cordao } from '../modelo/cordao'
import type { Acionamento15 } from '../modelo/acionamento15'
import type { PecaEletrodo } from '../missoes/pecasEletrodo'
import { INFO_JUNTA } from '../modelo/juntas'

export type NivelISO = 'B' | 'C' | 'D'
/** ISO 5817:2023, tabela 1, itens 1.9/1.10. Só o limite dimensional h/b; ver docs/AVALIACAO-SMAW.md. */
export function limiteReforcoISO(b: number, filete: boolean, nivel: NivelISO): number {
  const fator = { B: .1, C: .15, D: .25 }[nivel]
  const teto = filete ? { B: 3, C: 4, D: 5 }[nivel] : { B: 5, C: 7, D: 10 }[nivel]
  return Math.min(teto, 1 + fator * Math.max(0,b))
}
/** H77: nota didática independente de uma declaração de conformidade ISO. */
export function avaliarEletrodo(p: PecaEletrodo, c: Cordao, m: Acionamento15, nivel: NivelISO = 'C') {
  const filete = INFO_JUNTA[p.junta].familia === 'filete', cordoes = [c,...c.soltos]
  let naoPreenchidas=0
  let total=0,cobertos=0,sequencia=0,maior=0,medidas=0,dentro=0,desvioPior=-Infinity,pior={h:0,b:0,limite:0}
  let alinhado=0,metal=0
  for(const cord of cordoes) for(let i=0;i<cord.nPosicoes;i++) {
    const s=cord.secao(i)
    metal+=s.areaMm2
    if(Math.abs(s.yCentroMm)<=Math.max(2,m.diametroMm))alinhado+=s.areaMm2
  }
  for(let x=p.inicioMm;x<=p.fimMm;x+=1) {
    total++
    const secoes=cordoes.map(cord=>cord.secao(cord.indiceEm(x)))
    if(secoes.some(s=>s.areaMm2>0 && s.alturaMm<0))naoPreenchidas++
    const validas=secoes.filter(s=>s.larguraMm>=2 && Math.abs(s.yCentroMm)<=Math.max(2,m.diametroMm) && s.alturaMm>=0)
    if(validas.length) { cobertos++;sequencia++;maior=Math.max(maior,sequencia) } else sequencia=0
    for(const s of validas) {
      const limite=limiteReforcoISO(s.larguraMm,filete,nivel),desvio=s.alturaMm-limite
      medidas++;if(desvio<=1e-8)dentro++
      if(desvio>desvioPior){desvioPior=desvio;pior={h:s.alturaMm,b:s.larguraMm,limite}}
    }
  }
  const executado=m.tempoArcoS>0 && metal>0, cobertura=total?cobertos/total:0
  const limpeza=m.escoria.gerada>0?Math.max(0,1-m.escoria.cobertura/m.escoria.gerada):0
  const inspecaoPendente=executado && m.escoria.cobertura>0.01
  const itens=[
    {nome:'Cobertura da junta',maximo:300,fracao:cobertura,explicacao:`${Math.round(cobertura*100)}% do trecho com metal na junta e face preenchida. Objetivo do jogo.`},
    {nome:`Dimensão ISO 5817 · ${filete?'503':'502'} · ${nivel}`,maximo:400,fracao:medidas?dentro/medidas:0,explicacao:inspecaoPendente?'Remova a escória para medir.':medidas?`Pior seção: h=${pior.h.toFixed(2)} mm; b=${pior.b.toFixed(2)} mm; limite h=${pior.limite.toFixed(2)} mm.`:'Sem seções preenchidas para medir.'},
    {nome:'Alinhamento na junta',maximo:150,fracao:metal?alinhado/metal:0,explicacao:'Fração do metal próxima à junta. Tolerância didática do jogo, não da ISO.'},
    {nome:'Continuidade do trecho',maximo:150,fracao:total?maior/total:0,explicacao:'Maior trecho unido sem lacunas, em relação ao trecho solicitado. Critério do jogo.'},
  ].map(i=>({...i,pontos:executado?Math.round(i.fracao*i.maximo):0}))
  const fator=Math.min(1,cobertura/.8)
  const nota=inspecaoPendente?null:executado?Math.round(itens.reduce((a,i)=>a+i.pontos,0)*fator):0
  const arco=m.tempoFaixaS,tempo=arco.curto+arco.adequado+arco.longo
  return {nota,nivel,itens,cobertura,limpeza,inspecaoPendente,fator,medidas,dentro,pior,
    criterioISO:inspecaoPendente?'Remova a escória antes da inspeção.':!medidas?(naoPreenchidas?'O metal ainda está abaixo da face: complete o preenchimento da junta.':'Sem medições dimensionais.'):dentro===medidas?'Dimensão h/b dentro do limite selecionado.':'Há seções fora do limite dimensional selecionado.',
    dicas:`Arco adequado: ${tempo?Math.round(arco.adequado/tempo*100):0}% do tempo. Eletrodo grudou ${m.grudadas} vez(es). Estes dados orientam a técnica; não são critérios ISO de aceitação.`,
    limites:'Verificação parcial: não avalia transição suave, ângulo do pé, trincas, porosidade, fusão, penetração ou inclusões internas. Não declara conformidade global nem qualifica soldador.'}
}
