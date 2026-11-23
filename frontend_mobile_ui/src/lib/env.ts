/**
 * Centralized, validated access to build-time config. Expo only inlines
 * `EXPO_PUBLIC_*` vars — anything read here is bundled into the client and
 * must never be a private secret (see .env.example).
 *
 * Failing fast on a missing/misconfigured value here is deliberate: a silent
 * fallback (e.g. an empty base URL) would surface later as a confusing
 * network error instead of an obvious startup one.
 */

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** Called once at app startup — see App.tsx. */
export function assertLiveConfig(): void {
  const missing: string[] = [];
  if (!env.apiBaseUrl) missing.push("EXPO_PUBLIC_API_BASE_URL");
  if (!env.supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill them in before running the app.",
    );
  }

  if (__DEV__ === false && !env.apiBaseUrl.startsWith("https://")) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL must use HTTPS in production builds.",
    );
  }
}
