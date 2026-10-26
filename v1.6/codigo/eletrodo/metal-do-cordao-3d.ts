/*
 * █ Eletrodo: metal do cordão (3D)
 *
 * O que faz: transforma o metal depositado (deposito-do-cordao.ts) num
 *    sólido 3D fechado: superfície com micro-relevo de escamas, fundo e
 *    paredes. Também pinta a cor de calor e a mancha da cratera que a
 *    análise do cordão encontrou (H84).
 *
 * Onde mexer: a cor do metal está em atualizar() (tom); as cores de calor
 *    estão em corDeCalor().
 */
import * as THREE from 'three'
import { DepositoEletrodo, baseEletrodo } from './deposito-do-cordao'

/** H80: micro-relevo de escamas, limitado a 0,06 mm; só acabamento visual. */
export function alturaMetalEletrodo(c:DepositoEletrodo,x:number,y:number){
  const t=c.espessura(x,y)
  const escama=.06*Math.min(1,t/.4)*Math.cos(x*2.5+Math.abs(y)*.7)
  return c.altura(x,y)+.015+escama
}

/**
 * H84: cor de óxido pelo calor do passe (× referência da peça): palha, depois
 * marrom e azulado onde passou muito da referência. Devolve [r, g, b] e o
 * quanto misturar com a cor do metal.
 */
function corDeCalor(f: number): [number, number, number, number] {
  if (f < 1.3) return [0, 0, 0, 0]
  if (f < 1.8) return [.52, .42, .24, .45 * (f - 1.3) / .5]
  if (f < 2.3) return [.44, .28, .2, .45 + .15 * (f - 1.8) / .5]
  return [.24, .28, .46, .6]
}

/** H80: sólido fechado, do fundo da abertura à superfície atual, não um decalque. */
export function criarMetalEletrodo(){
  const nx=150,ny=200,n=nx*ny
  const pos=new Float32Array(n*2*3),cores=new Float32Array(n*2*3)
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
  geo.setAttribute('color',new THREE.BufferAttribute(cores,3))
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:.68})
  const malha=new THREE.Mesh(geo,material);malha.frustumCulled=false;malha.castShadow=malha.receiveShadow=true
  let anterior:DepositoEletrodo|null=null,versao=-1
  // H84: calor e cratera por fatia ao longo da junta (null = sem marcas).
  let marcas:{calor:Float32Array;cratera:Float32Array;passoMm:number}|null=null
  return {malha,
  definirMarcas(m:{calor:Float32Array;cratera:Float32Array;passoMm:number}|null){marcas=m;versao=-1},
  atualizar(c:DepositoEletrodo){
    if(c===anterior && versao===c.versao)return
    anterior=c;versao=c.versao
    const indices:number[]=[],ativo=new Uint8Array(n)
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const k=j*nx+i,x=c.x(i),y=c.y(j)
      pos.set([x-75,alturaMetalEletrodo(c,x,y),y],k*3)
      pos.set([x-75,baseEletrodo(c.peca,y),y],(k+n)*3)
      const onda=.012*Math.cos(x*2.5+Math.abs(y)*.7),tom=.24+onda
      cores.set([tom*.97,tom,tom*1.04],k*3)
      if(marcas){
        const f=Math.min(marcas.calor.length-1,Math.max(0,Math.floor(x/marcas.passoMm)))
        const [r,g,b,mistura]=corDeCalor(marcas.calor[f]),escuro=1-.55*Math.min(1,marcas.cratera[f])
        cores.set([(tom*.97*(1-mistura)+r*mistura)*escuro,(tom*(1-mistura)+g*mistura)*escuro,(tom*1.04*(1-mistura)+b*mistura)*escuro],k*3)
      }
      cores.set([.16,.17,.18],(k+n)*3)
      if(i+1<nx && j+1<ny && c.naPeca(x,y) && c.naPeca(c.x(i+1),c.y(j+1)) &&
        Math.min(c.metal[k],c.metal[k+1],c.metal[k+nx],c.metal[k+nx+1])>.025)ativo[k]=1
    }
    const lateral=(a:number,b:number)=>indices.push(a,b,a+n,b,b+n,a+n)
    for(let j=0;j+1<ny;j++)for(let i=0;i+1<nx;i++){
      const k=j*nx+i;if(!ativo[k])continue
      const a=k,b=k+nx,d=k+1,e=k+nx+1
      indices.push(a,b,d,d,b,e, a+n,d+n,b+n,d+n,e+n,b+n)
      if(i===0 || !ativo[k-1])lateral(b,a)
      if(i===nx-2 || !ativo[k+1])lateral(d,e)
      if(j===0 || !ativo[k-nx])lateral(a,d)
      if(j===ny-2 || !ativo[k+nx])lateral(e,b)
    }
    geo.setIndex(indices);geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals()
    malha.visible=indices.length>0
  }}
}
