"use server";

import { signIn, signOut, AuthError } from "@/auth";
import { getSafeRedirectPath } from "@/lib/utils";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    // Re-validated here too (not just in the login page) since a
    // server action must never trust a hidden form field on its own —
    // the field is just how the value survives the round trip from the
    // Server Component that already validated it.
    const redirectTo = getSafeRedirectPath(
      formData.get("callbackUrl") as string | null,
      "/dashboard",
    );

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo,
    });
  } catch (error) {
    // NEXT_REDIRECT is thrown by signIn() on success — let it propagate.
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
