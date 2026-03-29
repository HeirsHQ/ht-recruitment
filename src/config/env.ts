import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_INITIALIZATION_VECTOR: z.string().min(1, "Initialization vector is a required env"),
  NEXT_PUBLIC_SECRET_KEY: z.string().min(1, "Secret key is a required env"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
