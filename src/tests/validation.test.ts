import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppError } from "../shared/errors/AppError.js";
import { parseWithSchema } from "../shared/utils/validation.js";

describe("parseWithSchema", () => {
  const schema = z.object({
    email: z.string().email(),
    budget: z.number().positive()
  });

  it("returns typed data when validation succeeds", () => {
    const result = parseWithSchema(schema, {
      email: "agent@example.com",
      budget: 2500
    });

    expect(result.email).toBe("agent@example.com");
    expect(result.budget).toBe(2500);
  });

  it("throws an operational AppError with formatted issues", () => {
    expect(() => parseWithSchema(schema, { email: "bad", budget: -1 })).toThrow(AppError);
  });
});
