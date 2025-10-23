from contextlib import asynccontextmanager

from apscheduler.schedulers.base import STATE_RUNNING
from fastapi import FastAPI
from fastapi_limiter import FastAPILimiter
from starlette.middleware.cors import CORSMiddleware

from api import get_api_routers
from webhooks import get_webhooks
from core.config import Settings, configure_logging
from database.redis import get_redis
from database.relational_db import wait_for_db
from scheduler import init_scheduler


config = Settings() # pyright: ignore[reportCallIssue]
configure_logging()
scheduler = init_scheduler(config.API_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = get_redis()
    try:
        await wait_for_db()
        
        if scheduler.state != STATE_RUNNING:
            scheduler.start()
            
        await FastAPILimiter.init(redis)
        yield
    finally:
        await redis.aclose()
        if scheduler.state == STATE_RUNNING:
            scheduler.shutdown()


app = FastAPI(
    lifespan=lifespan,
    title='Hackathon',
    debug=True
)

# Mount static
# from fastapi.staticfiles import StaticFiles
# app.mount('/media', StaticFiles(directory=config.MEDIA_DIR, check_dir=False), 'media')

# Including routers
app.include_router(get_api_routers())
app.include_router(get_webhooks())

@app.get('/')
@app.get('/ping')
async def ping():
    return {'status': 'operating'}


# Adding middlewares
allowed_origins = [
    "http://localhost:5173",
    "https://localhost:5173",
]

if config.SITE_URL:
    allowed_origins.append(config.SITE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allow_headers=['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization', 'X-Client'],
    allow_credentials=True,
)
