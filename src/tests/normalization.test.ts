import { describe, expect, it } from "vitest";

import {
  normalizeBudget,
  normalizeEmail,
  normalizeLeadType,
  normalizeLocation,
  normalizePhoneNumber,
  normalizePreferredPropertyType,
  parseInquiryDate
} from "../shared/utils/normalization.js";

describe("normalization utilities", () => {
  it("normalizes customer identity fields consistently", () => {
    expect(normalizePhoneNumber(" (123) 456-70001 ")).toBe("+12345670001");
    expect(normalizeEmail(" Agent@Example.COM ")).toBe("agent@example.com");
  });

  it("normalizes inquiry classification and formatting fields", () => {
    expect(normalizeLeadType(" Sale ")).toBe("sale");
    expect(normalizePreferredPropertyType("Townhouse")).toBe("townhouse");
    expect(normalizeLocation("  san   francisco ")).toBe("San Francisco");
    expect(normalizeBudget("$1,500")).toBe(1500);
    expect(parseInquiryDate("2024-01-05").toISOString()).toContain("2024-01-05");
  });
});
