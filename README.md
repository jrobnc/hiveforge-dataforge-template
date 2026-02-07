# DataForge 🔥

Multi-database orchestration platform built with **Next.js + FastAPI + Supabase**.
Execute SQL across **BigQuery, Snowflake, Databricks** with AI-powered query generation.

## 🔑 Features

- **Multi-Database Support**: BigQuery, Snowflake, Databricks, Redshift
- **Visual Query Builder**: Monaco SQL editor with syntax highlighting
- **AI-Powered Queries**: Semantic query generation with OpenAI
- **Real-time Execution**: Job monitoring and state management
- **Template System**: Reusable query templates with dependencies
- **Multi-tenant Architecture**: Organization-based data isolation
- **Cost Tracking**: Monitor query costs across cloud providers
- **Enterprise Ready**: RBAC, audit logs, custom deployments

---

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR-ORG/hiveforge
cd hiveforge

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Configure your .env file with real values

# Start Supabase locally
supabase start

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development servers
pnpm dev
```

Visit:
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost:8000
- 🗄️ Supabase Studio: http://localhost:54323

---

## 🌍 Environment Variables

See [`.env.example`](.env.example) for all required keys.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Base application URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ |
| `RESEND_API_KEY` | Resend email API key | ✅ |
| `OPENAI_API_KEY` | OpenAI/LLM key | ❌ |
| `HARD_ISOLATION_ENABLED` | Enable per-tenant isolation | ✅ |
| `PLATFORM_ADMIN_EMAILS` | Comma-separated admin emails | ✅ |

---

## 🏗 Deployment

### Frontend (Next.js) → Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR-ORG/hiveforge)

### Backend (FastAPI) → Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hiveforge)

Each app gets its own Netlify/Railway project, even when using shared Supabase.

---

## 🧭 Tenancy Models

### Multi-Tenant (Default)
- Single Supabase database
- Row-Level Security (RLS) per organization
- Most cost-effective solution
- Perfect for standard SaaS applications

### Hard Isolation (Optional)
- Dedicated Supabase instance per tenant
- Complete data isolation
- Higher operational overhead
- Required for compliance/regulatory needs

Configure in Platform Admin or via `HARD_ISOLATION_ENABLED` environment variable.

---

## 🔒 Platform Admin

Platform administrators can:
- View and manage all organizations/tenants
- Switch between tenant modes (shared/isolated)
- Rotate secrets and API keys
- View system-wide audit logs
- Manage feature flags
- Monitor usage and billing

Access restricted to emails listed in `PLATFORM_ADMIN_EMAILS`.

---

## 📚 Documentation

### Local Documentation Site

```bash
# Start documentation site
pnpm docs:dev

# Build documentation
pnpm docs:build
```

Visit http://localhost:3001 for full documentation.

### Documentation Topics

- [Choosing a Tenancy Model](docs/tenancy.md)
- [Setting Up Per-App Projects](docs/deployment.md)
- [RBAC & Permissions](docs/rbac.md)
- [Billing Integration](docs/billing.md)
- [Email Templates](docs/email.md)
- [AI Blueprint System](docs/ai.md)
- [Production Hardening](docs/production.md)

---

## 🛠 Development

### Available Scripts

```bash
pnpm dev          # Start all development servers
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm test:e2e     # Run end-to-end tests
pnpm lint         # Lint all packages
pnpm typecheck    # Type check TypeScript
pnpm format       # Format code with Prettier
pnpm clean        # Clean all build artifacts
```

### Database Management

```bash
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database with sample data
pnpm db:reset     # Reset database to clean state
```

### Project Structure

```
hiveforge/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # FastAPI backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configuration
│   ├── types/        # TypeScript types
│   └── pyshared/     # Python shared utilities
├── infra/            # Infrastructure configs
├── scripts/          # Development scripts
├── docs/             # Documentation site
└── PLAN.md          # Development plan
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
pnpm test

# Frontend tests
pnpm test:web

# Backend tests
pnpm test:api

# E2E tests
pnpm test:e2e
```

### Test Coverage

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Webhook tests for Stripe integration
- Email tests for Resend templates

---

## 🔐 Security

- JWT authentication with Supabase
- Row-Level Security (RLS) policies
- RBAC with granular permissions
- Audit logging for sensitive operations
- Secret rotation capabilities
- Rate limiting on API endpoints
- CORS configuration
- CSP headers

---

## 📈 Monitoring & Observability

- OpenTelemetry integration
- Sentry error tracking
- Custom metrics and traces
- Performance monitoring
- Usage analytics
- Health check endpoints

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [FastAPI](https://fastapi.tiangolo.com)
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [Resend](https://resend.com)
- [Turborepo](https://turbo.build)

---

## 📞 Support

- 📧 Email: support@hiveforge.dev
- 💬 Discord: [Join our community](https://discord.gg/hiveforge)
- 📖 Docs: [docs.hiveforge.dev](https://docs.hiveforge.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-ORG/hiveforge/issues)