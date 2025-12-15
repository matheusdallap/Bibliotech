import pytest
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from loans.models import Loan
from datetime import timedelta

@pytest.mark.django_db
class TestLoanCreation:
    """Testes de CRIAÇÃO de empréstimos (POST)"""

    def test_create_loan_success(self, api_client, create_user, create_book):
        """Caminho feliz: Usuário pega livro disponível"""
        user = create_user()
        book = create_book(quantity=5) # Tem estoque
        api_client.force_authenticate(user=user)
        
        url = reverse('loans-list-create')
        response = api_client.post(url, {"book": book.id})
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        
        assert Loan.objects.count() == 1
        loan = Loan.objects.get()
        assert loan.user == user
        assert loan.book == book
        assert loan.due_date.date() == (timezone.now() + timedelta(days=14)).date()

    def test_cannot_borrow_unavailable_book(self, api_client, create_user, create_book):
        """Tenta pegar livro com estoque esgotado"""
        user = create_user()
        # Livro com 1 unidade
        book = create_book(quantity=1)
        
        other_user = create_user()
        Loan.objects.create(user=other_user, book=book)
        
        api_client.force_authenticate(user=user)
        url = reverse('loans-list-create')
        response = api_client.post(url, {"book": book.id})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "não está disponível" in response.data['message']

    def test_cannot_borrow_same_book_twice(self, api_client, create_user, create_book):
        """Usuário tenta pegar o mesmo livro duas vezes simultaneamente"""
        user = create_user()
        book = create_book(quantity=10)
        api_client.force_authenticate(user=user)
        
        url = reverse('loans-list-create')
        
        api_client.post(url, {"book": book.id})
        
        response = api_client.post(url, {"book": book.id})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "já possui um exemplar" in response.data['message']

    def test_limit_active_loans(self, api_client, create_user, create_book):
        """Usuário não pode ter mais que 5 empréstimos ativos"""
        user = create_user()
        api_client.force_authenticate(user=user)
        url = reverse('loans-list-create')
        
        for i in range(5):
            book = create_book(title=f"Livro {i}", quantity=5)
            api_client.post(url, {"book": book.id})
            
        assert Loan.objects.filter(user=user).count() == 5
        
        # Tenta o 6º empréstimo
        book_extra = create_book(title="Livro Extra", quantity=5)
        response = api_client.post(url, {"book": book_extra.id})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "limite máximo de 5" in response.data['message']

@pytest.mark.django_db
class TestLoanLifecycle:
    """Testes de DEVOLUÇÃO e DETALHES"""

    def test_return_book_success(self, api_client, create_user, create_book):
        """Testa devolução via PATCH"""
        user = create_user()
        book = create_book()
        loan = Loan.objects.create(user=user, book=book)
        
        api_client.force_authenticate(user=user)
        url = reverse('loan-detail', kwargs={'pk': loan.pk})
        
        response = api_client.patch(url, {})
        
        assert response.status_code == status.HTTP_200_OK
        assert "Livro devolvido" in response.data['message']
        
        assert response.data['data']['status'] == "Devolvido"
        
        loan.refresh_from_db()
        assert loan.returned_at is not None

    def test_cannot_return_already_returned(self, api_client, create_user, create_book):
        """Tenta devolver algo que já foi devolvido"""
        user = create_user()
        book = create_book()
        loan = Loan.objects.create(user=user, book=book, returned_at=timezone.now())
        
        api_client.force_authenticate(user=user)
        url = reverse('loan-detail', kwargs={'pk': loan.pk})
        
        response = api_client.patch(url, {})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "já foi devolvido" in response.data['message']

    def test_list_my_loans_only(self, api_client, create_user, create_book):
        """Garante que user só vê seus próprios empréstimos"""
        user1 = create_user()
        user2 = create_user()
        book = create_book()
        
        Loan.objects.create(user=user1, book=book) 
        Loan.objects.create(user=user2, book=book)
        
        api_client.force_authenticate(user=user1)
        url = reverse('loans-list-create')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 1
        assert response.data['data'][0]['user'] == user1.username

    def test_security_cannot_access_others_loan(self, api_client, create_user, create_book):
        """Usuário 1 tenta ver/devolver empréstimo do Usuário 2"""
        user1 = create_user()
        user2 = create_user()
        book = create_book()
        
        loan_of_user2 = Loan.objects.create(user=user2, book=book)
        
        api_client.force_authenticate(user=user1)
        url = reverse('loan-detail', kwargs={'pk': loan_of_user2.pk})
        
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        response = api_client.patch(url, {})
        assert response.status_code == status.HTTP_404_NOT_FOUND