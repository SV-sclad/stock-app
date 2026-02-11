import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";
import { Resend } from "resend";

type UserForNewsEmail = {
  id: string;
  email: string;
  name?: string;
};

type MarketNewsArticle = {
  title: string;
  url: string;
  source?: string;
  summary?: string;
};

export interface MarketNewsArticle2 {
  title: string;
  url: string;
  source?: string;
  summary?: string;
  publishedAt?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

type SendWelcomeEmailParams = {
  email: string;
  name?: string;
  country?: string;
  investmentGoals?: string;
  riskTolerance?: string;
  preferredIndustry?: string;
};

export const sendWelcomeEmail = async ({
  email,
  name,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SendWelcomeEmailParams) => {
  const userProfile = `
- Country: ${country || "N/A"}
- Investment goals: ${investmentGoals || "N/A"}
- Risk tolerance: ${riskTolerance || "N/A"}
- Preferred industry: ${preferredIndustry || "N/A"}
`;

  // Можно подставить любой текст приветствия
  const introText = `Thanks for joining Signalist. Here’s your profile summary:\n${userProfile}`;

  await resend.emails.send({
    from: "onboarding@resend.dev", // 👈 твой домен
    to: email,
    subject: "Добро пожаловать в Signalist 🚀",
    html: `
      <h2>Привет${name ? `, ${name}` : ""}!</h2>
      <p>${introText}</p>
      <p>Рады видеть тебя в Signalist.</p>
    `,
  });

  console.log(`Welcome email sent to ${email}`);
};

export async function sendDailyNewsSummary() {
  try {
    // 1️⃣ Получаем всех пользователей для рассылки
    const users: UserForNewsEmail[] = await getAllUsersForNewsEmail();
    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };

    // 2️⃣ Собираем новости для каждого пользователя
    const userNewsSummaries: {
      user: UserForNewsEmail;
      articles: MarketNewsArticle[];
    }[] = [];

    for (const user of users) {
      try {
        const symbols = await getWatchlistSymbolsByEmail(user.email);
        let articlesRaw = await getNews(symbols);

        // Если новостей нет, получаем общие
        if (!articlesRaw || articlesRaw.length === 0) {
          articlesRaw = await getNews();
        }

        // Ограничиваем до 6 статей
        articlesRaw = (articlesRaw || []).slice(0, 6);

        // Приводим к типу MarketNewsArticle
        const articles: MarketNewsArticle[] = articlesRaw.map((a) => ({
          title: a.headline || "No title", // <-- заменяем на ключ, который реально приходит
          url: a.url || "",
          source: a.source,
          summary: a.summary,
          publishedAt: a.datetime, // <-- заменяем на ключ из API
        }));

        userNewsSummaries.push({ user, articles });
      } catch (err) {
        console.error("Error fetching news for user:", user.email, err);
        userNewsSummaries.push({ user, articles: [] });
      }
    }

    // 3️⃣ Отправка писем через Resend
    await Promise.all(
      userNewsSummaries.map(async ({ user, articles }) => {
        if (!articles || articles.length === 0) return;

        const newsHtml = articles
          .map(
            (a) =>
              `<p><strong>${a.title}</strong> (${a.source || "unknown"})<br/><a href="${a.url}">${a.url}</a><br/>${a.summary || ""}</p>`,
          )
          .join("");

        console.log(
          `📧 Sending news summary to: ${user.email}, articles: ${articles.length}`,
        );

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: user.email,
          subject: `Market News Summary — ${getFormattedTodayDate()}`,
          html: `
            <h2>Здравствуйте${user.name ? `, ${user.name}` : ""}!</h2>
            <p>Вот краткая сводка новостей рынка за ${getFormattedTodayDate()}:</p>
            ${newsHtml}
            <hr />
            <p style="font-size:12px;color:#888;">
              Вы получили это письмо, потому что подписаны на рассылку Signalist.
            </p>
          `,
        });
      }),
    );

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  } catch (err) {
    console.error("sendDailyNewsSummary error:", err);
    return { success: false, message: "Failed to send daily news summary" };
  }
}
