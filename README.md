# Data Persistence & API Design Assessment

Backend implementation for HNG Stage 1 – Data Persistence & API Design.

This service accepts a name, calls three public APIs (Genderize, Agify, Nationalize), applies business rules, stores the result in a SQLite database, and exposes REST endpoints to manage profiles.

## Tech Stack

- Node.js
- Express
- better-sqlite3 (SQLite)
- Axios

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### Install

```bash
git clone https://github.com/DreadTheMystery/Data-Persistence-API-Design-Assessment.git
cd Data-Persistence-API-Design-Assessment
npm install
```

### Run

```bash
npm start
```

Server starts on:

- `http://localhost:3000`

Root health check:

```bash
curl http://localhost:3000/
```

Expected:

```json
{
  "status": "success",
  "message": "Profiles API is running"
}
```

## Data Model

Each profile has:

- `id` (UUID v7)
- `name` (string)
- `gender` (string)
- `gender_probability` (number)
- `sample_size` (integer)
- `age` (integer)
- `age_group` ("child" | "teenager" | "adult" | "senior")
- `country_id` (string – ISO country code)
- `country_probability` (number)
- `created_at` (UTC ISO 8601)

Age groups:

- 0–12 → `child`
- 13–19 → `teenager`
- 20–59 → `adult`
- 60+ → `senior`

## External APIs

The service calls three public APIs:

- Genderize: `https://api.genderize.io?name={name}`
- Agify: `https://api.agify.io?name={name}`
- Nationalize: `https://api.nationalize.io?name={name}`

## API Endpoints

Base URL:

- `http://localhost:3000`

All responses include CORS header:

- `Access-Control-Allow-Origin: *`

### 1. Create Profile – `POST /api/profiles`

Request body:

```json
{ "name": "ella" }
```

Success (201 Created):

```json
{
  "status": "success",
  "data": {
    "id": "<uuid-v7>",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.09,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

If the same name already exists (idempotent behavior):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "<existing-id>",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.09,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

Example with curl:

```bash
curl -X POST http://localhost:3000/api/profiles \
	-H "Content-Type: application/json" \
	-d '{ "name": "ella" }'
```

### 2. Get Single Profile – `GET /api/profiles/{id}`

Example:

```bash
curl http://localhost:3000/api/profiles/<id>
```

Response (200):

```json
{
  "status": "success",
  "data": {
    "id": "<id>",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.09,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

### 3. Get All Profiles – `GET /api/profiles`

Optional query parameters (case-insensitive):

- `gender`
- `country_id`
- `age_group`

Example:

```bash
curl "http://localhost:3000/api/profiles?gender=male&country_id=NG&age_group=adult"
```

Success (200):

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

### 4. Delete Profile – `DELETE /api/profiles/{id}`

Example:

```bash
curl -X DELETE http://localhost:3000/api/profiles/<id> -i
```

Success:

- `204 No Content`

If not found:

```json
{
  "status": "error",
  "message": "Profile not found"
}
```

## Error Responses

All errors follow:

```json
{
  "status": "error",
  "message": "<error message>"
}
```

Examples:

- `400 Bad Request` – missing or empty name
  - `"Missing or empty name"`
- `422 Unprocessable Entity` – invalid type
  - `"Invalid type for name"`
- `404 Not Found` – profile not found
  - `"Profile not found"`
- `502 Bad Gateway` – external API invalid response
  - `"Genderize returned an invalid response"`
  - `"Agify returned an invalid response"`
  - `"Nationalize returned an invalid response"`
- `502 Bad Gateway` – upstream/network failure
  - `"Upstream service failure"`

## Notes

- All IDs are UUID v7.
- All timestamps are UTC ISO 8601.
- CORS is enabled with `Access-Control-Allow-Origin: *`.
