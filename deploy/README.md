# Deploy Life OS on OVH Ubuntu

---

## Docker (easiest – one command)

If you have Docker and Docker Compose on the server, you can run the whole stack without installing Python, Node, or Nginx by hand:

```bash
# On your OVH Ubuntu server
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
# Log out and back in (or newgrp docker)

git clone https://github.com/yassineZerdani/life-os.git
cd life-os

# Set env (optional: override defaults)
export JWT_SECRET="your-strong-secret-at-least-32-chars"
export ALLOWED_ORIGINS="http://YOUR_SERVER_IP"   # or https://yourdomain.com

docker compose -f docker-compose.prod.yml up -d --build
```

Then open **http://YOUR_SERVER_IP** (port 80). The frontend container builds the app, serves it with Nginx, and proxies `/api` to the backend. Postgres and backend run in containers; no venv or systemd needed.

To stop: `docker compose -f docker-compose.prod.yml down`

---

## Manual deploy (Nginx + systemd)

The rest of this guide gets the Life OS app running with Nginx, a systemd backend service, and optional PostgreSQL (local or managed).

## 1. Server prerequisites

- Ubuntu 22.04 or 24.04
- SSH access
- Domain or public IP pointing to the server (for HTTPS later)

---

## 2. Install system packages

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib python3.11-venv python3-pip nodejs npm git
```

(Use `python3.12-venv` if available: `apt search python3.*-venv`.)

---

## 3. PostgreSQL

### Option A: Local PostgreSQL on the server

```bash
sudo -u postgres createuser -s lifeos || true
sudo -u postgres psql -c "ALTER USER lifeos WITH PASSWORD 'YOUR_SECURE_PASSWORD';"
sudo -u postgres createdb -O lifeos gemini || true
```

Your `DATABASE_URL` will be:

`postgresql://lifeos:YOUR_SECURE_PASSWORD@localhost:5432/gemini`

### Option B: OVH Web Cloud Databases (PostgreSQL)

Create a PostgreSQL instance in the OVH control panel, then use the connection string they give you (with host, port, user, password, database) as `DATABASE_URL`.

---

## 4. Deploy the application

### 4.1 Create app directory and clone (or upload) the project

```bash
sudo mkdir -p /var/www/lifeos
sudo chown "$USER:$USER" /var/www/lifeos
cd /var/www/lifeos
git clone YOUR_REPO_URL .   # or upload via rsync/scp
```

### 4.2 Backend

```bash
cd /var/www/lifeos/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://lifeos:YOUR_PASSWORD@localhost:5432/gemini
JWT_SECRET=your-very-long-random-secret-at-least-32-characters
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

For a first test with IP only you can use:

```env
ALLOWED_ORIGINS=http://YOUR_SERVER_IP,http://localhost
```

Run migrations and seed:

```bash
source venv/bin/activate
alembic upgrade head
python seed_data.py
```

Test the backend:

```bash
./run-production.sh
# In another terminal: curl http://127.0.0.1:8000/health
```

Stop with Ctrl+C, then install the systemd service:

```bash
sudo cp /var/www/lifeos/deploy/lifeos-backend.service /etc/systemd/system/
# Edit if your path is not /var/www/lifeos/backend:
# sudo nano /etc/systemd/system/lifeos-backend.service
sudo systemctl daemon-reload
sudo systemctl enable lifeos-backend
sudo systemctl start lifeos-backend
sudo systemctl status lifeos-backend
```

### 4.3 Frontend (build and static files)

Build the frontend with the API URL set to the same origin (Nginx will proxy `/api` to the backend):

```bash
cd /var/www/lifeos/frontend
npm ci
# Use /api so the same domain serves frontend and API
export VITE_API_URL=/api
npm run build
```

The build output is in `frontend/dist/`. Serve it with Nginx:

```bash
sudo mkdir -p /var/www/lifeos/frontend-dist
sudo cp -r /var/www/lifeos/frontend/dist/* /var/www/lifeos/frontend-dist/
# Or symlink:
# sudo ln -sfn /var/www/lifeos/frontend/dist /var/www/lifeos/frontend
```

For Nginx we'll use `root /var/www/lifeos/frontend-dist` (or the path where `index.html` lives). See step 5.

---

## 5. Nginx

```bash
sudo cp /var/www/lifeos/deploy/nginx.conf /etc/nginx/sites-available/lifeos
sudo sed -i 's/YOUR_DOMAIN_OR_IP/yourdomain.com/g' /etc/nginx/sites-available/lifeos
# If using IP only: replace with your server's public IP
```

Edit the config so `root` points to your frontend build:

```bash
sudo nano /etc/nginx/sites-available/lifeos
# Set: root /var/www/lifeos/frontend-dist;   (or /var/www/lifeos/frontend/dist)
```

Enable the site and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/lifeos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Open `http://yourdomain.com` (or `http://YOUR_IP`) in a browser. You should see the Life OS auth page and be able to sign in (API is proxied at `/api`).

---

## 6. HTTPS (recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts. Certbot will adjust your Nginx config for HTTPS. Set `ALLOWED_ORIGINS` in backend `.env` to use `https://yourdomain.com` (and `https://www.yourdomain.com` if you use www).

---

## 7. Useful commands

| Task | Command |
|------|--------|
| Backend logs | `sudo journalctl -u lifeos-backend -f` |
| Restart backend | `sudo systemctl restart lifeos-backend` |
| Nginx reload | `sudo systemctl reload nginx` |
| Rebuild frontend | `cd frontend && VITE_API_URL=/api npm run build && sudo cp -r dist/* /var/www/lifeos/frontend-dist/` |

---

## 8. Environment summary

**Backend (`.env` in backend folder)**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Strong random secret (min 32 chars) |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins (e.g. `https://yourdomain.com`) |

**Frontend (build time)**

- `VITE_API_URL=/api` when building for production behind Nginx (same origin).

---

## 9. Optional: run with Docker on the same server

If you prefer Docker on Ubuntu:

```bash
cd /var/www/lifeos
# Build and run (postgres + backend; frontend built and served by Nginx as above)
docker compose up -d postgres backend
# Set DATABASE_URL in backend container to postgres:5432 or use .env for backend
```

Then build the frontend on the host with `VITE_API_URL=/api` and point Nginx at the built static files as in step 5.
