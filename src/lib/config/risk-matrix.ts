/**
 * KPC's standard 5x5 likelihood x severity risk matrix (per KPC Safety
 * Manual Rev 4.0, as shown in the Stitch mockup). This is an industrial-
 * standard matrix template, not a pure L x S product — severity is
 * weighted more heavily than likelihood, which is normal for safety risk
 * matrices and matches the exact cell-by-cell pattern in the mockup.
 *
 * Indexed as MATRIX[severity-1][likelihood-1], both 1-5.
 */
export type MatrixCellLevel = "low" | "medium" | "high" | "critical";

// Row order matches the mockup's visual layout: severity 5 (top) down to
// severity 1 (bottom). Each row is likelihood 1 through 5 (left to right).
const MATRIX_BY_SEVERITY_DESC: MatrixCellLevel[][] = [
  ["medium", "high", "high", "critical", "critical"], // severity 5
  ["medium", "medium", "high", "high", "critical"], // severity 4
  ["low", "medium", "medium", "high", "high"], // severity 3
  ["low", "low", "medium", "medium", "high"], // severity 2
  ["low", "low", "low", "medium", "medium"], // severity 1
];

export function getMatrixCellLevel(
  likelihood: number,
  severity: number,
): MatrixCellLevel {
  const clampedL = Math.min(Math.max(Math.round(likelihood), 1), 5);
  const clampedS = Math.min(Math.max(Math.round(severity), 1), 5);
  const rowIndex = 5 - clampedS; // severity 5 -> row 0
  return MATRIX_BY_SEVERITY_DESC[rowIndex][clampedL - 1];
}

export const MATRIX_CELL_COLORS: Record<MatrixCellLevel, string> = {
  low: "#4ade80", // green-400
  medium: "#facc15", // yellow-400
  high: "#fb923c", // orange-400
  critical: "#f87171", // red-400
};

// Maps the 4-tier matrix-cell vocabulary down to the 3-tier RiskLevel
// enum stored on RiskAssessment/Permit ("critical" rolls up into HIGH —
// the schema doesn't have a 4th tier, and critical hazards still need
// the same elevated handling as high-risk ones).
export function matrixLevelToRiskLevel(
  level: MatrixCellLevel,
): "LOW" | "MEDIUM" | "HIGH" {
  if (level === "low") return "LOW";
  if (level === "medium") return "MEDIUM";
  return "HIGH";
}

export const LIKELIHOOD_SCALE = [
  { value: 5, label: "5 - Frequent", description: "Occurs daily" },
  { value: 4, label: "4 - Probable", description: "Occurs weekly" },
  { value: 3, label: "3 - Occasional", description: "Monthly frequency" },
  { value: 2, label: "2 - Remote", description: "Occurs yearly" },
  { value: 1, label: "1 - Improbable", description: "Rare, exceptional" },
] as const;

export const SEVERITY_SCALE = [
  {
    value: 5,
    label: "5 - Catastrophic",
    description: "Fatality / major loss",
  },
  { value: 4, label: "4 - Major", description: "Serious injury / large loss" },
  { value: 3, label: "3 - Moderate", description: "Lost-time injury" },
  { value: 2, label: "2 - Minor", description: "First-aid injury" },
  { value: 1, label: "1 - Negligible", description: "No injury" },
] as const;
