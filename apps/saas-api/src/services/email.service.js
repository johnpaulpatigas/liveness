import { Resend } from "resend";

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM = `Liveness Cloud <${FROM_ADDRESS}>`;
const isDev = process.env.NODE_ENV !== "production";

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendResetPasswordEmail(to, resetLink) {
  if (isDev) {
    console.log(
      `\n [PASSWORD RESET DISPATCH] To: ${to}\n Reset Link: ${resetLink}\n`,
    );
  }

  const resend = getClient();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY not configured. Password reset email not sent.",
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset your Liveness Cloud password",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;border-radius:14px;padding:10px 14px;vertical-align:middle;">
                    <span style="font-size:20px;color:#ffffff;font-weight:800;letter-spacing:-0.5px;">&#x2713; Liveness Cloud</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.06);padding:40px 36px;">

              <!-- Icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#eff6ff;border-radius:16px;padding:16px;">
                      <span style="font-size:32px;">&#128274;</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 8px;text-align:center;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Password Reset Request</h1>
              <p style="margin:0 0 28px;text-align:center;font-size:14px;color:#64748b;line-height:1.6;">
                We received a request to reset the password for your Liveness Cloud administrator account. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="${resetLink}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#92400e;">
                      &#9200;&nbsp; This link expires in <strong>30 minutes</strong>. If you didn't request a reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Raw Link Fallback -->
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-align:center;">If the button doesn't work, copy and paste this URL:</p>
              <p style="margin:0;font-size:11px;color:#2563eb;word-break:break-all;text-align:center;">
                <a href="${resetLink}" style="color:#2563eb;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} Liveness Cloud &bull; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    });
    if (error) {
      console.error("Failed to send password reset email via Resend:", error);
    }
  } catch (err) {
    console.error(
      "Failed to send password reset email via Resend (network error):",
      err,
    );
  }
}
