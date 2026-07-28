# Ubuntu Setup Guide for GoldPlan

This document captures the setup steps we completed to prepare this project on Ubuntu.

## 1. System prerequisites

Install the base tools needed for both frontend and backend:

```bash
sudo apt update
sudo apt install -y nodejs npm python3-pip python3.14-venv
```

Verify the versions:

```bash
node --version
npm --version
python3 --version
pip3 --version
```

## 2. Create a Python virtual environment

From the project root:

```bash
cd /home/naga/FinPlan/GoldPlan
python3 -m venv .venv
source .venv/bin/activate
```

## 3. Install backend dependencies

```bash
cd /home/naga/FinPlan/GoldPlan
pip install --upgrade pip
pip install -r backend/requirements.txt
```

## 4. Install frontend dependencies

```bash
cd /home/naga/FinPlan/GoldPlan/frontend
npm install --no-audit --no-fund
```

## 5. Run the project

### Backend

```bash
cd /home/naga/FinPlan/GoldPlan
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd /home/naga/FinPlan/GoldPlan/frontend
npm run dev
```

## 6. Access the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## 7. Optional: Docker

If you want to use Docker instead of local installs:

```bash
cd /home/naga/FinPlan/GoldPlan
docker compose up --build
```
