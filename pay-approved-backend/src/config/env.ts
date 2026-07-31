import dotenv from "dotenv";

dotenv.config();

export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseDbUrl: process.env.SUPABASE_DB_URL ?? "",
  port: parseInt(process.env.PORT ?? "3000", 10),
  expoPushNotificationApiKey: process.env.EXPO_PUSH_NOTIFICATION_API_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "",
};

export function validateEnv(): void {
  const missing: string[] = [];
  if (!env.supabaseUrl) {
    missing.push("SUPABASE_URL");
  }
  if (!env.supabaseAnonKey) {
    missing.push("SUPABASE_ANON_KEY");
  }
  if (!env.supabaseServiceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
