"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { sendDailyNewsSummary } from "@/lib/inngest/functions";

import { sendWelcomeEmail } from "@/lib/email";

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    // 1️⃣ Создаём пользователя через auth.api
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (response) {
      // 2️⃣ Отправляем приветственное письмо напрямую
      await sendWelcomeEmail({
        email,
        name: fullName,
      });
    }

    return { success: true, data: response };
  } catch (e) {
    console.log("Sign up failed", e);
    return { success: false, error: "Sign up failed" };
  }
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({ body: { email, password } });
    sendDailyNewsSummary().catch((err) =>
      console.error("Failed to send daily news:", err),
    );

    return { success: true, data: response };
  } catch (e) {
    console.log("Sign in failed", e);
    return { success: false, error: "Sign in failed" };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (e) {
    console.log("Sign out failed", e);
    return { success: false, error: "Sign out failed" };
  }
};
