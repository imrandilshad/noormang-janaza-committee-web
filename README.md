# Janaza Committee Management & Transparency Portal

## Overview

A web-based platform to digitize and streamline the operations of a village funeral (Janaza) committee. Built with React 19, TypeScript, Vite, Tailwind CSS, ShadCN UI, and Supabase.

The portal maintains records of:
- Funeral cases
- Members and families
- Expenses (transportation, food, shroud, etc.)
- Collections & payments
- Announcements
- Reports with charts
- Documents

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v3, ShadCN UI |
| State | Zustand |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| i18n | i18next (English + Urdu / RTL) |
| Theme | Dark / Light / System |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Hosting | Vercel (free) + Supabase (free tier) |

---

## Quick Start

```bash
git clone <repo-url>
cd noormang-janaza-committee-web
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,ur
```

---

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Run `supabase/migrations/002_seed_data.sql` for sample data
4. Create a user via Authentication > Users (email/password)
5. Copy Project URL and anon key to `.env`

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full CRUD on all records |
| **Committee Member** | Read-only access |
| **Public Visitor** | View public announcements |

---

## Features

- **Dashboard** – KPI cards (members, cases, expenses, collections)
- **Families** – CRUD family records
- **Members** – CRUD with status tracking (active/inactive/deceased)
- **Funeral Cases** – Register & manage cases
- **Expenses** – Track by category with totals
- **Collections** – Per-member contribution tracking
- **Payments** – Cash / Easypaisa / JazzCash / Bank Transfer
- **Announcements** – Death notices, meeting notices, general
- **Reports** – Financial charts (Pie + Bar), date range filters
- **Documents** – Download death certificates & receipts
- **Dark / Light / System theme**
- **English / Urdu language switching (RTL support)**
- **Mobile-first responsive design**

---

## Project Structure

```
src/
├── assets/locales/en|ur/     # i18n translations
├── components/
│   ├── ui/                   # ShadCN components
│   ├── layout/               # Sidebar, Header
│   └── shared/               # ThemeToggle, LanguageToggle
├── features/
│   ├── auth/                 # Login page, AuthGuard
│   ├── dashboard/
│   ├── members/
│   ├── families/
│   ├── funeral-cases/
│   ├── expenses/
│   ├── collections/
│   ├── payments/
│   ├── announcements/
│   ├── reports/
│   └── documents/
├── layouts/                  # AppLayout
├── lib/                      # utils, i18n, supabase
├── routes/                   # React Router config
├── store/                    # Zustand store
└── types/                    # TypeScript DB types
supabase/migrations/          # SQL schema + seed data
```

---

## License

Private project — Janaza Committee, Noor Mang Village.
