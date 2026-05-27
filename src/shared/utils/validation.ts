import type { ZodError, ZodSchema } from "zod";

import { AppError } from "../errors/AppError.js";
import { httpStatus } from "../constants/httpStatus.js";

export type ValidationTarget = "body" | "params" | "query";

export type ValidationIssue = {
  path: string;
  message: string;
};

export const formatZodIssues = (error: ZodError): ValidationIssue[] =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

export const parseWithSchema = <TOutput>(
  schema: ZodSchema<TOutput>,
  payload: unknown,
  target: ValidationTarget = "body"
): TOutput => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new AppError(`Invalid request ${target}`, httpStatus.BAD_REQUEST, {
      details: formatZodIssues(result.error)
    });
  }

  return result.data;
};
