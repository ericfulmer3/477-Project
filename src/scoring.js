import { FACTORS, THRESHOLDS } from "./framework.js";

export function totalWeights(weights) {
  return Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function weightsAreValid(weights) {
  return Math.abs(totalWeights(weights) - 100) < 0.001;
}

export function normalizeWeights(weights) {
  const total = totalWeights(weights);
  if (total <= 0) return Object.fromEntries(Object.keys(weights).map((key) => [key, 0]));
  const entries = Object.entries(weights);
  const normalized = Object.fromEntries(entries.map(([key, value]) => [key, Math.round((Number(value) / total) * 1000) / 10]));
  const drift = Math.round((100 - totalWeights(normalized)) * 10) / 10;
  if (drift) normalized[entries.at(-1)[0]] = Math.round((normalized[entries.at(-1)[0]] + drift) * 10) / 10;
  return normalized;
}

export function classifyRisk(score) {
  return THRESHOLDS.find(({ min }) => score >= min).label;
}

export function scoreAssessment(ratings, weights) {
  if (!weightsAreValid(weights)) return { valid: false, score: null, classification: null, contributions: [] };
  const contributions = FACTORS.map((factor) => ({
    id: factor.id,
    name: factor.name,
    rating: Number(ratings[factor.id]),
    weight: Number(weights[factor.id]),
    points: (Number(ratings[factor.id]) / 5) * Number(weights[factor.id])
  })).sort((a, b) => b.points - a.points);
  const score = contributions.reduce((sum, factor) => sum + factor.points, 0);
  return { valid: true, score, classification: classifyRisk(score), contributions };
}

export function recommendationsFor(ratings, weights) {
  return FACTORS
    .filter((factor) => Number(ratings[factor.id]) >= 4)
    .map((factor) => ({ ...factor, points: (Number(ratings[factor.id]) / 5) * Number(weights[factor.id]) }))
    .sort((a, b) => b.points - a.points);
}

export function baselineDifference(baseline, current) {
  return baseline - current;
}
