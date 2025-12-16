import os
import subprocess
import sys

def run_command(command, show_log=True):
    """Roda um comando no terminal. Se show_log=False, não imprime o comando."""
    if show_log:
        print(f"Executando: {command}")
    
    try:
        subprocess.check_call(command, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar comando: {e}")
        sys.exit(1)

print("------------------------------------------------")
print("Iniciando Entrypoint Python do Bibliotech")
print("------------------------------------------------")

run_command("python manage.py migrate --noinput")

print("Verificando livros iniciais...")
run_command("python manage.py seed_books")

superuser_script = """
import os
import django
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    if not User.objects.filter(username=username).exists():
        print(f'Criando superusuário: {username}')
        User.objects.create_superuser(username=username, email=email, password=password)
    else:
        print(f'Superusuário {username} já existe.')
else:
    print('Variáveis de superusuário não definidas. Pulando.')
"""

print("Verificando Admin...")
run_command(f"python manage.py shell -c \"{superuser_script}\"", show_log=False)

print("Iniciando servidor na porta 8000...")
os.execvp("python", ["python", "manage.py", "runserver", "0.0.0.0:8000"])