interface SrsParametersInput {
  quality: number;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

interface SrsParametersOutput {
  repetitions: number;
  ease_factor: number;
  interval: number;
  next_review: Date;
  is_new: boolean;
}

export const calculateSrsParameters = (params: SrsParametersInput): SrsParametersOutput => {
  let { quality, repetitions, easeFactor, interval } = params;

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