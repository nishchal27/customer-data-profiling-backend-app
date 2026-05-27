import pino from "pino";

import { config } from "../config/environment.js";

export const logger = pino({
  level: config.logLevel,
  base: config.isProduction ? undefined : { service: "lead-profiling-api" },
  transport:
    config.isProduction || config.isTest
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
          }
        },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true
  }
});
