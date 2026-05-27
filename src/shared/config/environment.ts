import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const nodeEnvSchema = z.enum(["development", "test", "production"]);

const booleanStringSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const configSchema = z.object({
  NODE_ENV: nodeEnvSchema.default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z
    .string()
    .url()
    .default("mongodb://localhost:27017/customer-data-profiling"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  SWAGGER_ENABLED: booleanStringSchema.default("true")
});

export type AppConfig = {
  nodeEnv: z.infer<typeof nodeEnvSchema>;
  port: number;
  mongoUri: string;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  apiPrefix: string;
  swaggerEnabled: boolean;
  isProduction: boolean;
  isTest: boolean;
};

export const loadConfig = (source: NodeJS.ProcessEnv = process.env): AppConfig => {
  const parsed = configSchema.parse(source);
  const isProduction = parsed.NODE_ENV === "production";

  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    mongoUri: parsed.MONGO_URI,
    logLevel: parsed.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    apiPrefix: parsed.API_PREFIX,
    swaggerEnabled: parsed.SWAGGER_ENABLED,
    isProduction,
    isTest: parsed.NODE_ENV === "test"
  };
};

export const config = loadConfig();
