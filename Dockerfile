FROM node:18 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
COPY client/public/ ./public/
RUN npm run build
FROM python:3.12-slim
WORKDIR /app
COPY --from=frontend-builder /app/client/dist /app/client/dist
COPY --from=frontend-builder /app/client/public /app/client/dist
COPY server/ /app/server/
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY server/nutrient-databases /app/server/nutrient-databases
ENV FLASK_APP=server/app.py
ENV FLASK_ENV=production
CMD gunicorn --bind 0.0.0.0:$PORT server.app:app