"use client";

import { useState } from "react";

export function SignaturePad({
  signerName,
  signed,
  onSignedChange,
}: {
  signerName: string;
  signed: boolean;
  onSignedChange: (signed: boolean) => void;
}) {
  const [animating, setAnimating] = useState(false);

  function handleSign() {
    if (signed) return;
    setAnimating(true);
    setTimeout(() => {
      onSignedChange(true);
      setAnimating(false);
    }, 150);
  }

  return (
    <div className="space-y-stack-sm">
      <label className="px-1 text-label-lg uppercase tracking-wider text-on-surface-variant">
        Digital Authorization
      </label>
      <button
        type="button"
        onClick={handleSign}
        disabled={signed}
        className="flex h-32 w-full flex-col items-center justify-center rounded-sm border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors disabled:cursor-default"
      >
        {signed ? (
          <span
            className="font-serif text-display-lg italic text-primary"
            style={{ fontFamily: "cursive" }}
          >
            {signerName}
          </span>
        ) : (
          <>
            <span
              className={`material-symbols-outlined mb-2 text-headline-md text-outline transition-transform ${animating ? "scale-90" : ""}`}
            >
              draw
            </span>
            <span className="text-label-sm text-outline">
              Tap to sign within this area
            </span>
          </>
        )}
      </button>
      <div className="flex justify-between px-1">
        <p className="text-label-sm italic text-on-surface-variant">
          Authorized by biometric/device PIN verification
        </p>
        {signed && (
          <button
            type="button"
            onClick={() => onSignedChange(false)}
            className="text-label-sm font-bold uppercase text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
