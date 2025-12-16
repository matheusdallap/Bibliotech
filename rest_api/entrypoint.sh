#!/bin/bash

set -e

echo "Iniciando configuração automática do Bibliotech..."

# 1. Aplicar Migrações
echo "Aplicando migrações do banco de dados..."
python manage.py migrate --noinput


# 3. Criar Superusuário Automaticamente
# Verifica se as variáveis de ambiente existem
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Verificando/Criando superusuário administrativo..."
    
    python manage.py shell <<EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if not User.objects.filter(username=username).exists():
    print(f"Criando superusuário: {username}")
    # Como seu create_superuser pode pedir campos extras no futuro,
    # aqui estamos passando o básico. Se seu model exigir mais, adicione aqui.
    User.objects.create_superuser(username=username, email=email, password=password)
else:
    print(f"Superusuário {username} já existe. Pulando criação.")
EOF
fi

echo "Verificando e criando livros iniciais (Seed)..."
python manage.py seed_books

echo "Ambiente pronto!"
echo "Iniciando servidor Django..."

# 4. Executa o comando final (o CMD do Dockerfile, geralmente runserver)
exec "$@"