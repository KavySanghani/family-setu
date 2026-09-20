# FamilySetu

FamilySetu is a synthetic prototype for family profiles, welfare-scheme discovery, explainable deterministic eligibility results, external application tracking, and authorized beneficiary operations. It is not an official Government of Gujarat system, does not issue an official Family ID, and does not submit government applications.

## Product highlights

- Server-generated, non-sensitive Family IDs (not Aadhaar, phone, or DOB based)
- Family members, life events, scheme catalogue, and deterministic eligibility explanations
- Explicit “Apply on Official Portal” boundary and external application tracking
- Benefit history, notifications, officer dashboard, scoped family search, and Beneficiary 360°
- Supabase Auth/JWT, RBAC, family/department scope checks, audit/outbox patterns

Eligibility is calculated only by the deterministic backend rule engine. Any future AI capability may explain retrieved results but cannot decide eligibility, invent schemes, or assert government decisions.

## Architecture

React/Vite/TanStack Query frontend → Express/TypeScript modular-monolith API → Supabase Auth/PostgreSQL/Storage. The deployment foundation uses Docker, ECR, ECS/SQS, ALB, CloudFront/WAF, CloudWatch, Secrets Manager, and Terraform configuration.

## Local setup

```bash
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm --prefix backend run dev
npm --prefix frontend run dev
```

Required local variables: backend `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, optional `PORT`, `AI_PROVIDER`, `AI_API_KEY`, `SQS_QUEUE_URL`; frontend `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`. Never put service keys in the frontend.

## Database and synthetic demo data

Migrations in `supabase/migrations/` are authoritative. Apply them only to a dedicated development/staging project; do not reset a linked remote database. The forward-only `20231024000006_api_compatibility.sql` migration is required by the current API.

After migrations, load fictional presentation data using a development-only PostgreSQL connection string:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed-demo.sql
```

The seed is additive and uses only `DEMO-*` records. Do not run it against production data.

## Validation

```bash
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix backend test
```

Tests importing the Supabase client require configured backend variables. Docker and Terraform files prepare the next deployment phase but do not provision or deploy cloud resources.
