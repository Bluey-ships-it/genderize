```markdown
# Demographic Intelligence API

A REST API for querying demographic profile data. Built with Node.js, Express, and PostgreSQL.



```
## Base URL

```
https://genderize-production-03a0.up.railway.app
```
## Endpoints

### GET /api/profiles

Returns profiles with optional filtering, sorting, and pagination.

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| gender | string | `male` or `female` |
| age_group | string | `child`, `teenager`, `adult`, `senior` |
| country_id | string | ISO 2-letter code e.g. `NG`, `KE` |
| min_age | number | Minimum age (inclusive) |
| max_age | number | Maximum age (inclusive) |
| min_gender_probability | number | Minimum gender confidence score |
| min_country_probability | number | Minimum country confidence score |
| sort_by | string | `age`, `created_at`, or `gender_probability` |
| order | string | `asc` or `desc` (default: `desc`) |
| page | number | Page number (default: `1`) |
| limit | number | Results per page (default: `10`, max: `50`) |

All filters are combinable. Results match every condition passed.

**Example**

```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

**Response**

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 84,
  "data": [...]
}
```

---

### GET /api/profiles/search?q=

Accepts a plain English query and converts it to filters.

**Example queries**

```
GET /api/profiles/search?q=young males from nigeria
GET /api/profiles/search?q=females above 30
GET /api/profiles/search?q=adult males from kenya
GET /api/profiles/search?q=male and female teenagers above 17
GET /api/profiles/search?q=senior women from ethiopia
```

Pagination params (`page`, `limit`) also apply to this endpoint.

**Unrecognised queries return:**

```json
{ "status": "error", "message": "Unable to interpret query" }
```

---

### GET /api/profiles/:id

Returns a single profile by UUID.

**Response**

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "age": 34,
    "age_group": "adult",
    "country_id": "NG",
    "country_name": "Nigeria",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

---

### POST /api/profiles

Creates a profile by name. Calls Genderize, Agify, and Nationalize APIs to enrich the data automatically.

**Body**

```json
{ "name": "string" }
```

---

### DELETE /api/profiles/:id

Deletes a profile by UUID. Returns `204 No Content` on success.

---

## Error Responses

All errors follow this structure:

```json
{ "status": "error", "message": "<error message>" }
```

| Status Code | Meaning |
|---|---|
| 400 | Missing or empty parameter |
| 422 | Invalid parameter type or unprocessable query |
| 404 | Profile not found |
| 500 / 502 | Server or upstream API failure |

---

## Natural Language Parsing

### How it works

The parser lowercases the query string and scans it for known keywords using regex and string matching. No AI or external libraries are used. It extracts up to four things: gender, age range, age group, and country. These are then passed directly into the same filtering logic used by `GET /api/profiles`.

### Supported keywords

**Gender**
- `male`, `males` → `gender=male`
- `female`, `females` → `gender=female`
- If both appear in the same query (e.g. "male and female"), the gender filter is not applied

**Age — numeric phrases**
- `above N`, `over N`, `older than N` → `min_age=N`
- `below N`, `under N`, `younger than N` → `max_age=N`
- `between N and M` → `min_age=N`, `max_age=M`

**Age — keyword mappings**
- `young` → `min_age=16`, `max_age=24` (per spec; only applied when no numeric age phrase is present)
- `child`, `children`, `kids` → `age_group=child`
- `teenager`, `teenagers`, `teen`, `teens` → `age_group=teenager`
- `adult`, `adults` → `age_group=adult`
- `senior`, `seniors`, `elderly`, `old people` → `age_group=senior`

Age group keywords and numeric age constraints can be combined. For example, "teenagers above 17" sets both `age_group=teenager` and `min_age=17`.

**Country**

Country names and common adjective forms are matched and mapped to ISO codes. Multi-word country names (e.g. "south africa", "south sudan", "burkina faso") are checked before single-word names to avoid partial matches.

| Query term | ISO code |
|---|---|
| `nigeria`, `nigerian` | `NG` |
| `kenya`, `kenyan` | `KE` |
| `ethiopia`, `ethiopian` | `ET` |
| `south africa`, `south african` | `ZA` |
| `ghana`, `ghanaian` | `GH` |
| `tanzania`, `tanzanian` | `TZ` |
| `uganda`, `ugandan` | `UG` |
| `ivory coast`, `cote d'ivoire` | `CI` |
| `dr congo`, `drc` | `CD` |
| `egypt`, `egyptian` | `EG` |

Full list of ~50 supported countries is defined in `controllers/profiles/nlpParser.js`.

### Logic flow

1. Lowercase and trim the query string
2. Check for gender keywords
3. Check for numeric age phrases (`above`, `under`, `between`)
4. If no numeric age found, check for the `young` keyword
5. Check for age group keywords
6. Scan for country names, longest match first to avoid partial collisions
7. If no filters were extracted at all, return `{ "status": "error", "message": "Unable to interpret query" }`

---

## Limitations and edge cases not handled

- **Ambiguous gender words** — "man", "men", "woman", "women" are not mapped. Only "male/males" and "female/females" are recognised.
- **Young + age group conflict** — "young adult" may apply both the `young` age range (16–24) and `age_group=adult` simultaneously, which can produce unexpected results.
- **Multiple countries** — only the first matched country is used. "people from nigeria or kenya" filters by Nigeria only.
- **Negation** — "not from nigeria" or "males excluding seniors" is not understood. Negation words are ignored entirely.
- **Typos and slang** — non-standard spellings like "Naija" (Nigeria) are not handled. The query must use recognisable country names.
- **ISO codes as input** — writing `NG` directly in a natural language query is not supported. Use the full country name.
- **Probability filters** — `min_gender_probability` and `min_country_probability` have no natural language syntax. They are only available on the structured `GET /api/profiles` endpoint.
- **Languages other than English** — the parser only understands English keywords.

---

## Setup and Running Locally

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.example .env
# Set DATABASE_URL in .env

# Seed the database
node seed.js

# Start the server
npm start
```

---

## Tech Stack

- Node.js + Express
- PostgreSQL (via `pg`)
- UUID v7 for primary keys
- Hosted on Railway
