# See the main site's backend Dockerfile: 3.12 is chosen for wheel availability.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
# Kept in the image so the one-off Supabase import can be run with
# `docker compose run --rm admin-api python migrate_sqlite_to_supabase.py`.
COPY migrate_sqlite_to_supabase.py ./

RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
