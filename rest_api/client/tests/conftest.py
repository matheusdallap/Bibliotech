import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

Customer = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    """Fixture para criar um usuário comum dinamicamente"""
    def make_user(**kwargs):
        kwargs['email'] = kwargs.get('email', 'teste@example.com')
        kwargs['password'] = kwargs.get('password', 'senha123')
        kwargs['username'] = kwargs.get('username', 'usuario_teste')
        kwargs['first_name'] = kwargs.get('first_name', 'João')
        kwargs['last_name'] = kwargs.get('last_name', 'Silva')
        return Customer.objects.create_user(**kwargs)
    return make_user

@pytest.fixture
def create_admin(db):
    """Fixture para criar um usuário admin"""
    def make_admin(**kwargs):
        kwargs['email'] = kwargs.get('email', 'admin@example.com')
        kwargs['password'] = kwargs.get('password', 'admin123')
        kwargs['username'] = kwargs.get('username', 'admin_user')
        kwargs['is_staff'] = True
        kwargs['is_superuser'] = True
        return Customer.objects.create_user(**kwargs)
    return make_admin