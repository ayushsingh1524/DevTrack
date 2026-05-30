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

## CI/CD GitHub Actions
The repository includes `.github/workflows/` that automatically trigger on pushes to `main`.
- `ci.yml`: Lints Python code, validates Node.js builds.
- `docker.yml`: Automatically builds multi-stage Docker images and pushes them to the GitHub Container Registry (`ghcr.io`).

## Scalability Notes
- **WebSockets**: The WebSocket manager utilizes Redis Pub/Sub. This means if you horizontally scale the FastAPI backend across multiple containers/nodes, real-time events will still accurately broadcast across the entire cluster.
- **Caching**: Heavy analytical queries (e.g., Phase 7 dashboard stats) are aggressively cached in Redis for 30 minutes, protecting the PostgreSQL database from heavy load.
