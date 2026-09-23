# Snapspend

Live: [snapspend-tau.vercel.app](https://snapspend-tau.vercel.app)

I got tired of typing every expense into an app by hand, so I built this. Take a photo of a receipt, Claude reads the amount and store for you, done. If there's no receipt (or Claude reads it wrong), you can just type it in manually too.

## What it does

- Snap a receipt and Claude Vision pulls out the amount, store, and date automatically
- Buckets you make yourself, not some fixed dropdown list. Rent, Coffee, whatever you actually spend money on. Each one can have its own monthly budget
- Three ways to look at your spending: a calendar grid, a photo grid, and a scrollable feed
- An overview tab with a gauge showing how much of your budget you've burned through
- Search by store, note, or bucket name
- Basic auth with JWT, login is rate limited so nobody can brute force their way into your account

## Stack

React + Vite on the frontend (CSS Modules, no component library), Express + Postgres on the backend. Photos go to S3, receipt reading goes through the Claude API. Frontend lives on Vercel, backend runs on an EC2 box with PM2 keeping it alive.

## How receipt scanning actually works

1. You snap a photo, it hits `/expenses/scan` — Claude Vision reads it and hands back amount, store, and date, nothing gets saved yet
2. You get a screen to check what Claude read and fix anything it got wrong
3. Hit confirm, and `/expenses/confirm-scan` is what actually writes it to the database

Splitting it into scan-then-confirm instead of one endpoint was on purpose — receipts are messy and Claude misreads amounts sometimes, so a bad photo shouldn't be able to silently create a wrong expense.

## Folder layout

```
frontend/src/
├── components/    one .jsx + .module.css per component
├── styles/        shared CSS (calendar grid, bottom-sheet)
├── api.js         axios instance
├── constants.js   bucket icons, month/day labels
└── utils.js       date/currency formatting

backend/src/
├── routes/            auth.js, expenses.js, categories.js
├── middleware/        auth.js, rateLimiter.js, errorHandler.js
├── db.js              Postgres pool + table setup
├── s3.js              upload/delete/sign receipt photos
└── claudeService.js   sends the receipt photo to Claude Vision
```

## Running it locally

You'll need Node 18+, a Postgres instance (or just use the `docker-compose.yml` in `backend/`), an S3 bucket, and an Anthropic API key.

**Backend:**

```bash
cd backend
npm install
```

Make a `.env`:

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=snapspend
JWT_SECRET=make up something long and random here
ANTHROPIC_API_KEY=your key
AWS_REGION=us-east-2
S3_BUCKET_NAME=your bucket
```

```bash
npm run dev
```

Tables get created automatically the first time it runs.

**Frontend:**

```bash
cd frontend
npm install
```

`.env`:

```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

## API

Everything except register/login needs an `Authorization: Bearer <token>` header.

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/register` | make an account |
| POST | `/auth/login` | log in (5 attempts / 5 min per IP, then you're locked out for a bit) |
| GET | `/auth/me` | who am I |
| GET | `/expenses` | your expenses |
| POST | `/expenses/scan` | read a receipt with Claude, doesn't save anything yet |
| POST | `/expenses/confirm-scan` | actually save it after you've reviewed what Claude read |
| POST | `/expenses/manual` | save one you typed by hand |
| PATCH | `/expenses/:id` | edit |
| DELETE | `/expenses/:id` | delete |
| GET | `/categories` | your buckets |
| POST | `/categories` | new bucket |
| PATCH | `/categories/:id` | edit a bucket |
| DELETE | `/categories/:id` | delete a bucket (blocked with a 409 if it still has expenses in it) |
| POST | `/categories/:id/reassign-and-delete` | move that bucket's expenses somewhere else first, then delete it |

## Deploying

Push to `main` and Vercel picks up the frontend automatically. The backend doesn't auto-deploy though, you have to SSH into EC2, `git pull`, reinstall if `package.json` changed, and restart with PM2. Annoying but that's how it is for now.

## Why it's built this way

A bucket's `id` is a foreign key on every expense that belongs to it, so deleting a bucket that's still in use fails with a 409 instead of quietly orphaning expenses. `reassign-and-delete` exists because "I want to rename Coffee into Food" is a real thing that happens, and losing expense history over a rename would suck. Login is rate limited because auth here is just JWT plus a password — nothing else is stopping someone from hammering the login endpoint otherwise.
