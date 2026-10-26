import { h } from '../dom'
import { abrirPainel } from '../dialogo'
import { conceito } from './pontuacao'
import type { avaliarEletrodo } from '../../pontuacao/eletrodo'

type Resultado=ReturnType<typeof avaliarEletrodo>
/** Mesmo fluxo do MIG: tentativa encerrada, placar, critérios e próxima tentativa. */
export function resultadoEletrodo(r:Resultado,op:{nova:()=>void;pecas:()=>void;camada:(oculta:boolean)=>void}){
  const meta=r.cobertura>=.95 && r.preenchimento>=.95 && !r.inspecaoPendente
  const letra=conceito(r.nota,meta,1000)
  const totalBase=r.itens.reduce((s,i)=>s+i.pontos,0),ajuste=totalBase-Math.round(totalBase*r.fator)
  const titulo=h('h2',{tabindex:'-1'},'RESULTADO DA TENTATIVA')
  const crosta=h('button',{type:'button','aria-pressed':'false',on:{click:()=>{
    const oculta=crosta.getAttribute('aria-pressed')!=='true'
    crosta.setAttribute('aria-pressed',String(oculta));op.camada(oculta)
    crosta.textContent=oculta?'Mostrar escória':'Ver metal sem escória'
  }}},'Ver metal sem escória')
  const detalhes=()=>abrirPainel('Avaliação da tentativa',h('section',{class:'resultado-smaw'},
    h('p',{},'Nota automática do jogo, de 0 a 1000. Critérios geométricos adaptados ao eletrodo revestido.'),
    h('ul',{},...r.itens.map(i=>h('li',{},h('strong',{},`${i.nome}: ${i.pontos}/${i.maximo}`),h('small',{},i.explicacao)))),
    h('p',{},`Ajuste por preenchimento: −${ajuste}. Escória remanescente: −${r.penalidadeEscoria}. Total limitado a 0–1000.`),
    h('p',{},r.criterioISO),h('p',{},r.dicas),h('small',{},r.limites)))
  const painel=h('aside',{class:'p15-painel p15-resultado','aria-label':'Resultado da tentativa'},
    titulo,h('div',{class:'placar'},
      h('span',{class:`conceito conceito-${letra}`,'aria-label':`Conceito ${letra}`},letra),
      h('div',{},h('span',{class:'placar-rotulo'},'PONTUAÇÃO AUTOMÁTICA'),h('div',{},h('span',{class:'placar-numero'},String(r.nota)),h('span',{class:'placar-max'},' / 1000')))),
    h('p',{class:meta?'selo selo-ok':'selo selo-falha'},meta?'Meta do exercício atingida':'Há pontos para melhorar'),
    h('ul',{class:'barras-categorias','aria-label':'Notas por categoria'},...r.itens.map(i=>h('li',{},
      h('div',{class:'barra-cabeca'},h('span',{},i.nome),h('strong',{},`${i.pontos}/${i.maximo}`)),
      h('div',{class:'barra-trilho',role:'meter','aria-label':i.nome,'aria-valuemin':'0','aria-valuemax':String(i.maximo),'aria-valuenow':String(i.pontos)},h('div',{class:'barra-valor',style:`width:${100*i.pontos/i.maximo}%`}))))),
    h('p',{class:'p15-descontos'},ajuste||r.penalidadeEscoria?`Descontos: preenchimento −${ajuste} · escória −${r.penalidadeEscoria}`:'Sem descontos adicionais.'),
    h('button',{type:'button',on:{click:detalhes}},'Detalhes da avaliação'),
    h('small',{},'Inspecione em 360° com o botão do meio. + / − controlam o zoom. A tentativa está encerrada.'),
    crosta,h('div',{class:'p15-proxima'},
      h('button',{type:'button',class:'primario',on:{click:op.nova}},'Nova tentativa'),
      h('button',{type:'button',on:{click:op.pecas}},'Escolher outra peça')))
  return {painel,focar:()=>titulo.focus()}
}
