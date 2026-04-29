import httpx
import os
from dotenv import load_dotenv

load_dotenv()

class TelegramService:
    TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

    @staticmethod
    async def send_message(message: str):
        if not TelegramService.TOKEN or not TelegramService.CHAT_ID:
            print("Telegram credentials not configured in .env file")
            return

        url = f"https://api.telegram.org/bot{TelegramService.TOKEN}/sendMessage"
        payload = {"chat_id": TelegramService.CHAT_ID, "text": message}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            return response.json()
