# Amber Flux Backend Assignment

This is my backend assignment for Amber Flux. I built a REST API using Node.js and TypeScript that manages quote requests and connects to a FastAPI service for analysis.

## What I used

- Node.js with TypeScript
- Express.js for the server
- Prisma ORM to talk to the database
- SQLite as the database

## How to run this locally

First clone the repo and go into the folder:

```bash
git clone <your-repo-url>
cd amber_flux_assignment
```

Install the packages:

```bash
npm install
```

Set up the database:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npx ts-node src/server.ts
```

It will run on http://localhost:3000

## APIs I built

| Method | URL | What it does |
|--------|-----|--------------|
| GET | /quotes | Returns all quotes |
| GET | /quotes/:id | Returns one quote along with its analysis |
| POST | /quotes | Creates a new quote |
| POST | /quotes/:id/analyze | Calls FastAPI, saves and returns the analysis |
| PATCH | /quotes/:id/status | Updates the status of a quote |

## Request examples

**Creating a quote:**
```json
{
  "customer": "Sarthak",
  "project": "Bridge Construction",
  "estimated_value": 50000
}
```

**Updating status:**
```json
{
  "status": "In Review"
}
```

Status can only be one of these: `New`, `In Review`, `Needs Info`, `Completed`

## Validation I added

- customer and project fields cannot be empty
- estimated_value has to be a number and cannot be negative
- status update only accepts the four values above

## Error responses

- 400 if the request data is wrong or missing
- 404 if the quote doesnt exist
- 502 if the FastAPI service is down
- 500 for anything unexpected on the server side

## Notes

The FastAPI service is mocked in this project since the focus was on the Node.js backend. The mock returns a fixed risk, confidence and missing items response. To connect a real FastAPI service, just update the `callFastAPI` function in `quoteRoutes.ts` with an actual axios call.