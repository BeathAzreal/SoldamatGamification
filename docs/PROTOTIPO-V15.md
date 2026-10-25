# v1.5 — bancada técnica SMAW

Esta etapa evolui exclusivamente `gpt/v1.5`. A v1.4 e suas branches permanecem intactas. Não há pontuação, certificação ou previsão validada de qualidade interna. MIG mantém seu modelo anterior no jogo base; a bancada experimental tem acionamento e distância próprios.

## Hipóteses H59–H66 e limites

H59 mantém o comando pressionado para habilitar, com desarme ao soltar, pausar, abrir controles ou perder foco. No eletrodo o botão é convenção de entrada, não gatilho físico. H60 exige contato e afastamento para abrir. Contato até 0,35 mm e limite de arco de min(5 mm, 2 × diâmetro) são limiares do jogo.

H61 mantém vareta didática de 120 mm e reserva de 25 mm, com troca explícita e preservação do metal. H62 integra a 120 passos/s; o tempo de simulação e os efeitos não dependem dos quadros de desenho. Os antigos valores fixos de consumo e depósito do eletrodo são substituídos por H63.

**H63 — corrente e consumo:** fonte SMAW de corrente constante simplificada. O ajuste permitido é 40–180 A, com diâmetro didático de 2,5 ou 3,2 mm. A referência interna é Iref = 36 × diâmetro; não é uma corrente recomendada. A taxa de fusão é 3 × (I/Iref)^1,35 mm/s. O volume depositado usa a seção circular da alma e rendimento sintético de 0,7. A tensão estimada do arco é 20 + 2 × distância em mm; a energia acumula I × U × dt. Esses coeficientes não foram calibrados para eletrodo comercial, espessura ou polaridade. Não existe cálculo de temperatura, penetração ou resistência mecânica validado.

**H64 — aderência:** contato energizado contínuo por 0,15 s se I/Iref < 0,65, ou 0,65 s nos demais casos, prende a ponta. Abaixo de I/Iref = 0,55 o arco não se sustenta. Enquanto grudado não há consumo ou depósito, nem deslocamento da ponta. Soltar desenergiza, mas não desfaz a aderência; o jogador deve usar Desgrudar, com comando solto. O botão representa uma operação de recuperação, não cálculo de força de alavanca. Não modelamos anti-stick, hot-start ou arc-force de máquinas comerciais.

**H65 — escória:** grade superficial de 3 mm acumula cobertura conforme o volume depositado. O calor relativo decai exponencialmente com constante de 2,2 s. A escória muda de cor e só pode ser removida abaixo de calor relativo 0,15. O jogador deve arrastar sobre a região fria no modo de limpeza. Limpeza não remove metal. Um novo depósito em célula coberta e fria aumenta um indicador cumulativo de sobreposição em escória; não equivale a um diagnóstico de inclusão interna. Não há fluido de escória, química do revestimento ou solidificação metalúrgica detalhada.

**H66 — movimentos:** câmera pode orbitar continuamente em 360° sem girar a peça; os polos têm pequeno afastamento numérico e a câmera fica acima do piso. A direção da ferramenta e o rolamento axial envolvem 360°. A inclinação é 0–85°, mantendo a ferramenta no hemisfério da face superior da chapa. Orientar pivota em torno da ponta selecionada, preservando a distância instantânea; durante consumo a ponta recua ao longo da vareta, inclusive lateralmente na inclinação. A peça permanece fixa na garra: não há giro irrestrito que a solte do suporte. Não são implementados soldagem pela face inferior, colisão completa do corpo do porta-eletrodo com mobiliário, rastreamento espacial de mão ou resistência tátil.

## Controles e persistência

Configurar controles permite remapear nove teclas, três botões do mouse, sensibilidade, velocidade de altura, função da roda, uso da inclinação da caneta, controle/gamepad, gatilho, zona morta e função do analógico direito. A validação rejeita teclas e botões conflitantes ou valores inválidos. Somente após Salvar, os dados são gravados na chave exclusiva `oficina-v15-controles-smaw`; se o armazenamento for bloqueado, a configuração vale nesta sessão. Nenhum dado antigo é migrado ou apagado.

Padrão: esquerdo/Espaço habilitam, W/S aproximam e afastam, botão do meio orbita a câmera (arco fechado), direito arrastado orienta a ferramenta, I/K inclinam, J/L mudam direção, Q/E giram o punho. A roda regula distância em 0,5 mm ou zoom conforme a configuração. A câmera e a orientação não movimentam o ponto selecionado. Caneta usa tiltX/tiltY reais quando o dispositivo os fornece; pressão não modifica corrente. Gamepad: analógico esquerdo desloca ponta, direito orienta ou orbita; direcional altera altura, LB/RB giram o punho, gatilho configurado habilita.

Mouse, teclado e analógicos representam gestos; não são rastreamento real de seis graus de liberdade. Diâmetro e corrente mudam com arco desabilitado; configurações pausam a bancada. Trocar processo ou Reiniciar ensaio limpa o ensaio inteiro; trocar a vareta preserva o depósito.

## Referências qualitativas

- Miller, Five Steps to Improving Your Stick Welding Technique: ajuste de corrente, arco curto/aderência, orientação e manipulação. https://www.millerwelds.com/en-us/resources/knowledge-hub/stick-welding/five-steps-to-improving-your-stick-welding-technique
- Miller, manual o264152a: fonte de corrente constante e remoção de escória antes de outro passe. https://www.millerwelds.com/files/owners-manuals/o264152a_mln.pdf

As fontes sustentam relações qualitativas. Todos os limiares, taxas e coeficientes desta implementação são hipóteses sintéticas, não receitas de soldagem.

### Ajuste visual e de gesto

A escória agora é uma superfície fina contínua com máscara de cobertura e cor de resfriamento, em vez de esferas por célula. A física de formação/limpeza não mudou. O arraste de orientação usa a base da câmera e uma âncora no início do gesto: deslocar horizontalmente inclina a vareta mesmo na vertical, e retornar à âncora restaura a orientação. Ponta, distância e rolamento permanecem independentes; a inclinação continua limitada a 85°.
