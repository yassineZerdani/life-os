#!/bin/sh
# Run on the server after pulling updates. Builds frontend and copies to Nginx root.
set -e
cd "$(dirname "$0")/.."
echo "Building frontend..."
cd frontend
export VITE_API_URL="${VITE_API_URL:-/api}"
npm ci
npm run build
echo "Installing to /var/www/lifeos/frontend-dist..."
sudo mkdir -p /var/www/lifeos/frontend-dist
sudo cp -r dist/* /var/www/lifeos/frontend-dist/
echo "Done. Reload Nginx if needed: sudo systemctl reload nginx"
