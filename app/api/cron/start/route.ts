// app/api/cron/start/route.ts
import { startDailyNewsCron } from "@/lib/cron/dailyNews";

export async function GET() {
  startDailyNewsCron();
  return Response.json({ ok: true });
}
