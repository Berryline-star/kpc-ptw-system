interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Uses Resend's plain REST API via fetch rather than their SDK — avoids
 * adding a new npm dependency for what's a single POST request. Swap
 * this implementation out if the project settles on a different
 * provider (SES, Postmark, etc.) later; nothing outside this file
 * needs to change since callers only see sendEmail().
 *
 * Without RESEND_API_KEY set, this logs the email instead of sending
 * it — matches the previous behavior (console.log-only) so local dev
 * keeps working with zero setup. Set the env var to actually deliver.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "KPC Digital PtW <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:unsent — no RESEND_API_KEY set] to=${to} subject="${subject}"`);
    console.log(html);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] Resend request failed (${response.status}): ${body}`);
      return { success: false, error: `Email provider returned ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("[email] Failed to reach email provider:", error);
    return { success: false, error: "Could not reach email provider." };
  }
}

/** Shared wrapper so every transactional email in the app looks the
 * same without copy-pasting inline styles into five different action
 * files. Keep this plain-and-boring — email HTML rendering is
 * inconsistent enough across clients that fancy CSS mostly just breaks. */
export function emailLayout(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1c1e;">
      <p style="font-weight: 700; font-size: 18px; color: #00366e; margin: 0 0 24px;">KPC Digital PtW</p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #737782;">
        Kenya Pipeline Company — Digital Permit-to-Work System
      </p>
    </div>
  `;
}
