FROM node:22 AS frontend-builder
WORKDIR /app/client

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY client/package.json client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY client/ ./
COPY client/public/ ./public/
RUN pnpm run build

FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libbrotli-dev \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser \
    && mkdir -p /app \
    && chown -R appuser:appuser /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

COPY --from=frontend-builder /app/client/dist /app/client/dist
COPY --from=frontend-builder /app/client/public /app/client/dist

COPY server/ /app/server/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache --no-build

COPY server/nutrient-databases /app/server/nutrient-databases
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh \
    && chown -R appuser:appuser /app

USER appuser

ENV FLASK_APP=server/app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

CMD ["/app/run.sh"]