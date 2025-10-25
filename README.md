# CodeMetrics

## Описание
Внутренняя платформа аналитики для команд разработки с React/Vite фронтендом и FastAPI бэкендом.

## Быстрый запуск

### Через Docker Compose (рекомендуется)
```bash
cp backend/.env.example backend/.env

docker compose up --build
```

После запуска:
- Фронтенд: https://localhost
- API: http://localhost:8080
- Swagger: http://localhost:8080/docs

### Локальный запуск

**Бэкенд:**
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic -c src/alembic.ini upgrade head
uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
```

**Фронтенд:**
```bash
cd frontend
npm install
npm run dev
```

## Структура
```
frontend/    # React 19 + Vite 7 + Tailwind
backend/     # FastAPI + PostgreSQL + Redis
nginx/       # Конфиг реверс-прокси
```

## Требования
- Docker Engine 24+ и Docker Compose v2
- Или: Node.js 20+, Python 3.11+, PostgreSQL 16, Redis 7