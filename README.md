# HiveForge Base SaaS Template

A minimal SaaS starter template with authentication, dashboard, and API.

## Features

- **Authentication**: Email/password auth via Supabase
- **Dashboard**: Protected dashboard with sidebar navigation
- **API**: FastAPI backend with health checks
- **Styling**: Tailwind CSS responsive design
- **Deployment**: Railway + Netlify ready

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm
- Supabase account

### Setup

1. **Clone and install dependencies**

```bash
pnpm install
cd apps/api && pip install -r requirements.txt
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Run database migrations**

Apply the SQL in `infra/supabase/migrations/` to your Supabase project.

4. **Start development servers**

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8000

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/       # Utilities
│   │   └── package.json
│   └── api/          # FastAPI backend
│       ├── app/
│       │   ├── routers/   # API endpoints
│       │   └── services/  # Business logic
│       └── requirements.txt
├── infra/
│   └── supabase/
│       └── migrations/    # Database schema
└── package.json
```

## Deployment

### Railway (API)

1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy

### Netlify (Frontend)

1. Connect your GitHub repo to Netlify
2. Set build command: `pnpm build`
3. Set environment variables
4. Deploy

## Adding Modules

Enhance your app with HiveForge modules:

- **Billing**: `hiveforge add billing`
- **Multi-tenancy**: `hiveforge add multi-tenant`
- **AI**: `hiveforge add ai`
- **Analytics**: `hiveforge add analytics`

## License

MIT
