import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.admin.models import LogEntry, CHANGE, DELETION

@pytest.fixture
def api_client():
    return APIClient()

REGISTER_URL = reverse('register') 
LOGIN_URL = reverse('login')

@pytest.mark.django_db
class TestRegisterView:
    def test_register_user_success(self, client):
        """Teste de registro com sucesso"""
        payload = {
            "username": "novousuario",
            "email": "novo@email.com",
            "password": "senhaforte123",
            "first_name": "Teste",
            "last_name": "User"
        }
        response = client.post(REGISTER_URL, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert response.data['message'] == "Conta criada com sucesso!"
        assert response.data['data']['email'] == payload['email']
        assert 'password' not in response.data['data']

    def test_register_user_duplicate_email_fails(self, client, create_user):
        """Não deve permitir registrar email duplicado"""
        # Cria um usuário primeiro
        create_user(email="duplicado@email.com")
        
        payload = {
            "username": "outro",
            "email": "duplicado@email.com",
            "password": "senha123",
            "first_name": "Teste",
            "last_name": "Dois"
        }
        response = client.post(REGISTER_URL, payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False

@pytest.mark.django_db
class TestLoginView:
    def test_login_success(self, client, create_user):
        """Login com credenciais corretas retorna tokens"""
        email = "login@teste.com"
        password = "senha123"
        create_user(email=email, password=password)

        payload = {
            "email": email,
            "password": password
        }
        response = client.post(LOGIN_URL, payload)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'access' in response.data['data']
        assert 'refresh' in response.data['data']

    def test_login_failure(self, client, create_user):
        """Login com senha errada deve falhar"""
        create_user(email="erro@teste.com", password="senhaCerta")
        
        payload = {
            "email": "erro@teste.com",
            "password": "senhaErrada"
        }
        response = client.post(LOGIN_URL, payload)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['success'] is False
        assert response.data['message'] == "Credenciais inválidas ou conta inativa."

@pytest.mark.django_db
class TestCustomerPermissions:
    def test_user_can_update_own_profile(self, api_client, create_user):
        """Teste se usuário consegue alterar o próprio nome (PATCH)"""
        user = create_user(first_name="Antigo")
        api_client.force_authenticate(user=user)
        
        payload = {"first_name": "Novo Nome"}
        url = reverse('user-detail', kwargs={'pk': user.pk})
        
        response = api_client.patch(url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        
        user.refresh_from_db()
        assert user.first_name == "Novo Nome"

    def test_register_missing_fields(self, client):
        """Deve falhar se faltar campo obrigatório (ex: senha)"""
        payload = {
            "username": "sem_senha",
            "email": "errado@teste.com"
        }
        response = client.post(REGISTER_URL, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False
    
    def test_admin_can_list_customers(self, api_client, create_admin):
        """Admin deve conseguir ver a lista de clientes"""
        admin = create_admin()
        api_client.force_authenticate(user=admin)
        url = reverse('users-list') 
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True

    def test_regular_user_cannot_list_customers(self, api_client, create_user):
        """Usuário comum NÃO pode ver a lista completa (Forbidden)"""
        user = create_user()
        api_client.force_authenticate(user=user)
        url = reverse('users-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_user_can_view_own_detail(self, api_client, create_user):
        """Usuário pode ver o próprio perfil"""
        user = create_user(email="eu@teste.com")
        api_client.force_authenticate(user=user)
        url = reverse('user-detail', kwargs={'pk': user.pk})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['email'] == "eu@teste.com"

    def test_user_cannot_view_other_detail(self, api_client, create_user):
        """Usuário NÃO pode ver perfil de outro"""
        user1 = create_user(username="user1", email="um@teste.com")
        user2 = create_user(username="user2", email="dois@teste.com")
        api_client.force_authenticate(user=user1)
        url = reverse('user-detail', kwargs={'pk': user2.pk})
        response = api_client.get(url)
        
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_log_entry_created_on_update(self, api_client, create_user):
        """Verifica se o Mixin realmente cria o LogEntry no banco ao editar"""
        user = create_user(first_name="Original")
        api_client.force_authenticate(user=user)
        
        initial_logs = LogEntry.objects.count()
        
        url = reverse('user-detail', kwargs={'pk': user.pk})
        api_client.patch(url, {"first_name": "Mudou"})
        
        assert LogEntry.objects.count() == initial_logs + 1
        latest_log = LogEntry.objects.latest('action_time')
        assert latest_log.change_message == "Editado via API"
        assert latest_log.action_flag == CHANGE
    
    def test_admin_can_delete_user_and_log_is_created(self, api_client, create_admin, create_user):
        """Admin deleta usuário e verifica se gerou log de DELETION manual"""
        admin = create_admin()
        user_to_delete = create_user(username="tchau")
        
        api_client.force_authenticate(user=admin)
        
        url = reverse('user-detail', kwargs={'pk': user_to_delete.pk})
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_200_OK 
        assert response.data['success'] is True

        from django.contrib.auth import get_user_model
        User = get_user_model()
        assert User.objects.filter(pk=user_to_delete.pk).exists() is False
        
        latest_log = LogEntry.objects.latest('action_time')
        assert latest_log.change_message == "Deletado via API"
        assert latest_log.action_flag == DELETION

@pytest.mark.django_db
class TestAuthFlow:
    """Testes para Logout e Refresh"""

    def test_token_refresh_success(self, api_client, create_user):
        """Testa se conseguimos renovar o token"""
        password = "password123"
        user = create_user(password=password)
        
        login_url = reverse('login')
        resp_login = api_client.post(login_url, {
            "email": user.email, 
            "password": password 
        })
        
        assert resp_login.status_code == status.HTTP_200_OK, f"Erro no login: {resp_login.data}"
        
        refresh_token = resp_login.data['data']['refresh']
        
        refresh_url = reverse('token_refresh')
        resp_refresh = api_client.post(refresh_url, {"refresh": refresh_token})
        
        assert resp_refresh.status_code == status.HTTP_200_OK
        assert "access" in resp_refresh.data

    def test_logout_blacklist(self, api_client, create_user):
        """Testa se o logout invalida o refresh token (Blacklist)"""
        password = "password123"
        user = create_user(password=password)
        
        login_resp = api_client.post(reverse('login'), {
            "email": user.email, "password": password
        })
        
        assert login_resp.status_code == status.HTTP_200_OK
        refresh_token = login_resp.data['data']['refresh']
        
        api_client.force_authenticate(user=user)
        
        logout_url = reverse('logout')
        resp_logout = api_client.post(logout_url, {"refresh": refresh_token})
        
        assert resp_logout.status_code in [status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT]
        
        resp_fail = api_client.post(reverse('token_refresh'), {"refresh": refresh_token})
        assert resp_fail.status_code == status.HTTP_401_UNAUTHORIZED