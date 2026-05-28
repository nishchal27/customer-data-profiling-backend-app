import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { connectDatabase, disconnectDatabase } from "../src/shared/config/database.js";
import { logger } from "../src/shared/logger/logger.js";
import { LeadProfileModel } from "../src/modules/lead/schemas/leadProfile.schema.js";
import { leadIngestionService } from "../src/modules/lead/services/lead.service.js";
import { analyzeLeadsRequestSchema } from "../src/modules/lead/validators/lead.validator.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sampleDataPath = path.resolve(currentDir, "../docs/data/sample_lead_data.json");

const seedSampleData = async (): Promise<void> => {
  await connectDatabase();

  try {
    const rawSampleData = await readFile(sampleDataPath, "utf8");
    const payload: unknown = JSON.parse(rawSampleData);
    const validatedPayload = analyzeLeadsRequestSchema.parse(payload);

    // The seed command is intentionally deterministic for reviewers: each run
    // rebuilds the sample dataset instead of appending duplicate inquiry history.
    await LeadProfileModel.deleteMany({});

    const result = await leadIngestionService.ingestLeads(validatedPayload);

    logger.info(
      {
        sampleDataPath,
        ...result.summary
      },
      "Sample lead data seeded"
    );
  } finally {
    await disconnectDatabase();
  }
};

seedSampleData().catch((error: unknown) => {
  logger.fatal({ error }, "Sample data seed failed");
  process.exit(1);
});
