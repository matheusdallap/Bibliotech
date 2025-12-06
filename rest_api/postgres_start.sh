#!/bin/sh

echo "Aguardando o Postgres..."

until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  echo "Ainda não está pronto..."
  sleep 1
done

echo "Postgres está pronto!"

python manage.py migrate

exec "$@"
