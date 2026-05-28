# Tradeoffs

## Service-Level Analytics

Analytics are calculated in TypeScript over normalized profile records. This favors readability and deterministic unit tests for the project-sized dataset. At larger scale, these calculations should move behind repository methods backed by Mongo aggregation pipelines.

## Deterministic Seed Reset

`npm run seed` clears `LeadProfile` records before importing sample data. This is useful for local review and CI-like manual checks because repeated runs produce the same state. A production import tool would usually be append-only or idempotency-key based instead.

## Phone as Unique Identity

Phone is treated as the primary unique customer identifier because the project explicitly calls it out. Real CRM systems often need richer identity resolution across phone, email, source system IDs, and manual merge workflows.

## Minimal Infrastructure

The project avoids queues, authentication, background jobs, caching, and microservices. Those can be valuable in production, but they are outside the project scope and would distract from the backend architecture being evaluated.

## Mongo Schema Shape

Inquiry history is embedded inside `LeadProfile`. This keeps customer retrieval simple and matches the project’s normalized profile requirement. If inquiry history becomes very large, moving inquiries into a separate collection with profile-level rollups would be a natural next step.
