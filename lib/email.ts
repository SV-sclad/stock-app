import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(params: {
  email: string;
  name?: string;
}) {
  const { email, name } = params;

  console.log("📧 Sending welcome email to:", email);

  const result = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Добро пожаловать 🚀",
    html: `
      <h2>Привет${name ? `, ${name}` : ""}!</h2>
      <p>Рады видеть тебя в Signalist.</p>
    `,
  });

  console.log("✅ Resend response:", result);
}
