import { NextResponse } from "next/server";
import { runPermitExpiryCheck } from "@/lib/actions/expiry-check";

/**
 * Daily permit lifecycle maintenance (activate / warn / expire — see
 * runPermitExpiryCheck for what each pass does). Route path is still
 * "permit-expiry" since that's what's already deployed in vercel.json;
 * not worth a rename now that it does slightly more than its name says.
 *
 * Wired to Vercel Cron (see vercel.json) to run once a day. Vercel signs
 * cron-triggered requests with `Authorization: Bearer $CRON_SECRET`
 * automatically once CRON_SECRET is set as an env var on the project —
 * this check rejects anything that doesn't carry that same secret, so a
 * random person who finds this URL can't repeatedly trigger it.
 *
 * Manual testing locally: curl -H "Authorization: Bearer <your CRON_SECRET>" http://localhost:3000/api/cron/permit-expiry
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPermitExpiryCheck();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("permit-expiry cron failed:", error);
    return NextResponse.json(
      { success: false, error: "Expiry check failed." },
      { status: 500 },
    );
  }
}
