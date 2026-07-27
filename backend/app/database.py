import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")
IS_DEVELOPMENT = os.getenv("DEVELOPMENT", "False").lower() == "true"

if database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(database_url, echo=IS_DEVELOPMENT)

def get_session():
    with Session(engine) as session:
        yield session
