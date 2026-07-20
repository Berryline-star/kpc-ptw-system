import { getMatrixCellLevel, matrixLevelToRiskLevel } from "@/lib/config/risk-matrix";
import type { RiskLevel } from "@prisma/client";

/**
 * Extracted out of lib/actions/permit.ts (a "use server" file) rather
 * than left there: Next.js requires every export from a "use server"
 * module to be an async function, so a plain sync helper like this
 * can't live there even though it worked fine before it was exported
 * for testing — plain `tsc --noEmit` doesn't catch that constraint
 * (it's enforced by Next's "use server" transform at build time, not
 * by the type checker), so this is easy to get wrong silently.
 *
 * This used to be its own score-threshold function (>=15 HIGH, >=8
 * MEDIUM) — a *separate* classification scheme from the one
 * risk-assessment.ts uses for real hazard data (the actual 5x5
 * likelihood x severity matrix in lib/config/risk-matrix.ts, which
 * isn't a pure product — severity is weighted more heavily). The two
 * schemes happened to agree at the specific values each call site used,
 * but that was coincidence, not a guarantee — a values.ts fixture using
 * different numbers could easily have disagreed. Delegating to the real
 * matrix here removes that whole category of bug.
 */
export function defaultHazardRiskLevel(
  likelihood: number,
  severity: number,
): RiskLevel {
  return matrixLevelToRiskLevel(getMatrixCellLevel(likelihood, severity));
}
