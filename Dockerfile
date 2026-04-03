# Stage 1: Build the Vite React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the FastAPI Backend
FROM python:3.12-slim
WORKDIR /app/backend

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy the built dist folder from Stage 1 into the root
COPY --from=frontend-builder /app/dist /app/dist

# Expose port (Render/Heroku override this via $PORT, so we use Uvicorn with $PORT)
EXPOSE 8000

# Command to run uvicorn server
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
