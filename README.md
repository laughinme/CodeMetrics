# CodeMetrics

## Описание проекта
CodeMetrics — внутренняя платформа аналитики для команд разработки. В проекте есть фронтенд на React/Vite и backend на FastAPI, который агрегирует данные из внешнего API, хранит их в PostgreSQL и кеширует в Redis. Репозиторий содержит как локальные скрипты, так и Docker-окружение для быстрой проверки.

## Структура репозитория
- frontend/ — SPA на React 19 + Vite 7, Tailwind и shadcn/ui-компоненты.
- backend/ — FastAPI-приложение c планировщиком задач APScheduler, Alembic миграциями и Redis для rate-limit/кеша.
- nginx/ — конфиг для реверс-прокси, собирается вместе с фронтом при docker compose.
- docker-compose.yml — полный стенд (backend + PostgreSQL + Redis + nginx).

## Требования
- Node.js 20+ и npm 10+ (для фронтенда).
- Python 3.11+, pip и виртуальные окружения (для backend).
- PostgreSQL 16 и Redis 7, если запускаете сервисы вручную.
- Docker Engine 24+ и Docker Compose v2, если хотите поднять всё одной командой.
- OpenSSL (для генерации RSA-ключей JWT).

## Подготовка окружения

### Backend (`backend/.env`)
1. Скопируйте пример: cp backend/.env.example backend/.env.
2. Заполните значения. Ключевые переменные:

| Переменная       | Пример                                       | Назначение |
|------------------|-----------------------------------------------|------------|
| API_URL        | https://localhost:8080                     | Базовый URL, который backend использует для внешних запросов/вебхуков. |
| API_USERNAME   | service-account                            | Логин для внешнего API (если авторизация не нужна, оставьте пустым). |
| API_PASSWORD   | secret_pass                                | Пароль для внешнего API. |
| DATABASE_URL   | postgresql+asyncpg://postgres:secret@localhost:5432/hackathon | Подключение к БД. |
| REDIS_URL      | redis://localhost:6379/0                   | Redis для лимитеров, очередей и кеша. |
| CSRF_HMAC_KEY  | base64:...                                 | 32 байта для подписи CSRF‑токенов. Сгенерируйте python - <<'PY'\nimport secrets\nprint(secrets.token_urlsafe(32))\nPY. |
| JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY | RSA 2048 в PEM             | Используются для подписи/проверки токенов. Получите openssl genrsa -out private.pem 2048 и openssl rsa -in private.pem -pubout -out public.pem. |
| API_HOST, API_PORT, SITE_URL, STAGE | (опционально)    | Переопределяют сетевые настройки FastAPI. |

Backend ищет .env в backend/.env; при запуске через Docker переменные также подхватываются, плюс часть значений можно переопределить в docker-compose.yml.

### Frontend (`frontend/.env.local`)
1. Создайте файл frontend/.env.local.
2. Минимальный набор:
   ```env
   VITE_API_BASE_URL=https://localhost:8080

Локальный запуск **без Docker**
Backend
cd backend
python3.11 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export PYTHONPATH=src            # Windows PowerShell: $env:PYTHONPATH="src"
alembic -c src/alembic.ini upgrade head
uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
По умолчанию API отвечает на http://localhost:8080, health-check доступен по GET /ping, Swagger — http://localhost:8080/docs.

Frontend
cd frontend
npm install
npm run dev
Vite стартует dev-сервер с самоподписанным сертификатом (https://localhost:5173). Первый раз браузер попросит подтвердить, что вы доверяете сертификату.

Чтобы собрать production-версию:
npm run build
npm run preview
Проверка связки
Убедитесь, что backend отвечает: curl http://localhost:8080/ping.
Перейдите в браузере на https://localhost:5173. Фронтенд проксирует запросы /api/v1 в адрес, указанный в VITE_API_BASE_URL или vite.config.ts.

Запуск через **Docker Compose**
Подготовьте backend/.env (как указано выше). Для примера в docker-compose.yml уже есть значения DATABASE_URL и REDIS_URL, но секреты всё равно подтягиваются из .env.
Соберите и запустите всё одной командой:
docker compose up --build

backend поднимет FastAPI на http://backend:8080.

db — PostgreSQL 16 с данными в volume postgres_data.
redis — Redis 7.
nginx раздаёт статический build фронтенда и проксирует API.

После старта зайдите на https://localhost (или http://localhost). Сертификат самоподписанный — подтвердите исключение.
Остановить и очистить тома: docker compose down -v.

## Полезные ссылки и команды
UI dev-режим: https://localhost:5173
UI через nginx (Docker): https://localhost
API ping: http://localhost:8080/ping
Swagger UI: http://localhost:8080/docs
Обновить миграции: alembic -c src/alembic.ini revision --autogenerate -m "msg"
Линтер фронтенда: cd frontend && npm run lint