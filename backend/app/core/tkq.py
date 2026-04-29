import taskiq_redis
from taskiq import TaskiqScheduler
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import RedisScheduleSource, ListQueueBroker

broker = ListQueueBroker("redis://localhost:6379/0")

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[
        RedisScheduleSource("redis://localhost:6379/0"),
        LabelScheduleSource(broker),
    ],
)

import app.tasks.reminders
