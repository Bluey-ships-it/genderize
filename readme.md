# Gender Classifier API

A REST API that classifies names by gender using the Genderize.io API.

## Tech Stack
- Node.js
- Express.js
- Axios


## Endpoint

### GET /api/classify

Classifies a name by gender.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | The name to classify |

**Success Response (200)**
```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-11T12:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|---|---|
| 400 | Missing or empty name parameter |
| 422 | Name is not a string, or no prediction available |
| 502 | Genderize API unreachable |

## Running Locally

```bash
npm install
npm run dev
```

Server starts on `http://localhost:3000`