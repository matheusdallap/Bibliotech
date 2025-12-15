import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from books.models import Book, Author, Publisher
import uuid

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
def create_book(db):
    def make_book(title="Livro Teste", quantity=1):
        author, _ = Author.objects.get_or_create(name="Autor Genérico")
        publisher, _ = Publisher.objects.get_or_create(name="Editora Genérica")
        
        return Book.objects.create(
            title=title, 
            author=author, 
            publisher=publisher, 
            quantity=quantity
        )
    return make_book