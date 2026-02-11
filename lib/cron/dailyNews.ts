import cron from "node-cron";
import { sendDailyNewsSummary } from "@/lib/inngest/functions";

let started = false;

export function startDailyNewsCron() {
  if (started) return;
  started = true;

  cron.schedule("* * * * *", async () => {
    console.log("🕓 Cron triggered: daily news");
    await sendDailyNewsSummary();
  });

  console.log("⏰ Daily news cron scheduled for 16:00");
}
