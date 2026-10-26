# v1.5 — bancada técnica SMAW

Esta etapa evolui exclusivamente `gpt/v1.5`. A v1.4 e suas branches permanecem intactas. Não há pontuação, certificação ou previsão validada de qualidade interna. MIG mantém seu modelo anterior no jogo base; a bancada experimental tem acionamento e distância próprios.

## Hipóteses H59–H66 e limites

H59 mantém o comando pressionado para habilitar, com desarme ao soltar, pausar, abrir controles ou perder foco. No eletrodo o botão é convenção de entrada, não gatilho físico. H60 exige contato e afastamento para abrir. Contato até 0,35 mm e limite de arco de min(5 mm, 2 × diâmetro) são limiares do jogo.

H61 mantém vareta didática de 120 mm e reserva de 25 mm, com troca explícita e preservação do metal. H62 integra a 120 passos/s; o tempo de simulação e os efeitos não dependem dos quadros de desenho. Os antigos valores fixos de consumo e depósito do eletrodo são substituídos por H63.

**H63 — corrente e consumo:** fonte SMAW de corrente constante simplificada. O ajuste permitido é 40–180 A, com diâmetro didático de 2,5 ou 3,2 mm. A referência interna é Iref = 36 × diâmetro; não é uma corrente recomendada. A taxa de fusão é 3 × (I/Iref)^1,35 mm/s. O volume depositado usa a seção circular da alma e rendimento sintético de 0,7. A tensão estimada do arco é 20 + 2 × distância em mm; a energia acumula I × U × dt. Esses coeficientes não foram calibrados para eletrodo comercial, espessura ou polaridade. Não existe cálculo de temperatura, penetração ou resistência mecânica validado.

**H64 — aderência:** contato energizado contínuo por 0,15 s se I/Iref < 0,65, ou 0,65 s nos demais casos, prende a ponta. Abaixo de I/Iref = 0,55 o arco não se sustenta. Enquanto grudado não há consumo ou depósito, nem deslocamento da ponta. Soltar desenergiza, mas não desfaz a aderência; o jogador deve usar Desgrudar, com comando solto. O botão representa uma operação de recuperação, não cálculo de força de alavanca. Não modelamos anti-stick, hot-start ou arc-force de máquinas comerciais.

**H65 — escória:** grade superficial de 3 mm acumula cobertura conforme o volume depositado. O calor relativo decai exponencialmente com constante de 2,2 s. A escória muda de cor e só pode ser removida abaixo de calor relativo 0,15. A limpeza usa as ferramentas separadas descritas em H67. Limpeza não remove metal. Um novo depósito em célula coberta e fria aumenta um indicador cumulativo de sobreposição em escória; não equivale a um diagnóstico de inclusão interna. Não há fluido de escória, química do revestimento ou solidificação metalúrgica detalhada.

**H66 — movimentos:** câmera pode orbitar continuamente em 360° sem girar a peça; os polos têm pequeno afastamento numérico e a câmera fica acima do piso. A direção da ferramenta e o rolamento axial envolvem 360°. A inclinação é 0–85°, mantendo a ferramenta no hemisfério da face superior da chapa. Orientar pivota em torno da ponta selecionada, preservando a distância instantânea; durante consumo a ponta recua ao longo da vareta, inclusive lateralmente na inclinação. A peça permanece fixa na garra: não há giro irrestrito que a solte do suporte. Não são implementados soldagem pela face inferior, colisão completa do corpo do porta-eletrodo com mobiliário, rastreamento espacial de mão ou resistência tátil.

## Controles e persistência

Configurar controles permite remapear nove teclas, três botões do mouse, sensibilidade, velocidade de altura, função da roda, uso da inclinação da caneta, controle/gamepad, gatilho, zona morta e função do analógico direito. A validação rejeita teclas e botões conflitantes ou valores inválidos. Somente após Salvar, os dados são gravados na chave exclusiva `oficina-v15-controles-smaw`; se o armazenamento for bloqueado, a configuração vale nesta sessão. Nenhum dado antigo é migrado ou apagado.

Padrão: esquerdo/Espaço habilitam, W sobe e afasta; S desce e aproxima, botão do meio orbita a câmera (arco fechado), direito arrastado orienta a ferramenta, I/K inclinam, J/L mudam direção, Q/E giram o punho. A roda regula distância em 0,5 mm ou zoom conforme a configuração. A câmera e a orientação não movimentam o ponto selecionado. Caneta usa tiltX/tiltY reais quando o dispositivo os fornece; pressão não modifica corrente. Gamepad: analógico esquerdo desloca ponta, direito orienta ou orbita; direcional altera altura, LB/RB giram o punho, gatilho configurado habilita.

Mouse, teclado e analógicos representam gestos; não são rastreamento real de seis graus de liberdade. Diâmetro e corrente mudam com arco desabilitado; configurações pausam a bancada. Trocar processo ou Reiniciar ensaio limpa o ensaio inteiro; trocar a vareta preserva o depósito.

## Referências qualitativas

- Miller, Five Steps to Improving Your Stick Welding Technique: ajuste de corrente, arco curto/aderência, orientação e manipulação. https://www.millerwelds.com/en-us/resources/knowledge-hub/stick-welding/five-steps-to-improving-your-stick-welding-technique
- Miller, manual o264152a: fonte de corrente constante e remoção de escória antes de outro passe. https://www.millerwelds.com/files/owners-manuals/o264152a_mln.pdf

As fontes sustentam relações qualitativas. Todos os limiares, taxas e coeficientes desta implementação são hipóteses sintéticas, não receitas de soldagem.

### Ajuste visual e de gesto

A escória agora é uma superfície fina contínua com máscara de cobertura e cor de resfriamento, em vez de esferas por célula. A física de formação/limpeza não mudou. O arraste de orientação usa a base da câmera e uma âncora no início do gesto: deslocar horizontalmente inclina a vareta mesmo na vertical, e retornar à âncora restaura a orientação. Ponta, distância e rolamento permanecem independentes; a inclinação continua limitada a 85°.

### H67 — martelinho e escova de aço

A limpeza foi separada em ferramentas 3D selecionáveis: Soldagem, Martelinho e Escova de aço. Martelinho usa um clique por golpe na escória fria: remove 80% da crosta atingida e converte os 20% restantes em resíduos soltos. Repetir o golpe não apaga esses resíduos. A escova remove somente resíduos já soltos, ao segurar e arrastar. Nenhuma ferramenta limpa escória quente nem remove metal. Frações e raios de ação são números sintéticos de interação, não previsão de fratura ou abrasão.

O novo padrão de altura é W para subir/afastar e S para descer/aproximar. A configuração antiga com o par padrão W/S é migrada automaticamente; outros remapeamentos são preservados. Configurações salvas no novo formato não são reinvertidas. Os demais gestos de câmera e orientação permanecem iguais.

O martelinho agora é apresentado de lado, com arco lateral do cabo e contato da ponta da cabeça com a região selecionada. A alteração é visual e mantém as regras de remoção de crosta e resíduos.

## Refino do Claude — H68 a H70

**H68 — abrir riscando:** com a ponta deslizando sobre a chapa acima de 8 mm/s, o contato conta 25% do tempo para grudar. Reproduz a recomendação qualitativa de "riscar como fósforo" para quem ainda não domina o toque. O limiar e o fator são números do jogo.

**H69 — comprimento do arco:** a regra prática é manter o arco perto do diâmetro da alma. O jogo classifica o arco em curto (menos de 0,5 × diâmetro), adequado (até 1,3 × diâmetro) e longo (acima disso, até apagar). O arco curto deposita cordão mais alto e estreito; o longo, mais baixo, largo e irregular (razão altura/largura e instabilidade do cordão, H44), com muito mais respingos. Coeficientes sintéticos, sem medição de transferência metálica.

**H70 — compensação assistida:** opção do painel que desce o porta-eletrodo na mesma taxa em que a vareta queima, mantendo o comprimento do arco. Serve para treinar o avanço antes do controle de altura; desligada (padrão), o jogador compensa com S.

Outros ajustes do refino:

- A escória é depositada na largura do cordão (raio de 1,5 × diâmetro), não só no ponto da ponta. A massa total de escória não muda; a crosta passa a cobrir o cordão inteiro e a limpeza percorre o mesmo caminho.
- O passo de simulação por quadro é limitado a 0,25 s: um travamento da aba não vira vários segundos de arco de uma vez.
- Velocidade padrão de subir/descer passou de 3 para 6 mm/s. Com 3 mm/s não era possível acompanhar o consumo em correntes acima de ~90 A. Configurações já salvas mantêm o valor escolhido.
- Interface: leituras sobre a vista 3D (estado, medidor colorido do comprimento do arco, vareta restante, avanço e fonte), painel lateral reorganizado (ferramenta, comando, fonte e consumível, altura manual, orientação e leituras do modelo recolhíveis) e legenda de teclas com nomes legíveis.
- 3D: alicate porta-eletrodo com garras na ponta nua da vareta (20 mm) e cabo inclinado (o rolamento do punho agora é visível), revestimento até a ponta, ponta incandescente que esfria após o arco, coluna e halo do arco que tremulam, poça e respingos balísticos.

## Treino de eletrodo — H71 a H73 (após o teste do dono)

O protótipo deixou de ser uma tela separada no topo. O eletrodo agora fica em **Treino → Processo: Eletrodo revestido**, com peças em que o processo é usado de verdade (aço carbono de 4,75 a 8 mm, estrutura e serviço de campo): cordões sobre chapa 6,3 mm, filete em T, topo em V 8 mm (raiz), canto externo de portão e sobreposta de reforço. Cada peça tem trecho INÍCIO/FIM, eletrodo e faixa de corrente sugeridos (do modelo, H63) e uma lista de objetivos sem pontuação: trecho coberto, tempo com arco adequado, sem grudar e escória removida. O jogo volta a abrir no menu.

**Sem botão para soldar (H72):** o porta-eletrodo fica energizado enquanto o eletrodo está na mão. O primeiro toque da ponta na peça abre o arco (a ponta recua até um arco curto, 0,8 × diâmetro). Empurrar de novo contra a poça com o arco aberto é curto-circuito: sem empurrar, a ponta queima de volta e o arco volta; continuar empurrando por 0,65 s gruda.

**Altura por toques (H72):** W/S têm rampa — começam a 2 mm/s e chegam à velocidade configurada (padrão 6 mm/s) em 0,5 s segurados. Um toque curto desce 0,2–0,4 mm.

**Ajuda na altura (H70, revisada):** Parcial (padrão) compensa 80% do consumo: o arco cresce ~0,6 mm/s e o jogador corrige com um toque a cada um ou dois segundos. Total mantém o arco; Desligada é o eletrodo real. Em simulação a 60 quadros/s com tempo de reação de 0,2 s, a ajuda parcial manteve o arco aceso em mais de 97% do tempo, a vareta inteira, sem grudar, com cerca de 0,4–0,7 toque/s (80–130 A); sem ajuda também foi possível, com o arco no comprimento adequado em 40–65% do tempo.

**H71 — arco esticado e reacendimento a quente:** passar do limite do arco não apaga na hora; até 1,5 × o limite ele aguenta 0,35 s ("arco esticado · desça"). Até 1,5 s depois de apagar, a ponta ainda quente reacende ao voltar para dentro do limite, sem novo toque. Números do jogo.

**H73 — ponta no canto do filete:** a distância do arco é medida até a superfície real da junta (paredes a 45° no filete na posição plana), e a ponta apoiada a até 4 mm da raiz assenta no fundo do canto, como acontece com o eletrodo encostado no V. Um risco de pedra-sabão marca a raiz do INÍCIO ao FIM.

## v1.6 — preenchimento e nota do eletrodo (H74 a H77)

**H74 — calor (aporte) e fusão:** a energia que entra na peça é 0,8 × corrente × tensão do arco (20 + 2 × comprimento do arco, em V), espalhada ±2 mm ao longo da junta. Dividida pelo comprimento, dá o aporte de calor em kJ/mm, como na prática. Cada peça tem um aporte de referência que cresce com a espessura (0,12 kJ/mm por mm de chapa) e depende da junta: o filete precisa de mais (o calor escapa por três lados: T × 1,4; sobreposta × 1,3), o V um pouco menos (× 0,9), o canto × 1,1. A fusão de cada fatia é o aporte do passe mais quente ÷ referência: abaixo de 0,6, falta de fusão (colagem); 0,6–0,8, fusão fraca; 0,8–1,7, adequada; acima de 1,7, calor em excesso; acima de 2,3 no primeiro passe de raiz aberta ou na quina do canto, perfuração. O jogador vê ao vivo o calor e a faixa de avanço que dá o calor certo.

**Depósito e forma do cordão:** a vareta passou a queimar 4 mm/s na corrente de referência (era 3; o eletrodo real queima por volta de 5 mm/s). O metal depositado é 0,95 do volume da alma consumida (o revestimento tem pó de ferro). Corrente alta abre e achata o cordão; corrente baixa deixa-o alto e estreito (razão altura/largura, H44). Com isso, o cordão sobre chapa com 2,5 mm a 90 A e 2,5 mm/s sai com cerca de 6–7 mm de largura e 1,5–2 mm de reforço, e o filete em T com 3,2 mm a 115 A e 2,5 mm/s, com perna de cerca de 5 mm.

**H75 — o que a peça pede:** cada peça mede uma coisa: reforço acima da chapa (cordão sobre chapa, 1–3 mm), perna do filete (T e sobreposta, 4–6,5 mm; canto, 3–5 mm) ou enchimento do chanfro (V: cheio até a face, com reforço de até 3 mm). O V de 8 mm se enche em vários passes (raiz com 2,5 mm, enchimento com 3,2 mm): um passe sozinho não enche.

**H76 — defeitos do eletrodo**, calculados a partir do registro do passe e desenhados no 3D com o mesmo desenho dos defeitos do MIG:
- mordedura: arco longo (acima de 1,3 diâmetro) e calor em excesso;
- sobreposição: passe frio e lento;
- porosidade: arco longo (acima de 1,5 diâmetro) tira a proteção do revestimento; abrir o arco a frio e seguir em frente deixa poros no começo, a menos que a ponta volte por cima do ponto de abertura;
- cratera: apagar o arco sem parar 0,3 s sobre a poça, a não ser que outro passe cubra depois;
- inclusão de escória: metal posto sobre escória fria (soldar sem limpar entre passes);
- respingos presos (alguns sempre; muitos com arco longo), marca de abertura de arco fora da junta e marca de eletrodo grudado;
- escamas: espaçadas pelo avanço a cada 190 ms de arco.

**H77 — inspeção visual e nota (0 a 100):** continuidade 20, geometria 25 (medida da peça e regularidade da largura), fusão 25, defeitos de superfície 20 e limpeza 10. Reprova (como numa inspeção visual de teste de soldador, critério do jogo): menos de 90% do trecho com cordão; falta de fusão em 10 mm ou mais; perfuração de 2 mm ou mais; 3 ou mais poros abertos; inclusão de escória de 3 mm ou mais; sobreposição de 10 mm ou mais; perna ou enchimento abaixo do pedido em 10 mm ou mais; ou nota abaixo de 70. Cada defeito aparece com a posição em mm (a régua da peça), a causa provável e como corrigir. A nota está em `codigo/eletrodo/nota-do-eletrodo.ts` (versão `eletrodo-v1`) e não entra em recordes.

Calibração (testes/eletrodo-inspecao.test.ts, soldador simulado): técnica boa (arco ≈ diâmetro, avanço na faixa, parada no fim, recuo na abertura, limpeza) dá 93–100 e aprova nas cinco peças; avanço rápido demais dá falta de fusão e reprova; lento demais dá calor em excesso e cordão alto; arco longo dá mordedura, poros e respingos e reprova; não parar no fim deixa cratera; um passe no V não enche e reprova; seis passes limpando enchem; sem limpar entre passes há inclusão e reprova; calor demais no canto derrete a quina.
