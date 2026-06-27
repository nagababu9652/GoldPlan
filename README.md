# Financial Plan Project

## Overview

This repository contains a modern web application scaffold with:

- `frontend/` – Next.js 15 + React 19 + TypeScript + Tailwind CSS
- `backend/` – FastAPI + SQLAlchemy + Alembic + Pydantic + JWT auth support
- `docker-compose.yml` – optional local development container setup

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv ../.venv
source ../.venv/Scripts/activate # Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### API

- Health: `GET http://localhost:8000/health`
- Items: `GET http://localhost:8000/items/`

### Frontend sample route

- `http://localhost:3000`
