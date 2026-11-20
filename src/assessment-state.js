import { DEFAULT_WEIGHTS, FACTORS, PRESETS } from "./framework.js";
import { scoreAssessment } from "./scoring.js";

export function createInitialAssessment() {
  return {
    details: { name: "", type: "AWS access key", system: "", environment: "Production", description: "" },
    ratings: Object.fromEntries(FACTORS.map(({ id }) => [id, 3])),
    weights: { ...DEFAULT_WEIGHTS },
    baseline: null
  };
}

export function assessmentWithPreset(state, key) {
  const preset = PRESETS[key];
  if (!preset) throw new Error(`Unknown preset: ${key}`);
  return {
    ...state,
    details: { ...preset.details, description: preset.description },
    ratings: { ...preset.ratings }
  };
}

export function assessmentWithBaseline(state) {
  const result = scoreAssessment(state.ratings, state.weights);
  if (!result.valid) return state;
  return {
    ...state,
    baseline: {
      score: result.score,
      classification: result.classification,
      name: state.details.name || "Saved credential baseline",
      ratings: { ...state.ratings },
      weights: { ...state.weights }
    }
  };
}
