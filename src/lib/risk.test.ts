import { describe, it, expect } from "vitest";
import { defaultHazardRiskLevel } from "@/lib/risk";
import { getMatrixCellLevel, matrixLevelToRiskLevel } from "@/lib/config/risk-matrix";

describe("defaultHazardRiskLevel", () => {
  it("matches the real matrix for the wizard's flat placeholder (L3/S3)", () => {
    // This is the exact pair permit.ts uses for every wizard-created
    // hazard — pinning it here means a future matrix change that
    // shifts this cell will fail loudly instead of silently changing
    // every new permit's default risk level.
    expect(defaultHazardRiskLevel(3, 3)).toBe(
      matrixLevelToRiskLevel(getMatrixCellLevel(3, 3)),
    );
  });

  it("is never out of sync with the matrix for any likelihood/severity pair", () => {
    for (let l = 1; l <= 5; l++) {
      for (let s = 1; s <= 5; s++) {
        expect(defaultHazardRiskLevel(l, s)).toBe(
          matrixLevelToRiskLevel(getMatrixCellLevel(l, s)),
        );
      }
    }
  });

  it("classifies catastrophic-severity, frequent-likelihood as HIGH", () => {
    expect(defaultHazardRiskLevel(5, 5)).toBe("HIGH");
  });

  it("classifies negligible-severity, improbable-likelihood as LOW", () => {
    expect(defaultHazardRiskLevel(1, 1)).toBe("LOW");
  });
});
