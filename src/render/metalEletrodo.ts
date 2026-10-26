import * as THREE from 'three'
import { DepositoEletrodo } from '../modelo/depositoEletrodo'

/** H79: a malha lê as mesmas alturas locais usadas no contato e na avaliação. */
export function criarMetalEletrodo(){
  const nx=150,ny=200,pos=new Float32Array(nx*ny*3),cores=new Float32Array(nx*ny*3)
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
  geo.setAttribute('color',new THREE.BufferAttribute(cores,3))
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:.32,side:THREE.DoubleSide})
  const malha=new THREE.Mesh(geo,material);malha.frustumCulled=false;malha.castShadow=malha.receiveShadow=true
  let anterior:DepositoEletrodo|null=null,versao=-1
  return {malha,atualizar(c:DepositoEletrodo){
    if(c===anterior && versao===c.versao)return
    anterior=c;versao=c.versao
    const indices:number[]=[]
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const k=j*nx+i,x=c.x(i),y=c.y(j)
      pos.set([x-75,c.altura(x,y)+.015,y],k*3)
      const onda=.012*Math.cos(x*3.4+Math.abs(y)*1.1),tom=.14+onda
      cores.set([tom*.98,tom,tom*1.03],k*3)
      if(i+1<nx && j+1<ny && c.naPeca(x,y) && c.naPeca(c.x(i+1),c.y(j+1)) &&
        Math.min(c.metal[k],c.metal[k+1],c.metal[k+nx],c.metal[k+nx+1])>.0005){
        indices.push(k,k+nx,k+1,k+1,k+nx,k+nx+1)
      }
    }
    geo.setIndex(indices);geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals()
    malha.visible=indices.length>0
  }}
}
