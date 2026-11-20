import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assessmentWithBaseline, assessmentWithPreset, createInitialAssessment } from "../src/assessment-state.js";
import { PRESETS } from "../src/framework.js";
import { escapeHtml } from "../src/rendering.js";

test("preset transitions preserve weights and baseline while replacing ratings", () => {
  const initial = createInitialAssessment();
  initial.weights.privilege = 20;
  initial.weights.scope = 5;
  initial.baseline = { score: 50 };
  const oidc = assessmentWithPreset(initial, "oidc");
  assert.deepEqual(oidc.ratings, PRESETS.oidc.ratings);
  assert.equal(oidc.weights.privilege, 20);
  assert.deepEqual(oidc.baseline, { score: 50 });
});

test("baseline transition snapshots ratings and weights", () => {
  const aws = assessmentWithPreset(createInitialAssessment(), "aws");
  const assessed = assessmentWithBaseline(aws);
  assert.equal(assessed.baseline.score, 83);
  aws.ratings.privilege = 1;
  aws.weights.privilege = 1;
  assert.equal(assessed.baseline.ratings.privilege, 5);
  assert.equal(assessed.baseline.weights.privilege, 15);
});

test("reset state is complete and independent", () => {
  const first = createInitialAssessment();
  first.details.name = "Changed";
  first.ratings.scope = 5;
  const reset = createInitialAssessment();
  assert.equal(reset.details.name, "");
  assert.equal(reset.ratings.scope, 3);
  assert.equal(reset.baseline, null);
});

test("user-entered text is escaped before HTML rendering", () => {
  assert.equal(escapeHtml(`<img src=x onerror="bad()"> & 'unsafe'`), "&lt;img src=x onerror=&quot;bad()&quot;&gt; &amp; &#39;unsafe&#39;");
});

test("document provides skip navigation, field grouping, and live regions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /class="skip-link" href="#assessment"/);
  assert.match(html, /<fieldset class="credential-fields">/);
  assert.match(html, /<legend class="sr-only">Credential details<\/legend>/);
  assert.match(html, /id="statusAnnouncements"[^>]+role="status"/);
  assert.match(html, /id="errorAnnouncements"[^>]+role="alert"/);
  assert.match(html, /<aside class="results-panel" aria-labelledby="resultsTitle">/);
  assert.match(html, /<h2 class="sr-only" id="resultsTitle">Assessment results<\/h2>/);
});

test("slider template exposes names, descriptions, and value text", async () => {
  const source = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(source, /aria-labelledby="label-\$\{factor\.id\}"/);
  assert.match(source, /aria-describedby="question-\$\{factor\.id\} help-\$\{factor\.id\}"/);
  assert.match(source, /aria-valuetext="\$\{rating\} - \$\{ratingLabels\[rating\]\} risk"/);
  assert.doesNotMatch(source, /state\.ratings\[event\.target\.dataset\.factor\].*\n\s*renderSliders\(\)/);
});

test("stylesheet includes visible focus and reduced-motion handling", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /:focus-visible\s*{/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
