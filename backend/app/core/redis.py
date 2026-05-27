import logging
from redis.asyncio import Redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis = None

    async def init_redis(self):
        try:
            self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
            await self.redis.ping()
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}")
            self.redis = None

    async def close(self):
        if self.redis:
            await self.redis.aclose()

redis_client = RedisClient()
