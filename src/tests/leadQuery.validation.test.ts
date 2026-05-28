import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../app.js";

describe("GET /lead/:phone validation", () => {
  it("rejects malformed phone lookups before repository access", async () => {
    const response = await request(app).get("/api/v1/lead/123").expect(400);
    const responseBody = response.body as {
      success: boolean;
      message: string;
      errors: Array<{ path: string; message: string }>;
    };

    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe("Invalid request params");
    expect(responseBody.errors[0]?.path).toBe("phone");
  });
});
