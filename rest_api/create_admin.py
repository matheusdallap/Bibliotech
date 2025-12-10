import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from django.contrib.auth import get_user_model

def create_superuser():
    User = get_user_model()
    
    email = "admin@admin.com"
    username = "admin"
    password = "admin"

    if User.objects.filter(email=email).exists():
        print(f"O usuário {email} já existe. Nenhuma ação realizada.")
    else:
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"Superusuário criado com sucesso!")
        print(f"Email: {email}")
        print(f"Senha: {password}")

if __name__ == "__main__":
    create_superuser()