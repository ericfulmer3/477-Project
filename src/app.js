import { DEFAULT_WEIGHTS, FACTORS } from "./framework.js";
import { scoreAssessment } from "./scoring.js";

const ratingLabels = ["", "Low", "Limited", "Moderate", "High", "Very high"];
const state = {
  details: { name: "", type: "AWS access key", system: "", environment: "Production", description: "" },
  ratings: Object.fromEntries(FACTORS.map(({ id }) => [id, 3])),
  weights: { ...DEFAULT_WEIGHTS },
  baseline: null
};

const elements = {
  sliders: document.querySelector("#factorSliders"),
  score: document.querySelector("#scoreCard"), chart: document.querySelector("#contributionChart"),
  name: document.querySelector("#credentialName"), type: document.querySelector("#credentialType"),
  system: document.querySelector("#credentialSystem"), environment: document.querySelector("#credentialEnvironment"),
  description: document.querySelector("#credentialDescription")
};

function formatPoints(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function renderResults() {
  const result = scoreAssessment(state.ratings, state.weights);
  if (!result.valid) {
    elements.score.innerHTML = `<p class="score-label">Weight total invalid</p><strong class="score-number">—</strong><p>Weights must total 100% to calculate a valid classification.</p>`;
    elements.chart.innerHTML = "";
    return;
  }
  const credential = state.details.name || "Current credential";
  elements.score.className = `score-card risk-${result.classification.toLowerCase()}`;
  elements.score.innerHTML = `<div class="score-top"><div><p class="score-label">Weighted risk score</p><h2>${credential}</h2></div><span class="risk-badge">${result.classification}</span></div><div class="score-value"><strong class="score-number">${formatPoints(result.score)}</strong><span>/ 100</span></div><div class="score-meter" aria-hidden="true"><i style="width:${result.score}%"></i></div><button id="saveBaseline" class="button baseline-button" type="button">Save as inherent-risk baseline</button><p class="minimum-note">Ratings start at 1; the practical minimum is 20.</p>`;
  elements.chart.innerHTML = result.contributions.map((item) => `<div class="bar-row"><div class="bar-label"><span>${item.name}</span><strong>${formatPoints(item.points)}</strong></div><div class="bar-track" role="img" aria-label="${item.name}: ${formatPoints(item.points)} weighted points"><i style="width:${Math.min(100, item.points / 0.15)}%"></i></div></div>`).join("");
}

function renderSliders() {
  elements.sliders.innerHTML = FACTORS.map((factor, index) => {
    const rating = state.ratings[factor.id];
    return `<article class="factor" style="--delay:${index * 35}ms">
      <div class="factor-copy"><div class="factor-title"><h3>${factor.name}</h3><button class="info" type="button" aria-expanded="false" aria-controls="help-${factor.id}" title="Show rating guidance">?</button></div><p>${factor.question}</p><div class="factor-help" id="help-${factor.id}" hidden><b>1</b> ${factor.anchors[1]}<br><b>3</b> ${factor.anchors[3]}<br><b>5</b> ${factor.anchors[5]}</div></div>
      <div class="slider-wrap"><output for="rating-${factor.id}"><strong>${rating}</strong><span>${ratingLabels[rating]}</span></output><input id="rating-${factor.id}" data-factor="${factor.id}" type="range" min="1" max="5" step="1" value="${rating}" aria-label="${factor.name} risk rating" style="--value:${(rating - 1) * 25}%" /><div class="ticks" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></div>
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
  state.ratings[event.target.dataset.factor] = Number(event.target.value);
  renderSliders();
  renderResults();
});

elements.sliders.addEventListener("click", (event) => {
  const button = event.target.closest(".info"); if (!button) return;
  const help = document.querySelector(`#${button.getAttribute("aria-controls")}`);
  help.hidden = !help.hidden; button.setAttribute("aria-expanded", String(!help.hidden));
});

[[elements.name, "name"], [elements.type, "type"], [elements.system, "system"], [elements.environment, "environment"], [elements.description, "description"]].forEach(([element, key]) => element.addEventListener("input", () => { state.details[key] = element.value; renderResults(); }));

syncDetails();
renderSliders();
renderResults();
