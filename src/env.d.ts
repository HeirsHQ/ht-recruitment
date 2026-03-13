export const requiredEnvVars = ["NEXT_PUBLIC_API_URL", "NODE_ENV"] as const;

type RequiredEnvVars = (typeof requiredEnvVars)[number];

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<RequiredEnvVars, string> {
      readonly NEXT_PUBLIC_API_URL: string;
      readonly NODE_ENV: "development" | "production";
    }
  }
}

export {};
