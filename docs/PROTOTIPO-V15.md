# v1.5 — distância e consumo da vareta

Protótipo em `gpt/v1.5`, derivado da v1.4 integrada, em checkout separado. Não altera a v1.4 nem grava pontos, tentativas ou recordes. O restante do jogo continua como base MIG/MAG.

## Hipóteses e limites

- **H59:** manter botão esquerdo, Espaço ou botão da interface habilita. Soltar, perder captura, sair da janela ou pausar desabilita. No MIG equivale ao gatilho. No eletrodo é uma convenção do jogo: o porta-eletrodo real não tem gatilho.
- **H60:** aproximar até contato e afastar levemente abre o arco do eletrodo, com comando habilitado. Contato não deposita. Até 0,35 mm é contato; após contato, até 5 mm mantém arco. Afastar demais exige nova abertura. Limiares inventados para testar interação.
- **H61:** vareta didática de 120 mm, consumo de 3 mm/s de arco e reserva de 25 mm. Encurtar aumenta a distância da ponta à peça, exigindo aproximar o porta-eletrodo. Troca só com comando solto, sem apagar o depósito. Não há reposição automática. São números de jogo, sem associação com classificação comercial de eletrodo.
- **H62:** passo fixo de 1/120 s, independente do desenho. Depósitos de 64 mm³/s no MIG e 35 mm³/s no eletrodo servem somente ao traço visual. Não se usam as regras de fusão ou pontuação MIG como física SMAW. Corrente, tensão, escória, aderência, classificação E6013/E7018 e qualidade interna ficam fora desta etapa.

## Controles

Mouse posiciona sobre a chapa; esquerdo ou Espaço habilita. W aproxima e S afasta a 3 mm/s. Roda muda a altura em passos de 0,5 mm; barra ajusta a distância diretamente. Câmera parada, sem disputar os controles da mão. O botão do painel habilita sobre a posição selecionada, com W/S para regular altura. Nova vareta mantém o depósito. Reiniciar ensaio limpa o teste. Trocar processo reinicia o ensaio.

Modelo puro: `src/modelo/acionamento15.ts`. Visual: `src/render/bancada15.ts`. Eventos e indicadores: `src/ui/telas/prototipo15.ts`. A interface mostra distância ponta–peça (eletrodo) ou bico–peça (MIG), estado do arco, comprimento restante e tempo de arco. Não oferece receitas técnicas.

## Referências qualitativas

- Miller, *Five Steps to Improving Your Stick Welding Technique*: comprimento do arco, extinção e aderência. https://www.millerwelds.com/en-us/resources/knowledge-hub/stick-welding/five-steps-to-improving-your-stick-welding-technique
- Miller, manual o264152a, diretrizes SMAW: corrente constante, comprimento do arco e escória entre passes. https://www.millerwelds.com/files/owners-manuals/o264152a_mln.pdf

As fontes sustentam relações qualitativas, não os números H59–H62 do protótipo.
