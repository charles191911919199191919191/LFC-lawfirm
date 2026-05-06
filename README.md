# Legal Scheduling System

A full-stack legal appointment management and analytics platform built with React, Vite, Tailwind CSS, Node.js, Express, and Prisma MySQL.

## Project Structure

- `client/` — React frontend app
  - `src/` — React application code
  - `pages/` — Pages for login, dashboard, appointments, analytics
  - `components/` — Shared UI components (sidebar, navbar, protected route)
  - `api/` — Axios client configuration
  - `stores/` — Zustand auth state management
  - `styles/` — Tailwind globals
- `server/` — Express backend
  - `config/` — Prisma client config
  - `controllers/` — Route business logic
  - `middleware/` — JWT authentication
  - `routes/` — REST API route definitions
- `prisma/` — Prisma schema and seed script
- `package.json` — Root project dependencies and scripts
- `vite.config.js` — Vite configuration to host the frontend from `client/`

## Features

- JWT-based authentication
- Admin / Staff / Lawyer role management
- Appointment CRUD with conflict detection
- Predictive workload balancing and urgent case prioritization
- Dashboard charts and analytics
- Terminal-ready single command dev experience
- Responsive SaaS-style UI with Tailwind CSS

## Setup Guide

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` values if required:

- `DATABASE_URL` points to your MySQL database
- `JWT_SECRET` should be a secure random string
- `PORT` is the backend port (default `4000`)

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Push the Prisma schema to MySQL:

```bash
npx prisma db push
```

6. Seed sample data:

```bash
npm run seed
```

7. Start the application:

```bash
npm run dev
```

8. Open the frontend in your browser:

```text
http://localhost:5173
```

## Sample Users

- Admin: `admin@lawfirm.local` / `password123`
- Staff: `staff@lawfirm.local` / `password123`
- Lawyer: `lawyer1@lawfirm.local` / `password123`
- Lawyer: `lawyer2@lawfirm.local` / `password123`

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/analytics/dashboard`
- `GET /api/lawyers`

## Predictive Logic

- Conflict detection checks overlapping appointments for the selected lawyer and date
- Workload balancing flags overloaded lawyer schedules when daily appointments exceed `5`
- The backend returns suggestions for least busy lawyers and alternative time slots when conflicts are detected

## Development Scripts

- `npm run dev` — start frontend and backend together
- `npm run dev:client` — run Vite frontend
- `npm run dev:server` — run Express backend with nodemon
- `npm run build` — build the frontend for production
- `npm run seed` — seed sample database data

## Notes

This project is intentionally configured as a fully independent modern web application. It no longer depends on XAMPP or manual PHP configuration.
