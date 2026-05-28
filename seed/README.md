# Seed Data

Run the project sample import with:

```bash
npm run seed
```

The seed script reads `docs/data/sample_lead_data.json`, validates it with the same Zod schema used by `POST /analyze`, clears existing `LeadProfile` documents, and ingests through the real service layer. Clearing first keeps local reviewer runs deterministic and avoids appending the same sample inquiries repeatedly.
