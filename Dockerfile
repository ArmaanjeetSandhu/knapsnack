FROM node:20 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
COPY client/public/ ./public/
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/client/dist /app/client/dist
COPY --from=frontend-builder /app/client/public /app/client/dist

# Copy backend files
COPY server/ /app/server/
COPY requirements.txt .

# Install Python dependencies with pip upgrade to suppress warnings
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy nutrient databases
COPY server/nutrient-databases /app/server/nutrient-databases

# Environment variables
ENV FLASK_APP=server/app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run the application
CMD gunicorn --bind 0.0.0.0:$PORT server.app:app