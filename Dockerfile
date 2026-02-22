FROM node:20 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./

RUN npm install -g npm@latest

RUN npm install
COPY client/ ./
COPY client/public/ ./public/
RUN npm run build

FROM python:3.12-slim

RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

COPY --from=frontend-builder /app/client/dist /app/client/dist
COPY --from=frontend-builder /app/client/public /app/client/dist

COPY server/ /app/server/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

COPY server/nutrient-databases /app/server/nutrient-databases

RUN chown -R appuser:appuser /app

USER appuser

ENV FLASK_APP=server/app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

CMD uv run --no-sync gunicorn --bind 0.0.0.0:$PORT server.app:app