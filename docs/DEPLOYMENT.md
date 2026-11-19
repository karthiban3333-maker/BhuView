# Deployment

Build the frontend with `npm ci && npm run build` and publish `dist/` as static SPA output. Route `/api/*` to the FastAPI service. Build the API from `backend/Dockerfile`, expose port 8000, and provide `DATABASE_URL`, `JWT_SECRET`, `DATA_PROVIDER`, `CORS_ORIGINS` and provider-specific credentials through the host secret manager.

Provision PostgreSQL with PostGIS enabled and apply `database/schema.sql`. Run `python database/seed/seed.py` for synthetic fixture generation. Never commit real credentials or citizen data. Keep authenticated API responses private/no-store and versioned frontend assets immutable.
