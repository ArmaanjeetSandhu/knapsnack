# Use node image to build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Ensure public directory is copied
COPY client/public/ ./public/
RUN npm run build

# Use python image for the backend
FROM python:3.12-slim
WORKDIR /app

# Copy frontend build including video
COPY --from=frontend-builder /app/client/dist /app/client/dist
COPY --from=frontend-builder /app/client/public /app/client/dist

# Copy backend files
COPY server/ /app/server/
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy nutrient database files
COPY server/nutrient-databases /app/server/nutrient-databases

# Set environment variables
ENV FLASK_APP=server/app.py
ENV FLASK_ENV=production

# Command to run the application
CMD gunicorn --bind 0.0.0.0:$PORT server.app:app