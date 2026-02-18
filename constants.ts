
export const EVALUATION_WEIGHTS = {
  ACCURACY: 0.5,
  CLARITY: 0.3,
  HALLUCINATION_RISK: 0.2
};

export const calculateOverallScore = (accuracy: number, clarity: number, hallucinationRisk: number): number => {
  // Formula: overall = accuracy * 0.5 + clarity * 0.3 + (100 - hallucination_risk) * 0.2
  const score = (accuracy * EVALUATION_WEIGHTS.ACCURACY) + 
                (clarity * EVALUATION_WEIGHTS.CLARITY) + 
                ((100 - hallucinationRisk) * EVALUATION_WEIGHTS.HALLUCINATION_RISK);
  return Math.round(score * 10) / 10;
};

export const MODELS = {
  EXECUTION: 'gemini-3-flash-preview',
  EVALUATION: 'gemini-3-pro-preview'
};
