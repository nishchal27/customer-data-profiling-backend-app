import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { parseWithSchema, type ValidationTarget } from "../utils/validation.js";

type RequestValidationSchemas = Partial<Record<ValidationTarget, ZodSchema<unknown>>>;

export const validateRequest =
  (schemas: RequestValidationSchemas) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        request.body = parseWithSchema(schemas.body, request.body, "body");
      }

      if (schemas.params) {
        request.params = parseWithSchema(
          schemas.params,
          request.params,
          "params"
        ) as Request["params"];
      }

      if (schemas.query) {
        request.query = parseWithSchema(
          schemas.query,
          request.query,
          "query"
        ) as Request["query"];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
