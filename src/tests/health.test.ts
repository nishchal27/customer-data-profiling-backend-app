import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../app.js";

type HealthResponseBody = {
  success: boolean;
  message: string;
  data: {
    service: string;
    environment: string;
    uptimeSeconds: number;
    database: {
      status: string;
      readyState: number;
    };
  };
};

describe("GET /health", () => {
  it("returns service health using the standard response shape", async () => {
    const response = await request(app).get("/health").expect(200);
    const responseBody = response.body as HealthResponseBody;

    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe("Service is healthy");
    expect(responseBody.data.service).toBe("lead-profiling-api");
    expect(responseBody.data.environment).toBe("test");
    expect(typeof responseBody.data.uptimeSeconds).toBe("number");
    expect(typeof responseBody.data.database.status).toBe("string");
    expect(typeof responseBody.data.database.readyState).toBe("number");
  });
});
