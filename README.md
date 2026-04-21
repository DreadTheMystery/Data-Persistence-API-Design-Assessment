# Backend Wizards — Stage 2 (Intelligence Query Engine)

## Overview

This API stores demographic profiles and supports:

- Advanced filtering
- Sorting
- Pagination
- Rule-based natural language search
- Idempotent data seeding from `src/seed_profiles.json` (2026 records)

## Stack

- Node.js + Express
- Supabase (PostgreSQL)
- `@supabase/supabase-js`

## Environment

Create `.env` from `.env.example`:

- `SUPABASE_URL`
- `SUPABASE_KEY`

## Run

- Start app: `npm start`
- Seed data: `npm run seed`

## Required table structure

`profiles` table should contain:

- `id` (UUID v7, PK)
- `name` (VARCHAR, UNIQUE)
- `gender` (VARCHAR)
- `gender_probability` (FLOAT)
- `age` (INT)
- `age_group` (VARCHAR)
- `country_id` (VARCHAR(2))
- `country_name` (VARCHAR)
- `country_probability` (FLOAT)
- `created_at` (TIMESTAMP)

Schema helper SQL is provided in `scripts/createProfilesTable.sql`.

## Endpoints

### `POST /api/profiles`

Creates a profile by calling the upstream demographic APIs and storing the result in Supabase.

### `GET /api/profiles/:id`

Fetches a single stored profile by UUID.

### `GET /api/profiles`

Supports combined filters:

- `gender`
- `age_group`
- `country_id`
- `min_age`
- `max_age`
- `min_gender_probability`
- `min_country_probability`

Sorting:

- `sort_by`: `age | created_at | gender_probability`
- `order`: `asc | desc`

Pagination:

- `page` (default `1`)
- `limit` (default `10`, max `50`)

Response:

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": []
}
```

### `GET /api/profiles/search`

Query param:

- `q` (plain English)

Supports pagination (`page`, `limit`) like `/api/profiles`.

### `DELETE /api/profiles/:id`

Deletes a stored profile by UUID and returns `404` when the profile does not exist.

## Natural language parsing approach (rule-based)

Parser is fully rule-based (no AI/LLM) in `src/services/queryParser.js`.

### Supported keywords and mappings

#### Gender

- `male`, `males`, `man`, `men`, `boy`, `boys` → `gender=male`
- `female`, `females`, `woman`, `women`, `girl`, `girls` → `gender=female`
- If both male and female are present, gender filter is omitted.

#### Age groups

- `child`, `children` → `age_group=child`
- `teen`, `teens`, `teenager`, `teenagers` → `age_group=teenager`
- `adult`, `adults` → `age_group=adult`
- `senior`, `seniors`, `elderly`, `old` → `age_group=senior`

#### Young keyword

- `young` → `min_age=16`, `max_age=24`

#### Age comparators

- `above N`, `over N`, `older than N`, `greater than N`, `at least N` → `min_age=N`
- `below N`, `under N`, `younger than N`, `less than N`, `at most N` → `max_age=N`
- `between A and B` → `min_age=min(A,B)`, `max_age=max(A,B)`

#### Country

Country names are matched against names found in `src/seed_profiles.json`, then mapped automatically to ISO code.

- Example: `from nigeria` → `country_id=NG`

### Parser logic flow

1. Normalize query text with lowercase, accent-insensitive cleanup, and punctuation stripping.
2. Extract gender intent with regex word boundaries.
3. Extract age-group intent.
4. Apply `young` rule.
5. Extract numeric age constraints.
6. Match country name from the seeded dataset and map to `country_id`.
7. If no interpretable token is found, return:

```json
{ "status": "error", "message": "Unable to interpret query" }
```

## Limitations

- Does not support spelling mistakes/fuzzy matching (e.g., `nigeri` instead of `nigeria`).
- Does not support highly complex sentence structures with multiple independent clauses.
- Country matching only works for country names present in the seed dataset map.
- Does not support OR logic groups beyond the explicit male+female handling.
- Ambiguous country terms are matched by the first strongest tokenized name match.

## Validation and errors

Error shape:

```json
{ "status": "error", "message": "<error message>" }
```

Used responses:

- `400` Missing/empty parameter
- `422` Invalid query parameters
- `404` Profile not found
- `500` Upstream or server failure
- `502` External upstream failure (profile creation flow)

## Notes

- CORS is enabled with `Access-Control-Allow-Origin: *`.
- Timestamps are stored as UTC ISO 8601 strings.
- Seeding is idempotent using upsert on unique `name`.
- Country lookup is derived from the seeded JSON dataset, not a hardcoded country list.
