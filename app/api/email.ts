// pages/api/email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendWelcomeEmail } from "@/lib/inngest/functions";
import { sendDailyNewsSummary } from "@/lib/inngest/functions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === "POST") {
      const { type, data } = req.body;

      if (type === "sign-up") {
        // Отправка welcome email
        await sendWelcomeEmail(data);
        return res
          .status(200)
          .json({ success: true, message: "Welcome email sent" });
      }

      if (type === "daily-news") {
        // Отправка ежедневной рассылки
        await sendDailyNewsSummary();
        return res
          .status(200)
          .json({ success: true, message: "Daily news emails sent" });
      }

      return res
        .status(400)
        .json({ success: false, message: "Unknown email type" });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error("Email API error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
