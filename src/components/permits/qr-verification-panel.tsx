"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function QrVerificationPanel({
  verificationToken,
}: {
  verificationToken: string;
}) {
  const [showQr, setShowQr] = useState(false);

  // NEXT_PUBLIC_APP_URL is the same env var already used for password
  // reset links — reused here so the QR code resolves correctly whether
  // running locally or deployed.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify/${verificationToken}`;

  return (
    <div className="relative overflow-hidden border-l-4 border-secondary bg-primary p-stack-md text-on-primary">
      <div className="flex items-center gap-stack-md">
        <button
          type="button"
          onClick={() => setShowQr((s) => !s)}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-white p-2 transition-transform active:scale-95"
          aria-label="Toggle QR code"
        >
          {showQr ? (
            <QRCodeSVG value={verifyUrl} size={64} />
          ) : (
            <span className="material-symbols-outlined text-[40px] text-primary">
              qr_code_2
            </span>
          )}
        </button>
        <div className="flex-1">
          <p className="text-label-lg font-bold">Quick Verification</p>
          <p className="text-body-sm text-on-primary/70">
            Field inspectors use this for compliance checks.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowQr((s) => !s)}
        className="mt-stack-md flex w-full items-center justify-center gap-2 bg-secondary-container px-4 py-2 text-label-md font-bold text-on-secondary transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined text-[18px]">
          qr_code_scanner
        </span>
        {showQr ? "Hide QR Code" : "Show QR Code"}
      </button>
    </div>
  );
}
