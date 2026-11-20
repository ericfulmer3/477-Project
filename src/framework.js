export const FACTORS = [
  {
    id: "privilege",
    name: "Privilege",
    weight: 15,
    question: "What actions can the credential perform?",
    anchors: { 1: "Read-only or minimal permissions", 3: "Can modify or deploy within a limited area", 5: "Administrator or unrestricted permissions" },
    control: "Apply least privilege and remove administrator permissions."
  },
  {
    id: "scope",
    name: "Scope",
    weight: 10,
    question: "How many resources or environments can it access?",
    anchors: { 1: "One isolated resource", 3: "Multiple services or one production application", 5: "Multiple accounts, environments, or organization-wide access" },
    control: "Separate credentials by service and environment."
  },
  {
    id: "lifetime",
    name: "Lifetime",
    weight: 10,
    question: "How long does it remain usable?",
    anchors: { 1: "Minutes or hours", 3: "Days or weeks", 5: "Long-lived or no expiration" },
    control: "Use short-lived credentials or OIDC/workload identity."
  },
  {
    id: "storage",
    name: "Storage Security",
    weight: 15,
    question: "How risky is the credential's storage?",
    anchors: { 1: "No permanent secret, workload identity, or equivalent protection", 3: "Stored as an encrypted CI/CD secret", 5: "Hardcoded, plaintext, exposed in logs, or stored in source code" },
    control: "Remove hardcoded secrets and use a secret manager or workload identity."
  },
  {
    id: "exposure",
    name: "Exposure Potential",
    weight: 15,
    question: "How many workflows, systems, processes, or people can access it?",
    anchors: { 1: "One tightly restricted workflow", 3: "Several workflows or team members", 5: "Broad access across repositories, systems, or users" },
    control: "Restrict which users and workflows can access the credential."
  },
  {
    id: "detectability",
    name: "Detectability",
    weight: 10,
    question: "How difficult would misuse be to detect?",
    anchors: { 1: "Comprehensive logging and immediate alerts", 3: "Logs exist but require manual review", 5: "Little or no useful monitoring" },
    control: "Add credential-use logging, alerts, and anomaly detection."
  },
  {
    id: "revocability",
    name: "Revocability",
    weight: 10,
    question: "How difficult is the credential to disable?",
    anchors: { 1: "Automatically expires or can be disabled immediately", 3: "Requires manual rotation with moderate effort", 5: "Difficult to revoke without significant disruption" },
    control: "Automate rotation and maintain a tested revocation process."
  },
  {
    id: "blastRadius",
    name: "Blast Radius",
    weight: 15,
    question: "What is the maximum potential damage after compromise?",
    anchors: { 1: "One isolated development resource", 3: "One production application or a limited amount of sensitive data", 5: "Broad production, customer-data, cloud-account, or software-supply-chain impact" },
    control: "Segment production and restrict access to sensitive resources."
  }
];

export const DEFAULT_WEIGHTS = Object.fromEntries(FACTORS.map(({ id, weight }) => [id, weight]));

export const THRESHOLDS = [
  { min: 75, label: "Critical" },
  { min: 50, label: "High" },
  { min: 25, label: "Moderate" },
  { min: 0, label: "Low" }
];

export const PRESETS = {
  aws: {
    label: "Static AWS administrator key",
    description: "A long-lived AWS administrator key is stored as a CI/CD secret and provides broad production access.",
    details: { name: "Static AWS Administrator Key", type: "AWS access key", system: "Production deployment pipeline", environment: "Production" },
    ratings: { privilege: 5, scope: 5, lifetime: 5, storage: 3, exposure: 4, detectability: 3, revocability: 3, blastRadius: 5 }
  },
  oidc: {
    label: "OIDC temporary credential",
    description: "A CI/CD workflow obtains a short-lived, limited AWS credential through OIDC without storing a permanent cloud key.",
    details: { name: "OIDC Temporary Credential", type: "Temporary OIDC credential", system: "Production deployment pipeline", environment: "Production" },
    ratings: { privilege: 2, scope: 2, lifetime: 1, storage: 1, exposure: 2, detectability: 2, revocability: 1, blastRadius: 2 }
  }
};
