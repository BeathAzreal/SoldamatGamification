import {describe,it,expect} from 'vitest'
import {avaliarEletrodo,limiteReforcoISO} from '../src/pontuacao/eletrodo'
import {Cordao} from '../src/modelo/cordao'
import {Acionamento15} from '../src/modelo/acionamento15'
import {PECAS_ELETRODO} from '../src/missoes/pecasEletrodo'
const p={...PECAS_ELETRODO[0],aberturaMm:0,inicioMm:20,fimMm:130}
function amostra(y=0,ate=130){const c=new Cordao(),m=new Acionamento15('eletrodo');for(let x=20;x<=ate;x+=.5)c.depositar(x,y,8,0,.25);m.tempoArcoS=20;return{c,m}}
describe('avaliação SMAW e limites ISO parciais',()=>{
 it('confere B/C/D e tetos diferentes para 502 e 503',()=>{
  expect(limiteReforcoISO(10,false,'B')).toBe(2);expect(limiteReforcoISO(10,false,'C')).toBe(2.5);expect(limiteReforcoISO(10,false,'D')).toBe(3.5)
  expect(limiteReforcoISO(100,false,'C')).toBe(7);expect(limiteReforcoISO(100,true,'C')).toBe(4)
 })
 it('não pontua sem soldagem e não dá pontos por superfície vazia limpa',()=>{expect(avaliarEletrodo(p,new Cordao(),new Acionamento15('eletrodo')).nota).toBe(0)})
 it('bloqueia a inspeção até quebrar e escovar a escória',()=>{
  const {c,m}=amostra();m.escoria.depositar(75,0,5)
  expect(avaliarEletrodo(p,c,m).nota).toBeNull();m.escoria.esfriar(10);m.escoria.martelar(75,0)
  expect(avaliarEletrodo(p,c,m).nota).toBeNull();m.escoria.escovar(75,0)
  expect(avaliarEletrodo(p,c,m).nota).not.toBeNull()
 })
 it('penaliza um ponto parado e metal fora da junta',()=>{
  const boa=amostra(),curta=amostra(0,24),fora=amostra(15)
  expect(avaliarEletrodo(p,boa.c,boa.m).nota!).toBeGreaterThan(700)
  expect(avaliarEletrodo(p,curta.c,curta.m).nota!).toBeLessThan(200)
  expect(avaliarEletrodo(p,fora.c,fora.m).nota).toBe(0)
 })
 it('usa escala de 0 a 1000 com parcelas somando 1000',()=>{
  const {c,m}=amostra(),r=avaliarEletrodo(p,c,m)
  expect(r.itens.reduce((s,i)=>s+i.maximo,0)).toBe(1000)
  expect(r.nota).toBeGreaterThanOrEqual(0);expect(r.nota).toBeLessThanOrEqual(1000)
 })
 it('é determinístico e não altera o cordão ou o modelo',()=>{
  const {c,m}=amostra(),v=c.volumeTotal(),tempo=m.tempoArcoS
  expect(avaliarEletrodo(p,c,m)).toEqual(avaliarEletrodo(p,c,m));expect(c.volumeTotal()).toBe(v);expect(m.tempoArcoS).toBe(tempo)
 })
})
