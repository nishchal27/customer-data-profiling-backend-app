# Real Estate Lead Profiling Backend

This repository contains the backend foundation for a production-oriented customer lead profiling system. Phase 2 adds profile retrieval and analytics summaries on top of the ingestion pipeline.

## Tech Stack

- Node.js, Express.js, TypeScript
- MongoDB with Mongoose
- Zod runtime validation
- Pino structured logging
- Swagger/OpenAPI documentation
- Vitest, ESLint, Prettier
- Docker and GitHub Actions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Start MongoDB locally:

```bash
docker compose up -d mongo
```

4. Run the API in development mode:

```bash
npm run dev
```

The health endpoint is available at `GET /health`. Lead ingestion is available at `POST /analyze`, profile retrieval at `GET /lead/:phone`, and analytics at `GET /leadSummary`. Swagger UI is available at `/docs` when `SWAGGER_ENABLED=true`.

## Scripts

- `npm run dev` - start the API with TypeScript watch mode
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run the compiled server
- `npm run lint` - run ESLint
- `npm run format` - check Prettier formatting
- `npm run format:write` - apply Prettier formatting
- `npm run typecheck` - run TypeScript without emitting files
- `npm test` - run Vitest tests

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

| Variable          | Default                                             | Purpose                                                     |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `NODE_ENV`        | `development`                                       | Runtime environment: `development`, `test`, or `production` |
| `PORT`            | `3000`                                              | HTTP server port                                            |
| `MONGO_URI`       | `mongodb://localhost:27017/customer-data-profiling` | MongoDB connection string                                   |
| `LOG_LEVEL`       | environment-aware                                   | Pino log level                                              |
| `API_PREFIX`      | `/api/v1`                                           | Reserved versioned API prefix for future feature routes     |
| `SWAGGER_ENABLED` | `true`                                              | Enables Swagger UI at `/docs`                               |

## Architecture

The project uses a layered modular backend structure:

```text
Route -> Controller -> Service -> Repository -> Database
```

Controllers should handle HTTP request and response concerns only. Services own business rules. Repositories isolate database access. Validators use Zod to treat all external payloads as untrusted runtime data.

Shared infrastructure lives under `src/shared`:

- `config` - environment parsing and MongoDB connection setup
- `logger` - Pino logger configuration
- `middleware` - request logging, validation, async handling, errors, and 404 handling
- `errors` - operational error primitives
- `utils` - response and validation helpers
- `constants` - reusable constants such as HTTP status codes

The `src/modules/lead` folder contains the ingestion, retrieval, and analytics pipeline. Routes validate HTTP payloads, controllers handle responses, services normalize and merge customer data, analytics services calculate reporting views, and repositories isolate MongoDB access.

## Lead Ingestion

`POST /analyze` accepts either the assignment sample shape, a raw array of lead inquiries, or an object envelope with a `leads` array.

Phone number is the primary customer identity. During ingestion the service normalizes phone numbers, email casing, budget values, locations, and inquiry dates. Existing customers are updated by appending inquiry history to the same `LeadProfile` document instead of creating duplicate customer documents.

## Retrieval

`GET /lead/:phone` retrieves a normalized customer profile by phone number. Lookup values are normalized before querying, so formatted values such as `(123) 456-70001` can match the stored canonical phone `+12345670001`.

The response includes customer details, inquiry history, and a per-customer summary with total inquiries, latest inquiry date, lead type breakdown, normalized locations, and budget overview.

## Analytics

`GET /leadSummary` returns lightweight CRM-style analytics across all normalized lead profiles:

- total customers and total inquiries
- sale vs rental distribution
- average budget by lead type
- monthly inquiry frequency trends
- unique location count and most common locations

Analytics intentionally run in the service layer over normalized repository results. This keeps the assignment implementation readable and easy to test. For larger production datasets, the repository boundary allows the same calculations to move into MongoDB aggregation pipelines without changing controller contracts.

## Docker

Run the API and MongoDB together:

```bash
docker compose up --build
```

Run MongoDB only for local development:

```bash
docker compose up -d mongo
```

## CI/CD

GitHub Actions runs the same validation gates expected locally:

- lint
- format check
- typecheck
- tests
- build

## Sample Data

Assignment-provided sample data is stored at `docs/data/sample_lead_data.json`. The `seed/` directory is reserved for future seed scripts or transformed sample fixtures.
