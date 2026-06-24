import { requireUser } from "@/lib/session";
import { QrScannerView } from "@/components/scanner/qr-scanner-view";

export default async function ScannerPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-md p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg text-center">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Permit Verification
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Scan a permit&apos;s QR code for an instant compliance check.
        </p>
      </section>

      <QrScannerView />
    </div>
  );
}
