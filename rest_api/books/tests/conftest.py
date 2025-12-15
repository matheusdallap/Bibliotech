import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from books.models import Book, Author, Publisher
import uuid # <--- Importante para gerar nomes únicos

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def make_user(**kwargs):
        unique_suffix = str(uuid.uuid4())[:8]
        
        if 'password' not in kwargs:
            kwargs['password'] = 'password123'
        
        if 'username' not in kwargs:
            kwargs['username'] = f'user_{unique_suffix}'
        if 'email' not in kwargs:
            kwargs['email'] = f'user_{unique_suffix}@teste.com'
            
        return User.objects.create_user(**kwargs)
    return make_user

@pytest.fixture
def create_admin(db):
    def make_admin(**kwargs):
        unique_suffix = str(uuid.uuid4())[:8]

        if 'password' not in kwargs:
            kwargs['password'] = 'password123'
        if 'username' not in kwargs:
            kwargs['username'] = f'admin_{unique_suffix}'
        if 'email' not in kwargs:
            kwargs['email'] = f'admin_{unique_suffix}@example.com'
        
        return User.objects.create_superuser(**kwargs)
    return make_admin

@pytest.fixture
def create_author(db):
    def make_author(name="Autor Teste"):
        return Author.objects.create(name=name)
    return make_author

@pytest.fixture
def create_publisher(db):
    def make_publisher(name="Editora Teste"):
        return Publisher.objects.create(name=name)
    return make_publisher

@pytest.fixture
def create_book(db, create_author, create_publisher):
    def make_book(title="Livro Teste", quantity=1, **kwargs):
        author = kwargs.pop('author', create_author())
        publisher = kwargs.pop('publisher', create_publisher())
        
        return Book.objects.create(
            title=title, 
            author=author, 
            publisher=publisher, 
            quantity=quantity, 
            **kwargs
        )
    return make_book