import { z } from "zod";

import { normalizePhoneNumber } from "../../../shared/utils/normalization.js";

export const leadPhoneParamsSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(
      (value) => {
        const digitCount = normalizePhoneNumber(value).replace(/\D/g, "").length;

        return digitCount >= 7 && digitCount <= 15;
      },
      { message: "Phone number must contain 7 to 15 digits" }
    )
});

export type LeadPhoneParams = z.infer<typeof leadPhoneParamsSchema>;
