# Medicines Manager

A full-stack web application designed to help users manage their medications, schedules, and daily intake logs.

## ✨ Features
- **Medication Inventory:** Add, update, and remove medicines from your list.
- **Smart Scheduling:** Set medication schedules with daily/weekly/monthly frequency, custom intervals, and end dates.
- **Telegram Notifications:** Automated reminders and missed-dose alerts via Telegram.
- **Intake Tracking:** Log your daily intake to monitor adherence and history.
- **Timestamps:** Automatic tracking of when medicines and schedules are created or modified.

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, SQLModel, PostgreSQL, taskiq (background tasks).
- **Database Migrations:** Alembic.
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router.

---

## 🚀 Getting Started

### Quick start with Docker
```bash
docker compose up
```
Frontend: `http://localhost:8080` · Backend: `http://localhost:8000`

### Prerequisites
- Docker & Docker Compose

See [AGENTS.md](AGENTS.md) for development commands and testing.