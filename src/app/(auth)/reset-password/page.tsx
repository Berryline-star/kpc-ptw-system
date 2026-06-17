import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="glass-panel w-full max-w-[480px] rounded-xl p-stack-lg shadow-2xl md:p-12">
      <div className="mb-stack-lg text-center">
        <h2 className="mb-2 text-headline-md text-on-surface">
          Set a New Password
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Choose a new password for your KPC PTW account.
        </p>
      </div>

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-stack-md text-center">
          <p className="rounded-md bg-error-container px-stack-md py-3 text-body-sm text-on-error-container">
            This reset link is missing its token. Request a new one below.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-label-lg text-primary hover:underline"
          >
            Request a New Link
          </Link>
        </div>
      )}
    </div>
  );
}
