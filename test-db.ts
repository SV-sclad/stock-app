import "dotenv/config";
import { connectToDatabase } from "./database/mongoose";

(async () => {
  try {
    await connectToDatabase();
    console.log("✅ База данных успешно подключена");

    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:");
    console.error(error);

    process.exit(1);
  }
})();
