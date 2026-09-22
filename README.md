# Snapspend

Photo-first expense tracker. Snap a receipt, Claude reads the amount, store, and date for you — no manual typing.

## Features

- **Snap a receipt** — Claude Vision reads the amount, store, and date automatically. Manual entry is also available.
- **Buckets** — custom spending categories you create yourself (not a fixed list), each with an optional monthly budget.
- **Three views** — Calendar (day-by-day grid), Grid (photo thumbnails, Locket-style), and Feed (scrollable photo cards).
- **Overview** — gauge chart of total spend vs. budget, plus a per-bucket breakdown with progress bars.
- **Search** — find past expenses by store, note, or bucket name.
- **Auth** — email/password login with JWT, rate-limited against brute-force attempts.
- **First-run onboarding** — a short 3-slide intro shown once on first login.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React + Vite, CSS Modules |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Photo storage | AWS S3 (signed URLs) |
| Receipt OCR | Claude Vision (Anthropic API) |
| Frontend hosting | Vercel |
| Backend hosting | AWS EC2 + PM2 |

## Project structure

```
frontend/src/
├── components/    one .jsx + .module.css per component
├── styles/        shared CSS modules (calendar grid, bottom-sheet)
├── api.js         axios instance
├── constants.js   bucket icons, months/days labels
└── utils.js       date/currency formatting

backend/src/
├── routes/        auth.js, expenses.js, categories.js
├── middleware/     auth.js, rateLimiter.js, errorHandler.js
├── db.js           Postgres pool + table setup
├── s3.js           upload/delete/sign receipt photos
└── claudeService.js  sends the receipt image to Claude Vision
```

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use `docker-compose.yml` in `backend/`)
- An AWS account with an S3 bucket (for receipt photos)
- An Anthropic API key (for receipt scanning)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=snapspend
JWT_SECRET=<a long random string>
ANTHROPIC_API_KEY=<your Anthropic API key>
AWS_REGION=us-east-2
S3_BUCKET_NAME=<your S3 bucket name>
```

```bash
npm run dev
```

Tables are created automatically on first run.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

## API overview

All routes except `/auth/register` and `/auth/login` require an `Authorization: Bearer <token>` header.

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in (rate-limited: 5 attempts / 5 min per IP) |
| GET | `/auth/me` | Current user info |
| GET | `/expenses` | List the logged-in user's expenses |
| POST | `/expenses/scan` | Read a receipt photo with Claude Vision (does not save it) |
| POST | `/expenses/confirm-scan` | Save an expense after reviewing the scanned data |
| POST | `/expenses/manual` | Save an expense entered by hand |
| PATCH | `/expenses/:id` | Edit an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| GET | `/categories` | List the user's buckets |
| POST | `/categories` | Create a bucket |
| PATCH | `/categories/:id` | Edit a bucket (name, icon, budget) |
| DELETE | `/categories/:id` | Delete a bucket (fails with 409 if it still has expenses) |
| POST | `/categories/:id/reassign-and-delete` | Move a bucket's expenses elsewhere, then delete it |

## Deployment

- **Frontend** — auto-deploys on every push to `main` (Vercel is connected to the repo).
- **Backend** — does not auto-deploy. After pushing, SSH into the EC2 instance, `git pull`, `npm install` if dependencies changed, then restart with PM2.

## Data model

- `users` — email, password hash, name
- `buckets` — id, name, icon, monthly budget, owned by a user
- `expenses` — amount, store name, date, photo URL, note, which bucket it belongs to, owned by a user

`expenses.category` is a foreign key to `buckets.id`, so deleting a bucket that still has expenses is blocked until they're reassigned.
