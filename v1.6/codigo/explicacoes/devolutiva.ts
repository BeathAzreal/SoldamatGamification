import type { CategoriaId, ResultadoPontuacao } from '../pontuacao/regras-de-pontuacao'
export interface Devolutiva { prioridade: string; evidencia: string; proximaAcao: string; verificar: string }
const ACOES: Record<CategoriaId, [string, string]> = {
  integridade: ['Revise os trechos de fusão prevista antes de buscar mais pontos.', 'Confira as condições essenciais.'],
  desenho: ['Mantenha os ajustes e pratique o movimento sobre o desenho.', 'Compare largura, reforço e alinhamento com as faixas da missão.'],
  regularidade: ['Repita os ajustes e pratique um ritmo uniforme.', 'Compare a variação da largura entre as tentativas.'],
  deformacao: ['No treino, altere apenas o ritmo de avanço e observe o índice térmico.', 'Confira o índice térmico sem perder a aprovação.'],
  eficiencia: ['Planeje o início e o fim do passe e evite abrir o arco fora do trecho.', 'Confira tempo útil, reinícios e metal no trecho.'],
}
/** Evidência registrada, sem diagnóstico de defeitos reais nem causalidade inventada. */
export function devolverTentativa(r: ResultadoPontuacao): Devolutiva {
  const falha = ['E4', 'E2', 'E3', 'E1'].map(id => r.essenciais.find(e => e.id === id && !e.cumprida)).find(Boolean)
  if (falha) return { prioridade: falha.descricao, evidencia: falha.justificativa, proximaAcao: falha.id === 'E4' ? 'Confirme a remoção do óxido na preparação antes de repetir.' : falha.id === 'E3' ? 'Repita cobrindo o trecho do início ao fim, sem deixar interrupções.' : 'Abra a inspeção e localize os trechos inadequados previstos. No treino, mude uma variável por vez.', verificar: 'Verifique primeiro esta condição essencial; uma nota maior não compensa seu descumprimento.' }
  const menor = [...r.categorias].filter(c => c.maximo > 0).sort((a,b) => a.pontos/a.maximo - b.pontos/b.maximo)[0]
  if (!menor) return { prioridade: 'Registrar uma tentativa completa', evidencia: 'Sem categorias avaliáveis.', proximaAcao: 'Faça um passe no trecho da missão antes de comparar resultados.', verificar: 'Confira se existe cordão suficiente para avaliação.' }
  const [proximaAcao, verificar] = ACOES[menor.id]
  return { prioridade: `Próximo foco: ${menor.nome}`, evidencia: `${menor.nome}: ${Math.round(Math.max(0,Math.min(1,menor.pontos/menor.maximo))*100)}% dos pontos disponíveis. ${menor.explicacao}`, proximaAcao, verificar }
}
