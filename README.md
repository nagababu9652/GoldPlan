# GoldPlan AI — Editorial Intelligence for Gold & Capital

India's most trusted financial planning platform. Goal-based planning for retirement, education, home, tax saving, and wealth creation.

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 | FastAPI + SQLAlchemy + JWT Auth

---

## Features

### 🎯 Goal-Based Planning
- Retirement, Education, Home, Wealth goals with step-by-step tracking
- Interactive calculators: SIP, Lumpsum, SWP, XIRR, EMI, Step-Up SIP, Inflation, Goal Planner, Retirement Corpus

### 📊 Financial Tools
- 10+ financial calculators with real-time results and charts
- Portfolio review and goal tracker dashboards
- Market data integration via FastAPI backend

### 🛡️ Protection & Investments
- Health, Term Life, Tax Saving guides
- Mutual Funds, Fixed Deposits, PPF/EPF/NPS investment hubs
- SEBI-registered advisor framework

### 📚 Resources & Company
- Blog, SIP Basics, Tax Guide sections
- Company story, Careers, Advisors directory
- Pricing plans and Contact page

### 🎨 Design
- **Editorial Finance** aesthetic — Swiss Brutalist meets luxury publishing
- Sharp 1px borders, off-white linen background (`#F8F6F0`), high-contrast black text (`#0C0B0A`)
- Cormorant Garamond (headings), Outfit (body), IBM Plex Mono (data/labels)
- Zero gradients, zero glassmorphism — grounded, authoritative, precision typography

---

## Architecture

```
finplan/
├── frontend/                # Next.js 15 application
│   ├── app/                 # App Router pages & layouts
│   │   ├── company/         # Advisors, Careers, Our Story
│   │   ├── contact/         # Contact page
│   │   ├── dashboard/       # User dashboard
│   │   ├── goals/           # Education, Home, Retirement, Wealth
│   │   ├── investments/     # Mutual Funds, FDs, PPF/EPF/NPS
│   │   ├── login/           # Authentication
│   │   ├── pricing/         # Pricing plans
│   │   ├── protection/      # Health, Term Life, Tax Saving
│   │   ├── resources/       # Blog, SIP Basics, Tax Guide
│   │   └── tools/           # 10+ financial calculators
│   ├── components/          # Shared & home page components
│   │   ├── home/            # Hero, Navigation, Features, etc.
│   │   └── PageTemplate.tsx
│   └── lib/                 # API client, tools data
│
├── backend/                 # FastAPI application
│   └── app/
│       ├── api/             # API layer
│       ├── auth/            # JWT authentication (python-jose)
│       ├── core/            # Settings & config
│       ├── database/        # SQLAlchemy engine & session
│       ├── middleware/      # CORS setup
│       ├── models/          # SQLAlchemy ORM models
│       ├── routers/         # authentication, advisor CRM, market endpoints
│       ├── schemas/         # Pydantic request/response schemas
│       ├── services/        # Business logic
│       └── tests/           # pytest test suite
│
├── docs/                    # Project documentation
├── docker-compose.yml       # Backend + Frontend containers
└── README.md
```

---

## Tech Stack

### Frontend

| Tool | Version |
|------|---------|
| Next.js | 15.5.19 |
| React | 19.2.7 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.3.1 |
| Framer Motion | ^11.0.0 |
| Lucide React | ^0.400.0 |

### Backend

| Tool | Version |
|------|---------|
| FastAPI | 0.138.1 |
| SQLAlchemy | 2.0.51 |
| Alembic | 1.18.5 |
| Pydantic | 2.13.4 |
| Pydantic Settings | 2.14.2 |
| python-jose | 3.5.0 |
| Uvicorn | 0.28.0 |
| pytest | 8.4.0 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- npm or yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:3000**.

### Backend

```bash
cd backend
python -m venv ../.venv
source ../.venv/Scripts/activate     # Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs at **http://localhost:8000/docs**.
Health check: `GET http://localhost:8000/health`

### Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## API Endpoints

| Method | Path         | Description          |
|--------|-------------|----------------------|
| GET    | `/health`   | Health check         |
| GET    | `/api/market/gold`    | Gold price data     |
| POST   | `/api/market/simulate`| Market simulation   |

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```
APP_NAME=FinPlan API
FRONTEND_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/finplan_db
SECRET_KEY=<your-secure-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_USER=<smtp-account>
SMTP_PASSWORD=<smtp-password>
REFRESH_COOKIE_SECURE=false
```

Set `REFRESH_COOKIE_SECURE=true` when serving the API over HTTPS. Registration
and password recovery require working SMTP credentials; refresh tokens are
delivered only through the HTTP-only cookie.

For create requests, send an `Idempotency-Key` UUID and reuse it when retrying
the same payload. The supported registration, login, client, group, employee,
organization-record, invitation, goal, account, holding, transaction, report,
task, meeting, message, and document endpoints retain keys for one day. Reusing
a key with changed data returns 409; login and invitation retries also return
409 rather than replaying one-time secrets.

---

## Testing

```bash
cd backend
pytest -v
```

---

## Design Guidelines

This project follows a **Hybrid Swiss Brutalist + Luxury (Editorial Finance)** aesthetic. See [`design_guidelines.json`](./design_guidelines.json) for the full design system including:

- Color palette (bone, obsidian, gold accent)
- Typography scale (Cormorant Garamond, Outfit, IBM Plex Mono)
- Component specs (nav, hero, cards, buttons)
- Layout rules (bento grids, 1px borders, sharp corners)
- Media assets (gold texture, office lifestyle, architecture accents)

---

## Documentation

Full details live in [`docs/`](./docs/README.md):

| Document | Contents |
|----------|----------|
| [Architecture](./docs/ARCHITECTURE.md) | System structure, domain schemas, implementation status |
| [Business Rules](./docs/BUSINESS_RULES.md) | Product rules that must not be broken |
| [Households](./docs/HOUSEHOLDS.md) | Household/Group model and lifecycle |
| [Roadmap](./docs/ROADMAP.md) | Recommended order of work |
| [Authentication](./docs/AUTHENTICATION.md) | Login/OTP flow, test user, troubleshooting |
| [Database](./docs/DATABASE.md) | PostgreSQL setup, migrations, useful commands |
| [Email](./docs/EMAIL.md) | SMTP/OTP setup and deliverability |
| [FinPlan Guide](./docs/FINPLAN_GUIDE.md) | In-app help chatbot (integration & maintenance) |
| [API Integration Audit](./docs/API_INTEGRATION_AUDIT.md) | Backend/frontend integration audit (2026-09-30) |
| [Performance](./docs/PERFORMANCE_OPTIMIZATION.md) | Optimization backlog and quick wins |

## License

Private project — all rights reserved.
