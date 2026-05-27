# DevTrack Deployment Guide

This guide covers deploying DevTrack in various production environments. The monorepo is fully containerized and configured for high-performance CI/CD.

## Option 1: Full-Stack Docker VPS (Recommended)
This approach deploys the entire DevTrack stack (Next.js, FastAPI, PostgreSQL, Redis, Celery, Nginx) onto a single Virtual Private Server (Ubuntu/Debian) using `docker-compose.prod.yml`.

### 1. Prerequisites
- A VPS (e.g., DigitalOcean Droplet, AWS EC2, Hetzner).
- Domain name pointing to your VPS IP.
- Docker and Docker Compose installed.

### 2. Setup
```bash
git clone https://github.com/yourusername/devtrack.git
cd devtrack
cp .env.example .env
```
Edit the `.env` file to include your secure `SECRET_KEY`, database passwords, and your `DOMAIN`.

### 3. Start the Stack
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Database Migrations
Run the Alembic migrations inside the running backend container:
```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 5. SSL Configuration (Let's Encrypt)
To enable HTTPS:
1. Install `certbot` on your host.
2. Run `certbot certonly --standalone -d yourdomain.com`.
3. Mount the generated certificates into the `nginx` service in `docker-compose.prod.yml`.
4. Uncomment the SSL block in `nginx/nginx.conf`.
5. Run `docker-compose -f docker-compose.prod.yml restart nginx`.

---

## Option 2: Split Deployment (Vercel + Railway/Render)
For serverless scaling, you can split the frontend and backend.

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Vercel will automatically detect Next.js.
4. Add the following Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL to your backend (e.g., `https://api.devtrack.com/api/v1`)
   - `NEXT_PUBLIC_WS_URL`: WebSocket URL (e.g., `wss://api.devtrack.com/api/v1/ws`)
5. Click **Deploy**.

### Backend (Railway / Render)
1. Create a new PostgreSQL database and Redis instance in your provider.
2. Deploy the `backend/` directory as a web service.
3. Add your Environment Variables (`DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, etc.).
4. Set the Start Command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Note: Ensure your provider supports WebSocket connections.

---

## CI/CD GitHub Actions
The repository includes `.github/workflows/` that automatically trigger on pushes to `main`.
- `ci.yml`: Lints Python code, validates Node.js builds.
- `docker.yml`: Automatically builds multi-stage Docker images and pushes them to the GitHub Container Registry (`ghcr.io`).

## Scalability Notes
- **WebSockets**: The WebSocket manager utilizes Redis Pub/Sub. This means if you horizontally scale the FastAPI backend across multiple containers/nodes, real-time events will still accurately broadcast across the entire cluster.
- **Caching**: Heavy analytical queries (e.g., Phase 7 dashboard stats) are aggressively cached in Redis for 30 minutes, protecting the PostgreSQL database from heavy load.
