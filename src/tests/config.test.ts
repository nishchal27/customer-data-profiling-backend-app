import { describe, expect, it } from "vitest";

import { loadConfig } from "../shared/config/environment.js";

describe("loadConfig", () => {
  it("loads defaults for optional environment values", () => {
    const config = loadConfig({});

    expect(config).toMatchObject({
      nodeEnv: "development",
      port: 3000,
      mongoUri: "mongodb://localhost:27017/customer-data-profiling",
      apiPrefix: "/api/v1",
      swaggerEnabled: true,
      isProduction: false,
      isTest: false
    });
  });

  it("derives production-aware defaults", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      PORT: "8080",
      MONGO_URI: "mongodb://mongo:27017/customer-data-profiling",
      API_PREFIX: "/api",
      SWAGGER_ENABLED: "false"
    });

    expect(config.logLevel).toBe("info");
    expect(config.port).toBe(8080);
    expect(config.swaggerEnabled).toBe(false);
    expect(config.isProduction).toBe(true);
  });
});
