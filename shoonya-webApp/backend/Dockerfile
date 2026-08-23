# Python 3.12 rather than the 3.14 used by the local venv: every pinned
# dependency here (pydantic-core, bcrypt, psycopg) publishes prebuilt wheels for
# 3.12, so the image builds without a Rust/C toolchain. The requirements comments
# about 3.14 wheel gaps are exactly the problem this avoids.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Run unprivileged: nothing here needs root at runtime.
RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
