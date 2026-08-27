# Snapspend

A photo-first expense tracker. Snap a photo of a receipt, and Claude Vision reads it and fills in the store, amount, and category for you.

**Live demo:** [snapspend-tau.vercel.app](https://snapspend-tau.vercel.app)

## Features

- 📸 Scan a receipt photo to auto-fill expense details using the Claude Vision API
- ✍️ Manual entry option for expenses without a receipt
- 📅 Calendar view of expenses by day, with photo thumbnails
- 🗂️ Custom spending categories/buckets with budgets
- 🔒 JWT-based authentication

## Tech Stack

- **Frontend:** React, deployed on Vercel
- **Backend:** Node.js / Express, deployed on AWS EC2 (Nginx, PM2)
- **Database:** PostgreSQL (Docker)
- **Storage:** AWS S3 (private bucket, EC2 IAM role, presigned URLs for image access)
- **AI:** Claude Vision API (Anthropic) for receipt parsing

## How it works

1. User uploads a receipt photo
2. The image is sent to the Claude Vision API, which extracts the store name, amount, category, and date
3. The extracted data pre-fills the expense form for the user to review and save
4. The receipt photo is uploaded to a private S3 bucket; only the S3 object key is stored in the database
5. When displaying expenses, the backend generates short-lived presigned URLs so the frontend can securely display each photo
