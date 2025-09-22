// Definimos uma interface para os parâmetros de entrada da nossa função.
// Isso garante que quem chamar a função sempre passará os dados corretos.
interface SrsParametersInput {
  quality: number;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

// Definimos uma interface para o objeto de retorno da função.
// Isso garante que o resultado terá sempre o formato esperado.
interface SrsParametersOutput {
  repetitions: number;
  ease_factor: number;
  interval: number;
  next_review: Date;
  is_new: boolean;
}

/**
 * Calcula os próximos parâmetros do SRS (Spaced Repetition System) baseado na qualidade da resposta.
 * Esta função implementa uma versão do algoritmo SM-2.
 * @param {SrsParametersInput} params - Os parâmetros atuais do card.
 * @returns {SrsParametersOutput} - Os novos parâmetros calculados para o card.
 */
export const calculateSrsParameters = (params: SrsParametersInput): SrsParametersOutput => {
  let { quality, repetitions, easeFactor, interval } = params;

  // Se a resposta for ruim (menor que 3), reseta o número de repetições.
  if (quality < 3) {
    repetitions = 0;
    interval = 1; 
  } else {
    repetitions += 1;
    
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    repetitions: repetitions,
    ease_factor: easeFactor,
    interval: interval,
    next_review: nextReviewDate,
    is_new: quality < 3,
  };
};