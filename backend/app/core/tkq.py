import os
import taskiq_redis
from taskiq import TaskiqScheduler
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import RedisScheduleSource, ListQueueBroker
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

broker = ListQueueBroker(redis_url)

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[
        RedisScheduleSource(redis_url),
        LabelScheduleSource(broker),
    ],
)

import app.tasks.reminders
