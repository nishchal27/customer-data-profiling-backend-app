import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../app.js";

describe("POST /analyze validation", () => {
  it("returns a clean API error before persistence for invalid payloads", async () => {
    const response = await request(app)
      .post("/api/v1/analyze")
      .send([
        {
          lead_id: 1,
          name: "Invalid Lead",
          phone: "123",
          email: "not-an-email",
          property_type: "lease",
          budget: -1,
          location: "",
          preferred_property_type: "castle",
          contact_date: "not-a-date"
        }
      ])
      .expect(400);

    const responseBody = response.body as {
      success: boolean;
      message: string;
      errors: Array<{ path: string; message: string }>;
    };

    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe("Invalid request body");
    expect(responseBody.errors.length).toBeGreaterThan(0);
  });
});
