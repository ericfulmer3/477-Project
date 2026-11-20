# Evaluation Record

This document records only checks that have actually been performed for the CI/CD and Cloud Credential Risk Assessment Framework. Results are separated by evidence type so automated checks are not confused with manual or assistive-technology validation.

## Automated validation

The following commands were run successfully in the working repository on November 20, 2026:

```bash
npm test
npm run check
npm run build
git diff --check
```

At the completion of the accessibility milestone, `npm test` reported **17 passing tests, 0 failures**. The suite covered:

- Default weights totaling 100%
- Static AWS administrator-key score of 83 and Critical classification
- OIDC temporary-credential score of 33 and Moderate classification
- Classification boundaries at 0, 24, 25, 49, 50, 74, 75, and 100
- Suppression of classification for invalid weight totals
- Weight normalization to exactly 100%
- Recovery from an all-zero weight configuration
- Restoration of independent default-weight copies
- A 50-point baseline-to-residual difference
- Recommendation filtering and weighted-priority ordering
- Preset behavior preserving weights and the saved baseline
- Independent baseline snapshots of ratings and weights
- Complete and independent reset state
- Escaping of user-entered text before HTML rendering
- Presence of skip navigation, field grouping, result headings, and live regions
- Accessible slider names, descriptions, and value text
- Static presence of visible-focus and reduced-motion CSS

`npm run check` successfully parsed all JavaScript modules with `node --check`.

`npm run build` successfully recreated `dist/` with `index.html` and the complete `src/` directory. The generated directory is ignored by Git.

`git diff --check` found no whitespace errors in the reviewed changes.

## Preset results

The scoring tests confirm these results under the default weights:

| Scenario | Score | Classification |
| --- | ---: | --- |
| Static AWS administrator key | 83 | Critical |
| OIDC temporary credential | 33 | Moderate |

The verified difference is a 50-point reduction. The OIDC result remains Moderate, demonstrating that temporary identity reduces but does not eliminate credential risk.

## Manual visual review

Eric Fulmer manually reviewed the application's visual presentation during development. This is a team-reported manual review, distinct from the automated validation above. No formal viewport matrix, written checklist, device log, or screenshots were recorded for that review.

An automated browser-control attempt was also made during the visual-design milestone. The local preview server started successfully, but the browser-control host reported that no browser or native-app surface was available. Therefore, that attempt did **not** produce a verified automated desktop or mobile visual inspection.

## Accessibility review

Source-level accessibility review and automated assertions were completed for semantic field grouping, input labels, slider descriptions and value text, focus-preserving range updates, skip navigation, live regions, error associations, visible-focus CSS, non-color text labels, safe text rendering, and reduced motion.

This is not equivalent to assistive-technology conformance testing. No claim of WCAG conformance is made.

## Checks not yet performed

The following remain pending and must not be inferred from the automated results:

- Screen-reader testing
- Other assistive-technology testing
- Keyboard walkthrough in a controlled browser session
- Automated browser testing at specified desktop, tablet, and mobile viewport sizes
- Testing on a physical mobile device
- Formal contrast measurement across every state
- Clean clone and `npm ci` verification in a temporary directory
- Public deployment and unauthenticated public-access verification
- Cross-browser testing
- Performance or Lighthouse testing
- Informal testing by users other than the team-reported visual review

## Screenshots

No verified application screenshots were created. The `docs/screenshots/` directory is intentionally absent until the running application can be captured and checked truthfully.

## Documentation checks

The documentation milestone checks Markdown for empty local link targets, unresolved placeholder markers, and whitespace errors. External reference URLs are limited to official AWS, GitHub, W3C, and Google Fonts pages. Public application access cannot be checked until deployment occurs.
