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
    "/analyze": {
      post: {
        tags: ["Leads"],
        summary: "Import and profile lead inquiries",
        description:
          "Validates incoming inquiry payloads, normalizes customer data, and merges duplicate customers by phone number while preserving inquiry history.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    type: "array",
                    minItems: 1,
                    items: { $ref: "#/components/schemas/LeadInput" }
                  },
                  {
                    type: "object",
                    required: ["leads"],
                    properties: {
                      leads: {
                        type: "array",
                        minItems: 1,
                        items: { $ref: "#/components/schemas/LeadInput" }
                      }
                    }
                  }
                ]
              },
              examples: {
                sampleArray: {
                  summary: "Assignment sample shape",
                  value: [
                    {
                      lead_id: 1,
                      name: "John Doe",
                      phone: "+12345670001",
                      email: "johndoe1@example.com",
                      property_type: "sale",
                      budget: 300000,
                      location: "Los Angeles",
                      preferred_property_type: "house",
                      contact_date: "2024-01-05",
                      inquiry_notes:
                        "Looking for a single-family house in a quiet neighborhood."
                    }
                  ]
                },
                envelopedPayload: {
                  summary: "Client-friendly envelope",
                  value: {
                    leads: [
                      {
                        lead_id: "external-100",
                        name: "Jane Smith",
                        phone: "(123) 456-70002",
                        email: "JaneSmith2@Example.com",
                        property_type: "rental",
                        budget: "$1,500",
                        location: " san francisco ",
                        preferred_property_type: "apartment",
                        contact_date: "2024-01-06",
                        inquiry_notes:
                          "Needs a pet-friendly apartment near public transportation."
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Lead ingestion completed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnalyzeSuccessResponse" }
              }
            }
          },
          "400": {
            description: "Payload validation failed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
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
  },
  components: {
    schemas: {
      LeadInput: {
        type: "object",
        required: [
          "lead_id",
          "name",
          "phone",
          "email",
          "property_type",
          "budget",
          "location",
          "preferred_property_type",
          "contact_date"
        ],
        properties: {
          lead_id: { oneOf: [{ type: "string" }, { type: "number" }] },
          name: { type: "string", example: "John Doe" },
          phone: { type: "string", example: "+12345670001" },
          email: { type: "string", format: "email", example: "john@example.com" },
          property_type: {
            type: "string",
            enum: ["rental", "sale"],
            example: "sale"
          },
          budget: {
            oneOf: [{ type: "number" }, { type: "string" }],
            example: 300000
          },
          location: { type: "string", example: "Los Angeles" },
          preferred_property_type: {
            type: "string",
            enum: ["apartment", "house", "condo", "townhouse"],
            example: "house"
          },
          contact_date: {
            type: "string",
            format: "date",
            example: "2024-01-05"
          },
          inquiry_notes: {
            type: "string",
            example: "Looking for a quiet neighborhood."
          }
        }
      },
      AnalyzeSuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Lead ingestion completed" },
          data: {
            type: "object",
            properties: {
              summary: {
                type: "object",
                properties: {
                  received: { type: "number", example: 2 },
                  createdProfiles: { type: "number", example: 1 },
                  updatedProfiles: { type: "number", example: 1 },
                  totalProfilesAffected: { type: "number", example: 2 }
                }
              },
              profiles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phone: { type: "string", example: "+12345670001" },
                    inquiryCount: { type: "number", example: 2 },
                    status: {
                      type: "string",
                      enum: ["created", "updated"],
                      example: "updated"
                    }
                  }
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid request body" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "0.email" },
                message: { type: "string", example: "Invalid email" }
              }
            }
          }
        }
      }
    }
  }
};
