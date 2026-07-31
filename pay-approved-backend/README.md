# Pay Approved Backend

Backend for the Pay Approved application — a payment management system with client registration, contract signing, document upload, and automated payment alerts.

## Architecture

- **Node.js + Express** — REST API server
- **Supabase** — PostgreSQL database, Auth, Storage, and real-time
- **TypeScript** — Type-safe backend code
- **node-cron / setInterval** — Scheduled payment alert notifications

## Project Structure

```
pay-approved-backend/
├── migrations/
│   └── 001_schema.sql          # Database schema (tables, RLS policies, indexes)
├── src/
│   ├── config/
│   │   └── env.ts              # Environment variable configuration
│   ├── db/
│   │   └── supabase.ts         # Supabase client instances
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication & admin authorization
│   │   └── upload.ts           # Multer file upload configuration
│   ├── routes/
│   │   ├── auth.ts             # Auth routes (register, login, admin login)
│   │   ├── customers.ts        # Customer CRUD + location update
│   │   ├── contracts.ts        # Contract CRUD + signing + installments
│   │   ├── documents.ts        # Document upload + status management
│   │   ├── admin.ts            # Admin dashboard & management endpoints
│   │   └── paymentAlerts.ts    # Payment alert retrieval + manual send
│   ├── scheduler/
│   │   └── alertScheduler.ts   # Cron job for daily payment alert dispatch
│   ├── services/
│   │   ├── customerService.ts  # Customer business logic
│   │   ├── contractService.ts  # Contract & installment business logic
│   │   ├── documentService.ts  # Document upload & Supabase Storage
│   │   ├── notificationService.ts # Push notifications & alert scheduling
│   │   └── adminService.ts     # Admin dashboard & stats
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces for all entities
│   │   └── express.d.ts        # Express Request type augmentation
│   └── index.ts                # Server entry point
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Auth

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| POST   | `/api/auth/register`    | Register a new customer |
| POST   | `/api/auth/login`       | Customer login          |
| POST   | `/api/auth/admin/login` | Admin login             |

### Customers

| Method | Endpoint                     | Auth     | Description                  |
| ------ | ---------------------------- | -------- | ---------------------------- |
| GET    | `/api/customers/me`          | Customer | Get current customer profile |
| PUT    | `/api/customers/me/location` | Customer | Update location (lat/lng)    |
| GET    | `/api/customers/:id`         | Customer | Get customer by ID           |
| GET    | `/api/customers`             | Admin    | List all customers           |

### Contracts

| Method | Endpoint                          | Auth           | Description               |
| ------ | --------------------------------- | -------------- | ------------------------- |
| GET    | `/api/contracts`                  | Customer       | Get customer's contracts  |
| POST   | `/api/contracts`                  | Customer       | Create a new contract     |
| GET    | `/api/contracts/:id`              | Customer/Admin | Get contract details      |
| POST   | `/api/contracts/:id/sign`         | Customer/Admin | Sign a contract           |
| GET    | `/api/contracts/:id/installments` | Customer/Admin | Get contract installments |

### Documents

| Method | Endpoint                    | Auth           | Description                             |
| ------ | --------------------------- | -------------- | --------------------------------------- |
| POST   | `/api/documents`            | Customer       | Upload a document (multipart/form-data) |
| GET    | `/api/documents`            | Customer/Admin | List documents                          |
| GET    | `/api/documents/:id`        | Customer/Admin | Get document details                    |
| PUT    | `/api/documents/:id/status` | Admin          | Approve/reject a document               |

### Payment Alerts

| Method | Endpoint                   | Auth     | Description                   |
| ------ | -------------------------- | -------- | ----------------------------- |
| GET    | `/api/payment-alerts`      | Customer | Get customer's payment alerts |
| POST   | `/api/payment-alerts/send` | Customer | Manually send a payment alert |

### Admin

| Method | Endpoint                                | Auth  | Description               |
| ------ | --------------------------------------- | ----- | ------------------------- |
| GET    | `/api/admin/dashboard`                  | Admin | Dashboard statistics      |
| GET    | `/api/admin/customers`                  | Admin | List all customers        |
| GET    | `/api/admin/contracts`                  | Admin | List all contracts        |
| GET    | `/api/admin/contracts/:id/installments` | Admin | Get contract installments |
| GET    | `/api/admin/documents/pending`          | Admin | List pending documents    |
| PUT    | `/api/admin/documents/:id/status`       | Admin | Update document status    |

## Database Schema

### Tables

- **customers** — Client registration data, location (lat/lng)
- **contracts** — Contract details with installment count, due day, status
- **installments** — Individual installment records with due dates and payment status
- **documents** — Uploaded documents linked to contracts with approval status
- **payment_alerts** — Payment alert records sent to customers
- **users** — Admin user accounts for the control panel

### Key Features

- Row Level Security (RLS) enabled on all tables
- Customers can only read their own data
- Admins have full access to all data
- Automatic installment generation when creating a contract

## Scheduler

The `alertScheduler` runs `schedulePaymentAlerts()` on startup and then every hour. It:

1. Finds all active contracts with due dates within the next 24 hours
2. Generates payment alert messages for each upcoming installment
3. Records alerts in the `payment_alerts` table
4. Sends push notifications via Expo Push Notification API (if configured)

## Setup

1. Copy `.env.example` to `.env` and fill in your values
2. Run the SQL migration in `migrations/001_schema.sql` against your Supabase database
3. Install dependencies: `npm install`
4. Run in development: `npm run dev`
5. Build for production: `npm run build` && `npm start`

## Environment Variables

| Variable                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `SUPABASE_URL`                   | Supabase project URL                 |
| `SUPABASE_ANON_KEY`              | Supabase anonymous key               |
| `SUPABASE_SERVICE_ROLE_KEY`      | Supabase service role key            |
| `SUPABASE_DB_URL`                | Direct PostgreSQL connection URL     |
| `JWT_SECRET`                     | Secret for JWT token signing         |
| `PORT`                           | Server port (default: 3000)          |
| `EXPO_PUSH_NOTIFICATION_API_KEY` | Expo push notification API key       |
| `NODE_ENV`                       | Environment (development/production) |
