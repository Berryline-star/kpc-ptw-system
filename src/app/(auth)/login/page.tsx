import { getSafeRedirectPath } from "@/lib/utils";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // middleware (src/auth.config.ts) redirects unauthenticated visitors
  // here with ?callbackUrl=/wherever-they-were-headed, e.g. /permits/new.
  // getSafeRedirectPath rejects anything that isn't a same-origin path
  // before it's trusted, so this can't become an open redirect.
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl, "/dashboard");

  return <LoginForm callbackUrl={safeCallbackUrl} />;
}
