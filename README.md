# CodeMetrics

## Описание
Внутренняя платформа аналитики для команд разработки с React/Vite фронтендом и FastAPI бэкендом.

## Быстрый запуск

### Через Docker Compose (рекомендуется)
```bash
docker compose up --build
```

Отображение данных на сайте может занять некоторое время. Подождите пока backend парсит данные с API.

После запуска:
- Фронтенд: https://localhost
- API: http://localhost:8080
- Swagger: http://localhost:8080/docs

## Структура
```
frontend/    # React 19 + Vite 7 + Tailwind
backend/     # FastAPI + PostgreSQL + Redis
nginx/       # Конфиг реверс-прокси
```
