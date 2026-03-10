FROM python:3.12-slim

WORKDIR /app

# psycopg2-binary is a wheel; no gcc/libpq-dev needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000
RUN chmod +x run.sh run-production.sh run-docker-prod.sh
CMD ["./run.sh"]
