# CI/CD and Cloud Credential Risk Assessment Framework

An interactive, presentation-ready academic tool for evaluating the risk of individual machine credentials used in CI/CD and cloud workflows.

**Course:** CSCE 477 — Software/Tool Development Project<br>
**GitHub:** <https://github.com/ericfulmer3/477-Project><br>
**Public application:** Deployment pending; no public URL is available yet.

## Team

- Will Hassan
- Cale Kettner
- Dunsin Komolafe
- Kaori Shioyama
- Melissa Ordonez
- Brett Kaplan
- Eric Fulmer

## Problem and application overview

CI/CD pipelines use machine credentials to access source repositories, cloud platforms, package registries, deployment environments, and production systems. Examples include AWS access keys, GitHub Actions tokens, service accounts, API keys, npm publishing tokens, and temporary OpenID Connect (OIDC) credentials. A compromised credential can give an attacker the same access as the pipeline, but organizations may struggle to compare the risks created by different credential configurations.

This application evaluates one credential inventory item at a time. The user describes the credential, rates eight risk factors from 1 to 5, and receives a weighted score, classification, contribution breakdown, and prioritized control recommendations. The user can save the current assessment as inherent risk, model security improvements, and compare that baseline with residual risk.

The application is a demonstration of a proposed academic framework. It does not discover credentials, connect to cloud accounts, or make operational security decisions automatically.

## Features

- Credential name, type, pipeline or system, environment, and business-case fields
- Eight keyboard-accessible risk sliders with rating guidance
- Immediate weighted score and Low, Moderate, High, or Critical classification
- Per-factor contribution bars and prioritized security controls
- Inherent-risk baseline and residual-risk comparison
- Static AWS administrator-key and temporary OIDC demonstration presets
- Organization-specific weight customization with total validation
- Restore-default and normalize-to-100% weight controls
- Responsive classroom-presentation layout and reduced-motion support
- Screen-reader status and validation announcements in the markup
- Browser-only state with no authentication, database, analytics, or backend

Assessment data remains in the current page's browser memory. Refreshing or closing the page clears it; the application does not currently use local storage.

## Scoring methodology

Every factor rating uses the same 1–5 direction: a higher value always means greater risk.

| Factor | Default weight | What a higher rating means |
| --- | ---: | --- |
| Privilege | 15% | The credential can perform more powerful actions. |
| Scope | 10% | The credential can access more resources or environments. |
| Lifetime | 10% | The credential remains usable for longer. |
| Storage Security | 15% | Storage is less secure, such as plaintext or hardcoded storage. |
| Exposure Potential | 15% | More workflows, systems, or people can access the credential. |
| Detectability | 10% | Misuse is harder to detect. |
| Revocability | 10% | Disabling or rotating the credential is more difficult. |
| Blast Radius | 15% | A compromise could cause broader or more severe damage. |

The default weights total 100%. For each factor:

```text
factor risk points = (factor rating / 5) × factor weight
total risk score = sum of all eight factor risk points
```

Classifications are:

| Score | Classification |
| ---: | --- |
| 0–24 | Low |
| 25–49 | Moderate |
| 50–74 | High |
| 75–100 | Critical |

Ratings currently begin at 1. Therefore, the practical minimum with valid weights is **20**, not zero. A zero score is not attainable unless zero ratings are added in a future version.

The weights and thresholds are proposed academic defaults. They have not been validated as industry standards. An organization may calibrate the weights for its context, but custom weights must total 100% and should be established before assessments are compared.

## Inherent and residual risk

**Inherent risk** is the score for the credential's starting configuration before the modeled controls are applied. Selecting **Save as inherent-risk baseline** records the current score, classification, ratings, and weights.

**Residual risk** is the recalculated risk after the user changes ratings to represent improvements such as least privilege, shorter lifetimes, stronger storage, or better monitoring. The comparison shows the point reduction or increase. Comparisons pause if the baseline and current assessment use different weights, because scores produced by different weighting systems are not directly comparable.

Risk reduction does not mean risk elimination. The OIDC preset, for example, remains Moderate rather than reaching zero.

## Demonstration presets

### Static AWS administrator key

This scenario represents a long-lived AWS administrator key stored as a CI/CD secret with broad production access. With default weights it scores **83 — Critical**.

Ratings: Privilege 5, Scope 5, Lifetime 5, Storage Security 3, Exposure Potential 4, Detectability 3, Revocability 3, Blast Radius 5.

### OIDC temporary credential

This scenario represents a CI/CD workflow that obtains a short-lived, limited AWS credential through OIDC without storing a permanent cloud key. With default weights it scores **33 — Moderate**.

Ratings: Privilege 2, Scope 2, Lifetime 1, Storage Security 1, Exposure Potential 2, Detectability 2, Revocability 1, Blast Radius 2.

## Presentation workflow

1. Select **Static AWS key**.
2. Explain the **83 — Critical** score and the largest factor contributions.
3. Select **Save as inherent-risk baseline**.
4. Select **OIDC temporary** or adjust the sliders manually.
5. Show the **33 — Moderate** residual-risk score.
6. Explain the **50-point reduction** and why OIDC reduces but does not eliminate risk.
7. Review the updated contribution chart and control recommendations.
8. Optionally expand **Customize weights** to demonstrate validation, normalization, and organization-specific calibration.

## Technology and architecture

The project intentionally uses a small, dependency-free frontend stack:

- Semantic HTML5 for the document structure and form controls
- Modern CSS for branding, responsive layout, focus visibility, and reduced motion
- Native browser JavaScript modules for state, scoring, rendering, and interactions
- Node.js 20 or newer for the development server, production build, syntax checks, and tests
- The built-in `node:test` runner for automated tests

There is no frontend framework, backend, authentication layer, database, or production cloud integration. This keeps the scoring logic easy to inspect and makes the static application portable.

Important modules:

- `src/framework.js` — factor definitions, default weights, thresholds, presets, rating guidance, and control mappings
- `src/scoring.js` — score calculation, classification, contribution sorting, normalization, and recommendation selection
- `src/assessment-state.js` — initial state plus preset and baseline transitions
- `src/rendering.js` — safe HTML escaping for user-entered text
- `src/app.js` — DOM rendering and interaction coordination
- `src/styles.css` — visual system, responsive layouts, focus states, and reduced-motion behavior

Data flows from native form inputs into the in-memory assessment state. The UI calls the pure scoring functions after relevant changes, then rerenders the score, classification, contributions, recommendations, and comparison. Invalid weight totals suppress classification until the total is 100%.

The production build copies `index.html` and `src/` into the ignored `dist/` directory. Static hosting configuration and public publication are scheduled for a later deployment milestone.

## Repository structure

```text
.
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── scripts/
│   ├── build.js
│   └── dev-server.js
├── src/
│   ├── app.js
│   ├── assessment-state.js
│   ├── framework.js
│   ├── rendering.js
│   ├── scoring.js
│   └── styles.css
├── tests/
│   ├── accessibility.test.js
│   └── scoring.test.js
└── docs/
    ├── system-design.md
    ├── evaluation.md
    └── limitations.md
```

`dist/` is generated and intentionally excluded from version control. Screenshots are not currently included because no verified capture workflow has been completed.

## Installation and local use

Prerequisite: Node.js 20 or newer and Git.

```bash
git clone https://github.com/ericfulmer3/477-Project.git
cd 477-Project
npm ci
npm run dev
```

Open <http://localhost:4173> in a browser. To use another port:

```bash
PORT=8080 npm run dev
```

The documented clone-and-install procedure has not yet been rerun in a clean temporary directory. That verification is reserved for the final validation milestone.

## Tests and production build

Run the complete automated test suite:

```bash
npm test
```

Check the syntax of all JavaScript source modules:

```bash
npm run check
```

Create a production build in `dist/`:

```bash
npm run build
```

The automated suite verifies the two preset scores, default weight total, classification boundaries, invalid custom weights, normalization, default restoration, baseline differences, recommendation priority, state transitions, safe rendering, and static accessibility requirements. See [docs/evaluation.md](docs/evaluation.md) for recorded results and unperformed testing.

## Current limitations

- The proposed weights and thresholds have not been validated as an industry standard.
- Factor ratings require human judgment, so different assessors may produce different results.
- The tool does not discover, inventory, or verify real credentials.
- The demonstration does not connect to production cloud, CI/CD, repository, or package-registry systems.
- Data is not persisted across page refreshes.
- The score supports security discussion but does not replace professional risk analysis, threat modeling, or incident response planning.
- Formal screen-reader, assistive-technology, real-device mobile, clean-install, and public-access testing remain pending.
- No public deployment URL or verified application screenshots are available yet.

See [docs/limitations.md](docs/limitations.md) for additional detail and future improvements.

## References

These sources provide security and accessibility context. They do **not** validate the project's numerical weights or thresholds.

- [AWS Identity and Access Management: Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — temporary workload credentials and least privilege.
- [GitHub Docs: Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws) — exchanging a GitHub OIDC token for a short-lived AWS access token.
- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/wcag/) — semantic structure, keyboard operation, visible focus, contrast, and non-color status communication.
- [Nunito on Google Fonts](https://fonts.google.com/specimen/Nunito) and [Source Sans 3 on Google Fonts](https://fonts.google.com/specimen/Source%2BSans%2B3) — externally hosted typefaces used by the interface.

No external icons, photographs, illustrations, or other visual assets are used.
