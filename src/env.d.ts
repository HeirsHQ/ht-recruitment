export const requiredEnvVars = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_INITIALIZATION_VECTOR",
  "NEXT_PUBLIC_SECRET_KEY",
  "NODE_ENV",
] as const;

type RequiredEnvVars = (typeof requiredEnvVars)[number];

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<RequiredEnvVars, string> {
      readonly NEXT_PUBLIC_API_URL: string;
      readonly NEXT_PUBLIC_INITIALIZATION_VECTOR: string;
      readonly NEXT_PUBLIC_SECRET_KEY: string;
      readonly NODE_ENV: "development" | "production";
    }
  }
}

export {};
