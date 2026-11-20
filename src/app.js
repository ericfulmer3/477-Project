import { assessmentWithBaseline, assessmentWithPreset, createInitialAssessment } from "./assessment-state.js";
import { FACTORS } from "./framework.js";
import { escapeHtml } from "./rendering.js";
import { baselineDifference, normalizeWeights, recommendationsFor, restoreDefaultWeights, scoreAssessment, totalWeights, weightsAreValid } from "./scoring.js";

const ratingLabels = ["", "Low", "Limited", "Moderate", "High", "Very high"];
const state = createInitialAssessment();

const elements = {
  sliders: document.querySelector("#factorSliders"),
  score: document.querySelector("#scoreCard"), chart: document.querySelector("#contributionChart"),
  comparison: document.querySelector("#baselineComparison"), recommendations: document.querySelector("#recommendations"),
  recommendationCount: document.querySelector("#recommendationCount"),
  weightInputs: document.querySelector("#weightInputs"), weightStatus: document.querySelector("#weightStatus"),
  status: document.querySelector("#statusAnnouncements"), errors: document.querySelector("#errorAnnouncements"),
  name: document.querySelector("#credentialName"), type: document.querySelector("#credentialType"),
  system: document.querySelector("#credentialSystem"), environment: document.querySelector("#credentialEnvironment"),
  description: document.querySelector("#credentialDescription")
};

function formatPoints(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function renderComparison(result) {
  if (!state.baseline) {
    elements.comparison.innerHTML = `<p><strong>No baseline saved yet.</strong> Save the current assessment, then change the ratings to compare residual risk.</p>`;
    return "No inherent-risk baseline is saved.";
  }
  const sameWeights = FACTORS.every(({ id }) => state.baseline.weights[id] === state.weights[id]);
  if (!sameWeights) {
    elements.comparison.innerHTML = `<p><strong>Baseline comparison paused.</strong> The baseline uses different weights. Restore those weights or save a new baseline before comparing risk.</p>`;
    return "Baseline comparison paused because the assessments use different weights.";
  }
  const difference = baselineDifference(state.baseline.score, result.score);
  const improved = difference > 0;
  const unchanged = difference === 0;
  const changeLabel = unchanged ? "No change" : `${formatPoints(Math.abs(difference))}-point ${improved ? "reduction" : "increase"}`;
  elements.comparison.innerHTML = `<div class="comparison-heading"><div><p class="score-label">Inherent → residual risk</p><h3>${escapeHtml(state.baseline.name)}</h3></div><strong class="change ${improved ? "improved" : difference < 0 ? "increased" : ""}">${changeLabel}</strong></div><div class="comparison-values"><span><b>${formatPoints(state.baseline.score)}</b> ${state.baseline.classification}</span><i aria-hidden="true"></i><span><b>${formatPoints(result.score)}</b> ${result.classification}</span></div>${improved ? `<p class="residual-note">Controls reduced risk, but residual risk remains and still requires oversight.</p>` : ""}`;
  return `Inherent risk ${formatPoints(state.baseline.score)}, ${state.baseline.classification}. Residual risk ${formatPoints(result.score)}, ${result.classification}. ${changeLabel}.`;
}

function updateWeightStatus() {
  const total = totalWeights(state.weights);
  const valid = weightsAreValid(state.weights);
  elements.weightStatus.className = `weight-status ${valid ? "valid" : "invalid"}`;
  elements.weightStatus.textContent = `${formatPoints(total)}% total · ${valid ? "Valid" : "Must equal 100%"}`;
  elements.weightInputs.querySelectorAll("[data-weight]").forEach((input) => {
    input.setAttribute("aria-invalid", String(!valid));
    if (valid) input.removeAttribute("aria-errormessage");
    else input.setAttribute("aria-errormessage", "errorAnnouncements");
  });
}

function renderWeightInputs() {
  elements.weightInputs.innerHTML = FACTORS.map((factor) => `<label for="weight-${factor.id}"><span>${factor.name}</span><span class="weight-field"><input id="weight-${factor.id}" data-weight="${factor.id}" type="number" min="0" max="100" step="0.1" value="${state.weights[factor.id]}" aria-label="${factor.name} weight percentage" aria-describedby="weightsGuidance weightStatus" /><b aria-hidden="true">%</b></span></label>`).join("");
  updateWeightStatus();
}

function applyPreset(key) {
  Object.assign(state, assessmentWithPreset(state, key));
  syncDetails();
  renderSliders();
  renderResults();
}

function renderRecommendations() {
  const recommendations = recommendationsFor(state.ratings, state.weights);
  elements.recommendationCount.textContent = recommendations.length ? `${recommendations.length} triggered` : "No ratings at 4–5";
  elements.recommendations.innerHTML = recommendations.length
    ? recommendations.map((item, index) => `<article class="recommendation"><span>${index + 1}</span><div><strong>${item.name} · ${formatPoints(item.points)} points</strong><p>${item.control}</p></div></article>`).join("")
    : `<div class="recommendation-empty"><strong>No priority control is triggered.</strong><p>Risk is reduced, not eliminated. Continue reviewing all factors and maintain existing controls.</p></div>`;
}

function renderResults() {
  const result = scoreAssessment(state.ratings, state.weights);
  if (!result.valid) {
    const total = totalWeights(state.weights);
    elements.score.className = "score-card weight-error";
    elements.score.innerHTML = `<p class="score-label">Weight total invalid</p><strong class="score-number">—</strong><p>Weights must total 100% to calculate a valid classification.</p>`;
    elements.chart.innerHTML = "";
    elements.comparison.innerHTML = "";
    elements.recommendations.innerHTML = "";
    elements.recommendationCount.textContent = "Classification unavailable";
    elements.status.textContent = "";
    elements.errors.textContent = `Invalid custom weights. The current total is ${formatPoints(total)} percent; it must equal 100 percent before a classification can be presented.`;
    return;
  }
  const credential = state.details.name || "Current credential";
  elements.score.className = `score-card risk-${result.classification.toLowerCase()}`;
  elements.score.innerHTML = `<div class="score-top"><div><p class="score-label">Weighted risk score</p><h3>${escapeHtml(credential)}</h3></div><span class="risk-badge">${result.classification}</span></div><div class="score-value"><strong class="score-number">${formatPoints(result.score)}</strong><span>/ 100</span></div><div class="score-meter" aria-hidden="true"><i style="width:${result.score}%"></i></div><button id="saveBaseline" class="button baseline-button" type="button">${state.baseline ? "Update inherent-risk baseline" : "Save as inherent-risk baseline"}</button><p class="minimum-note">Ratings start at 1; the practical minimum is 20.</p>`;
  elements.chart.innerHTML = result.contributions.map((item) => `<div class="bar-row"><div class="bar-label"><span>${item.name}</span><strong>${formatPoints(item.points)}</strong></div><div class="bar-track" role="img" aria-label="${item.name}: ${formatPoints(item.points)} weighted points"><i style="width:${Math.min(100, item.points / 0.15)}%"></i></div></div>`).join("");
  const comparisonAnnouncement = renderComparison(result);
  renderRecommendations();
  elements.errors.textContent = "";
  elements.status.textContent = `Risk score ${formatPoints(result.score)} out of 100. Classification ${result.classification}. ${comparisonAnnouncement}`;
}

function renderSliders() {
  elements.sliders.innerHTML = FACTORS.map((factor, index) => {
    const rating = state.ratings[factor.id];
    return `<article class="factor" style="--delay:${index * 35}ms">
      <div class="factor-copy"><div class="factor-title"><h3 id="label-${factor.id}">${factor.name}</h3><button class="info" type="button" aria-label="Show rating guidance for ${factor.name}" aria-expanded="false" aria-controls="help-${factor.id}">?</button></div><p id="question-${factor.id}">${factor.question}</p><div class="factor-help" id="help-${factor.id}" hidden><b>1</b> ${factor.anchors[1]}<br><b>3</b> ${factor.anchors[3]}<br><b>5</b> ${factor.anchors[5]}</div></div>
      <div class="slider-wrap"><output for="rating-${factor.id}" aria-hidden="true"><strong>${rating}</strong><span>${ratingLabels[rating]}</span></output><input id="rating-${factor.id}" data-factor="${factor.id}" type="range" min="1" max="5" step="1" value="${rating}" aria-labelledby="label-${factor.id}" aria-describedby="question-${factor.id} help-${factor.id}" aria-valuetext="${rating} - ${ratingLabels[rating]} risk" style="--value:${(rating - 1) * 25}%" /><div class="ticks" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></div>
    </article>`;
  }).join("");
}

function syncDetails() {
  elements.name.value = state.details.name; elements.type.value = state.details.type;
  elements.system.value = state.details.system; elements.environment.value = state.details.environment;
  elements.description.value = state.details.description;
}

elements.sliders.addEventListener("input", (event) => {
  if (!event.target.matches("input[type=range]")) return;
  const rating = Number(event.target.value);
  state.ratings[event.target.dataset.factor] = rating;
  event.target.style.setProperty("--value", `${(rating - 1) * 25}%`);
  event.target.setAttribute("aria-valuetext", `${rating} - ${ratingLabels[rating]} risk`);
  const output = event.target.parentElement.querySelector("output");
  output.innerHTML = `<strong>${rating}</strong><span>${ratingLabels[rating]}</span>`;
  renderResults();
});

elements.sliders.addEventListener("click", (event) => {
  const button = event.target.closest(".info"); if (!button) return;
  const help = document.querySelector(`#${button.getAttribute("aria-controls")}`);
  help.hidden = !help.hidden; button.setAttribute("aria-expanded", String(!help.hidden));
});

elements.score.addEventListener("click", (event) => {
  if (!event.target.closest("#saveBaseline")) return;
  const result = scoreAssessment(state.ratings, state.weights);
  if (!result.valid) return;
  Object.assign(state, assessmentWithBaseline(state));
  renderResults();
});

document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset)));

elements.weightInputs.addEventListener("input", (event) => {
  if (!event.target.matches("[data-weight]")) return;
  state.weights[event.target.dataset.weight] = Number(event.target.value);
  updateWeightStatus();
  renderResults();
});

document.querySelector("#restoreWeights").addEventListener("click", () => {
  state.weights = restoreDefaultWeights();
  renderWeightInputs();
  renderResults();
});

document.querySelector("#normalizeWeights").addEventListener("click", () => {
  state.weights = normalizeWeights(state.weights);
  renderWeightInputs();
  renderResults();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  Object.assign(state, createInitialAssessment());
  syncDetails();
  renderSliders();
  renderWeightInputs();
  renderResults();
});

[[elements.name, "name"], [elements.type, "type"], [elements.system, "system"], [elements.environment, "environment"], [elements.description, "description"]].forEach(([element, key]) => element.addEventListener("input", () => { state.details[key] = element.value; renderResults(); }));

syncDetails();
renderSliders();
renderWeightInputs();
renderResults();
