#!/bin/sh
set -e

echo "Aguardando o Postgres..."

until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  echo "Ainda não está pronto..."
  sleep 1
done

echo "Postgres está pronto!"

echo "Gerando migrations..."
python manage.py makemigrations --noinput

echo "Aplicando migrate..."
python manage.py migrate --noinput

exec "$@"