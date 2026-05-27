import type { OpenAPIV3 } from "openapi-types";

import { config } from "../shared/config/environment.js";

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Customer Lead Profiling API",
    version: "0.1.0",
    description:
      "Backend foundation for importing, validating, profiling, and analyzing real estate customer leads."
  },
  servers: [
    {
      url: config.apiPrefix,
      description: "Versioned API base path"
    }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check API and database health",
        responses: {
          "200": {
            description: "The API process is healthy.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Service is healthy" },
                    data: {
                      type: "object",
                      properties: {
                        service: { type: "string", example: "lead-profiling-api" },
                        environment: { type: "string", example: "development" },
                        uptimeSeconds: { type: "number", example: 12.34 },
                        database: {
                          type: "object",
                          properties: {
                            status: { type: "string", example: "connected" },
                            readyState: { type: "number", example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
