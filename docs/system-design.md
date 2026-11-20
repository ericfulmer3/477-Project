# System Design

## Problem statement

CI/CD pipelines and cloud automation depend on machine credentials that can read source code, publish packages, deploy applications, and administer infrastructure. If one credential is compromised, the impact depends on what it can do, where it works, how long it remains valid, how it is stored and exposed, and how quickly misuse can be detected and contained.

The CI/CD and Cloud Credential Risk Assessment Framework provides a consistent educational workflow for evaluating one credential at a time. It makes the scoring calculation inspectable, identifies the factors producing the largest risk contribution, recommends controls, and supports an inherent-versus-residual comparison.

## User workflow

1. Enter the credential name, type, system or pipeline, environment, and optional business case.
2. Rate eight factors from 1 to 5, where a higher value always means greater risk.
3. Review the weighted score, classification, and factor contributions.
4. Review controls triggered by factors rated 4 or 5.
5. Save the assessment as the inherent-risk baseline.
6. Change ratings to model security improvements or load the OIDC preset.
7. Compare the new residual-risk result with the baseline.
8. Optionally calibrate organization-specific weights, which must total 100%.

## Component architecture

```text
Native form controls
        │
        ▼
src/app.js ──────────────┐
        │                │
        ▼                ▼
assessment-state.js   rendering.js
        │                │
        └──────┬─────────┘
               ▼
          scoring.js
               │
               ▼
          framework.js
               │
               ▼
 Score, classification, contribution bars,
 recommendations, and baseline comparison
```

### Responsibilities

- `index.html` defines page landmarks, semantic field groups, live regions, and static content.
- `src/framework.js` is the single source of truth for factors, default weights, classification thresholds, presets, rating guidance, and control mappings.
- `src/scoring.js` contains pure scoring, classification, normalization, validation, difference, and recommendation functions.
- `src/assessment-state.js` creates initial state and implements testable preset and baseline transitions.
- `src/rendering.js` escapes user-entered strings before insertion into generated markup.
- `src/app.js` coordinates DOM events, state updates, calculations, announcements, and rendering.
- `src/styles.css` implements the presentation design, responsive breakpoints, keyboard focus, and reduced-motion behavior.
- `scripts/dev-server.js` serves the source tree locally.
- `scripts/build.js` produces a static `dist/` directory.

## Scoring-engine design

The rating for each factor is constrained to 1–5. For each factor:

```text
points = (rating / 5) × weight
```

The total score is the sum of all eight contributions. With weights totaling 100%, the theoretical classification scale is 0–100, but the active 1–5 rating range makes 20 the practical minimum.

Classification thresholds are evaluated from highest to lowest:

- Critical: 75–100
- High: 50–74
- Moderate: 25–49
- Low: 0–24

The engine returns an invalid result with no score or classification when weights do not total 100%. Contributions are sorted in descending order for the visual breakdown.

## Data model

The application keeps one mutable assessment object in browser memory:

```js
{
  details: {
    name,
    type,
    system,
    environment,
    description
  },
  ratings: {
    privilege,
    scope,
    lifetime,
    storage,
    exposure,
    detectability,
    revocability,
    blastRadius
  },
  weights: {
    // one numeric percentage for every factor
  },
  baseline: null | {
    score,
    classification,
    name,
    ratings,
    weights
  }
}
```

The baseline stores independent copies of ratings and weights. This prevents later slider or weight changes from modifying the recorded inherent-risk configuration.

No information is sent to a server or written to persistent storage. Page refresh resets the assessment.

## Weight customization

Default weights come from the factor definitions and total 100%. The customization panel permits decimal percentages from 0 to 100. Every edit recalculates the total and applies `aria-invalid` when the total is not 100%.

An invalid total suppresses the score and classification. **Restore defaults** creates a new copy of the original weights. **Normalize to 100%** scales every current weight proportionally and corrects rounding drift; an all-zero configuration becomes eight equal 12.5% weights.

Baseline comparisons pause when current and baseline weights differ. This prevents the interface from presenting a reduction between scores produced with inconsistent weighting systems.

## Recommendation logic

A recommendation is triggered when its factor rating is 4 or 5. Each recommendation includes the factor's weighted contribution and control text. Recommendations are sorted by contribution, largest first, so the highest-value intervention appears at the top.

The current mappings cover least privilege, credential separation, temporary credentials or OIDC, secret management, access restriction, logging and anomaly detection, automated rotation and revocation, and production segmentation.

When no factor is rated 4 or 5, the interface states that no priority control is triggered while also warning that reduced risk is not eliminated.

## Interaction and accessibility design

Native inputs, selects, text areas, buttons, disclosure elements, and range controls are used wherever possible. Range inputs preserve focus during updates so arrow-key operation remains continuous. Sliders expose names, descriptions, current numeric values, and risk-language value text.

Dedicated live regions announce score and classification changes, invalid weight totals, and baseline comparisons. Risk classifications are presented as text as well as color. The stylesheet includes visible focus treatment, a skip link, minimum target sizing, responsive layouts, and a reduced-motion media query.

These implementation measures have automated source-level coverage, but formal screen-reader and assistive-technology testing has not yet been performed.

## Deployment architecture

The application is designed for static hosting:

```text
Git repository → npm run build → dist/ → static hosting service → browser
```

The build copies `index.html` and `src/` into `dist/`. There are no server-side routes, runtime secrets, database bindings, authentication callbacks, or external API calls.

Public deployment is pending. The deployment manifest and final publishing workflow will be completed in the deployment milestone; this document intentionally does not claim a live URL.
