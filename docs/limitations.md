# Limitations and Future Improvements

## Methodological limitations

### Proposed, unvalidated weights

The default factor weights and classification thresholds are proposed academic values. They have not been statistically calibrated against incident data, validated by security practitioners, or established by an industry standard. The tool labels custom weights as organization-specific and requires a 100% total, but mathematical validity does not establish empirical validity.

Future work should gather practitioner feedback, compare scores with historical incidents, evaluate inter-rater consistency, and document a defensible calibration process.

### Subjective ratings

The framework depends on human judgment. Two assessors may interpret privilege, exposure, detectability, or blast radius differently even when reviewing the same credential. The 1, 3, and 5 anchors provide guidance, but ratings 2 and 4 still require interpolation.

Future versions could add a structured questionnaire, evidence fields, assessor notes, review status, and rating examples for each credential type.

### Additive model

The score is a weighted sum. It does not model nonlinear effects, dependencies, or interactions among factors. For example, high privilege and broad scope may create more combined risk than the sum alone communicates. The model also does not incorporate threat likelihood, control maturity confidence, asset value, or uncertainty ranges.

Future research could evaluate interaction terms, confidence intervals, separate likelihood and impact dimensions, or scenario-specific models.

### Classification simplification

Four broad labels make results easy to present, but adjacent scores can fall into different classifications even when the practical difference is small. Conversely, credentials with different risk patterns can receive the same total.

Users should review factor contributions and recommendations rather than relying only on the classification.

## Technical limitations

### No credential discovery or verification

The application does not scan repositories, CI/CD platforms, cloud accounts, secret managers, source history, or logs. It cannot verify whether a credential exists, whether permissions match the rating, or whether a control is actually deployed.

Future integrations could import inventory metadata through read-only APIs while keeping scoring decisions transparent and reviewable.

### No persistent storage

Assessment state exists only in page memory and is lost on refresh or close. There is no local storage, export, import, database, audit trail, or multi-credential inventory.

Future versions could add an explicit local export format before considering server-side persistence. Any persistence feature would require privacy, retention, and access-control design.

### Single-credential workflow

The interface assesses one credential at a time. It cannot rank an inventory, group credentials by system, track owners, or monitor remediation over time.

### No authentication or authorization

The static demonstration has no accounts. This is appropriate for non-sensitive classroom data but would be insufficient for operational credential inventories, which may contain sensitive security metadata.

### No production-system connections

The demo does not access AWS, GitHub, package registries, deployment platforms, or monitoring systems. It must not be interpreted as confirmation that a real environment is secure.

### Browser-session trust

Although user-entered credential names are escaped before generated HTML rendering, the application has not undergone a professional penetration test, dependency audit, or formal threat model. It should not be used to store actual secret values. Users should enter descriptive metadata only, never credential material.

## Evaluation limitations

- Automated tests cover the scoring engine, state transitions, safe rendering, and static accessibility requirements, but not full browser behavior.
- No screen reader or other assistive technology has been tested.
- No physical mobile device has been tested.
- No controlled cross-browser or viewport matrix has been completed.
- No formal contrast audit has been recorded.
- The README installation procedure has not yet been verified from a clean clone.
- The application has not yet been publicly deployed or tested without authentication.
- No verified screenshots are available.
- No structured external user study has been performed.

Eric Fulmer completed a manual visual review during development, but no formal review artifact or device matrix was recorded. That manual review should not be treated as a substitute for the pending checks above.

## Operational-use warning

This application supports education and structured discussion. It does not replace professional risk analysis, threat modeling, penetration testing, cloud security review, incident response planning, or governance approval.

Before operational use, an organization should validate the factor definitions, weights, thresholds, evidence requirements, review process, and control mappings against its own systems and risk appetite.

## Reasonable future improvements

1. Validate and calibrate the methodology with practitioners and incident data.
2. Add evidence notes and assessor confidence for every rating.
3. Add export and import without collecting secret values.
4. Support multi-credential inventories and remediation tracking.
5. Add versioned organizational weight profiles.
6. Add automated browser, accessibility, cross-browser, and device testing.
7. Complete clean-install and public deployment verification.
8. Capture verified screenshots for the final report.
9. Consider read-only integrations only after a privacy and security design review.
