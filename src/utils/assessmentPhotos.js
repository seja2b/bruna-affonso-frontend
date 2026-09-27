const guide = (key, label, image, instructions, purpose) => ({
  key,
  label,
  image: `/assessment-guides/${image}.webp`,
  instructions,
  purpose
})

const standingInstructions = 'Fique centralizada, com os pés na largura dos quadris, os braços ao lado do corpo, o olhar para a frente e a postura relaxada.'
const sideInstructions = 'Fique de lado e centralizada na câmera, com os pés na largura dos quadris, o olhar para a frente e a postura relaxada.'
const squatInstructions = 'Afaste os pés na largura dos quadris, mantenha os braços à frente e faça o movimento de agachamento.'
const trendelenburgInstructions = 'De costas para a câmera, mantenha os braços ao lado do corpo e eleve uma perna, deixando o peso sobre a perna oposta.'
const faberInstructions = 'Deite de barriga para cima e apoie o tornozelo sobre o joelho oposto, formando a posição do número 4.'
const thomasInstructions = 'Deite de barriga para cima, mantenha uma perna estendida e puxe a perna oposta em direção ao peito.'
const posteriorInstructions = 'Deite de barriga para cima e eleve uma perna o máximo possível, mantendo os dois joelhos e a perna apoiada estendidos.'

export const assessmentPhotoGuides = [
  guide('FRONT', 'Foto de frente', 'front', standingInstructions, 'Registra o alinhamento corporal de frente.'),
  guide('BACK', 'Foto de costas', 'back', standingInstructions, 'Registra o alinhamento corporal de costas.'),
  guide('RIGHT', 'Lado direito - braços ao lado', 'right-side', sideInstructions, 'Registra o alinhamento do lado direito.'),
  guide('FRONT_RELAXED', 'Lado direito - braços para cima', 'right-arms-up', `${sideInstructions} Faça uma segunda foto com os braços elevados.`, 'Mostra o alinhamento lateral com os braços elevados.'),
  guide('LEFT', 'Lado esquerdo - braços ao lado', 'left-side', sideInstructions, 'Registra o alinhamento do lado esquerdo.'),
  guide('BACK_RELAXED', 'Lado esquerdo - braços para cima', 'left-arms-up', `${sideInstructions} Faça uma segunda foto com os braços elevados.`, 'Mostra o alinhamento lateral com os braços elevados.'),
  guide('RIGHT_RELAXED', 'Agachamento - frente', 'squat-front', squatInstructions, 'Avalia o movimento do agachamento visto de frente.'),
  guide('LEFT_RELAXED', 'Agachamento - lado esquerdo', 'squat-left', squatInstructions, 'Avalia o movimento do agachamento pelo lado esquerdo.'),
  guide('FRONT_DETAIL', 'Agachamento - costas', 'squat-back', squatInstructions, 'Avalia o movimento do agachamento visto de costas.'),
  guide('BACK_DETAIL', 'Agachamento - lado direito', 'squat-right', squatInstructions, 'Avalia o movimento do agachamento pelo lado direito.'),
  guide('DEEP_SQUAT', 'Cócoras', 'deep-squat', 'Desça até a posição de cócoras, mantenha os pés apoiados e una as mãos à frente do corpo.', 'Avalia a mobilidade do quadril.'),
  guide('RIGHT_DETAIL', 'Trendelenburg - lado direito', 'trendelenburg-right', trendelenburgInstructions, 'Avalia possível fraqueza do glúteo médio.'),
  guide('LEFT_DETAIL', 'Trendelenburg - lado esquerdo', 'trendelenburg-left', trendelenburgInstructions, 'Avalia possível fraqueza do glúteo médio.'),
  guide('FRONT_FOURTH', 'Teste de Adams', 'adams', 'De frente para a câmera, mantenha os pés paralelos e os braços soltos. Flexione o tronco à frente como se tentasse tocar os pés.', 'Auxilia na avaliação de escoliose.'),
  guide('BACK_FOURTH', 'Mobilidade escapular', 'scapular-mobility', 'De costas para a câmera, feche os punhos e encoste-os atrás das costas, na altura lombar, mantendo os antebraços paralelos ao chão.', 'Avalia a mobilidade da cintura escapular.'),
  guide('RIGHT_FOURTH', 'Teste de FABER - lado direito', 'faber-right', faberInstructions, 'Avalia a mobilidade do quadril.'),
  guide('LEFT_FOURTH', 'Teste de FABER - lado esquerdo', 'faber-left', faberInstructions, 'Avalia a mobilidade do quadril.'),
  guide('FRONT_FIFTH', 'Sentar e alcançar', 'sit-and-reach', 'Sente-se com as pernas estendidas à frente, mantenha os pés flexionados e alcance as mãos em direção aos pés sem dobrar os joelhos.', 'Avalia a flexibilidade.'),
  guide('BACK_FIFTH', 'Sentar e alcançar - adutores', 'adductor-reach', 'Sente-se com as pernas estendidas e afastadas, mantenha os pés flexionados e incline o tronco à frente sem dobrar os joelhos.', 'Avalia a flexibilidade dos adutores.'),
  guide('RIGHT_FIFTH', 'Teste de Thomas - lado direito', 'thomas-right', thomasInstructions, 'Avalia encurtamento do iliopsoas.'),
  guide('LEFT_FIFTH', 'Teste de Thomas - lado esquerdo', 'thomas-left', thomasInstructions, 'Avalia encurtamento do iliopsoas.'),
  guide('POSTERIOR_RIGHT', 'Teste para posteriores - perna direita', 'posterior-right', posteriorInstructions, 'Avalia encurtamento da cadeia posterior.'),
  guide('POSTERIOR_LEFT', 'Teste para posteriores - perna esquerda', 'posterior-left', posteriorInstructions, 'Avalia encurtamento da cadeia posterior.'),
  guide('PECTORAL', 'Teste para peitoral', 'pectoral', 'Deite de barriga para cima, relaxe o corpo e enquadre os dois lados dos ombros na câmera.', 'Avalia encurtamento peitoral.')
]

export const assessmentPhotoViews = assessmentPhotoGuides.map(({ key, label }) => [key, label])
