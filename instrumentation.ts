import { startDailyNewsCron } from "@/lib/cron/dailyNews";

export async function register() {
  console.log("🚀 Server started → starting cron jobs");

  startDailyNewsCron();
}
