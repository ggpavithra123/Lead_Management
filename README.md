# Lead Management System

A full-stack lead management app with:

- React + TypeScript frontend
- Node.js + Express backend
- MongoDB storage
- GST checklist tracking
- Reports export to Excel
- Report email sending with SMTP

## Project Structure

- `frontend/` - React app (primary UI)
- `backend/` - Express API + MongoDB models
- `src/` - additional mirrored frontend source

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/leadmgmt`)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` inside `backend/`:

```dotenv
MONGO_URL=mongodb://127.0.0.1:27017/leadmgmt

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=LeadMgmt <your-email@gmail.com>
```

Then start backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite default URL (typically `http://localhost:5173`).

## Features

- Lead create, update, delete
- Follow-up and document status tracking
- GST checklist with submit/save tracking
- Reports dashboard
- Export reports to `.xlsx`
- Send report as email attachment

## Reports: Export and Email

In Reports page:

1. Click **Export Excel** to download current leads report.
2. Enter recipient email and click **Send Email**.

Backend endpoints used:

- `GET /api/reports/export`
- `POST /api/reports/export-email`

## Troubleshooting

### Export returns 404

- Ensure backend was restarted after code changes.
- Ensure backend is running on port `4000`.

### "Email is not configured"

- Ensure `backend/.env` exists (not only `.env.example`).
- Restart backend after editing `.env`.

### Gmail auth errors

- Use a Google App Password (not normal Gmail password).
- Confirm `SMTP_USER` and `MAIL_FROM` are valid.

## Notes

- Keep secrets only in `backend/.env`.
- Do not commit real credentials.
