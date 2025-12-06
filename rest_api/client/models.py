from django.contrib.auth.models import AbstractUser
from django.db import models


class Customer(AbstractUser):
    """
    Custom user model baseado em AbstractUser.
    Mantém todos os campos padrão (username, password, email,
    is_staff, is_superuser, groups, permissions etc).
    
    Campos extras podem ser adicionados futuramente aqui.
    """
    pass
