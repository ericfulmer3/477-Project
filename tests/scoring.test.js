import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_WEIGHTS, PRESETS } from "../src/framework.js";
import { baselineDifference, classifyRisk, normalizeWeights, scoreAssessment, totalWeights, weightsAreValid } from "../src/scoring.js";

test("default weights total 100", () => assert.equal(totalWeights(DEFAULT_WEIGHTS), 100));

test("static AWS key scores 83 Critical", () => {
  const result = scoreAssessment(PRESETS.aws.ratings, DEFAULT_WEIGHTS);
  assert.equal(result.score, 83);
  assert.equal(result.classification, "Critical");
});

test("OIDC temporary credential scores 33 Moderate", () => {
  const result = scoreAssessment(PRESETS.oidc.ratings, DEFAULT_WEIGHTS);
  assert.equal(result.score, 33);
  assert.equal(result.classification, "Moderate");
});

test("classification boundaries are inclusive", () => {
  assert.deepEqual([classifyRisk(0), classifyRisk(24), classifyRisk(25), classifyRisk(49), classifyRisk(50), classifyRisk(74), classifyRisk(75), classifyRisk(100)],
    ["Low", "Low", "Moderate", "Moderate", "High", "High", "Critical", "Critical"]);
});

test("invalid custom weight total suppresses classification", () => {
  const invalid = { ...DEFAULT_WEIGHTS, privilege: 20 };
  assert.equal(weightsAreValid(invalid), false);
  assert.deepEqual(scoreAssessment(PRESETS.aws.ratings, invalid), { valid: false, score: null, classification: null, contributions: [] });
});

test("normalization produces exactly 100 percent", () => {
  const normalized = normalizeWeights({ ...DEFAULT_WEIGHTS, privilege: 31, scope: 7, blastRadius: 22 });
  assert.equal(totalWeights(normalized), 100);
  assert.equal(weightsAreValid(normalized), true);
});

test("baseline difference reports 50 point reduction", () => assert.equal(baselineDifference(83, 33), 50));
