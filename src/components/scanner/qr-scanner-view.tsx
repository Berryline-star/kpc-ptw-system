"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

/**
 * Extracts a verification token from a scanned value. Handles both a
 * full URL (https://.../verify/abc123 — what real QR codes encode) and
 * a bare token (useful for manual entry / testing), so the same parser
 * works for both scan and type-in paths.
 */
function extractToken(scanned: string): string | null {
  try {
    const url = new URL(scanned);
    const match = url.pathname.match(/\/verify\/([^/]+)/);
    if (match) return match[1];
  } catch {
    // Not a URL — fall through to treating it as a raw token.
  }
  const trimmed = scanned.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function QrScannerView() {
  const router = useRouter();
  const [manualEntry, setManualEntry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  function handleScan(results: IDetectedBarcode[]) {
    if (!scanning || results.length === 0) return;
    const token = extractToken(results[0].rawValue);
    if (!token) {
      setError("Couldn't read that code. Try again or enter it manually.");
      return;
    }
    setScanning(false);
    router.push(`/verify/${token}`);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = extractToken(manualEntry);
    if (!token) return;
    router.push(`/verify/${token}`);
  }

  return (
    <div className="flex flex-col items-center gap-stack-md">
      <div className="relative aspect-square w-full max-w-[280px] overflow-hidden border border-outline-variant bg-surface-container-highest shadow-sm">
        {scanning ? (
          <Scanner
            onScan={handleScan}
            onError={() =>
              setError(
                "Camera unavailable. Check permissions, or enter the permit code manually below.",
              )
            }
            formats={["qr_code"]}
            components={{ finder: false, torch: true }}
            styles={{ container: { width: "100%", height: "100%" } }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-[40px] text-primary">
              progress_activity
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-secondary" />
          <div className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-secondary" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-secondary" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-secondary" />
        </div>
      </div>

      <p className="text-label-md tracking-wider text-on-surface-variant">
        ALIGN QR CODE WITHIN FRAME
      </p>

      {error && (
        <p
          role="alert"
          className="w-full max-w-[280px] rounded-md bg-error-container px-stack-md py-2 text-center text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleManualSubmit}
        className="flex w-full max-w-[280px] flex-col gap-2"
      >
        <label
          htmlFor="manual-token"
          className="text-label-sm uppercase tracking-wider text-on-surface-variant"
        >
          Or enter permit code manually
        </label>
        <div className="flex gap-2">
          <input
            id="manual-token"
            type="text"
            value={manualEntry}
            onChange={(e) => setManualEntry(e.target.value)}
            placeholder="Verification code"
            className="h-10 flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-body-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Go
          </button>
        </div>
      </form>
    </div>
  );
}
