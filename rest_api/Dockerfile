FROM python:3.11-slim

WORKDIR /rest_api

RUN apt-get update && apt-get install -y postgresql-client && apt-get clean

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENTRYPOINT ["/rest_api/postgres_start.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", ]
