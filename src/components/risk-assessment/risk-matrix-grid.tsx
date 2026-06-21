import {
  getMatrixCellLevel,
  MATRIX_CELL_COLORS,
} from "@/lib/config/risk-matrix";

export function RiskMatrixGrid({
  likelihood,
  severity,
}: {
  likelihood: number;
  severity: number;
}) {
  // Rows render severity 5 (top) down to 1 (bottom); columns are
  // likelihood 1 (left) to 5 (right) — matches the mockup's layout.
  const severityRows = [5, 4, 3, 2, 1];
  const likelihoodCols = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full max-w-md grid-cols-6 gap-1">
        <div className="col-span-1 flex -rotate-90 items-center justify-center">
          <span className="text-label-sm uppercase tracking-widest text-outline">
            Severity
          </span>
        </div>
        <div className="col-span-5 grid grid-cols-5 gap-1">
          {severityRows.map((s) =>
            likelihoodCols.map((l) => {
              const level = getMatrixCellLevel(l, s);
              const isCurrent = l === likelihood && s === severity;
              return (
                <div
                  key={`${l}-${s}`}
                  className="flex aspect-square items-center justify-center"
                  style={{ backgroundColor: MATRIX_CELL_COLORS[level] }}
                >
                  {isCurrent && (
                    <div className="pulse-marker flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-white shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>
        <div className="col-span-1" />
        <div className="col-span-5 mt-2 flex items-center justify-center">
          <span className="text-label-sm uppercase tracking-widest text-outline">
            Likelihood
          </span>
        </div>
      </div>
    </div>
  );
}
