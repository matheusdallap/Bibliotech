import pytest
from django.urls import reverse
from rest_framework import status
from books.models import Book, Rating, Favorite, Comment

@pytest.mark.django_db
class TestPublicBooks:
    """Testes de acesso público (Leitura)"""

    def test_list_books_public(self, api_client, create_book):
        create_book(title="Livro A")
        create_book(title="Livro B")
        
        url = reverse('book-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert len(response.data['data']) == 2

    def test_retrieve_book_public(self, api_client, create_book):
        book = create_book(title="O Hobbit")
        
        url = reverse('book-detail-public', kwargs={'pk': book.pk})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['title'] == "O Hobbit"

@pytest.mark.django_db
class TestAdminBooks:
    """Testes de Admin (CRUD + Lógica de Estoque)"""

    def test_admin_create_book_success(self, api_client, create_admin):
        admin = create_admin()
        api_client.force_authenticate(user=admin)
        
        url = reverse('admin-book-list-create')
        payload = {
            "title": "Novo Livro",
            "author_name": "J.K. Rowling",
            "publisher_name": "Rocco",
            "page_count": 300,
            "quantity": 5
        }
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Book.objects.count() == 1
        assert Book.objects.get().author.name == "J.K. Rowling"

    def test_create_duplicate_book_increments_stock(self, api_client, create_admin, create_book):
        """Teste CRUCIAL: Se criar livro com título existente, soma estoque"""
        create_book(title="Dom Casmurro", quantity=2)
        
        admin = create_admin()
        api_client.force_authenticate(user=admin)
        
        url = reverse('admin-book-list-create')
        payload = {
            "title": "Dom Casmurro",
            "quantity": 3,
            "author_name": "Machado de Assis"
        }
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert "Livro já existia" in response.data['message']
        
        book = Book.objects.get(title="Dom Casmurro")
        assert book.quantity == 5

    def test_admin_update_book(self, api_client, create_admin, create_book):
        book = create_book(title="Livro Velho")
        admin = create_admin()
        api_client.force_authenticate(user=admin)
        
        url = reverse('admin-book-detail', kwargs={'pk': book.pk})
        
        # Testamos apenas a mudança de título, que é padrão do DRF e funciona
        payload = {"title": "Livro Novo"}
        
        response = api_client.patch(url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        book.refresh_from_db()
        assert book.title == "Livro Novo"

    def test_admin_delete_book(self, api_client, create_admin, create_book):
        book = create_book()
        admin = create_admin()
        api_client.force_authenticate(user=admin)
        
        url = reverse('admin-book-detail', kwargs={'pk': book.pk})
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert Book.objects.count() == 0

    def test_regular_user_cannot_manage_books(self, api_client, create_user):
        user = create_user()
        api_client.force_authenticate(user=user)
        
        url = reverse('admin-book-list-create')
        response = api_client.post(url, {"title": "Hacker Book"})
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestBookInteractions:
    """Comentários, Notas e Favoritos"""

    def test_user_can_comment(self, api_client, create_user, create_book):
        user = create_user()
        book = create_book()
        api_client.force_authenticate(user=user)
        
        url = reverse('book-comments', kwargs={'book_id': book.pk})
        payload = {"text": "Livro excelente!"}
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Comment.objects.count() == 1
        assert Comment.objects.get().text == "Livro excelente!"

    def test_user_can_rate_book(self, api_client, create_user, create_book):
        user = create_user()
        book = create_book()
        api_client.force_authenticate(user=user)
        
        url = reverse('book-rate', kwargs={'pk': book.pk})
        payload = {"stars": 5}
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Rating.objects.get(user=user, book=book).stars == 5

    def test_user_update_rating(self, api_client, create_user, create_book):
        user = create_user()
        book = create_book()
        api_client.force_authenticate(user=user)
        
        url = reverse('book-rate', kwargs={'pk': book.pk})
        
        api_client.post(url, {"stars": 3})
        
        response = api_client.post(url, {"stars": 5})
        
        assert response.status_code == status.HTTP_200_OK
        rating = Rating.objects.get(user=user, book=book)
        assert rating.stars == 5
        
        assert book.ratings.count() == 1
        
@pytest.mark.django_db
class TestFavorites:
    
    def test_add_remove_favorite(self, api_client, create_user, create_book):
        user = create_user()
        book = create_book()
        api_client.force_authenticate(user=user)
        
        url_toggle = reverse('favorite-toggle', kwargs={'pk': book.pk})
        
        resp_add = api_client.post(url_toggle)
        assert resp_add.status_code == status.HTTP_201_CREATED
        assert Favorite.objects.filter(user=user, book=book).exists()
        
        resp_add_again = api_client.post(url_toggle)
        assert resp_add_again.status_code == status.HTTP_200_OK
        assert "já está na sua lista" in resp_add_again.data['message']
        
        resp_del = api_client.delete(url_toggle)
        assert resp_del.status_code == status.HTTP_200_OK
        assert Favorite.objects.filter(user=user, book=book).exists() is False

    def test_list_favorites(self, api_client, create_user, create_book):
        user = create_user()
        book1 = create_book(title="Fav 1")
        book2 = create_book(title="Fav 2")
        
        Favorite.objects.create(user=user, book=book1)
        Favorite.objects.create(user=user, book=book2)
        
        api_client.force_authenticate(user=user)
        url = reverse('favorite-list')
        
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 2